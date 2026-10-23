import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

const useUserLocation = () => {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`,
        { headers: { 'User-Agent': 'CivicReporterAndroidApp/1.0' } }
      );
      const data = await response.json();

      if (data && data.address) {
        const { suburb, village, city, town, county, state_district, state } = data.address;
        const distName = (county && !/division/i.test(county)) ? county : (state_district && !/division/i.test(state_district)) ? state_district : 'Kolhapur';
        const parts = [
          suburb || village,
          city || town,
          distName,
          state,
        ].filter(Boolean);

        const cleanParts = parts
          .map(p => p.replace(/,?\s*(?:in\s+)?[A-Za-z]+\s+division\b/gi, '').replace(/\bdivision\b/gi, '').trim())
          .filter(Boolean);

        return cleanParts.length > 0 ? cleanParts.join(', ') : (data.display_name || '').replace(/,?\s*(?:in\s+)?[A-Za-z]+\s+division\b/gi, '').replace(/\bdivision\b/gi, '');
      }
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch {
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const detectLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enable location access in settings.');
        // Fallback to IP geolocation
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          const ipData = await ipRes.json();
          if (ipData && ipData.latitude && ipData.longitude) {
            setLat(ipData.latitude);
            setLng(ipData.longitude);
            const addr = await reverseGeocode(ipData.latitude, ipData.longitude);
            setAddress(addr);
            return;
          }
        } catch (ipErr) {
          // IP fallback silent
        }
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      setLat(latitude);
      setLng(longitude);

      const addr = await reverseGeocode(latitude, longitude);
      setAddress(addr);
    } catch (err) {
      // Fallback to IP location
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        if (ipData && ipData.latitude && ipData.longitude) {
          setLat(ipData.latitude);
          setLng(ipData.longitude);
          const addr = await reverseGeocode(ipData.latitude, ipData.longitude);
          setAddress(addr);
          return;
        }
      } catch (ipErr) {
        // IP fallback silent
      }
      setError('Failed to detect device location');
    } finally {
      setLoading(false);
    }
  }, []);

  return { lat, lng, address, setAddress, loading, error, detectLocation };
};

export default useUserLocation;
