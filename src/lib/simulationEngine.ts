import {
  circuitById,
  teamById,
  driversByTeam,
  carByTeam,
  engineById,
  tireCompounds,
} from '../data/reference'
import type { WeatherData } from '../types'

const STRESS_MODIFIER: Record<string, number> = {
  'Very Low': 0.8, Low: 0.9, Medium: 1.0, High: 1.15, 'Very High': 1.3,
}
const ABRASION_MODIFIER: Record<string, number> = {
  Low: 0.9, Medium: 1.0, High: 1.15,
}

interface CompoundPlan {
  compound: string
  grip_initial: number
  effective_deg: number
  max_stint: number
  optimal_temp_window: [number, number]
  is_wet: boolean
}

export interface StintPlan {
  stint_number: number
  lap_start: number
  lap_end: number
  compound: string
  laps: number
}

export interface DriverStrategy {
  driver_name: string
  driver_id: string
  pace: number
  tire_management: number
  stints: StintPlan[]
  pitstops: number
  rationale: string
}

export interface SimulationEngineResult {
  circuit_name: string
  team_name: string
  laps: number
  circuit_modifier: number
  car_wear_multiplier: number
  weather: WeatherData
  compound_plans: CompoundPlan[]
  drivers: DriverStrategy[]
  strategy_output: string
}

function pickSlickCompounds(
  plans: CompoundPlan[],
  laps: number,
  tireManagement: number,
): { primary: CompoundPlan; secondary: CompoundPlan } {
  const slick = plans.filter((p) => !p.is_wet)
  // Better tire managers can stretch softer compounds longer.
  const tmBonus = (tireManagement - 85) / 15 // ~0..1
  // Sort by degradation ascending (hard -> soft): C1 ... C5
  const byHard = [...slick].sort((a, b) => a.effective_deg - b.effective_deg)
  // Pick a medium/hard primary and a slightly softer secondary.
  const primaryIdx = tmBonus > 0.5 ? 1 : 2 // softer for high TM
  const secondaryIdx = tmBonus > 0.5 ? 2 : 3
  const primary = byHard[Math.min(primaryIdx, byHard.length - 1)]
  const secondary = byHard[Math.min(secondaryIdx, byHard.length - 1)]
  return { primary, secondary }
}

function planStints(
  primary: CompoundPlan,
  secondary: CompoundPlan,
  laps: number,
  tireManagement: number,
): StintPlan[] {
  const tmFactor = 0.85 + (tireManagement - 80) / 40 // ~0.8..1.1
  const stint1Len = Math.min(
    laps,
    Math.max(8, Math.round(primary.max_stint * tmFactor)),
  )
  const remaining = Math.max(0, laps - stint1Len)
  const stints: StintPlan[] = [
    {
      stint_number: 1,
      lap_start: 1,
      lap_end: stint1Len,
      compound: primary.compound,
      laps: stint1Len,
    },
  ]
  if (remaining > 0) {
    const stint2Len = Math.min(remaining, Math.max(8, Math.round(secondary.max_stint * tmFactor)))
    stints.push({
      stint_number: 2,
      lap_start: stint1Len + 1,
      lap_end: stint1Len + stint2Len,
      compound: secondary.compound,
      laps: stint2Len,
    })
    const finalRemaining = laps - (stint1Len + stint2Len)
    if (finalRemaining > 0) {
      stints.push({
        stint_number: 3,
        lap_start: stint1Len + stint2Len + 1,
        lap_end: laps,
        compound: primary.compound,
        laps: finalRemaining,
      })
    }
  }
  return stints
}

