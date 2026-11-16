import type { WeatherResponse } from '../types'

export function summarizeWeather(data: WeatherResponse) {
  const h = data.hourly
  const avg = (key: string) => {
    const values = (h[key] || []).filter((v): v is number => typeof v === 'number')
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null
  }
  const max = (key: string) => {
    const values = (h[key] || []).filter((v): v is number => typeof v === 'number')
    return values.length ? Math.max(...values) : null
  }
  const cloud = avg('cloud_cover')
  const visibility = avg('visibility')
  const wind = avg('wind_speed_10m')
  const humidity = avg('relative_humidity_2m')
  const rain = max('precipitation_probability')
  const checks = [
    { label: 'Cloud cover', value: cloud, good: cloud !== null && cloud <= 35, detail: cloud === null ? 'Unavailable' : `${cloud.toFixed(0)}% average total cloud cover` },
    { label: 'Horizontal visibility', value: visibility, good: visibility !== null && visibility >= 10000, detail: visibility === null ? 'Unavailable' : `${(visibility / 1000).toFixed(1)} km average visibility` },
    { label: 'Wind conditions', value: wind, good: wind !== null && wind <= 25, detail: wind === null ? 'Unavailable' : `${wind.toFixed(1)} km/h average wind` },
    { label: 'Moisture', value: humidity, good: humidity !== null && humidity <= 80, detail: humidity === null ? 'Unavailable' : `${humidity.toFixed(0)}% average relative humidity` },
    { label: 'Precipitation risk', value: rain, good: rain !== null && rain < 30, detail: rain === null ? 'Unavailable' : `${rain.toFixed(0)}% peak precipitation probability` }
  ]
  const known = checks.filter(x => x.value !== null)
  const score = known.length ? Math.round(known.filter(x => x.good).length / known.length * 100) : null
  return { checks, score, cloud, visibility, wind, humidity, rain, temperature: avg('temperature_2m'), pressure: avg('surface_pressure') }
}

export function formatNumber(value: number | null | undefined, digits = 1) {
  return value === null || value === undefined || !Number.isFinite(value) ? '—' : value.toFixed(digits)
}
