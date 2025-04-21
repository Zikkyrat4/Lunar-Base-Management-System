import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const GeoJSONLayer = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    if (!data) return;

    fetch(data)
      .then(response => response.json())
      .then(geojson => {
        const layer = L.geoJSON(geojson, {
          style: {
            color: '#3388ff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.2
          }
        }).addTo(map);
        
        return () => {
          map.removeLayer(layer);
        };
      });
  }, [data, map]);

  return null;
};

export default GeoJSONLayer;