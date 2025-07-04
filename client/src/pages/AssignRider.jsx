import { useEffect, useState, useContext } from "react";
import axios from "axios";
import MapContext from "../context/AppContext";

/**
 * Props:
 * - booking: { _id, locations: [{lat, lng}, ...] }
 * - onAssigned: callback(driver|null) invoked after assignment
 */
const AssignDriver = ({ booking, onAssigned }) => {
  const { apiUrl } = useContext(MapContext);  // Base API URL [1]
  const [assigning, setAssigning] = useState(false);

  // Haversine formula to compute distance in kilometers [2]
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; 
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  const assignNearest = async () => {
      setAssigning(true);
      const pickup = booking.locations[0]; 
      console.log("boking",booking); // Use first location as pickup [3]
      try {
        // Fetch all drivers marked "free" from backend  
        const response = await axios.get(`${apiUrl}/active-riders`);  
        const freeDrivers = response.data.filter(d => d.status === "free");

        if (freeDrivers.length === 0) {
          onAssigned(null);
          return;
        }

        // Compute distance for each driver and sort ascending  
        console.log("free:",freeDrivers)
        const nearest = freeDrivers
          .map(d => ({
            ...d,
            distance: calculateDistance(
              pickup.lat, pickup.lng,
              d?.location?.lat, d?.location?.lng
            )
          }))
          .sort((a, b) => a.distance - b.distance)[0];

        // Assign the nearest driver via POST request  
        await axios.post(
          `${apiUrl}/bookings/assignDriver/${booking._id}`,
          { driverId: nearest._id }
        );

        onAssigned(nearest);  // Notify parent of successful assignment  
      } catch (err) {
        console.error("Assignment error:", err);
        onAssigned(null);
      } finally {
        setAssigning(false);
      }
    };

  useEffect(() => {
    if (!booking || assigning) return;
    assignNearest();
  }, [booking, apiUrl, assigning, onAssigned]);

  return null;  // No UI rendered  
};

export default AssignDriver;
