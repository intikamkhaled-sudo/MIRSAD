import { useMemo } from 'react'
import { AlertTriangle, CloudSun, Orbit, ShieldCheck } from 'lucide-react'
import type { WeatherResponse } from '../types'
import { calculateCrescent } from './CrescentAssessment'
import { assessIntegratedVisibility } from '../utils/integratedVisibility'

type Props = { latitude: number; longitude: number; date: string; weather: WeatherResponse | null; language: 'en' | 'ar' }

export default function IntegratedVisibilityAssessment({ latitude, longitude, date, weather, language }: Props) {
  const ar = language === 'ar'
  const astronomy = useMemo(() => calculateCrescent(latitude, longitude, date), [latitude, longitude, date])
  const result = useMemo(() => astronomy && weather ? assessIntegratedVisibility(astronomy, weather) : null, [astronomy, weather])
  const labels = ar ? {
    title: 'القرار المتكامل لرؤية الهلال', subtitle: 'دمج المؤشرات الفلكية مع الطقس خلال فترة الرصد الفعلية', astro: 'التقييم الفلكي', weather: 'التقييم الجوي', final: 'القرار النهائي', score: 'مؤشر ملاءمة مدمج', favorable: 'ظروف مواتية نسبيًا', conditionally_favorable: 'مواتٍ بشروط', difficult: 'ظروف صعبة للرصد', not_favorable: 'غير مواتٍ للرصد', insufficient: 'بيانات غير كافية لإصدار قرار', hours: 'عدد الساعات المستخدمة', window: 'فترة التحليل المحلية', cloud: 'السحب المنخفضة', unavailable: 'غير متاح', missing: 'شغّل تحليل الطقس أولًا لإنتاج قرار يجمع المؤشرات الفلكية والجوية.', note: 'هذا مؤشر دعم قرار تجريبي قائم على قواعد ترجيح إرشادية، وليس احتمالًا إحصائيًا للرؤية أو نموذجًا معايرًا ببيانات رصد ميدانية. لا يتم تعديل تصنيف Yallop الأصلي.', dust: 'بيانات الغبار والهباء الجوي غير متاحة في مجموعة البيانات الحالية، لذلك لم تدخل في الدرجة.', windowError: 'تعذر مطابقة ساعات الطقس مع الفترة بين الغروب وغروب القمر؛ لا يصدر النظام قرارًا مدمجًا.'
  } : {
    title: 'Integrated Crescent Visibility Decision', subtitle: 'Astronomical geometry combined with weather during the actual observing window', astro: 'Astronomical assessment', weather: 'Atmospheric assessment', final: 'Integrated decision', score: 'Combined suitability index', favorable: 'Relatively favorable conditions', conditionally_favorable: 'Conditionally favorable', difficult: 'Difficult observing conditions', not_favorable: 'Not favorable for observation', insufficient: 'Insufficient data for a decision', hours: 'Weather samples used', window: 'Local analysis window', cloud: 'Low cloud cover', unavailable: 'Unavailable', missing: 'Run weather analysis first to generate a decision using both astronomical and atmospheric inputs.', note: 'This is an experimental rule-based decision-support index, not a statistical probability of sighting and not calibrated against field observations. The original Yallop class is preserved unchanged.', dust: 'Dust and aerosol observations are not available in the current dataset and are excluded from the score.', windowError: 'Weather timestamps could not be matched to the sunset-to-moonset interval; no integrated decision is issued.'
  }
  const decisionLabel = result ? labels[result.decision as keyof typeof labels] : labels.insufficient
  const score = result?.integratedScore
  return <section className="panel integrated-panel">
    <div className="panel-heading"><div><div className="section-index">04 / INTEGRATED DECISION ENGINE</div><h3><ShieldCheck size={17} style={{ verticalAlign: '-3px', marginInlineEnd: 7, color: '#ffd166' }}/>{labels.title}</h3><p className="crescent-subtitle">{labels.subtitle}</p></div><span className="source-tag">ASTRO + WEATHER</span></div>
    {!weather || !astronomy ? <div className="integrated-empty">{labels.missing}</div> : !result?.windowValid ? <div className="integrated-warning"><AlertTriangle size={17}/>{labels.windowError}</div> : <>
      <div className="integrated-inputs">
        <div className="integrated-input-card"><span><Orbit size={15}/>{labels.astro}</span><strong>{astronomy.category}</strong><small>Yallop q = {astronomy.q.toFixed(3)} · {result.astronomicalScore}/100 screening index</small></div>
        <div className="integrated-input-card"><span><CloudSun size={15}/>{labels.weather}</span><strong>{result.weatherScore === null ? '—' : `${result.weatherScore}/100`}</strong><small>{result.sampledHours} hourly samples · {result.metrics.filter(m => m.score !== null).length}/5 variables available</small></div>
      </div>
      <div className={`integrated-decision ${result.decision}`}>
        <div className="integrated-score"><strong>{score === null ? '—' : score}</strong><small>/100</small></div>
        <div className="integrated-decision-copy"><small>{labels.final}</small><h4>{decisionLabel}</h4><p>{labels.score}: {score === null ? labels.unavailable : `${score}/100`}</p></div>
      </div>
      <div className="integrated-window"><span>{labels.window}</span><strong>{result.sunsetLocal.replace('T', ' ')} — {result.moonsetLocal?.replace('T', ' ')}</strong><span>{labels.hours}: {result.sampledHours}</span></div>
      <div className="integrated-factor-grid">{result.metrics.map(metric => <div className="integrated-factor" key={metric.key}><span>{metric.label}</span><strong>{metric.value === null ? labels.unavailable : `${metric.key === 'visibility' ? (metric.value / 1000).toFixed(1) : metric.value.toFixed(0)} ${metric.key === 'visibility' ? 'km' : metric.unit}`}</strong><small>{metric.detail}</small></div>)}</div>
      {result.lowCloud !== null && <div className="integrated-extra"><span>{labels.cloud}</span><strong>{result.lowCloud.toFixed(0)}%</strong></div>}
      <div className="integrated-warning"><AlertTriangle size={16}/><div>{labels.note}<br/>{labels.dust}</div></div>
    </>}
  </section>
}
