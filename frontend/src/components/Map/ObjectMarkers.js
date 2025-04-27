import React, { useState, useEffect, useRef } from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Tooltip, Button, Descriptions, Slider, Space, Tag, message } from 'antd';
import { 
  DeleteOutlined, 
  InfoCircleOutlined,
  HomeOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  ToolOutlined,
  MedicineBoxOutlined,
  ClusterOutlined,
  DatabaseOutlined
} from '@ant-design/icons';

const ObjectMarkers = ({ 
  objects = [], 
  onDelete, 
  onUpdate,
  onSelect,
  selectedObjectId = null
}) => {
  const [sliderValues, setSliderValues] = useState({});
  const updateTimeoutRef = useRef(null);
  const lastNotificationRef = useRef(0);
  
  // Инициализация значений слайдера
  useEffect(() => {
    const initialValues = {};
    objects.forEach(obj => {
      initialValues[obj.id] = obj.restriction_radius || 50;
    });
    setSliderValues(initialValues);
  }, [objects]);

  const handleSliderChange = (id, value) => {
    setSliderValues(prev => ({ ...prev, [id]: value }));
    
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      onUpdate(id, { restriction_radius: value });
      
      const now = Date.now();
      if (now - lastNotificationRef.current > 2000) {
        message.success('Зона ограничения обновлена', 2);
        lastNotificationRef.current = now;
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Создаем кастомные иконки для каждого типа объекта
  const createCustomIcon = (type, isSelected) => {
    const colors = {
      habitat: '#1890ff',
      launchpad: '#f5222d',
      power: '#faad14',
      lab: '#13c2c2',
      workshop: '#722ed1',
      medical: '#eb2f96',
      greenhouse: '#52c41a',
      storage: '#fa8c16'
    };

    const color = colors[type] || '#666666';
    const size = isSelected ? 32 : 28;

    // SVG иконки для каждого типа объекта
    const icons = {
      habitat: `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
          <path d="M12 3L2 12h3v8h5v-6h4v6h5v-8h3L12 3zm0-2.5l10 9.5v10h-7v-7h-6v7H2v-10l10-9.5z"/>
        </svg>
      `,
      launchpad: `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
          <path d="M13 13v8h8v-8h-8zM3 21h8v-8H3v8zM3 3v8h8V3H3zm13.66-1.31L11 7.34 16.66 13l5.66-5.66-5.66-5.65z"/>
        </svg>
      `,
      power: `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
          <path d="M11 15H6.83l1.58-1.59L7 12l-4 4 4 4 1.41-1.41L6.83 17H11v6h2v-6zm8-10h4.17l-1.58 1.59L21 12l4-4-4-4-1.41 1.41L22.17 7H19V1h-2v6z"/>
        </svg>
      `,
      lab: `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4-4h-4v-2h4v-2h-4V9h4V7H9v10h6z"/>
        </svg>
      `,
      workshop: `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      `,
      medical: `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
          <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
        </svg>
      `,
      greenhouse: `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `,
      storage: `
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
          <path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/>
        </svg>
      `
    };

    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: all 0.3s;
          filter: drop-shadow(0 0 4px rgba(0,0,0,0.3));
        ">
          ${icons[type] || icons.habitat}
        </div>
      `,
      className: 'object-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size]
    });
  };

  const getColorByType = (type) => {
    const colors = {
      habitat: '#1890ff',
      launchpad: '#f5222d',
      power: '#faad14',
      lab: '#13c2c2',
      workshop: '#722ed1',
      medical: '#eb2f96',
      greenhouse: '#52c41a',
      storage: '#fa8c16'
    };
    return colors[type] || '#666666';
  };

  return objects.map((obj) => {
    if (!obj?.id || obj.lat === undefined || obj.lng === undefined) return null;

    const color = getColorByType(obj.type);
    const isSelected = selectedObjectId === obj.id;
    const currentRadius = sliderValues[obj.id] || obj.restriction_radius || 50;

    const icon = createCustomIcon(obj.type, isSelected);

    return (
      <React.Fragment key={obj.id}>
        <Marker
          position={[obj.lat, obj.lng]}
          icon={icon}
          eventHandlers={{
            click: () => onSelect?.(obj)
          }}
        >
          <Popup className="object-popup" closeButton={false}>
            <Descriptions 
              title={<Tag color={color}>{obj.name}</Tag>}
              column={1}
              size="small"
              bordered
            >
              <Descriptions.Item label="Тип">
                <Space>
                  {React.createElement({
                    habitat: HomeOutlined,
                    launchpad: RocketOutlined,
                    power: ThunderboltOutlined,
                    lab: ExperimentOutlined,
                    workshop: ToolOutlined,
                    medical: MedicineBoxOutlined,
                    greenhouse: ClusterOutlined,
                    storage: DatabaseOutlined
                  }[obj.type] || InfoCircleOutlined)}
                  <span style={{ textTransform: 'capitalize' }}>
                    {obj.type}
                  </span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Координаты">
                {obj.lat.toFixed(6)}, {obj.lng.toFixed(6)}
              </Descriptions.Item>
              <Descriptions.Item label="Зона ограничения (м)">
                <Slider
                  min={10}
                  max={200}
                  value={currentRadius}
                  onChange={(val) => handleSliderChange(obj.id, val)}
                />
              </Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(obj.id);
                }}
              >
                Удалить
              </Button>
            </div>
          </Popup>
        </Marker>

        <Circle
          center={[obj.lat, obj.lng]}
          radius={currentRadius}
          pathOptions={{
            stroke: true,
            color: color,
            weight: 2,
            opacity: 0.7,
            fill: true,
            fillColor: color,
            fillOpacity: 0.1,
            dashArray: '5, 5',
            className: 'restriction-zone'
          }}
        >
          <Tooltip permanent direction="center" className="zone-tooltip">
            <div style={{ color: color, fontWeight: 'bold' }}>
              {currentRadius} м
            </div>
          </Tooltip>
        </Circle>
      </React.Fragment>
    );
  });
};

export default React.memo(ObjectMarkers);