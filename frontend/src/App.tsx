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

const displayMonthNames = [
  'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня',
  'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'
];

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
  monthKey?: string;
  category?: string | null;
}

// Полный список ключевых слов для категорий
const categoriesKeywords: Record<string, string[]> = {
  "Отречение": ["отречение"],
  "Роспуск": ["роспуск"],
  "Созыв": ["созыв"],
  "Принятие решения": ["принятие решения", "решение"],
  "Учредительное собрание": ["учредительное собрание", "учредительный"],
  "Правительство": ["правительство", "министерство", "кабинет"]
};

function getCategory(title: string, description: string): string | null {
  const lowerTitle = title.toLowerCase();
  const lowerDescription = description.toLowerCase();
  for (const [category, keywords] of Object.entries(categoriesKeywords)) {
    for (const keyword of keywords) {
      if (lowerTitle.includes(keyword) || lowerDescription.includes(keyword)) {
        return category;
      }
    }
  }
  return null; // если не нашли подходящую категорию
}

function App() {
  const [eventsData, setEventsData] = useState<Event[]>([]);
  const [eventsForMap, setEventsForMap] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Все периоды');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const periods = ['Февраль', 'Март', 'Апрель', 'Все периоды'];

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Загрузка данных
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
          const day = String(dateObj.getDate());
          const monthIndex = dateObj.getMonth();

          const displayTime = `${day} ${displayMonthNames[monthIndex]} ${dateObj.getFullYear()}`;
          const monthKey = categoryMonthNames[monthIndex] + ' ' + dateObj.getFullYear();

          const category = getCategory(event.title, event.description);

          return {
            ...event,
            displayTime,
            monthKey,
            category,
          };
        });

        setEventsData(processedData);
        setEventsForMap(processedData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Группировка по категориям
  const groupedByCategory: Record<string, Event[]> = eventsData.reduce((acc, event) => {
    const cat = event.category || 'Другие';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Обновление событий для карты при смене периода
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

  // Фильтр по поиску и периоду
  useEffect(() => {
    let filtered = eventsData;

    if (selectedPeriod !== 'Все периоды') {
      filtered = filtered.filter(event => {
        const monthName = event.monthKey?.split(' ')[0];
        return monthName === selectedPeriod;
      });
    }

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

  // Группировка по категориям для отображения
  const filteredGroupedByCategory: Record<string, Event[]> = filteredEvents.reduce((acc, event) => {
    const cat = event.category || 'Другие';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Получение массива категорий для отображения, "Другие" в конце
  const categoriesList = Object.keys(filteredGroupedByCategory);
  const sortedCategories = categoriesList.filter(c => c !== 'Другие').concat('Другие');

  const isSearching = searchQuery.trim() !== "";

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

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Левая панель */}
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

          {isSearching ? (
            // При поиске показываем список
            <div>
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="w-full text-left p-3 bg-background-creamy-button rounded-lg border-1 border-l-4 border-[var(--color-red-brown)] text-text-red-brown mb-2"
                >
                  <div className="text-sm text-text-red-brown font-semibold">{event.displayTime}</div>
                  <div className="font-medium">{event.title}</div>
                </div>
              ))}
            </div>
          ) : (
            // Группировка по категориям с "Другие" в конце
            sortedCategories.map((category) => {
            const isOpen = openCategories.has(category);
            const eventsInCategory = filteredGroupedByCategory[category] || [];
            return (
              <div key={category}>
                <h3
                  className="mt-4 mb-2 text-xl font-bold cursor-pointer flex items-center"
                  onClick={() => toggleCategory(category)}
                >
                  <span className="mr-2">{isOpen ? '▼' : '▶'}</span> {category}
                </h3>
                {isOpen && eventsInCategory.length > 0 &&
                  eventsInCategory.map((event) => (
                    <div
                      key={event.id}
                      className="w-full text-left p-3 bg-background-creamy-button rounded-lg border-1 border-l-4 border-[var(--color-red-brown)] text-text-red-brown mb-2"
                    >
                      <div className="text-sm text-text-red-brown font-semibold">{event.displayTime}</div>
                      <div className="font-medium">{event.title}</div>
                    </div>
                  ))
                }
                {isOpen && eventsInCategory.length === 0 && (
                  <div className="ml-4 text-gray-500">Нет событий</div>
                )}
              </div>
            );
          })
          )}
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