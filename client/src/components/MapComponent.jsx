import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useContext, useEffect, useState } from "react";
import MapContext from "../context/AppContext";

function MapComponent({
  latitude,
  longitude,
  handleDestinationClick,
  disableMap,
}) {
  const { setDestLocation, destLocation } = useContext(MapContext);
  const [destinationMarker, setDestinationMarker] = useState(null); // Store clicked location
  if(destLocation && destLocation.lat && destLocation.lng) {
    setDestinationMarker([destLocation.lat, destLocation.lng]);
  }
  // ✅ Sync marker with context without infinite render
  useEffect(() => {
    if (destLocation && destLocation.lat && destLocation.lng) {
      setDestinationMarker([destLocation.lat, destLocation.lng]);
    }
  }, [destLocation]);

  // Component to handle map clicks for setting destination
  function DestinationMarkerSetter() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setDestinationMarker([lat, lng]);
        setDestLocation({ lat, lng });
        console.log("Destination selected:", { lat, lng });

        if (!disableMap) {
          handleDestinationClick({ lat, lng });
        }
      },
    });

    return destinationMarker ? (
      <Marker position={destinationMarker}>
        <Popup>
          Destination pinned at:
          <br />
          {destinationMarker[0].toFixed(4)}, {destinationMarker[1].toFixed(4)}
        </Popup>
      </Marker>
    ) : null;
  }

  return (
    <div style={{ height: "400px", width: "100%", zIndex: "0" }}>
      <MapContainer
        center={[latitude, longitude]}
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

        {/* Marker for current location */}
        <Marker position={[latitude, longitude]}>
          <Popup>
            You are here. <br /> Hyderabad
          </Popup>
        </Marker>

        {/* Handle user clicks to pin destination */}
        <DestinationMarkerSetter />
      </MapContainer>
    </div>
  );
}

export default MapComponent;