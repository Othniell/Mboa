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

import restaurantIconImg from "../assets/images/restaurant.png";

const restaurantIcon = L.icon({
  iconUrl: restaurantIconImg,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -30],
});

function Routing({ userPosition, destination }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map || !userPosition || !destination) return;

    if (routingRef.current) {
      map.removeControl(routingRef.current);
    }

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

export default function RestaurantMap() {
  const [restaurants, setRestaurants] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/restaurants")
      .then((res) => res.json())
      .then((data) => setRestaurants(data))
      .catch((err) => console.error(err));

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => {
        console.error("Geolocation error:", err);
        setUserPosition({ lat: 4.05, lng: 9.7 });
      },
      { enableHighAccuracy: true }
    );
  }, []);

  function onUserMarkerDragEnd(event) {
    const marker = event.target;
    const position = marker.getLatLng();
    setUserPosition({ lat: position.lat, lng: position.lng });
  }

  const center = userPosition ? [userPosition.lat, userPosition.lng] : [4.05, 9.7];

  return (
    <section className="map-section">
      <h2>Explore Restaurants in Douala</h2>
      <MapContainer center={center} zoom={13} className="leaflet-map">
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

        {restaurants.map((restaurant) => {
          if (
            typeof restaurant.latitude !== "number" ||
            typeof restaurant.longitude !== "number"
          ) {
            console.warn("Skipping invalid coords for:", restaurant.name);
            return null;
          }

          return (
            <Marker
              key={restaurant._id}
              position={[restaurant.latitude, restaurant.longitude]}
              icon={restaurantIcon}
            >
              <Popup>
                <strong>{restaurant.name}</strong>
                <p>{restaurant.description}</p>
                <small>{restaurant.location}</small>
                <br />
                <button
                  className="btn-itinerary"
                  onClick={() =>
                    setSelectedDestination({
                      lat: restaurant.latitude,
                      lng: restaurant.longitude,
                    })
                  }
                >
                  Show Itinerary
                </button>
              </Popup>
            </Marker>
          );
        })}

        {userPosition && selectedDestination && (
          <Routing userPosition={userPosition} destination={selectedDestination} />
        )}
      </MapContainer>
    </section>
  );
}
