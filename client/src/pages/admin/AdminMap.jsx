import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import socketInstance from '../../services/socketService';
import 'leaflet/dist/leaflet.css';

const bikeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3177/3177361.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const AdminDriverMap = () => {
  const [driverLocations, setDriverLocations] = useState({}); // { driverId: { lat, lng, name } }

  useEffect(() => {
    const socket = socketInstance.getSocket('admin');
    if (!socket) return;

    // Join the admin map room
    socket.emit('join-admin-map');

    // Receive driver location updates
    socket.on('driver-location', (data) => {
      console.log('Admin Map - driver-location:', data);
      if (data?.riderId && data?.location) {
        setDriverLocations((prev) => ({
          ...prev,
          [data.riderId]: {
            lat: data.location.latitude,
            lng: data.location.longitude,
            name: data.username || `Driver ${data.riderId}`,
          },
        }));
      }
    });

    // Remove driver from map when disconnected
    socket.on('driver-disconnected', (driverId) => {
      setDriverLocations((prev) => {
        const copy = { ...prev };
        delete copy[driverId];
        return copy;
      });
    });

    return () => {
      socket.off('driver-location');
      socket.off('driver-disconnected');
    };
  }, []);

  // Default center is Hyderabad
  const center = Object.values(driverLocations)[0] || { lat: 17.385, lng: 78.486 };

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {Object.entries(driverLocations).map(([driverId, loc]) => (
          <Marker key={driverId} position={[loc.lat, loc.lng]} icon={bikeIcon}>
            <Tooltip>{loc.name}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default AdminDriverMap;
