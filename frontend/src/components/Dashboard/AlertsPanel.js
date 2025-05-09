import React from 'react';
import { Alert, Card, Space, Typography } from 'antd';
import { WarningOutlined, InfoOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AlertsPanel = () => {
  const [alerts, setAlerts] = React.useState([
    {
      id: 1,
      type: 'warning',
      message: 'Низкий уровень кислорода (30%)',
      description: 'Критически низкий уровень. Необходимо пополнить запасы.',
      icon: <WarningOutlined />,
      time: '2 мин назад'
    },
    {
      id: 2,
      type: 'info',
      message: 'Запланировано техническое обслуживание',
      description: 'Запланировано на 15:00 по лунному времени',
      icon: <InfoOutlined />,
      time: '1 час назад'
    }
  ]);

  const handleClose = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Title level={4} style={{ color: 'white', margin: 0, fontWeight: 600 }}>
            СИСТЕМНЫЕ УВЕДОМЛЕНИЯ
          </Title>
          <Text type="secondary" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {alerts.length} активных
          </Text>
        </div>
      }
      headStyle={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.2)'
      }}
      bodyStyle={{ padding: '16px 12px' }}
      style={{ 
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        borderRadius: '16px'
      }}
    >
      <Space direction="vertical" style={{ width: '100%', gap: '12px' }}>
        {alerts.map((alert) => (
          <Alert
            key={alert.id}
            message={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ 
                    fontWeight: 600, 
                    color: alert.type === 'warning' ? '#FFD166' : '#B8A1FF'
                  }}>
                    {alert.message}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{alert.time}</div>
                </div>
                <CloseCircleOutlined 
                  onClick={() => handleClose(alert.id)}
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontSize: '16px',
                    ':hover': {
                      color: 'rgba(255, 255, 255, 0.8)'
                    }
                  }}
                />
              </div>
            }
            description={
              <Text style={{ color: 'rgba(255,255,255,0.7)' }}>
                {alert.description}
              </Text>
            }
            type={alert.type}
            icon={alert.icon}
            showIcon
            closable={false}
            style={{
              borderRadius: '12px',
              border: alert.type === 'warning' 
                ? '1px solid rgba(255, 209, 102, 0.3)' 
                : '1px solid rgba(184, 161, 255, 0.3)',
              background: alert.type === 'warning' 
                ? 'rgba(255, 209, 102, 0.1)' 
                : 'rgba(184, 161, 255, 0.1)',
              backdropFilter: 'blur(4px)'
            }}
          />
        ))}
      </Space>
    </Card>
  );
};

export default AlertsPanel;