/**
 * MapContainer Component
 * 
 * Reusable Leaflet map wrapper with standard initialization,
 * responsive sizing, and common features.
 */

import React, { ReactNode, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2 } from 'lucide-react';

interface MapContainerProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  children?: ReactNode;
  loading?: boolean;
  onMapMove?: (bounds: L.LatLngBounds) => void;
  showControls?: boolean;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Inner component to handle map events
 */
function MapEvents({ onMapMove }: { onMapMove?: (bounds: L.LatLngBounds) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleMoveEnd = () => {
      if (onMapMove) {
        onMapMove(map.getBounds());
      }
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onMapMove]);

  return null;
}

/**
 * MapContainer Component
 * 
 * Provides Leaflet map with responsive sizing, loading state,
 * and standard tile layers.
 */
export const MapContainer: React.FC<MapContainerProps> = ({
  center = [20, 78], // Default to India center
  zoom = 6,
  children,
  loading = false,
  onMapMove,
  showControls = true,
  minZoom = 3,
  maxZoom = 19,
  className = '',
  style,
}) => {
  // Get tile layer URL
  const getTileLayerUrl = () => {
    const baseUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    // Could add dark/satellite options here in future
    return baseUrl;
  };

  const getTileLayerAttribution = () => {
    return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  };

  return (
    <div
      className={`relative w-full rounded-lg overflow-hidden ${className}`}
      style={{
        height: '400px',
        minHeight: '300px',
        ...style,
      }}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map */}
      <LeafletMapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={showControls}
        scrollWheelZoom={true}
        dragging={true}
      >
        {/* Tile Layer */}
        <TileLayer
          url={getTileLayerUrl()}
          attribution={getTileLayerAttribution()}
          maxZoom={maxZoom}
          minZoom={minZoom}
        />

        {/* Map Event Handler */}
        <MapEvents onMapMove={onMapMove} />

        {/* Children (markers, overlays, etc.) */}
        {children}
      </LeafletMapContainer>
    </div>
  );
};

export default MapContainer;
