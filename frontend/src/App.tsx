import './output.css';
import { useState, useEffect } from 'react';

import HistoricalMap from './HistoricalMap';

interface Event {
  id: number;
  title: string;
  date: string;
  description: string;
  x: number;
  y: number;
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
  const [selectedPeriod, setSelectedPeriod] =
      useState<string>('Все периоды');

  const [searchQuery, setSearchQuery] =
      useState('');

  const [filteredEvents, setFilteredEvents] =
      useState<Event[]>(eventsData);

  const periods = [
    'Февраль',
    'Март',
    'Апрель',
    'Все периоды'
  ];

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
        <header className="bg-gray-800 border-b border-gray-700 p-4 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-400">
              Историческая карта 1917
            </h1>

            <div className="flex gap-2">
              {periods.map((period) => (
                  <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                          selectedPeriod === period
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    {period}
                  </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-80 bg-gray-800 border-r border-gray-700 p-4 flex flex-col shrink-0">
            <h2 className="text-lg font-semibold mb-4 text-gray-300">
              События революции
            </h2>

            <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) =>
                    setSearchQuery(e.target.value)
                }
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg mb-4 text-white focus:outline-none focus:border-blue-500"
            />

            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredEvents.map((event) => (
                  <div
                      key={event.id}
                      className="w-full text-left p-3 bg-gray-700 rounded-lg border-l-4 border-blue-500"
                  >
                    <div className="text-sm text-blue-400 font-semibold">
                      {event.date}
                    </div>

                    <div className="font-medium">
                      {event.title}
                    </div>
                  </div>
              ))}
            </div>
          </aside>

          <main className="flex-1 relative bg-[#1a1a1a]">
            <HistoricalMap
                events={filteredEvents}
            />
          </main>
        </div>
      </div>
  );
}

export default App;