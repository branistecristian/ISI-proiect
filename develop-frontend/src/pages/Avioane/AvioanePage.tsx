import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AvioanePage.css";
import jet1 from "../../assets/jet1.webp";
import type { LatLngTuple } from "leaflet";
import { PublicJetsControllerService } from "../../api/generated/services/PublicJetsControllerService";
import { JetResponse } from "../../api/generated/models/JetResponse";
import { BookingControllerService } from "../../api/generated/services/BookingControllerService";
import { Booking } from "../../api/generated/models/Booking";

import { addLocalBooking } from "../../utils/booking";

const FALLBACK_JETS: JetResponse[] = [
  {
    id: "fallback-gulfstream",
    model: "Gulfstream G700",
    capacity: 19,
    rangeKm: 13800,
    pricePerHour: 11000,
    images: [],
    status: JetResponse.status.AVAILABLE,
  },
  {
    id: "fallback-global8000",
    model: "Bombardier Global 8000",
    capacity: 17,
    rangeKm: 14800,
    pricePerHour: 9500,
    images: [],
    status: JetResponse.status.AVAILABLE,
  },
  {
    id: "fallback-falcon10x",
    model: "Dassault Falcon 10X",
    capacity: 16,
    rangeKm: 13900,
    pricePerHour: 10500,
    images: [],
    status: JetResponse.status.AVAILABLE,
  },
];



/** Otopeni Airport */
const OTP: LatLngTuple = [44.5711, 26.0850];

/** Geocoding: location string -> coords */
async function geocodeLocation(location: string): Promise<LatLngTuple | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
  );
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}

