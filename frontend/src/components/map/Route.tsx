// src/components/Route.tsx
import { Polyline } from 'react-leaflet';

interface RouteProps {
  path: [number, number][];
}

export default function Route({ path }: RouteProps) {
  return <Polyline positions={path} color="red" />;
}