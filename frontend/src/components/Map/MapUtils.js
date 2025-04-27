import html2canvas from 'html2canvas';
import { message } from 'antd';

export const handleExport = (format, objects) => {
  try {
    const mapElement = document.querySelector('.leaflet-container');
    
    if (format === 'geojson') {
      exportGeoJSON(objects);
      return;
    }

    html2canvas(mapElement).then(canvas => {
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
      type: 'FeatureCollection',
      features: objects.map(obj => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [obj.lng, obj.lat]
        },
        properties: {
          id: obj.id,
          type: obj.type,
          name: obj.name
        }
      }))
    };
    
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'lunar-objects.geojson';
    link.click();
    message.success('Экспорт в GeoJSON завершен');
  } catch (error) {
    console.error('GeoJSON export error:', error);
    message.error('Ошибка при экспорте GeoJSON');
  }
};

export const handlePrint = () => {
  try {
    const mapElement = document.querySelector('.leaflet-container').cloneNode(true);
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
          ${mapElement.innerHTML}
          <script>
            window.onload = function() { 
              window.print(); 
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (error) {
    console.error('Print error:', error);
    message.error('Ошибка при подготовке к печати');
  }
};