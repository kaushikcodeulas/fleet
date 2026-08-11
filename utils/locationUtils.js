import * as Location from 'expo-location';

const geocodeAddressCache = {};

export async function geocodeAddress(addressString) {
  if (!addressString) return null;
  if (geocodeAddressCache[addressString]) {
    return geocodeAddressCache[addressString];
  }
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=AIzaSyBGIm2P5Vav9zkOABLCe5QIEjkhyoFpD7g`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const loc = data.results[0].geometry.location;
      const res = { latitude: loc.lat, longitude: loc.lng };
      geocodeAddressCache[addressString] = res;
      return res;
    }
  } catch (e) {
    console.log('Geocoding error:', e);
  }
  return null;
}

export function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const R = 6371000; // Radius of Earth in meters
  const radLat1 = (Number(lat1) * Math.PI) / 180;
  const radLat2 = (Number(lat2) * Math.PI) / 180;
  const deltaLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const deltaLon = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(radLat1) * Math.cos(radLat2) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

export async function getCurrentGPSPosition() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission is required to verify your proximity for this trip.');
  }
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude
  };
}
