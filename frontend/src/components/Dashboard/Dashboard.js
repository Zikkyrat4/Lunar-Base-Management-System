import React from 'react';
import DashboardHero from './DashboardHero';
import AlertsPanel from './AlertsPanel';
import { useWindowSize } from './useWindowSize';

const Dashboard = () => {
  const [width] = useWindowSize();
  const isMobile = width < 768;

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      <DashboardHero />
      
      <div style={{
        padding: isMobile ? '0 20px 30px' : '0 40px 60px',
        zIndex: 10,
        flex: 1,
        position: 'relative'
      }}>
        <AlertsPanel />
      </div>
    </div>
  );
};

export default Dashboard;