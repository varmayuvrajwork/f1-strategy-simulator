import os
import sys
import json
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
try:
    from crewai import Agent, Task, Crew, Process, LLM
except ImportError:
    try:
        from crewai import Agent, Task, Crew, Process
        from crewai.llm import LLM
    except ImportError:
        from crewai import Agent, Task, Crew, Process
        LLM = None

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

load_dotenv()

# Circuit condition wear modifiers
STRESS_MODIFIER = {
    "Very Low": 0.80, "Low": 0.90, "Medium": 1.00, "High": 1.15, "Very High": 1.30
}
ABRASION_MODIFIER = {
    "Low": 0.90, "Medium": 1.00, "High": 1.15
}

def get_groq_llm():
    groq_api_key = os.getenv("GROQ_API_KEY")
    groq_model = os.getenv("GROQ_MODEL", "qwen/qwen3.6-27b")
    if groq_api_key:
        model_str = groq_model if groq_model.startswith("groq/") else f"groq/{groq_model}"
        if LLM is not None:
            return LLM(model=model_str, api_key=groq_api_key, max_tokens=2048)
        else:
            from langchain_groq import ChatGroq
            return ChatGroq(groq_api_key=groq_api_key, model_name=groq_model, max_tokens=2048)
    else:
        raise ValueError("GROQ_API_KEY is missing from environment variables.")

# In-memory JSON context cache
_JSON_CACHE = {}

def load_json_context(filename):
    if filename in _JSON_CACHE:
        return _JSON_CACHE[filename]
    filepath = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'json', filename)
    with open(filepath, 'r') as f:
        data = json.load(f)
        _JSON_CACHE[filename] = data
        return data

