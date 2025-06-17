import { React, useContext, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  GeoJSON,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import MapContext from "../../context/AppContext";
import socketInstance from "../../services/socketService";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TrackLocationMap = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const { apiUrl } = useContext(MapContext);

  const openRouteApiKey = "5b3ce3597851110001cf6248a9da4e75a06b4a5da9c7eb0550783a80"; 

  const getRideDetails = async () => {
    try {
      const response = await axios.get(`${apiUrl}/bookings/ride-details/${id}`);
      const customer = response.data.booking.pickupLocation.coordinates;
      const driver = response.data.riderDetails.location;

      const formattedCustomer = {
        lat: customer.lat,
        lng: customer.lng,
      };
      const formattedDriver = {
        lat: driver.lat,
        lng: driver.lng,
      };

      setCustomerLocation(formattedCustomer);
      setDriverLocation(formattedDriver);

      // Fetch directions
      fetchRoute(formattedDriver, formattedCustomer);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoute = async (start, end) => {
    try {
      const response = await axios.post(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          coordinates: [
            [start.lng, start.lat],
            [end.lng, end.lat],
          ],
        },
        {
          headers: {
            Authorization: openRouteApiKey,
            "Content-Type": "application/json",
          },
        }
      );

      setRouteGeoJSON(response.data);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  useEffect(() => {
    getRideDetails();
    const socket = socketInstance.getSocket("user");
    socket?.on("driver-location", (data) => {
      const { location,riderId,rideId,userId } = data;
      console.log("Received location update:",location);
      setDriverLocation(location)
     
    });
    return () => {
      socket?.off("driver-location");
    };
  }, []);

  const center =
    driverLocation && customerLocation
      ? {
          lat: (Number(driverLocation.lat) + Number(customerLocation.lat)) / 2,
          lng: (Number(driverLocation.lng) + Number(customerLocation.lng)) / 2,
        }
      : { lat: 17.2223, lng: 78.9197 };

  return (
    <div className="h-[85vh] w-full">
      {loading ? (
        <div className="flex justify-center items-center h-full w-full">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      ) : (
        <MapContainer center={center} zoom={13} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[driverLocation.lat, driverLocation.lng]}>
            <Popup>Driver Location</Popup>
          </Marker>

          <Marker position={[customerLocation.lat, customerLocation.lng]}>
            <Popup>Customer Location</Popup>
          </Marker>

          {routeGeoJSON && (
            <GeoJSON data={routeGeoJSON} style={{ color: "blue", weight: 4 }} />
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default TrackLocationMap;
