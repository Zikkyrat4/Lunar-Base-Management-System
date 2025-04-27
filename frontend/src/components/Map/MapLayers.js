import React from 'react';
import { LayersControl, TileLayer } from 'react-leaflet';
import ShapefileLayer from './ShapefileLayer';
import GeoTIFFLayer from './GeoTIFFLayer';
import ZoneLayer from './ZoneLayer';

const MapLayers = ({ simplified, activeLayers, userMaps }) => {
  return (
    <>
      {/* Базовые слои (будут отображаться в стандартном контроле слоев Leaflet) */}
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="LROC WAC Mosaic">
          <TileLayer
            url="https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{x}/{y}.jpg"
            attribution="NASA Lunar Reconnaissance Orbiter"
            minZoom={0}
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Lunar Orbiter">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Esri, NASA"
            maxZoom={8}
          />
        </LayersControl.BaseLayer>

        {/* Тематические слои */}
        {Object.values(activeLayers).map(layer => (
          layer.visible && (
            <LayersControl.Overlay key={layer.id} name={layer.name}>
              <TileLayer
                url={`${process.env.REACT_APP_GEOSERVER_URL}/wms?service=WMS&version=1.1.0&request=GetMap&layers=lunar:${layer.id}&styles=&bbox=-180,-90,180,90&width=768&height=768&srs=EPSG:4326&format=application/openlayers`}
                opacity={layer.opacity / 100}
              />
            </LayersControl.Overlay>
          )
        ))}

        {/* Пользовательские карты */}
        {userMaps.map(map => {
          if (map.file_type === 'geotiff') {
            return (
              <GeoTIFFLayer 
                key={map.id}
                url={`${process.env.REACT_APP_API_URL}/uploads/maps/${map.file_path.split('/').pop()}`}
                zIndex={10}
              />
            );
          } else if (map.file_type !== 'geotiff' && activeLayers[map.id]?.visible) {
            return (
              <ShapefileLayer key={map.id} mapData={map} />
            );
          }
          return null;
        })}
      </LayersControl>

      <ZoneLayer />
    </>
  );
};

export default MapLayers;