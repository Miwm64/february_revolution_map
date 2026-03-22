// src/App.tsx
import React from 'react';
import Map from './components/Map';
import EventMarker from './components/EventMarker';
import Route from './components/Route';

const App: React.FC = () => {
  const path = [
    [55.75, 37.62], // Москва
    [59.93, 30.32], // Санкт-Петербург
  ];

  return (
    <div className="App">
      <Map
          imageUrl="http://www.etomesto.com/map/base/78/1914spb.png"
          bounds={[[0, 0], [1000, 1000]]} // coordinates in pixels or degrees
      >
        {/* optional markers or other components */}
      </Map>
    </div>
  );
};

export default App;