/** Haversine distance in km */
function haversineDistance([lat1, lon1]: LatLngTuple, [lat2, lon2]: LatLngTuple): number {
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

/**
 * Heuristic speed based on range class (since backend has rangeKm, not speed):
 * - short: ~800 km/h
 * - medium: ~900 km/h
 * - long: ~950 km/h
 */

function getJetImage(jet: any): string {
  // caz special Gulfstream
  if (jet.model?.toLowerCase().includes("gulfstream")) {
    return jet1;
  }

  // dacă backend-ul are imagini
  if (jet.images && jet.images.length > 0) {
    return jet.images[0];
  }

  // fallback general
  return "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=60";
}


function estimateCruiseSpeedKmh(rangeKm: number) {
  if (rangeKm < 3500) return 800;
  if (rangeKm < 7500) return 900;
  return 950;
}

export default function AvioanePage() {
  const [search, setSearch] = useState("");
  const [jets, setJets] = useState<JetResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedJet, setSelectedJet] = useState<JetResponse | null>(null);
  const [destinationText, setDestinationText] = useState(""); // e.g. "Little Saint James, US Virgin Islands"
  const [destinationCoords, setDestinationCoords] = useState<LatLngTuple | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Fetch jets from backend
const [apiFailed, setApiFailed] = useState(false);

useEffect(() => {
  let cancelled = false;

  setLoading(true);
  setApiFailed(false);

  PublicJetsControllerService.list(search?.trim() || undefined)
    .then((data) => {
      if (cancelled) return;

      // ✅ backend OK: show exactly what it returns (even empty)
      setJets(data ?? []);
    })
    .catch(() => {
      if (cancelled) return;

      // ✅ backend failed: fallback to demo jets
      setApiFailed(true);
      setJets(FALLBACK_JETS);
    })
    .finally(() => {
      if (!cancelled) setLoading(false);
    });

  return () => {
    cancelled = true;
  };
}, [search]);


  const filteredJets = useMemo(() => jets, [jets]);

  const openJetModal = (jet: JetResponse) => {
    setSelectedJet(jet);
    setDestinationText("");
    setDestinationCoords(null);
    setGeoError(null);
  };

  const closeJetModal = () => {
    setSelectedJet(null);
    setDestinationText("");
    setDestinationCoords(null);
    setGeoError(null);
  };

  const handleGeocode = async () => {
    if (!destinationText.trim()) {
      setGeoError("Introduce o destinație (ex: Little Saint James, USVI)");
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    try {
      const coords = await geocodeLocation(destinationText.trim());
      if (!coords) {
        setDestinationCoords(null);
        setGeoError("Nu am găsit coordonate pentru destinația asta. Încearcă alt text.");
      } else {
        setDestinationCoords(coords);
      }
    } catch {
      setDestinationCoords(null);
      setGeoError("Eroare la geocoding. Încearcă din nou.");
    } finally {
      setGeoLoading(false);
    }
  };

  const computed = useMemo(() => {
    if (!selectedJet || !destinationCoords) return null;

    const distanceKm = haversineDistance(OTP, destinationCoords);
    const cruise = estimateCruiseSpeedKmh(Number(selectedJet.rangeKm ?? 0));
    const hours = distanceKm / cruise;

    const pricePerHour = Number(selectedJet.pricePerHour ?? 0);
    const totalPrice = hours * pricePerHour;

    const canReach = Number(selectedJet.rangeKm ?? 0) >= distanceKm;

    return { distanceKm, cruise, hours, totalPrice, canReach };
  }, [selectedJet, destinationCoords]);
  

  const handleConfirm = async () => {
    if (!selectedJet || !computed) return;

    try {
      const start = new Date();              // azi
      const end = new Date(start);           // copie
      end.setDate(end.getDate() + 1);        // +1 zi

      const startDate = start.toISOString().slice(0, 10);
      const endDate = end.toISOString().slice(0, 10);

      await BookingControllerService.create({
        type: Booking.type.JET,
        jetId: String(selectedJet.id),
        startDate,
        endDate,
        notes: destinationText ? `Destination: ${destinationText}` : undefined,
      });

      alert(`Rezervare salvată ✅ (${selectedJet.model})`);
      closeJetModal();
    } catch (e: any) {
      const status = e?.status ?? e?.response?.status;
      const msg = e?.body?.message || e?.message || (status ? `Request failed (${status})` : "Request failed");
      alert(`Nu s-a putut salva rezervarea: ${msg}`);
    }
  };

  return (
    <>
      <motion.div
        className="page-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="title">Zboară în Stil First Class ✈️</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder="Caută avionul (model)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
        </div>

        {loading ? (
          <p className="loading">Se încarcă avioanele...</p>
        ) : (
          <div className="plane-section">
            {filteredJets.length > 0 ? (
              filteredJets.map((jet) => (
                <motion.div
                  key={jet.id}
                  className="plane-box"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 150 }}
                >
                  {/* dacă backend are images, ia prima; altfel placeholder */}
                    <img
                      src={getJetImage(jet)}
                      alt={jet.model}
                      className="plane-image"
                    />


                  <h2>{jet.model}</h2>

                  <p className="muted">
                    Capacity: <strong>{jet.capacity}</strong> • Range:{" "}
                    <strong>{jet.rangeKm} km</strong>
                  </p>

                  <p className="price">💰 {Number(jet.pricePerHour).toLocaleString()} € / oră</p>

                  <button className="reserve-btn" onClick={() => openJetModal(jet)}>
                    Închiriază (one-way)
                  </button>
                </motion.div>
              ))
            ) : apiFailed ? (
            <p className="no-results">Nu putem încărca avioanele acum (server error). Afișăm demo jets.</p>
          ) : (
            <p className="no-results">Niciun avion găsit pentru “{search}”.</p>
          )}
          </div>
        )}
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedJet && (
          <motion.div
            className="jet-booking-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="jet-booking-card"
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <div className="jet-modal-header">
                <div>
                  <h2>{selectedJet.model}</h2>
                  <p className="muted">
                    Capacity <strong>{selectedJet.capacity}</strong> • Range{" "}
                    <strong>{selectedJet.rangeKm} km</strong>
                  </p>
                </div>

                <button className="modal-close" onClick={closeJetModal}>
                  ✖
                </button>
              </div>

              <div className="jet-modal-grid">
                <div className="jet-modal-field">
                  <label>Destinație (text)</label>
                  <input
                    className="lux-input"
                    placeholder='Ex: "Little Saint James, US Virgin Islands"'
                    value={destinationText}
                    onChange={(e) => setDestinationText(e.target.value)}
                  />
                  <button className="lux-secondary-btn" onClick={handleGeocode} disabled={geoLoading}>
                    {geoLoading ? "Căutăm..." : "Calculează distanța"}
                  </button>
                  {geoError && <p className="date-warning">{geoError}</p>}
                </div>

                <div className="jet-modal-summary">
                  <div className="summary-row">
                    <span>From</span>
                    <strong>Otopeni (OTP)</strong>
                  </div>

                  <div className="summary-row">
                    <span>Price / hour</span>
                    <strong>{Number(selectedJet.pricePerHour).toLocaleString()} €</strong>
                  </div>

                  {computed ? (
                    <>
                      <div className="summary-row">
                        <span>Distance</span>
                        <strong>{computed.distanceKm.toFixed(0)} km</strong>
                      </div>

                      <div className="summary-row">
                        <span>Est. cruise</span>
                        <strong>{computed.cruise} km/h</strong>
                      </div>

                      <div className="summary-row">
                        <span>Flight time (one-way)</span>
                        <strong>{computed.hours.toFixed(1)} h</strong>
                      </div>

                      <div className="summary-total">
                        <span>Total</span>
                        <strong>{computed.totalPrice.toLocaleString()} €</strong>
                      </div>

                      {!computed.canReach && (
                        <p className="date-warning">
                          ⚠️ Range insuficient pentru zbor direct. Ai nevoie de escală / alt jet.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="muted" style={{ marginTop: 8 }}>
                      Introdu o destinație și apasă “Calculează distanța”.
                    </p>
                  )}
                </div>
              </div>

              <div className="jet-booking-actions">
                <button className="cancel-btn" onClick={closeJetModal}>
                  Anulează
                </button>

                <button
                  className="confirm-btn"
                  onClick={handleConfirm}
                  disabled={!computed}
                  title={!computed ? "Calculează distanța întâi" : ""}
                >
                  Confirmă rezervarea
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
