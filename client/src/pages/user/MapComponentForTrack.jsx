import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import { useEffect } from "react";
import {Bike, Navigation2, Navigation2Icon} from 'lucide-react'
// Optionally, you can use custom icons
const pickupIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});
const bikeIcon = new L.DivIcon({
  html: ReactDOMServer.renderToString(
    <Navigation2Icon color="#3b82f6" size={36} style={{ filter: "drop-shadow(0 1px 2px #0002)" }} />
  ),
  className: "", 
  iconSize: [36, 36],
  iconAnchor: [18, 36], // center bottom
  popupAnchor: [0, -36],
});
const riderIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Helper to fit map to markers
function FitBounds({ pickup, rider }) {
  const map = useMap();
  useEffect(() => {
    if (pickup && rider) {
      const bounds = L.latLngBounds([pickup, rider]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup) {
      map.setView(pickup, 15);
    }
  }, [pickup, rider, map]);
  return null;
}

function MapComponent({ pickupLocation, riderLocation }) {
  // Defensive: fallback to Hyderabad if locations are missing
  const defaultCenter = [17.385044, 78.486671];
    console.log(pickupLocation);
    console.log(riderLocation)
  const pickup =
    pickupLocation && pickupLocation.coordinates
      ? [
          pickupLocation.coordinates.lat || pickupLocation.coordinates[1],
          pickupLocation.coordinates.lng || pickupLocation.coordinates[0],
        ]
      : null;

  const rider =
    riderLocation && riderLocation.lat && riderLocation.lng
      ? [riderLocation.lat, riderLocation.lng]
      : null;

  // Center on pickup or default
  const center = pickup || defaultCenter;

  return (
    <div style={{ height: "60vh", zIndex: "0", width: "50vw" }} className="ml-10 mt-10">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: "0" }}
        dragging={true}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pickup && (
          <Marker position={pickup} icon={pickupIcon}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}

        {rider && (
          <Marker position={rider} icon={bikeIcon}>
            <Popup>Rider Location</Popup>
          </Marker>
        )}

        <FitBounds pickup={pickup} rider={rider} />
      </MapContainer>
    </div>
  );
}

export default MapComponent;
