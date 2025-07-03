import React, { useEffect, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline
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

function RoutingMachine({ userPosition, destinations, enableVoice }) {
  const map = useMap();
  const routingControlRef = useRef(null);
  const routeLineRef = useRef(null);
  const lastPositionRef = useRef(null);
  const lastInstructionRef = useRef(null);
  const initialRouteAnnounced = useRef(false);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const speak = (text) => {
    if (!enableVoice) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!userPosition || destinations.length === 0) return;

    if (lastPositionRef.current) {
      const distMoved = calculateDistance(
        lastPositionRef.current.lat,
        lastPositionRef.current.lng,
        userPosition.lat,
        userPosition.lng
      );
      if (distMoved < 5) return;
    }
    lastPositionRef.current = userPosition;

    const waypoints = [
      L.latLng(userPosition.lat, userPosition.lng),
      ...destinations.map(p => L.latLng(p.latitude || p.lat, p.longitude || p.lng)),
    ];

    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    const control = L.Routing.control({
      waypoints,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      routeWhileDragging: true,
      show: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
      formatter: new L.Routing.Formatter({ language: 'en' }),
      lineOptions: {
        styles: [{
          color: '#1e3c72',
          opacity: 0.8,
          weight: 5
        }],
        extendToWaypoints: true,
        missingRouteTolerance: 1
      }
    }).addTo(map);

    routingControlRef.current = control;

    const handleRoutesFound = (e) => {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        routeLineRef.current = routes[0].coordinates;

        if (enableVoice && !initialRouteAnnounced.current) {
          const summary = routes[0].summary;
          const totalDistance = (summary.totalDistance / 1000).toFixed(1);
          const totalTime = Math.round(summary.totalTime / 60);
          speak(`Route calculated. Total distance: ${totalDistance} kilometers. Estimated time: ${totalTime} minutes.`);
          initialRouteAnnounced.current = true;
        }

        const nextInstruction = routes[0].instructions.find(instruction => {
          const distanceToNext = calculateDistance(
            userPosition.lat,
            userPosition.lng,
            instruction.intersections[0].location[1],
            instruction.intersections[0].location[0]
          );
          return distanceToNext < 100;
        });

        if (enableVoice && nextInstruction && nextInstruction.text !== lastInstructionRef.current) {
          speak(nextInstruction.text);
          lastInstructionRef.current = nextInstruction.text;
        }
      }
    };

    control.on('routesfound', handleRoutesFound);

    return () => {
      control.off('routesfound', handleRoutesFound);
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
      window.speechSynthesis.cancel();
      initialRouteAnnounced.current = false;
    };
  }, [userPosition, destinations, enableVoice]);

  return routeLineRef.current ? (
    <Polyline 
      positions={routeLineRef.current.map(coord => [coord.lat, coord.lng])}
      color="#1e3c72"
      weight={5}
      opacity={0.8}
    />
  ) : null;
}

export default function TripMapComponent({ places }) {
  const [userPosition, setUserPosition] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [remainingDestinations, setRemainingDestinations] = useState([]);
  const positionWatchRef = useRef(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      positionWatchRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setUserPosition({ lat: 4.0511, lng: 9.7679 });
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    } else {
      setUserPosition({ lat: 4.0511, lng: 9.7679 });
    }

    return () => {
      if (positionWatchRef.current) {
        navigator.geolocation.clearWatch(positionWatchRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const validPlaces = places.filter(p => p.latitude || p.lat);
    setRemainingDestinations(validPlaces);
  }, [places]);

  useEffect(() => {
    if (!userPosition || remainingDestinations.length === 0) return;

    const checkArrival = () => {
      const nextDestination = remainingDestinations[0];
      const destLat = nextDestination.latitude || nextDestination.lat;
      const destLng = nextDestination.longitude || nextDestination.lng;

      const distance = calculateDistance(
        userPosition.lat,
        userPosition.lng,
        destLat,
        destLng
      );

      if (distance < 20) {
        setRemainingDestinations(prev => prev.slice(1));

        if (voiceOn) {
          const utterance = new SpeechSynthesisUtterance(
            `You have arrived at ${nextDestination.name}`
          );
          window.speechSynthesis.speak(utterance);
        }
      }
    };

    const arrivalCheckInterval = setInterval(checkArrival, 3000);
    return () => clearInterval(arrivalCheckInterval);
  }, [userPosition, remainingDestinations, voiceOn]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const getCategory = (place) => {
    if (place.rooms) return 'hotel';
    if (place.category) return 'activity';
    return 'restaurant';
  };

  const validPlaces = places.filter(p => p.latitude || p.lat);
  const defaultCenter = userPosition || [4.05, 9.7];

  useEffect(() => {
    if (voiceOn && showRoute && userPosition && remainingDestinations.length > 0) {
      const utterance = new SpeechSynthesisUtterance(
        "Voice guidance activated. Follow the route directions."
      );
      window.speechSynthesis.speak(utterance);
    }
  }, [voiceOn, showRoute, userPosition, remainingDestinations]);

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
              onChange={(e) => {
                setVoiceOn(e.target.checked);
                if (!e.target.checked) {
                  window.speechSynthesis.cancel();
                }
              }}
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
          <RoutingMachine 
            userPosition={userPosition} 
            destinations={remainingDestinations} 
            enableVoice={voiceOn} 
          />
        )}
      </MapContainer>
    </div>
  );
}
