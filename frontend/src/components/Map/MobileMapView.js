import React, { useState } from 'react';
import { Dropdown, Menu, Space } from 'antd';
import { 
  PlusOutlined, 
  InfoCircleOutlined, 
  HighlightOutlined
} from '@ant-design/icons';
import MapView from './MapView';

const MobileMapView = () => {
  const [contextMenu, setContextMenu] = useState(null);

  const handleMenuClick = ({ key }) => {
    setContextMenu(null);
    console.log(`Menu item clicked: ${key}`);
  };

  return (
    <div style={{ height: '100vh' }}>
      <MapView 
        simplified 
        onContextMenu={(e) => {
          e.originalEvent.preventDefault();
          setContextMenu({
            position: e.latlng,
            visible: true,
            items: [
              { key: 'add', label: 'Добавить объект', icon: <PlusOutlined /> },
              { key: 'measure', label: 'Измерить расстояние', icon: <HighlightOutlined /> },
              { key: 'info', label: 'Информация о точке', icon: <InfoCircleOutlined /> }
            ]
          });
        }}
      />

      {contextMenu?.visible && (
        <Dropdown
          overlay={
            <Menu onClick={handleMenuClick} items={contextMenu.items} />
          }
          open={contextMenu.visible}
          onOpenChange={(visible) => setContextMenu(prev => 
            visible ? prev : { ...prev, visible: false }
          )}
          trigger={['contextMenu']}
        >
          <div style={{
            position: 'absolute',
            left: contextMenu.position?.lng,
            top: contextMenu.position?.lat,
            zIndex: 1000
          }} />
        </Dropdown>
      )}
    </div>
  );
};

export default MobileMapView;