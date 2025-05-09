// AnalyticsPanel.jsx
import React from 'react';
import './AnalyticsPanel.css';
import {
  FiZap,
  FiDroplet,
  FiCheckCircle,
  FiCloudRain,
  FiSun,
  FiAlertTriangle,
} from 'react-icons/fi';

// Данные с уникальными идентификаторами для ключей
const metricData = [
  { id: 'performance', label: 'Производительность', value: 65, unit: '%', type: 'bar' },
  { id: 'energy', label: 'Потребление энергии', value: 120, unit: 'кВт/ч', icon: <FiZap /> },
  { id: 'water', label: 'Потребление воды', value: 55, unit: '%', icon: <FiDroplet /> },
  { id: 'tasks', label: 'Задач выполнено', value: '5/10', icon: <FiCheckCircle /> },
];

const forecastData = [
  { id: 'sat', temperature: '52°C', date: 'Сб, 1 Марта', icon: <FiCloudRain /> },
  { id: 'sun', temperature: '58°C', date: 'Вс, 2 Марта', icon: <FiAlertTriangle /> },
  { id: 'mon', temperature: '63°C', date: 'Пн, 3 Марта', icon: <FiCloudRain /> },
  { id: 'tue', temperature: '49°C', date: 'Вт, 4 Марта', icon: <FiSun /> },
];

/**
 * Вспомогательная функция для обработки значений
 * @param {string|number} value - Значение метрики
 * @returns {{isNumeric: boolean, numericValue: number, displayValue: string, maxValue: number}}
 */
const processMetricValue = (value) => {
  const isNumeric = typeof value === 'number' || /^[\d.]+/.test(value);
  const numericValue = isNumeric ? parseFloat(value) : 0;
  const [displayValue, maxValue = 10] = isNumeric 
    ? [value, 100] 
    : value.split('/').map(Number);
  
  return { isNumeric, numericValue, displayValue, maxValue };
};

function MetricCard({ label, value, unit, type, icon }) {
  const { numericValue, displayValue, maxValue } = processMetricValue(value);
  const progressWidth = Math.min((numericValue / maxValue) * 100, 100);

  return (
    <div 
      className="metric" 
      tabIndex="-1"
      aria-roledescription="метрика"
      aria-label={`${label}: ${displayValue}${unit ? ` ${unit}` : ''}`}
    >
      <div className="metric-content">
        <div className="metric-info">
          <span className="metric-label">{label}</span>
          <span className="metric-value">
            {displayValue}
            {unit && <span className="metric-unit" aria-hidden="true"> {unit}</span>}
          </span>
          
          {type === 'bar' && (
            <div 
              className="bar"
              role="progressbar"
              aria-valuenow={numericValue}
              aria-valuemin="0"
              aria-valuemax={maxValue}
              aria-label={`${label}: ${numericValue} из ${maxValue}`}
            >
              <div 
                className="bar-fill"
                style={{ width: `${progressWidth}%` }}
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        
        {icon && (
          <div className="metric-icon" aria-hidden="true">
            {React.cloneElement(icon, { 
              'aria-hidden': true,
              focusable: false 
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ForecastCard({ temperature, date, icon }) {
  // Разделение температуры на значение и единицу
  const [tempValue, tempUnit] = temperature.split(/(?=\D+$)/);
  
  return (
    <div 
      className="forecast-card"
      tabIndex="-1"
      aria-roledescription="прогноз погоды"
      aria-label={`Прогноз на ${date}: ${temperature}`}
    >
      <div className="forecast-temp">
        <strong>{tempValue}</strong>
        <span className="forecast-unit" aria-hidden="true">{tempUnit}</span>
      </div>
      <div className="forecast-date">{date}</div>
      <div className="forecast-icon" aria-hidden="true">
        {React.cloneElement(icon, { 
          'aria-hidden': true,
          focusable: false 
        })}
      </div>
    </div>
  );
}

export default function AnalyticsPanel() {
  return (
    <section 
      className="analytics-panel" 
      aria-labelledby="analytics-heading"
      tabIndex="-1"
    >
      <h2 id="analytics-heading">Аналитика</h2>

      <div 
        className="metrics-grid" 
        role="group" 
        aria-label="Метрики производительности"
      >
        {metricData.map(metric => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </div>

      <h3 id="forecast-heading">Прогноз на 4 дня</h3>
      <div 
        className="forecast-grid" 
        role="group" 
        aria-labelledby="forecast-heading"
      >
        {forecastData.map(day => (
          <ForecastCard key={day.id} {...day} />
        ))}
      </div>
    </section>
  );
}