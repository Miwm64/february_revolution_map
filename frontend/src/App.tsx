import './output.css';
import { useState, useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ========== НАСТРОЙКИ КАРТЫ ==========
const MAP_WIDTH = 5000;
const MAP_HEIGHT = 6954;
const SCALE = 1 / 32;

// Определяем границы изображения в "игровых" координатах
// В CRS.Simple [y, x] соответствует [0, 0] до [MAP_HEIGHT, MAP_WIDTH]
const IMAGE_BOUNDS: L.LatLngBoundsExpression = [[0, 0], [MAP_HEIGHT, MAP_WIDTH]];

// Кастомная CRS
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

    console.log('🗺️ Creating Map...');

    // Создаем карту с ограничениями
    leafletMap.current = L.map(mapRef.current, {
      crs: CustomCRS,
      maxBounds: IMAGE_BOUNDS,      // Ограничиваем область перетаскивания
      maxBoundsViscosity: 1.0,      // Жесткая привязка к границам (не дает "отпружинивать")
      attributionControl: false,
      zoomSnap: 0.5,                // Плавный зум для точной подгонки под экран
    });

    // Вместо setView используем fitBounds, чтобы сразу показать всю карту без серых полей
    leafletMap.current.fitBounds(IMAGE_BOUNDS);

    // Устанавливаем минимальный зум так, чтобы нельзя было увидеть серую зону
    const minZoom = leafletMap.current.getBoundsZoom(IMAGE_BOUNDS);
    console.log(leafletMap.current.getBoundsZoom(IMAGE_BOUNDS));
    leafletMap.current.setMinZoom(minZoom*1.71);
    leafletMap.current.setMaxZoom(5);

    // Добавляем TileLayer
    tileLayer.current = L.tileLayer('/tiles/{z}/{x}/{y}.png', {
      minZoom: 1,
      maxZoom: 5,
      maxNativeZoom: 5,
      tileSize: 256,
      noWrap: true,                 // Не дублировать карту по горизонтали
      bounds: IMAGE_BOUNDS,         // Не запрашивать тайлы за пределами картинки
    }).addTo(leafletMap.current);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Обновление маркеров
  useEffect(() => {
    if (!leafletMap.current) return;

    markersRef.current.forEach(marker => leafletMap.current?.removeLayer(marker));
    markersRef.current = [];

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
  }, [filteredEvents]);

  // Поиск
  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredEvents(
        eventsData.filter(event =>
            event.title.toLowerCase().includes(query) ||
            event.description.toLowerCase().includes(query) ||
            event.date.toLowerCase().includes(query)
        )
    );
  }, [searchQuery]);

  const handleZoomIn = () => leafletMap.current?.zoomIn();
  const handleZoomOut = () => leafletMap.current?.zoomOut();

  const handleCenter = () => {
    // Возвращаемся к полному обзору карты
    leafletMap.current?.fitBounds(IMAGE_BOUNDS);
  };

  const goToEvent = (event: Event) => {
    leafletMap.current?.setView([event.y, event.x], 4);
    const markerIndex = filteredEvents.findIndex(e => e.id === event.id);
    if (markerIndex !== -1 && markersRef.current[markerIndex]) {
      markersRef.current[markerIndex].openPopup();
    }
  };

  return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
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

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-80 bg-gray-800 border-r border-gray-700 p-4 flex flex-col shrink-0">
            <h2 className="text-lg font-semibold mb-4 text-gray-300">События революции</h2>
            <input type="text" placeholder="Поиск..." value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg mb-4 text-white focus:outline-none focus:border-blue-500" />

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredEvents.map((event) => (
                  <button key={event.id} onClick={() => goToEvent(event)}
                          className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all border-l-4 border-blue-500">
                    <div className="text-sm text-blue-400 font-semibold">{event.date}</div>
                    <div className="font-medium">{event.title}</div>
                  </button>
              ))}
            </div>
          </aside>

          <main className="flex-1 relative bg-[#1a1a1a]">
            <div ref={mapRef} className="absolute inset-0" />

            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-gray-800 p-2 rounded-xl border border-gray-700 shadow-xl z-[1000]">
              <button onClick={handleCenter} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">Весь город</button>
              <button onClick={handleZoomIn} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition">+</button>
              <button onClick={handleZoomOut} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition">-</button>
            </div>
          </main>
        </div>
      </div>
  );
}

export default App;