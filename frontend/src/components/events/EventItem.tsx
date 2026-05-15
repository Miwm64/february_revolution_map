// компонент для отдельного события
// src/components/EventItem.tsx
import React from 'react';

interface EventItemProps {
  name: string;
  textColor?: string; // например, "text-red-600"
}


export default function EventItem({ name, textColor = "text-black" }: EventItemProps) {
  return <div className={`mb-1 ${textColor}`}>{name}</div>;
}