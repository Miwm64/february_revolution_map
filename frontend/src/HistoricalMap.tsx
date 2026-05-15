import { useEffect, useRef } from 'react';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

// =========================
// SETTINGS
// =========================
const MAP_WIDTH = 5000;

const MAP_HEIGHT = 6954;

const SCALE = 1 / 32;

const IMAGE_BOUNDS: L.LatLngBoundsExpression = [
    [0, 0],
    [MAP_HEIGHT, MAP_WIDTH],
];

const CustomCRS = L.extend(
    {},
    L.CRS.Simple,
    {
        transformation:
            new L.Transformation(
                SCALE,
                0,
                SCALE,
                0
            ),
    }
);

interface Event {
    id: number;
    title: string;
    date: string;
    description: string;
    x: number;
    y: number;
}

interface Props {
    events: Event[];
}

export default function HistoricalMap({
                                          events,
                                      }: Props) {
    const mapRef =
        useRef<HTMLDivElement>(null);

    const leafletMap =
        useRef<L.Map | null>(null);

    const tileLayer =
        useRef<L.TileLayer | null>(null);

    const markersRef =
        useRef<L.Marker[]>([]);

    // =========================
    // INIT MAP
    // =========================
    useEffect(() => {
        if (
            !mapRef.current ||
            leafletMap.current
        ) {
            return;
        }

        console.log(
            '🗺️ Creating Map...'
        );

        leafletMap.current = L.map(
            mapRef.current,
            {
                crs: CustomCRS,

                maxBounds: IMAGE_BOUNDS,

                maxBoundsViscosity: 1.0,

                attributionControl: false,

                zoomSnap: 0.5,
            }
        );

        leafletMap.current.fitBounds(
            IMAGE_BOUNDS
        );

        const minZoom =
            leafletMap.current.getBoundsZoom(
                IMAGE_BOUNDS
            );

        console.log({
            minZoom,
            dpr:
            window.devicePixelRatio,
            width: window.innerWidth,
            height:
            window.innerHeight,
        });

        // =========================
        // DPR FIX
        // =========================
        const REFERENCE_DPR = 2;

        const dpr =
            window.devicePixelRatio || 1;

        const multiplier =
            2.1 *
            (REFERENCE_DPR / dpr);

        leafletMap.current.setMinZoom(
            minZoom +
            Math.log2(multiplier)
        );

        leafletMap.current.setMaxZoom(
            7
        );

        // =========================
        // TILE LAYER
        // =========================
        tileLayer.current =
            L.tileLayer(
                '/tiles/{z}/{x}/{y}.png',
                {
                    minZoom: 1,

                    maxZoom: 5,

                    maxNativeZoom: 5,

                    tileSize: 256,

                    noWrap: true,

                    bounds: IMAGE_BOUNDS,

                    detectRetina: false,
                }
            ).addTo(
                leafletMap.current
            );

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();

                leafletMap.current =
                    null;
            }
        };
    }, []);

    // =========================
    // MARKERS
    // =========================
    useEffect(() => {
        if (!leafletMap.current)
            return;

        markersRef.current.forEach(
            marker =>
                leafletMap.current?.removeLayer(
                    marker
                )
        );

        markersRef.current = [];

        events.forEach(event => {
            const marker = L.marker([
                event.y,
                event.x,
            ])
                .addTo(
                    leafletMap.current!
                )
                .bindPopup(`
          <div style="min-width: 200px;">
            <div style="font-weight: bold; color: #2563eb; margin-bottom: 4px;">
              ${event.date}
            </div>

            <div style="font-weight: 600; margin-bottom: 4px;">
              ${event.title}
            </div>

            <div style="font-size: 12px; color: #666;">
              ${event.description}
            </div>
          </div>
        `);

            markersRef.current.push(
                marker
            );
        });
    }, [events]);

    // =========================
    // CONTROLS
    // =========================
    const handleZoomIn = () =>
        leafletMap.current?.zoomIn();

    const handleZoomOut = () =>
        leafletMap.current?.zoomOut();

    const handleCenter = () => {
        leafletMap.current?.fitBounds(
            IMAGE_BOUNDS
        );
    };

    return (
        <>
            <div
                ref={mapRef}
                className="absolute inset-0"
            />

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-gray-800 p-2 rounded-xl border border-gray-700 shadow-xl z-[1000]">
                <button
                    onClick={handleCenter}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
                >
                    Весь город
                </button>

                <button
                    onClick={handleZoomIn}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition"
                >
                    +
                </button>

                <button
                    onClick={handleZoomOut}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition"
                >
                    -
                </button>
            </div>
        </>
    );
}