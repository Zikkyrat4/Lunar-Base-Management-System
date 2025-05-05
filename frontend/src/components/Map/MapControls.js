import React, { useState, useCallback } from 'react';
import { 
  Tabs, Card, Slider, Typography, 
  Button, List, Popconfirm, Checkbox, 
  Collapse, Alert, Spin, Dropdown, 
  Tooltip, Radio, message, Tag
} from 'antd';
import { 
  StarFilled, MenuOutlined, CloseOutlined, 
  DeleteOutlined, AppstoreOutlined, 
  LeftOutlined, RightOutlined, ControlOutlined 
} from '@ant-design/icons';
import MapUpload from './MapUpload';
import ObjectPalette from './ObjectPalette';
import { useSelector } from 'react-redux';
import api from '../../api/axios';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Text } = Typography;

const LayerControl = ({ layer, onToggle, onChangeOpacity }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      <Checkbox
        checked={layer.visible || false}
        onChange={() => onToggle(layer.id)}
        style={{ marginRight: 10 }}
      >
        {layer.name}
      </Checkbox>
      <Slider
        min={0}
        max={100}
        value={layer.opacity || 100}
        onChange={value => onChangeOpacity(layer.id, value)}
        disabled={!layer.visible}
        style={{ width: 100, marginRight: 10 }}
      />
      <Tag color={layer.color} style={{ width: 20 }}></Tag>
    </div>
  );
};

const MapControls = ({ 
  placementMode, 
  selectedObjectType, 
  setPlacementMode, 
  setSelectedObjectType,
  mapRef,
  activeLayers,
  setActiveLayers,
  userMaps,
  setUserMaps,
  onReliefOpacityChange,
  onToggleRelief
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [reliefOpacity, setReliefOpacity] = useState(70);
  const [reliefEnabled, setReliefEnabled] = useState(true);
  const token = useSelector((state) => state.auth.token);

  // При загрузке карт
const fetchUserMaps = useCallback(async () => {
  try {
    setLoading(true);
    const response = await api.get('/maps');
    setUserMaps(response.data);
    
    // Инициализация activeLayers с visible: false
    setActiveLayers(prev => {
      const newLayers = {...prev};
      response.data.forEach(map => {
        if (!prev[map.id]) {
          newLayers[map.id] = {
            id: map.id,
            name: map.name,
            visible: false, // По умолчанию слой скрыт
            opacity: 70,
            color: '#1890ff'
          };
        }
      });
      return newLayers;
    });
  } catch (error) {
    setError('Ошибка загрузки списка карт');
  } finally {
    setLoading(false);
  }
}, [token]);

  const handleLayerToggle = useCallback((layerId) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        visible: !prev[layerId]?.visible
      }
    }));
  }, []);

  const handleLayerOpacityChange = useCallback((layerId, value) => {
    // Убедимся, что value не undefined и находится в пределах 0-100
    const clampedValue = Math.max(0, Math.min(100, value || 70));
    
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        opacity: clampedValue
      }
    }));
  }, []);

  const handleDeleteMap = useCallback(async (mapId) => {
    try {
      await api.delete(`/maps/${mapId}`);
      setUserMaps(prev => prev.filter(map => map.id !== mapId));
      message.success('Карта удалена');
    } catch (error) {
      console.error('Failed to delete map:', error);
      message.error('Ошибка при удалении карты');
    }
  }, []);

  const handleReliefOpacityChange = (value) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    setReliefOpacity(clampedValue);
    onReliefOpacityChange(clampedValue / 100);
  };

  const toggleRelief = (checked) => {
    setReliefEnabled(checked);
    onToggleRelief(checked);
  };

  if (collapsed) {
    return (
      <Button 
        type="primary" 
        icon={<RightOutlined />}
        onClick={() => setCollapsed(false)}
        style={{
          position: 'absolute',
          top: 50,
          left: 10,
          zIndex: 1000
        }}
      />
    );
  }

  return (
    <Card 
      style={{ 
        width: '300px',
        position: 'absolute',
        top: 50,
        left: 10,
        zIndex: 1000
      }}
      bodyStyle={{ padding: 0 }}
      extra={
        <Button 
          type="text" 
          icon={<LeftOutlined />} 
          onClick={() => setCollapsed(true)}
        />
      }
    >
      <Tabs 
        defaultActiveKey="1" 
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{ marginBottom: 0 }}
      >
        <TabPane tab="Объекты" key="1">
          <div style={{ padding: '16px' }}>
            <ObjectPalette 
              onSelectObject={(obj) => {
                setSelectedObjectType(obj.type);
                setPlacementMode(true);
              }}
              selectedType={placementMode ? selectedObjectType : null}
            />
            {placementMode && (
              <Button 
                danger
                icon={<CloseOutlined />}
                onClick={() => setPlacementMode(false)}
                style={{ marginTop: '16px', width: '100%' }}
              >
                Отменить размещение
              </Button>
            )}
          </div>
        </TabPane>
        
        <TabPane tab="Карты" key="2">
          <div style={{ padding: '16px' }}>
            <MapUpload onUploadSuccess={fetchUserMaps} />
            
            {loading ? (
              <Spin size="large" tip="Загрузка..." />
            ) : error ? (
              <Alert message={error} type="error" showIcon />
            ) : (
              <List
                dataSource={userMaps}
                renderItem={map => (
                  <List.Item
                    actions={[
                      <Checkbox
                        checked={activeLayers[map.id]?.visible || false}
                        onChange={() => handleLayerToggle(map.id)}
                      />,
                      <Popconfirm
                        title="Удалить карту?"
                        onConfirm={() => handleDeleteMap(map.id)}
                        okText="Да"
                        cancelText="Нет"
                      >
                        <Button danger icon={<DeleteOutlined />} size="small" />
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      title={map.name || 'Без названия'} // Запасной вариант
                      description={`Тип: ${map.file_type}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        </TabPane>
        
        <TabPane tab="Слои" key="3">
          <div style={{ padding: '16px' }}>
            <Collapse defaultActiveKey={['1', '2']} ghost>
              <Panel header="Рельеф" key="1" extra={<ControlOutlined />}>
                <div style={{ marginBottom: 16 }}>
                  <Checkbox 
                    checked={reliefEnabled}
                    onChange={e => toggleRelief(e.target.checked)}
                  >
                    Показать рельеф
                  </Checkbox>
                </div>
                {reliefEnabled && (
                  <>
                    <Text>Интенсивность:</Text>
                    <Slider
                      min={0}
                      max={100}
                      value={reliefOpacity}
                      onChange={handleReliefOpacityChange}
                      tooltip={{ formatter: value => `${value}%` }}
                    />
                  </>
                )}
              </Panel>
              
              <Panel header="Тематические слои" key="2" extra={<AppstoreOutlined />}>
                {Object.values(activeLayers).map(layer => (
                  <LayerControl
                    key={layer.id}
                    layer={layer}
                    onToggle={handleLayerToggle}
                    onChangeOpacity={handleLayerOpacityChange}
                  />
                ))}
              </Panel>
            </Collapse>
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default MapControls;