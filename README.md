# 🏎️ APEX // F1 Strategy Simulator Engine

An AI-powered Formula 1 Race Strategy Simulator built using **React (TypeScript + Vite)**, **FastAPI**, **CrewAI**, **Groq LLMs**, **FastF1 Telemetry**, and **OpenWeatherMap API**.

Live Web Application: **[apex-f1.netlify.app](https://apex-f1.netlify.app/)**  
Live Strategy Backend: **[f1-strategy-backend.onrender.com](https://f1-strategy-backend.onrender.com)**

---

## 🌟 Key Features

* **🏎️ Official F1 Pit Wall Telemetry Aesthetic**:
  * Designed using official Formula 1 broadcast typography (**Titillium Web** & **Barlow Condensed**) and high-contrast telemetry indicators.
  * Custom F1 open-wheel race car vector iconography in header navigation.
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
* **💾 Hybrid Persistence Storage Manager**:
  * Out-of-the-box browser **LocalStorage** persistence guaranteeing instant saving and offline strategy archive retrieval.
  * Seamless cloud synchronization with **Supabase** database when API credentials are provided.
* **🌦️ Live & Simulated Weather Physics**:
  * Live weather fetching via OpenWeatherMap API with fallback to simulated microclimate data.
  * Explicitly distinguishes between **asphalt track surface temperature** (dictating surface grip) and **slick tire working operating windows** (90–130°C reached via friction).
* **⏱️ Historical FastF1 Telemetry Ingestion**:
  * Live telemetry loading via `fastf1` with robust engine supplier mapping (`Oracle Red Bull`, `Scuderia Ferrari`, `RB`, etc.).

---

## 🌐 Web Application Pages

| Page | Path | Description |
| :--- | :--- | :--- |
| **Strategy Console** | `/` | Configure race runs by selecting circuit & constructor, view weather telemetry, and generate driver stint plans. |
| **Circuit Atlas** | `/circuits` | Comprehensive track guide for all 24 calendar circuits with stress, abrasion, and downforce ratings. |
| **Constructor Hub** | `/teams` | Profile cards for all **11 Constructors**, aero efficiency metrics, downforce specs, and power unit stats. |
| **2026 Calendar** | `/calendar` | Official 24-round season schedule with round dates, locations, format, and lap counts. |
| **Pit Wall Archive** | `/history` | Stored strategy run manager to review full stint plans or delete old race logs. |

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
│       ├── teams.json              # All 11 F1 constructor team mappings
│       └── tire_compounds.json     # Grip & degradation specs for C1–C5, Inter, Wet
├── src/
│   ├── agents/
│   │   └── strategy_crew.py        # CrewAI agent definitions & pre-computation engine
│   ├── api/
│   │   ├── main.py                 # FastAPI application routes & CORS middleware
│   │   └── models.py               # Pydantic data schemas & response models
│   ├── components/                 # React UI components (Header, Hero, SimulatorForm, StrategyResult, Footer)
│   ├── data/
│   │   ├── fastf1_helper.py        # FastF1 telemetry fetcher & CrewAI tool wrapper
│   │   ├── reference.ts            # Frontend JSON references & color helpers
│   │   ├── telemetry_ingestor.py   # Team engine supplier alias matcher
│   │   └── weather_fetcher.py      # OpenWeatherMap API client & solar track temp calculator
│   ├── lib/
│   │   ├── simulationEngine.ts     # Client-side physics engine fallback
│   │   ├── storage.ts              # Hybrid LocalStorage + Supabase persistence manager
│   │   └── supabase.ts             # Supabase client initialization
│   ├── pages/                      # Application route pages (Simulator, Circuits, Teams, Calendar, History)
│   └── styles/                     # Global F1 telemetry CSS tokens & app stylesheets
├── netlify.toml                    # Netlify production build configuration
├── .env                            # API keys configuration (Groq & OpenWeatherMap)
├── package.json                    # Frontend Node.js dependencies
├── requirements.txt                # Python backend dependencies
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
| `GET` | `/api/teams` | Lists all 11 constructor teams and engine supplier associations. |

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/varmayuvrajwork/f1-strategy-simulator.git
cd f1-strategy-simulator
```

### 2. Set Up Python Backend Virtual Environment
```bash
# Windows PowerShell
py -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Backend Dependencies
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

### 6. Run the React + Vite Frontend
```bash
npm install
npm run dev
```
The frontend dev server will start at `http://localhost:5173`.

---

## 📖 Interactive API Documentation

Once the backend is running, open your browser:
* **OpenAPI Specs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Format**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

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
