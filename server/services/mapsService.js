import axios from 'axios';

/**
 * Searches for nearby hospitals using the Photon API.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Array>} List of hospitals
 */
export async function searchNearbyHospitals(lat, lng) {
  try {
    // Optimized for Delhi search
    const query = `hospital in Delhi`;
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${lat || 28.6139}&lon=${lng || 77.2090}&limit=10`;
    console.log(`➡️ Fetching hospitals from Photon: ${url}`);
    
    const res = await axios.get(url, { timeout: 5000 });
    const data = res.data;

    if (!data.features) return [];

    return data.features.map(place => ({
      id: place.properties.osm_id || Math.random().toString(36).substr(2, 9),
      name: place.properties.name || "Hospital",
      lat: place.geometry.coordinates[1],
      lng: place.geometry.coordinates[0],
      address: [
        place.properties.street,
        place.properties.city,
        place.properties.state,
        place.properties.postcode
      ].filter(Boolean).join(", ") || "Address not available",
      rating: "N/A" // Photon doesn't provide ratings like Google
    }));
  } catch (err) {
    console.error("❌ Photon API error:", err.message);
    return [];
  }
}

/**
 * Geocodes an address to coordinates using Nominatim.
 * @param {string} query - The address or place name
 * @returns {Promise<Object|null>} Coordinates {lat, lng} or null
 */
export async function geocodeAddress(query) {
  try {
    // Delhi viewbox: 76.84, 28.41, 77.35, 28.88
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&viewbox=76.84,28.88,77.35,28.41&bounded=0`;
    const res = await axios.get(url, {
      headers: { "User-Agent": "WithU247-Assistant" }, // Nominatim requires a user-agent
      timeout: 5000
    });
    
    if (res.data && res.data.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lng: parseFloat(res.data[0].lon)
      };
    }
    return null;
  } catch (err) {
    console.error("❌ Nominatim geocoding error:", err.message);
    return null;
  }
}
