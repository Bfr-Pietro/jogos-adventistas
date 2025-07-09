
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock, Users } from "lucide-react";

interface Event {
  id: string;
  type: string;
  address: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
  status: string;
  confirmed?: string[];
}

interface MapProps {
  events: Event[];
  selectedEvent?: Event | null;
  onEventSelect?: (event: Event) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: -23.5505,
  lng: -46.6333
};

const Map = ({ events, selectedEvent, onEventSelect }: MapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindow, setInfoWindow] = useState<Event | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setIsLoaded(true);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    setIsLoaded(false);
  }, []);

  const handleMarkerClick = (event: Event) => {
    setInfoWindow(event);
    onEventSelect?.(event);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Por acontecer': return 'bg-blue-500';
      case 'Em andamento': return 'bg-green-500';
      case 'Encerrado': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getGameIcon = (type: string) => {
    if (type.includes('futebol') && type.includes('volei')) return '🏆';
    return type.includes('futebol') ? '⚽' : '🏐';
  };

  const getGameName = (type: string) => {
    const sports = type.split(',').map(sport => 
      sport.charAt(0).toUpperCase() + sport.slice(1)
    );
    return sports.join(' + ');
  };

  // Create custom marker icon
  const createCustomMarker = (type: string) => {
    const icon = getGameIcon(type);
    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
          <text x="20" y="28" text-anchor="middle" font-size="16" fill="white">${icon}</text>
        </svg>
      `)}`,
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20)
    };
  };

  // Focus on selected event
  useEffect(() => {
    if (selectedEvent && map && isLoaded) {
      map.panTo({ lat: selectedEvent.lat, lng: selectedEvent.lng });
      map.setZoom(15);
      setInfoWindow(selectedEvent);
    }
  }, [selectedEvent, map, isLoaded]);

  const handleLoadError = () => {
    console.error('Google Maps failed to load');
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg">
      <LoadScript
        googleMapsApiKey="AIzaSyDxQKcWgHcRlLjEYjTrv_tYLdLJHoFCqYQ"
        onError={handleLoadError}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={11}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {events.map((event) => (
            <Marker
              key={event.id}
              position={{ lat: event.lat, lng: event.lng }}
              icon={createCustomMarker(event.type)}
              onClick={() => handleMarkerClick(event)}
              title={`${getGameName(event.type)} - ${event.address}`}
            />
          ))}

          {infoWindow && (
            <InfoWindow
              position={{ lat: infoWindow.lat, lng: infoWindow.lng }}
              onCloseClick={() => setInfoWindow(null)}
            >
              <Card className="w-64 border-none shadow-none">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm flex items-center gap-1">
                        <span>{getGameIcon(infoWindow.type)}</span>
                        {getGameName(infoWindow.type)}
                      </h3>
                      <Badge className={`${getStatusColor(infoWindow.status)} text-white text-xs`}>
                        {infoWindow.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-start gap-1 text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mt-0.5 text-green-600" />
                      <span>{infoWindow.address}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-blue-600" />
                        <span>{new Date(infoWindow.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-blue-600" />
                        <span>{infoWindow.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Users className="h-3 w-3 text-green-600" />
                      <span>{infoWindow.confirmed?.length || 0} confirmados</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default Map;
