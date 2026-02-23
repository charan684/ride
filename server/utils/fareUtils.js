/**
 * Haversine formula – returns distance in km between two lat/lng points.
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(parseFloat(lat2) - parseFloat(lat1));
    const dLng = toRad(parseFloat(lng2) - parseFloat(lng1));
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(parseFloat(lat1))) *
        Math.cos(toRad(parseFloat(lat2))) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // km
};

/**
 * Calculate ride fare from an ordered array of location objects { lat, lng }.
 * Fare = BASE_FARE + (total distance km × RATE_PER_KM)
 */
export const calculateFare = (locations = []) => {
    const BASE_FARE = 30;   // ₹ flat base
    const RATE_PER_KM = 12; // ₹ per km

    if (!locations || locations.length < 2) return BASE_FARE;

    let totalKm = 0;
    for (let i = 0; i < locations.length - 1; i++) {
        const from = locations[i];
        const to = locations[i + 1];
        if (from?.lat && from?.lng && to?.lat && to?.lng) {
            totalKm += calculateDistance(from.lat, from.lng, to.lat, to.lng);
        }
    }

    return parseFloat((BASE_FARE + totalKm * RATE_PER_KM).toFixed(2));
};
