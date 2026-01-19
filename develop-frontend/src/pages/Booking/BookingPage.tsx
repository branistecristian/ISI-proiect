import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom"; 
import "./BookingPage.css";

import { getLocalBookings, type LocalBooking } from "../../utils/booking";

// Importurile generate automat
import { BookingControllerService } from "../../api/generated/services/BookingControllerService";
import type { BookingResponse } from "../../api/generated/models/BookingResponse";
import { PublicIslandsControllerService } from "../../api/generated/services/PublicIslandsControllerService";
import { PublicJetsControllerService } from "../../api/generated/services/PublicJetsControllerService";
import { OpenAPI } from "../../api/generated/core/OpenAPI"; 

// Definim tipul UI extins
type UiBooking = {
  id: string;
  from: string;
  to: string;
  date: string;
  source: "ISLAND" | "JET" | "LOCAL";
  // Adăugăm '| string' pentru că 'PAID' nu e încă în enum-ul generat de frontend
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

  // Hook-uri pentru URL și Navigare
  const location = useLocation();
  const navigate = useNavigate();

  const localFallback: LocalBooking[] = useMemo(() => getLocalBookings(), []);

  // --- 1. LOGICA DE PLATĂ (Trimite spre Stripe) ---
  const handlePayment = async (booking: UiBooking) => {
    if (!booking.price) return;
    setProcessingId(booking.id);

    try {
      console.log(`Inițiere plată Stripe pentru: ${booking.id}`);

      // Recuperăm token-ul
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken"); 

      if (!token) {
        alert("Eroare: Nu ești autentificat (Token lipsă).");
        return;
      }

      // Asigurăm token-ul în OpenAPI
      OpenAPI.TOKEN = token;

      // Apelăm endpoint-ul creat de noi în PaymentController
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

  // --- 2. ÎNCĂRCARE DATE + PROCESARE SUCCES STRIPE ---
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        // A. Restaurare Token (Critic după redirect)
        const storedToken = localStorage.getItem("token") || localStorage.getItem("accessToken");
        if (storedToken) {
            OpenAPI.TOKEN = storedToken;
        }

        // B. Verificăm dacă ne-am întors de la Stripe cu SUCCES
        const params = new URLSearchParams(location.search);
        const success = params.get("success");
        const paidBookingId = params.get("bookingId");

        if (success === "true" && paidBookingId && storedToken) {
            try {
                // Apelăm backend-ul să marcheze "PAID"
                const confirmRes = await fetch(`http://localhost:8080/api/payments/${paidBookingId}/success`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${storedToken}` }
                });
                
                if (confirmRes.ok) {
                   // Curățăm URL-ul (scoatem ?success=true) fără refresh
                   navigate("/booking", { replace: true });
                   // Opțional: alert("Plată confirmată! Status: PAID");
                }
            } catch (err) {
                console.error("Eroare la confirmarea plății pe backend", err);
            }
        }

        // C. Încărcăm lista de rezervări (care acum ar trebui să fie actualizată)
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
                // Calculăm prețul total estimat pentru UI
                // Backend-ul calculează exact la plată, aici e doar vizual
                const start = new Date(b.startDate);
                const end = new Date(b.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                itemPrice = cached.price * diffDays; 
              } else {
                // JET
                if (!jetCache.has(b.itemId)) {
                  const jet = await PublicJetsControllerService.details(b.itemId);
                  // Estimare simplă: 3 ore * preț orar
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
  }, [localFallback, location.search, navigate]);

  // Funcție helper pentru a decide dacă putem anula
  const canCancel = (status?: string) => {
      // Nu poți anula dacă e PAID sau CONFIRMED (doar PENDING)
      if (status === 'PAID' || status === 'CONFIRMED' || status === 'CANCELLED' || status === 'REJECTED') {
          return false;
      }
      return true;
  };

  const handleRemoveBooking = async (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;

    // Asigurăm token
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
    // Optimistic Update
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
      setBookings(prev); // Rollback la eroare
      setError(normalizeError(e));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="booking-title">My Bookings ✈️</h1>

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
                        <span className={`status-badge`} 
                              style={{ 
                                  padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid #444',
                                  // LOGICA DE CULORI
                                  color: b.status === 'CONFIRMED' ? '#4ade80' : 
                                         b.status === 'PAID' ? '#60a5fa' : // Albastru deschis
                                         '#facc15', // Galben
                                  borderColor: b.status === 'CONFIRMED' ? '#4ade80' : 
                                               b.status === 'PAID' ? '#60a5fa' : 
                                               '#facc15'
                              }}>
                          {b.status === 'PAID' ? 'WAITING APPROVAL' : String(b.status)}
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
                        
                        {/* 1. Buton PLATĂ: Doar dacă e PENDING */}
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

                        {/* 2. Text informativ dacă e PAID */}
                        {b.status === 'PAID' && (
                             <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem', padding: '6px 0' }}>
                                 ⏳ Processing...
                             </span>
                        )}

                        {/* 3. Buton DELETE: Doar dacă NU e PAID sau CONFIRMED */}
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