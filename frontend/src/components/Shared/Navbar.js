import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AlertsPanel from '../Dashboard/AlertsPanel';
import { BellOutlined } from '@ant-design/icons';
import './Navbar.css';

const Navbar = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    setActiveItem(path);
    setIsMenuOpen(false);
  }, [location]);

  const menuItems = [
    { key: 'dashboard', label: 'Статистика', to: '/' },
    { key: 'map', label: 'Карта', to: '/map' },
    { key: 'analytics', label: 'Аналитика', to: '/analytics' },
    { key: 'profile', label: 'Профиль', to: '/profile' }
  ];

  const handleOverlayClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="custom-navbar">
      <div className="navbar-wrapper">

        {/* Бургер-меню */}
        <button
          className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Мобильное меню */}
        {isMenuOpen && <div className="menu-overlay" onClick={handleOverlayClick}></div>}
        
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          {menuItems.map(item => (
            <Link
              key={item.key}
              to={item.to}
              className={`nav-item ${activeItem === item.key ? 'active' : ''}`}
              onClick={() => {
                setActiveItem(item.key);
                setIsMenuOpen(false);
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Десктопное меню */}
        <div className="desktop-menu">
          {menuItems.map(item => (
            <Link
              key={item.key}
              to={item.to}
              className={`nav-item ${activeItem === item.key ? 'active' : ''}`}
              onClick={() => setActiveItem(item.key)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Иконка уведомлений */}
        <div className="notification-icon" onClick={() => setShowAlerts(!showAlerts)}>
          <BellOutlined 
            style={{ fontSize: '20px', color: '#fff' }} 
          />
          
          {/* Панель уведомлений */}
          {showAlerts && (
            <div className="alerts-dropdown">
              <AlertsPanel />
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;