import './output.css';
import { useState, useEffect } from 'react';
//import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import HistoricalMap from './HistoricalMap';
//import { Button } from './components/ui/button.tsx';
import './App.css';

const CRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
});

// Массив для отображения дат в падеже "Марта"
const displayMonthNames = [
  'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
  'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
];

// Массив для названий категорий в именительном падеже "Март"
const categoryMonthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

interface Event {
  id: number;
  title: string;
  description: string;
  time: string;
  displayTime: string;
  coordinates: { x: number; y: number };
  nextEvent: number | null;
  prevEvent: number | null;
  monthKey?: string; // добавляем для группировки
}

function App() {
  const [eventsData, setEventsData] = useState<Event[]>([]);
  const [eventsForMap, setEventsForMap] = useState<Event[]>([]); // для отображения на карте
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]); // для списка
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Все периоды');
  const [searchQuery, setSearchQuery] = useState('');

  const periods = ['Февраль', 'Март', 'Апрель', 'Все периоды'];

  useEffect(() => {
    fetch("http://frmap.miwm64.spb.ru/api/events", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then(res => res.json())
      .then(res => {
        if (res.error || !res.data) {
          setLoading(false);
          return;
        }
        const processedData = res.data.map((event: Event) => {
          const dateObj = new Date(event.time);
          const day = String(dateObj.getDate()); // без ведущего нуля
          const monthIndex = dateObj.getMonth();

          const displayTime = `${day} ${displayMonthNames[monthIndex]} ${dateObj.getFullYear()}`;
          const monthKey = categoryMonthNames[monthIndex] + ' ' + dateObj.getFullYear(); // например, "Март 1917"

          return {
            ...event,
            displayTime,
            monthKey,
          };
        });

        setEventsData(processedData);
        setEventsForMap(processedData); // показывать все события на карте
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Группировка по месяцам для отображения
  const groupedEvents: Record<string, Event[]> = eventsData.reduce((acc, event) => {
    if (event.monthKey) {
      if (!acc[event.monthKey]) {
        acc[event.monthKey] = [];
      }
      acc[event.monthKey].push(event);
    }
    return acc;
  }, {} as Record<string, Event[]>);

  // Обновление событий для отображения на карте при смене периода
  useEffect(() => {
    if (selectedPeriod === 'Все периоды') {
      setEventsForMap(eventsData);
    } else {
      setEventsForMap(
        eventsData.filter(event => {
          const monthName = event.monthKey?.split(' ')[0];
          return monthName === selectedPeriod;
        })
      );
    }
  }, [selectedPeriod, eventsData]);

  // Фильтрация для списка (по поиску)
  useEffect(() => {
    let filtered = eventsData;

    // Фильтр по периоду
    if (selectedPeriod !== 'Все периоды') {
      filtered = filtered.filter(event => {
        const monthName = event.monthKey?.split(' ')[0];
        return monthName === selectedPeriod;
      });
    }

    // Фильтр по поиску
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.displayTime.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  }, [searchQuery, eventsData, selectedPeriod]);

  return (
    <div className="min-h-screen bg-background-creamy text-text-red-brown flex flex-col">
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
        <aside
          className="w-64 bg-background-creamy border-r border-gray-700 p-4 flex flex-col shrink-0 overflow-y-auto"
          style={{
            backgroundImage: "url(/foncity.png)",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom left',
            backgroundSize: 'contain',
            maxHeight: 'calc(100vh - 80px)',
          }}
        >
          <h2 className="text-lg font-semibold mb-4 text-text-red-brown"> События революции </h2>
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-background-creamy-button border border-gray-600 rounded-lg mb-4 text-text-red-brown focus:outline-none focus:border-blue-500"
          />
          
          {/* Отображение сгруппированных событий по месяцам */}
          {Object.entries(groupedEvents).map(([month, events]) => (
            <div key={month}>
              <h3 className="mt-4 mb-2 text-xl font-bold">{month}</h3>
              {events.map((event) => (
                <div
                  key={event.id}
                  className="w-full text-left p-3 bg-background-creamy-button rounded-lg border-1 border-l-4 border-[var(--color-red-brown)] text-text-red-brown mb-2"
                >
                  <div className="text-sm text-text-red-brown font-semibold">{event.displayTime}</div>
                  <div className="font-medium">{event.title}</div>
                </div>
              ))}
            </div>
          ))}
        </aside>

        {/* Карта */}
        <main className="flex-1 p-6 relative bg-background-creamy">
          <div className="bg-background-creamy rounded-xl border-2 border-gray-700 h-full w-full overflow-hidden relative">
            <HistoricalMap events={eventsForMap} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;