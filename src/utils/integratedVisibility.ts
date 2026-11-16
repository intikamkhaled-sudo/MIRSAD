import type { WeatherResponse } from '../types'
import type { CrescentResult } from '../components/CrescentAssessment'

type Metric = { key: string; label: string; value: number | null; unit: string; score: number | null; weight: number; detail: string }

function average(values: (number | string | null)[]) {
  const valid = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null
}
function minimum(values: (number | string | null)[]) {
  const valid = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  return valid.length ? Math.min(...valid) : null
}
function maximum(values: (number | string | null)[]) {
  const valid = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v))
  return valid.length ? Math.max(...valid) : null
}
function localDateTime(iso: string, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

export function assessIntegratedVisibility(astronomy: CrescentResult, weather: WeatherResponse) {
  const hourly = weather.hourly
  const times = (hourly.time ?? []).filter((v): v is string => typeof v === 'string')
  const sunsetLocal = localDateTime(astronomy.sunsetIso, weather.timezone)
  const moonsetLocal = astronomy.moonsetIso ? localDateTime(astronomy.moonsetIso, weather.timezone) : null
  const indices = times.map((time, index) => ({ time, index })).filter(x => x.time >= sunsetLocal && (!moonsetLocal || x.time <= moonsetLocal)).map(x => x.index)
  const windowValid = indices.length > 0 && !!moonsetLocal && moonsetLocal > sunsetLocal
  const sample = (key: string) => indices.map(i => hourly[key]?.[i] ?? null)

  const cloud = average(sample('cloud_cover'))
  const lowCloud = average(sample('cloud_cover_low'))
  const visibility = minimum(sample('visibility'))
  const humidity = average(sample('relative_humidity_2m'))
  const wind = average(sample('wind_speed_10m'))
  const gust = maximum(sample('wind_gusts_10m'))
  const precipitation = maximum(sample('precipitation_probability'))

  const metrics: Metric[] = [
    { key: 'cloud', label: 'Total cloud cover', value: cloud, unit: '%', score: cloud === null ? null : Math.max(0, Math.min(100, 100 - cloud)), weight: 0.35, detail: cloud === null ? 'Unavailable' : `${cloud.toFixed(0)}% mean during observing window` },
    { key: 'visibility', label: 'Horizontal visibility', value: visibility, unit: 'm', score: visibility === null ? null : Math.max(0, Math.min(100, visibility / 200)), weight: 0.30, detail: visibility === null ? 'Unavailable' : `${(visibility / 1000).toFixed(1)} km minimum in sampled hours` },
    { key: 'humidity', label: 'Relative humidity', value: humidity, unit: '%', score: humidity === null ? null : Math.max(0, Math.min(100, 100 - Math.max(0, humidity - 45) * 1.5)), weight: 0.15, detail: humidity === null ? 'Unavailable' : `${humidity.toFixed(0)}% mean during observing window` },
    { key: 'wind', label: 'Wind speed', value: wind, unit: 'km/h', score: wind === null ? null : Math.max(0, Math.min(100, 100 - Math.max(0, wind - 10) * 2.5)), weight: 0.10, detail: wind === null ? 'Unavailable' : `${wind.toFixed(1)} km/h mean${gust === null ? '' : `; ${gust.toFixed(1)} km/h peak gust`}` },
    { key: 'precipitation', label: 'Precipitation risk', value: precipitation, unit: '%', score: precipitation === null ? null : 100 - precipitation, weight: 0.10, detail: precipitation === null ? 'Unavailable' : `${precipitation.toFixed(0)}% peak probability` },
  ]
  const known = metrics.filter(m => m.score !== null)
  const weightTotal = known.reduce((sum, m) => sum + m.weight, 0)
  const weatherScore = known.length >= 3 ? Math.round(known.reduce((sum, m) => sum + (m.score ?? 0) * m.weight, 0) / weightTotal) : null
  const classScores: Record<string, number> = { A: 100, B: 85, C: 65, D: 45, E: 20, F: 0 }
  const astronomicalScore = classScores[astronomy.category] ?? 0
  const integratedScore = weatherScore === null || !windowValid ? null : Math.round(astronomicalScore * 0.55 + weatherScore * 0.45)
  const decision = integratedScore === null ? 'insufficient' : astronomy.category === 'F' || (astronomicalScore < 20) ? 'not_favorable' : integratedScore >= 80 ? 'favorable' : integratedScore >= 60 ? 'conditionally_favorable' : integratedScore >= 40 ? 'difficult' : 'not_favorable'
  return { sunsetLocal, moonsetLocal, sampledHours: indices.length, windowValid, metrics, weatherScore, astronomicalScore, integratedScore, decision, lowCloud, dustAvailable: false }
}
