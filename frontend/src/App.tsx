import './output.css';
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import HistoricalMap from './HistoricalMap';
import './App.css';

// =========================
// КОНСТАНТЫ И ТИПЫ
// =========================

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

  // =========================
  // СОСТОЯНИЕ (STATE)
  // =========================

  // Данные событий
  const [eventsData, setEventsData] = useState<Event[]>([]);
  const [eventsForMap, setEventsForMap] = useState<Event[]>([]); // Фильтрованные события для карты
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]); // Фильтрованные события для списка
  const [loading, setLoading] = useState(true);

  // Фильтрация и поиск
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Все дни');
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());

  // Видимость элементов UI
  const [showCategories, setShowCategories] = useState(true); // Режим отображения списка (категории vs плоский список)
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set()); // Раскрытые категории
  const [showMap, setShowMap] = useState(true); // @_@
  const [isMarkerMode, setIsMarkerMode] = useState(false); // Режим постановки метки

  // Детальная панель события
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<'popup' | 'panel'>('popup');

  // Видимость маркеров на карте (ID событий)
  const [visibleEventIds, setVisibleEventIds] = useState<Set<number>>(new Set());

  // Размеры панелей
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [detailPanelWidth, setDetailPanelWidth] = useState(250);

  // Предупреждение о датах (Old Style / New Style)
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(() => {
    // Проверяем localStorage при первой загрузке
    return localStorage.getItem('date_disclaimer_accepted') !== 'true';
  });

  // Рефы для DOM элементов и логики ресайза
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);
  const isResizingRight = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const daysContainerRef = useRef<HTMLDivElement>(null);

  // Рефы для сохранения предыдущих значений ширины (чтобы не спамить в localStorage)
  const prevSidebarWidth = useRef(sidebarWidth);
  const prevDetailPanelWidth = useRef(detailPanelWidth);

  // Геометрия заголовка
  const [titleHeight, setTitleHeight] = useState<number>(0);
  const [dayButtonHeight, setDayButtonHeight] = useState(0);
  const maxButtonHeight = 40;
  const minButtonHeight = 30;

  // =========================
  // ХЕЛПЕРЫ И МЕМОИЗАЦИЯ
  // =========================

  // Map для быстрого доступа к событию по ID (O(1))
  const eventsMap = useMemo(() => {
    const map = new Map<number, Event>();
    eventsData.forEach(e => map.set(e.id, e));
    return map;
  }, [eventsData]);

  // Безопасное получение события по ID
  const getEventById = (id: number | null): Event | undefined => {
    if (id === null || id === undefined) return undefined;
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return eventsMap.get(numericId);
  };

  // Получение доступных дней из данных
  const availableDays = useMemo(() => {
    const daysSet = new Set<string>();
    eventsData.forEach(e => {
      daysSet.add(String(new Date(e.time).getDate()));
    });
    return Array.from(daysSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [eventsData]);

  // Разделение дней на две строки для адаптивности
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

  // Группировка отфильтрованных событий по типам
  const filteredGroupedByEventType: Record<string, Event[]> = useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      const displayName = eventTypeDisplayNames[event.eventType] || 'Другие';
      if (!acc[displayName]) {
        acc[displayName] = [];
      }
      acc[displayName].push(event);
      return acc;
    }, {} as Record<string, Event[]>);
  }, [filteredEvents]);

  // Сортировка категорий (Другие всегда в конце)
  const sortedCategories = useMemo(() => {
    const categoriesWithEvents = Object.keys(filteredGroupedByEventType).filter(cat => filteredGroupedByEventType[cat].length > 0);
    return [
      ...categoriesWithEvents.filter(c => c !== 'Другие'),
      ...(categoriesWithEvents.includes('Другие') ? ['Другие'] : [])
    ];
  }, [filteredGroupedByEventType]);

  const isSearching = searchQuery.trim() !== "";

  // =========================
  // ЭФФЕКТЫ (EFFECTS)
  // =========================

  // 1. Загрузка данных
  useEffect(() => {
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

          return {
            ...event,
            displayTime: `${day} ${displayMonthNames[monthIndex]} ${year}`,
            displayTimeHMS: `${day} ${displayMonthNames[monthIndex]} ${year} | ${periodName}`,
            monthKey: categoryMonthNames[monthIndex] + ' ' + year,
          };
        });

        setEventsData(processedData);
        setEventsForMap(processedData);
        // По умолчанию показываем все события
        setVisibleEventIds(new Set(processedData.map((e: Event) => e.id)));
      } catch (err) {
        console.error("Ошибка загрузки событий:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Горячие клавиши: ← / → для навигации по событиям
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDetailPanelOpen || !selectedEvent) return;

      if (e.key === 'ArrowLeft' && selectedEvent.prevEvent) {
        const prev = getEventById(selectedEvent.prevEvent);
        if (prev) setSelectedEvent(prev);
      }
      if (e.key === 'ArrowRight' && selectedEvent.nextEvent) {
        const next = getEventById(selectedEvent.nextEvent);
        if (next) setSelectedEvent(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailPanelOpen, selectedEvent, eventsMap]);

  // 3. Фильтрация событий для Списка (левая панель)
  useEffect(() => {
    let filtered = eventsData;

    // Поиск по тексту
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.displayTime.toLowerCase().includes(q) ||
        e.time.toLowerCase().includes(q)
      );
    }

    // Фильтр по конкретному дню (если выбран один день через селектор периода)
    if (selectedPeriod !== 'Все дни' && selectedPeriod !== 'Множественный') {
      const dayNum = parseInt(selectedPeriod, 10);
      if (!isNaN(dayNum)) {
        filtered = filtered.filter(e =>
          String(new Date(e.time).getDate()) === String(dayNum)
        );
      }
    }

    // Фильтр по множественному выбору дней
    if (selectedDays.size > 0 && !selectedDays.has('Все дни')) {
      filtered = filtered.filter(e => {
        const dayNumber = String(new Date(e.time).getDate());
        return selectedDays.has(dayNumber);
      });
    }

    // Сортировка по времени (от старых к новым)
    filtered.sort((a, b) => {
      const dateA = new Date(a.time);
      const dateB = new Date(b.time);
      return dateA.getTime() - dateB.getTime();
    });

    setFilteredEvents(filtered);
  }, [searchQuery, eventsData, selectedDays, selectedPeriod]);

  // 4. Фильтрация событий для Карты
  useEffect(() => {
    let filtered = eventsData;

    if (selectedPeriod !== 'Все дни' && selectedPeriod !== 'Множественный') {
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

  // 5. Синхронизация "Все дни" при очистке выбора
  useEffect(() => {
    if (selectedDays.size === 0) {
      setSelectedPeriod('Все дни');
    }
  }, [selectedDays]);

  // 6. Расчет высоты кнопок дней в зависимости от высоты заголовка
  useLayoutEffect(() => {
    if (titleRef.current) {
      const newTitleHeight = titleRef.current.offsetHeight;
      // Высота кнопки дня = половина высоты заголовка, но в пределах min/max
      const calculatedDayHeight = newTitleHeight / 2;
      const constrainedHeight = Math.max(Math.min(calculatedDayHeight, maxButtonHeight), minButtonHeight);

      setTitleHeight(newTitleHeight);
      setDayButtonHeight(constrainedHeight);
    }
  }, [availableDays]); // Пересчитываем при изменении количества дней (может повлиять на layout)

  // 7. Сохранение ширины сайдбара в LocalStorage
  useEffect(() => {
    if (prevSidebarWidth.current !== sidebarWidth) {
      localStorage.setItem('sidebarWidth', sidebarWidth.toString());
      prevSidebarWidth.current = sidebarWidth;
    }
  }, [sidebarWidth]);

  // 8. Загрузка ширины сайдбара при старте
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= 200 && width <= 400) {
        setSidebarWidth(width);
      }
    }
  }, []);

  // 9. Сохранение ширины панели деталей в LocalStorage
  useEffect(() => {
    if (prevDetailPanelWidth.current !== detailPanelWidth) {
      localStorage.setItem('detailPanelWidth', detailPanelWidth.toString());
      prevDetailPanelWidth.current = detailPanelWidth;
    }
  }, [detailPanelWidth]);

  // 10. Загрузка ширины панели деталей при старте
  useEffect(() => {
    const savedWidth = localStorage.getItem('detailPanelWidth');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= 200 && width <= 800) {
        setDetailPanelWidth(width);
      }
    }
  }, []);

  // =========================
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // =========================

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('date_disclaimer_accepted', 'true');
    setShowDisclaimer(false);
  };

  // Тсссс...
  const handleLogoClick = () => {
    setShowMap(prev => !prev);
  };

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

  // Универсальный переключатель видимости одного события
  const toggleEventVisibility = (eventId: number) => {
    setVisibleEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Массовое переключение видимости категории
  const toggleCategoryVisibility = (category: string) => {
    const eventsInCategory = filteredGroupedByEventType[category] || [];
    if (eventsInCategory.length === 0) return;

    // Проверяем, все ли события категории сейчас видны
    const allVisible = eventsInCategory.every(e => visibleEventIds.has(e.id));

    setVisibleEventIds(prev => {
      const newSet = new Set(prev);
      if (allVisible) {
        // Если все видны -> скрываем все события этой категории
        eventsInCategory.forEach(e => newSet.delete(e.id));
      } else {
        // Иначе -> показываем все события этой категории
        eventsInCategory.forEach(e => newSet.add(e.id));
      }
      return newSet;
    });
  };

  // Определение состояния чекбокса категории (all/none/some)
  const getCategoryVisibilityState = (category: string): 'all' | 'none' | 'some' => {
    const eventsInCategory = filteredGroupedByEventType[category] || [];
    if (eventsInCategory.length === 0) return 'none';

    const visibleCount = eventsInCategory.filter(e => visibleEventIds.has(e.id)).length;

    if (visibleCount === eventsInCategory.length) return 'all';
    if (visibleCount === 0) return 'none';
    return 'some';
  };

  // Переключение между списком и категориями
  const toggleDisplayMode = () => {
    setShowCategories(prev => !prev);
  };


  // --- Логика Resizable (изменение размера панелей) ---

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResize);
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResize);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;

    const newWidth = e.clientX;
    if (newWidth >= 200 && newWidth <= 400) {
      setSidebarWidth(newWidth);
    }
  };

  const startResizeRight = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRight.current = true;
    document.addEventListener('mousemove', handleMouseMoveRight);
    document.addEventListener('mouseup', stopResizeRight);
  };

  const stopResizeRight = () => {
    isResizingRight.current = false;
    document.removeEventListener('mousemove', handleMouseMoveRight);
    document.removeEventListener('mouseup', stopResizeRight);
  };

  const handleMouseMoveRight = (e: MouseEvent) => {
    if (!isResizingRight.current) return;

    // Ширина правой панели определяется от правого края экрана
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 200 && newWidth <= 800) {
      setDetailPanelWidth(newWidth);
    }
  };

  // =========================
  // РЕНДЕР (JSX)
  // =========================

  return (
    <div className="min-h-screen bg-background-creamy text-text-red-brown flex flex-col relative">

      {/* --- МОДАЛЬНОЕ ОКНО: ПРЕДУПРЕЖДЕНИЕ О КАЛЕНДАРЕ --- */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background-creamy border-2 border-[#5D4037] rounded-xl shadow-2xl max-w-md w-full p-6 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-[#fb6b4b]"></div>
              <h2 className="text-2xl font-bold mb-4 text-[#5D4037]" style={{ fontFamily: 'Georgia, serif' }}>
                Важное уточнение
              </h2>
              <p className="text-lg mb-6 leading-relaxed text-gray-800">
                Все даты на карте указаны по <span className="font-bold text-[#fb6b4b]">современному (григорианскому) календарю</span>.
                <br /><br />
                В 1917 году Россия использовала юлианский календарь («старый стиль»), который отставал на 13 дней.
              </p>
              <button
                onClick={handleAcceptDisclaimer}
                className="w-full py-3 px-6 bg-[#5D4037] hover:bg-[#4E342E] text-white font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 shadow-md"
              >
                Понятно, продолжить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Заголовок */}
      <header className="bg-background-creamy border-b border-gray-700 p-4 shrink-0" style={{ minHeight: minButtonHeight * 2 }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Логотип и название */}
          <div className="flex items-center space-x-4" style={{ flex: 2, minHeight: minButtonHeight * 2 }}>
            <div className="logo-container relative">
              <img
                src="logo.jpg"
                alt="Азоурус"
                className="w-18 h-12 object-contain cursor-pointer"
                onClick={handleLogoClick}
              />
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

          {/* Блок выбора дней */}
          <div className="flex flex-1 justify-end h-full" style={{ flex: 1, minHeight: minButtonHeight * 2 }}>
            <div className="flex flex-nowrap items-stretch gap-2 h-full">

              {/* Контейнер с кнопками дней */}
              <div
                className="days-container flex-1 flex flex-col items-stretch gap-1"
                ref={daysContainerRef}
                style={{ height: `${titleHeight}px`, maxHeight: `${maxButtonHeight * 2}px` }}
              >
                {/* Первая строка дней */}
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
                        ${selectedDays.has(day)
                          ? 'bg-background-red-brown-button text-white'
                          : 'bg-background-creamy-button text-text-red-brown hover:bg-background-red-button'}
                        border-none rounded-lg transition-colors`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* Вторая строка дней (если есть) */}
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
                          ${selectedDays.has(day)
                            ? 'bg-background-red-brown-button text-white'
                            : 'bg-background-creamy-button text-text-red-brown hover:bg-background-red-button'}
                          border-none rounded-lg transition-colors`}
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
                    ${selectedPeriod === 'Все дни'
                      ? 'bg-background-red-brown-button text-white'
                      : 'bg-background-creamy-button text-text-red-brown hover:bg-background-red-button'}
                    border-none rounded-lg min-w-[130px] transition-colors`}
                >
                  Все дни
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- ОСНОВНОЙ КОНТЕНТ --- */}
      {loading ? (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-red-brown mr-2"></div>
          <span className="text-text-red-brown font-semibold">Загрузка событий...</span>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">

          {/* ЛЕВАЯ ПАНЕЛЬ (САЙДБАР) */}
          <aside
            ref={sidebarRef}
            className="bg-background-creamy border-r border-gray-700 p-4 flex flex-col shrink-0 relative"
            style={{
              width: `${sidebarWidth}px`,
              maxWidth: '400px',
              minWidth: '200px',
              backgroundImage: "url(/foncity.png)",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'bottom left',
              backgroundSize: 'contain',
              maxHeight: 'calc(100vh - 108px)',
            }}
          >
            <h2 className="text-lg font-semibold mb-4 text-text-red-brown">События революции</h2>

            {/* Поиск */}

            <div className="mb-2 sticky top-0 bg-background-creamy z-10 relative">
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-background-creamy-button border border-gray-600 rounded-lg mb-4 text-text-red-brown focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-9/24 transform -translate-y-1/2 text-lg text-[#fb6b4b] hover:text-[#c7492e] focus:outline-none flex items-center justify-center w-6 h-6"
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label="Очистить поиск"
                >
                  ✕
                </button>
              )}
            </div>


            {/* Панель управления видом списка */}
            {!isSearching && (
              <div className="flex items-center mb-2">
                <button
                  onClick={toggleDisplayMode}
                  className="flex-1 px-2 py-2 rounded-lg bg-[#5D4037] text-white hover:bg-[#4E342E] transition-colors text-sm"
                  title="Переключить сортировку"
                >
                  {showCategories ? 'Сортировать по дате' : 'Сортировать по категориям'}
                </button>

                {/* Кнопка "Показать все / Скрыть все" */}
                <button
                  onClick={() => {
                    if (visibleEventIds.size === eventsData.length) {
                      setVisibleEventIds(new Set()); // Скрыть все
                    } else {
                      setVisibleEventIds(new Set(eventsData.map(e => e.id))); // Показать все
                    }
                  }}
                  className={`ml-2 px-2 py-1 text-xs rounded transition-colors
                    ${visibleEventIds.size === eventsData.length
                      ? 'bg-[#fb6b4b] text-white hover:bg-[#c7492e]' // красная для креста
                      : 'bg-[#99f78f] hover:bg-[#12952c] text-black' // зеленая для галки 
                    }`}
                  title={visibleEventIds.size === eventsData.length
                    ? 'Снять выделение'
                    : 'Выделить всё'
                  }
                >
                  {visibleEventIds.size === eventsData.length ? '✕' : '✓'}
                </button>
              </div>
            )}

            {/* Список событий */}

            <div className="flex-1 overflow-y-auto pr-3">
              {isSearching ? (
                // РЕЖИМ ПОИСКА
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
                        <input
                          type="checkbox"
                          checked={visibleEventIds.has(event.id)}
                          onChange={() => toggleEventVisibility(event.id)}
                          title="Показать/скрыть на карте"
                          className="ml-2 accent-[#5D4037] cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : showCategories ? (
                // РЕЖИМ КАТЕГОРИЙ
                sortedCategories.map((category) => {
                  const isOpen = openCategories.has(category);
                  const eventsInCategory = filteredGroupedByEventType[category] || [];

                  return (
                    <div key={category} className="mb-2">
                      <h3
                        className="mt-4 mb-2 text-xl font-bold cursor-pointer flex items-start gap-2 break-words select-none"
                        onClick={() => {
                          const newSet = new Set(openCategories);
                          if (newSet.has(category)) {
                            newSet.delete(category);
                          } else {
                            newSet.add(category);
                          }
                          setOpenCategories(newSet);
                        }}
                        style={{ wordBreak: 'break-word' }}
                      >
                        <span className="flex-shrink-0 w-4 text-center">
                          {isOpen ? '▼' : '▶'}
                        </span>
                        <span className="flex-1 min-w-0 leading-tight">
                          {category}
                        </span>

                        {/* Индикатор видимости категории */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategoryVisibility(category);
                          }}
                          className={`ml-1 w-4 h-4 flex items-center justify-center rounded text-[8px] font-bold flex-shrink-0 transition-colors
                            ${getCategoryVisibilityState(category) === 'all'
                              ? 'bg-[#fb6b4b] text-white hover:bg-[#c7492e]' // красный крест
                              : getCategoryVisibilityState(category) === 'none'
                                ? 'bg-[#99f78f] text-[#12952c] hover:bg-[#12952c] hover:text-white' // зелёная галка
                                : 'bg-gray-300 text-gray-600 hover:bg-gray-400' // серый дефис (частичный)
                            }`}
                          title={
                            getCategoryVisibilityState(category) === 'all'
                              ? 'Скрыть категорию' :
                              getCategoryVisibilityState(category) === 'none'
                                ? 'Показать категорию' :
                                'Частично видно'
                          }
                        >
                          {getCategoryVisibilityState(category) === 'all' ? '✕' :
                            getCategoryVisibilityState(category) === 'none' ? '✓' : '–'}
                        </button>
                      </h3>

                      {isOpen && (
                        <>
                          {eventsInCategory.length > 0 ? (
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
                                  <input
                                    type="checkbox"
                                    checked={visibleEventIds.has(event.id)}
                                    onChange={() => toggleEventVisibility(event.id)}
                                    title="Показать/скрыть на карте"
                                    className="ml-2 accent-[#5D4037] cursor-pointer"
                                  />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="ml-4 text-text-red-brown">Нет событий</div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                // РЕЖИМ СПИСКА (ПО ДАТАМ)
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
                        onChange={() => toggleEventVisibility(event.id)}
                        title="Показать/скрыть на карте"
                        className="ml-2 accent-[#5D4037] cursor-pointer"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Ручка изменения размера сайдбара */}
            <div
              className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-[#5D4037]/30 hover:bg-[#5D4037] transition-colors z-20"
              onMouseDown={startResize}
              title="Изменить ширину панели"
            />
          </aside>

          {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ (КАРТА) */}
          <main
            className="flex-1 bg-background-creamy relative flex flex-col"
            style={{ flex: `1 1 calc(100vw - ${sidebarWidth}px)` }}
          >
            {showMap ? (
              <div className="flex-1 overflow-hidden relative" style={{ zIndex: 0 }}>
                <HistoricalMap
                  events={eventsForMap}
                  isMarkerMode={isMarkerMode}
                  onMarkerModeChange={setIsMarkerMode}
                  visibleEventIds={visibleEventIds}
                  displayMode={displayMode}
                  selectedEventId={selectedEvent?.id ?? null}
                  onEventClick={(event) => {
                    setSelectedEvent(event);
                    setIsDetailPanelOpen(true);
                    setDisplayMode('panel');
                  }}
                />

              </div>
            ) : (

              <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#fdfbf7]"
                style={{ maxWidth: '100vw', maxHeight: 'calc(100vh - 156px)' }}>
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

            <hr className="border-[#5D4037]/20" />

            {/* Место для авторов */}
            <div
              className="p-2 font-bold text-text-red-brown tracking-wide leading-tight text-center bg-background-creamy"
              style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem' }}
            >
              Developed by bez.bab: Miwm64 | kessi.kissa | 69n1Ner_ | i11uha
            </div>

            {/* ПРАВАЯ ПАНЕЛЬ ДЕТАЛЕЙ (DETAIL PANEL) */}
            {isDetailPanelOpen && selectedEvent && showMap && (
              <motion.div
                initial={{ x: detailPanelWidth, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: detailPanelWidth, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute right-0 top-0 h-full bg-background-creamy/90 border-l border-gray-300 shadow-lg z-50 flex flex-col"
                style={{
                  width: `${detailPanelWidth}px`,
                  maxWidth: '800px',
                  minWidth: '200px',
                  zIndex: 60,
                  maxHeight: 'calc(100vh - 156px)'
                }}
              >
                {/* Ручка изменения размера правой панели (слева от панели) */}
                <div
                  className="absolute top-0 left-0 w-1 h-full cursor-col-resize bg-[#5D4037]/30 hover:bg-[#5D4037] transition-colors z-20"
                  onMouseDown={startResizeRight}
                  title="Изменить ширину панели"
                />
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="relative mb-2 pr-8">
                    <h3 className="text-[#5D4037] text-2xl font-semibold font-bold leading-tight">
                      {selectedEvent.title}
                    </h3>
                    <button
                      onClick={() => {
                        setIsDetailPanelOpen(false);
                        setSelectedEvent(null);
                        setDisplayMode('popup');
                      }}
                      className="absolute top-0 right-0 text-gray-400 hover:text-gray-900 transition-colors p-1"
                      aria-label="Закрыть"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Содержимое */}
                  <div className="space-y-4 text-[#5D4037] flex-1">
                    <div className="bg-white/50 p-2 rounded-lg border border-gray-200">
                      <span className="font-semibold block text-sm uppercase">Дата и время</span>
                      <p className="text-lg text-black">{selectedEvent.displayTimeHMS}</p>
                    </div>

                    <div className="bg-white/50 p-2 rounded-lg border border-gray-200">
                      <span className="font-semibold block text-sm uppercase">Категория</span>
                      <p className="text-base font-medium text-black">{eventTypeDisplayNames[selectedEvent.eventType] || 'Не указана'}</p>
                    </div>

                    <div className="bg-white/50 p-2 rounded-lg border border-gray-200">
                      <span className="font-semibold block text-sm uppercase">Описание</span>
                      <p className="text-base leading-relaxed whitespace-pre-wrap text-black">{selectedEvent.description}</p>
                    </div>

                    {/* Навигация: Предыдущее/Следующее событие (текстовые ссылки) */}
                    {(selectedEvent.prevEvent || selectedEvent.nextEvent) && (
                      <div className="pt-4 border-t border-gray-300 space-y-2">
                        {selectedEvent.prevEvent && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="font-semibold text-[#5D4037] whitespace-nowrap">← Предыдущее:</span>
                            <button
                              onClick={() => { const prev = getEventById(selectedEvent.prevEvent); if (prev) setSelectedEvent(prev); }}
                              className="text-left hover:text-[#fb6b4b] hover:underline transition-colors"
                            >
                              {eventsMap.get(selectedEvent.prevEvent)?.title}
                            </button>
                          </div>
                        )}
                        {selectedEvent.nextEvent && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="font-semibold text-[#5D4037] whitespace-nowrap">Следующее: →</span>
                            <button
                              onClick={() => { const next = getEventById(selectedEvent.nextEvent); if (next) setSelectedEvent(next); }}
                              className="text-left hover:text-[#fb6b4b] hover:underline transition-colors"
                            >
                              {eventsMap.get(selectedEvent.nextEvent)?.title}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Кнопки навигации внизу */}
                  <div className="mt-6 pt-4 border-t border-gray-300 flex items-center justify-between gap-4">
                    <button
                      onClick={() => {
                        const prev = getEventById(selectedEvent.prevEvent);
                        if (prev) setSelectedEvent(prev);
                      }}
                      disabled={!selectedEvent.prevEvent || !getEventById(selectedEvent.prevEvent)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-bold transition-all
                      ${selectedEvent.prevEvent && getEventById(selectedEvent.prevEvent)
                          ? 'bg-[#5D4037] text-white hover:bg-[#4E342E] active:scale-95 shadow-md'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <span>←</span>
                      <span className="hidden sm:inline">Назад</span>
                    </button>

                    <button
                      onClick={() => {
                        const next = getEventById(selectedEvent.nextEvent);
                        if (next) setSelectedEvent(next);
                      }}
                      disabled={!selectedEvent.nextEvent || !getEventById(selectedEvent.nextEvent)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-bold transition-all
                      ${selectedEvent.nextEvent && getEventById(selectedEvent.nextEvent)
                          ? 'bg-[#5D4037] text-white hover:bg-[#4E342E] active:scale-95 shadow-md'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <span className="hidden sm:inline">Вперед</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </main>
        </div>
      )}
    </div>
  );
}

export default App;