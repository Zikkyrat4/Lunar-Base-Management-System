import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure/dist/leaflet-measure.js';

const MeasurementControl = ({ map }) => {
  useEffect(() => {
    if (!map) return;

    // Устанавливаем русскую локализацию перед инициализацией
    L.Measure = L.Measure || {};
    L.Measure.Localization = {
      ru: {
        distance: 'Расстояние',
        area: 'Площадь',
        bearing: 'Азимут',
        segment: 'Сегмент',
        total: 'Всего',
        meters: 'метры',
        kilometers: 'километры',
        feet: 'футы',
        miles: 'мили',
        sqmeters: 'кв. метры',
        sqkilometers: 'кв. километры',
        hectares: 'гектары',
        acres: 'акры',
        sqfeet: 'кв. футы',
        start: 'Кликните, чтобы начать измерение',
        cont: 'Кликните, чтобы продолжить измерение',
        end: 'Кликните, чтобы закончить измерение',
        title: 'Измерение (Esc)',
        text: 'Измерение',
        clear: 'Очистить',
        undo: 'Отменить'
      }
    };

    // Инициализируем инструмент измерения с русской локализацией
    const measure = new L.Control.Measure({
      position: 'bottomleft',
      primaryLengthUnit: 'meters',
      secondaryLengthUnit: 'kilometers',
      primaryAreaUnit: 'sqmeters',
      activeColor: '#1890ff',
      captureZIndex: 10000,
      localization: 'ru'
    });

    map.addControl(measure);

    return () => {
      if (map.measureControl) {
        map.removeControl(map.measureControl);
      }
    };
  }, [map]);

  return null;
};

export default MeasurementControl;