import React from 'react';

const PROGRESS_COLORS = {
  energy: {
    main: '#B8A1FF',
    gradient: ['#885ECD', '#C06CEE']
  },
  consumption: {
    main: '#FFD166',
    gradient: ['#FFC171', '#FF8A45']
  },
  water: {
    main: '#6CD3FF',
    gradient: ['#5E95CD', '#6CD3FF']
  },
  oxygen: {
    main: '#8A7CFF',
    gradient: ['#5E65CD', '#8A7CFF']
  }
};

const CircularProgress = ({ 
  value = 75,
  max = 100,
  title = '',
  type = 'energy',
  style = {} // Добавлен пропс для кастомных стилей
}) => {
  const radius = 100;
  const size = 250;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), max);
  const strokeDashoffset = circumference - (progress / max) * circumference;
  const color = PROGRESS_COLORS[type] || PROGRESS_COLORS.energy;
  const percentage = Math.round((value / max) * 100);

  const lines = typeof title === 'string' 
    ? title.split('\n').map(line => line.trim())
    : [title];

  return (
    <div style={{ 
      position: 'relative',
      flex: '0 0 auto',
      margin: '0',
      transition: 'all 0.3s ease',
      padding: '0 0',
      ...style // Применяем кастомные стили
    }}>
      <svg 
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        style={{
          width: '250px',
          height: '250px'
        }}
      >
        <defs>
          <linearGradient 
            id={`gradient-${type}`} 
            x1="0%" 
            y1="0%" 
            x2="100%" 
            y2="0%"
          >
            <stop offset="0%" stopColor={color.gradient[0]} />
            <stop offset="100%" stopColor={color.gradient[1]} />
          </linearGradient>
        </defs>
        
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth="20"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
        />
        
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth="19"
          fill="none"
          strokeLinecap="round"
          stroke={`url(#gradient-${type})`}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${center} ${center})`}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        
        <g style={{ 
          fill: 'white',
          fontFamily: '"Orbitron", sans-serif',
          textAnchor: 'middle',
          dominantBaseline: 'central'
        }}>
          <text 
            x={center}
            y={center - 10}
            style={{
              fontSize: '40px',
              fontWeight: '700',
              fill: color.main,
              opacity: 0.95,
              textShadow: `0 0 6px ${color.main}`
            }}
          >
            {percentage}%
          </text>
          
          {lines.map((line, index) => (
            <text
              key={index}
              x={center}
              y={center + 25 + index * 20}
              style={{
                fontSize: '18px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                opacity: '0.85',
                fill: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              {line}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
};

export { CircularProgress};