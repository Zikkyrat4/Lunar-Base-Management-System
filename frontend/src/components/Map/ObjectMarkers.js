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
  DatabaseOutlined,
  TrophyOutlined,
  BankOutlined,
  WifiOutlined,
  DeleteOutlined as WasteIcon,
  BuildOutlined,
  RadarChartOutlined,
  GoldOutlined
} from '@ant-design/icons';

// Конфигурация типов объектов
const OBJECT_TYPES_CONFIG = {
  // Жилые модули
  habitat: {
    name: "Жилой модуль",
    icon: HomeOutlined,
    color: '#1890ff',
    defaultRadius: 100,
    description: "Основное жилое помещение для колонистов"
  },
  habitat_individual: {
    name: "Индивидуальное жильё",
    icon: HomeOutlined,
    color: '#1d39c4',
    defaultRadius: 50,
    description: "Персональные жилые помещения"
  },
  
  // Спортивные объекты
  sport: {
    name: "Спортивный зал",
    icon: TrophyOutlined,
    color: '#13c2c2',
    defaultRadius: 80,
    description: "Закрытое помещение для физических упражнений"
  },
  sport_outdoor: {
    name: "Спортивная площадка",
    icon: TrophyOutlined,
    color: '#08979c',
    defaultRadius: 120,
    description: "Открытая площадка для занятий спортом"
  },
  
  // Административные
  administration: {
    name: "Административное здание",
    icon: BankOutlined,
    color: '#722ed1',
    defaultRadius: 100,
    description: "Центр управления базой"
  },
  
  // Медицинские
  medical: {
    name: "Медицинский пункт",
    icon: MedicineBoxOutlined,
    color: '#eb2f96',
    defaultRadius: 150,
    description: "Основное медицинское учреждение"
  },
  medical_lab: {
    name: "Медицинская лаборатория",
    icon: MedicineBoxOutlined,
    color: '#c41d7f',
    defaultRadius: 100,
    description: "Лаборатория для медицинских исследований"
  },
  
  // Исследовательские
  research: {
    name: "Научная лаборатория",
    icon: ExperimentOutlined,
    color: '#d48806',
    defaultRadius: 120,
    description: "Объект для научных исследований"
  },
  
  // Технологические
  workshop: {
    name: "Ремонтная мастерская",
    icon: ToolOutlined,
    color: '#fa8c16',
    defaultRadius: 100,
    description: "Обслуживание и ремонт оборудования"
  },
  launchpad: {
    name: "Космодром",
    icon: RocketOutlined,
    color: '#f5222d',
    defaultRadius: 500,
    description: "Площадка для запуска и приёма космических аппаратов"
  },
  communication: {
    name: "Вышка связи",
    icon: WifiOutlined,
    color: '#52c41a',
    defaultRadius: 200,
    description: "Обеспечение коммуникаций на базе"
  },
  greenhouse: {
    name: "Агрокомплекс",
    icon: ClusterOutlined,
    color: '#389e0d',
    defaultRadius: 150,
    description: "Выращивание растений для питания"
  },
  waste: {
    name: "Мусорный полигон",
    icon: WasteIcon,
    color: '#5c8b39',
    defaultRadius: 300,
    description: "Хранение и переработка отходов"
  },
  factory: {
    name: "Производственный цех",
    icon: BuildOutlined,
    color: '#ad4e00',
    defaultRadius: 250,
    description: "Производство необходимых материалов"
  },
  observatory: {
    name: "Обсерватория",
    icon: RadarChartOutlined,
    color: '#391085',
    defaultRadius: 200,
    description: "Астрономические наблюдения"
  },
  solar: {
    name: "Солнечная электростанция",
    icon: ThunderboltOutlined,
    color: '#faad14',
    defaultRadius: 300,
    description: "Генерация электроэнергии"
  },
  mine: {
    name: "Добывающая шахта",
    icon: GoldOutlined,
    color: '#876800',
    defaultRadius: 400,
    description: "Добыча полезных ископаемых"
  },
  storage: {
    name: "Склад",
    icon: DatabaseOutlined,
    color: '#7cb305',
    defaultRadius: 150,
    description: "Хранение ресурсов и оборудования"
  }
};

