import React from 'react';
import DashboardHero from './DashboardHero';
import AlertsPanel from './AlertsPanel';

const Dashboard = () => {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <DashboardHero />
      <div style={{ 
        padding: '0 40px',
        marginTop: '-100px',
        marginBottom: '40px',
        zIndex: 10,
        flex: 1
      }}>
        <AlertsPanel />
      </div>
    </div>
  );
};

export default Dashboard;