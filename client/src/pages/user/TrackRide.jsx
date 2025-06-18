import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from 'react-router-dom';
import socketInstance from '../../services/socketService';

// Custom Icons
const bikeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177361.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [13, 41]
});

const pinIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
  shadowAnchor: [13, 41]
});

// Fit map to route bounds
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function MapWithRider() {
  const location = useLocation();
  const { driverLocation, userLocation } = location.state || {};
  const [driverLocationCurrent, setDriverLocationCurrent] = useState(driverLocation);
  const [routeCoords, setRouteCoords] = useState([]);

  // Listen for real-time driver location updates
  useEffect(() => {
    const socket = socketInstance.getSocket("user");
    if (!socket) return;

    const onDriverLocation = (data) => {
      console.log("Got location update");
      if (data?.location) {
        setDriverLocationCurrent(data.location);
      }
    };

    socket.on("driver-location", onDriverLocation);

    // Clean up the event listener on unmount
    return () => socket.off("driver-location", onDriverLocation);
  }, []);

  // Fetch route from OSRM whenever driver or user location changes
  useEffect(() => {
    if (!driverLocationCurrent || !userLocation) return;
    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${driverLocationCurrent.lng},${driverLocationCurrent.lat};${userLocation.lng},${userLocation.lat}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        if (data?.routes?.[0]?.geometry?.coordinates) {
          const coords = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
          );
          setRouteCoords(coords);
        }
      } catch (err) {
        console.error("Failed to fetch route:", err);
      }
    };
    fetchRoute();
  }, [driverLocationCurrent, userLocation]);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={ [userLocation.lat, userLocation.lng] }
        zoom={14}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routeCoords.length > 0 && (
          <>
            <Polyline positions={routeCoords} color="blue" weight={5} />
            <FitBounds bounds={routeCoords} />
          </>
        )}

        {driverLocationCurrent && (
          <Marker
            position={[driverLocationCurrent.lat, driverLocationCurrent.lng]}
            icon={bikeIcon}
          />
        )}

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={pinIcon}
          />
        )}
      </MapContainer>
    </div>
  );
}
