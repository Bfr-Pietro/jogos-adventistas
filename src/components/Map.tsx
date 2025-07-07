
import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
}

const Map = ({ events, selectedEvent, onEventSelect, isEditing, onLocationSelect }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView([-23.5505, -46.6333], 12);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapRef.current);

    // Add click handler for editing mode
    if (isEditing && onLocationSelect) {
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [isEditing, onLocationSelect]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add markers for each event
    events.forEach((event) => {
      if (!mapRef.current) return;

      const isSelected = selectedEvent?.id === event.id;
      
      // Create custom icon based on sport type
      const sportIcons: { [key: string]: string } = {
        'futebol': '⚽',
        'volei': '🏐',
        'futebol,volei': '🏆',
        'volei,futebol': '🏆'
      };

      const icon = L.divIcon({
        html: `<div style="
          background: ${event.type.includes('futebol') && event.type.includes('volei') ? '#8B5CF6' : 
                     event.type.includes('futebol') ? '#10B981' : '#3B82F6'};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ${isSelected ? 'transform: scale(1.2); z-index: 1000;' : ''}
        ">${sportIcons[event.type] || '🏆'}</div>`,
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([event.lat, event.lng], { icon })
        .addTo(mapRef.current)
        .on('click', () => {
          onEventSelect(event);
        });

      // Add popup with event info
      marker.bindPopup(`
        <div style="text-align: center; min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; font-weight: bold;">
            ${event.type.split(',').map(sport => 
              sport.charAt(0).toUpperCase() + sport.slice(1)
            ).join(' + ')}
          </h3>
          <p style="margin: 5px 0;"><strong>Data:</strong> ${new Date(event.date).toLocaleDateString('pt-BR')}</p>
          <p style="margin: 5px 0;"><strong>Horário:</strong> ${event.time}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> ${event.status}</p>
          <button onclick="window.open('https://www.google.com/maps?q=${event.lat},${event.lng}', '_blank')" 
                  style="
                    background: #4285f4;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                    font-weight: bold;
                  ">
            Abrir no Google Maps
          </button>
        </div>
      `);

      if (isSelected) {
        marker.openPopup();
        mapRef.current.setView([event.lat, event.lng], 15);
      }
    });
  }, [events, selectedEvent, onEventSelect]);

  return (
    <div className="relative w-full h-96 rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
      {/* Map Title */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md z-[1000]">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          {isEditing ? 'Clique no mapa para selecionar local' : 'Mapa dos Jogos'}
        </h3>
      </div>
      
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
      
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
        </div>
      </div>
    </div>
  );
};

export default Map;
