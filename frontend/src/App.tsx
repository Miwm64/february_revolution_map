import './output.css';
import { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ========== НАСТРОЙКИ КАРТЫ ==========
const MAP_WIDTH = 5000;
const MAP_HEIGHT = 6954;

// Масштабирование: Leaflet ожидает, что при Zoom 0 мир имеет ширину 256px.
// Наша карта 5000px. Нам нужно "уменьшить" координаты карты, чтобы они влезли в сетку.
// 5000 / 32 ≈ 156 (что меньше 256). Значит масштаб 1/32 подойдет.
const SCALE = 1 / 32;

// Кастомная CRS:
// 1. Масштабируем координаты (SCALE).
// 2. Ось Y направлена вниз (как в картинке), поэтому используем положительный множитель для Y.
const CustomCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(SCALE, 0, SCALE, 0),
});

// ========== ДАННЫЕ СОБЫТИЙ ==========
interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
  x: number;
  y: number;
}

const eventsData: Event[] = [
  { id: 1, title: "Забастовка на Путиловском заводе", date: "18 февраля 1917", description: "Начало массовых забастовок рабочих", x: 1200, y: 4500 },
  { id: 2, title: "Демонстрация на Знаменской площади", date: "23 февраля 1917", description: "Первые массовые выступления", x: 2800, y: 2200 },
  { id: 3, title: "Восстание в Петропавловской крепости", date: "27 февраля 1917", description: "Переход гарнизона на сторону восставших", x: 2100, y: 1800 },
];

function App() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Все периоды');
  const [mapCenter, setMapCenter] = useState<[number, number]>([MAP_HEIGHT / 2, MAP_WIDTH / 2]);
  const [mapZoom, setMapZoom] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(eventsData);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const periods = ['Февраль', 'Март', 'Апрель', 'Все периоды'];

  // Инициализация карты
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    console.log('🗺️ Creating Map with TILES...');

    // Создаем карту
    leafletMap.current = L.map(mapRef.current, {
      crs: CustomCRS,
      minZoom: 0,
      maxZoom: 5,
      attributionControl: false,
    });

    // Устанавливаем вид (Центр карты в пикселях)
    leafletMap.current.setView([MAP_HEIGHT / 2, MAP_WIDTH / 2], 3);

    console.log('✅ Map created');

    // Добавляем TileLayer
    // Путь /tiles/... так как мы скопировали папку в public/tiles
    tileLayer.current = L.tileLayer('/tiles/{z}/{x}/{y}.png', {
      minZoom: 0,
      maxZoom: 5,
      maxNativeZoom: 5,
      tileSize: 256,
      noWrap: true,
      continuousWorld: true,
    });

    console.log('✅ TileLayer created');

    // Добавляем слой на карту
    tileLayer.current.addTo(leafletMap.current);
    console.log('✅ TileLayer added');

    // Слушаем события
    tileLayer.current.on('tileerror', (e: any) => {
      const url = e.tile ? e.tile.src : 'Unknown';
      console.error('❌ Tile error:', url);
    });

    tileLayer.current.on('load', () => {
      console.log('✅ Tiles loaded successfully!');
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        tileLayer.current = null;
        markersRef.current = [];
      }
    };
  }, []);

  // Обновление маркеров при изменении filteredEvents
  useEffect(() => {
    if (!leafletMap.current) return;

    // Удаляем старые маркеры
    markersRef.current.forEach(marker => {
      leafletMap.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Создаем новые маркеры
    filteredEvents.forEach(event => {
      const marker = L.marker([event.y, event.x])
        .addTo(leafletMap.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <div style="font-weight: bold; color: #2563eb; margin-bottom: 4px;">${event.date}</div>
            <div style="font-weight: 600; margin-bottom: 4px;">${event.title}</div>
            <div style="font-size: 12px; color: #666;">${event.description}</div>
          </div>
        `);
      markersRef.current.push(marker);
    });

    console.log(`✅ Markers updated: ${filteredEvents.length} markers`);
  }, [filteredEvents]);

  // Обновление поиска
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents(eventsData);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredEvents(eventsData.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.date.toLowerCase().includes(query)
      ));
    }
  }, [searchQuery]);

  const handleZoomIn = () => leafletMap.current?.zoomIn();
  const handleZoomOut = () => leafletMap.current?.zoomOut();

  const handleCenter = () => {
    leafletMap.current?.setView([MAP_HEIGHT / 2, MAP_WIDTH / 2], 3);
  };

  const goToEvent = (event: Event) => {
    leafletMap.current?.setView([event.y, event.x], 4);
    // Открываем попап у маркера
    const markerIndex = filteredEvents.findIndex(e => e.id === event.id);
    if (markerIndex !== -1 && markersRef.current[markerIndex]) {
      markersRef.current[markerIndex].openPopup();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">Историческая карта 1917</h1>
          <div className="flex gap-2">
            {periods.map((period) => (
              <button key={period} onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg transition-all ${selectedPeriod === period ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                {period}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-gray-800 border-r border-gray-700 p-4 flex flex-col shrink-0">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">События Февральской революции</h2>
          <div className="mb-4">
            <input type="text" placeholder="Поиск по событиям..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredEvents.map((event) => (
              <button key={event.id} onClick={() => goToEvent(event)}
                className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all border-l-4 border-blue-500">
                <div className="text-sm text-blue-400 font-semibold mb-1">{event.date}</div>
                <div className="font-medium text-white mb-1">{event.title}</div>
                <div className="text-sm text-gray-400">{event.description}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Map */}
        <main className="flex-1 relative bg-gray-900">
          <div
            ref={mapRef}
            className="absolute inset-0 bg-gray-800"
            style={{ height: '100%', width: '100%' }}
          />

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-gray-800 p-2 rounded-xl border border-gray-700 shadow-xl z-[1000]">
            <button onClick={handleCenter} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">Центрировать</button>
            <button onClick={handleZoomIn} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition">+</button>
            <button onClick={handleZoomOut} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition">-</button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;