function buildWetStrategy(
  plans: CompoundPlan[],
  laps: number,
  rainfallMm: number,
  tireManagement: number,
): StintPlan[] {
  const inter = plans.find((p) => p.compound === 'Intermediate')!
  const wet = plans.find((p) => p.compound === 'Wet')!
  const useWet = rainfallMm >= 4
  const primary = useWet ? wet : inter
  const tmFactor = 0.85 + (tireManagement - 80) / 40
  const stintLen = Math.min(laps, Math.max(8, Math.round(primary.max_stint * tmFactor)))
  const stints: StintPlan[] = [
    { stint_number: 1, lap_start: 1, lap_end: stintLen, compound: primary.compound, laps: stintLen },
  ]
  let lapCursor = stintLen
  let n = 2
  while (lapCursor < laps) {
    const len = Math.min(laps - lapCursor, Math.max(8, Math.round(primary.max_stint * tmFactor)))
    stints.push({
      stint_number: n,
      lap_start: lapCursor + 1,
      lap_end: lapCursor + len,
      compound: primary.compound,
      laps: len,
    })
    lapCursor += len
    n++
  }
  return stints
}

export function runSimulationEngine(
  raceId: string,
  teamId: string,
  weather: WeatherData,
): SimulationEngineResult | { error: string } {
  const circuit = circuitById(raceId)
  const team = teamById(teamId)
  const car = carByTeam(teamId)
  if (!circuit || !team || !car) {
    return { error: `Invalid race_id ('${raceId}') or team_id ('${teamId}')` }
  }
  const laps = circuit.laps
  const carWearMult = car.tire_wear_multiplier
  const circuitMod = Math.round(
    (STRESS_MODIFIER[circuit.tire_stress] ?? 1.0) *
      (ABRASION_MODIFIER[circuit.asphalt_abrasion] ?? 1.0) *
      10000,
  ) / 10000

  const compoundPlans: CompoundPlan[] = tireCompounds.map((t) => {
    const baseDeg = t.degradation_rate
    const effectiveDeg = Math.round(baseDeg * carWearMult * circuitMod * 10000) / 10000
    const maxStint =
      effectiveDeg > 0 ? Math.min(laps, Math.floor(0.35 / effectiveDeg)) : laps
    return {
      compound: t.compound,
      grip_initial: t.grip_initial,
      effective_deg: effectiveDeg,
      max_stint: maxStint,
      optimal_temp_window: t.optimal_temp_window,
      is_wet: t.is_wet,
    }
  })

  const airTemp = weather.air_temperature ?? weather.temperature_celsius ?? 25
  const trackTemp = weather.track_temperature ?? airTemp + 12
  const rainfallMm = weather.rainfall_mm ?? 0
  const isWet = (weather.condition ?? '').toLowerCase().includes('rain') || rainfallMm > 0.5

  const teamDrivers = driversByTeam(teamId)

  const driverStrategies: DriverStrategy[] = teamDrivers.map((d) => {
    let stints: StintPlan[]
    let rationale: string
    if (isWet) {
      stints = buildWetStrategy(compoundPlans, laps, rainfallMm, d.tire_management)
      rationale =
        rainfallMm >= 4
          ? `Heavy rainfall (${rainfallMm.toFixed(1)} mm/hr) mandates full Wet compound. ${d.name}'s tire management rating (${d.tire_management}) informs stint longevity.`
          : `Light precipitation (${rainfallMm.toFixed(1)} mm/hr) calls for Intermediates. Pace rating ${d.pace}/100 keeps ${d.name} competitive in low-grip conditions.`
    } else {
      const { primary, secondary } = pickSlickCompounds(compoundPlans, laps, d.tire_management)
      stints = planStints(primary, secondary, laps, d.tire_management)
      const tmNote =
        d.tire_management >= 93
          ? 'elite tire preservation'
          : d.tire_management >= 88
            ? 'strong tire management'
            : 'measured tire management'
      rationale = `Dry slick strategy at ${circuit.name}. ${d.name}'s ${tmNote} (${d.tire_management}/100) and pace ${d.pace}/100 produce a ${stints.length}-stop plan favoring ${primary.compound}/${secondary.compound} for the ${circuit.downforce_level} downforce, ${circuit.tire_stress.toLowerCase()} tire-stress profile.`
    }
    return {
      driver_name: d.name,
      driver_id: d.id.toUpperCase(),
      pace: d.pace,
      tire_management: d.tire_management,
      stints,
      pitstops: Math.max(0, stints.length - 1),
      rationale,
    }
  })

  const engine = engineById(team.engine_id) ?? null
  const strategyOutput = buildMarkdownReport({
    circuit, team, engine, car, laps, circuitMod, carWearMult,
    compoundPlans, drivers: driverStrategies, weather, isWet, trackTemp, airTemp, rainfallMm,
  })

  return {
    circuit_name: circuit.name,
    team_name: team.name,
    laps,
    circuit_modifier: circuitMod,
    car_wear_multiplier: carWearMult,
    weather,
    compound_plans: compoundPlans,
    drivers: driverStrategies,
    strategy_output: strategyOutput,
  }
}

