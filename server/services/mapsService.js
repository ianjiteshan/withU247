import axios from 'axios';

/**
 * Searches for nearby hospitals using Nominatim (reverse geocode for city)
 * then Photon for actual hospital search with real location context.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Array>} List of hospitals
 */
export async function searchNearbyHospitals(lat, lng) {
  try {
    // Step 1: Reverse geocode to get the city name from coordinates
    const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`;
    console.log(`➡️ Reverse geocoding: ${reverseUrl}`);
    
    const reverseRes = await axios.get(reverseUrl, {
      headers: { "User-Agent": "WithU247-Assistant" },
      timeout: 5000
    });
    
    const city = reverseRes.data?.address?.city 
      || reverseRes.data?.address?.town 
      || reverseRes.data?.address?.state_district
      || reverseRes.data?.address?.state
      || "Delhi"; // fallback
    
    console.log(`📍 Detected city: ${city}`);

    // Step 2: Search for hospitals in that city using Photon
    const query = `hospital near ${city}`;
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lng}&limit=10`;
    console.log(`➡️ Fetching hospitals from Photon: ${url}`);

    const res = await axios.get(url, { timeout: 8000 });
    const data = res.data;

    if (!data.features || data.features.length === 0) {
      console.warn("⚠️ No results from Photon, trying Nominatim search...");
      return await searchViaNominatim(lat, lng);
    }

    // Filter: only keep results that are actually near the user (within ~50km)
    const results = data.features
      .map(place => ({
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
        distance: getDistanceKm(lat, lng, place.geometry.coordinates[1], place.geometry.coordinates[0])
      }))
      .filter(h => h.distance < 50) // Only keep hospitals within 50km
      .sort((a, b) => a.distance - b.distance);

    if (results.length === 0) {
      console.warn("⚠️ No nearby results after filtering, falling back to Nominatim...");
      return await searchViaNominatim(lat, lng);
    }

    console.log(`✅ Found ${results.length} nearby hospitals (filtered)`);
    return results;
  } catch (err) {
    console.error("❌ Hospital search error:", err.message);
    return await searchViaNominatim(lat, lng);
  }
}

/**
 * Fallback: Search hospitals using Nominatim directly
 */
async function searchViaNominatim(lat, lng) {
  try {
    const bbox = `${lng - 0.15},${lat - 0.15},${lng + 0.15},${lat + 0.15}`;
    const url = `https://nominatim.openstreetmap.org/search?q=hospital&format=json&limit=10&viewbox=${bbox}&bounded=1`;
    console.log(`➡️ Fallback Nominatim search: ${url}`);
    
    const res = await axios.get(url, {
      headers: { "User-Agent": "WithU247-Assistant" },
      timeout: 5000
    });

    return res.data.map(place => ({
      id: place.osm_id || Math.random().toString(36).substr(2, 9),
      name: place.display_name.split(",")[0],
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      address: place.display_name,
      distance: getDistanceKm(lat, lng, parseFloat(place.lat), parseFloat(place.lon))
    }));
  } catch (err) {
    console.error("❌ Nominatim fallback error:", err.message);
    return [];
  }
}

/**
 * Calculate distance between two lat/lng points in km (Haversine formula)
 */
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Geocodes an address to coordinates using Nominatim.
 * @param {string} query - The address or place name
 * @returns {Promise<Object|null>} Coordinates {lat, lng} or null
 */
export async function geocodeAddress(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await axios.get(url, {
      headers: { "User-Agent": "WithU247-Assistant" },
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
