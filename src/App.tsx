import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownToLine, CalendarDays, Cloud, Compass, Database, Gauge, Globe2, MapPin, RefreshCw, Search, Wind, AlertTriangle, CheckCircle2, XCircle, Satellite, Sun, Droplets, Moon } from 'lucide-react'
import { getWeather } from './services/openMeteo'
import { summarizeWeather, formatNumber } from './utils/analysis'
import WeatherMap from './components/WeatherMap'
import WeatherCharts from './components/WeatherCharts'
import type { DataMode, WeatherResponse } from './types'
import CrescentAssessment from './components/CrescentAssessment'
import IntegratedVisibilityAssessment from './components/IntegratedVisibilityAssessment'
import { Languages } from 'lucide-react'

const today = new Date().toISOString().slice(0, 10)
const modeNames: Record<DataMode, string> = {
  forecast: 'Forecast',
  historical: 'Historical Weather',
  'historical-forecast': 'Historical Forecast'
}
const variables = [
  ['temperature_2m', 'Temperature', '°C'], ['relative_humidity_2m', 'Relative humidity', '%'],
  ['dew_point_2m', 'Dew point', '°C'], ['apparent_temperature', 'Apparent temperature', '°C'],
  ['precipitation_probability', 'Precipitation probability', '%'], ['precipitation', 'Precipitation', 'mm'],
  ['cloud_cover', 'Total cloud cover', '%'], ['cloud_cover_low', 'Low cloud cover', '%'],
  ['cloud_cover_mid', 'Mid cloud cover', '%'], ['cloud_cover_high', 'High cloud cover', '%'],
  ['visibility', 'Visibility', 'm'], ['wind_speed_10m', 'Wind speed', 'km/h'],
  ['wind_direction_10m', 'Wind direction', '°'], ['wind_gusts_10m', 'Wind gusts', 'km/h'],
  ['surface_pressure', 'Surface pressure', 'hPa'], ['pressure_msl', 'Mean sea-level pressure', 'hPa'],
  ['vapour_pressure_deficit', 'Vapour pressure deficit', 'kPa'], ['cape', 'CAPE', 'J/kg'],
  ['boundary_layer_height', 'Boundary layer height', 'm'], ['shortwave_radiation', 'Shortwave radiation', 'W/m²'],
  ['direct_normal_irradiance', 'Direct normal irradiance', 'W/m²'], ['sunshine_duration', 'Sunshine duration', 's']
] as const

