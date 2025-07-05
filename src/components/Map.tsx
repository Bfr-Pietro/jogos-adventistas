
import React from 'react';
import { MapPin } from 'lucide-react';

interface Event {
  id: number;
  type: 'futebol' | 'volei';
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
}

const Map = ({ events, selectedEvent, onEventSelect }: MapProps) => {
  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg shadow-lg overflow-hidden border-2 border-gray-200">
      {/* Map Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"%3E%3Cpath d=\"M0 0h100v100H0z\" fill=\"%23f0f0f0\"/%3E%3Cpath d=\"M10 10h80v80H10z\" fill=\"none\" stroke=\"%23ddd\" stroke-width=\"1\"/%3E%3C/svg%3E')]"></div>
      </div>
      
      {/* Map Title */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-green-600" />
          Mapa dos Jogos
        </h3>
      </div>
      
      {/* Event Markers */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full max-w-lg">
          {events.map((event, index) => {
            const isSelected = selectedEvent?.id === event.id;
            const positions = [
              { top: '30%', left: '40%' },
              { top: '60%', left: '65%' },
              { top: '45%', left: '25%' },
              { top: '70%', left: '45%' },
            ];
            
            const position = positions[index % positions.length];
            
            return (
              <div
                key={event.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                  isSelected ? 'scale-125 z-10' : 'hover:scale-110'
                }`}
                style={position}
                onClick={() => onEventSelect(event)}
              >
                <div className={`relative ${isSelected ? 'animate-pulse' : ''}`}>
                  {/* Marker Pin */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-lg border-2 border-white ${
                    event.type === 'futebol' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}>
                    <span className="text-white text-sm">
                      {event.type === 'futebol' ? '⚽' : '🏐'}
                    </span>
                  </div>
                  
                  {/* Marker Tail */}
                  <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                    event.type === 'futebol' ? 'border-t-green-500' : 'border-t-blue-500'
                  }`}></div>
                  
                  {/* Ripple Effect for Selected */}
                  {isSelected && (
                    <div className={`absolute inset-0 rounded-full animate-ping ${
                      event.type === 'futebol' ? 'bg-green-400' : 'bg-blue-400'
                    } opacity-75`}></div>
                  )}
                </div>
                
                {/* Event Info Tooltip */}
                {isSelected && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg px-3 py-2 min-w-max border">
                    <div className="text-xs font-semibold text-gray-800">
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(event.date).toLocaleDateString('pt-BR')} - {event.time}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-white"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Map Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
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
        </div>
      </div>
    </div>
  );
};

export default Map;
