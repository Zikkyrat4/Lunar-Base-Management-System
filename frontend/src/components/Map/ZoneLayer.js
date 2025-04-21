import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const ZoneLayer = () => {
  const map = useMap();
  
  useEffect(() => {
    const zones = [
      {
        type: 'danger',
        coords: [[20.3, 30.2], [20.3, 30.6], [20.7, 30.6], [20.7, 30.2]],
        message: 'Опасная зона - высокая радиация',
        color: '#ff4d4f'
      },
      {
        type: 'research',
        coords: [[20.1, 30.3], [20.1, 30.5], [20.2, 30.5], [20.2, 30.3]],
        message: 'Зона исследований - ограниченный доступ',
        color: '#faad14'
      },
      {
        type: 'resources',
        coords: [[20.8, 30.1], [20.8, 30.3], [20.9, 30.3], [20.9, 30.1]],
        message: 'Водяной лед - перспективная зона добычи',
        color: '#13c2c2'
      }
    ];

    const layers = zones.map(zone => {
      const polygon = L.polygon(zone.coords, { 
        color: zone.color,
        fillOpacity: 0.2,
        weight: 2,
        className: `zone-${zone.type}`
      })
      .bindPopup(`
        <div class="zone-popup">
          <h4>${zone.message}</h4>
          <p>Тип: ${zone.type === 'danger' ? 'Опасная' : 
                    zone.type === 'research' ? 'Исследований' : 'Ресурсов'}</p>
        </div>
      `);
      
      polygon.on('mouseover', () => {
        polygon.setStyle({ weight: 4, fillOpacity: 0.3 });
      });
      
      polygon.on('mouseout', () => {
        polygon.setStyle({ weight: 2, fillOpacity: 0.2 });
      });
      
      polygon.addTo(map);
      return polygon;
    });

    return () => {
      layers.forEach(layer => map.removeLayer(layer));
    };
  }, [map]);

  return null;
};

export default ZoneLayer;