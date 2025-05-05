import React from 'react';
import { LayersControl, TileLayer } from 'react-leaflet';
import GeoTIFFLayer from './GeoTIFFLayer';
import ShapefileLayer from './ShapefileLayer';
import ZoneLayer from './ZoneLayer';

const MapLayers = ({ simplified, activeLayers, userMaps, reliefOpacity = 0.7 }) => {
  return (
    <>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Moon Basemap">
          <TileLayer
            url="https://cartocdn-gusc.global.ssl.fastly.net/opmbuilder/api/v1/map/named/opm-moon-basemap-v0-1/all/{z}/{x}/{y}.png"
            attribution="Moon Basemap"
            minZoom={0}
            maxZoom={9}
          />
        </LayersControl.BaseLayer>

        {/* Слой рельефа с регулируемой прозрачностью */}
        <LayersControl.Overlay name="Hillshaded Relief" checked>
          <TileLayer
            url="https://s3.amazonaws.com/opmbuilder/301_moon/tiles/w/hillshaded-albedo/{z}/{x}/{y}.png"
            attribution="Relief"
            opacity={reliefOpacity}
            tms={true}
          />
        </LayersControl.Overlay>

        {/* Пользовательские карты */}
        {userMaps.map(map => (
          <LayersControl.Overlay 
            key={map.id} 
            name={map.name}
            checked={activeLayers[map.id]?.visible || false}
          >
            {map.file_type === 'geotiff' ? (
              <GeoTIFFLayer 
                layerName={map.file_path} 
                opacity={(activeLayers[map.id]?.opacity || 100) / 100}
              />
            ) : (
              <ShapefileLayer 
                layerName={map.file_path} 
                opacity={(activeLayers[map.id]?.opacity || 100) / 100}
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
                opacity={(layer.opacity || 100) / 100}
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