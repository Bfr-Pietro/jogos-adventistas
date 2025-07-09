
import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface Event {
  id: string;
  type: string;
  address: string;
  date: string;
  time: string;
  status: 'Por acontecer' | 'Em andamento' | 'Encerrado';
  lat: number;
  lng: number;
  confirmed: string[];
}

interface MapProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventSelect: (event: Event) => void;
  isEditing?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number };
}

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const Map = ({ events, selectedEvent, onEventSelect, isEditing, onLocationSelect, selectedLocation }: MapProps) => {
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = React.useState<google.maps.Marker | null>(null);

  const onLoad = React.useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = React.useCallback((event: google.maps.MapMouseEvent) => {
    if (isEditing && onLocationSelect && event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      onLocationSelect(lat, lng);
    }
  }, [isEditing, onLocationSelect]);

  // Handle selected location marker for editing mode
  React.useEffect(() => {
    if (!map || !isEditing || !selectedLocation) return;

    // Remove existing selected marker
    if (selectedMarker) {
      selectedMarker.setMap(null);
    }

    // Create new selected marker
    const marker = new google.maps.Marker({
      position: selectedLocation,
      map: map,
      icon: {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="15" fill="#EF4444" stroke="#FFFFFF" stroke-width="3"/>
            <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-family="Arial">📍</text>
          </svg>
        `),
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20)
      },
      title: 'Local Selecionado'
    });

    setSelectedMarker(marker);
    map.setCenter(selectedLocation);
    map.setZoom(15);

  }, [selectedLocation, isEditing, map, selectedMarker]);

  const getSportIcon = (eventType: string) => {
    const sportIcons: { [key: string]: string } = {
      'futebol': '⚽',
      'volei': '🏐',
      'futebol,volei': '🏆',
      'volei,futebol': '🏆'
    };
    return sportIcons[eventType] || '🏆';
  };

  const getSportColor = (eventType: string) => {
    if (eventType.includes('futebol') && eventType.includes('volei')) return '#8B5CF6';
    if (eventType.includes('futebol')) return '#10B981';
    return '#3B82F6';
  };

  return (
    <div className="relative w-full h-96 rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
      {/* Map Title */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md z-[1000]">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          {isEditing ? 'Clique no mapa para selecionar local' : 'Mapa dos Jogos'}
        </h3>
      </div>
      
      {/* Google Maps Container */}
      <LoadScript googleMapsApiKey="AIzaSyBFw0Qbyq9zTFTd-tUY6dO_hgQEVgZU1U0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: -23.5505, lng: -46.6333 }}
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {!isEditing && events.map((event) => (
            <Marker
              key={event.id}
              position={{ lat: event.lat, lng: event.lng }}
              onClick={() => onEventSelect(event)}
              icon={{
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="15" fill="${getSportColor(event.type)}" stroke="#FFFFFF" stroke-width="3"/>
                    <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-family="Arial">${getSportIcon(event.type)}</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 20)
              }}
              title={`${event.type} - ${event.date} ${event.time}`}
            />
          ))}
        </GoogleMap>
      </LoadScript>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md z-[1000]">
        <div className="text-xs font-semibold text-gray-700 mb-2">Legenda</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Futebol</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Vôlei</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Ambos</span>
          </div>
          {isEditing && (
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Selecionado</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;
