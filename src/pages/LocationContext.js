import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [locationName, setLocationName] = useState("Detecting location...");

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      try {
        const res = await axios.get(
          "https://nominatim.openstreetmap.org/reverse",
          { params: { lat, lon, format: "json" } }
        );

        const addr = res.data.address || {};
        const place =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.state ||
          "Current Location";

        setLocationName(place);
      } catch {
        setLocationName("Current Location");
      }
    });
  }, []);

  return (
    <LocationContext.Provider value={{ locationName }}>
      {children}
    </LocationContext.Provider>
  );
};