import { useMemo } from 'react'
import * as Astronomy from 'astronomy-engine'
import { Moon, Orbit, Info } from 'lucide-react'

type Props = { latitude: number; longitude: number; date: string; language: 'en' | 'ar' }
export type CrescentResult = { sunset: string; moonset: string; sunsetIso: string; moonsetIso: string | null; moonAltitude: number; sunAltitude: number; arcv: number; daz: number; elongation: number; illumination: number; age: number; width: number; q: number; category: string; description: string }
const rad = (v: number) => v * Math.PI / 180
const deg = (v: number) => v * 180 / Math.PI
const wrap = (v: number) => ((v % 360) + 360) % 360
const timeText = (d: Date | null, locale: string) => d ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(d) + ' UTC' : '—'

export function calculateCrescent(latitude: number, longitude: number, date: string): CrescentResult | null {
  try {
    const localMidnightUtc = new Date(Date.parse(`${date}T00:00:00Z`) - longitude / 15 * 60 * 60 * 1000)
    const observer = new Astronomy.Observer(latitude, longitude, 0)
    const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, localMidnightUtc, 1)
    if (!sunset) return null
    const sunsetDate = sunset.date
    const moonEq = Astronomy.Equator(Astronomy.Body.Moon, sunsetDate, observer, true, true)
    const sunEq = Astronomy.Equator(Astronomy.Body.Sun, sunsetDate, observer, true, true)
    const moonHor = Astronomy.Horizon(sunsetDate, observer, moonEq.ra, moonEq.dec, 'normal')
    const sunHor = Astronomy.Horizon(sunsetDate, observer, sunEq.ra, sunEq.dec, 'normal')
    const illumination = Astronomy.Illumination(Astronomy.Body.Moon, sunsetDate).phase_fraction
    const phase = Astronomy.MoonPhase(sunsetDate)
    const age = wrap(phase) / 360 * 29.530588853
    const elongation = deg(Math.acos(Math.max(-1, Math.min(1, 2 * illumination - 1))))
    const arcv = moonHor.altitude - sunHor.altitude
    const daz = Math.abs(((moonHor.azimuth - sunHor.azimuth + 540) % 360) - 180)
    const width = 15.5 * (1 - Math.cos(rad(elongation)))
    // Yallop-style q screening: empirical criterion, not a guaranteed sighting prediction.
    const limit = 11.8371 - 6.3226 * width + 0.7319 * width ** 2 - 0.1018 * width ** 3
    const q = (arcv - limit) / 10
    const category = q >= 0.216 ? 'A' : q >= -0.014 ? 'B' : q >= -0.160 ? 'C' : q >= -0.232 ? 'D' : q >= -0.293 ? 'E' : 'F'
    const moonset = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, sunsetDate, 1)
    const moonsetDate = moonset?.date ?? null
    return { sunset: timeText(sunsetDate, 'en-GB'), moonset: timeText(moonsetDate, 'en-GB'), sunsetIso: sunsetDate.toISOString(), moonsetIso: moonsetDate?.toISOString() ?? null, moonAltitude: moonHor.altitude, sunAltitude: sunHor.altitude, arcv, daz, elongation, illumination, age, width, q, category, description: '' }
  } catch { return null }
}

