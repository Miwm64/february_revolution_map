//src/components/Map.tsx
import React, { useState } from 'react';
import './Map.css';


export default function Map() {
  //const width = 1000;
  //const height = Math.round(width * 0.6);

  return (
    <div className="map-container">
      <div style={{ width: '100%' }}>
        <iframe
          src="https://retromap.ru/1419186_z11_59.952259,30.332565&h=0"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            //width: `${width}px`,
            //height: `${height}px`,
            //border: 'none',
            //display: 'block',
          }}
          frameBorder="0"
          scrolling="no"
          title="Retromap"
        ></iframe>
      </div>
    </div>
  );
}

/* Рублика проблемсы:
iframe - внешняя карта и её нельзя измениять и добавлять метри

Рублика костыли:
Добавила метки поверх карты, на самом сайте, хз, чем страшно, вроде норм

*/