import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMapEvents,
  ScaleControl,
  Polygon,
  LayersControl
} from "react-leaflet";
import { useEffect, useState, useMemo } from "react";
import L from "leaflet";
import { LatLngBounds } from "leaflet"; 
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

// IMPORTURI BACKEND
import { PublicJetsControllerService } from "../../api/generated/services/PublicJetsControllerService";
import type { JetResponse } from "../../api/generated/models/JetResponse";
import { PublicIslandsControllerService } from "../../api/generated/services/PublicIslandsControllerService";
import type { IslandResponse } from "../../api/generated/models/IslandResponse";

/* --- CONFIGURARE ICONS --- */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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

/* --- GEOLOCATION CACHE --- */
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
    } catch (e) { console.warn("Geo fail", location); }
    return null;
}

/* --- LOGICĂ GIS MATEMATICĂ --- */
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
    return rangeKm < 4000 ? 750 : rangeKm < 8000 ? 850 : 950;
}

function formatFlightTime(distanceKm: number, speedKmh: number): string {
    const totalHours = distanceKm / speedKmh;
    const h = Math.floor(totalHours);
    const m = Math.round((totalHours - h) * 60);
    return `${h}h ${m}m`;
}

/* --- COMPONENTE COMPLEXE NOI --- */

// 1. TERMINATOR ZI/NOAPTE (ALGORITM ASTRONOMIC)
// Calculează poligonul umbrei pământului în timp real
function DayNightTerminator() {
    const [polygon, setPolygon] = useState<LatLngTuple[]>([]);

    useEffect(() => {
        const computeTerminator = () => {
            const date = new Date();
            // Algoritm simplificat pentru poziția soarelui
            // Julian Date
            const julian = (date.getTime() / 86400000) + 2440587.5;
            const D = julian - 2451545.0;
            
            // Mean Longitude / Anomaly
            const g = 357.529 + 0.98560028 * D;
            const q = 280.459 + 0.98564736 * D;
            const L_sun = q + 1.915 * Math.sin(g * Math.PI/180) + 0.020 * Math.sin(2*g * Math.PI/180);
            
            // Obliquity
            const e = 23.439 - 0.00000036 * D;
            const RA = (Math.atan2(Math.cos(e*Math.PI/180)*Math.sin(L_sun*Math.PI/180), Math.cos(L_sun*Math.PI/180))) * 180/Math.PI;
            
            // Declination (Latitudinea la care soarele e la zenit)
            const dec = (Math.asin(Math.sin(e*Math.PI/180)*Math.sin(L_sun*Math.PI/180))) * 180/Math.PI;
            
            // Greenwich Mean Sidereal Time
            const GMST = 280.46061837 + 360.98564736629 * D;
            const hourAngle = (GMST - RA) % 360; // Longitudinea opusă soarelui

            // Generare puncte terminator (linia de apus/răsărit)
            const path: LatLngTuple[] = [];
            const K = Math.PI / 180;
            
            // Poligonul nopții
            for (let lon = -180; lon <= 180; lon += 2) {
                const lat = -Math.atan(-Math.tan(dec * K) / Math.cos((lon - (180 - hourAngle)) * K)) / K;
                path.push([lat, lon]);
            }

            // Închidem poligonul (depinde dacă e iarnă sau vară în nord)
            if (dec > 0) {
                 path.push([-90, 180]);
                 path.push([-90, -180]);
            } else {
                 path.push([90, 180]);
                 path.push([90, -180]);
            }
            
            setPolygon(path);
        };

        computeTerminator();
        const interval = setInterval(computeTerminator, 60000); // Actualizare la fiecare minut
        return () => clearInterval(interval);
    }, []);

    if (polygon.length === 0) return null;

    return (
        <Polygon 
            positions={polygon} 
            pathOptions={{ 
                color: 'transparent', // Fără contur
                fillColor: '#000',    // Negru
                fillOpacity: 0.35,    // Translucid (Efect de noapte)
                interactive: false
            }} 
        />
    );
}

