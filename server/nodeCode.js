import NodeGeocoder from 'node-geocoder';
const geocoder = NodeGeocoder({
   provider: 'openstreetmap',
  httpAdapter: 'https', // optional
  formatter: null,
  // Add this!
  userAgent: 'rideeasy-app-backend (contact: youremail@example.com)',
});
export const geo= async (req, res) => {
  const { lat, lon } = req.body;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    const response = await geocoder.reverse({ lat, lon });
    if (response.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({
      address: response[0].formattedAddress,
      raw: response[0],
    });
  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
}

export const getCoordinates = async (req,res) => {
    console.log(req.body)
    const {destination}=req.body;
  try {
    const res = await geocoder.geocode(destination);
    console.log(res[0].latitude, res[0].longitude);
    return res[0]; // contains latitude, longitude, and more
  } catch (err) {
    console.error('Geocoding failed:', err.message);
    return res.status(500).json({error:err.message})
  }
};

// getCoordinates("Bangalore, India");