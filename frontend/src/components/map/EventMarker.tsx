// src/components/EventMarker.tsx
import { Marker, Popup } from 'react-leaflet';

interface EventMarkerProps {
  position: [number, number];
  title: string;
}

export default function EventMarker({ position, title }: EventMarkerProps) {
  return (
    <Marker position={position}>
      <Popup>{title}</Popup>
    </Marker>
  );
}