import fastf1
import datetime
import json
import os

# Create a local cache folder for FastF1
CACHE_DIR = os.getenv("FASTF1_CACHE_DIR", os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'fastf1_cache'))
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

def get_current_season_schedule(year=None):
    if year is None:
        year = int(os.getenv("F1_SEASON_YEAR", datetime.datetime.now().year))
    try:
        schedule = fastf1.get_event_schedule(year)
        # Convert to a list of dicts for agents to read
        events = []
        for index, row in schedule.iterrows():
            events.append({
                "round": row['RoundNumber'],
                "country": row['Country'],
                "location": row['Location'],
                "name": row['EventName'],
                "date": str(row['EventDate'].date()) if hasattr(row['EventDate'], 'date') else str(row['EventDate'])
            })
        return events
    except Exception as e:
        return {"error": f"Failed to fetch schedule: {str(e)}"}

def get_session_telemetry(year, session_name, driver, session_type='R'):
    """
    Example function for retrieving telemetry. FastF1 focuses heavily on past sessions.
    This tool allows agents to pull historical telemetry to evaluate tire degradation.
    """
    try:
        session = fastf1.get_session(year, session_name, session_type)
        session.load(telemetry=True, laps=True, weather=False)
        laps = session.laps.pick_driver(driver)
        
        avg_lap_time = laps['LapTime'].mean()
        tire_compounds = laps['Compound'].unique().tolist()
        
        avg_seconds = avg_lap_time.total_seconds() if hasattr(avg_lap_time, 'total_seconds') and not str(avg_lap_time) == 'NaT' else None
        
        return {
            "driver": driver,
            "average_lap_time_seconds": avg_seconds,
            "compounds_used": tire_compounds,
            "total_laps": len(laps)
        }
    except Exception as e:
        return {"error": f"Failed to load telemetry or session not run yet: {str(e)}"}

try:
    from crewai.tools import tool
    @tool("Historical Telemetry Loader")
    def fetch_historical_telemetry_tool(driver: str, session_name: str = "Australian Grand Prix", year: int = 2024) -> str:
        """Pulls historical lap times, average pace, and compound telemetry for an F1 driver."""
        res = get_session_telemetry(year, session_name, driver)
        return json.dumps(res)
except Exception:
    fetch_historical_telemetry_tool = None
