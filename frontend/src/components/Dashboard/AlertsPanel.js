import React from 'react';
import { Alert, Card, Space, Typography } from 'antd';
import { WarningOutlined, InfoOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AlertsPanel = () => {
  const alerts = [
    {
      type: 'warning',
      message: 'Низкий уровень кислорода (30%)',
      icon: <WarningOutlined />
    },
    {
      type: 'info',
      message: 'Запланировано техническое обслуживание',
      icon: <InfoOutlined />
    }
  ];

  return (
    <Card 
      title={<Title level={4} style={{ color: 'white', margin: 0 }}>ПРЕДУПРЕЖДЕНИЯ СИСТЕМЫ</Title>}
      style={{ 
        background: 'rgba(20, 10, 40, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {alerts.map((alert, index) => (
          <Alert
            key={index}
            message={alert.message}
            type={alert.type}
            icon={alert.icon}
            showIcon
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          />
        ))}
      </Space>
    </Card>
  );
};

export default AlertsPanel;