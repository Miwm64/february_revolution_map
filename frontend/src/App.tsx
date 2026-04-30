// src/App.tsx
import React, { useState } from 'react';
import Map from './components/map/Map';
import EventList from './components/events/EventList';
import Description from './components/description/Description';
import './App.css';
import { Button } from './components/ui/button.tsx';
import './App.css'


const App: React.FC = () => {
  const [isEventsOpen, setEventsOpen] = useState(true) // управление видимостью окна с событиями
  const [showOpenEventsButton, setShowOpenButton] = useState(false) // управление появлением стрелочки

  // при закрытии окна показываем стрелку
  const handleCloseEvents = () => {
    setEventsOpen(false)
    setShowOpenButton(true)
  }

  // при открытии окна скрываем стрелку
  const handleOpenEvents = () => {
    setEventsOpen(true)
    setShowOpenButton(false)
  }

  const [isDescriptionOpen, setDescriptionOpen] = useState(true);
  const [showOpenDescriptionButton, setShowDescriptionButton] = useState(false);

  const handleCloseDescription = () => {
    setDescriptionOpen(false);
    setShowDescriptionButton(true);
  };

  const handleOpenDescription = () => {
    setDescriptionOpen(true);
    setShowDescriptionButton(false);
  };

  return (
    <div className="app" style={{fontFamily: 'Arial', position: 'relative' }}>
      
      {/* Стрелочка появляется только после закрытия */}
      {showOpenEventsButton && (
        <button
          onClick={handleOpenEvents}
          style={{
            position: 'fixed',
            top: '50%',
            left: '10px',
            transform: 'translateY(-50%)',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}
          aria-label="Открыть события"
        >
          &#8594; {/* стрелка вправо */}
        </button>
      )}
      {showOpenDescriptionButton && (
        <button
          onClick={handleOpenDescription}
          style={{
            position: 'fixed',
            top: '50%',
            right: '10px',
            transform: 'translateY(-50%)',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '20px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 1000
          }}
          aria-label="Открыть описание"
        >
          &#8592;
        </button>
      )}


      
      {/* Основное содержимое */}
      <div className="content" style={{ display: 'flex', gap: '20px' }}>
        {/* Окно с событиями, управляемое состоянием */}
        {isEventsOpen && (
          <div style={{ flex: '0 1 auto', position: 'relative' }}>
            {/* Крестик для закрытия */}
            <button
              onClick={handleCloseEvents}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}
              aria-label="Закрыть"
            >
              ✖
            </button>
            <EventList />
          </div>
        )}

        {/* Карта */}
        <div style={{ flex: '1 1 auto' }}>
          <Map />
        </div>

        {/* Описание */}
        {isDescriptionOpen && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleCloseDescription}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}
              aria-label="Закрыть описание"
            >
              ✖
            </button>
            <Description />
          </div>
        )}
      </div>
    </div>
  )
}

export default App

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


/*const App: React.FC = () => {
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

        <div style={{ flex: '0 1 auto' }}>
          <Description />
        </div>

      </div>
    </div>
  );
};

export default App;*/


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