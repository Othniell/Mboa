import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import userIconUrl from '../assets/images/epingler.png';
import hotelIconUrl from '../assets/icons/hotel.png';
import restaurantIconUrl from '../assets/icons/restaurant.png';
import activityIconUrl from '../assets/icons/activity.png';

// Fix default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom category icons
const iconMap = {
  hotel: L.icon({ iconUrl: hotelIconUrl, iconSize: [32, 32], iconAnchor: [16, 32] }),
  restaurant: L.icon({ iconUrl: restaurantIconUrl, iconSize: [32, 32], iconAnchor: [16, 32] }),
  activity: L.icon({ iconUrl: activityIconUrl, iconSize: [32, 32], iconAnchor: [16, 32] }),
};

const userIcon = L.icon({
  iconUrl: userIconUrl,
  iconSize: [30, 41],
  iconAnchor: [15, 41],
  shadowUrl: markerShadow,
});

// Routing with voice toggle
function RoutingMachine({ userPosition, destinations, enableVoice }) {
  const map = useMap();

  useEffect(() => {
    if (!userPosition || destinations.length === 0) return;

    const waypoints = [
      L.latLng(userPosition.lat, userPosition.lng),
      ...destinations.map(p => L.latLng(p.latitude || p.lat, p.longitude || p.lng)),
    ];

    const control = L.Routing.control({
      waypoints,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      createMarker: () => null,
      formatter: new L.Routing.Formatter({ language: 'en' })
    }).addTo(map);

    // Optional voice directions via browser speech synthesis
    if (enableVoice) {
      control.on('routesfound', (e) => {
        const instructions = e.routes[0].instructions || [];
        instructions.forEach((step, index) => {
          const delay = index * 4000;
          setTimeout(() => {
            const utter = new SpeechSynthesisUtterance(step.text);
            utter.lang = 'en-US';
            window.speechSynthesis.speak(utter);
          }, delay);
        });
      });
    }

    return () => map.removeControl(control);
  }, [userPosition, destinations, enableVoice]);

  return null;
}

export default function TripMap({ places }) {
  const [userPosition, setUserPosition] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error('Geolocation error', err)
    );
  }, []);

  const validPlaces = places.filter(p => p.latitude || p.lat);
  const defaultCenter = userPosition || [4.05, 9.7];

  const getCategory = (place) => {
    if (place.rooms) return 'hotel';
    if (place.category) return 'activity';
    return 'restaurant';
  };

  return (
    <div className="trip-map-container">
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button className="view-btn" onClick={() => setShowRoute(!showRoute)}>
          {showRoute ? 'Hide Itinerary' : 'Show Itinerary'}
        </button>
        {showRoute && (
          <label style={{ marginLeft: '1rem' }}>
            <input
              type="checkbox"
              checked={voiceOn}
              onChange={(e) => setVoiceOn(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Enable Voice Navigation
          </label>
        )}
      </div>

      <MapContainer center={defaultCenter} zoom={13} style={{ height: '450px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {userPosition && (
          <Marker
            position={[userPosition.lat, userPosition.lng]}
            icon={userIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                setUserPosition({ lat, lng });
              }
            }}
          >
            <Popup>📍 Your Location</Popup>
          </Marker>
        )}

        {validPlaces.map((place, idx) => {
          const lat = parseFloat(place.latitude || place.lat);
          const lng = parseFloat(place.longitude || place.lng);
          if (isNaN(lat) || isNaN(lng)) return null;

          const category = getCategory(place);
          const markerIcon = iconMap[category];

          return (
            <Marker key={place._id || idx} position={[lat, lng]} icon={markerIcon}>
              <Popup>
                <strong>{place.name}</strong><br />
                {place.priceCategory}
              </Popup>
            </Marker>
          );
        })}

        {showRoute && userPosition && validPlaces.length > 0 && (
          <RoutingMachine userPosition={userPosition} destinations={validPlaces} enableVoice={voiceOn} />
        )}
      </MapContainer>
    </div>
  );
}
