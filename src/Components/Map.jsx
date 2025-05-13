// Map.js
import { useEffect, useRef } from 'react';

const Map = ({ coordinates, name }) => {
  const mapRef = useRef(null);
  
  useEffect(() => {
    if (window.google && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: 15,
        styles: [
          {
            "featureType": "poi",
            "stylers": [{ "visibility": "off" }]
          }
        ]
      });
      
      new window.google.maps.Marker({
        position: coordinates,
        map,
        title: name,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
      });
    } else {
      // Fallback for when Google Maps API isn't loaded
      const iframe = document.createElement('iframe');
      iframe.src = `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed`;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.frameBorder = '0';
      iframe.allowFullScreen = true;
      mapRef.current.appendChild(iframe);
    }
  }, [coordinates, name]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default Map;