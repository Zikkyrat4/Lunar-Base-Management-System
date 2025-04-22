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
  const canvasRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let rasterData = null;

    const loadAndDisplayImage = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Загрузка данных
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();

        // 2. Парсинг GeoTIFF
        const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
        const image = await tiff.getImage();
        
        // 3. Получение реальных границ изображения
        const [minX, minY, maxX, maxY] = image.getBoundingBox();
        const bounds = [
          [minY, minX], // SW
          [maxY, maxX]  // NE
        ];

        // 4. Чтение данных изображения с учетом всех каналов
        const { width, height } = image;
        rasterData = await image.readRasters({
          interleave: true,
          samples: [0, 1, 2] // RGB каналы
        });

        // 5. Создание canvas и обработка данных
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        canvasRef.current = canvas;

        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        const applyColorCorrection = (data, width, height) => {
          // Простая гамма-коррекция
          const gamma = 1.8;
          for (let i = 0; i < width * height * 4; i += 4) {
            data[i] = Math.pow(data[i] / 255, gamma) * 255;     // R
            data[i + 1] = Math.pow(data[i + 1] / 255, gamma) * 255; // G
            data[i + 2] = Math.pow(data[i + 2] / 255, gamma) * 255; // B
          }
        };

        // Обработка RGB данных
        if (rasterData && rasterData.length > 0) {
          for (let i = 0; i < width * height; i++) {
            const r = rasterData[i] || 0;
            const g = rasterData[i + width * height] || 0;
            const b = rasterData[i + 2 * width * height] || 0;
            
            data[i * 4] = r;     // R
            data[i * 4 + 1] = g; // G
            data[i * 4 + 2] = b; // B
            data[i * 4 + 3] = 255; // Alpha
          }
        } else {
          throw new Error('No raster data found');
        }

        applyColorCorrection(data, width, height);

        ctx.putImageData(imageData, 0, 0);

        // 6. Удаление старого слоя, если существует
        if (layerRef.current) {
          map.removeLayer(layerRef.current);
        }

        // 7. Создание нового слоя с правильными границами
        const newLayer = L.imageOverlay(canvas.toDataURL(), bounds, {
          opacity,
          zIndex,
          interactive: true,
          attribution: 'GeoTIFF Layer'
        }).addTo(map);

        if (isMounted) {
          layerRef.current = newLayer;
          setLoading(false);
        }

        // 8. Автоматическое масштабирование под слой
        map.fitBounds(bounds);

      } catch (err) {
        console.error('GeoTIFF processing error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to process GeoTIFF');
          setLoading(false);
        }
      }
    };

    loadAndDisplayImage();

    return () => {
      isMounted = false;
      // Очистка при размонтировании
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
      if (canvasRef.current) {
        canvasRef.current = null;
      }
      rasterData = null;
    };
  }, [url, map, opacity, zIndex]);

  if (loading) {
    return (
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      }}>
        <Spin size="large" tip="Загрузка GeoTIFF..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Ошибка загрузки GeoTIFF"
        description={error}
        type="error"
        showIcon
        style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 1000,
          maxWidth: '80%'
        }}
      />
    );
  }

  return null;
};

export default React.memo(GeoTIFFLayer);