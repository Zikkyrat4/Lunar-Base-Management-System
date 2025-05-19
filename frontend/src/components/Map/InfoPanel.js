import React, { useState } from 'react';
import { Card, Descriptions, Button, Typography, Divider, Progress, Dropdown, Collapse } from 'antd';
import { PrinterOutlined, ExportOutlined, DownloadOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { message } from 'antd';
import * as MapUtils from './MapUtils';

const { Text, Title } = Typography;
const { Panel } = Collapse;

const InfoPanel = ({ 
  coords, 
  selectedObject, 
  objects = []
}) => {
  const [exportFormat, setExportFormat] = useState('png');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [extendedInfo] = useState({
    gravity: 1.62,
    solar_activity: 45,
    temperature: -153,
    last_update: new Date()
  });

  const exportMenuItems = [
    { key: 'png', label: 'PNG', icon: <DownloadOutlined /> },
    { key: 'pdf', label: 'PDF', icon: <DownloadOutlined /> },
    { key: 'geojson', label: 'GeoJSON', icon: <DownloadOutlined /> }
  ];

  const handlePrint = () => {
    try {
      MapUtils.handlePrint();
      message.success('Подготовка к печати...');
    } catch (error) {
      message.error('Ошибка при подготовке к печати');
    }
  };

  const handleExport = (format = exportFormat) => {
    try {
      MapUtils.handleExport(format, objects);
      message.success(`Экспорт в ${format.toUpperCase()} начат`);
    } catch (error) {
      message.error('Ошибка при экспорте');
    }
  };

  const handleExportFormatChange = ({ key }) => {
    setExportFormat(key);
    handleExport(key);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Card 
      className="info-panel"
      style={{ 
        width: 280,
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.1)', 
        color: '#000000' 
      }}
      bodyStyle={{ 
        padding: isCollapsed ? '0' : '12px',
        transition: 'all 0.3s'
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          padding: isCollapsed ? '8px 12px' : '0 0 8px 0'
        }}
        onClick={toggleCollapse}
      >
        <Text strong>Информация о местности</Text>
        {isCollapsed ? <DownOutlined /> : <UpOutlined />}
      </div>

      <Collapse activeKey={isCollapsed ? [] : ['1']} ghost>
        <Panel key="1" showArrow={false} style={{ padding: 0 }}>
          <Descriptions column={1} size="small" style={{ marginBottom: 0 }}>
            <Descriptions.Item label="Широта">
              <Text copyable>{coords?.lat || 'Не определено'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Долгота">
              <Text copyable>{coords?.lng || 'Не определено'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Высота">1,240 м</Descriptions.Item>
            <Descriptions.Item label="Температура">
              {extendedInfo.temperature}°C
            </Descriptions.Item>
            <Descriptions.Item label="Зона">
              {getZoneInfo(coords) || 'Не определено'}
            </Descriptions.Item>
            <Descriptions.Item label="Выбранный объект">
              {selectedObject || 'Не выбран'}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" style={{ margin: '8px 0' }}>Дополнительно</Divider>
          
          <Descriptions column={1} size="small" style={{ marginBottom: 12 }}>
            <Descriptions.Item label="Гравитация">
              {extendedInfo.gravity} м/с²
            </Descriptions.Item>
            <Descriptions.Item label="Солнечная активность">
              <Progress 
                percent={extendedInfo.solar_activity} 
                status="active" 
                size="small" 
                style={{ marginTop: 4 }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Последнее обновление">
              {extendedInfo.last_update.toLocaleTimeString()}
            </Descriptions.Item>
          </Descriptions>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button 
              icon={<PrinterOutlined />} 
              onClick={handlePrint}
              block
              size="small"
            >
              Печать
            </Button>
            <Dropdown.Button
              icon={<ExportOutlined />}
              onClick={() => handleExport()}
              menu={{
                items: exportMenuItems,
                onClick: handleExportFormatChange,
                selectedKeys: [exportFormat]
              }}
              block
              size="small"
            >
              Экспорт
            </Dropdown.Button>
          </div>
        </Panel>
      </Collapse>
    </Card>
  );
};

function getZoneInfo(coords) {
  if (!coords) return null;
  
  const lat = parseFloat(coords.lat);
  const lng = parseFloat(coords.lng);
  
  if (lat > 20.3 && lat < 20.7 && lng > 30.2 && lng < 30.6) {
    return 'Опасная зона (радиация)';
  }
  if (lat > 20.1 && lat < 20.2 && lng > 30.3 && lng < 30.5) {
    return 'Зона исследований';
  }
  if (lat > 20.8 && lat < 20.9 && lng > 30.1 && lng < 30.3) {
    return 'Зона добычи ресурсов';
  }
  
  return 'Без ограничений';
}

export default InfoPanel;