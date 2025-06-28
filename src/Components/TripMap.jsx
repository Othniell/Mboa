import React, { useEffect, useState, useRef } from 'react';
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

// Fix default icons for Leaflet
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

// RoutingMachine with proper event listener cleanup and voice toggle
function RoutingMachine({ userPosition, destinations, enableVoice }) {
  const map = useMap();
  const lastVoicePosition = useRef(null);

  // Haversine formula to compute distance in meters
  function distance(lat1, lon1, lat2, lon2) {
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371e3; // meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  useEffect(() => {
    if (!userPosition || destinations.length === 0) return;

    if (enableVoice && lastVoicePosition.current) {
      const dist = distance(
        lastVoicePosition.current.lat,
        lastVoicePosition.current.lng,
        userPosition.lat,
        userPosition.lng
      );
      if (dist < 5) return; // prevent repeated speech if user hasn't moved enough
    }

    const waypoints = [
      L.latLng(userPosition.lat, userPosition.lng),
      ...destinations.map(p => L.latLng(p.latitude || p.lat, p.longitude || p.lng)),
    ];

    const control = L.Routing.control({
      waypoints,
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      createMarker: () => null,
      formatter: new L.Routing.Formatter({ language: 'en' }),
    }).addTo(map);

    const onRoutesFound = (e) => {
      if (!enableVoice) return;  // safeguard

      lastVoicePosition.current = userPosition;
      window.speechSynthesis.cancel();

      const instructions = e.routes[0].instructions || [];
      instructions.forEach((step, index) => {
        setTimeout(() => {
          if (enableVoice) {
            const utter = new SpeechSynthesisUtterance(step.text);
            utter.lang = 'en-US';
            window.speechSynthesis.speak(utter);
          }
        }, index * 4000);
      });
    };

    if (enableVoice) {
      control.on('routesfound', onRoutesFound);
    } else {
      window.speechSynthesis.cancel();
    }

    return () => {
      if (enableVoice) {
        control.off('routesfound', onRoutesFound);
      }
      map.removeControl(control);
    };
  }, [userPosition, destinations, enableVoice]);

  return null;
}

export default function TripMap({ places }) {
  const [userPosition, setUserPosition] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [remainingDestinations, setRemainingDestinations] = useState([]);

  // Cancel speech immediately when voice is toggled off
  useEffect(() => {
    if (!voiceOn) {
      window.speechSynthesis.cancel();
    }
  }, [voiceOn]);

  // Initialize remaining destinations when route shown
  useEffect(() => {
    if (showRoute) {
      const validPlaces = places.filter(p => p.latitude || p.lat);
      setRemainingDestinations(validPlaces);
    } else {
      setRemainingDestinations([]);
    }
  }, [places, showRoute]);

  // Watch user location continuously
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error('Geolocation error', err),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Remove destination once user is close enough (10m)
  useEffect(() => {
    if (!userPosition || remainingDestinations.length === 0) return;

    const toRad = x => (x * Math.PI) / 180;
    const R = 6371e3; // meters

    function distance(lat1, lon1, lat2, lon2) {
      const φ1 = toRad(lat1);
      const φ2 = toRad(lat2);
      const Δφ = toRad(lat2 - lat1);
      const Δλ = toRad(lon2 - lon1);

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    }

    const nextDest = remainingDestinations[0];
    const distToNext = distance(
      userPosition.lat,
      userPosition.lng,
      nextDest.latitude || nextDest.lat,
      nextDest.longitude || nextDest.lng
    );

    const ARRIVAL_THRESHOLD = 10; // meters

    if (distToNext < ARRIVAL_THRESHOLD) {
      setRemainingDestinations((dests) => dests.slice(1));
    }
  }, [userPosition, remainingDestinations]);

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
          attribution="&copy; OpenStreetMap contributors"
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

        {showRoute && userPosition && remainingDestinations.length > 0 && (
          <RoutingMachine userPosition={userPosition} destinations={remainingDestinations} enableVoice={voiceOn} />
        )}
      </MapContainer>
    </div>
  );
}
