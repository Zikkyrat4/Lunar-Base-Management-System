import React, { useState } from 'react';
import { Drawer, Button, Dropdown, Menu, Space } from 'antd';
import { 
  MenuOutlined, 
  PlusOutlined, 
  InfoCircleOutlined, 
  HighlightOutlined,
  ExportOutlined
} from '@ant-design/icons';
import MapView from './MapView';

const MobileMapView = () => {
  const [menuVisible, setMenuVisible] = useState(false);
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
      
      <Button 
        type="primary" 
        icon={<MenuOutlined />}
        onClick={() => setMenuVisible(true)}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000
        }}
      />
      
      <Drawer
        title="Меню"
        placement="right"
        onClose={() => setMenuVisible(false)}
        visible={menuVisible}
        width="80%"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button block icon={<PlusOutlined />}>Добавить объект</Button>
          <Button block icon={<HighlightOutlined />}>Измерить</Button>
          <Button block icon={<InfoCircleOutlined />}>Информация</Button>
          <Button block icon={<ExportOutlined />}>Экспорт</Button>
        </Space>
      </Drawer>

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