import './output.css';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 1. Создаем КАСТОМНУЮ систему координат
// Обычный CRS.Simple считает, что Y идет вверх (как в математике).
// Нам нужно, чтобы Y шел ВНИЗ (как в картинке/фотошопе).
const CRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0), // 1, 0, 1, 0 означает: X растет вправо, Y растет вниз
});

// Компонент для управления картой
function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

function App() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Все периоды');
  const [activeLayer, setActiveLayer] = useState<string>('События');

  // Центр карты [Y, X]. Так как Y идет вниз, [0, 0] - это верхний левый угол карты.
  // Если карта большая, можно поставить, например, [1000, 1000], чтобы видеть центр.
  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const [mapZoom, setMapZoom] = useState(1);

  const periods = ['Февраль', 'Март', 'Апрель', 'Все периоды'];
  const layers = ['События', 'Маршруты', 'Персоны', 'Организации'];

  const handleZoomIn = () => setMapZoom(z => Math.min(z + 1, 5));
  const handleZoomOut = () => setMapZoom(z => Math.max(z - 1, 0));
  const handleCenter = () => {
    setMapCenter([0, 0]);
    setMapZoom(1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">Историческая карта 1917</h1>
          <div className="flex gap-2">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedPeriod === period ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col shrink-0 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Слои карты</h2>
          <div className="space-y-2">
            {layers.map((layer) => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeLayer === layer ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${activeLayer === layer ? 'bg-white' : 'bg-gray-400'}`} />
                  {layer}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-700">
             <h3 className="text-sm font-semibold text-gray-400 mb-3">Тестовые действия</h3>
             <button className="w-full mb-2 px-4 py-2 bg-green-600 rounded-lg">📍 Добавить метку</button>
             <button className="w-full mb-2 px-4 py-2 bg-purple-600 rounded-lg">📏 Измерить расстояние</button>
             <button className="w-full mb-2 px-4 py-2 bg-orange-600 rounded-lg">💾 Сохранить вид</button>
             <button className="w-full px-4 py-2 bg-red-600 rounded-lg">🗑️ Очистить слой</button>
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 p-6 relative bg-gray-900">
          <div className="bg-gray-800 rounded-xl border-2 border-gray-700 h-full w-full overflow-hidden relative">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              minZoom={0}
              maxZoom={5}
              className="h-full w-full"
              crs={CRS} // <--- Используем наш кастомный CRS
            >
              <MapController center={mapCenter} zoom={mapZoom} />

              {/* Тайлы карты */}
              <TileLayer
                url="/docs/tiles/{z}/{x}/{y}.png"
                minZoom={0}
                maxZoom={5}
                // tms={true} УБРАНО, так как мы используем --xyz
              />
            </MapContainer>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 bg-gray-800 p-2 rounded-xl border border-gray-700 shadow-xl z-[1000]">
            <button onClick={handleCenter} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
              Центрировать
            </button>
            <button onClick={handleZoomIn} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold">
              +
            </button>
            <button onClick={handleZoomOut} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold">
              -
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;