// SVG пути для иконок
const SVG_PATHS = {
  home: '<path d="M12 3L2 12h3v8h5v-6h4v6h5v-8h3L12 3zm0-2.5l10 9.5v10h-7v-7h-6v7H2v-10l10-9.5z"/>',
  rocket: '<path d="M13 13v8h8v-8h-8zM3 21h8v-8H3v8zM3 3v8h8V3H3zm13.66-1.31L11 7.34 16.66 13l5.66-5.66-5.66-5.65z"/>',
  thunderbolt: '<path d="M12 3.2L7.2 13h3.2v7.1l4.8-9.9H12V3.2z"/>',
  experiment: '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM8 15c0-1.66 1.34-3 3-3h1.17l-1.58 1.59L12 17l4-4-4-4-1.41 1.41L12.17 12H11c-2.76 0-5 2.24-5 5H8z"/>',
  tool: '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
  medicine: '<path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>',
  cluster: '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
  database: '<path d="M4 4h16v16H4V4zm2 2v12h12V6H6z"/>',
  trophy: '<path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>',
  bank: '<path d="M12 2L1 8v2h22V8L12 2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 6v-2H6v2h12z"/>',
  wifi: '<path d="M12 3C7.79 3 3.7 4.41.38 7 4.41 12.06 7.89 16.37 12 21.5c4.08-5.08 8.24-10.26 11.65-14.5C20.32 4.41 16.22 3 12 3zm0 2c3.07 0 6.09.86 8.71 2.45l-3.21 3.98C16.26 10.74 14.37 10 12 10c-2.38 0-4.26.75-5.5 1.43L3.27 7.45C5.91 5.85 8.93 5 12 5zm-6.1 6.08C8.3 10.15 10.05 10 12 10c1.95 0 3.7.14 5.1.38l-2.85 3.53c-1.31-.48-2.63-.73-3.91-.73-1.28 0-2.6.25-3.91.73l-2.84-3.53z"/>',
  factory: '<path d="M22 22H2V10l7-3v2l5-2v3h3l1-8h3l1 8v12zM12 9.95l-5 2V10l-3 1.32V20h16v-8h-8V9.95zM11 18h2v-4h-2v4zm-4 0h2v-4H7v4zm10-4h-2v4h2v-4z"/>',
  radar: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm1-13h-2v6l6.25 3.75.75-1.23-5-3z"/>',
  gold: '<path d="M12 2L4 7l8 5 8-5-8-5zm0 16.5l-8-5V9l8 5 8-5v4.5l-8 5z"/>'
};

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
  
  // Инициализация значений слайдера с учетом типа объекта
  useEffect(() => {
    const initialValues = {};
    objects.forEach(obj => {
      const config = OBJECT_TYPES_CONFIG[obj.type] || OBJECT_TYPES_CONFIG.habitat;
      initialValues[obj.id] = obj.restriction_radius || config.defaultRadius;
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

  const createCustomIcon = (type, isSelected) => {
    const config = OBJECT_TYPES_CONFIG[type] || OBJECT_TYPES_CONFIG.habitat;
    const size = isSelected ? 36 : 32;
    const color = config.color;

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
          filter: drop-shadow(0 0 6px rgba(0,0,0,0.4));
        ">
          <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">
            ${getSvgPath(config.icon)}
          </svg>
        </div>
      `,
      className: 'object-marker',
      iconSize: [size, size],
      iconAnchor: [size/2, size]
    });
  };

  const getSvgPath = (IconComponent) => {
    if (IconComponent === HomeOutlined) return SVG_PATHS.home;
    if (IconComponent === RocketOutlined) return SVG_PATHS.rocket;
    if (IconComponent === ThunderboltOutlined) return SVG_PATHS.thunderbolt;
    if (IconComponent === ExperimentOutlined) return SVG_PATHS.experiment;
    if (IconComponent === ToolOutlined) return SVG_PATHS.tool;
    if (IconComponent === MedicineBoxOutlined) return SVG_PATHS.medicine;
    if (IconComponent === ClusterOutlined) return SVG_PATHS.cluster;
    if (IconComponent === DatabaseOutlined) return SVG_PATHS.database;
    if (IconComponent === TrophyOutlined) return SVG_PATHS.trophy;
    if (IconComponent === BankOutlined) return SVG_PATHS.bank;
    if (IconComponent === WifiOutlined) return SVG_PATHS.wifi;
    if (IconComponent === BuildOutlined) return SVG_PATHS.factory;
    if (IconComponent === RadarChartOutlined) return SVG_PATHS.radar;
    if (IconComponent === GoldOutlined) return SVG_PATHS.gold;
    return SVG_PATHS.home;
  };

  return objects.map((obj) => {
    if (!obj?.id || obj.lat === undefined || obj.lng === undefined) return null;

    const config = OBJECT_TYPES_CONFIG[obj.type] || OBJECT_TYPES_CONFIG.habitat;
    const color = config.color;
    const isSelected = selectedObjectId === obj.id;
    const currentRadius = sliderValues[obj.id] || obj.restriction_radius || config.defaultRadius;

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
              title={<Tag color={color}>{obj.name || config.name}</Tag>}
              column={1}
              size="small"
              bordered
            >
              <Descriptions.Item label="Тип">
                <Space>
                  {React.createElement(config.icon, { style: { color } })}
                  <span style={{ textTransform: 'capitalize' }}>
                    {config.name}
                  </span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Описание">
                {config.description}
              </Descriptions.Item>
              <Descriptions.Item label="Координаты">
                {obj.lat.toFixed(6)}, {obj.lng.toFixed(6)}
              </Descriptions.Item>
              <Descriptions.Item label="Зона ограничения (м)">
                <Slider
                  min={10}
                  max={1000}
                  step={10}
                  value={currentRadius}
                  onChange={(val) => handleSliderChange(obj.id, val)}
                  tooltip={{ formatter: val => `${val} м` }}
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
            opacity: 0.8,
            fill: true,
            fillColor: color,
            fillOpacity: 0.15,
            dashArray: '5, 5',
            className: 'restriction-zone'
          }}
        >
          <Tooltip permanent direction="center" className="zone-tooltip">
            <div style={{ 
              color: color, 
              fontWeight: 'bold',
              textShadow: '0 0 3px rgba(0,0,0,0.7)'
            }}>
              {currentRadius} м
            </div>
          </Tooltip>
        </Circle>
      </React.Fragment>
    );
  });
};

export default React.memo(ObjectMarkers);