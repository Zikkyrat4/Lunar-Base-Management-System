// src/components/Dashboard/ResourceCard.js
import React from 'react';
import { Card, Progress, Typography } from 'antd';
import Icon from '@ant-design/icons';

// SVG-иконки в виде React-компонентов
const EnergyIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="#faad14">
    <path d="M6 13v-2h8l-3.5-3.5 1.42-1.42L17.84 12l-5.92 5.92-1.42-1.42L14 13H6z"/>
  </svg>
);

const WaterIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="#1890ff">
    <path d="M12 3L4 12l8 9 8-9-8-9zm0 15.5L5.5 12 12 5.5 18.5 12 12 18.5z"/>
  </svg>
);

const iconMap = {
  energy: <Icon component={EnergyIcon} style={{ fontSize: 24 }} />,
  water: <Icon component={WaterIcon} style={{ fontSize: 24 }} />,
  oxygen: <span style={{ fontSize: 24, color: '#13c2c2' }}>O₂</span>,
  food: <span style={{ fontSize: 24, color: '#52c41a' }}>🍏</span>
};

const { Text } = Typography;

const ResourceCard = ({ title, value, max, unit }) => {
  const percent = Math.round((value / max) * 100);
  const status = percent < 20 ? 'exception' : percent < 50 ? 'normal' : 'success';

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        {iconMap[title.toLowerCase()] || iconMap.energy}
        <Text strong style={{ marginLeft: 8, fontSize: 16 }}>
          {title}
        </Text>
      </div>
      <Progress
        percent={percent}
        status={status}
        strokeColor={status === 'exception' ? '#ff4d4f' : undefined}
      />
      <Text style={{ display: 'block', marginTop: 8 }}>
        {value} / {max} {unit}
      </Text>
    </Card>
  );
};

export default ResourceCard;