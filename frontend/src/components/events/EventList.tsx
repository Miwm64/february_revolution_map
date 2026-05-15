// основной компонент со списком и поиском
// src/components/EventList.tsx

import { useState } from 'react';
import DateGroup from './DateGroup';
import SearchFilter from './SearchFilter';

interface EventData {
  [date: string]: string[]; // структура: дата -> список событий
}

interface EventListProps {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
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

export default function EventList({ backgroundColor = "bg-white", textColor = "text-black", borderColor = "border-gray-700"}: EventListProps) {
  const [searchText, setSearchText] = useState('');

  // фильтрация данных по поиску
  const filteredData = Object.entries(data).filter(([date, events]) =>
    events.some(event => event.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <div className={`${backgroundColor} ${borderColor} p-4`}>
      <SearchFilter searchText={searchText} setSearchText={setSearchText} borderColor="border-black" textColor={textColor}/>
      {filteredData.length === 0 ? (
        <div className={`mb-1 ${textColor}`}>Нет совпадений</div>
      ) : (
        filteredData.map(([date, events], index) => (
          <DateGroup key={index} date={date} events={events} filterText={searchText} textColor={textColor} />
        ))
      )}
    </div>
  );
}