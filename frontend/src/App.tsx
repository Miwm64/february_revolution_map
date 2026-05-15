import './output.css';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Map from './components/map/Map';
import EventList from './components/events/EventList';
import Description from './components/description/Description';
import { Button } from './components/ui/button.tsx';
import './App.css';

// 1. Создаем КАСТОМНУЮ систему координат
// Обычный CRS.Simple считает, что Y идет вверх (как в математике).
// Нам нужно, чтобы Y шел ВНИЗ (как в картинке/фотошопе).
const CRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0), // 1, 0, 1, 0 означает: X растет вправо, Y растет вниз
});

function App() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Все периоды');
  const [activeLayer, setActiveLayer] = useState<string>('События');

  // Центр карты [Y, X]. Так как Y идет вниз, [0, 0] - это верхний левый угол карты.
  // Если карта большая, можно поставить, например, [1000, 1000], чтобы видеть центр.
  const [mapCenter, setMapCenter] = useState<[number, number]>([100, 70]);
  const [mapZoom, setMapZoom] = useState(1);

  const periods = ['Февраль', 'Март', 'Апрель', 'Все периоды'];
  const layers = ['События', 'Маршруты', 'Персоны', 'Организации'];

  const handleZoomIn = () => setMapZoom(z => Math.min(z + 1, 5));
  const handleZoomOut = () => setMapZoom(z => Math.max(z - 1, 0));
  const handleCenter = () => {
    setMapCenter([100, 70]);
    setMapZoom(1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-background-creamy border-b border-gray-700 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-red-brown">Историческая карта про фервральскую революцию 1917 года</h1>
          <div className="flex gap-2">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedPeriod === period ? 'bg-background-red-brown-button text-white' : 'bg-background-creamy-button text-text-red-brown hover:bg-background-red-brown-button-200'
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
        <aside className="w-64 bg-background-creamy border-r border-gray-700 p-4 flex flex-col shrink-0 overflow-y-auto">
          {/* Вместо блока с слоями */}
          <EventList backgroundColor="bg-background-creamy" textColor="text-text-red-brown" borderColor="border-[var(--color-border-creamy)]" />
        
          <div className="mt-8 pt-8 border-t border-gray-700">
             <h3 className="text-sm font-semibold text-gray-400 mb-3">Тестовые действия</h3>
             <button className="w-full mb-2 px-4 py-2 bg-green-600 rounded-lg">📍 Добавить метку</button>
             <button className="w-full mb-2 px-4 py-2 bg-purple-600 rounded-lg">📏 Измерить расстояние</button>
             <button className="w-full mb-2 px-4 py-2 bg-orange-600 rounded-lg">💾 Сохранить вид</button>
             <button className="w-full px-4 py-2 bg-red-600 rounded-lg">🗑️ Очистить слой</button>
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 p-6 relative bg-background-creamy">
          <div className="bg-background-creamy rounded-xl border-2 border-gray-700 h-full w-full overflow-hidden relative">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              minZoom={0}
              maxZoom={5}
              className="h-full w-full"
              crs={CRS} // <--- Используем наш кастомный CRS
            >
              <Map center={mapCenter} zoom={mapZoom} />

              {/* Тайлы карты */}
              <TileLayer
                url="./map/tiles/{z}/{x}/{y}.png"
                minZoom={0}
                maxZoom={5}
                // tms={true} УБРАНО, так как мы используем --xyz
              />
            </MapContainer>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 bg-background-creamy p-2 rounded-xl border border-gray-700 shadow-xl z-[1000]">
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