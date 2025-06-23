// src/components/NavigationMap.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';

function RoutingWithVoice({ userPosition, destination }) {
  const map = useMap();

  useEffect(() => {
    if (!userPosition || !destination) return;

    const control = L.Routing.control({
      waypoints: [
        L.latLng(userPosition.lat, userPosition.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      createMarker: () => null,
    }).addTo(map);

    control.on('routesfound', function (e) {
      const instructions = e.routes[0].instructions;
      for (let i = 0; i < instructions.length; i++) {
        const delay = i * 4000;
        setTimeout(() => {
          const msg = new SpeechSynthesisUtterance(instructions[i].text);
          window.speechSynthesis.speak(msg);
        }, delay);
      }
    });

    return () => {
      map.removeControl(control);
      window.speechSynthesis.cancel();
    };
  }, [userPosition, destination]);

  return null;
}

export default function NavigationMap({ destination }) {
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.error("Location access denied:", err);
      }
    );
  }, []);

  return (
    <div style={{ height: '400px', marginTop: '2rem' }}>
      <h3 style={{ textAlign: 'center' }}>🗺️ Navigation with Voice Guidance</h3>
      <MapContainer center={userPosition || [4.05, 9.7]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userPosition && <Marker position={[userPosition.lat, userPosition.lng]} />}
        {destination && <Marker position={[destination.lat, destination.lng]} />}
        {userPosition && destination && <RoutingWithVoice userPosition={userPosition} destination={destination} />}
      </MapContainer>
    </div>
  );
}
