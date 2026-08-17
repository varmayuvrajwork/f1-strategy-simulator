from fastapi import FastAPI, HTTPException, BackgroundTasks
import sys
import os
import json

# Modify path to allow relative imports logic to work dynamically
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from src.api.models import SimulationRequest, SimulationResponse, ErrorResponse
from src.agents.strategy_crew import run_strategy_simulation
from src.data.weather_fetcher import get_weather_for_location
from src.data.telemetry_ingestor import ingest_telemetry
from src.data.fastf1_helper import get_session_telemetry

from fastapi.middleware.cors import CORSMiddleware

app_title = os.getenv("APP_TITLE", "F1 Strategy Simulator Engine")
app_version = os.getenv("APP_VERSION", "2026.1")
app = FastAPI(title=f"{app_title} v{app_version}", version=app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_API_JSON_CACHE = {}

def get_json(filename):
    if filename in _API_JSON_CACHE:
        return _API_JSON_CACHE[filename]
    path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'json', filename)
    if os.path.exists(path):
        with open(path, 'r') as f:
            data = json.load(f)
            _API_JSON_CACHE[filename] = data
            return data
    return []

@app.get("/")
def read_root():
    return {"message": "F1 Strategy Simulator API Running. Check /docs for endpoints"}

@app.get("/api/circuits")
def get_circuits():
    return get_json('circuits.json')

@app.get("/api/teams")
def get_teams():
    return get_json('teams.json')
    
@app.get("/api/races")
def get_races():
    return get_json('races.json')

@app.post("/api/simulate", response_model=SimulationResponse)
def simulate_strategy(req: SimulationRequest):
    # Retrieve circuit info by circuit_id or by race round/name in races.json
    circuits = get_json('circuits.json')
    races = get_json('races.json')
    
    # Try direct circuit match first
    circuit = next((c for c in circuits if c['id'] == req.race_id), None)
    
    # Fall back to matching race_id against races.json (circuit_id, round, or name)
    if not circuit and races:
        matched_race = next(
            (r for r in races if str(r.get('round')) == str(req.race_id) or r.get('circuit_id') == req.race_id or r.get('name').lower() == req.race_id.lower()),
            None
        )
        if matched_race:
            circuit_id = matched_race['circuit_id']
            circuit = next((c for c in circuits if c['id'] == circuit_id), None)
            # Update req.race_id to standard circuit_id for agents context
            req.race_id = circuit_id
    
    if not circuit:
        raise HTTPException(status_code=404, detail=f"Circuit or race not found for '{req.race_id}'")
        
    location = circuit['city']
    weather_data = get_weather_for_location(location)
    
    if "error" in weather_data:
        raise HTTPException(status_code=500, detail=weather_data["error"])

    # Run Crew AI Agents with Groq
    try:
        result = run_strategy_simulation(req.race_id, req.team_id, weather_data)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

@app.post("/api/sync-telemetry")
def sync_telemetry_webhook(background_tasks: BackgroundTasks):
    """
    Triggers the telemetry ingestion pipeline to sweep all historical
    FastF1 data for 2026 dynamically inside a background task.
    """
    background_tasks.add_task(ingest_telemetry)
    return {"message": "Telemetry synchronization job has been queued and is pulling live FastF1 historical races."}

@app.get("/api/telemetry/{year}/{race_name}/{driver}")
def fetch_telemetry(year: int, race_name: str, driver: str):
    """
    Retrieve historical driver telemetry and lap stats from FastF1.
    """
    res = get_session_telemetry(year, race_name, driver)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res
