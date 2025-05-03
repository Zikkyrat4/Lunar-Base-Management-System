// frontend/src/components/Map/MapLayers.js
import React from 'react';
import { LayersControl, TileLayer } from 'react-leaflet';
import GeoTIFFLayer from './GeoTIFFLayer';
import ShapefileLayer from './ShapefileLayer';
import ZoneLayer from './ZoneLayer';

const MapLayers = ({ simplified, activeLayers, userMaps }) => {
  return (
    <>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="LROC WAC Mosaic">
          <TileLayer
            url="https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{x}/{y}.jpg"
            attribution="NASA Lunar Reconnaissance Orbiter"
            minZoom={0}
          />
        </LayersControl.BaseLayer>

        {/* Пользовательские карты */}
        {userMaps.map(map => (
          <LayersControl.Overlay 
            key={map.id} 
            name={map.name}
            checked={activeLayers[map.id]?.visible}
          >
            {map.file_type === 'geotiff' ? (
              <GeoTIFFLayer 
                layerName={map.file_path} 
                opacity={activeLayers[map.id]?.opacity / 100 || 1}
              />
            ) : (
              <ShapefileLayer 
                layerName={map.file_path} 
                opacity={activeLayers[map.id]?.opacity / 100 || 1}
              />
            )}
          </LayersControl.Overlay>
        ))}

        {/* Тематические слои */}
        {Object.values(activeLayers).map(layer => (
          layer.visible && (
            <LayersControl.Overlay key={layer.id} name={layer.name}>
              <TileLayer
                url={`${process.env.REACT_APP_GEOSERVER_URL}/lunar/wms?service=WMS&version=1.1.0&request=GetMap&layers=lunar:${layer.id}&styles=&bbox=-180,-90,180,90&width=768&height=768&srs=EPSG:4326&transparent=true&format=image/png`}
                opacity={layer.opacity / 100}
              />
            </LayersControl.Overlay>
          )
        ))}
      </LayersControl>

      <ZoneLayer />
    </>
  );
};

export default MapLayers;