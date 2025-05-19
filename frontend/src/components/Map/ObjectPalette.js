import React from 'react';
import { Tooltip, Row, Col } from 'antd';
import { 
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
  DeleteOutlined,
  BuildOutlined,
  RadarChartOutlined,
  GoldOutlined
} from '@ant-design/icons';
import '../../styles/ObjectPalette.css';

const objectTypes = [
  // Жилые модули
  { type: 'habitat', name: 'Жилой модуль', icon: <HomeOutlined />, color: '#1890ff', radius: 100 },
  { type: 'habitat_individual', name: 'Индивид. жильё', icon: <HomeOutlined />, color: '#1d39c4', radius: 50 },
  
  // Спортивные объекты
  { type: 'sport', name: 'Спортзал', icon: <TrophyOutlined />, color: '#13c2c2', radius: 80 },
  { type: 'sport_outdoor', name: 'Спортплощадка', icon: <TrophyOutlined />, color: '#08979c', radius: 120 },
  
  // Административные
  { type: 'administration', name: 'Админздание', icon: <BankOutlined />, color: '#722ed1', radius: 100 },
  
  // Медицинские
  { type: 'medical', name: 'Медпункт', icon: <MedicineBoxOutlined />, color: '#eb2f96', radius: 150 },
  { type: 'medical_lab', name: 'Медлаборатория', icon: <MedicineBoxOutlined />, color: '#c41d7f', radius: 100 },
  
  // Исследовательские
  { type: 'research', name: 'Лаборатория', icon: <ExperimentOutlined />, color: '#d48806', radius: 120 },
  
  // Технологические
  { type: 'workshop', name: 'Мастерская', icon: <ToolOutlined />, color: '#fa8c16', radius: 100 },
  { type: 'launchpad', name: 'Космодром', icon: <RocketOutlined />, color: '#f5222d', radius: 500 },
  { type: 'communication', name: 'Вышка связи', icon: <WifiOutlined />, color: '#52c41a', radius: 200 },
  { type: 'greenhouse', name: 'Теплица', icon: <ClusterOutlined />, color: '#389e0d', radius: 150 },
  { type: 'waste', name: 'Мусорный полигон', icon: <DeleteOutlined />, color: '#5c8b39', radius: 300 },
  { type: 'factory', name: 'Производство', icon: <BuildOutlined />, color: '#ad4e00', radius: 250 },
  { type: 'observatory', name: 'Обсерватория', icon: <RadarChartOutlined />, color: '#391085', radius: 200 },
  { type: 'solar', name: 'Солн. электростанция', icon: <ThunderboltOutlined />, color: '#faad14', radius: 300 },
  { type: 'mine', name: 'Добывающая шахта', icon: <GoldOutlined />, color: '#876800', radius: 400 },
  { type: 'storage', name: 'Склад', icon: <DatabaseOutlined />, color: '#7cb305', radius: 150 }
];

const ObjectPalette = ({ onSelectObject, selectedType }) => {
  return (
    <div className="object-palette" style={{ 
      maxHeight: '400px',
      overflowY: 'auto',
      padding: '8px',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        textAlign: 'center', 
        marginBottom: '16px',
        position: 'sticky',
        top: 0,
        background: 'rgba(10, 10, 20, 0.85)',
        padding: '8px 0',
        zIndex: 1,
        backdropFilter: 'blur(5px)'
      }}>
        Типы объектов
      </h3>
      <Row gutter={[8, 8]} style={{ marginBottom: '8px' }}>
        {objectTypes.map((obj) => (
          <Col span={12} key={obj.type}>
            <Tooltip title={`${obj.name} (радиус: ${obj.radius}м)`}>
              <div 
                className={`object-item ${selectedType === obj.type ? 'selected' : ''}`}
                onClick={() => onSelectObject(obj)}
                style={{ 
                  borderColor: obj.color,
                  padding: '8px 4px',
                  height: '80px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '8px'
                }}
              >
                <div className="object-icon" style={{ color: obj.color }}>
                  {React.cloneElement(obj.icon, { style: { fontSize: '20px' } })}
                </div>
                <div className="object-name" style={{ 
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {obj.name}
                </div>
              </div>
            </Tooltip>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ObjectPalette;