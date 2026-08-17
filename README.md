# 🏎️ F1 Strategy Simulator Engine

An AI-powered Formula 1 Race Strategy Simulator built using **FastAPI**, **CrewAI**, **Groq LLMs**, **FastF1 Telemetry**, and **OpenWeatherMap API**. 

The simulator employs a multi-agent crew to model tire degradation, evaluate track weather physics, and generate driver-differentiated stint and pitstop strategies for all 24 Formula 1 calendar circuits.

---

## 🌟 Key Features

* **🤖 Multi-Agent AI Crew Architecture (CrewAI)**:
  * **F1 Data Analyst**: Evaluates circuit profiles (stress, asphalt abrasion) and car tire wear multipliers.
  * **Track & Weather Specialist**: Assesses track surface temperature (+12°C solar radiation offset) and precipitation volume to determine slick vs. wet compound selection.
  * **Principal Race Strategist**: Generates customized lap-by-lap stint plans and pitstop counts tailored to individual driver pace and tire management ratings.
* **🧮 Pre-Computed Tire Wear Physics**:
  * Calculates effective compound wear rates per lap mathematically before LLM prompting:
    $$\text{Effective Wear Rate} = \text{base\_degradation} \times \text{car\_wear\_multiplier} \times \text{circuit\_modifier}$$
  * Automatically models tire stint caps before performance drop-off across all compounds (C1–C5, Intermediate, Wet).
* **🏎️ Driver-Differentiated Stint Planning**:
  * Integrates driver ratings (e.g. Charles Leclerc 99/92 vs. Lewis Hamilton 98/96) to produce distinct stint ranges, compound choices, and tactical rationales per driver.
* **🌦️ Live & Simulated Weather Physics**:
  * Live weather fetching via OpenWeatherMap API with fallback to simulated microclimate data.
  * Explicitly distinguishes between **asphalt track surface temperature** (dictating surface grip) and **slick tire working operating windows** (90–130°C reached via friction).
* **⏱️ Historical FastF1 Telemetry Ingestion**:
  * Live telemetry loading via `fastf1` with robust engine supplier mapping (`Oracle Red Bull`, `Scuderia Ferrari`, `RB`, etc.).
* **⚡ FastAPI REST Backend & In-Memory Caching**:
  * High-performance JSON caching (`_JSON_CACHE`) eliminating repetitive disk reads.
  * Built-in rate-limit pacing (`max_rpm=2`) for API key quotas.

---

## 📁 Repository Structure

```text
F1-strategy-simulator/
├── data/
│   └── json/
│       ├── car_designs.json        # Aero efficiency & tire wear multipliers per team
│       ├── circuits.json           # All 24 F1 circuits with official lap counts & stress ratings
│       ├── drivers.json            # Driver pace & tire management ratings
│       ├── engine_suppliers.json   # Engine supplier specs & reliability parameters
│       ├── races.json              # 2026 F1 race calendar schedule
│       ├── teams.json              # F1 constructor team mappings
│       └── tire_compounds.json     # Grip & degradation specs for C1–C5, Inter, Wet
├── src/
│   ├── agents/
│   │   └── strategy_crew.py        # CrewAI agent definitions & pre-computation engine
│   ├── api/
│   │   ├── main.py                 # FastAPI application routes & endpoints
│   │   └── models.py               # Pydantic data schemas & response models
│   └── data/
│       ├── fastf1_helper.py        # FastF1 telemetry fetcher & CrewAI tool wrapper
│       ├── telemetry_ingestor.py   # Team engine supplier alias matcher
│       └── weather_fetcher.py      # OpenWeatherMap API client & solar track temp calculator
├── .env                            # API keys configuration (Groq & OpenWeatherMap)
├── .gitignore                      # Git ignore rules
├── requirements.txt                # Python project dependencies
└── README.md                       # Project documentation
```

---

## ⚙️ API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/simulate` | Runs the multi-agent race strategy simulation for a circuit, team, and weather state. |
| `GET` | `/api/weather/{location}` | Returns live or simulated weather data (air temp, track temp, rainfall volume mm/hr). |
| `GET` | `/api/telemetry/{year}/{race_name}/{driver}` | Fetches historical lap & telemetry data via FastF1. |
| `GET` | `/api/circuits` | Lists all 24 circuits with official lap counts, stress ratings, and downforce levels. |
| `GET` | `/api/teams` | Lists all constructor teams and engine supplier associations. |

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/varmayuvrajwork/f1-strategy-simulator.git
cd f1-strategy-simulator
```

### 2. Set Up Virtual Environment
```bash
# Windows PowerShell
py -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables (`.env`)
Create a `.env` file in the root directory:
```env
OPENWEATHERMAP_API_KEY="your_openweathermap_api_key"
GROQ_API_KEY="your_groq_api_key"
GROQ_MODEL="qwen/qwen3.6-27b"
```

### 5. Run the FastAPI Development Server
```bash
py -m uvicorn src.api.main:app --reload
```

The API server will start at `http://127.0.0.1:8000`.

---

## 📖 Swagger Interactive Documentation

Once the server is running, open your browser and navigate to:
* **Interactive OpenAPI Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🧪 Sample API Payload (`POST /api/simulate`)

```json
{
  "race_id": "monaco",
  "team_id": "ferrari",
  "weather_condition": "Clear",
  "temperature_celsius": 25.0,
  "track_temperature": 37.0,
  "rainfall_mm": 0.0,
  "rain_probability": 0.05
}
```

---

## 📝 License
Distributed under the MIT License. See `LICENSE` for details.
