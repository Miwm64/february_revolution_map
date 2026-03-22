// src/components/Map.tsx
import { MapContainer, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import './Map.css';

interface MapProps {
    children?: React.ReactNode;
    imageUrl: string; // URL of your single PNG
    bounds: [[number, number], [number, number]]; // Southwest and Northeast corners
}

export default function Map({ children, imageUrl, bounds }: MapProps) {
    return (
        <div className="map-container">
            <MapContainer
                center={[
                    (bounds[0][0] + bounds[1][0]) / 2,
                    (bounds[0][1] + bounds[1][1]) / 2,
                ]}
                zoom={11}
                style={{ height: '100vh', width: '100%' }}
                crs={L.CRS.Simple} // optional if image is not geo-referenced
            >
                <ImageOverlay url={imageUrl} bounds={bounds} />
                {children}
            </MapContainer>
        </div>
    );
}