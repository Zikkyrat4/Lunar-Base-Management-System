import React, { useEffect, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';

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

export default MeasurementControl;