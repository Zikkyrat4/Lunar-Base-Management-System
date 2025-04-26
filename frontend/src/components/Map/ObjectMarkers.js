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
    // Мгновенное обновление локального состояния для плавного UI
    setSliderValues(prev => ({ ...prev, [id]: value }));
    
    // Отмена предыдущего отложенного обновления
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Запуск нового таймера для обновления на сервере
    updateTimeoutRef.current = setTimeout(() => {
      onUpdate(id, { restriction_radius: value });
      
      // Показываем уведомление только если прошло больше 2 секунд с последнего
      const now = Date.now();
      if (now - lastNotificationRef.current > 2000) {
        message.success('Зона ограничения обновлена', 2);
        lastNotificationRef.current = now;
      }
    }, 800); // Задержка перед отправкой на сервер
  };

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const typeIcons = {
    habitat: <HomeOutlined />,
    launchpad: <RocketOutlined />,
    power: <ThunderboltOutlined />,
    lab: <ExperimentOutlined />,
    workshop: <ToolOutlined />,
    medical: <MedicineBoxOutlined />,
    greenhouse: <ClusterOutlined />,
    storage: <DatabaseOutlined />
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

    const icon = L.divIcon({
      html: `
        <div style="
          background: ${color};
          width: ${isSelected ? '32px' : '28px'};
          height: ${isSelected ? '32px' : '28px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          border: 2px solid white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          transition: all 0.3s;
          ${isSelected ? 'transform: scale(1.1); z-index: 1000;' : ''}
        ">
          ${React.createElement(typeIcons[obj.type]?.type || InfoCircleOutlined)}
        </div>
      `,
      className: 'object-marker',
      iconSize: isSelected ? [32, 32] : [28, 28],
      iconAnchor: isSelected ? [16, 32] : [14, 28]
    });

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
                  {typeIcons[obj.type] || <InfoCircleOutlined />}
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