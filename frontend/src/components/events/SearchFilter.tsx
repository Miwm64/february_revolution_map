// компонент поиска и фильтрации
// src/components/SearchFilter.tsx
import React from 'react';

interface SearchFilterProps {
  searchText: string;
  setSearchText: (text: string) => void;
}

export default function SearchFilter({ searchText, setSearchText }: SearchFilterProps) {
  return (
    <div className="search-filter" style={{ marginBottom: '10px' }}>
      <input
        type="text"
        placeholder="Поиск по событиям..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ padding: '5px', width: '200px' }}
      />
    </div>
  );
}