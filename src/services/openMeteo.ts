import { z } from 'zod'
import type { DataMode, WeatherResponse } from '../types'

const responseSchema = z.object({
  latitude: z.number(), longitude: z.number(), timezone: z.string(),
  hourly: z.record(z.array(z.union([z.number(), z.string(), z.null()]))),
  hourly_units: z.record(z.string()).optional(),
  daily: z.record(z.array(z.union([z.number(), z.string(), z.null()]))).optional()
})

const hourly = [
  'temperature_2m', 'relative_humidity_2m', 'dew_point_2m', 'apparent_temperature',
  'precipitation_probability', 'precipitation', 'rain', 'showers', 'snowfall',
  'cloud_cover', 'cloud_cover_low', 'cloud_cover_mid', 'cloud_cover_high',
  'visibility', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
  'surface_pressure', 'pressure_msl', 'vapour_pressure_deficit', 'cape',
  'boundary_layer_height', 'shortwave_radiation', 'direct_radiation',
  'diffuse_radiation', 'direct_normal_irradiance', 'sunshine_duration'
].join(',')

const daily = [
  'weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_sum',
  'precipitation_probability_max', 'wind_speed_10m_max', 'wind_gusts_10m_max',
  'sunrise', 'sunset', 'sunshine_duration'
].join(',')

export async function getWeather(lat: number, lon: number, date: string, mode: DataMode): Promise<WeatherResponse> {
  const today = new Date().toISOString().slice(0, 10)
  let base = 'https://api.open-meteo.com/v1/forecast'
  if (mode === 'historical') base = 'https://archive-api.open-meteo.com/v1/archive'
  if (mode === 'historical-forecast') base = 'https://historical-forecast-api.open-meteo.com/v1/forecast'

  const params = new URLSearchParams({
    latitude: String(lat), longitude: String(lon), hourly, daily,
    timezone: 'auto', temperature_unit: 'celsius', wind_speed_unit: 'kmh',
    precipitation_unit: 'mm'
  })
  // A specific date is requested, so use start_date/end_date only.
  // Open-Meteo does not allow forecast_days together with these parameters.
  params.set('start_date', date)
  params.set('end_date', date)
  if (mode === 'historical' && date >= today) {
    throw new Error('Historical Weather requires a date in the past.')
  }
  if (mode === 'historical-forecast' && date >= today) {
    throw new Error('Historical Forecast is intended for dates in the past.')
  }

  const response = await fetch(`${base}?${params.toString()}`)
  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Open-Meteo request failed (${response.status}). ${detail.slice(0, 180)}`)
  }
  const raw = await response.json()
  const parsed = responseSchema.safeParse(raw)
  if (!parsed.success) throw new Error('The weather provider returned an unexpected data format.')
  return parsed.data as WeatherResponse
}
