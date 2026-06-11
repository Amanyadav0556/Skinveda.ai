import { useState } from 'react';
import { useApp } from '../App';
import { ENV_DATA } from '../data/mockData';

const AQI_LEVELS = [
  { max: 50, label: 'Good', color: '#22c55e', advice: 'Air quality is good. Safe for outdoor activities.' },
  { max: 100, label: 'Moderate', color: '#f59e0b', advice: 'Acceptable for most. Sensitive individuals may experience minor effects.' },
  { max: 150, label: 'Unhealthy (Sensitive)', color: '#f97316', advice: 'Sensitive groups (eczema, dermatitis) should limit prolonged outdoor exposure.' },
  { max: 200, label: 'Unhealthy', color: '#ef4444', advice: 'Everyone may experience adverse effects. Stay indoors.' },
];

const UV_LEVELS = [
  { max: 2, label: 'Low', color: '#22c55e', icon: '🌤️' },
  { max: 5, label: 'Moderate', color: '#f59e0b', icon: '☀️' },
  { max: 7, label: 'High', color: '#f97316', icon: '🔆' },
  { max: 10, label: 'Very High', color: '#ef4444', icon: '☀️' },
  { max: Infinity, label: 'Extreme', color: '#7c3aed', icon: '🌟' },
];

const getSkinRisk = (env) => {
  let score = 0;
  if (env.uvIndex > 8) score += 3;
  else if (env.uvIndex > 5) score += 2;
  else score += 1;
  if (env.humidity < 40) score += 2;
  else if (env.humidity < 55) score += 1;
  if (env.aqi > 150) score += 3;
  else if (env.aqi > 100) score += 2;
  else score += 1;
  if (env.temperature > 32 || env.temperature < 5) score += 2;
  return Math.min(10, score);
};

