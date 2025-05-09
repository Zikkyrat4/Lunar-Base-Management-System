// src/components/Shared/Footer.js
import React from 'react';
import { Typography } from 'antd';
import '../../styles/main.css';

const { Text } = Typography;

const Footer = () => {
  return (
    <footer className="custom-footer">
      <Text className="footer-text">
        Лунная база ©2025 Sherlock Team
      </Text>
    </footer>
  );
};

export default Footer;