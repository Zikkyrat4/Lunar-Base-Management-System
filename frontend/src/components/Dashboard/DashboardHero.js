import React from 'react';
import { Typography } from 'antd';
import { CircularProgress } from './CircularProgress';
import { useWindowSize } from './useWindowSize';

const { Title, Text } = Typography;

const DashboardHero = () => {
  const [width] = useWindowSize();
  const isMobile = width < 768;

  return (
    <div style={{
      position: 'relative',
      minHeight: '100dvh',
      width: '100%',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      fontFamily: '"Orbitron", sans-serif',
      zIndex: 1,
      paddingTop: isMobile ? '40px' : '0' // Замена отрицательного margin
    }}>
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1200px',
        padding: '0',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
         <Title level={1} style={{
          color: 'white',
          fontSize: isMobile ? '2rem' : '4rem',
          marginBottom: isMobile ? '0.5rem' : '1rem',
          textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
          letterSpacing: '2px',
          background: 'linear-gradient(90deg, #fff, #B8A1FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          position: 'relative'
        }}>
          ЛУННАЯ БАЗА "ШЕРЛОК"
        </Title>
        
        <Text style={{
          fontSize: isMobile ? '1rem' : '1.5rem',
          marginBottom: isMobile ? '1.5rem' : '3rem',
          maxWidth: '700px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(200,180,255,0.8))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          padding: '0 10px',
          textShadow: '0 0 8px rgba(184, 161, 255, 0.5)'
        }}>
          Реактивные системы мониторинга и управления станцией нового поколения
        </Text>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          gap: isMobile ? '15px' : '40px',
          margin: '60px 0',
          position: 'relative',
          alignItems: 'flex-end',
          perspective: '1000px'
        }}>
          {/* Прогресс-бары с адаптивными отступами */}
          <ProgressBar 
            value={85} 
            title={"ГЕНЕРАЦИЯ\nЭНЕРГИИ"} 
            type="energy" 
            marginBottom={isMobile ? '20px' : '0'} 
            brightness="0.9"
            hoverZ="translateZ(-10px)"
          />
          
          <ProgressBar 
            value={65} 
            title={"ПОТРЕБЛЕНИЕ\nЭНЕРГИИ"} 
            type="consumption" 
            marginBottom={isMobile ? '20px' : '70px'} 
            brightness="1.1"
            hoverZ="translateZ(20px)"
          />
          
          <ProgressBar 
            value={70} 
            title={"ЗАПАСЫ\nВОДЫ"} 
            type="water" 
            marginBottom={isMobile ? '20px' : '70px'} 
            brightness="1.1"
            hoverZ="translateZ(20px)"
          />
          
          <ProgressBar 
            value={30} 
            title={"УРОВЕНЬ\nКИСЛОРОДА"} 
            type="oxygen" 
            marginBottom={isMobile ? '20px' : '0'} 
            brightness="0.9"
            hoverZ="translateZ(-10px)"
          />
        </div>
      </div>
    </div>
  );
};

// Компонент для прогресс-бара (выносим повторяющуюся логику)
const ProgressBar = ({ value, title, type, marginBottom, brightness, hoverZ }) => (
  <div style={{ 
    marginBottom,
    transform: 'translateZ(-20px)',
    transition: 'all 0.5s ease',
    ':hover': {
      transform: hoverZ
    }
  }}>
    <CircularProgress 
      value={value} 
      title={title} 
      type={type}
      style={{ filter: `brightness(${brightness})` }}
    />
  </div>
);

export default DashboardHero;