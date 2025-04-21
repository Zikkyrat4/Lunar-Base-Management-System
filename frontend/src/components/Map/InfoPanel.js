import React, { useState } from 'react';
import { Card, Descriptions, Button, Typography, Divider, Progress, Dropdown } from 'antd';
import { PrinterOutlined, ExportOutlined, DownloadOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const InfoPanel = ({ 
  coords, 
  selectedObject, 
  onPrint, 
  onExport,
  exportFormat,
  onExportFormatChange
}) => {
  const [extendedInfo, setExtendedInfo] = useState({
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

  return (
    <Card 
      title="Информация о местности" 
      className="info-panel"
      style={{ 
        width: 320,
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 1000
      }}
    >
      <Descriptions column={1} size="small">
        <Descriptions.Item label="Широта">
          <Text copyable>{coords?.lat || '-'}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="Долгота">
          <Text copyable>{coords?.lng || '-'}</Text>
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

      <Divider orientation="left">Дополнительно</Divider>
      
      <Descriptions column={1} size="small">
        <Descriptions.Item label="Гравитация">
          {extendedInfo.gravity} м/с²
        </Descriptions.Item>
        <Descriptions.Item label="Солнечная активность">
          <Progress 
            percent={extendedInfo.solar_activity} 
            status="active" 
            size="small" 
          />
        </Descriptions.Item>
        <Descriptions.Item label="Последнее обновление">
          {extendedInfo.last_update.toLocaleTimeString()}
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <Button 
          icon={<PrinterOutlined />} 
          onClick={onPrint}
          block
        >
          Печать
        </Button>
        <Dropdown.Button
          icon={<ExportOutlined />}
          onClick={() => onExport(exportFormat)}
          menu={{
            items: exportMenuItems,
            onClick: onExportFormatChange,
            selectedKeys: [exportFormat]
          }}
          block
        >
          Экспорт
        </Dropdown.Button>
      </div>
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