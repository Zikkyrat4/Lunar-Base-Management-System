// src/App.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMediaQuery } from 'react-responsive';
import Navbar from './components/Shared/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import MapView from './components/Map/MapView';
import MobileMapView from './components/Map/MobileMapView';
import Analytics from './components/Analytics/Analytics';
import Profile from './components/Profile/Profile';
import Login from './components/Shared/Login';
import ProtectedRoute from './components/Shared/ProtectedRoute';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0a0412',
      paper: '#1a0b2e',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0412',
        },
        '#root': {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      },
    },
  },
});

function App() {
  const { isAuthenticated } = useSelector(state => state.auth);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {isAuthenticated === false && <Login />}
        {isAuthenticated === true && (
          <>
            <Navbar />
            <main style={{
              flex: 1,
              padding: '20px',
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto',
              boxSizing: 'border-box'
            }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route 
                  path="/map" 
                  element={
                    <ProtectedRoute>
                      {isMobile ? <MobileMapView /> : <MapView />}
                    </ProtectedRoute>
                  } 
                />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;