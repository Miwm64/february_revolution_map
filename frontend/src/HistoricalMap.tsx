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
            new L.Transformation(SCALE, 0, SCALE, 0),
    }
);

interface Event {
    id: number;
    title: string;
    description: string;
    time: string;
    displayTime: string; // добавляем опционально, так как оно создается динамически
    displayTimeHMS: string;
    coordinates: { x: number; y: number };
    nextEvent: number | null;
    prevEvent: number | null;
    eventType: string;
    timePeriod: string;
}

interface Props {
    events: Event[];
    isMarkerMode: boolean;
    onMarkerModeChange: (isEnabled: boolean) => void;
    visibleEventIds: Set<number>;
    displayMode: string;
    onEventClick: (event: Event) => void; // новый проп
}

export default function HistoricalMap({
    events,
    isMarkerMode,
    onMarkerModeChange,
    visibleEventIds, // получаем
    displayMode,
    onEventClick
}: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const tileLayer = useRef<L.TileLayer | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    //const [clickMarker, setClickMarker] = useState<L.Marker | null>(null);
    //const clickMarkerRef = useRef<L.Marker | null>(null);
    const isMarkerModeRef = useRef<boolean>(false);
    const tempMarkerRef = useRef<L.Marker | null>(null);
    const userMarkerRef = useRef<L.Marker | null>(null);

    const createCustomIcon_dollar = () => {
        return L.icon({
            
            iconUrl: 'icon_marker/dollar-no-bg.png', // укажите свой путь к изображению
            iconSize: [40, 40], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_copybook = () => {
        return L.icon({
            iconUrl: 'icon_marker/copybook-no-bg.png', // укажите свой путь к изображению
            iconSize: [35, 35], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_crown = () => {
        return L.icon({
            iconUrl: 'icon_marker/crown-no-bg.png', // укажите свой путь к изображению
            iconSize: [25, 35], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_fence = () => {
        return L.icon({
            iconUrl: 'icon_marker/fence-no-bg.png', // укажите свой путь к изображению
            iconSize: [25, 35], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_fire = () => {
        return L.icon({
            iconUrl: 'icon_marker/fire-no-bg.png', // укажите свой путь к изображению
            iconSize: [27, 35], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_fist = () => {
        return L.icon({
            iconUrl: 'icon_marker/fist-no-bg.png', // укажите свой путь к изображению
            iconSize: [30, 35], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_flag = () => {
        return L.icon({
            iconUrl: 'icon_marker/flag-no-bg.png', // укажите свой путь к изображению
            iconSize: [40, 35], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_government = () => {
        return L.icon({
            iconUrl: 'icon_marker/government-no-bg.png', // укажите свой путь к изображению
            iconSize: [35, 45], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_handshake = () => {
        return L.icon({
            iconUrl: 'icon_marker/handshake-no-bg.png', // укажите свой путь к изображению
            iconSize: [40, 35], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_shield = () => {
        return L.icon({
            iconUrl: 'icon_marker/shield-no-bg.png', // укажите свой путь к изображению
            iconSize: [35, 35], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_speaker = () => {
        return L.icon({
            iconUrl: 'icon_marker/speaker-no-bg.png', // укажите свой путь к изображению
            iconSize: [25, 35], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_purple = () => {
        return L.icon({
            iconUrl: 'marker/marker_purple.png', // укажите свой путь к изображению
            iconSize: [25, 35], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };
    const createCustomIcon_yellow = () => {
        return L.icon({
            iconUrl: 'marker/marker_yellow.png', // укажите свой путь к изображению
            iconSize: [25, 35], // размер иконки
            iconAnchor: [16, 32], // точка привязки
            popupAnchor: [0, -32], // позиция popup
        });
    };


    const getIconForEventType = (eventType: string): L.Icon => {
        const iconMap: Record<string, () => L.Icon> = {
            economic_protest: createCustomIcon_dollar,
            political_protest: createCustomIcon_fist,
            agitation_propaganda: createCustomIcon_speaker,
            military_mutiny: createCustomIcon_fire,
            armed_clash: createCustomIcon_shield,
            government_decree: createCustomIcon_copybook,
            government_formation: createCustomIcon_government,
            infrastructure_seizure: createCustomIcon_flag,
            transport_blockade: createCustomIcon_fence,
            power_negotiation: createCustomIcon_handshake,
            power_change: createCustomIcon_crown
        };

        // Возвращаем иконку для конкретного типа или красную по умолчанию
        const iconCreator = iconMap[eventType] || createCustomIcon_purple;
        return iconCreator();
    };
    const displayModeRef = useRef<string>(displayMode);

    // === Отдельный useEffect для синхронизации ===
    useEffect(() => {
        displayModeRef.current = displayMode;
    }, [displayMode]);

    // =========================
    // INIT MAP
    // =========================
    useEffect(() => {
        if (!mapRef.current || leafletMap.current) {
            return;
        }

        console.log('🗺️ Creating Map...');
        leafletMap.current = L.map(mapRef.current, {
            crs: CustomCRS,
            maxBounds: IMAGE_BOUNDS,
            maxBoundsViscosity: 1.0,
            attributionControl: false,
            zoomSnap: 0.5,
        });

        leafletMap.current.fitBounds(IMAGE_BOUNDS);
        const minZoom = leafletMap.current.getBoundsZoom(IMAGE_BOUNDS);

        // DPR fix
        const REFERENCE_DPR = 2;
        const dpr = window.devicePixelRatio || 1;
        const multiplier = 2.1 * (REFERENCE_DPR / dpr);
        leafletMap.current.setMinZoom(
            minZoom + Math.log2(multiplier)
        );
        leafletMap.current.setMaxZoom(5);

        // TILE LAYER
        tileLayer.current = L.tileLayer('/tiles/{z}/{x}/{y}.png', {
            minZoom: 1,
            maxZoom: 5,
            maxNativeZoom: 5,
            tileSize: 256,
            noWrap: true,
            bounds: IMAGE_BOUNDS,
            detectRetina: false,
        }).addTo(leafletMap.current);

        // Обработчик mousemove для режима установки метки
        leafletMap.current.on('mousemove', (e: L.LeafletMouseEvent) => {
            if (isMarkerModeRef.current) {
                if (tempMarkerRef.current) {
                    tempMarkerRef.current.setLatLng(e.latlng);
                } else {
                    const marker = L.marker(e.latlng, { icon: createCustomIcon_yellow() });
                    tempMarkerRef.current = marker;
                }
            }
        });

        // Обработчик клика по карте
        leafletMap.current.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            if (isMarkerModeRef.current) {
                if (tempMarkerRef.current) {
                    if (userMarkerRef.current) {
                        leafletMap.current?.removeLayer(userMarkerRef.current);
                        userMarkerRef.current = null;
                    }
                    leafletMap.current?.removeLayer(tempMarkerRef.current);
                    const fixedMarker = L.marker([lat, lng], { icon: createCustomIcon_yellow() })
                        .addTo(leafletMap.current!)
                        .bindPopup(`X: ${lng.toFixed(3)}, Y: ${lat.toFixed(3)}`)
                        .openPopup();
                    userMarkerRef.current = fixedMarker;
                    tempMarkerRef.current = null;
                    onMarkerModeChange(false);
                }
            }
        });

        return () => {
            if (tempMarkerRef.current) {
                leafletMap.current?.removeLayer(tempMarkerRef.current);
            }
        };
    }, []);

    // =========================
    // Маркеры, только для тех событий, что в visibleEventIds
    // =========================

    useEffect(() => {
        if (!leafletMap.current) return;

        // Удаляем старые маркеры
        markersRef.current.forEach(marker => leafletMap.current?.removeLayer(marker));
        markersRef.current = [];

        // Создаём новые маркеры только для видимых
        events.forEach(event => {
            if (
                event.coordinates?.x != null &&
                event.coordinates?.y != null &&
                visibleEventIds.has(event.id)
            ) {
                const marker = L.marker([event.coordinates.y, event.coordinates.x], {
                    icon: getIconForEventType(event.eventType)
                })
                    .addTo(leafletMap.current!)
                    .bindPopup(() => {
                        const container = L.DomUtil.create('div', 'popup-container');

                        if (displayMode === 'popup') {
                            // Режим всплывающего окна: краткое описание + кнопка «Подробнее»
                            container.innerHTML = `
                            <div style="min-width: 200px;">
                                <div style="font-weight: bold; color: #2563eb; margin-bottom: 4px;">
                                ${event.displayTime}
                                </div>
                                <div style="font-weight: 600; margin-bottom: 4px;">
                                ${event.title}
                                </div>
                                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                                ${event.description.substring(0, 100)}...
                                </div>
                                <button
                                class="details-button"
                                data-event-id="${event.id}"
                                style="background: #fb6b4b; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;"
                                >
                                Подробнее
                                </button>
                            </div>
                            `;
                        } else {
                            // Режим панели: только заголовок + подсказка
                            container.innerHTML = `
                            <div style="min-width: 200px;">
                                <div style="font-weight: bold; color: #2563eb; margin-bottom: 4px;">
                                ${event.displayTime}
                                </div>
                                <div style="font-weight: 600; margin-bottom: 4px;">
                                ${event.title}
                                </div>
                                <div style="font-size: 12px; color: #666;">
                                (Открыта полная панель)
                                </div>
                            </div>
                            `;
                        }

                        const handleClick = (e: MouseEvent) => {
                            const target = e.target as HTMLElement;
                            if (target.classList.contains('details-button')) {
                                onEventClick(event);
                            }
                        };

                        container.addEventListener('click', handleClick);
                        (container as any)._handleClick = handleClick;
                        return container;
                    })

                    .on('click', (e: L.LeafletMouseEvent) => {
                        if (displayModeRef.current === 'panel') {
                            // Панель уже открыта: обновляем событие и блокируем попап
                            e.originalEvent?.stopPropagation?.();
                            onEventClick(event);
                            setTimeout(() => marker.closePopup(), 0);
                        }
                        // В режиме 'popup' ничего не делаем — Leaflet сам откроет попап
                    })


                // Сохраняем маркер
                markersRef.current.push(marker);
            }
        });

        // Функция очистки
        return () => {
            // Удаляем все маркеры
            markersRef.current.forEach(marker => {
                leafletMap.current?.removeLayer(marker);
            });
            markersRef.current = [];
        };
    }, [events, visibleEventIds, onEventClick, displayMode]);




    useEffect(() => {
        isMarkerModeRef.current = isMarkerMode;
    }, [isMarkerMode]);

    // =========================
    // Контроль zoom и центрирования
    // =========================
    const handleZoomIn = () =>
        leafletMap.current?.zoomIn();

    const handleZoomOut = () =>
        leafletMap.current?.zoomOut();

    const handleCenter = () => {
        leafletMap.current?.fitBounds(IMAGE_BOUNDS);
    };

    return (
        <>
            <div ref={mapRef} className="absolute inset-0" />

            {/* Кнопки управления */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-background-creamy p-2 rounded-xl border border-gray-700 shadow-xl z-[1000]">
                <button
                    onClick={handleCenter}
                    className="px-4 py-2 bg-background-creamy-button text-text-red-brown hover:bg-background-red-button rounded-lg text-sm font-medium transition"
                >
                    Центрировать
                </button>
                <button
                    onClick={handleZoomOut}
                    className="px-4 py-2 bg-background-creamy-button text-text-red-brown hover:bg-background-red-button rounded-lg font-bold transition"
                >
                    -
                </button>
                <button
                    onClick={handleZoomIn}
                    className="px-4 py-2 bg-background-creamy-button text-text-red-brown hover:bg-background-red-button rounded-lg font-bold transition"
                >
                    +
                </button>
            </div>
        </>
    );
}