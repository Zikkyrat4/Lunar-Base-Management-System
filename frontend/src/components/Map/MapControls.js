// src/components/Map/MapControls.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Tabs, Card, List, Popconfirm, Checkbox, Collapse, Button,
  Dropdown, Tag, Spin, Alert, Slider, Tooltip, Radio, message
} from 'antd';
import { 
  StarFilled, MenuOutlined, CloseOutlined, DeleteOutlined,
  AppstoreOutlined, LeftOutlined, RightOutlined
} from '@ant-design/icons';
import MapUpload from './MapUpload';
import ObjectPalette from './ObjectPalette';
import { useSelector } from 'react-redux';
import api from '../../api/axios';

const { TabPane } = Tabs;
const { Panel } = Collapse;

const LayerControl = ({ layer, onToggle, onChangeOpacity }) => {
  if (!layer) return null;
  
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
  setUserMaps
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const token = useSelector((state) => state.auth.token);



  const fetchUserMaps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/maps', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUserMaps(response.data);
    } catch (error) {
      setError('Ошибка загрузки списка карт');
      console.error('Failed to fetch maps:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

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

  const handleLayerToggle = useCallback((layerId) => {
    setActiveLayers(prev => ({
        ...prev,
        [layerId]: {
            ...prev[layerId],
            visible: !prev[layerId]?.visible
        }
    }));
}, []);

  const handleLayerOpacityChange = useCallback((layerId, opacity) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        opacity
      }
    }));
  }, []);

  useEffect(() => {
    if (token) {
      fetchUserMaps();
    }
  }, [token, fetchUserMaps]);

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
                      title={map.name}
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
            <Collapse defaultActiveKey={['1']} ghost>
              <Panel header="Тематические слои" key="1" extra={<AppstoreOutlined />}>
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