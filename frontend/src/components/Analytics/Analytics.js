// src/components/Analytics/Analytics.js
import React from 'react';
import { Card, Typography } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const { Title } = Typography;

const data = [
  { name: 'Энергия', value: 78 },
  { name: 'Вода', value: 56 },
  { name: 'Кислород', value: 89 },
];

const Analytics = () => {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Аналитика базы</Title>
      <Card>
        <BarChart width={500} height={300} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#1890ff" />
        </BarChart>
      </Card>
    </div>
  );
};

export default Analytics;