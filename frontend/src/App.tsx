import './output.css';
import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import HistoricalMap from './HistoricalMap';
import './App.css';

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
  displayTimeHMS: string;
  coordinates: { x: number; y: number };
  nextEvent: number | null;
  prevEvent: number | null;
  monthKey?: string;
  eventType: string;
  timePeriod: string;
}

const eventTypeDisplayNames: Record<Event['eventType'], string> = {
  economic_protest: "Экономический протест",
  political_protest: "Политический протест",
  agitation_propaganda: "Агитация и пропаганда",
  military_mutiny: "Военный мятеж",
  armed_clash: "Вооружённое столкновение",
  government_decree: "Правительственный указ",
  government_formation: "Формирование правительства",
  infrastructure_seizure: "Захват инфраструктуры",
  transport_blockade: "Транспортная блокада",
  power_negotiation: "Переговоры о власти",
  power_change: "Смена власти"
};


const timePeriodDisplayNames: Record<Event['timePeriod'], string> = {
  morning: 'Утро',
  afternoon: 'День',
  evening: 'Вечер',
  night: 'Ночь',
};

function App() {
  const [eventsData, setEventsData] = useState<Event[]>([]);
  const [eventsForMap, setEventsForMap] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Все дни');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [isMarkerMode, setIsMarkerMode] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [showMap, setShowMap] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'popup' | 'panel'>('popup');



  // Тсссс...
  const handleLogoClick = () => {
    setShowMap(prev => !prev);
  };

  // Для отображения меток
  const [visibleEventIds, setVisibleEventIds] = useState<Set<number>>(new Set());

  const titleRef = useRef<HTMLHeadingElement>(null);
  const daysContainerRef = useRef<HTMLDivElement>(null);
  const [titleHeight, setTitleHeight] = useState<number>(0);

  const fetchData = async () => {
    try {
      const res = await fetch("http://frmap.miwm64.spb.ru/api/events");
      const json = await res.json();
      if (json.error || !json.data) {
        setLoading(false);
        return;
      }
      const processedData = json.data.map((event: Event) => {
        const dateObj = new Date(event.time);
        const day = String(dateObj.getDate());
        const monthIndex = dateObj.getMonth();
        const year = dateObj.getFullYear();

        const periodName = timePeriodDisplayNames[event.timePeriod] || '';

        // Одна строка для формирования displayTimeHMS
        const displayTimeHMS = `${day} ${displayMonthNames[monthIndex]} ${year} | ${periodName}`;


        const displayTime = `${day} ${displayMonthNames[monthIndex]} ${year}`;
        const monthKey = categoryMonthNames[monthIndex] + ' ' + year;
        return {
          ...event,
          displayTime,
          displayTimeHMS,
          monthKey,
        };
      });
      setEventsData(processedData);
      setEventsForMap(processedData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (eventsData.length > 0) {
      const allIds = new Set(eventsData.map(e => e.id));
      setVisibleEventIds(allIds);
    }
  }, [eventsData]);

  /*const groupedByEventType: Record<string, Event[]> = eventsData.reduce((acc, event) => {
    const displayName = eventTypeDisplayNames[event.eventType] || 'Другие';
    if (!acc[displayName]) {
      acc[displayName] = [];
    }
    acc[displayName].push(event);
    return acc;
  }, {} as Record<string, Event[]>);*/


  const availableDays = useMemo(() => {
    const daysSet = new Set<string>();
    eventsData.forEach(e => {
      daysSet.add(String(new Date(e.time).getDate()));
    });
    return Array.from(daysSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [eventsData]);

  // Обработка поиска и фильтрации
  useEffect(() => {
    let filtered = eventsData;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.displayTime.toLowerCase().includes(q) ||
        e.time.toLowerCase().includes(q)
      );
    }
    if (selectedDays.size > 0 && !selectedDays.has('Все дни')) {
      filtered = filtered.filter(e => {
        const dayNumber = String(new Date(e.time).getDate());
        return selectedDays.has(dayNumber);
      });
    }
    setFilteredEvents(filtered);
  }, [searchQuery, eventsData, selectedDays]);

  useEffect(() => {
    let filtered = eventsData;

    // Фильтрация по выбранному периоду (день или «Все дни»)
    if (selectedPeriod !== 'Все дни') {
      const dayNum = parseInt(selectedPeriod, 10);
      if (!isNaN(dayNum)) {
        filtered = filtered.filter(e =>
          String(new Date(e.time).getDate()) === String(dayNum)
        );
      }
    }

    // Дополнительная фильтрация по выбранным дням (множественный выбор)
    if (selectedDays.size > 0 && !selectedDays.has('Все дни')) {
      filtered = filtered.filter(e => {
        const dayNumber = String(new Date(e.time).getDate());
        return selectedDays.has(dayNumber);
      });
    }

    setEventsForMap(filtered);
  }, [selectedPeriod, selectedDays, eventsData]);

  const handleDayClick = (day: string) => {
    setSelectedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(day)) {
        newSet.delete(day);
      } else {
        newSet.add(day);
      }

      // Если после изменения набор дней пуст, устанавливаем период «Все дни»
      if (newSet.size === 0) {
        setSelectedPeriod('Все дни');
      } else {
        // В противном случае устанавливаем период «Множественный»
        setSelectedPeriod('Множественный');
      }

      return newSet;
    });
  };

  useEffect(() => {
    if (selectedDays.size === 0) {
      setSelectedPeriod('Все дни');
    }
  }, [selectedDays]);

  const filteredGroupedByEventType: Record<string, Event[]> = filteredEvents.reduce((acc, event) => {
    const displayName = eventTypeDisplayNames[event.eventType] || 'Другие';
    if (!acc[displayName]) {
      acc[displayName] = [];
    }
    acc[displayName].push(event);
    return acc;
  }, {} as Record<string, Event[]>);


  const categoriesWithEvents = Object.keys(filteredGroupedByEventType).filter(cat => filteredGroupedByEventType[cat].length > 0);

  const sortedCategories = [
    ...categoriesWithEvents.filter(c => c !== 'Другие'),
    ...(categoriesWithEvents.includes('Другие') ? ['Другие'] : [])
  ];

  const isSearching = searchQuery.trim() !== "";

  // Обработчики для кнопок
  const handleSetMarker = () => {
    setIsMarkerMode(prev => !prev);
  };

  // Переключение между списком и категориями
  const toggleDisplayMode = () => {
    setShowCategories(prev => !prev);
  };

  // Деление дней
  const { firstRow, secondRow } = useMemo(() => {
    const totalDays = availableDays.length;
    const shouldSplit = totalDays > 6;
    let fr: string[] = [], sr: string[] = [];
    if (shouldSplit) {
      const half = Math.ceil(totalDays / 2);
      fr = availableDays.slice(0, half);
      sr = availableDays.slice(half);
    } else {
      fr = availableDays;
    }
    return { firstRow: fr, secondRow: sr };
  }, [availableDays]);

  const maxButtonHeight = 40;
  const minButtonHeight = 30;
  const [dayButtonHeight, setDayButtonHeight] = useState(0);

  useLayoutEffect(() => {
    if (titleRef.current) {
      const newTitleHeight = titleRef.current.offsetHeight;
      const calculatedDayHeight = newTitleHeight / 2;
      const constrainedHeight = Math.max(Math.min(calculatedDayHeight, maxButtonHeight), minButtonHeight);
      setTitleHeight(newTitleHeight);
      setDayButtonHeight(constrainedHeight);
    }
  }, [availableDays, maxButtonHeight, minButtonHeight]);

  return (
    <div className="min-h-screen bg-background-creamy text-text-red-brown flex flex-col">
      {/* Заголовок */}
      <header className="bg-background-creamy border-b border-gray-700 p-4 shrink-0" style={{ minHeight: minButtonHeight * 2 }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Логотип и название */}
          <div className="flex items-center space-x-4" style={{ flex: 2, minHeight: minButtonHeight * 2 }}>
            <div className="logo-container relative">
              <img src="logo.jpg" alt="Азоурус" className="w-18 h-12 object-contain cursor-pointer" onClick={handleLogoClick} />
              <div className="logo-tooltip absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm px-3 py-1 rounded-lg opacity-0 pointer-events-none whitespace-nowrap">
                Историческая карта февральской революции 1917 года
              </div>
            </div>
            <h1
              ref={titleRef}
              className="font-bold text-text-red-brown tracking-wide leading-tight"
              style={{ fontFamily: 'Georgia, serif', fontSize: '1.8rem' }}
            >
              Историческая карта февральской революции 1917 года
            </h1>
          </div>

          {/* Блок выбора дня */}
          <div className="flex flex-1 justify-end h-full" style={{ flex: 1, minHeight: minButtonHeight * 2 }}>
            {/* Контейнер дней + "Все дни" */}
            <div className="flex flex-nowrap items-stretch gap-2 h-full">
              {/* Блок дней */}
              <div className="days-container flex-1 flex flex-col items-stretch gap-1" ref={daysContainerRef}
                style={{ height: `${titleHeight}px`, maxHeight: `${maxButtonHeight * 2}px` }}
              >
                {/* Первая строка */}
                <div className="days-row flex flex-1 items-stretch justify-center gap-1">
                  {firstRow.map(day => (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      style={{
                        width: `${dayButtonHeight}px`,
                        height: `${dayButtonHeight}px`,
                        maxWidth: `${maxButtonHeight}px`,
                        maxHeight: `${maxButtonHeight}px`
                      }}
                      className={`text-sm font-medium whitespace-nowrap flex items-center justify-center
                        ${selectedDays.has(day) ? 'bg-background-red-brown-button text-white' : 'bg-background-creamy-button text-text-red-brown hover:bg-background-red-button'}
                        border-none rounded-lg`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {/* Вторая строка */}
                {secondRow.length > 0 && (
                  <div className="days-row flex flex-1 items-stretch justify-center gap-1">
                    {secondRow.map(day => (
                      <button
                        key={day}
                        onClick={() => handleDayClick(day)}
                        style={{
                          width: `${dayButtonHeight}px`,
                          height: `${dayButtonHeight}px`,
                          maxWidth: `${maxButtonHeight}px`,
                          maxHeight: `${maxButtonHeight}px`
                        }}
                        className={`text-sm font-medium whitespace-nowrap flex items-center justify-center
                          ${selectedDays.has(day) ? 'bg-background-red-brown-button text-white' : 'bg-background-creamy-button text-text-red-brown hover:bg-background-red-button'}
                          border-none rounded-lg`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Кнопка "Все дни" */}
              <div className="flex-shrink-0" style={{ width: 'auto' }}>
                <button
                  onClick={() => {
                    setSelectedDays(new Set()); // сброс выбора
                    setSelectedPeriod('Все дни');
                  }}
                  style={{
                    height: `${dayButtonHeight * 2 + 2}px`,
                    maxHeight: `${maxButtonHeight * 2}px`
                  }}
                  className={`px-3 text-base font-bold text-center
                    ${selectedPeriod === 'Все дни' ? 'bg-background-red-brown-button text-white' : 'bg-background-creamy-button text-text-red-brown hover:bg-background-red-button'}
                    border-none rounded-lg min-w-[130px]`}
                >
                  Все дни
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {loading ? (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-red-brown mr-2"></div>
          <span className="text-text-red-brown font-semibold">Загрузка событий...</span>
        </div>
      ) : (
      //Основная часть
      <div className="flex flex-1 overflow-hidden">
        {/* Левая панель со списком */}
        <aside className="w-64 bg-background-creamy border-r border-gray-700 p-4 flex flex-col shrink-0"
          style={{
            backgroundImage: "url(/foncity.png)",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom left',
            backgroundSize: 'contain',
            maxHeight: 'calc(100vh - 108px)',
          }}
        >
          {/* Заголовок */}
          <h2 className="text-lg font-semibold mb-4 text-text-red-brown"> События революции </h2>
          <div className="mb-2 sticky top-0 bg-background-creamy z-10">
            {/* Поиск */}
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-background-creamy-button border border-gray-600 rounded-lg mb-4 text-text-red-brown focus:outline-none focus:border-blue-500"
            />
            {/* Крестик для очистки */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-9/24 transform -translate-y-1/2 text-lg text-[#fb6b4b] hover:text-[#c7492e] focus:outline-none flex items-center justify-center w-6 h-6"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Очистить"
              >
                ✕
              </button>
            )}
          </div>


          {/* Переключение отображения */}
          {
            !isSearching && (
              <div className="flex items-center mb-2">
                <button
                  onClick={toggleDisplayMode}
                  className="flex-1 px-2 py-2 rounded-lg bg-[#5D4037] text-white hover:bg-[#4E342E]"
                >
                  {showCategories ? 'Сортировать по дате' : 'Сортировать по категориям'}
                </button>
                {/* Маленькая кнопка "Показать все/скрыть все метки" */}
                <button
                  onClick={() => {
                    if (visibleEventIds.size === eventsData.length) {
                      setVisibleEventIds(new Set()); // скрыть все
                    } else {
                      setVisibleEventIds(new Set(eventsData.map(e => e.id))); // показать все
                    }
                  }}
                  className={`ml-2 px-2 py-1 text-xs rounded ${visibleEventIds.size === eventsData.length
                    ? 'bg-[#fb6b4b] hover:bg-[#c7492e]' // красная для креста
                    : 'bg-[#99f78f] hover:bg-[#12952c]' // зеленая для галки 
                    }`}
                >
                  {visibleEventIds.size === eventsData.length ? '✕' : '✓'}
                </button>
              </div>
            )
          }

          {/* Список по категориям или поиск */}
          <div className="flex-1 overflow-y-auto pr-3">
            {
              isSearching ? (
                // Результаты поиска
                <div>
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className="w-full text-left p-3 bg-background-creamy-button rounded-lg border-1 border-l-4 border-[var(--color-red-brown)] text-text-red-brown mb-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-text-red-brown font-semibold">{event.displayTime}</div>
                          <div className="font-medium">{event.title}</div>
                        </div>
                        {/* Чекбокс */}
                        <input
                          type="checkbox"
                          checked={visibleEventIds.has(event.id)}
                          onChange={() => {
                            setVisibleEventIds(prev => {
                              const newSet = new Set(prev);
                              if (newSet.has(event.id)) {
                                newSet.delete(event.id);
                              } else {
                                newSet.add(event.id);
                              }
                              return newSet;
                            });
                          }}
                          title="Показать/скрыть на карте"
                          className="ml-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : showCategories ? (
                // Категории
                sortedCategories.map((category) => {
                  const isOpen = openCategories.has(category);
                  const eventsInCategory = filteredGroupedByEventType[category] || [];
                  return (
                    <div key={category}>
                      <h3
                        className="mt-4 mb-2 text-xl font-bold cursor-pointer flex items-center"
                        onClick={() => {
                          const newSet = new Set(openCategories);
                          if (newSet.has(category)) {
                            newSet.delete(category);
                          } else {
                            newSet.add(category);
                          }
                          setOpenCategories(newSet);
                        }}
                      >
                        <span className="mr-2">{isOpen ? '▼' : '▶'}</span> {category}
                      </h3>
                      {isOpen && eventsInCategory.length > 0 &&
                        eventsInCategory.map((event) => (
                          <div
                            key={event.id}
                            className="w-full text-left p-3 bg-background-creamy-button rounded-lg border-1 border-l-4 border-[var(--color-red-brown)] text-text-red-brown mb-2"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm text-text-red-brown font-semibold">{event.displayTime}</div>
                                <div className="font-medium">{event.title}</div>
                              </div>
                              {/* Чекбокс */}
                              <input
                                type="checkbox"
                                checked={visibleEventIds.has(event.id)}
                                onChange={() => {
                                  setVisibleEventIds(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(event.id)) {
                                      newSet.delete(event.id);
                                    } else {
                                      newSet.add(event.id);
                                    }
                                    return newSet;
                                  });
                                }}
                                title="Показать/скрыть на карте"
                                className="ml-2"
                              />
                            </div>
                          </div>
                        ))
                      }
                      {isOpen && eventsInCategory.length === 0 && (
                        <div className="ml-4 text-text-red-brown">Нет событий</div>
                      )}
                    </div>
                  );
                })
              ) : (
                // Весь список без группировки
                filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="w-full text-left p-3 bg-background-creamy-button rounded-lg border-1 border-l-4 border-[var(--color-red-brown)] text-text-red-brown mb-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-text-red-brown font-semibold">{event.displayTime}</div>
                        <div className="font-medium">{event.title}</div>
                      </div>
                      {/* Чекбокс */}
                      <input
                        type="checkbox"
                        checked={visibleEventIds.has(event.id)}
                        onChange={() => {
                          setVisibleEventIds(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(event.id)) {
                              newSet.delete(event.id);
                            } else {
                              newSet.add(event.id);
                            }
                            return newSet;
                          });
                        }}
                        title="Показать/скрыть на карте"
                        className="ml-2"
                      />
                    </div>
                  </div>
                ))
              )
            }
          </div>

          {/* Меню снизу */}
          <div className="mt-auto pt-4 flex flex-col space-y-2">
            <button
              onClick={handleSetMarker}
              className={`px-3 py-2 rounded-lg transition-all ${isMarkerMode ? 'bg-orange-500 text-white' : 'bg-[#8B4513] text-white hover:bg-[#70360F]'}`}
            >
              📍 Поставить метку
            </button>
          </div>
        </aside>

        {/* Карта */}
        <main className="flex-1 bg-background-creamy relative flex flex-col">
          {showMap ? (
            <div className="flex-1 overflow-hidden relative" style={{ zIndex: 0 }}>
              <HistoricalMap
                events={eventsForMap}
                isMarkerMode={isMarkerMode}
                onMarkerModeChange={setIsMarkerMode}
                visibleEventIds={visibleEventIds}
                displayMode={displayMode}
                onEventClick={(event) => {
                  setSelectedEvent(event);
                  setIsDetailPanelOpen(true);
                  setDisplayMode('panel');
                }}
              />

            </div>
          ) : (

            <div className="flex-1 flex items-center justify-center relative overflow-hidden" style={{ maxWidth: '100vw', maxHeight: 'calc(100vh - 156px)' }}>
              <motion.div
                className="w-full h-full flex items-center justify-center box-border"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <img
                  src="Azourus.jpg"
                  alt="Спонсор"
                  className="max-w-full max-h-full object-contain"
                />
              </motion.div>
            </div>
          )}
          <hr className="border-black" />
          {/* Место для авторов */}
          <div
            className="p-2 font-bold text-text-red-brown tracking-wide leading-tight text-center"
            style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem' }}
          >
            Developed by bez.bab: Miwm64 | kessi.kissa | 69n1Ner_ | i11uha
          </div>

          {isDetailPanelOpen && selectedEvent && showMap && (
            <div className="absolute right-0 top-0 h-full w-64 bg-background-creamy border-l border-gray-300 rounded-lg opacity-85 shadow-lg z-50 p-4 overflow-y-auto" style={{ zIndex: 60, maxHeight: 'calc(100vh - 156px)' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-text-red-brown">
                  {selectedEvent.title}
                </h3>
                <div className="flex space-x-2">
                  {/*<button
                    onClick={() => {
                      setIsDetailPanelOpen(false); // Скрываем панель
                      setDisplayMode('popup');   // Переключаем режим обратно
                    }}
                    className="px-3 py-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Свернуть
                  </button>*/}
                  <button
                    onClick={() => {setIsDetailPanelOpen(false); // Скрываем панель
                      setDisplayMode('popup');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-text-red-brown">Дата:</span>
                  <p>{selectedEvent.displayTimeHMS}</p>
                </div>
                <div>
                  <span className="font-semibold text-text-red-brown">Категория:</span>
                  <p>{eventTypeDisplayNames[selectedEvent.eventType] || 'Не указана'}</p>
                </div>
                <div>
                  <span className="font-semibold text-text-red-brown">Описание:</span>
                  <p className="whitespace-pre-line">{selectedEvent.description}</p>
                </div>
                {selectedEvent.prevEvent && (
                  <div>
                    <span className="font-semibold text-text-red-brown">Предыдущее событие:</span>
                    <p>ID: {selectedEvent.prevEvent}</p>
                  </div>
                )}
                {selectedEvent.nextEvent && (
                  <div>
                    <span className="font-semibold text-text-red-brown">Следующее событие:</span>
                    <p>ID: {selectedEvent.nextEvent}</p>
                  </div>
                )}
              </div>
            </div>
          )}


        </main>
      </div>
      )}
    </div>
  );
}

export default App;