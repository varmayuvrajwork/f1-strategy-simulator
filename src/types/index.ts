export type Compound = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'Intermediate' | 'Wet'

export interface Circuit {
  id: string
  name: string
  city: string
  country: string
  layout_type: string
  tire_stress: string
  asphalt_abrasion: string
  downforce_level: string
  laps: number
}

export interface Team {
  id: string
  name: string
  engine_id: string
  base: string
}

export interface EngineSupplier {
  id: string
  name: string
  power_rating: number
  reliability_rating: number
  efficiency_rating: number
}

export interface Driver {
  id: string
  team_id: string
  name: string
  tire_management: number
  pace: number
}

export interface CarDesign {
  team_id: string
  aero_efficiency: number
  downforce: number
  tire_wear_multiplier: number
}

export interface Race {
  round: number
  name: string
  circuit_id: string
  date: string
  format: string
  laps: number
}

export interface TireCompound {
  compound: Compound
  grip_initial: number
  degradation_rate: number
  optimal_temp_window: [number, number]
  is_wet: boolean
}

export interface WeatherData {
  location?: string
  status?: string
  air_temperature?: number
  temperature_celsius?: number
  track_temperature?: number
  humidity?: number
  rainfall_mm?: number
  rain_probability?: number
  condition?: string
  error?: string
}

export interface SimulationRequest {
  race_id: string
  team_id: string
}

export interface SimulationResult {
  strategy_output: string
  circuit: string
  team: string
  weather: WeatherData
}

export interface SavedSimulation {
  id: string
  race_id: string
  team_id: string
  circuit_name: string
  team_name: string
  weather_condition: string
  air_temperature: number
  track_temperature: number
  rainfall_mm: number
  strategy_output: string
  created_at: string
}
