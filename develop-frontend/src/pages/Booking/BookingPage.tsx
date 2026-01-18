import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./BookingPage.css";
import { getLocalBookings, type LocalBooking } from "../../utils/booking";

export default function BookingPage() {
  const [bookings, setBookings] = useState<LocalBooking[]>([]);

  useEffect(() => {
    setBookings(getLocalBookings());
  }, []);

  const handleRemoveBooking = (id: string) => {
    const updated = bookings.filter((b) => b.id !== id);
    setBookings(updated);
    localStorage.setItem("bookings", JSON.stringify(updated));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="booking-title">My Bookings ✈️</h1>

      {bookings.length === 0 ? (
        <p style={{ opacity: 0.6 }}>You don’t have any bookings yet.</p>
      ) : (
        <div className="booking-list">
          {bookings.map((b) => (
            <div key={b.id} className="booking-card booking-row">
              <div>
                <h3>
                  {b.from} → {b.to}
                </h3>
                <p>Date: {b.date}</p>

                {b.meta?.totalPrice != null && (
                  <p>
                    Total: <strong>{Number(b.meta.totalPrice).toLocaleString()} €</strong>
                  </p>
                )}

                {b.meta?.hours != null && (
                  <p>
                    Flight time: <strong>{Number(b.meta.hours).toFixed(1)} h</strong>
                  </p>
                )}

                {b.meta?.distanceKm != null && (
                  <p>
                    Distance: <strong>{Number(b.meta.distanceKm).toFixed(0)} km</strong>
                  </p>
                )}

                <span className={`booking-tag ${b.source}`}>{b.source.toUpperCase()}</span>
              </div>

              <button className="remove-booking" onClick={() => handleRemoveBooking(b.id)}>
                ✖
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
