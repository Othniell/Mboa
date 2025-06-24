import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./Map.css";

import activityIconImg from "../assets/images/activity.png";

const activityIcon = L.icon({
  iconUrl: activityIconImg,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -30],
});

function Routing({ userPosition, destination }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map || !userPosition || !destination) return;

    // Remove existing routing control if any
    if (routingRef.current) {
      map.removeControl(routingRef.current);
    }

    // Create new route
    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userPosition.lat, userPosition.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: "#007bff", weight: 5 }],
      },
    }).addTo(map);

    return () => {
      if (routingRef.current) {
        map.removeControl(routingRef.current);
      }
    };
  }, [map, userPosition, destination]);

  return null;
}

export default function ActivityMap() {
  const [activities, setActivities] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => {
        alert("Geolocation permission denied. Using default location.");
        console.error("Geolocation error:", err);
        setUserPosition({ lat: 4.05, lng: 9.7 });
      },
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/activities")
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch((err) => console.error(err));
  }, []);

  function onUserMarkerDragEnd(event) {
    const marker = event.target;
    const position = marker.getLatLng();
    setUserPosition({ lat: position.lat, lng: position.lng });
    setSelectedDestination(null); // Clear previous route
  }

  function handleShowItinerary(activity) {
    const confirmItinerary = window.confirm(
      `Do you want to see the route to "${activity.name}"?`
    );
    if (confirmItinerary) {
      setSelectedDestination({
        lat: activity.latitude,
        lng: activity.longitude,
      });
    }
  }

  const center = userPosition ? [userPosition.lat, userPosition.lng] : [4.05, 9.7];

  return (
    <section className="map-section">
      <h2>Explore Activities in Douala</h2>
      <MapContainer
        center={center}
        zoom={13}
        className="leaflet-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {userPosition && (
          <Marker
            position={[userPosition.lat, userPosition.lng]}
            draggable={true}
            eventHandlers={{ dragend: onUserMarkerDragEnd }}
          >
            <Popup>Drag to update your location</Popup>
          </Marker>
        )}

        {activities.map((activity) => (
          <Marker
            key={activity._id}
            position={[activity.latitude, activity.longitude]}
            icon={activityIcon}
          >
            <Popup>
              <strong>{activity.name}</strong>
              <p>{activity.description}</p>
              <small>{activity.location}</small>
              <br />
              <button
                className="btn-itinerary"
                onClick={() => handleShowItinerary(activity)}
              >
                Show Itinerary
              </button>
            </Popup>
          </Marker>
        ))}

        {userPosition && selectedDestination && (
          <Routing
            userPosition={userPosition}
            destination={selectedDestination}
          />
        )}
      </MapContainer>
    </section>
  );
}
