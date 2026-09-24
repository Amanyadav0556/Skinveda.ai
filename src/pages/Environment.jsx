import { useApp } from '../App';
import { ENV_DATA } from '../data/mockData';
import { Icon, PageHeader, Meter, BarChart } from '../components/ui';

const AQI_LEVELS = [
  { max: 50,  label: 'Good',        tone: 'good', advice: 'Air quality is good. Safe for outdoor activities.' },
  { max: 100, label: 'Moderate',    tone: 'warn', advice: 'Acceptable for most. Sensitive skin may react to prolonged exposure.' },
  { max: 150, label: 'Unhealthy for sensitive groups', tone: 'bad', advice: 'Eczema and dermatitis-prone skin should limit time outdoors.' },
  { max: Infinity, label: 'Unhealthy', tone: 'bad', advice: 'Everyone may be affected. Stay indoors where possible.' },
];
const UV_LEVELS = [
  { max: 2, label: 'Low', tone: 'good' }, { max: 5, label: 'Moderate', tone: 'warn' },
  { max: 7, label: 'High', tone: 'bad' }, { max: 10, label: 'Very high', tone: 'bad' }, { max: Infinity, label: 'Extreme', tone: 'bad' },
];

const getSkinRisk = (env) => {
  let score = 0;
  if (env.uvIndex > 8) score += 3; else if (env.uvIndex > 5) score += 2; else score += 1;
  if (env.humidity < 40) score += 2; else if (env.humidity < 55) score += 1;
  if (env.aqi > 150) score += 3; else if (env.aqi > 100) score += 2; else score += 1;
  if (env.temperature > 32 || env.temperature < 5) score += 2;
  return Math.min(10, score);
};

const CONDITION_TIPS = {
  'Vitiligo':           'UV can worsen depigmentation. Apply mineral SPF 50 every 2 hours and cover patches outdoors.',
  'Eczema':             'Borderline humidity can dry the barrier. Moisturise more often today and after every wash.',
  'Psoriasis':          'Dry, hot air can worsen plaques. Short, protected sun exposure only — and a humidifier indoors.',
  'Acne Vulgaris':      'Heat and humidity raise sebum. Cleanse gently twice and use a lightweight, oil-free moisturiser.',
  'Contact Dermatitis': 'Pollutants can irritate reactive skin. Cleanse after being outdoors and wear protective clothing.',
};

// Semicircle gauge (0–10)
function Gauge({ value, tone }) {
  const r = 70, c = Math.PI * r;
  const col = { good: 'var(--good)', warn: '#D39A2A', bad: 'var(--bad)' }[tone];
  return (
    <div className="gauge" role="img" aria-label={`Skin risk ${value} of 10`}>
      <svg viewBox="0 0 170 95" width="170" height="95">
        <path d="M15 85 A70 70 0 0 1 155 85" fill="none" stroke="var(--track)" strokeWidth="12" strokeLinecap="round" />
        <path d="M15 85 A70 70 0 0 1 155 85" fill="none" stroke={col} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 10)} style={{ transition: 'stroke-dashoffset 1s' }} />
      </svg>
      <div className="gauge-num"><b>{value}</b><span className="muted" style={{ fontSize: 12 }}>of 10</span></div>
    </div>
  );
}