export default function CrescentAssessment({ latitude, longitude, date, language }: Props) {
  const ar = language === 'ar'
  const result = useMemo(() => calculateCrescent(latitude, longitude, date), [latitude, longitude, date])
  const labels = ar ? {
    title: 'تحليل إمكانية رؤية الهلال', subtitle: 'حسابات فلكية عند غروب الشمس للموقع والتاريخ المحددين', sunset: 'غروب الشمس', moonset: 'غروب القمر', age: 'عمر الهلال', elongation: 'الاستطالة', altitude: 'ارتفاع القمر', arcv: 'فرق الارتفاع ARCV', daz: 'فرق السمت DAZ', width: 'عرض الهلال', illumination: 'الإضاءة', q: 'معيار Yallop (q)',
    classes: 'تصنيف الرؤية', noData: 'تعذر حساب ظروف الرصد لهذا التاريخ والموقع. تحقق من التاريخ والإحداثيات.', note: 'هذا تصنيف هندسي استرشادي وفق معيار Yallop اعتمادًا على حسابات فلكية؛ لا يمثل ضمانًا للرؤية الفعلية. تتأثر الرؤية بالشفافية الجوية والغبار والرطوبة وخبرة الراصد والأفق المحلي.',
    A: 'A — مرئي بالعين المجردة بسهولة', B: 'B — مرئي بالعين المجردة في ظروف مثالية', C: 'C — يحتاج ظروفًا جوية ممتازة ورصدًا دقيقًا', D: 'D — قد يحتاج وسائل بصرية', E: 'E — صعب جدًا؛ يحتاج وسائل بصرية متقدمة', F: 'F — خارج نطاق الرؤية المتوقعة وفق المعيار'
  } : {
    title: 'Crescent visibility assessment', subtitle: 'Astronomical calculations at local sunset for the selected site and date', sunset: 'Sunset', moonset: 'Moonset', age: 'Lunar age', elongation: 'Elongation', altitude: 'Moon altitude', arcv: 'Altitude difference (ARCV)', daz: 'Azimuth difference (DAZ)', width: 'Crescent width', illumination: 'Illuminated fraction', q: 'Yallop criterion (q)', classes: 'Visibility class', noData: 'Could not calculate observing circumstances for this date and location. Check the date and coordinates.', note: 'This is an indicative geometric classification using a Yallop-style criterion and astronomical position calculations; it does not guarantee an actual sighting. Atmospheric transparency, dust, humidity, local horizon and observer skill also matter.',
    A: 'A — Easily visible to the naked eye', B: 'B — Visible to the naked eye in ideal conditions', C: 'C — Requires excellent conditions and careful observation', D: 'D — May require optical aid', E: 'E — Very difficult; advanced optical aid required', F: 'F — Outside expected visibility under this criterion'
  }
  const items = result ? [
    [labels.sunset, result.sunset, ''], [labels.moonset, result.moonset, ''], [labels.age, `${result.age.toFixed(2)} ${ar ? 'يوم' : 'days'}`, ''],
    [labels.elongation, `${result.elongation.toFixed(2)}°`, ''], [labels.altitude, `${result.moonAltitude.toFixed(2)}°`, ''],
    [labels.arcv, `${result.arcv.toFixed(2)}°`, ''], [labels.daz, `${result.daz.toFixed(2)}°`, ''],
    [labels.width, `${result.width.toFixed(2)}′`, ''], [labels.illumination, `${(result.illumination * 100).toFixed(2)}%`, ''], [labels.q, result.q.toFixed(3), '']
  ] : []
  const className = result ? (result.category === 'A' || result.category === 'B' ? 'favorable' : result.category === 'C' || result.category === 'D' ? 'moderate' : 'poor') : ''
  return <section className="panel crescent-panel">
    <div className="panel-heading"><div><div className="section-index">03 / LUNAR VISIBILITY INTELLIGENCE</div><h3><Moon size={16} style={{verticalAlign:'-3px',marginInlineEnd:7,color:'#ffd166'}}/>{labels.title}</h3><p className="crescent-subtitle">{labels.subtitle}</p></div><span className="source-tag"><Orbit size={13}/> ASTRONOMY ENGINE</span></div>
    {!result ? <div className="crescent-empty">{labels.noData}</div> : <>
      <div className="crescent-result"><div className={`crescent-grade ${className}`}><span>{result.category}</span><small>{labels.classes}</small></div><div className="crescent-grade-copy"><strong>{labels[result.category as keyof typeof labels]}</strong><p>{ar ? 'نتائج الحساب مرتبطة بموعد غروب الشمس المحلي.' : 'The result is evaluated for the local sunset event.'}</p></div><div className="q-value"><small>YALLOP q</small><b>{result.q.toFixed(3)}</b></div></div>
      <div className="crescent-metrics">{items.map(([label, value]) => <div className="crescent-metric" key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
      <div className="crescent-note"><Info size={16}/><span>{labels.note}</span></div>
    </>}
  </section>
}
