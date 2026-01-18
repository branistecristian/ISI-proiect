import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import "./BookingPage.css";

import { getLocalBookings, type LocalBooking } from "../../utils/booking";
import { BookingControllerService } from "../../api/generated/services/BookingControllerService";
import type { BookingResponse } from "../../api/generated/models/BookingResponse";

type UiBooking = {
  id: string;
  from: string;
  to: string;
  date: string;
  source: "ISLAND" | "JET" | "LOCAL";
  status?: BookingResponse.status | string;
  backend: boolean;
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

  const localFallback: LocalBooking[] = useMemo(() => getLocalBookings(), []);

  const mapBackendBooking = (b: BookingResponse): UiBooking => {
    // Since backend doesn't return island/jet details, we show the ID for now
    const type = b.type; // "ISLAND" | "JET"

    return {
      id: b.id,
      from: type === "ISLAND" ? "🏝️ Island" : "✈️ Jet",
      to: `Item: ${b.itemId}`,
      date: `${b.startDate} → ${b.endDate}`,
      source: type,
      status: b.status,
      backend: true,
    };
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await BookingControllerService.mine();
        const mapped = (res ?? []).map(mapBackendBooking);

        if (!cancelled) {
          setBookings(mapped);
          setError("");
        }
      } catch (e) {
        // fallback local
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

  const canCancel = (status?: string) =>
  status !== "CANCELLED" && status !== "REJECTED";

  const handleRemoveBooking = async (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (!booking) return;
    if (booking.backend && !canCancel(String(booking.status))) {
      return;
    }

    const prev = bookings;

    // optimistic remove
    setBookings((cur) => cur.filter((b) => b.id !== id));

    // if local-only booking -> remove from localStorage
    if (!booking?.backend) {
      const updatedLocal = localFallback.filter((b) => b.id !== id);
      localStorage.setItem("bookings", JSON.stringify(updatedLocal));
      return;
    }

    // backend cancel
    try {
      await BookingControllerService.cancel(id);
    } catch (e) {
      setBookings(prev); // rollback
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
                <div>
                  <h3>
                    {b.from} → {b.to}
                  </h3>

                  <p>Date: {b.date}</p>

                  {b.status && (
                    <p>
                      Status: <strong>{b.status}</strong>
                    </p>
                  )}

                  <span className={`booking-tag ${b.source.toLowerCase()}`}>
                    {b.source.toUpperCase()}
                  </span>
                </div>

                {(!b.backend || canCancel(String(b.status))) && (
                  <button className="remove-booking" onClick={() => handleRemoveBooking(b.id)}>
                    ✖
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </motion.div>
  );
}