function buildMarkdownReport(ctx: {
  circuit: ReturnType<typeof circuitById> extends infer T ? NonNullable<T> : never
  team: ReturnType<typeof teamById> extends infer T ? NonNullable<T> : never
  engine: ReturnType<typeof engineById> | null
  car: NonNullable<ReturnType<typeof carByTeam>>
  laps: number
  circuitMod: number
  carWearMult: number
  compoundPlans: CompoundPlan[]
  drivers: DriverStrategy[]
  weather: WeatherData
  isWet: boolean
  trackTemp: number
  airTemp: number
  rainfallMm: number
}): string {
  const { circuit, team, engine, car, laps, circuitMod, carWearMult, compoundPlans, drivers, weather, isWet, trackTemp, airTemp, rainfallMm } = ctx
  const compoundLines = compoundPlans
    .map(
      (p) =>
        `- **${p.compound}**: Initial Grip=${p.grip_initial}, Effective Wear=${p.effective_deg}/lap, Max Stint=${p.max_stint} laps, Window=${p.optimal_temp_window[0]}–${p.optimal_temp_window[1]}°C`,
    )
    .join('\n')

  const driverSections = drivers
    .map((d) => {
      const stintLines = d.stints
        .map(
          (s) =>
            `  - Stint ${s.stint_number}: Laps ${s.lap_start}–${s.lap_end} (${s.laps} laps) — **${s.compound}**`,
        )
        .join('\n')
      return `### ${d.driver_name} Strategy\n- **Pace**: ${d.pace}/100 | **Tire Management**: ${d.tire_management}/100\n- **Pitstops**: ${d.pitstops}\n- **Rationale**: ${d.rationale}\n- **Stint Plan**:\n${stintLines}`
    })
    .join('\n\n')

  return `# Race Strategy Report — ${team.name}\n## ${circuit.name} · ${laps} Laps\n\n### Circuit & Car Profile\n- **Layout**: ${circuit.layout_type} · **Tire Stress**: ${circuit.tire_stress} · **Abrasion**: ${circuit.asphalt_abrasion} · **Downforce**: ${circuit.downforce_level}\n- **Circuit Wear Modifier**: ${circuitMod.toFixed(2)}x · **Car Wear Multiplier**: ${carWearMult}\n- **Aero Efficiency**: ${car.aero_efficiency}/100 · **Downforce**: ${car.downforce}/100\n- **Power Unit**: ${engine?.name ?? '—'} (Power ${engine?.power_rating ?? '—'}/100, Reliability ${engine?.reliability_rating ?? '—'}/100)\n\n### Weather Assessment\n- **Condition**: ${weather.condition ?? 'Clear'}\n- **Air Temp**: ${airTemp}°C · **Track Surface Temp**: ${trackTemp}°C\n- **Rainfall**: ${rainfallMm.toFixed(1)} mm/hr\n- **Compound Category**: ${isWet ? 'Wet / Intermediate' : 'Dry Slicks'}\n\n### Pre-Computed Tire Analytics\n${compoundLines}\n\n## Driver-Differentiated Stint Plans\n\n${driverSections}\n\n---\n_Generated by Apex F1 Strategy Engine · ${new Date().toISOString().slice(0, 10)}_`
}
