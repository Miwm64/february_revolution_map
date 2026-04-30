// компонент для отдельного события
// src/components/EventItem.tsx
import React from 'react';

interface EventItemProps {
  name: string;
}

export default function EventItem({ name }: EventItemProps) {
  return <div className="event-item">{name}</div>;
}