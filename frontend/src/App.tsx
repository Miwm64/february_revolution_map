import './output.css';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import HistoricalMap from './HistoricalMap';
import { Button } from './components/ui/button.tsx';
import './App.css';

// 1. Создаем КАСТОМНУЮ систему координат
// Обычный CRS.Simple считает, что Y идет вверх (как в математике).
// Нам нужно, чтобы Y шел ВНИЗ (как в картинке/фотошопе).
const CRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0), // X вправо, Y вниз
});

interface Event {
    id: number;
    title: string;
    date: string;
    description: string;
    x: number;
    y: number;
    nextEvent?: number;
    prevEvent?: number;
}
const eventsData: Event[] = [
  {
    id: 1,
    title: "Забастовка на Путиловском заводе",
    date: "18 февраля 1917",
    description: "Начало массовых забастовок рабочих",
    x: 1200,
    y: 4500
  },
  {
    id: 2,
    title: "Демонстрация на Знаменской площади",
    date: "23 февраля 1917",
    description: "Первые массовые выступления",
    x: 2800,
    y: 2200
  },
  {
    id: 3,
    title: "Восстание в Петропавловской крепости",
    date: "27 февраля 1917",
    description: "Переход гарнизона на сторону восставших",
    x: 2100,
    y: 1800
  },
];

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const [selectedPeriod, setSelectedPeriod] = useState<string>('Все периоды');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(eventsData);

  const periods = ['Февраль', 'Март', 'Апрель', 'Все периоды'];

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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-background-creamy border-b border-gray-700 p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Надпись и картинка */}
          <div className="flex items-center space-x-4">
            <img src="logo.jpg" alt="Логотип" className="w-18 h-12 object-contain" />
            <h1 className="text-2xl font-bold text-text-red-brown">
              Историческая карта про февральскую революцию 1917 года
            </h1>
          </div>
          {/* Кнопки периоды */}
          <div className="flex gap-2">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedPeriod === period
                    ? 'bg-background-red-brown-button text-white'
                    : 'bg-background-creamy-button text-text-red-brown hover:bg-background-red-button'
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
          <h2 className="text-lg font-semibold mb-4 text-text-red-brown"> События революции </h2>
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-background-creamy-button border border-gray-600 rounded-lg mb-4 text-text-red-brown focus:outline-none focus:border-blue-500"
          />
          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="w-full text-left p-3 bg-background-creamy-button rounded-lg border-1 border-l-4 border-[var(--color-red-brown)] text-text-red-brown"
              >
                <div className="text-sm text-text-red-brown font-semibold">{event.date}</div>
                <div className="font-medium">{event.title}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Тестовые действия</h3>
            <button className="w-full mb-2 px-4 py-2 bg-[#498871] rounded-lg">📍 Добавить метку</button>
            <button className="w-full mb-2 px-4 py-2 bg-[#9070b4] rounded-lg">📏 Измерить расстояние</button>
            <button className="w-full mb-2 px-4 py-2 bg-[#d7a457] rounded-lg">💾 Сохранить вид</button>
            <button className="w-full px-4 py-2 bg-[#d7573c] rounded-lg">🗑️ Очистить слой</button>
          </div>
        </aside>
            
        {/* Map Area */}
        <main className="flex-1 p-6 relative bg-background-creamy">
          <div className="bg-background-creamy rounded-xl border-2 border-gray-700 h-full w-full overflow-hidden relative">
            <HistoricalMap events={filteredEvents} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;