// src/components/Map.tsx
import { MapContainer, TileLayer } from 'react-leaflet';
import './Map.css'; // Подключите CSS-класс

interface MapProps {
  children: React.ReactNode;
}

export default function Map({ children }: MapProps) {
  return (
    <div className="map-container">
      <MapContainer
        center={[59.93, 30.32]} // Питер
        zoom={11}
        style={{ height: '100vh' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {children}
      </MapContainer>
    </div>
  );
}
