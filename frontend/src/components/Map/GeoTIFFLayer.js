import React, { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import * as GeoTIFF from 'geotiff';
import { Alert, Spin } from 'antd';

const GeoTIFFLayer = ({ url, zIndex = 1, opacity = 1.0 }) => {
  const map = useMap();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const layerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let canvas = null;

    const loadAndDisplayImage = async () => {
      try {
        setLoading(true);

        // 1. Загрузка данных
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');
        const arrayBuffer = await response.arrayBuffer();

        // 2. Парсинг GeoTIFF
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        const width = image.getWidth();
        const height = image.getHeight();

        console.log('Image dimensions:', width, height); // Отладочная информация
        console.log('Image aspect ratio:', width / height); // Отладочная информация

        // 3. Чтение данных изображения
        const raster = await image.readRasters({
          interleave: true,
          width: width,
          height: height,
          samples: [0],
          fillValue: 0,
        });

        console.log('Raster data length:', raster.length); // Отладочная информация
        console.log('First few raster values:', raster.slice(0, 10)); // Отладочная информация

        // 4. Создание и заполнение canvas
        canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Обработка данных изображения
        if (raster && raster.length > 0) {
          for (let i = 0; i < width * height; i++) {
            const val = raster[i] || 0;
            data[i * 4] = val;     // R
            data[i * 4 + 1] = val; // G
            data[i * 4 + 2] = val; // B
            data[i * 4 + 3] = 255; // Alpha
          }
        } else {
          throw new Error('No raster data found');
        }

        ctx.putImageData(imageData, 0, 0);

        // 5. Определение границ изображения на основе центра карты и масштаба
        const center = map.getCenter();
        const mapZoom = map.getZoom();

        // Рассчитываем размеры в градусах на основе зума и соотношения сторон
        const sizeFactor = 0.2 / Math.pow(1.5, mapZoom - 15);
        const latSize = sizeFactor;
        const lngSize = latSize * (width / height);

        const bounds = [
          [center.lat + latSize / 2, center.lng - lngSize / 2], // NW
          [center.lat - latSize / 2, center.lng + lngSize / 2], // SE
        ];

        // 6. Создание слоя изображения
        if (layerRef.current) {
          map.removeLayer(layerRef.current);
        }

        const newLayer = L.imageOverlay(canvas.toDataURL(), bounds, {
          opacity,
          zIndex,
          interactive: true,
        }).addTo(map);

        if (isMounted) {
          layerRef.current = newLayer;
          setLoading(false);
        }
      } catch (err) {
        console.error('Error processing GeoTIFF:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load GeoTIFF');
          setLoading(false);
        }
      }
    };

    loadAndDisplayImage();

    return () => {
      isMounted = false;
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [url, map, opacity, zIndex]);

  if (loading) {
    return (
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        <Spin size="large" tip="Загрузка изображения..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Ошибка загрузки"
        description={error}
        type="error"
        showIcon
        style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}
      />
    );
  }

  return null;
};

export default GeoTIFFLayer;