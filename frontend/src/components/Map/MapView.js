import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapContainer, TileLayer, LayersControl, useMap,
  ZoomControl, ScaleControl 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { 
  Card, List, Popconfirm, Checkbox, Tooltip, 
  Slider, Divider, Collapse, Button, Alert, Spin,
  Dropdown, Tag, message, Modal, Descriptions, Typography
} from 'antd';
import { 
  DeleteOutlined, StarFilled, PrinterOutlined, 
  ExportOutlined, MenuOutlined, InfoCircleOutlined,
  EyeOutlined, EyeInvisibleOutlined, CloseOutlined
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import MapUpload from './MapUpload';
import ShapefileLayer from './ShapefileLayer';
import GeoTIFFLayer from './GeoTIFFLayer';
import ZoneLayer from './ZoneLayer';
import ObjectPalette from './ObjectPalette';
import ObjectMarkers from './ObjectMarkers';
import api from '../../api/axios';
import { useSelector } from 'react-redux';
import InfoPanel from './InfoPanel';

const { Panel } = Collapse;
const { Text } = Typography;

const LayerControl = ({ layer, onToggle, onChangeOpacity }) => {
  return (
    <div className="layer-control">
      <Checkbox
        checked={layer.visible}
        onChange={() => onToggle(layer.id)}
      >
        {layer.name}
      </Checkbox>
      <Slider
        min={0}
        max={100}
        value={layer.opacity}
        onChange={value => onChangeOpacity(layer.id, value)}
        disabled={!layer.visible}
        style={{ width: 100 }}
      />
      <Tag color={layer.color} style={{ width: 20 }}></Tag>
    </div>
  );
};

const MeasurementControl = ({ map }) => {
  const activateMeasure = useCallback((mode) => {
    if (map) {
      if (map.measureControl) {
        map.removeControl(map.measureControl);
      }
      
      map.measureControl = new L.Control.Measure({
        position: 'bottomleft',
        primaryLengthUnit: 'meters',
        secondaryLengthUnit: 'kilometers',
        primaryAreaUnit: 'sqmeters',
        activeColor: '#1890ff',
        localization: {
          length: 'Длина: {distance}',
          area: 'Площадь: {area}',
          start: 'Кликните чтобы начать измерение',
          cont: 'Кликните чтобы продолжить',
          end: 'Кликните чтобы закончить',
          segment: 'Сегмент: {distance}',
          total: 'Всего: {distance}'
        }
      });
      
      map.addControl(map.measureControl);
    }
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const measureControl = L.control({ position: 'topright' });
    
    measureControl.onAdd = function() {
      const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
      div.style.display = 'flex';
      div.style.flexDirection = 'column';
      div.style.gap = '5px';

      const lineButton = L.DomUtil.create('a', '', div);
      lineButton.innerHTML = '<i class="fas fa-ruler"></i>';
      lineButton.title = 'Измерить расстояние';
      
      const areaButton = L.DomUtil.create('a', '', div);
      areaButton.innerHTML = '<i class="fas fa-vector-square"></i>';
      areaButton.title = 'Измерить площадь';

      L.DomEvent.on(lineButton, 'click', (e) => {
        L.DomEvent.stop(e);
        activateMeasure('distance');
      });

      L.DomEvent.on(areaButton, 'click', (e) => {
        L.DomEvent.stop(e);
        activateMeasure('area');
      });

      return div;
    };

    map.addControl(measureControl);

    return () => {
      if (map.measureControl) {
        map.removeControl(map.measureControl);
      }
      map.removeControl(measureControl);
    };
  }, [map, activateMeasure]);

  return null;
};

const MapView = ({ simplified = false }) => {
  const [userMaps, setUserMaps] = useState([]);
  const [activeLayers, setActiveLayers] = useState({
    elevation: { id: 'elevation', name: 'Рельеф', visible: true, opacity: 70, color: '#722ed1' },
    resources: { id: 'resources', name: 'Ресурсы', visible: true, opacity: 70, color: '#13c2c2' },
    shadows: { id: 'shadows', name: 'Затенение', visible: false, opacity: 50, color: '#595959' }
  });
  const [baseLayerId, setBaseLayerId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [coords, setCoords] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [placementMode, setPlacementMode] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState(null);
  const [objects, setObjects] = useState(() => []);
  const [exportFormat, setExportFormat] = useState('png');
  const mapRef = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const corsProxy = (url) => `https://cors-anywhere.herokuapp.com/${url}`;

  const fetchUserMaps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/maps', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Убедитесь, что response.data - это массив
      const mapsData = Array.isArray(response.data) ? response.data : [];
      setUserMaps(mapsData);
      
      const firstGeoTiff = mapsData.find(map => map.file_type === 'geotiff');
      if (firstGeoTiff) {
        setBaseLayerId(firstGeoTiff.id);
      }
    } catch (error) {
      setError('Ошибка загрузки списка карт');
      console.error('Failed to fetch maps:', error);
      setUserMaps([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchObjects = useCallback(async () => {
    try {
      const response = await api.get('/objects/');
      setObjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error('Ошибка загрузки объектов');
      setObjects([]); // Убедитесь, что устанавливается массив
    }
  }, []);

  const handleUpdateObject = useCallback(async (objectId, updates) => {
    try {
      const response = await api.patch(`/objects/${objectId}`, updates);
      setObjects(prev => 
        prev.map(obj => obj.id === objectId ? { ...obj, ...response.data } : obj)
      );
      message.success('Объект обновлен');
    } catch (error) {
      message.error('Ошибка при обновлении объекта');
    }
  }, []);

  const handleDeleteMap = useCallback(async (mapId) => {
    try {
      await api.delete(`/maps/${mapId}`);
      setUserMaps(prev => prev.filter(map => map.id !== mapId));
    } catch (error) {
      console.error('Failed to delete map:', error);
    }
  }, []);

  const handleDeleteObject = useCallback(async (objectId) => {
    try {
      await api.delete(`/objects/${objectId}`);
      setObjects(prev => prev.filter(obj => obj.id !== objectId));
      message.success('Объект удален');
    } catch (error) {
      message.error('Ошибка при удалении объекта');
    }
  }, []);

  const handleMapMove = useCallback((e) => {
    const center = e.target.getCenter();
    setCoords({
      lat: center.lat.toFixed(6),
      lng: center.lng.toFixed(6),
      zoom: e.target.getZoom()
    });
  }, []);

  const handleExport = useCallback(() => {
    const mapElement = document.querySelector('.leaflet-container');
    
    if (exportFormat === 'geojson') {
      exportGeoJSON();
      return;
    }

    html2canvas(mapElement).then(canvas => {
      const link = document.createElement('a');
      link.download = `lunar-map-export.${exportFormat}`;
      link.href = canvas.toDataURL(`image/${exportFormat}`);
      link.click();
    });
  }, [exportFormat]);

  const exportGeoJSON = () => {
    const data = {
      type: 'FeatureCollection',
      features: objects.map(obj => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [obj.lng, obj.lat]
        },
        properties: {
          id: obj.id,
          type: obj.type,
          name: obj.name
        }
      }))
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lunar-objects.geojson';
    link.click();
  };

  const handlePrint = useCallback(() => {
    const mapElement = document.querySelector('.leaflet-container').cloneNode(true);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Печать карты лунной базы</title>
          <style>
            body { margin: 0; padding: 0; }
            img { max-width: 100%; }
          </style>
        </head>
        <body>
          ${mapElement.innerHTML}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }, []);

  const handleSelectObject = useCallback((obj) => {
    setSelectedObjectType(obj.type);
    setPlacementMode(true);
    message.info(`Выбран: ${obj.name}. Кликните на карту для размещения`);
  }, []);

  const handleMapClick = useCallback(async (e) => {
    if (placementMode && selectedObjectType) {
      const newPosition = e.latlng;
      
      // Проверка на пересечение с существующими зонами
      const isPositionValid = objects.every(obj => {
        const distance = mapRef.current.distance(newPosition, [obj.lat, obj.lng]);
        return distance > obj.restriction_radius;
      });
      
      if (!isPositionValid) {
        message.error('Невозможно разместить объект - пересечение с зоной ограничения');
        return;
      }
  
      const newObject = {
        type: selectedObjectType,
        lat: newPosition.lat,
        lng: newPosition.lng,
        name: `${selectedObjectType}-${Date.now()}`,
        restriction_radius: 50, // Значение по умолчанию
        createdAt: new Date().toISOString()
      };
  
      try {
        const response = await api.post('/objects/', newObject);
        setObjects(prev => [...prev, response.data]);
        setPlacementMode(false);
        message.success('Объект размещен');
      } catch (error) {
        message.error('Ошибка при сохранении объекта');
      }
    }
  }, [placementMode, selectedObjectType, objects]);

  const handleLayerToggle = useCallback((layerId) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: {
        ...prev[layerId],
        visible: !prev[layerId].visible
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

  const renderMapLayers = useCallback(() => {
    return (
      <>
        <LayersControl.BaseLayer name="LROC WAC Mosaic 2011">
        <LayersControl.BaseLayer name="NASA Lunar Reconnaissance Orbiter">
        <TileLayer
          url="https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{x}/{y}.jpg"
          attribution="NASA Lunar Reconnaissance Orbiter"
          maxZoom={8}
          minZoom={0}
        />
</LayersControl.BaseLayer>

        </LayersControl.BaseLayer>



        {Object.values(activeLayers).map(layer => (
          layer.visible && (
            <LayersControl.Overlay key={layer.id} name={layer.name} checked>
              <TileLayer
                url={`${process.env.REACT_APP_GEOSERVER_URL}/wms?service=WMS&version=1.1.0&request=GetMap&layers=lunar:${layer.id}&styles=&bbox=-180,-90,180,90&width=768&height=768&srs=EPSG:4326&format=application/openlayers`}
                opacity={layer.opacity / 100}
              />
            </LayersControl.Overlay>
          )
        ))}

        {userMaps.map(map => {
          if (map.file_type === 'geotiff' && map.id === baseLayerId) {
            return (
              <GeoTIFFLayer 
                key={map.id}
                url={`${process.env.REACT_APP_API_URL}/uploads/maps/${map.file_path.split('/').pop()}`}
                zIndex={10}
              />
            );
          } else if (map.file_type !== 'geotiff' && activeLayers[map.id]?.visible) {
            return (
              <LayersControl.Overlay 
                key={map.id} 
                name={map.name} 
                checked={true}
              >
                <ShapefileLayer mapData={map} />
              </LayersControl.Overlay>
            );
          }
          return null;
        })}
      </>
    );
  }, [activeLayers, userMaps, baseLayerId]);

  useEffect(() => {
    if (token) {
      fetchUserMaps();
      fetchObjects();
    }
  }, [token, fetchUserMaps, fetchObjects]);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    map.on('click', handleMapClick);
    map.on('move', handleMapMove);

    return () => {
      map.off('click', handleMapClick);
      map.off('move', handleMapMove);
    };
  }, [handleMapClick, handleMapMove]);

  if (simplified) {
    return (
      <MapContainer 
        crs={L.CRS.EPSG3857}
        center={[20.5, 30.4]} 
        zoom={15} 
        style={{ height: '100vh', width: '100%' }}
        whenCreated={(map) => {
          mapRef.current = map;
          return map;
        }}
        zoomControl={false}
        className={placementMode ? 'placement-mode-active' : ''}
      >
        <MeasurementControl map={mapRef.current} />
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" />
        {renderMapLayers()}
        <ZoneLayer />
        <ObjectMarkers 
          objects={objects} 
          onDelete={handleDeleteObject}
          onUpdate={handleUpdateObject}
        />
      </MapContainer>
    );
  }

  return (
    <div style={{ padding: '24px', height: 'calc(100vh - 64px)' }}>
      <div style={{ display: 'flex', height: '100%', gap: '20px' }}>
        <div style={{ width: '300px', overflowY: 'auto' }}>
          <MapUpload onUploadSuccess={fetchUserMaps} />
          
          <Card title="Палитра объектов" style={{ marginBottom: '20px' }}>
            <ObjectPalette 
              onSelectObject={handleSelectObject}
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
          </Card>
          
          <Card title="Доступные карты">
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
                      map.file_type === 'geotiff' && (
                        <Tooltip title="Установить как базовый слой">
                          <Button 
                            type={baseLayerId === map.id ? 'primary' : 'default'}
                            icon={<StarFilled />} 
                            size="small"
                            onClick={() => setBaseLayerId(map.id)}
                          />
                        </Tooltip>
                      ),
                      <Popconfirm
                        title="Удалить карту?"
                        onConfirm={() => handleDeleteMap(map.id)}
                        okText="Да"
                        cancelText="Нет"
                      >
                        <Button danger icon={<DeleteOutlined />} size="small" />
                      </Popconfirm>
                    ].filter(Boolean)}
                  >
                    <List.Item.Meta
                      title={<>
                        {map.name}
                        {baseLayerId === map.id && (
                          <Tag color="blue" style={{ marginLeft: 8 }}>основной</Tag>
                        )}
                      </>}
                      description={`Тип: ${map.file_type}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>

          <Card title="Слои карты" style={{ marginTop: 20 }}>
            <Collapse defaultActiveKey={['1']} ghost>
              <Panel header="Тематические слои" key="1" extra={<MenuOutlined />}>
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
          </Card>
        </div>
        
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer 
            crs={L.CRS.EPSG3857}
            center={[20.5, 30.4]} 
            zoom={15} 
            style={{ height: '100%', width: '100%' }}
            whenCreated={(map) => {
              mapRef.current = map;
              return map;
            }}
            className={placementMode ? 'placement-mode-active' : ''}
          >
            <MeasurementControl map={mapRef.current} />
            <LayersControl position="topright">
              {renderMapLayers()}
            </LayersControl>
            <ZoomControl position="bottomright" />
            <ScaleControl position="bottomleft" />
            <ZoneLayer />
            <ObjectMarkers 
              objects={objects} 
              onDelete={handleDeleteObject}
              onUpdate={handleUpdateObject}
            />
          </MapContainer>

          <InfoPanel 
            coords={coords} 
            selectedObject={selectedObject}
            onPrint={handlePrint}
            onExport={handleExport}
            exportFormat={exportFormat}
            onExportFormatChange={setExportFormat}
          />

          {placementMode && (
            <div style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 16px',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              <Text strong>Режим размещения: {selectedObjectType}</Text>
              <br />
              <Text type="secondary">Кликните на карту для размещения объекта</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;