export default function Environment() {
  const { user } = useApp();
  const env = ENV_DATA.current;
  const forecast = ENV_DATA.forecast;
  const alerts = ENV_DATA.alerts;

  const skinRisk = getSkinRisk(env);
  const aqiLevel = AQI_LEVELS.find(l => env.aqi <= l.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
  const uvLevel = UV_LEVELS.find(l => env.uvIndex <= l.max) || UV_LEVELS[UV_LEVELS.length - 1];
  const riskClass = skinRisk <= 3 ? 'risk-low' : skinRisk <= 6 ? 'risk-moderate' : skinRisk <= 8 ? 'risk-high' : 'risk-severe';
  const riskColor = skinRisk <= 3 ? '#22c55e' : skinRisk <= 6 ? '#f59e0b' : skinRisk <= 8 ? '#f97316' : '#ef4444';

  const condition = user?.skinCondition;
  const conditionAlerts = {
    'Vitiligo': { icon: '⚪', tip: 'UV exposure can worsen vitiligo depigmentation. UV Index today: ' + env.uvIndex + ' — apply SPF 50+ every 2 hours.' },
    'Eczema': { icon: '🔴', tip: 'Low humidity (' + env.humidity + '%) can dry out skin and trigger eczema flares. Moisturize frequently today.' },
    'Psoriasis': { icon: '🟠', tip: 'Dry weather and temperature changes can worsen psoriasis. Consider a humidifier indoors.' },
    'Acne Vulgaris': { icon: '🟡', tip: 'High temperature and humidity can increase sebum production. Cleanse face gently twice today.' },
    'Contact Dermatitis': { icon: '🟤', tip: 'AQI of ' + env.aqi + ' may contain irritants. Avoid prolonged outdoor exposure and wear protective clothing.' },
  };
  const conditionAlert = condition && conditionAlerts[condition];

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">🌍 Environmental Monitoring</h1>
          <p className="page-subtitle">Real-time weather, UV, and air quality data with personalized skin risk assessment.</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>
          <div>📍 {env.city}, {env.country}</div>
          <div>{new Date().toLocaleString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      {/* Personalized Alert */}
      {conditionAlert && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <span className="alert-icon">{conditionAlert.icon}</span>
          <div>
            <strong>{condition} Alert:</strong> {conditionAlert.tip}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, marginBottom: 24 }}>
        {/* Weather & Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Current Weather */}
          <div className="card" style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(0,217,166,0.08))', borderColor: 'rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justify: 'space-between', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <span style={{ fontSize: 72 }}>{env.weatherIcon}</span>
                <div>
                  <div style={{ fontSize: 56, fontWeight: 900, lineHeight: 1 }}>{env.temperature}°C</div>
                  <div style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 4 }}>{env.weather}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Feels like {env.feelsLike}°C</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginLeft: 'auto' }}>
                {[
                  { label: 'Humidity', value: `${env.humidity}%`, icon: '💧', color: env.humidity < 40 ? '#ef4444' : env.humidity < 55 ? '#f59e0b' : '#22c55e' },
                  { label: 'Wind', value: `${env.windSpeed} km/h`, icon: '💨', color: 'var(--text-primary)' },
                  { label: 'Visibility', value: `${env.visibility} km`, icon: '👁', color: 'var(--text-primary)' },
                  { label: 'Pressure', value: `${env.pressure} hPa`, icon: '📊', color: 'var(--text-primary)' },
                ].map((m, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 20 }}>{m.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: m.color, margin: '4px 0 2px' }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid-4 animate-slide-up delay-1">
            {/* UV */}
            <div className="env-card" style={{ borderColor: `${uvLevel.color}30`, background: `${uvLevel.color}08` }}>
              <div className="env-icon">{uvLevel.icon}</div>
              <div className="env-value" style={{ color: uvLevel.color }}>{env.uvIndex}</div>
              <div className="env-label">UV Index</div>
              <div style={{ marginTop: 8 }}><span className="badge" style={{ background: `${uvLevel.color}15`, color: uvLevel.color, borderColor: `${uvLevel.color}30`, fontSize: 10 }}>{uvLevel.label}</span></div>
            </div>

            {/* AQI */}
            <div className="env-card" style={{ borderColor: `${aqiLevel.color}30`, background: `${aqiLevel.color}08` }}>
              <div className="env-icon">🌫️</div>
              <div className="env-value" style={{ color: aqiLevel.color }}>{env.aqi}</div>
              <div className="env-label">Air Quality (AQI)</div>
              <div style={{ marginTop: 8 }}><span className="badge" style={{ background: `${aqiLevel.color}15`, color: aqiLevel.color, borderColor: `${aqiLevel.color}30`, fontSize: 10 }}>{aqiLevel.label}</span></div>
            </div>

            {/* Humidity */}
            <div className="env-card">
              <div className="env-icon">💧</div>
              <div className="env-value" style={{ color: env.humidity < 40 ? '#ef4444' : env.humidity < 55 ? '#f59e0b' : '#22c55e' }}>{env.humidity}%</div>
              <div className="env-label">Humidity</div>
              <div style={{ marginTop: 8, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${env.humidity}%`, background: env.humidity < 40 ? '#ef4444' : '#22c55e', borderRadius: 2 }} />
              </div>
            </div>

            {/* Temperature */}
            <div className="env-card">
              <div className="env-icon">🌡️</div>
              <div className="env-value" style={{ color: env.temperature > 35 ? '#ef4444' : env.temperature < 10 ? '#3b82f6' : '#22c55e' }}>{env.temperature}°</div>
              <div className="env-label">Temperature</div>
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>{env.temperature > 35 ? 'Very Hot' : env.temperature > 28 ? 'Warm' : env.temperature > 15 ? 'Mild' : 'Cold'}</div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="card animate-slide-up delay-2">
            <div className="section-title" style={{ marginBottom: 16 }}>📅 7-Day Forecast & Skin Risk</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
              {forecast.map((day, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '14px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>{day.day}</div>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{day.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{day.high}°</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{day.low}°</div>
                  <div style={{ fontSize: 10, color: day.uv >= 8 ? '#ef4444' : day.uv >= 5 ? '#f59e0b' : '#22c55e', fontWeight: 700 }}>UV {day.uv}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Risk Score & Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Skin Risk Score */}
          <div className="card" style={{ textAlign: 'center', background: `${riskColor}08`, borderColor: `${riskColor}25` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Daily Skin Risk Score</div>
            <div className={`risk-score-circle ${riskClass}`} style={{ margin: '0 auto 16px', borderColor: riskColor }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: riskColor, lineHeight: 1 }}>{skinRisk}</div>
              <div style={{ fontSize: 10, color: riskColor, fontWeight: 700, marginTop: 4 }}>/10</div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: riskColor, marginBottom: 8 }}>
              {skinRisk <= 3 ? '✅ Low Risk' : skinRisk <= 6 ? '⚠️ Moderate Risk' : skinRisk <= 8 ? '🔶 High Risk' : '🚨 Severe Risk'}
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {skinRisk <= 3 ? 'Good conditions for skin health today. Enjoy outdoor activities with normal precautions.'
                : skinRisk <= 6 ? 'Moderate risk. Apply sunscreen, stay hydrated, and moisturize regularly.'
                  : skinRisk <= 8 ? 'High risk today. Limit sun exposure, use SPF 50+, and keep skin moisturized.'
                    : 'Severe risk conditions. Stay indoors as much as possible. Wear protective clothing if going out.'}
            </p>
          </div>

          {/* Smart Alerts */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>⚡ Smart Skin Alerts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.map((alert, i) => (
                <div key={i} className={`alert alert-${alert.type}`} style={{ flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>{alert.icon}</span>
                    <strong style={{ fontSize: 12 }}>{alert.title}</strong>
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{alert.message}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AQI Breakdown */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 14 }}>🌫️ Air Quality Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'PM2.5', value: 45, max: 150 },
                { label: 'PM10', value: 72, max: 250 },
                { label: 'NO₂', value: 28, max: 200 },
                { label: 'O₃', value: 55, max: 180 },
              ].map((p, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{p.label}</span>
                    <span style={{ fontWeight: 700 }}>{p.value} μg/m³</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(p.value / p.max) * 100}%`, background: p.value / p.max > 0.6 ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'var(--gradient-primary)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AQI Scale Info */}
      <div className="card animate-slide-up">
        <div className="section-title" style={{ marginBottom: 14 }}>🌡️ AQI Scale & Skin Health Impact</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {AQI_LEVELS.map((l, i) => (
            <div key={i} style={{ padding: '14px', borderRadius: 10, background: `${l.color}08`, border: `1px solid ${l.color}25` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: l.color, marginBottom: 4 }}>{l.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>{l.advice}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
