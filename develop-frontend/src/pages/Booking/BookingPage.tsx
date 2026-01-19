import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom"; // Importăm useLocation pentru a detecta ?success=true
import "./BookingPage.css";

import { getLocalBookings, type LocalBooking } from "../../utils/booking";

// Importurile generate
import { BookingControllerService } from "../../api/generated/services/BookingControllerService";
import type { BookingResponse } from "../../api/generated/models/BookingResponse";
import { PublicIslandsControllerService } from "../../api/generated/services/PublicIslandsControllerService";
import { PublicJetsControllerService } from "../../api/generated/services/PublicJetsControllerService";
import { OpenAPI } from "../../api/generated/core/OpenAPI"; 

type UiBooking = {
  id: string;
  from: string;
  to: string;
  date: string;
  source: "ISLAND" | "JET" | "LOCAL";
  status?: BookingResponse.status | string;
  backend: boolean;
  price?: number;
};

const normalizeError = (e: any): string => {
  const status = e?.status ?? e?.response?.status;
  if (status === 401 || status === 403) return "You are not logged in.";
  if (e?.body?.message) return String(e.body.message);
  if (e?.message) return String(e.message);
  return "Something went wrong";
};

export default function BookingPage() {
  const [bookings, setBookings] = useState<UiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Hook pentru a citi URL-ul (pentru success message de la Stripe)
  const location = useLocation();

  const localFallback: LocalBooking[] = useMemo(() => getLocalBookings(), []);

  // --- LOGICA DE PLATĂ REALĂ (STRIPE) ---
  const handlePayment = async (booking: UiBooking) => {
    if (!booking.price) return;
    setProcessingId(booking.id);

    try {
      console.log(`Inițiere plată Stripe pentru: ${booking.id}`);

      // Luăm token-ul
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken"); 

      if (!token) {
        alert("Eroare: Nu ești autentificat (Token lipsă).");
        return;
      }

      // Important: Asigurăm că OpenAPI are token-ul setat înainte de orice request
      OpenAPI.TOKEN = token;

      const response = await fetch("http://localhost:8080/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          bookingId: booking.id
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Eroare server: ${response.status}`);
      }

      const data = await response.json();

      if (data.url) {
        console.log("Redirecting to Stripe:", data.url);
        window.location.href = data.url; 
      } else {
        throw new Error("Backend-ul nu a returnat URL-ul de plată.");
      }

    } catch (err: any) {
      console.error("Payment Error:", err);
      alert("Nu s-a putut iniția plata: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // --- ÎNCĂRCARE DATE ---
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        // --- FIXUL PENTRU LOGOUT ---
        // Când te întorci de la Stripe, pagina se reîncarcă și OpenAPI uită token-ul.
        // Îl citim din localStorage și îl punem la loc MANUAL înainte de a face cererea.
        const storedToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (storedToken) {
            OpenAPI.TOKEN = storedToken;
        }
        // ---------------------------

        const res = await BookingControllerService.mine();
        const backend = res ?? [];

        const islandCache = new Map<string, { name: string; price: number }>();
        const jetCache = new Map<string, { name: string; price: number }>();

        const mapped: UiBooking[] = await Promise.all(
          backend.map(async (b) => {
            const type = b.type;
            let itemName = `Item: ${b.itemId}`;
            let itemPrice = 0;

            try {
              if (type === "ISLAND") {
                if (!islandCache.has(b.itemId)) {
                  const island = await PublicIslandsControllerService.details1(b.itemId);
                  islandCache.set(b.itemId, {
                    name: island?.name ?? `Island ${b.itemId.slice(0, 6)}`,
                    price: island?.pricePerNight ?? 0,
                  });
                }
                const cached = islandCache.get(b.itemId)!;
                itemName = cached.name;
                itemPrice = cached.price; 
              } else {
                // JET
                if (!jetCache.has(b.itemId)) {
                  const jet = await PublicJetsControllerService.details(b.itemId);
                  const estimatedPrice = jet?.pricePerHour ? jet.pricePerHour * 3 : 5000; 
                  jetCache.set(b.itemId, {
                    name: jet?.model ?? `Jet ${b.itemId.slice(0, 6)}`,
                    price: estimatedPrice, 
                  });
                }
                const cached = jetCache.get(b.itemId)!;
                itemName = cached.name;
                itemPrice = cached.price;
              }
            } catch {
              // fallback
            }

            return {
              id: b.id,
              from: type === "ISLAND" ? "🏝️ Island" : "✈️ Jet",
              to: itemName,
              date: `${b.startDate} → ${b.endDate}`,
              source: type,
              status: b.status,
              backend: true,
              price: itemPrice > 0 ? itemPrice : undefined,
            };
          })
        );

        if (!cancelled) {
          setBookings(mapped);
          setError("");
        }
      } catch (e) {
        if (!cancelled) {
          setError(normalizeError(e));
          setBookings(
            localFallback.map((b) => ({
              id: b.id,
              from: b.from,
              to: b.to,
              date: b.date,
              source: "LOCAL",
              backend: false,
              price: 0, 
            }))
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [localFallback]);

  // Afișăm un mesaj frumos dacă plata a reușit
  const isSuccess = new URLSearchParams(location.search).get("success");

  // ... restul funcțiilor (handleRemoveBooking, canCancel) rămân la fel ...
  const canCancel = (status?: string) =>
    status !== "CANCELLED" && status !== "REJECTED" && status !== "CONFIRMED";

  const handleRemoveBooking = async (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    // Asigurăm token-ul și pentru ștergere
    const storedToken = localStorage.getItem("token");
    if (storedToken) OpenAPI.TOKEN = storedToken;

    if (!booking.backend) {
      const updatedLocal = localFallback.filter((b) => b.id !== id);
      localStorage.setItem("bookings", JSON.stringify(updatedLocal));
      setBookings((cur) => cur.filter((b) => b.id !== id));
      return;
    }

    if (!canCancel(String(booking.status))) return;

    const prev = bookings;
    setBookings((cur) =>
      cur.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b))
    );

    try {
      const updated = await BookingControllerService.cancel(id);
      setBookings((cur) =>
        cur.map((b) =>
          b.id === id ? { ...b, status: (updated as any)?.status ?? "CANCELLED" } : b
        )
      );
    } catch (e) {
      setBookings(prev);
      setError(normalizeError(e));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="booking-title">My Bookings ✈️</h1>

      {/* Mesaj de succes la întoarcerea de la Stripe */}
      {isSuccess && (
        <div style={{
            background: 'rgba(74, 222, 128, 0.15)', 
            border: '1px solid #4ade80', 
            color: '#4ade80', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: 'bold'
        }}>
            🎉 Plata a fost realizată cu succes! Rezervarea ta este confirmată.
        </div>
      )}

      {loading && <p style={{ opacity: 0.6 }}>Loading bookings...</p>}

      {!loading && error && bookings.length === 0 && (
        <p style={{ opacity: 0.7 }}>
          {error} {bookings.some((b) => !b.backend) ? "(showing local bookings)" : ""}
        </p>
      )}

      {!loading && bookings.length === 0 ? (
        <p style={{ opacity: 0.6 }}>You don’t have any bookings yet.</p>
      ) : (
        !loading && (
          <div className="booking-list">
            {bookings.map((b) => (
              <div key={b.id} className="booking-card booking-row">
                
                {/* --- STÂNGA: INFO --- */}
                <div>
                  <h3>
                    {b.from} → {b.to}
                  </h3>
                  <p>Date: {b.date}</p>

                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {b.status && (
                        <span className={`status-badge ${String(b.status).toLowerCase()}`} 
                              style={{ 
                                  padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #444',
                                  color: b.status === 'CONFIRMED' ? '#4ade80' : '#facc15' 
                              }}>
                          {String(b.status)}
                        </span>
                      )}
                      <span className={`booking-tag ${b.source.toLowerCase()}`}>
                        {b.source.toUpperCase()}
                      </span>
                  </div>
                </div>

                {/* --- DREAPTA: PREȚ + BUTOANE --- */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    
                    {/* Preț */}
                    {b.price && b.price > 0 && (
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                            €{b.price.toLocaleString()}
                        </span>
                    )}

                    <div style={{ display: 'flex', gap: '10px' }}>
                        
                        {/* Buton PLATĂ */}
                        {b.backend && b.status === 'PENDING' && (
                            <button 
                                onClick={() => handlePayment(b)}
                                disabled={processingId === b.id}
                                style={{
                                    background: 'linear-gradient(135deg, #d4af37 0%, #b4932a 100%)',
                                    border: 'none', borderRadius: '6px', padding: '6px 14px',
                                    color: '#000', fontWeight: 'bold', cursor: 'pointer',
                                    opacity: processingId === b.id ? 0.7 : 1
                                }}
                            >
                                {processingId === b.id ? "⏳..." : "💳 Pay"}
                            </button>
                        )}

                        {/* Buton DELETE */}
                        {(!b.backend || canCancel(String(b.status))) && (
                            <button 
                                className="remove-booking" 
                                onClick={() => handleRemoveBooking(b.id)}
                            >
                                ✖
                            </button>
                        )}
                    </div>
                </div>

              </div>
            ))}
          </div>
        )
      )}
    </motion.div>
  );
}