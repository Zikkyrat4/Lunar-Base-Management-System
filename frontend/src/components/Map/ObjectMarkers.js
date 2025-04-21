import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Tooltip, Button, Descriptions } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

// Создаем иконки один раз при загрузке модуля
const objectIcons = {
  habitat: createIcon('#1890ff'),
  launchpad: createIcon('#f5222d'),
  power: createIcon('#faad14'),
  lab: createIcon('#13c2c2'),
  workshop: createIcon('#722ed1'),
  medical: createIcon('#eb2f96'),
  greenhouse: createIcon('#52c41a'),
  storage: createIcon('#fa8c16'),
  default: createIcon('#666666')
};

function createIcon(color) {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        <i class="fas fa-map-marker-alt"></i>
      </div>
    `,
    className: 'object-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
}

const ObjectMarkers = React.memo(({ objects = [], onDelete, onSelect }) => {
  const handleMarkerClick = React.useCallback((obj) => {
    if (!obj || !obj.id) return;
    
    try {
      if (onSelect) {
        // Преобразуем объект в простой объект без методов
        const safeObj = {
          id: obj.id,
          type: obj.type || 'unknown',
          name: obj.name || 'Unnamed',
          lat: Number(obj.lat) || 0,
          lng: Number(obj.lng) || 0,
          createdAt: obj.createdAt || new Date().toISOString()
        };
        onSelect(safeObj);
      }
    } catch (error) {
      console.error('Error handling marker click:', error);
    }
  }, [onSelect]);

  return objects.map((obj) => {
    if (!obj || !obj.id || obj.lat === undefined || obj.lng === undefined) {
      return null;
    }

    const icon = objectIcons[obj.type] || objectIcons.default;

    return (
      <Marker
        key={obj.id}
        position={[Number(obj.lat), Number(obj.lng)]}
        icon={icon}
        eventHandlers={{
          click: () => handleMarkerClick(obj)
        }}
      >
        <Popup>
          <div className="object-popup">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Тип">
                <strong>{obj.type || 'Не указан'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Название">
                {obj.name || 'Без названия'}
              </Descriptions.Item>
              <Descriptions.Item label="Широта">
                {Number(obj.lat).toFixed(6)}
              </Descriptions.Item>
              <Descriptions.Item label="Долгота">
                {Number(obj.lng).toFixed(6)}
              </Descriptions.Item>
              {obj.createdAt && (
                <Descriptions.Item label="Дата создания">
                  {new Date(obj.createdAt).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>
            
            {onDelete && (
              <div style={{ marginTop: 12, textAlign: 'right' }}>
                <Tooltip title="Удалить объект">
                  <Button 
                    danger 
                    size="small" 
                    icon={<DeleteOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(obj.id);
                    }}
                  />
                </Tooltip>
              </div>
            )}
          </div>
        </Popup>
      </Marker>
    );
  });
});

export default ObjectMarkers;