import circuitsData from '../../data/json/circuits.json'
import teamsData from '../../data/json/teams.json'
import driversData from '../../data/json/drivers.json'
import racesData from '../../data/json/races.json'
import engineSuppliersData from '../../data/json/engine_suppliers.json'
import carDesignsData from '../../data/json/car_designs.json'
import tireCompoundsData from '../../data/json/tire_compounds.json'
import type {
  Circuit,
  Team,
  Driver,
  Race,
  EngineSupplier,
  CarDesign,
  TireCompound,
} from '../types'

export const circuits = circuitsData as Circuit[]
export const teams = teamsData as Team[]
export const drivers = driversData as Driver[]
export const races = racesData as Race[]
export const engineSuppliers = engineSuppliersData as EngineSupplier[]
export const carDesigns = carDesignsData as CarDesign[]
export const tireCompounds = tireCompoundsData as TireCompound[]

export const teamById = (id: string) => teams.find((t) => t.id === id)
export const circuitById = (id: string) => circuits.find((c) => c.id === id)
export const raceByCircuitId = (circuitId: string) =>
  races.find((r) => r.circuit_id === circuitId)
export const driversByTeam = (teamId: string) =>
  drivers.filter((d) => d.team_id === teamId)
export const carByTeam = (teamId: string) =>
  carDesigns.find((cd) => cd.team_id === teamId)
export const engineById = (id: string) =>
  engineSuppliers.find((e) => e.id === id)

export function teamAccent(teamId: string): string {
  const accents: Record<string, string> = {
    red_bull: '#1e3a8a',
    ferrari: '#d11414',
    mclaren: '#ff8000',
    mercedes: '#00d2b8',
    aston_martin: '#044a42',
    williams: '#00a0de',
    vcarb: '#1a4d8f',
    alpine: '#0090ff',
    audi: '#00ff00',
    haas: '#b3b3b3',
    cadillac: '#6b2d8f',
  }
  return accents[teamId] ?? '#ff1e1e'
}

export function stressColor(value: string): string {
  switch (value) {
    case 'Very Low': return 'var(--green-400)'
    case 'Low': return 'var(--green-500)'
    case 'Medium': return 'var(--amber-500)'
    case 'High': return 'var(--red-500)'
    case 'Very High': return 'var(--red-400)'
    default: return 'var(--carbon-300)'
  }
}

export function abrasionColor(value: string): string {
  switch (value) {
    case 'Low': return 'var(--green-500)'
    case 'Medium': return 'var(--amber-500)'
    case 'High': return 'var(--red-500)'
    default: return 'var(--carbon-300)'
  }
}

export function countryFlag(country: string): string {
  const flags: Record<string, string> = {
    Australia: 'AU',
    China: 'CN',
    Japan: 'JP',
    Bahrain: 'BH',
    'Saudi Arabia': 'SA',
    USA: 'US',
    Canada: 'CA',
    Monaco: 'MC',
    Spain: 'ES',
    Austria: 'AT',
    UK: 'GB',
    Belgium: 'BE',
    Hungary: 'HU',
    Netherlands: 'NL',
    Italy: 'IT',
    Azerbaijan: 'AZ',
    Singapore: 'SG',
    Mexico: 'MX',
    Brazil: 'BR',
    Qatar: 'QA',
    UAE: 'AE',
  }
  return flags[country] ?? country.slice(0, 2).toUpperCase()
}
