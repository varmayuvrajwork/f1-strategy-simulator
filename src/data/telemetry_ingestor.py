import fastf1
import json
import os
import datetime
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
JSON_DIR = os.path.join(BASE_DIR, 'data', 'json')
CACHE_DIR = os.path.join(BASE_DIR, 'data', 'fastf1_cache')

os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

def load_json(name):
    with open(os.path.join(JSON_DIR, name), 'r') as f:
        return json.load(f)

def save_json(name, data):
    with open(os.path.join(JSON_DIR, name), 'w') as f:
        json.dump(data, f, indent=4)

def ingest_telemetry():
    print("Starting sweeping synchronization pipeline...")
    drivers_data = load_json('drivers.json')
    teams_data = load_json('teams.json')
    engine_data = load_json('engine_suppliers.json')
    
    season_year = int(os.getenv("F1_SEASON_YEAR", datetime.datetime.now().year))
    schedule = fastf1.get_event_schedule(season_year)
    
    lap_medians_global = {} # Map driver -> sum of medians
    lap_medians_count = {} 
    
    speed_traps_global = {} # Map team -> list of top speeds
    
    for index, event in schedule.iterrows():
        # Check if event is in the past
        event_date = event['EventDate']
        if not hasattr(event_date, 'timestamp'):
            continue # Skip non-date rows if any testing exists
            
        if event_date.timestamp() > datetime.datetime.now().timestamp():
            break # Reached future races
            
        # Only process actual race weekends, typically RoundNumber > 0
        if event['RoundNumber'] == 0:
            continue
            
        print(f"Processing Round {event['RoundNumber']} - {event['EventName']}...")
        try:
            session = fastf1.get_session(season_year, event['RoundNumber'], 'R')
            session.load(telemetry=True, laps=True, weather=False)
            
            # --- Drivers Pace Analysis ---
            for drv in session.results['Abbreviation']:
                drv_laps = session.laps.pick_driver(drv).pick_quicklaps()
                if not drv_laps.empty:
                    median_time = drv_laps['LapTime'].dt.total_seconds().median()
                    lap_medians_global[drv] = lap_medians_global.get(drv, 0) + median_time
                    lap_medians_count[drv] = lap_medians_count.get(drv, 0) + 1
                    
            # --- Engine Speed Analysis ---
            # Max speed from speed trap 'SpeedST'
            laps = session.laps
            # Find the max speed per driver, map to team
            for drv in session.results['Abbreviation']:
                drv_laps = laps.pick_driver(drv)
                max_speed = drv_laps['SpeedST'].max()
                if not np.isnan(max_speed):
                    team_str = session.results[session.results['Abbreviation'] == drv]['TeamName'].values[0]
                    if team_str not in speed_traps_global:
                        speed_traps_global[team_str] = []
                    speed_traps_global[team_str].append(max_speed)
                    
        except Exception as e:
            print(f"Failed to process Round {event['RoundNumber']}: {e}")
            continue

    # 1. Update Pace (Averaged Medians)
    print("Normalizing Seasonal Pace Averages...")
    averaged_medians = {}
    for drv, total in lap_medians_global.items():
        averaged_medians[drv] = total / lap_medians_count[drv]
        
    if averaged_medians:
        fastest_time = min(averaged_medians.values())
        for drv_item in drivers_data:
            fastf1_code = drv_item['id'].upper()
            if fastf1_code in averaged_medians:
                delta = averaged_medians[fastf1_code] - fastest_time
                pace_rating = max(50, 99 - int(delta * 5))
                drv_item['pace'] = pace_rating
                
        save_json('drivers.json', drivers_data)
        print("Updated drivers.json")

    # 2. Update Engine Power
    TEAM_ENGINE_ALIASES = {
        "red bull": "rbpt_ford",
        "oracle red bull": "rbpt_ford",
        "rb": "rbpt_ford",
        "racing bulls": "rbpt_ford",
        "vcarb": "rbpt_ford",
        "visa cash app": "rbpt_ford",
        "ferrari": "ferrari",
        "scuderia ferrari": "ferrari",
        "haas": "ferrari",
        "cadillac": "ferrari",
        "mercedes": "mercedes",
        "mclaren": "mercedes",
        "williams": "mercedes",
        "alpine": "mercedes",
        "aston martin": "honda",
        "audi": "audi",
        "sauber": "audi",
        "kick sauber": "audi"
    }
    
    engine_top_speeds = {}
    for f1_team_name, speeds in speed_traps_global.items():
        avg_speed = sum(speeds) / len(speeds)
        matched_engine = None
        
        # Check alias map
        for alias, eng_id in TEAM_ENGINE_ALIASES.items():
            if alias in f1_team_name.lower():
                matched_engine = eng_id
                break
                
        # Fallback to team JSON matching
        if not matched_engine:
            for t in teams_data:
                if t['id'] in f1_team_name.lower() or t['name'].lower() in f1_team_name.lower():
                    matched_engine = t['engine_id']
                    break
                    
        if matched_engine:
            if matched_engine not in engine_top_speeds:
                engine_top_speeds[matched_engine] = []
            engine_top_speeds[matched_engine].append(avg_speed)
        else:
            print(f"Warning: Could not match FastF1 team '{f1_team_name}' to an engine supplier.")

    if engine_top_speeds:
        final_engine_speeds = {}
        for eng, spds in engine_top_speeds.items():
            final_engine_speeds[eng] = sum(spds)/len(spds)
            
        max_seen_speed = max(final_engine_speeds.values())
        for eng_item in engine_data:
            eid = eng_item['id']
            if eid in final_engine_speeds:
                delta = max_seen_speed - final_engine_speeds[eid]
                pur_power = max(80, 98 - int(delta * 1.5))
                eng_item['power_rating'] = pur_power

        save_json('engine_suppliers.json', engine_data)
        print("Updated engine_suppliers.json")
        
    print("Synchronization Complete!")

if __name__ == "__main__":
    ingest_telemetry()
