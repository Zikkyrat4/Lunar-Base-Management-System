// src/components/Shared/Navbar.js
import React from 'react';
import { Menu, Space } from 'antd';
import { Link } from 'react-router-dom';
import '../../styles/main.css';

const Navbar = () => {
  const items = [
    { key: 'dashboard', label: <Link to="/">Главная</Link> },
    { key: 'map', label: <Link to="/map">Карта</Link> },
    { key: 'logistics', label: <Link to="/logistics">Логистика</Link> },
    { key: 'analytics', label: <Link to="/analytics">Аналитика</Link> },
    { key: 'profile', label: <Link to="/profile">Профиль</Link> }
  ];

  return (
    <div className="navbar-container">
      <Menu 
        theme="dark"
        mode="horizontal" 
        items={items} 
        className="custom-navbar"
      />
    </div>
  );
};

export default Navbar;