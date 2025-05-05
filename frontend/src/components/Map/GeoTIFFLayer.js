import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const GeoTIFFLayer = ({ layerName, opacity = 1 }) => {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!layerName) return;

    const url = `${process.env.REACT_APP_GEOSERVER_URL}/lunar/wms`;
    
    const layer = L.tileLayer.wms(url, {
      layers: `lunar:${layerName}`,
      format: 'image/png',
      transparent: true,
      version: '1.1.0',
      attribution: 'GeoServer',
      opacity: opacity,
      srs: 'EPSG:4326', 
      zIndex: 5
    });

    layer.addTo(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [layerName, map, opacity]);

  return null;
};

export default React.memo(GeoTIFFLayer);