// 2. MOUSE COORDINATES (Afișaj profesional Lat/Lng)
function MouseCoordinates() {
    const [coords, setCoords] = useState<LatLngTuple | null>(null);
    useMapEvents({
        mousemove(e) {
            setCoords([e.latlng.lat, e.latlng.lng]);
        }
    });

    if (!coords) return null;

    return (
        <div style={{
            position: 'absolute',
            bottom: '25px',
            right: '10px',
            background: 'rgba(15, 23, 42, 0.9)', // Stil Dark Blue
            color: '#4ade80', // Text Verde Matrix
            padding: '4px 10px',
            borderRadius: '4px',
            fontFamily: "'Courier New', monospace", // Font tehnic
            fontSize: '12px',
            zIndex: 1000,
            pointerEvents: 'none',
            border: '1px solid #334155',
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
            LAT: {coords[0].toFixed(4)} | LNG: {coords[1].toFixed(4)}
        </div>
    );
}

// 3. FLIGHT PLANNER (Click Handler)
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

  // FILTRE
  const [filterDistance, setFilterDistance] = useState<number | null>(null);
  const [filterPrice, setFilterPrice] = useState<number | null>(null);

  // Bounds limitate la 85 grade pt estetică
  const worldBounds = new LatLngBounds([-85, -180], [85, 180]);

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
      } catch (err) { console.error("Err loading islands map", err); }
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  const visibleIslands = useMemo(() => {
    const startPoint = points[0]; 
    return mappedIslands.filter(island => {
        let matchDist = true;
        if (filterDistance !== null) {
            const dist = haversineDistance(startPoint, island.coords);
            if (dist > filterDistance) matchDist = false;
        }
        let matchPrice = true;
        if (filterPrice !== null) {
            if (!island.pricePerNight || island.pricePerNight > filterPrice) matchPrice = false;
        }
        return matchDist && matchPrice;
    });
  }, [mappedIslands, filterDistance, filterPrice, points]);

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

  const handleIslandClick = (coords: LatLngTuple) => { setPoints(prev => [prev[0], coords]); };

  const selectStyle: React.CSSProperties = {
      padding: '6px 10px', borderRadius: '6px', border: '1px solid #555',
      background: '#333', color: '#fff', fontSize: '13px', outline: 'none', cursor: 'pointer'
  };
  const labelStyle: React.CSSProperties = { fontSize: '12px', color: '#aaa', marginBottom: '2px', display: 'block' };

  return (
    <div style={{ 
        display: "flex", flexDirection: "column", height: "calc(100vh - 80px)", width: "95%", 
        margin: "20px auto", borderRadius: "16px", overflow: "hidden", 
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)", border: "1px solid #333", background: '#1a1a1a'
    }}>
        
      {/* BARA DE SUS */}
      <div style={{
          background: '#222', padding: '15px 20px', borderBottom: '1px solid #333',
          display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap'
      }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, color: 'white', marginRight: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  ✈️ <span style={{fontSize: '1.1rem'}}>Planner</span>
              </h3>
              <div>
                  <label style={labelStyle}>Aeronava</label>
                  {loadingJets ? <span style={{color: '#666', fontSize: '12px'}}>...</span> : (
                      <select style={selectStyle} value={selectedJet?.id} onChange={(e) => {
                          const j = jets.find(x => x.id === e.target.value); if(j) setSelectedJet(j);
                      }}>
                          {jets.map(j => <option key={j.id} value={j.id}>{j.model} ({j.rangeKm} km)</option>)}
                      </select>
                  )}
              </div>
              <div>
                  <label style={labelStyle}>Max Dist.</label>
                  <select style={selectStyle} onChange={(e) => setFilterDistance(e.target.value === 'all' ? null : Number(e.target.value))} defaultValue="all">
                      <option value="all">🌐 Toate</option>
                      <option value="1000">{'<'} 1k km</option>
                      <option value="3000">{'<'} 3k km</option>
                      <option value="6000">{'<'} 6k km</option>
                      <option value="10000">{'<'} 10k km</option>
                  </select>
              </div>
              <div>
                  <label style={labelStyle}>Max Preț</label>
                  <select style={selectStyle} onChange={(e) => setFilterPrice(e.target.value === 'all' ? null : Number(e.target.value))} defaultValue="all">
                      <option value="all">💰 Oricât</option>
                      <option value="500">{'<'} 500 €</option>
                      <option value="1000">{'<'} 1k €</option>
                      <option value="5000">{'<'} 5k €</option>
                  </select>
              </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#1a1a1a', padding: '8px 15px', borderRadius: '8px', border: '1px solid #333' }}>
               <div style={{fontSize: '13px', color: '#ccc'}}>
                   <span style={{color: '#888'}}>Ruta:</span> {destination ? <strong>OTP ➝ {destination[0].toFixed(1)},{destination[1].toFixed(1)}</strong> : "Selectează Destinația"}
               </div>
               {destination && selectedJet && (
                   <div style={{fontSize: '13px', fontWeight: 'bold'}}>
                       {isDirectPossible ? <span style={{color: '#4ade80'}}>✅ Direct ({flightTimeStr})</span> : stopoverIsland ? <span style={{color: '#facc15'}}>⚠️ Escală: {stopoverIsland.name}</span> : <span style={{color: '#ef4444'}}>❌ Indisponibil</span>}
                   </div>
               )}
               <div style={{fontSize: '12px', color: '#666', borderLeft: '1px solid #444', paddingLeft: '15px'}}>🏝️ {visibleIslands.length}</div>
          </div>
      </div>

      {/* HARTA */}
      <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer 
            center={[30, 20]} zoom={3} minZoom={2.5} 
            maxBounds={worldBounds} maxBoundsViscosity={1.0} 
            className="map-container" 
            style={{background: '#0f172a', height: '100%', width: '100%'}}
          >
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Satelit (Esri)">
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Esri" noWrap={true} />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Dark Matter">
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution="CartoDB" noWrap={true} />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="OpenStreetMap">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OSM" noWrap={true} />
                </LayersControl.BaseLayer>
            </LayersControl>

            {/* ELEMENTELE GIS NOI */}
            <ScaleControl position="bottomleft" imperial={false} />
            <DayNightTerminator />
            <MouseCoordinates />

            <FlightPlanner setPoints={setPoints} />

            {/* RENDER HARTA (Elemente existente) */}
            {points[0] && selectedJet && (
                <Circle center={points[0]} radius={maxRange * 1000} pathOptions={{ interactive: false, color: isDirectPossible ? "#4ade80" : "#ef4444", fillColor: isDirectPossible ? "#4ade80" : "#ef4444", fillOpacity: 0.1, weight: 2, dashArray: "5, 10" }} />
            )}

            {visibleIslands.map((island) => (
                <Marker key={island.id} position={island.coords} icon={stopoverIsland?.id === island.id ? stopoverIcon : palmIcon} zIndexOffset={stopoverIsland?.id === island.id ? 1000 : 0} eventHandlers={{ click: () => handleIslandClick(island.coords) }}>
                    <Popup>
                        <div style={{textAlign: 'center'}}>
                            <strong style={{fontSize: '14px', color: '#333'}}>{island.name}</strong><br/>
                            <span style={{fontSize: '12px', color: '#666'}}>{island.location}</span><br/>
                            <strong style={{color: '#d4af37'}}>{island.pricePerNight} €</strong><br/>
                            <div style={{fontSize: '11px', marginTop: '4px', color: '#666'}}>Distanță: {haversineDistance(points[0], island.coords).toFixed(0)} km</div>
                            {stopoverIsland?.id === island.id && <div style={{marginTop: '5px', padding: '4px', background: '#fef3c7', color: '#d97706', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'}}>Escală Optimă</div>}
                            <button style={{marginTop: '5px', background: '#0f172a', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer'}} onClick={() => handleIslandClick(island.coords)}>Setează Destinație</button>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {points[0] && <Marker position={points[0]}><Popup><strong>From</strong><br />Otopeni</Popup></Marker>}
            {points[1] && <Marker position={points[1]}><Popup><strong>To</strong><br />Destination</Popup></Marker>}

            {destination && isDirectPossible && <Polyline positions={getGeodesicPath(points[0], destination)} pathOptions={{ color: "#d4af37", weight: 4, opacity: 0.9, dashArray: "10 10" }} />}
            {destination && !isDirectPossible && stopoverIsland && (
                <>
                    <Polyline positions={getGeodesicPath(points[0], stopoverIsland.coords)} pathOptions={{ color: "#facc15", weight: 4, opacity: 0.9, dashArray: "5 5" }} />
                    <Polyline positions={getGeodesicPath(stopoverIsland.coords, destination)} pathOptions={{ color: "#facc15", weight: 4, opacity: 0.9, dashArray: "5 5" }} />
                </>
            )}

            {planePos && <Marker position={planePos} icon={planeIcon} />}
          </MapContainer>
      </div>
    </div>
  );
}