// src/App.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMediaQuery } from 'react-responsive';
import Layout from './components/Shared/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import MapView from './components/Map/MapView';
import MobileMapView from './components/Map/MobileMapView';
import Logistics from './components/Logistics/Logistics';
import Analytics from './components/Analytics/Analytics';
import Profile from './components/Profile/Profile';
import Login from './components/Shared/Login';
import ProtectedRoute from './components/Shared/ProtectedRoute';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const { isAuthenticated } = useSelector(state => state.auth);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isAuthenticated === false && <Login />}
      {isAuthenticated === true && (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route 
              path="/map" 
              element={
                <ProtectedRoute>
                  {isMobile ? <MobileMapView /> : <MapView />}
                </ProtectedRoute>
              } 
            />
            <Route path="/logistics" element={<ProtectedRoute><Logistics /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          </Route>
        </Routes>
      )}
    </ThemeProvider>
  );
}

export default App;