export default function Environment() {
  const { user } = useApp();
  const env = ENV_DATA.current;
  const risk = getSkinRisk(env);
  const riskTone = risk <= 3 ? 'good' : risk <= 6 ? 'warn' : 'bad';
  const riskLabel = risk <= 3 ? 'Low' : risk <= 6 ? 'Moderate' : risk <= 8 ? 'High' : 'Severe';
  const aqi = AQI_LEVELS.find(l => env.aqi <= l.max);
  const uv = UV_LEVELS.find(l => env.uvIndex <= l.max);
  const tip = CONDITION_TIPS[user?.skinCondition];

  const factors = [
    { icon: 'sun',    label: 'UV index',    value: env.uvIndex, unit: '',   pct: (env.uvIndex / 11) * 100, status: uv.label, tone: uv.tone },
    { icon: 'wind',   label: 'Air quality', value: env.aqi,     unit: ' AQI', pct: Math.min(100, (env.aqi / 200) * 100), status: aqi.label.split(' ')[0], tone: aqi.tone },
    { icon: 'drop',   label: 'Humidity',    value: env.humidity, unit: '%', pct: env.humidity, status: env.humidity < 40 ? 'Dry' : env.humidity > 70 ? 'Humid' : 'Comfortable', tone: env.humidity < 40 || env.humidity > 75 ? 'warn' : 'good' },
    { icon: 'thermo', label: 'Feels like',  value: env.feelsLike, unit: '°', pct: Math.min(100, (env.feelsLike / 45) * 100), status: env.feelsLike > 35 ? 'Hot' : 'Mild', tone: env.feelsLike > 35 ? 'warn' : 'good' },
  ];
  const statusIcon = { good: 'check', warn: 'alert', bad: 'alert' };

  return (
    <>
      <PageHeader eyebrow="Environment" title={<>Today’s skin <em>forecast</em></>}
        subtitle={`Live conditions for ${env.city} and what they mean for your skin${user?.skinCondition ? ` with ${user.skinCondition.toLowerCase()}` : ''}.`} />

      <div className="grid g-main">
        <div className="card card-tint env-hero">
          <div>
            <span className="mono muted"><Icon name="globe" size={12} /> {env.city}, {env.country} · {env.weather}</span>
            <div className="env-temp mt-8">{env.temperature}<sup>°C</sup></div>
            <p className="ink2 mt-8">Feels like {env.feelsLike}° · Wind {env.windSpeed} km/h · Visibility {env.visibility} km</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Gauge value={risk} tone={riskTone} />
            <span className={`pill pill-${riskTone}`} style={{ marginTop: 6 }}><Icon name={statusIcon[riskTone]} size={12} /> {riskLabel} skin risk</span>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>For your skin today</h3></div>
          {tip
            ? <div className="callout callout-info"><Icon name="target" size={18} /><div><strong>{user.skinCondition}</strong>{tip}</div></div>
            : <div className="callout callout-info"><Icon name="info" size={18} /><div><strong>Personalise this</strong>Add your main concern in Profile for tailored advice.</div></div>}
          <ul className="tip-bullets mt-16" style={{ display: 'grid', gap: 8 }}>
            {['SPF 50 before 10 AM, reapply every 2 hours', 'Cleanse after time outdoors', 'Drink water through the afternoon heat'].map(t => (
              <li key={t} className="row" style={{ alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'var(--text-2)' }}><Icon name="check" size={15} stroke={2.4} style={{ color: 'var(--primary)', marginTop: 3, flex: 'none' }} />{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid g-4 section-gap">
        {factors.map(f => (
          <div key={f.label} className="card stat">
            <div className="row-between"><span className="stat-icon" style={{ marginBottom: 0 }}><Icon name={f.icon} size={18} /></span><span className={`pill pill-${f.tone}`}><Icon name={statusIcon[f.tone]} size={12} /> {f.status}</span></div>
            <span className="stat-label mt-16">{f.label}</span>
            <span className="stat-value">{f.value}<small>{f.unit}</small></span>
            <Meter value={f.pct} tone={f.tone} thin />
          </div>
        ))}
      </div>

      <div className="grid g-main section-gap">
        <div className="card">
          <div className="card-head"><div><h3>7-day forecast</h3><p className="card-sub">High temperature and UV</p></div></div>
          <div className="forecast">
            {ENV_DATA.forecast.map((f, i) => (
              <div key={f.day} className={i === 0 ? 'today' : ''}>
                <span className="mono" style={{ opacity: .8 }}>{i === 0 ? 'Today' : f.day}</span>
                <span style={{ fontSize: 22 }} aria-hidden="true">{f.icon}</span>
                <b>{f.high}°</b>
                <span className="muted" style={{ fontSize: 12 }}>{f.low}° · UV {f.uv}</span>
              </div>
            ))}
          </div>
          <div className="mt-24">
            <span className="mono muted">Humidity outlook</span>
            <div className="mt-8"><BarChart bars={ENV_DATA.forecast.map((f, i) => ({ label: f.day, value: f.humidity, highlight: i === 0 }))} height={110} max={100} format={v => `${v}%`} /></div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Active alerts</h3><span className="pill pill-mono">{ENV_DATA.alerts.length}</span></div>
          <div className="stack" style={{ gap: 10 }}>
            {ENV_DATA.alerts.map(a => {
              const cls = a.type === 'error' ? 'callout-bad' : a.type === 'warning' ? 'callout-warn' : 'callout-info';
              return (
                <div key={a.title} className={`callout ${cls}`}>
                  <Icon name={a.type === 'info' ? 'info' : 'alert'} size={18} />
                  <div><strong>{a.title}</strong>{a.message}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
