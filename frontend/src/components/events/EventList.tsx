// основной компонент со списком и поиском
// src/components/EventList.tsx
import React, { useState } from 'react';
import DateGroup from './DateGroup';
import SearchFilter from './SearchFilter';
import './EventList.css';

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
    <div className="event-list-container">
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