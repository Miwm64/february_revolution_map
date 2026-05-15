// компонент для группы по дате
// src/components/DateGroup.tsx
// src/components/DateGroup.tsx
import React, { useState } from 'react';
import EventItem from './EventItem';

interface DateGroupProps {
  date: string;
  events: string[];
  filterText: string;
  textColor?: string; // например, "text-red-600"
}

export default function DateGroup({ date, events, filterText, textColor = "text-black" }: DateGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filteredEvents = events.filter(event =>
    event.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="mb-2">
      <div
        className={`font-semibold cursor-pointer ${textColor}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {date} ({filteredEvents.length})
      </div>
      {isOpen && (
        <div className="pl-4 mt-1">
          {filteredEvents.map((eventName, index) => (
            <EventItem key={index} name={eventName} textColor={textColor} />
          ))}
        </div>
      )}
    </div>
  );
}