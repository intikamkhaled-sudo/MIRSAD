import { useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, BarChart, Bar } from 'recharts'
import type { WeatherResponse } from '../types'

function makeRows(data: WeatherResponse) {
  const h = data.hourly
  const times = (h.time || []) as string[]
  return times.map((time, i) => ({
    time: time?.slice(11, 16) || `${i}`,
    temperature: h.temperature_2m?.[i] ?? null,
    humidity: h.relative_humidity_2m?.[i] ?? null,
    clouds: h.cloud_cover?.[i] ?? null,
    low: h.cloud_cover_low?.[i] ?? null,
    mid: h.cloud_cover_mid?.[i] ?? null,
    high: h.cloud_cover_high?.[i] ?? null,
    visibility: typeof h.visibility?.[i] === 'number' ? Number(h.visibility[i]) / 1000 : null,
    wind: h.wind_speed_10m?.[i] ?? null,
    gust: h.wind_gusts_10m?.[i] ?? null,
    pressure: h.surface_pressure?.[i] ?? null,
    rain: h.precipitation?.[i] ?? null,
    radiation: h.shortwave_radiation?.[i] ?? null
  }))
}
function ChartPanel({ title, children, unit }: { title: string; children: React.ReactNode; unit?: string }) {
  return <section className="panel chart-panel"><div className="panel-heading"><h3>{title}</h3><span>{unit}</span></div>{children}</section>
}
const common = { stroke: '#253858', strokeDasharray: '3 3', vertical: false as const }
export default function WeatherCharts({ data }: { data: WeatherResponse }) {
  const rows = useMemo(() => makeRows(data), [data])
  const tickRows = rows.filter((_, i) => i % Math.max(1, Math.ceil(rows.length / 8)) === 0)
  return <div className="charts-grid">
    <ChartPanel title="Temperature profile" unit="°C"><ResponsiveContainer width="100%" height={230}><LineChart data={rows}><CartesianGrid {...common} /><XAxis dataKey="time" ticks={tickRows.map(x => x.time)} stroke="#71809b" /><YAxis stroke="#71809b" /><Tooltip contentStyle={{ background: '#0b1730', border: '1px solid #263a5b', borderRadius: 10 }} /><Line type="monotone" dataKey="temperature" name="Temperature" stroke="#ffd166" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></ChartPanel>
    <ChartPanel title="Cloud layers" unit="%"><ResponsiveContainer width="100%" height={230}><AreaChart data={rows}><CartesianGrid {...common} /><XAxis dataKey="time" ticks={tickRows.map(x => x.time)} stroke="#71809b" /><YAxis domain={[0, 100]} stroke="#71809b" /><Tooltip contentStyle={{ background: '#0b1730', border: '1px solid #263a5b', borderRadius: 10 }} /><Legend /><Area type="monotone" dataKey="low" name="Low" stackId="1" stroke="#55b8ff" fill="#55b8ff" fillOpacity={0.25} /><Area type="monotone" dataKey="mid" name="Mid" stackId="2" stroke="#9b8cff" fill="#9b8cff" fillOpacity={0.25} /><Area type="monotone" dataKey="high" name="High" stackId="3" stroke="#ffd166" fill="#ffd166" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></ChartPanel>
    <ChartPanel title="Visibility" unit="km"><ResponsiveContainer width="100%" height={230}><LineChart data={rows}><CartesianGrid {...common} /><XAxis dataKey="time" ticks={tickRows.map(x => x.time)} stroke="#71809b" /><YAxis stroke="#71809b" /><Tooltip contentStyle={{ background: '#0b1730', border: '1px solid #263a5b', borderRadius: 10 }} /><Line type="monotone" dataKey="visibility" name="Visibility" stroke="#58d6b3" strokeWidth={2.5} dot={false} /></LineChart></ResponsiveContainer></ChartPanel>
    <ChartPanel title="Wind speed & gusts" unit="km/h"><ResponsiveContainer width="100%" height={230}><LineChart data={rows}><CartesianGrid {...common} /><XAxis dataKey="time" ticks={tickRows.map(x => x.time)} stroke="#71809b" /><YAxis stroke="#71809b" /><Tooltip contentStyle={{ background: '#0b1730', border: '1px solid #263a5b', borderRadius: 10 }} /><Legend /><Line dataKey="wind" name="Wind" stroke="#55b8ff" dot={false} /><Line dataKey="gust" name="Gusts" stroke="#ff8f70" dot={false} /></LineChart></ResponsiveContainer></ChartPanel>
    <ChartPanel title="Relative humidity" unit="%"><ResponsiveContainer width="100%" height={210}><AreaChart data={rows}><CartesianGrid {...common} /><XAxis dataKey="time" ticks={tickRows.map(x => x.time)} stroke="#71809b" /><YAxis domain={[0, 100]} stroke="#71809b" /><Tooltip contentStyle={{ background: '#0b1730', border: '1px solid #263a5b', borderRadius: 10 }} /><Area dataKey="humidity" name="Humidity" stroke="#55b8ff" fill="#55b8ff" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></ChartPanel>
    <ChartPanel title="Surface pressure" unit="hPa"><ResponsiveContainer width="100%" height={210}><LineChart data={rows}><CartesianGrid {...common} /><XAxis dataKey="time" ticks={tickRows.map(x => x.time)} stroke="#71809b" /><YAxis stroke="#71809b" domain={['auto', 'auto']} /><Tooltip contentStyle={{ background: '#0b1730', border: '1px solid #263a5b', borderRadius: 10 }} /><Line dataKey="pressure" name="Pressure" stroke="#b49cff" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></ChartPanel>
    <ChartPanel title="Precipitation" unit="mm"><ResponsiveContainer width="100%" height={210}><BarChart data={rows}><CartesianGrid {...common} /><XAxis dataKey="time" ticks={tickRows.map(x => x.time)} stroke="#71809b" /><YAxis stroke="#71809b" /><Tooltip contentStyle={{ background: '#0b1730', border: '1px solid #263a5b', borderRadius: 10 }} /><Bar dataKey="rain" name="Precipitation" fill="#55b8ff" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></ChartPanel>
    <ChartPanel title="Solar radiation" unit="W/m²"><ResponsiveContainer width="100%" height={210}><AreaChart data={rows}><CartesianGrid {...common} /><XAxis dataKey="time" ticks={tickRows.map(x => x.time)} stroke="#71809b" /><YAxis stroke="#71809b" /><Tooltip contentStyle={{ background: '#0b1730', border: '1px solid #263a5b', borderRadius: 10 }} /><Area dataKey="radiation" name="Shortwave radiation" stroke="#ffd166" fill="#ffd166" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></ChartPanel>
  </div>
}
