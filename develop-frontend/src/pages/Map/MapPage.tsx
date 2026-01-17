import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useEffect, useState } from "react";
import L, { Control } from "leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet-geosearch/dist/geosearch.css";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";
import { GeoJSON } from "react-leaflet";


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

/* SEARCH */
function SearchControl() {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const SearchCtor = GeoSearchControl as unknown as {
      new (options: any): Control;
    };

    const searchControl = new SearchCtor({
      provider,
      style: "bar",
      autoComplete: true,
      autoCompleteDelay: 250,
      showMarker: true,
      showPopup: true,
      retainZoomLevel: false,
      animateZoom: true,
      searchLabel: "Search country or island",
      collapsed: false,
      position: "topright",
    });

    map.addControl(searchControl);

    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
}


/* CLICK HANDLER */
function FlightPlanner({
  points,
  setPoints,
}: {
  points: LatLngTuple[];
  setPoints: React.Dispatch<React.SetStateAction<LatLngTuple[]>>;
}) {
  useMapEvents({
    click(e) {
      setPoints((prev) => {
        if (prev.length >= 2) {
           return [];
        }
        return [...prev, [e.latlng.lat, e.latlng.lng]];
      });
    },
  });

  return null;
}

function haversineDistance(
  [lat1, lon1]: LatLngTuple,
  [lat2, lon2]: LatLngTuple
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const planeIcon = new L.Icon({
  iconUrl: "https://www.pngkey.com/png/detail/138-1382606_icon-airplane-icon-blue-png.png",
  iconSize: [24, 24],
});

export default function MapPage() {
  const [points, setPoints] = useState<LatLngTuple[]>([]);

  const [airports, setAirports] = useState<any>(null);
  

useEffect(() => {
  if (points.length !== 2) {
    setPlanePos(null);
    return;
  }

  let progress = 0;
  const speed = 0.008; // ajustezi viteza aici

  const interval = setInterval(() => {
    progress += speed;

    if (progress >= 1) {
      progress = 0; // 🔁 reset la început
    }

    const lat =
      points[0][0] + (points[1][0] - points[0][0]) * progress;
    const lng =
      points[0][1] + (points[1][1] - points[0][1]) * progress;

    setPlanePos([lat, lng]);
  }, 30);

  return () => clearInterval(interval);
}, [points]);




const [planePos, setPlanePos] = useState<LatLngTuple | null>(null);

  return (
    <MapContainer center={[20, 0]} zoom={2} className="map-container">
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        attribution="© Esri"
      />

      <SearchControl />
      {airports && (
          <GeoJSON
            data={airports}
            pointToLayer={(feature, latlng) =>
              L.circleMarker(latlng, {
                radius: 3,
                color: "#d4af37",
                weight: 1,
                fillOpacity: 0.75,
              })
            }
onEachFeature={(feature: any, layer) => {
  const p = feature.properties || {};
  const name = p.name || "Airport";
  const iata = p.iata || "N/A";
  const country = p.country || "";

  layer.bindPopup(`
    <strong>${name}</strong><br/>
    IATA: ${iata}<br/>
    ${country}
  `);

  layer.on("click", () => {
    const coords: LatLngTuple = [
      feature.geometry.coordinates[1],
      feature.geometry.coordinates[0],
    ];

    setPoints((prev) => {
      if (prev.length >= 2) {
        return [coords]; // reset + new FROM
      }
      return [...prev, coords];
    });
  });
}}

          />
        )}

      <FlightPlanner points={points} setPoints={setPoints} />

      {/* MARKER START */}
      {points[0] && (
        <Marker position={points[0]}>
          <Popup>
            <strong>From</strong>
            <br />
            Departure location
          </Popup>
        </Marker>
      )}

      {/* MARKER DESTINATION */}
      {points[1] && (
        <Marker position={points[1]}>
          <Popup>
            <strong>To</strong>
            <br />
            Destination
          </Popup>
        </Marker>
      )}

      {/* FLIGHT ROUTE */}
      {points.length === 2 && (
        <Polyline
          positions={points}
          pathOptions={{
            color: "#d4af37", // gold
            weight: 4,
            dashArray: "6 8",
          }}
        />
        
      )}
      {planePos && (
        <Marker position={planePos} icon={planeIcon}>
          <Popup>Private jet en route ✈️</Popup>
        </Marker>
      )}

      {points.length === 2 && (
        <Marker
          position={[
            (points[0][0] + points[1][0]) / 2,
            (points[0][1] + points[1][1]) / 2,
          ]}
        >
          <Popup>
            <strong>Flight distance</strong>
            <br />
            {haversineDistance(points[0], points[1]).toFixed(0)} km
          </Popup>
        </Marker>
      )}


    </MapContainer>
  );
}
