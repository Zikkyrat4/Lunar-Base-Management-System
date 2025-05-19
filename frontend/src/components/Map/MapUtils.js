// src/components/MapUtils.js
import html2canvas from 'html2canvas';
import { message } from 'antd';

export const handlePrint = () => {
  try {
    const mapContainer = document.querySelector('.leaflet-container');
    if (!mapContainer) throw new Error('Контейнер карты не найден');

    // Скрываем элементы управления
    const controls = document.querySelectorAll('.leaflet-control-container');
    controls.forEach(control => control.style.display = 'none');

    // Создаем изображение карты
    html2canvas(mapContainer, {
      useCORS: true,
      allowTaint: false,
      scale: 2,
      onclone: (doc) => {
        // Дополнительные настройки для скрытия элементов
        doc.querySelectorAll('.leaflet-control-container').forEach(el => el.style.display = 'none');
      }
    }).then(canvas => {
      // Создаем временную страницу для печати
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
            <img src="${canvas.toDataURL()}" />
          </body>
        </html>
      `);
      printWindow.document.close();

      // Запускаем печать
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      message.success('Подготовка к печати...');
    });
  } catch (error) {
    console.error('Print error:', error);
    message.error('Ошибка при подготовке к печати');
  }
};

export const handleExport = (format, objects) => {
  try {
    const mapContainer = document.querySelector('.leaflet-container');
    if (!mapContainer) throw new Error('Контейнер карты не найден');

    // Делаем все слои видимыми перед экспортом
    const layers = document.querySelectorAll('.leaflet-overlay-pane svg, .leaflet-marker-pane img');
    layers.forEach(layer => layer.style.visibility = 'visible');

    html2canvas(mapContainer, {
      useCORS: true,
      allowTaint: false,
      scale: 2,
      logging: false,
      width: mapContainer.offsetWidth,
      height: mapContainer.offsetHeight,
      onclone: (doc) => {
        // Скрываем элементы управления
        doc.querySelectorAll('.leaflet-control-container').forEach(el => el.style.display = 'none');
      }
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `lunar-map-export.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();
      message.success(`Экспорт в ${format.toUpperCase()} завершен`);
    }).catch(error => {
      console.error('Export error:', error);
      message.error('Ошибка при экспорте');
    });
  } catch (error) {
    console.error('Export error:', error);
    message.error('Ошибка при экспорте');
  }
};

export const exportGeoJSON = (objects) => {
  try {
    const data = {
      type: "FeatureCollection",
      features: objects.map(obj => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [obj.lng, obj.lat]
        },
        properties: {
          name: obj.name,
          description: obj.description,
          type: obj.type,
          radius: obj.restriction_radius
        }
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = 'lunar-base-objects.geojson';
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    message.success('Экспорт GeoJSON завершен');
  } catch (error) {
    console.error('GeoJSON Export error:', error);
    message.error('Ошибка при экспорте GeoJSON');
  }
};