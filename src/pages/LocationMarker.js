import React, { useState, useEffect, useRef } from "react";
import { Marker, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const headers = {
  "User-Agent": "ProjectMahal/1.0 (admin@alifinfotech.com)",
};

function extractAddressFields(address = {}, display = "") {
  let street = address.road || address.neighbourhood || "";
  let zone = address.suburb || address.city_district || "";
  let city = address.city || address.town || "";
  let country = address.country || "";

  if (!city && country === "Qatar") city = "Doha";

  const parts = display.split(",").map((p) => p.trim());
  if (!street && parts[0]) street = parts[0];
  if (!zone && parts[1]) zone = parts[1];
  if (!city && parts[2]) city = parts[2];
  if (!country && parts[3]) country = parts[3];

  return { street, zone, city, country };
}

export default function LocationMarker({
  markerPosition,
  setMarkerPosition,
  tempFormData,
  setTempFormData,
}) {
  const map = useMap();

  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [searchMode, setSearchMode] = useState("world"); // "world" | "qatar"

  const debounceRef = useRef(null);

  useEffect(() => {
    setSearchText(
      `${tempFormData.street || ""} ${tempFormData.zone || ""} ${tempFormData.city || ""}`
    );
  }, [tempFormData]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const close = () => setResults([]);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  // MAP CLICK
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarkerPosition({ lat, lng });
      map.setView([lat, lng], 16);

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
          { headers }
        );
        const data = await res.json();

        const extracted = extractAddressFields(
          data.address,
          data.display_name
        );

        setTempFormData(extracted);
        setSearchText(
          `${extracted.street}, ${extracted.zone}, ${extracted.city}, ${extracted.country}`
        );
      } catch (err) {
        console.error("Reverse geocode failed", err);
      }
    },
  });

  // const performSearch = async (q) => {
  //   if (!q.trim()) return setResults([]);

  //   const base = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10`;
  //   const url =
  //     searchMode === "qatar"
  //       ? `${base}&q=${encodeURIComponent(q)}&countrycodes=qa`
  //       : `${base}&q=${encodeURIComponent(q)}`;

  //   const res = await fetch(url, { headers });
  //   setResults(await res.json());
  // };

  const performSearch = async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(q)}` +   // 🌍 worldwide
      `&format=json` +
      `&addressdetails=1` +
      `&limit=10`;

    const res = await fetch(url, { headers });
    const json = await res.json();
    setResults(json);
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchText(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(q), 300);
  };

  const selectPlace = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    setMarkerPosition({ lat, lng });
    map.setView([lat, lng], 16);

    const extracted = extractAddressFields(
      place.address,
      place.display_name
    );

    setTempFormData(extracted);
    setSearchText(
      `${extracted.street}, ${extracted.zone}, ${extracted.city}, ${extracted.country}`
    );
    setResults([]);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      <label>
        <input
          type="checkbox"
          checked={searchMode === "qatar"}
          onChange={(e) => setSearchMode(e.target.checked ? "qatar" : "world")}
        />
        Qatar only
      </label>

      <input
        value={searchText}
        onChange={handleSearch}
        placeholder="Search for address..."
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 9999,
          width: "calc(100% - 20px)",
          padding: 8,
          borderRadius: 6,
        }}
      />

      {results.length > 0 && (
        <ul
          onWheel={(e) => e.stopPropagation()}       // ✅ desktop scroll
          onTouchMove={(e) => e.stopPropagation()}  // ✅ mobile scroll
          style={{
            position: "absolute",
            top: 50,
            left: 10,
            right: 10,
            zIndex: 10000,
            background: "#fff",
            borderRadius: "6px",
            border: "1px solid #ccc",
            height: "250px",          // 🔥 FIXED HEIGHT (not maxHeight)
            overflowY: "auto",
            overflowX: "hidden",
            padding: 0,
            margin: 0,
            listStyle: "none",
          }}
        >
          {results.map((r) => (
            <li
              key={r.place_id}
              onClick={() => selectPlace(r)}
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              <strong>{r.address?.country || "Unknown country"}</strong><br />
              <span style={{ fontSize: "13px", color: "#555" }}>
                {r.display_name}
              </span>
            </li>
          ))}
        </ul>
      )}

      {markerPosition && (
        <Marker position={[markerPosition.lat, markerPosition.lng]} />
      )}

      <ZoomControl position="bottomright" />
    </div>
  );
}