import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_weather_for_location(location_name: str, date: str = None):
    """
    Fetches the weather for a given race location. 
    If date is in the future and out of normal forecast bounds, 
    we could fall back to historical averages or provide a speculative forecast.
    """
    api_key = os.getenv("OPENWEATHERMAP_API_KEY", "placeholder")
    base_url = os.getenv("OPENWEATHER_BASE_URL", "http://api.openweathermap.org/data/2.5/weather")
    
    if not api_key or api_key in ("placeholder", "your_openweathermap_api_key_here"):
        # Return mock data if API key is not yet set
        return {
            "location": location_name,
            "status": "Simulated Weather (Key not found)",
            "temperature_celsius": 24,
            "track_temperature": 34,
            "humidity": 45,
            "rain_probability": 0.1,
            "condition": "Partly Cloudy"
        }
        
    url = f"{base_url}?q={location_name}&appid={api_key}&units=metric"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        rain_data = data.get("rain") or {}
        rainfall_mm = float(rain_data.get("1h", 0.0)) if isinstance(rain_data, dict) else 0.0
        
        # Estimate probability from rainfall volume or cloud coverage
        cloud_cover = data.get("clouds", {}).get("all", 0)
        if rainfall_mm > 0:
            rain_prob = min(1.0, 0.5 + (rainfall_mm / 10.0))
        else:
            rain_prob = round(cloud_cover / 200.0, 2)
            
        air_temp = data["main"]["temp"]
        # Rough solar radiation estimation for track temperature (+10°C to +15°C above air temp)
        track_temp = air_temp + 12.0
        
        return {
            "location": location_name,
            "status": "Real Weather",
            "air_temperature": air_temp,
            "temperature_celsius": air_temp,
            "track_temperature": track_temp,
            "humidity": data["main"]["humidity"],
            "rainfall_mm": rainfall_mm,
            "rain_probability": rain_prob,
            "condition": data["weather"][0]["main"] if data.get("weather") else "Clear"
        }
    except Exception as e:
        return {"error": f"Failed to fetch weather: {str(e)}"}
