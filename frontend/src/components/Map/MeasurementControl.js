import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure/dist/leaflet-measure.js';

const MeasurementControl = ({ map }) => {
  useEffect(() => {
    if (!map) return;

    // Добавляем русскую локализацию
    L.Control.Measure.include({
      options: {
        localization: {
          title: "Измерение",
          popup: {
            text: "Длина: <b>{distance}</b>.<br />Азимут: <b>{bearing}°</b>.",
            subtext: "Кликните, чтобы начать новое измерение."
          },
          segments: {
            segment: "Сегмент",
            total: "Всего"
          },
          units: {
            meters: "метры",
            kilometers: "километры",
            feet: "футы",
            miles: "мили",
            sqmeters: "кв. метры",
            sqkilometers: "кв. километры",
            hectares: "гектары",
            acres: "акры",
            sqfeet: "кв. футы"
          },
          measureTooltip: {
            start: "Кликните, чтобы начать измерение",
            cont: "Кликните, чтобы продолжить измерение",
            end: "Кликните, чтобы закончить измерение"
          },
          buttons: {
            title: "Измерение (Esc)",
            text: "Измерение"
          },
          clear: {
            title: "Очистить",
            text: "Очистить"
          }
        }
      }
    });

    // Инициализируем инструмент измерения
    const measure = new L.Control.Measure({
      position: 'bottomleft', // Позиция в левом нижнем углу
      primaryLengthUnit: 'meters',
      secondaryLengthUnit: 'kilometers',
      primaryAreaUnit: 'sqmeters',
      activeColor: '#1890ff',
      captureZIndex: 10000
    });

    // Добавляем инструмент измерения на карту
    map.addControl(measure);

    return () => {
      // Очистка при размонтировании
      if (map.measureControl) {
        map.removeControl(map.measureControl);
      }
    };
  }, [map]);

  return null;
};

export default MeasurementControl;