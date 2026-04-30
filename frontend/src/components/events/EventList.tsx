// основной компонент со списком и поиском
// src/components/EventList.tsx

import { useState } from 'react';
import DateGroup from './DateGroup';
import SearchFilter from './SearchFilter';

interface EventData {
  [date: string]: string[]; // структура: дата -> список событий
}

const data: EventData = {
  '9 марта': [
    'Захват оборонительного пункта',
    'Наступление на Волгоград',
  ],
  '5 февраля': [
    'Битва за город',
    'Операция по освобождению',
  ],
  // добавьте свои даты и события
};

export default function EventList() {
  const [searchText, setSearchText] = useState('');

  // фильтрация данных по поиску
  const filteredData = Object.entries(data).filter(([date, events]) =>
    events.some(event => event.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div 
      className="
        overflow-y-auto
      "
      style={{
        height: '100%',
        padding: '10px 30px 10px 10px',
        backgroundColor: '#f0f0f0',
        border: '2px solid #333',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}
    >
      <SearchFilter searchText={searchText} setSearchText={setSearchText} />
      {filteredData.length === 0 ? (
        <div>Нет совпадений</div>
      ) : (
        filteredData.map(([date, events], index) => (
          <DateGroup key={index} date={date} events={events} filterText={searchText} />
        ))
      )}
    </div>
  );
}