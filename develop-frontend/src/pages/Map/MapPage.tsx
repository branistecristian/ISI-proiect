import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
// Importăm LatLngBounds pentru a defini limitele lumii
import { LatLngBounds } from "leaflet"; 
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";

// IMPORTURI BACKEND & MODELE (Rămân neschimbate)
import { PublicJetsControllerService } from "../../api/generated/services/PublicJetsControllerService";
import type { JetResponse } from "../../api/generated/models/JetResponse";
import { PublicIslandsControllerService } from "../../api/generated/services/PublicIslandsControllerService";
import type { IslandResponse } from "../../api/generated/models/IslandResponse";

/* FIX icon Leaflet standard */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* --- ICONS --- */
const planeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/7893/7893979.png",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const palmIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/619/619043.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32], 
  popupAnchor: [0, -32]
});

const stopoverIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3194/3194639.png", 
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32]
});

/* --- UTILITAR: Geocoding Cache --- */
const COORD_CACHE: Record<string, LatLngTuple> = {
    "Seychelles": [-4.6796, 55.4920],
    "Maldive": [3.2028, 73.2207],
    "Bora Bora": [-16.5004, -151.7415],
    "Polinezia Franceză": [-17.6509, -149.4260],
    "Hawaii": [19.8968, -155.5828],
    "Santorini": [36.3932, 25.4615],
    "Fiji": [-17.7134, 178.0650],
    "Bali": [-8.4095, 115.1889],
    "Greece (Cyclades, Aegean Sea)": [37.0800, 25.1500],
    "French Polynesia (Society Islands)": [-16.8000, -151.5000],
    "USA (Hawaii)": [19.8968, -155.5828],
    "United States (U.S. Virgin Islands)": [18.3358, -64.8963]
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function getCoordsForLocation(location: string): Promise<LatLngTuple | null> {
    if (COORD_CACHE[location]) return COORD_CACHE[location];
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`, {
            headers: { 'User-Agent': 'LuxuryTravelApp/1.0' }
        });
        const data = await res.json();
        if (data && data.length > 0) {
            const coords: LatLngTuple = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            COORD_CACHE[location] = coords;
            return coords;
        }
    } catch (e) {
        console.warn("Geocoding failed for", location);
    }
    return null;
}

/* --- LOGICĂ GIS --- */
function getGeodesicPath(start: LatLngTuple, end: LatLngTuple, numPoints = 100) {
    const lat1 = start[0] * (Math.PI / 180);
    const lon1 = start[1] * (Math.PI / 180);
    const lat2 = end[0] * (Math.PI / 180);
    const lon2 = end[1] * (Math.PI / 180);
    const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)));
    const points: LatLngTuple[] = [];
    for (let i = 0; i <= numPoints; i++) {
        const f = i / numPoints;
        const A = Math.sin((1 - f) * d) / Math.sin(d);
        const B = Math.sin(f * d) / Math.sin(d);
        const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
        const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);
        const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
        const lon = Math.atan2(y, x);
        points.push([lat * (180 / Math.PI), lon * (180 / Math.PI)]);
    }
    return points;
}

function haversineDistance([lat1, lon1]: LatLngTuple, [lat2, lon2]: LatLngTuple): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function estimateJetSpeed(rangeKm: number): number {
    if (rangeKm < 4000) return 750;
    if (rangeKm < 8000) return 850;
    return 950;
}

function formatFlightTime(distanceKm: number, speedKmh: number): string {
    const totalHours = distanceKm / speedKmh;
    const h = Math.floor(totalHours);
    const m = Math.round((totalHours - h) * 60);
    return `${h}h ${m}m`;
}

function FlightPlanner({ setPoints }: { setPoints: React.Dispatch<React.SetStateAction<LatLngTuple[]>> }) {
  useMapEvents({
    click(e) {
      setPoints((prev) => {
        if (prev.length >= 2) return [prev[0], [e.latlng.lat, e.latlng.lng]];
        return [...prev, [e.latlng.lat, e.latlng.lng]];
      });
    },
  });
  return null;
}

interface MappedIsland extends IslandResponse {
    coords: LatLngTuple;
}

/* ================= COMPONENTA PRINCIPALĂ ================= */
export default function MapPage() {
  const [points, setPoints] = useState<LatLngTuple[]>([[44.5711, 26.0850]]); // OTP
  const [planePos, setPlanePos] = useState<LatLngTuple | null>(null);
  const [jets, setJets] = useState<JetResponse[]>([]);
  const [selectedJet, setSelectedJet] = useState<JetResponse | null>(null);
  const [loadingJets, setLoadingJets] = useState(true);
  const [mappedIslands, setMappedIslands] = useState<MappedIsland[]>([]);
  const [stopoverIsland, setStopoverIsland] = useState<MappedIsland | null>(null);

  // LIMITELE LUMII (World Bounds)
  const worldBounds = new LatLngBounds(
    [-90, -180], // Sud-Vest
    [90, 180]    // Nord-Est
  );

  useEffect(() => {
    setLoadingJets(true);
    PublicJetsControllerService.list()
      .then((data) => {
        if (data && data.length > 0) {
          setJets(data);
          setSelectedJet(data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingJets(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const data = await PublicIslandsControllerService.list1(undefined, undefined, undefined, undefined, true);
        if (cancelled || !data) return;

        const validIslands: MappedIsland[] = [];
        const toGeocode: IslandResponse[] = [];

        data.forEach(island => {
            if (typeof island.lat === 'number' && typeof island.lng === 'number') {
                validIslands.push({ ...island, coords: [island.lat, island.lng] } as MappedIsland);
            } else if (island.location) {
                toGeocode.push(island);
            }
        });

        if (!cancelled) setMappedIslands(validIslands);

        for (const island of toGeocode) {
            if (cancelled) break;
            const isCached = !!COORD_CACHE[island.location!];
            const coords = await getCoordsForLocation(island.location!);
            if (coords) {
                setMappedIslands(prev => {
                    if (prev.some(p => p.id === island.id)) return prev;
                    return [...prev, { ...island, coords } as MappedIsland];
                });
            }
            if (!isCached) await sleep(1200); 
        }
      } catch (err) {
        console.error("Err loading islands map", err);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  const destination = points[1];
  const maxRange = selectedJet?.rangeKm ?? 0;
  const avgSpeed = estimateJetSpeed(maxRange);
  const directDistance = destination ? haversineDistance(points[0], destination) : 0;
  const isDirectPossible = directDistance <= maxRange;

  useEffect(() => {
      if (!destination || !selectedJet || isDirectPossible) {
          setStopoverIsland(null);
          return;
      }
      let bestStopover: MappedIsland | null = null;
      let minTotalDist = Infinity;

      for (const candidate of mappedIslands) {
          if (Math.abs(candidate.coords[0] - destination[0]) < 0.1 && Math.abs(candidate.coords[1] - destination[1]) < 0.1) continue;
          const distToStop = haversineDistance(points[0], candidate.coords);
          const distToDest = haversineDistance(candidate.coords, destination);

          if (distToStop <= maxRange && distToDest <= maxRange) {
              const totalDist = distToStop + distToDest;
              if (totalDist < minTotalDist) {
                  minTotalDist = totalDist;
                  bestStopover = candidate;
              }
          }
      }
      setStopoverIsland(bestStopover);
  }, [destination, selectedJet, mappedIslands, isDirectPossible, points, maxRange]);

  const totalTripDistance = stopoverIsland && destination
      ? haversineDistance(points[0], stopoverIsland.coords) + haversineDistance(stopoverIsland.coords, destination)
      : directDistance;

  const flightTimeStr = formatFlightTime(totalTripDistance, avgSpeed);

  useEffect(() => {
    if (points.length !== 2) { setPlanePos(null); return; }
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.005;
      if (progress >= 1) progress = 0;
      let startP = points[0];
      let endP = points[1];
      if (stopoverIsland) endP = stopoverIsland.coords;
      
      if (!isDirectPossible && !stopoverIsland) { setPlanePos(null); return; }

      const lat = startP[0] + (endP[0] - startP[0]) * progress;
      const lng = startP[1] + (endP[1] - startP[1]) * progress;
      setPlanePos([lat, lng]);
    }, 20);
    return () => clearInterval(interval);
  }, [points, stopoverIsland, isDirectPossible]);

  const handleIslandClick = (coords: LatLngTuple) => {
      setPoints(prev => [prev[0], coords]);
  };

  return (
    <div style={{ 
        position: "relative", 
        height: "calc(100vh - 100px)", 
        width: "95%", 
        margin: "20px auto", 
        borderRadius: "16px", 
        overflow: "hidden", 
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        border: "1px solid #333"
    }}>
        
      <div className="map-info-panel">
        <h3>Flight Planner 🗺️</h3>
        <div className="control-group">
            <label>Alege Aeronava:</label>
            {loadingJets ? (
              <p style={{fontSize: '12px', color: '#888'}}>Se încarcă flota...</p>
            ) : (
              <select 
                  className="jet-select"
                  value={selectedJet?.id}
                  onChange={(e) => {
                      const jet = jets.find(j => j.id === e.target.value);
                      if(jet) setSelectedJet(jet);
                  }}
              >
                  {jets.map(jet => (
                      <option key={jet.id} value={jet.id}>
                          {jet.model} ({jet.rangeKm} km)
                      </option>
                  ))}
              </select>
            )}
        </div>

        <div className="route-details">
            <p><strong>Origine:</strong> Otopeni (OTP)</p>
            <p><strong>Destinație:</strong> {destination ? `${destination[0].toFixed(2)}, ${destination[1].toFixed(2)}` : "Click pe hartă"}</p>
        </div>
        
        {destination && selectedJet && (
            <div className={`range-status ${isDirectPossible ? "ok" : (stopoverIsland ? "warning" : "alert")}`}>
                {isDirectPossible && (
                    <>
                        <p>Distanță: <strong>{directDistance.toFixed(0)} km</strong></p>
                        <p>Range: <strong>{maxRange} km</strong></p>
                        <p style={{marginTop:'4px'}}>⏱️ Timp estimat: <strong>{flightTimeStr}</strong></p>
                        <hr style={{borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0'}}/>
                        <p style={{fontWeight: 'bold', fontSize: '14px', color: '#4ade80'}}>✅ Zbor Direct Posibil</p>
                    </>
                )}
                {!isDirectPossible && stopoverIsland && (
                    <>
                         <p>Dist. Totală: <strong>{totalTripDistance.toFixed(0)} km</strong></p>
                         <p>Range Avion: <strong>{maxRange} km</strong></p>
                         <p style={{marginTop:'4px'}}>⏱️ Timp (cu escală): <strong>{flightTimeStr}</strong></p>
                         <hr style={{borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0'}}/>
                         <p style={{fontWeight: 'bold', fontSize: '13px', color: '#facc15'}}>⚠️ Escală prin Insulă</p>
                         <p style={{fontSize: '12px', marginTop: '4px'}}>Oprire la: <strong>{stopoverIsland.name}</strong></p>
                    </>
                )}
                {!isDirectPossible && !stopoverIsland && (
                    <>
                        <p>Distanță: <strong>{directDistance.toFixed(0)} km</strong></p>
                        <p>Range: <strong>{maxRange} km</strong></p>
                        <hr style={{borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0'}}/>
                        <p style={{fontWeight: 'bold', fontSize: '14px', color: '#ef4444'}}>❌ Destinație Indisponibilă</p>
                        <p style={{fontSize: '11px', marginTop: '4px'}}>Nu există nicio insulă intermediară potrivită.</p>
                    </>
                )}
            </div>
        )}
        <div className="map-footer-info">
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', color: '#333' }}>
                <span>🏝️</span> 
                <span>{mappedIslands.length} insule disponibile</span>
            </p>
        </div>
      </div>

      <MapContainer 
        center={[30, 20]} 
        zoom={3} 
        minZoom={2} // LIMITĂ ZOOM OUT
        maxBounds={worldBounds} // LIMITEAZĂ PANNING-UL LA LUMEA REALĂ
        maxBoundsViscosity={1.0} // FACE MARGINILE "SOLIDE"
        className="map-container" 
        style={{background: '#1a1a1a'}}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Esri"
          noWrap={true} // PREVINE DUPLICAREA VIZUALĂ A HĂRȚII
        />
        
        <FlightPlanner setPoints={setPoints} />

        {points[0] && selectedJet && (
            <Circle 
                center={points[0]} 
                radius={maxRange * 1000} 
                pathOptions={{ interactive: false, color: isDirectPossible ? "#4ade80" : "#ef4444", fillColor: isDirectPossible ? "#4ade80" : "#ef4444", fillOpacity: 0.1, weight: 2, dashArray: "5, 10" }} 
            />
        )}

        {mappedIslands.map((island) => (
            <Marker 
                key={island.id} 
                position={island.coords} 
                icon={stopoverIsland?.id === island.id ? stopoverIcon : palmIcon}
                zIndexOffset={stopoverIsland?.id === island.id ? 1000 : 0}
                eventHandlers={{ click: () => handleIslandClick(island.coords) }}
            >
                <Popup>
                    <div style={{textAlign: 'center'}}>
                        <strong style={{fontSize: '14px', color: '#333'}}>{island.name}</strong><br/>
                        <span style={{fontSize: '12px', color: '#666'}}>{island.location}</span><br/>
                        <strong style={{color: '#d4af37'}}>{island.pricePerNight} €</strong><br/>
                        {stopoverIsland?.id === island.id && (
                            <div style={{marginTop: '5px', marginBottom: '5px', padding: '4px', background: '#fef3c7', color: '#d97706', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>Punct de Escală Optim</div>
                        )}
                        <button style={{marginTop: '5px', background: '#0f172a', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer'}} onClick={() => handleIslandClick(island.coords)}>Setează Destinație</button>
                    </div>
                </Popup>
            </Marker>
        ))}

        {points[0] && <Marker position={points[0]}><Popup><strong>From</strong><br />Otopeni</Popup></Marker>}
        {points[1] && <Marker position={points[1]}><Popup><strong>To</strong><br />Destination</Popup></Marker>}

        {destination && isDirectPossible && (
          <Polyline positions={getGeodesicPath(points[0], destination)} pathOptions={{ color: "#d4af37", weight: 4, opacity: 0.9, dashArray: "10 10" }} />
        )}

        {destination && !isDirectPossible && stopoverIsland && (
            <>
                <Polyline positions={getGeodesicPath(points[0], stopoverIsland.coords)} pathOptions={{ color: "#facc15", weight: 4, opacity: 0.9, dashArray: "5 5" }} />
                <Polyline positions={getGeodesicPath(stopoverIsland.coords, destination)} pathOptions={{ color: "#facc15", weight: 4, opacity: 0.9, dashArray: "5 5" }} />
            </>
        )}

        {planePos && <Marker position={planePos} icon={planeIcon} />}
      </MapContainer>
    </div>
  );
}