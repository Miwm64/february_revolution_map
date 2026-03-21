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
      <Map>
        <EventMarker position={[55.75, 37.62]} title="Площадь Искусств" />
        <EventMarker position={[59.93, 30.32]} title="Санкт-Петербург" />
        <Route path={path} />
      </Map>
    </div>
  );
};

export default App;