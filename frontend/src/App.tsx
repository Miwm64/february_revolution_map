// src/App.tsx
import React from 'react';
import Map from './components/map/Map';
import EventList from './components/events/EventList';
import Description from './components/description/Description';
import './App.css';

/*const App: React.FC = () => {
  return (
    <div className="app">
      <div className="content">
        <div className="event-list-container">
          <EventList />
        </div>

        <div className="map-container">
          <Map />
        </div>

        <div className="description-container">
          <Description />
        </div>
      </div>
    </div>
  );
};

export default App;*/


const App: React.FC = () => {
//style={{ padding: '20px', fontFamily: 'Arial' }}
//<h1 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '25px' }}>Карта Февральской революции</h1>
  return (
    <div className="app">
      <div className="content">
        <div style={{ flex: '0 1 auto' }}>
          <EventList />
        </div>

        <div style={{ flex: '1 1 auto'}}>
          <Map>
          </Map>
        </div>

        <div style={{ flex: '0 0 auto' }}>
          <Description />
        </div>

      </div>
    </div>
  );
};

export default App;


/*
function App() {
  return (
    <div className="app" style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>События по датам</h1>
      <EventList />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <div className="App">
      <Map>
      </Map>
    </div>
  );
};

export default App;*/

/*
import EventMarker from './components/map/EventMarker';
import Route from './components/map/Route';
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
*/