// import {
//   MapContainer,
//   TileLayer,
//   Marker,
//   Popup,
//   useMapEvents,
// } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import { useContext, useEffect, useState } from "react";
// import MapContext from "../context/AppContext";

// function MapComponent({
//   latitude,
//   longitude,
//   handleDestinationClick,
//   disableMap,
// }) {
//   const { setDestLocation, destLocation } = useContext(MapContext);
//   const [destinationMarker, setDestinationMarker] = useState(null); // Store clicked location
  
//   // ✅ Sync marker with context without infinite render
//   useEffect(() => {
//     console.log(destLocation);
//     if (destLocation && destLocation.lat && destLocation.lng) {
//       console.log("Destination selected:", { lat: destLocation.lat, lng: destLocation.lng });
//       setDestinationMarker([destLocation.lat, destLocation.lng]);
//     }
//   }, [destLocation]);

//   // Component to handle map clicks for setting destination
//   function DestinationMarkerSetter() {
//     useMapEvents({
//       click(e) {
//         const { lat, lng } = e.latlng;
//         setDestinationMarker([lat, lng]);
//         setDestLocation({ lat, lng });
//         console.log("Destination selected:", { lat, lng });

//         if (!disableMap) {
//           handleDestinationClick({ lat, lng });
//         }
//       },
//     });

//     return destinationMarker ? (
//       <Marker position={destinationMarker}>
//         <Popup>
//           Destination pinned at:
//           <br />
//           {destinationMarker[0].toFixed(9)}, {destinationMarker[1].toFixed(9)}
//         </Popup>
//       </Marker>
//     ) : null;
//   }

//   return (
//     <div style={{ height: "400px", width: "100%", zIndex: "0" }}>
//       <MapContainer
//         center={[latitude, longitude]}
//         zoom={13}
//         style={{ height: "100%", width: "100%", zIndex: "0" }}
//         dragging={true}
//         scrollWheelZoom={true}
//         zoomControl={true}
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {/* Marker for current location */}
//         <Marker position={[latitude, longitude]}>
//           <Popup>
//             You are here. <br /> Hyderabad
//           </Popup>
//         </Marker>

//         {/* Handle user clicks to pin destination */}
//         <DestinationMarkerSetter />
//       </MapContainer>
//     </div>
//   );
// }

// export default MapComponent;
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ locations = [], handleLocationClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!mapInstanceRef.current) {
      // Create map instance
      const map = L.map(mapRef.current).setView([0, 0], 2);
      
      // Add tile layer (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      mapInstanceRef.current = map;
    }
    
    return () => {
      // Clean up map instance when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);
  
  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];
    
    // Add new markers
    if (locations.length > 0) {
      const bounds = L.latLngBounds();
      
      locations.forEach(location => {
        const marker = L.marker([location.lat, location.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(location.address || `Location at ${location.lat}, ${location.lng}`);
        
        marker.on('click', () => {
          if (handleLocationClick) {
            handleLocationClick(location);
          }
        });
        
        markersRef.current.push(marker);
        bounds.extend([location.lat, location.lng]);
      });
      
      // Fit map to show all markers
      if (locations.length > 1) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      } else if (locations.length === 1) {
        mapInstanceRef.current.setView([locations[0].lat, locations[0].lng], 13);
      }
    }
  }, [locations, handleLocationClick]);
  
  return (
    <div 
      ref={mapRef} 
      className="bg-white rounded-2xl shadow-lg border border-gray-100 h-[600px]"
    ></div>
  );
};

export default MapComponent;
