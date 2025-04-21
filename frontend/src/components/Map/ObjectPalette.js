import React from 'react';
import { Tooltip } from 'antd';
import { 
  HomeOutlined, RocketOutlined, ThunderboltOutlined,
  ExperimentOutlined, ToolOutlined, MedicineBoxOutlined,
  ClusterOutlined, DatabaseOutlined 
} from '@ant-design/icons';
import '../../styles/ObjectPalette.css';

const objectTypes = [
  { type: 'habitat', name: 'Жилой модуль', icon: <HomeOutlined />, color: '#1890ff' },
  { type: 'launchpad', name: 'Космодром', icon: <RocketOutlined />, color: '#f5222d' },
  { type: 'power', name: 'Электростанция', icon: <ThunderboltOutlined />, color: '#faad14' },
  { type: 'lab', name: 'Лаборатория', icon: <ExperimentOutlined />, color: '#13c2c2' },
  { type: 'workshop', name: 'Мастерская', icon: <ToolOutlined />, color: '#722ed1' },
  { type: 'medical', name: 'Медпункт', icon: <MedicineBoxOutlined />, color: '#eb2f96' },
  { type: 'greenhouse', name: 'Теплица', icon: <ClusterOutlined />, color: '#52c41a' },
  { type: 'storage', name: 'Склад', icon: <DatabaseOutlined />, color: '#fa8c16' },
];

const ObjectPalette = ({ onSelectObject, selectedType }) => {
  return (
    <div className="object-palette">
      {objectTypes.map(obj => (
        <Tooltip title={obj.name} key={obj.type}>
          <div 
            className={`object-item ${selectedType === obj.type ? 'selected' : ''}`}
            onClick={() => onSelectObject(obj)}
            style={{ borderColor: obj.color }}
          >
            <div className="object-icon" style={{ color: obj.color }}>
              {React.cloneElement(obj.icon, { style: { fontSize: '24px' } })}
            </div>
            <div className="object-name">{obj.name}</div>
          </div>
        </Tooltip>
      ))}
    </div>
  );
};

export default ObjectPalette;