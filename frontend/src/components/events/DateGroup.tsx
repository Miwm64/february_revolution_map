// компонент для группы по дате
// src/components/DateGroup.tsx
import React, { useState } from 'react';
import EventItem from './EventItem';

interface DateGroupProps {
  date: string;
  events: string[]; // список названий событий
  filterText: string; // текущий фильтр поиска
}

export default function DateGroup({ date, events, filterText }: DateGroupProps) {
  const [isOpen, setIsOpen] = useState(false);

  // фильтрация событий по поисковому запросу
  const filteredEvents = events.filter(event =>
    event.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="date-group">
      <div
        className="date-header"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', fontWeight: 'bold' }}
      >
        {date} ({filteredEvents.length})
      </div>
      {isOpen && (
        <div className="event-list" style={{ paddingLeft: '20px' }}>
          {filteredEvents.map((eventName, index) => (
            <EventItem key={index} name={eventName} />
          ))}
        </div>
      )}
    </div>
  );
}