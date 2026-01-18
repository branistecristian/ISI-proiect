import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";

import { useEffect, useState } from "react";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./IslandMap.css";

/* FIX icon Leaflet */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* Otopeni Airport */
const OTP: LatLngTuple = [44.5711, 26.0850];

/* Geocoding simplu din STRING (location din backend) */
async function geocodeLocation(
  location: string
): Promise<LatLngTuple | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      location
    )}`
  );
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

/* Haversine – distanță reală */
function haversineDistance(
  [lat1, lon1]: LatLngTuple,
  [lat2, lon2]: LatLngTuple
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function IslandMap({
  location,
  name,
}: {
  location: string;
  name: string;
}) {
  const [destination, setDestination] =
    useState<LatLngTuple | null>(null);

  useEffect(() => {
    geocodeLocation(location).then(setDestination);
  }, [location]);

  if (!destination) {
    return <p style={{ opacity: 0.6 }}>Se încarcă harta...</p>;
  }

  const distance = haversineDistance(OTP, destination).toFixed(0);

  return (
  <div className="island-map-section">
    <h2 className="section-title">
      ✈️ Zbor către destinație
    </h2>

    <div className="island-map-wrapper">
      <MapContainer
        center={destination}
        zoom={4}
        className="island-map"
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          attribution="© Esri"
        />

        <Marker position={OTP}>
          <Popup>Aeroport Otopeni</Popup>
        </Marker>

        <Marker position={destination}>
          <Popup>{name}</Popup>
        </Marker>

        <Polyline
          positions={[OTP, destination]}
          pathOptions={{
            color: "#d4af37",
            weight: 4,
            dashArray: "6 8",
          }}
        />
      </MapContainer>
    </div>

    <div className="flight-info">
      <div>
        <span>Distanță</span>
        <strong>{distance} km</strong>
      </div>

      <div>
        <span>Aeronava recomandată</span>
        <strong>
          {Number(distance) < 4000
            ? "Light Jet"
            : Number(distance) < 8000
            ? "Mid-Size Jet"
            : "Long Range Jet"}
        </strong>
      </div>
    </div>
  </div>
);
}
