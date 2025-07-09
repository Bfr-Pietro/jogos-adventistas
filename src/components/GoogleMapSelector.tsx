
import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

interface GoogleMapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLocation: { lat: number; lng: number };
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const GoogleMapSelector = ({ onLocationSelect, initialLocation }: GoogleMapSelectorProps) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      
      setSelectedLocation({ lat, lng });

      // Reverse geocoding para obter o endereço
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          onLocationSelect(lat, lng, address);
        } else {
          onLocationSelect(lat, lng, `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });
    }
  }, [onLocationSelect]);

  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-gray-600 flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Clique no mapa para selecionar o local do evento
      </div>
      <LoadScript googleMapsApiKey="AIzaSyBFw0Qbyq9zTFTd-tUY6dO_hgQEVgZU1U0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedLocation}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          <Marker
            position={selectedLocation}
            icon={{
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="15" fill="#EF4444" stroke="#FFFFFF" stroke-width="3"/>
                  <text x="20" y="26" text-anchor="middle" fill="white" font-size="16" font-family="Arial">📍</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20)
            }}
            title="Local do Evento"
          />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default GoogleMapSelector;
