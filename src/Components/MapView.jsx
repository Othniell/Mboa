import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "./Map.css";

import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Default icon fix
const defaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function Routing({ userPosition, destination }) {
  const map = useMap();

  useEffect(() => {
    if (!userPosition || !destination) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPosition.lat, userPosition.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [userPosition, destination]);

  return null;
}

export default function HotelMap() {
  const [hotels, setHotels] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        console.error("Failed to get user location", err);
      }
    );
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/hotels")
      .then((res) => res.json())
      .then((data) => setHotels(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="map-section">
      <h2>Explore Hotels in Douala</h2>
      <MapContainer center={[4.05, 9.7]} zoom={12} className="leaflet-map">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Show user location */}
        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {/* Show hotel markers only if coordinates are valid */}
        {hotels.map((hotel) => {
          if (
            hotel.latitude == null ||
            hotel.longitude == null ||
            isNaN(hotel.latitude) ||
            isNaN(hotel.longitude)
          ) {
            console.warn("Skipping hotel with invalid coordinates:", hotel.name);
            return null;
          }

          return (
            <Marker
              key={hotel._id}
              position={[hotel.latitude, hotel.longitude]}
              eventHandlers={{
                click: () =>
                  setSelectedDestination({
                    lat: hotel.latitude,
                    lng: hotel.longitude,
                  }),
              }}
            >
              <Popup>
                <div>
                  <strong>{hotel.name}</strong>
                  <p>{hotel.description}</p>
                  <small>Location: {hotel.location?.address || "N/A"}</small>
                  <br />
                  <button
                    onClick={() =>
                      setSelectedDestination({
                        lat: hotel.latitude,
                        lng: hotel.longitude,
                      })
                    }
                  >
                    Show Itinerary
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

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
