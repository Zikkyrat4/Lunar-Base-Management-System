import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as shp from 'shpjs';
import api from '../../api/axios';

const ShapefileLayer = ({ mapData }) => {
  const map = useMap();
  const [layer, setLayer] = useState(null);

  useEffect(() => {
    if (!mapData || mapData.file_type !== 'shapefile') return;

    const loadShapefile = async () => {
      try {
        // Получаем zip архив со всеми файлами Shapefile
        const response = await api.get(`/maps/shapefile/${mapData.id}`, {
          responseType: 'arraybuffer'
        });
        
        // Проверяем, что данные получены
        if (!response.data || response.data.byteLength === 0) {
          throw new Error('Empty response from server');
        }
        
        // Конвертируем Shapefile в GeoJSON
        const geojson = await shp.parseZip(response.data);
        
        if (!geojson) {
          throw new Error('Failed to parse Shapefile');
        }

        // Создаем слой Leaflet
        const newLayer = L.geoJSON(geojson, {
          style: {
            color: '#3388ff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.2
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties) {
              const popupContent = Object.entries(feature.properties)
                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                .join('<br>');
              layer.bindPopup(popupContent);
            }
          }
        });
        
        newLayer.addTo(map);
        setLayer(newLayer);

      } catch (error) {
        console.error('Error loading shapefile:', error);
        // Можно добавить уведомление об ошибке
      }
    };

    loadShapefile();

    return () => {
      if (layer) {
        map.removeLayer(layer);
        setLayer(null);
      }
    };
  }, [mapData, map]);

  return null;
};

export default ShapefileLayer;