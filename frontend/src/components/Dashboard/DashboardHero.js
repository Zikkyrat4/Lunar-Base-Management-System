import React from 'react';
import { Typography, Button, Row, Col, Card } from 'antd';
import '../../styles/DashboardHero.css';

const { Title, Text } = Typography;

const DashboardHero = () => {
  return (
    <div className="dashboard-hero">
      <div className="moon-background">
        <img src="/images/moon.png" alt="Moon" className="moon-image" />
      </div>
      
      <div className="dashboard-content">
        <Title level={1} className="dashboard-title">
          ЛУННАЯ БАЗА "ШЕРЛОК"
        </Title>
        <Text className="dashboard-subtitle">
          Мониторинг и управление лунной станцией
        </Text>
        
        <div className="metrics-grid">
          <Card className="metric-card">
            <div className="metric-value">85%</div>
            <div className="metric-label">ЭНЕРГИЯ</div>
          </Card>
          
          <Card className="metric-card">
            <div className="metric-value">72%</div>
            <div className="metric-label">КИСЛОРОД</div>
          </Card>
          
          <Card className="metric-card">
            <div className="metric-value">63%</div>
            <div className="metric-label">ВОДА</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;