export default function App() {
  const [lat, setLat] = useState('29.9792')
  const [lon, setLon] = useState('31.1342')
  const [date, setDate] = useState(today)
  const [mode, setMode] = useState<DataMode>('forecast')
  const [data, setData] = useState<WeatherResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'data' | 'crescent'>('overview')
  const [language, setLanguage] = useState<'en' | 'ar'>(() => (localStorage.getItem('rasid-language') as 'en' | 'ar') || 'en')
  const isArabic = language === 'ar'
  useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr' }, [language])
  const switchLanguage = () => setLanguage(current => { const next = current === 'en' ? 'ar' : 'en'; localStorage.setItem('rasid-language', next); return next })
  const [searchLabel, setSearchLabel] = useState('Giza Plateau')

  const analysis = useMemo(() => data ? summarizeWeather(data) : null, [data])
  const runAnalysis = async () => {
    setError('')
    const latitude = Number(lat), longitude = Number(lon)
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setError('Enter valid coordinates: latitude −90 to 90, longitude −180 to 180.')
      return
    }
    setLoading(true)
    try {
      const result = await getWeather(latitude, longitude, date, mode)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load weather data.')
    } finally { setLoading(false) }
  }
  const exportCsv = () => {
    if (!data) return
    const keys = Object.keys(data.hourly)
    const rows = [keys.join(','), ...((data.hourly.time || []) as string[]).map((_, i) => keys.map(k => JSON.stringify(data.hourly[k]?.[i] ?? '')).join(','))]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `rasid-${date}-weather.csv`; a.click(); URL.revokeObjectURL(url)
  }
  const scoreLabel = analysis?.score === null || !analysis ? 'Awaiting data' : analysis.score >= 80 ? 'Favorable indicators' : analysis.score >= 50 ? 'Mixed conditions' : 'Challenging conditions'
  const times = data?.hourly.time as string[] | undefined

  return <div className="app-shell" dir={isArabic ? 'rtl' : 'ltr'}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><img src="/favicon.svg" alt="RASID logo" /></div><div><div className="brand-name">RASID</div><div className="brand-sub">ATMOSPHERIC &amp; LUNAR INTELLIGENCE</div></div></div>
      <div className="side-caption">{isArabic ? 'مساحة العمل' : 'WORKSPACE'}</div>
      <button className={`nav-item active`}><Activity size={17}/>{isArabic ? 'لوحة الرصد' : 'Observation dashboard'}</button>
      <button className="nav-item" onClick={() => setActiveTab('charts')}><Gauge size={17}/>{isArabic ? 'التحليل العلمي' : 'Scientific analysis'}</button>
      <button className="nav-item" onClick={() => setActiveTab('data')}><Database size={17}/>{isArabic ? 'بيانات الأرصاد الخام' : 'Raw meteorological data'}</button>
      <div className="sidebar-bottom"><div className="live-dot"/> <span>Open-Meteo data interface</span><div className="side-version">RASID 1.0.0</div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div><div className="eyebrow">ATMOSPHERIC INTELLIGENCE / FIELD OPERATIONS</div><h1>{isArabic ? 'لوحة معلومات الرصد' : 'Observation dashboard'}</h1></div><div className="topbar-right"><button className="language-button" onClick={switchLanguage}><Languages size={15}/>{isArabic ? 'English' : 'العربية'}</button><span className="status-pill"><span className="live-dot"/> {isArabic ? 'النظام جاهز' : 'SYSTEM READY'}</span><div className="avatar">RS</div></div></header>
      <section className="hero-strip"><div className="hero-copy"><div className="hero-kicker"><span/> DECISION SUPPORT SYSTEM</div><h2>{isArabic ? <>افهم الغلاف الجوي.<br/><em>خطّط للرصد.</em></> : <>Understand the atmosphere.<br/><em>Plan the observation.</em></>}</h2><p>{isArabic ? 'ذكاء جوي وفلكي لتقييم مواقع الرصد والتخطيط الميداني.' : 'Weather and lunar analysis for observation-site assessment and planning.'}</p></div><div className="hero-orbit"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-core"><Satellite size={34}/></div><span className="orbit-star star-a">✦</span><span className="orbit-star star-b">✧</span></div></section>

      <section className="panel input-panel">
        <div className="panel-heading"><div><div className="section-index">01 / SITE PARAMETERS</div><h3>{isArabic ? 'موقع الرصد والتاريخ' : 'Observation site and date'}</h3></div><span className="source-tag"><Globe2 size={13}/> OPEN-METEO</span></div>
        <div className="input-grid">
          <label className="field"><span><MapPin size={14}/>{isArabic ? 'اسم الموقع' : 'SITE LABEL'}</span><input value={searchLabel} onChange={e => setSearchLabel(e.target.value)} placeholder={isArabic ? "مثال: موقع الرصد" : "e.g. Observation site"} /></label>
          <label className="field"><span>{isArabic ? 'خط العرض' : 'LATITUDE'}</span><input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} /></label>
          <label className="field"><span>{isArabic ? 'خط الطول' : 'LONGITUDE'}</span><input type="number" step="any" value={lon} onChange={e => setLon(e.target.value)} /></label>
          <label className="field"><span><CalendarDays size={14}/>{isArabic ? 'تاريخ الرصد' : 'OBSERVATION DATE'}</span><input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
          <label className="field mode-field"><span>{isArabic ? 'مصدر البيانات' : 'DATA MODE'}</span><select value={mode} onChange={e => setMode(e.target.value as DataMode)}><option value="forecast">{isArabic ? "توقعات (حتى 16 يومًا)" : "Forecast (up to 16 days)"}</option><option value="historical">{isArabic ? "الطقس التاريخي" : "Historical Weather"}</option><option value="historical-forecast">{isArabic ? "التوقعات التاريخية" : "Historical Forecast"}</option></select></label>
          <button className="run-button" onClick={runAnalysis} disabled={loading}>{loading ? <RefreshCw className="spin" size={17}/> : <Search size={17}/>} {loading ? (isArabic ? 'جارٍ التحليل…' : 'ANALYZING…') : (isArabic ? 'ابدأ التحليل' : 'RUN ANALYSIS')}</button>
        </div>
        <div className="input-foot"><span><i/>{isArabic ? 'يتم التحقق من الإحداثيات قبل إرسال الطلب' : 'Coordinates are validated before each request'}</span><span>{isArabic ? 'المنطقة الزمنية تُحدد تلقائيًا من الإحداثيات' : 'Timezone is detected automatically from the coordinates'}</span></div>
        {error && <div className="error-banner"><AlertTriangle size={16}/>{error}</div>}
      </section>

      <div className="section-toolbar"><div><div className="section-index">02 / ATMOSPHERIC INTELLIGENCE</div><h2>{isArabic ? 'تقييم الطقس والرصد' : 'Weather assessment'}</h2></div><div className="toolbar-actions"><span className="date-chip">{data ? modeNames[mode] : (isArabic ? 'لا توجد بيانات' : 'No dataset loaded')} · {date}</span><button className="export-button crescent-shortcut" onClick={() => setActiveTab('crescent')}><Moon size={15}/>{isArabic ? 'رؤية الهلال' : 'Crescent visibility'}</button>{data && <button className="export-button" onClick={exportCsv}><ArrowDownToLine size={15}/> Export CSV</button>}</div></div>
      {!data && activeTab !== 'crescent' ? <div className="empty-state panel"><div className="empty-icon"><Cloud size={30}/></div><h3>{isArabic ? "في انتظار بيانات الرصد" : "Awaiting observation parameters"}</h3><p>{isArabic ? "أدخل إحداثيات الموقع والتاريخ ثم ابدأ التحليل لجلب بيانات الأرصاد وإنشاء الرسوم العلمية." : "Enter the site coordinates and date, then run the analysis to load the meteorological data and generate the charts."}</p><div className="empty-hint"><span/> READY TO CONNECT TO OPEN-METEO</div></div> : <>
        <div className="tabs"><button className={activeTab === 'overview' ? 'selected' : ''} onClick={() => setActiveTab('overview')}>{isArabic ? 'نظرة عامة' : 'Overview'}</button><button className={activeTab === 'charts' ? 'selected' : ''} onClick={() => setActiveTab('charts')}>{isArabic ? 'الرسوم العلمية' : 'Scientific charts'}</button><button className={activeTab === 'data' ? 'selected' : ''} onClick={() => setActiveTab('data')}>{isArabic ? 'جدول البيانات' : 'Hourly data table'}</button><button className={activeTab === 'crescent' ? 'selected' : ''} onClick={() => setActiveTab('crescent')}>{isArabic ? 'رؤية الهلال' : 'Crescent visibility'}</button></div>
        {data && activeTab === 'overview' && <>
          <div className="metric-grid">
            <Metric icon={<Sun/>} label="MEAN TEMPERATURE" value={`${formatNumber(analysis?.temperature)} °C`} />
            <Metric icon={<Droplets/>} label="RELATIVE HUMIDITY" value={`${formatNumber(analysis?.humidity, 0)} %`} />
            <Metric icon={<Cloud/>} label="TOTAL CLOUD COVER" value={`${formatNumber(analysis?.cloud, 0)} %`} />
            <Metric icon={<Wind/>} label="MEAN WIND SPEED" value={`${formatNumber(analysis?.wind)} km/h`} />
            <Metric icon={<Compass/>} label="VISIBILITY" value={analysis?.visibility == null ? '—' : `${formatNumber(analysis.visibility / 1000)} km`} />
            <Metric icon={<Gauge/>} label="SURFACE PRESSURE" value={`${formatNumber(analysis?.pressure, 0)} hPa`} />
          </div>
          <div className="overview-grid">
            <section className="panel decision-panel"><div className="panel-heading"><div><div className="section-index">ATMOSPHERIC SCREENING / INPUT TO LUNAR ENGINE</div><h3>{isArabic ? 'مؤشرات ملاءمة الرصد' : 'Observation suitability indicators'}</h3></div><span className="info-tag">PRELIMINARY</span></div>
              <div className="decision-score"><div className="score-ring" style={{'--score': `${analysis?.score ?? 0}%`} as React.CSSProperties}><strong>{analysis?.score ?? '—'}<small>{analysis?.score == null ? '' : '%'}</small></strong></div><div><h4>{scoreLabel}</h4><p>Rule-based screening of the available weather variables. This is not a probability of sighting the crescent.</p></div></div>
              <div className="checks">{analysis?.checks.map(item => <div className="check-row" key={item.label}><span className={item.good ? 'check-icon good' : 'check-icon bad'}>{item.good ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}</span><div><strong>{item.label}</strong><small>{item.detail}</small></div><span className="check-state">{item.value === null ? 'N/A' : item.good ? 'SUPPORTIVE' : 'CAUTION'}</span></div>)}</div>
              <div className="disclaimer"><AlertTriangle size={15}/> This screening applies simple indicative thresholds. It is not a validated meteorological or astronomical model. Check local terrain, on-site measurements and forecast uncertainty before making field decisions.</div>
            </section>
            <section className="panel location-panel"><div className="panel-heading"><div><div className="section-index">SITE / GEOGRAPHY</div><h3>{searchLabel || 'Observation site'}</h3></div><span className="source-tag"><MapPin size={13}/> TARGET</span></div><WeatherMap lat={data.latitude} lon={data.longitude}/><div className="coordinates"><span>LATITUDE <b>{data.latitude.toFixed(4)}°</b></span><span>LONGITUDE <b>{data.longitude.toFixed(4)}°</b></span><span>TIMEZONE <b>{data.timezone}</b></span></div></section>
          </div>
          <section className="panel summary-panel"><div className="panel-heading"><div><div className="section-index">DATA PROVENANCE</div><h3>Dataset information</h3></div><span className="source-tag">OPEN-METEO API</span></div><div className="provenance-grid"><div><small>DATA MODE</small><b>{modeNames[mode]}</b></div><div><small>REQUESTED DATE</small><b>{date}</b></div><div><small>HOURLY RECORDS</small><b>{times?.length ?? 0} hours</b></div><div><small>TIMEZONE</small><b>{data.timezone} ({data.timezone_abbreviation || 'local'})</b></div><div><small>MODEL ELEVATION</small><b>{data.elevation ?? '—'} m</b></div></div><p className="data-note">Forecast values are model output. Historical Weather is reanalysis, not necessarily direct station observations. Historical Forecast consists of archived forecast products and should not be treated as observed conditions.</p></section>
        </>}
        {data && activeTab === 'charts' && <WeatherCharts data={data}/>}
        {activeTab === 'crescent' && <><CrescentAssessment latitude={Number(lat)} longitude={Number(lon)} date={date} language={language}/><IntegratedVisibilityAssessment latitude={Number(lat)} longitude={Number(lon)} date={date} weather={data} language={language}/></>}
        {data && activeTab === 'data' && <section className="panel table-panel"><div className="panel-heading"><div><div className="section-index">HOURLY RESOLUTION</div><h3>Raw meteorological data</h3></div><span className="source-tag">{times?.length ?? 0} RECORDS</span></div><div className="table-scroll"><table><thead><tr><th>LOCAL TIME</th>{variables.filter(([key]) => data.hourly[key]).map(([key, label, unit]) => <th key={key}>{label}<small>{unit}</small></th>)}</tr></thead><tbody>{times?.map((time, i) => <tr key={time}><td>{time.replace('T', ' ')}</td>{variables.filter(([key]) => data.hourly[key]).map(([key]) => <td key={key}>{data.hourly[key]?.[i] ?? '—'}</td>)}</tr>)}</tbody></table></div></section>}
      </>}
      <footer className="footer"><span className="copyright">© 2026 ENG Khaled Isamil. All Rights Reserved.</span><span>RASID · Built for scientific observation planning <b>✦</b></span></footer>
    </main>
  </div>
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="metric-card"><div className="metric-top"><span className="metric-icon">{icon}</span><span className="metric-label">{label}</span></div><div className="metric-value">{value}</div><div className="metric-foot">HOURLY DATASET SUMMARY</div></div>
}
