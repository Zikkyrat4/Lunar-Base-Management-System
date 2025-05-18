import React from 'react';
import DashboardHero from './DashboardHero';
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
      overflowX: 'hidden',
      marginTop: isMobile ? '-40px' : '-60px',
    }}>
      <DashboardHero />

    </div>
  );
};

export default Dashboard;