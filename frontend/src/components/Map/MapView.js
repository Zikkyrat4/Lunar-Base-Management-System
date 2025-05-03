import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapContainer, TileLayer, LayersControl,
  ZoomControl, ScaleControl 
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { 
  Card, Button, Alert, Spin, Typography
} from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import MapControls from './MapControls';
import MapLayers from './MapLayers';
import MapObjects from './MapObjects';
import InfoPanel from './InfoPanel';
import { useSelector } from 'react-redux';

const { Text } = Typography;

const MapView = ({ simplified = false }) => {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [placementMode, setPlacementMode] = useState(false);
  const [selectedObjectType, setSelectedObjectType] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [objects, setObjects] = useState([]);
  const [userMaps, setUserMaps] = useState([]);
  const [activeLayers, setActiveLayers] = useState({
    elevation: { id: 'elevation', name: 'Рельеф', visible: true, opacity: 70, color: '#722ed1' },
    resources: { id: 'resources', name: 'Ресурсы', visible: true, opacity: 70, color: '#13c2c2' },
    shadows: { id: 'shadows', name: 'Затенение', visible: false, opacity: 50, color: '#595959' }
  });
  const [baseLayerId, setBaseLayerId] = useState(null);
  const mapRef = useRef(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!mapRef.current) return;
  
    const map = mapRef.current;
    
    const handleMove = () => {
      const center = map.getCenter();
      setCoords({
        lat: center.lat.toFixed(6),
        lng: center.lng.toFixed(6)
      });
    };
  
    const handleMouseMove = (e) => {
      setCoords({
        lat: e.latlng.lat.toFixed(6),
        lng: e.latlng.lng.toFixed(6)
      });
    };
  
    map.on('move', handleMove);
    map.on('mousemove', handleMouseMove);
  
    return () => {
      map.off('move', handleMove);
      map.off('mousemove', handleMouseMove);
    };
  }, [mapRef.current]);

  if (simplified) {
    return (
      <MapContainer 
        crs={L.CRS.EPSG3857}
        center={[20.5, 30.4]} 
        zoom={15} 
        style={{ height: '100vh', width: '100%' }}
        whenCreated={(map) => {
          mapRef.current = map;
          const center = map.getCenter();
          setCoords({
            lat: center.lat.toFixed(6),
            lng: center.lng.toFixed(6)
          });
          return map;
        }}
        zoomControl={false}
        className={placementMode ? 'placement-mode-active' : ''}
      >
        <MapLayers 
          simplified 
          activeLayers={activeLayers}
          userMaps={userMaps}
          baseLayerId={baseLayerId}
        />
        <MapObjects simplified />
      </MapContainer>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)' }}>
      <MapControls 
        placementMode={placementMode}
        selectedObjectType={selectedObjectType}
        setPlacementMode={setPlacementMode}
        setSelectedObjectType={setSelectedObjectType}
        mapRef={mapRef}
        activeLayers={activeLayers}
        setActiveLayers={setActiveLayers}
        userMaps={userMaps}
        setUserMaps={setUserMaps}
      />
      
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
        <MapLayers 
          activeLayers={activeLayers}
          userMaps={userMaps}
        />
        <MapObjects 
          placementMode={placementMode} 
          selectedObjectType={selectedObjectType}
          mapRef={mapRef}
          onSelect={setSelectedObject}
        />
      </MapContainer>

      <InfoPanel 
        coords={coords} 
        selectedObject={selectedObject}
        objects={objects}
      />
      
      {placementMode && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 320,
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
  );
};

export default MapView;