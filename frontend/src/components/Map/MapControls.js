import React, { useState, useCallback } from 'react';
import { 
  Button, Slider, Typography, 
  Popconfirm, Checkbox, 
  Alert, Spin, Dropdown, 
  Tooltip, Radio, message, Tag,
  Popover, Space, Divider
} from 'antd';
import { 
  MenuOutlined, CloseOutlined, 
  DeleteOutlined, AppstoreOutlined, 
  ControlOutlined, PlusOutlined,
  EyeOutlined, EyeInvisibleOutlined,
  UploadOutlined, DownloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import MapUpload from './MapUpload';
import ObjectPalette from './ObjectPalette';
import { useSelector } from 'react-redux';
import api from '../../api/axios';

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
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('objects');
  const [reliefOpacity, setReliefOpacity] = useState(70);
  const [reliefEnabled, setReliefEnabled] = useState(true);
  const token = useSelector((state) => state.auth.token);

  const fetchUserMaps = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/maps');
      setUserMaps(response.data);
      
      setActiveLayers(prev => {
        const newLayers = {...prev};
        response.data.forEach(map => {
          if (!prev[map.id]) {
            newLayers[map.id] = {
              id: map.id,
              name: map.name,
              visible: false,
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

  const content = (
    <div style={{ width: 280, padding: '8px 0' }}>
      <div style={{ display: 'flex', marginBottom: 8 }}>
      <Button 
        type={activeTab === 'objects' ? 'primary' : 'default'} 
        onClick={() => setActiveTab('objects')}
        icon={<PlusOutlined />}
        style={{ 
          flex: 1, 
          marginRight: 4,
          background: activeTab === 'objects' ? '#1890ff' : 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.12)'
        }}
      >
        Объекты
      </Button>
      <Button 
        type={activeTab === 'maps' ? 'primary' : 'default'} 
        onClick={() => setActiveTab('maps')}
        icon={<UploadOutlined />}
        style={{ 
          flex: 1, 
          marginRight: 4,
          background: activeTab === 'maps' ? '#1890ff' : 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.12)'
        }}
      >
        Карты
      </Button>
      <Button 
        type={activeTab === 'layers' ? 'primary' : 'default'} 
        onClick={() => setActiveTab('layers')}
        icon={<AppstoreOutlined />}
        style={{ 
          flex: 1,
          background: activeTab === 'layers' ? '#1890ff' : 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.12)'
        }}
      >
        Слои
      </Button>
    </div>


      <Divider style={{ margin: '8px 0' }} />

      {activeTab === 'objects' && (
        <div style={{ padding: '0 8px' }}>
          <ObjectPalette 
            onSelectObject={(obj) => {
              setSelectedObjectType(obj.type);
              setPlacementMode(true);
              setOpen(false);
            }}
            selectedType={placementMode ? selectedObjectType : null}
          />
          {placementMode && (
            <Button 
              danger
              icon={<CloseOutlined />}
              onClick={() => setPlacementMode(false)}
              style={{ marginTop: '8px', width: '100%' }}
            >
              Отменить размещение
            </Button>
          )}
        </div>
      )}
      
      {activeTab === 'maps' && (
        <div style={{ padding: '0 8px' }}>
          <MapUpload onUploadSuccess={fetchUserMaps} />
          
          {loading ? (
            <Spin size="small" tip="Загрузка..." />
          ) : error ? (
            <Alert message={error} type="error" showIcon size="small" />
          ) : (
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {userMaps.map(map => (
                <div key={map.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '4px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <Checkbox
                    checked={activeLayers[map.id]?.visible || false}
                    onChange={() => handleLayerToggle(map.id)}
                    style={{ marginRight: 8 }}
                  />
                  <Text ellipsis style={{ flex: 1 }}>{map.name || 'Без названия'}</Text>
                  <Popconfirm
                    title="Удалить карту?"
                    onConfirm={() => handleDeleteMap(map.id)}
                    okText="Да"
                    cancelText="Нет"
                  >
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      size="small" 
                      type="text"
                    />
                  </Popconfirm>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'layers' && (
        <div style={{ padding: '0 8px' }}>
          <div style={{ marginBottom: 12 }}>
            <Checkbox 
              checked={reliefEnabled}
              onChange={e => toggleRelief(e.target.checked)}
            >
              Показать рельеф
            </Checkbox>
            {reliefEnabled && (
              <div style={{ marginLeft: 24 }}>
                <Text>Интенсивность:</Text>
                <Slider
                  min={0}
                  max={100}
                  value={reliefOpacity}
                  onChange={handleReliefOpacityChange}
                  tooltip={{ formatter: value => `${value}%` }}
                />
              </div>
            )}
          </div>
          
          <Text strong>Тематические слои:</Text>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {Object.values(activeLayers).map(layer => (
              <LayerControl
                key={layer.id}
                layer={layer}
                onToggle={handleLayerToggle}
                onChangeOpacity={handleLayerOpacityChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Popover
    content={content}
    title="Управление картой"
    trigger="click"
    open={open}
    onOpenChange={setOpen}
    placement="rightTop"
    overlayStyle={{ width: 320 }}
  >
    <Button 
      type="primary" 
      icon={<SettingOutlined style={{ fontSize: '20px' }} />}
      style={{
        position: 'fixed',
        top: 80,
        left: 10,
        zIndex: 1000,
        width: 44,
        height: 44,
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0, 210, 255, 0.4)',
        background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
        border: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      className="settings-button"
    />
  </Popover>
  );
};

export default MapControls;