def run_strategy_simulation(race_id, team_id, weather_data):
    # Context Loading
    try:
        circuits = load_json_context('circuits.json')
        races = load_json_context('races.json')
        teams = load_json_context('teams.json')
        drivers = load_json_context('drivers.json')
        car_designs = load_json_context('car_designs.json')
        tire_compounds = load_json_context('tire_compounds.json')
    except Exception as e:
        return {"error": f"Failed to load JSON base: {str(e)}"}

    circuit = next((c for c in circuits if c['id'] == race_id), None)
    race = next((r for r in races if r.get('circuit_id') == race_id or str(r.get('round')) == str(race_id)), None)
    team = next((t for t in teams if t['id'] == team_id), None)
    team_drivers = [d for d in drivers if d['team_id'] == team_id]
    car_design = next((cd for cd in car_designs if cd['team_id'] == team_id), None)
    
    if not circuit or not team or not car_design:
        return {"error": f"Invalid race_id ('{race_id}') or team_id ('{team_id}')"}

    # Dynamic lap count from circuit metadata or race schedule
    laps_count = circuit.get('laps') or (race.get('laps') if race else 53)

    # Format Driver Ratings for Differentiated Driver Strategies
    driver_specs_str = "\n".join([
        f"- {d['name']} (Driver ID: {d['id'].upper()}): Pace Rating={d.get('pace', 85)}/100, Tire Management Rating={d.get('tire_management', 85)}/100"
        for d in team_drivers
    ])

    # Python Pre-Computation: Calculate Circuit & Car Tire Degradation Curves
    car_wear_mult = car_design.get('tire_wear_multiplier', 1.0)
    circuit_mod = round(
        STRESS_MODIFIER.get(circuit.get('tire_stress'), 1.0) *
        ABRASION_MODIFIER.get(circuit.get('asphalt_abrasion'), 1.0),
        4
    )
    
    compound_analytics = []
    for t in tire_compounds:
        base_deg = t.get('degradation_rate', 0.02)
        effective_deg = round(base_deg * car_wear_mult * circuit_mod, 4)
        max_stint = min(laps_count, int(0.35 / effective_deg)) if effective_deg > 0 else laps_count
        compound_analytics.append(
            f"- {t['compound']}: Initial Grip={t.get('grip_initial', 0.9)}, Effective Wear Rate={effective_deg}/lap, Max Recommended Stint={max_stint} laps, Target Operating Window={t.get('optimal_temp_window', [90, 110])}°C, Wet Compound={t.get('is_wet', False)}"
        )
    compound_specs_str = "\n".join(compound_analytics)

    # Weather Parameters
    air_temp = weather_data.get('air_temperature', weather_data.get('temperature_celsius', 25))
    track_temp = weather_data.get('track_temperature', air_temp + 12.0)
    
    rainfall_mm = weather_data.get('rainfall_mm')
    if rainfall_mm is None:
        rainfall_mm = weather_data.get('rain_1h_mm', 0.0)
        
    rain_prob = weather_data.get('rain_probability', 0.0)
    weather_condition = weather_data.get('condition', 'Clear')

    print(f"[strategy] race_id='{race_id}', team_id='{team_id}', laps={laps_count}, circuit_mod={circuit_mod:.2f}x, car_wear_mult={car_wear_mult}")

    llm = get_groq_llm()

    # --- AGENTS ---
    data_analyst = Agent(
        role="F1 Data Analyst",
        goal="Interpret pre-computed tire degradation curves, circuit wear modifiers, and car efficiency parameters to assess track degradation risks.",
        backstory="You are an elite F1 data analyst. You synthesize mathematical degradation models into clear tire wear insights.",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    weather_specialist = Agent(
        role="Track & Weather Specialist",
        goal="Evaluate track surface grip and rainfall volume to recommend slick vs wet compound categories.",
        backstory="A seasoned meteorologist and track engineer. You evaluate surface track temperature and rainfall volume.",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    race_strategist = Agent(
        role="Principal Race Strategist",
        goal="Synthesize analytics to produce concise, driver-differentiated stint and pitstop strategies.",
        backstory="The mastermind on the pit wall. You define exact stint lap ranges for each driver based on their unique pace and tire management stats.",
        verbose=True,
        allow_delegation=False,
        llm=llm
    )

    # --- TASKS ---
    analysis_task = Task(
        description=f"""
        Analyze tire degradation for the {circuit['name']} circuit ({circuit['layout_type']} circuit layout, {laps_count} laps). 
        Circuit Profile: Tire Stress={circuit['tire_stress']}, Asphalt Abrasion={circuit['asphalt_abrasion']}, Downforce Level={circuit.get('downforce_level', 'Medium')}, Circuit Wear Modifier={circuit_mod:.2f}x.
        Team Profile: {team['name']}, Aero Efficiency={car_design['aero_efficiency']}/100, Car Tire Wear Multiplier={car_design['tire_wear_multiplier']}.
        
        Pre-Computed Tire Compound Analytics (Effective Wear per Lap & Max Stints):
        {compound_specs_str}

        CRITICAL FORMATTING RULE: Output ONLY the final structured analysis report directly. Do NOT output internal scratchpad notes, bullet-point thought processes, or persona monologues (such as 'Synthesize the Analysis' or 'Drafting Content').
        """,
        agent=data_analyst,
        expected_output="A concise structured summary report of compound degradation rates, car efficiency impact, and primary stint risks. No scratchpad thoughts."
    )

    weather_task = Task(
        description=f"""
        Review the weather forecast for {circuit['name']}:
        - Condition: {weather_condition}
        - Air Temperature: {air_temp}°C
        - Surface Track Temperature: {track_temp}°C
        - Rainfall Volume: {rainfall_mm} mm/hr (Rain Probability: {rain_prob * 100:.1f}%)

        Physics Note: Track surface temperature ({track_temp}°C) dictates asphalt grip. Slick tires reach their target carcass operating window (90-130°C) through driving friction under dry conditions.

        CRITICAL FORMATTING RULE: Determine if rainfall ({rainfall_mm} mm/hr) requires Wets/Intermediates or if standard slicks fit dry track conditions. Output ONLY the final assessment directly — do NOT output step-by-step reasoning or internal scratchpad notes.
        """,
        agent=weather_specialist,
        expected_output="A concise summary of surface track grip, rainfall impact, and recommended tire compound category. No internal scratchpad notes."
    )

    strategy_task = Task(
        description=f"""
        Based on the data analyst and weather reports, construct the master race strategy report for {team['name']} at {circuit['name']} ({laps_count} laps).

        Team Drivers Specs:
        {driver_specs_str}

        Pre-Computed Compound Wear Limits:
        {compound_specs_str}

        Task Requirements:
        1. Produce distinct stint plans for EACH driver with dedicated headers for each driver (e.g. ### Charles Leclerc Strategy and ### Lewis Hamilton Strategy).
        2. Reflect their individual Pace and Tire Management ratings in their stint lengths and compound choices.
        3. Provide explicit lap ranges for each stint (e.g. Stint 1: Laps 1-18 C3 Medium, Stint 2: Laps 19-{laps_count} C2 Hard).
        4. Specify the exact number of pitstops and clear tactical rationale.
        5. CRITICAL FORMATTING RULE: Output ONLY the final structured strategy report directly — do NOT include internal derivation steps, scratchpad thoughts, or persona monologues (such as 'Drafting Content' or 'Refining Output').
        """,
        agent=race_strategist,
        expected_output="A clean, complete markdown strategy report featuring dedicated per-driver sections (Charles Leclerc & Lewis Hamilton), stint lap ranges, and pitstop counts. No internal scratchpad notes."
    )

    # --- EXECUTION WITH RATE LIMIT RETRY ---
    strategy_crew = Crew(
        agents=[data_analyst, weather_specialist, race_strategist],
        tasks=[analysis_task, weather_task, strategy_task],
        process=Process.sequential,
        max_rpm=2,
        verbose=True
    )

    import time
    max_retries = 3
    result = None
    for attempt in range(max_retries):
        try:
            result = strategy_crew.kickoff()
            break
        except Exception as e:
            err_str = str(e)
            if ("429" in err_str or "RateLimitError" in err_str or "rate_limit_exceeded" in err_str) and attempt < max_retries - 1:
                print(f"Groq API rate limit reached (Attempt {attempt+1}/{max_retries}). Pausing 30s for full TPM window reset...")
                time.sleep(30)
                continue
            raise e

    return {
        "strategy_output": str(result),
        "circuit": circuit['name'],
        "team": team['name'],
        "weather": weather_data if isinstance(weather_data, dict) else {"condition": str(weather_data)}
    }
