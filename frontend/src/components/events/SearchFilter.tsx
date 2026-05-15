import React from 'react';

interface SearchFilterProps {
  searchText: string;
  setSearchText: (text: string) => void;
  borderColor?: string; // например, "border-red-500"
  textColor?: string;   // например, "text-blue-600"
  caretColor?: string;  // например, "yellow-500" или любой другой Tailwind цвет
}

export default function SearchFilter({ 
  searchText, 
  setSearchText, 
  borderColor = 'border-gray-300', 
  textColor = 'text-black',
  caretColor = 'caret-black' // по умолчанию черный курсор
}: SearchFilterProps) {
  return (
    <div className="search-filter mb-2">
      <input
        type="text"
        placeholder="Поиск по событиям..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className={`
          ${borderColor} 
          ${textColor} 
          ${caretColor} 
          p-2 w-48 border-2 rounded
        `}
      />
    </div>
  );
}