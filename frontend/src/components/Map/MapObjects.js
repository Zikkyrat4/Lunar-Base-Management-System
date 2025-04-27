import React, { useState, useEffect, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import ObjectMarkers from './ObjectMarkers';
import MeasurementControl from './MeasurementControl';
import api from '../../api/axios';
import { message } from 'antd';

const MapObjects = ({ 
  simplified, 
  placementMode, 
  selectedObjectType,
  mapRef
}) => {
  const [objects, setObjects] = useState([]);
  const map = useMap();

  const fetchObjects = useCallback(async () => {
    try {
      const response = await api.get('/objects/');
      setObjects(response.data);
    } catch (error) {
      console.error('Error loading objects:', error);
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
      console.error('Error updating object:', error);
      message.error('Ошибка при обновлении объекта');
    }
  }, []);
  

  const handleDeleteObject = useCallback(async (objectId) => {
    try {
      await api.delete(`/objects/${objectId}`);
      setObjects(prev => prev.filter(obj => obj.id !== objectId));
      message.success('Объект удален');
    } catch (error) {
      console.error('Error deleting object:', error);
      message.error('Ошибка при удалении объекта');
    }
  }, []);
  

  const handleMapClick = useCallback(async (e) => {
    if (placementMode && selectedObjectType && mapRef.current) {
      const newPosition = e.latlng;
      
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
        restriction_radius: 50,
        createdAt: new Date().toISOString()
      };
  
      try {
        const response = await api.post('/objects/', newObject);
        setObjects(prev => [...prev, response.data]);
        message.success('Объект размещен');
      } catch (error) {
        console.error('Error creating object:', error);
        message.error('Ошибка при размещении объекта');
      }
    }
  }, [placementMode, selectedObjectType, objects, mapRef]);

  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  useEffect(() => {
    if (!map) return;

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, handleMapClick]);

  return (
    <>
      {!simplified && <MeasurementControl map={map} />}
      <ObjectMarkers 
        objects={objects} 
        onDelete={handleDeleteObject}
        onUpdate={handleUpdateObject}
      />
    </>
  );
};

export default MapObjects;