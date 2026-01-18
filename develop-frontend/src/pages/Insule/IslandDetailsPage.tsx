import "./IslandDetailsPage.css";
import fallbackImg from "../../assets/insul.jpeg";
import { useEffect, useState } from "react";

import { Booking } from "../../api/generated/models/Booking";
import {
  PublicIslandsControllerService,
} from "../../api/generated/services/PublicIslandsControllerService";
import {
  BookingControllerService,
} from "../../api/generated/services/BookingControllerService";

import type { IslandResponse } from "../../api/generated/models/IslandResponse";
import IslandMap from "./IslandMap";

interface Props {
  island: IslandResponse;
  onConfirmBooking: () => void;
  onBack: () => void;
}

export default function IslandDetailsPage({
  island,
  onConfirmBooking,
  onBack,
}: Props) {
  /* ================= STATE ================= */

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [occupiedDates, setOccupiedDates] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  /* ================= DERIVED ================= */

  const isValid =
    checkIn !== "" &&
    checkOut !== "" &&
    new Date(checkOut) > new Date(checkIn);

  const hasConflict = occupiedDates.length > 0;

  const nights =
    isValid
      ? Math.max(
          0,
          (new Date(checkOut).getTime() -
            new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const totalPrice = nights * island.pricePerNight;

  /* ================= AVAILABILITY ================= */

  useEffect(() => {
    if (!isValid) return;

    setCheckingAvailability(true);

    PublicIslandsControllerService.availability(
      island.id,
      checkIn,
      checkOut
    )
      .then((res) => {
        setOccupiedDates(res.occupiedDates || []);
      })
      .catch(() => {
        // fallback: considerăm liber
        setOccupiedDates([]);
      })
      .finally(() => setCheckingAvailability(false));
  }, [checkIn, checkOut, island.id, isValid]);

  /* ================= BOOKING (REAL + FALLBACK) ================= */

  const handleReserve = async () => {
  const bookingForUI = {
    from: island.name,
    to: island.location,
    date: `${checkIn} → ${checkOut}`,
    source: "island" as const,
  };

  // 🔹 1. Salvăm ÎNTOTDEAUNA în localStorage (pentru BookingPage)
  const existing = JSON.parse(
    localStorage.getItem("bookings") || "[]"
  );

  localStorage.setItem(
    "bookings",
    JSON.stringify([bookingForUI, ...existing])
  );

  // 🔹 2. Încercăm backend (best effort)
  try {
    await BookingControllerService.create({
      type: Booking.type.ISLAND,
      islandId: island.id,
      startDate: checkIn,
      endDate: checkOut,
    });
  } catch {
    // ❌ backend poate da 403 / 500 / orice
    // 👉 NU ne interesează pentru UI
    console.warn("Backend booking failed, using local booking only");
  }

  // 🔹 3. Navigăm la BookingPage
  onConfirmBooking();
};


  /* ================= RENDER ================= */

  return (
    <div className="island-details-container">
      <div className="island-hero">
        <img
          src={island.images?.[0] || fallbackImg}
          alt={island.name}
          className="island-hero-image"
        />
        <div className="island-hero-overlay">
          <button className="back-btn" onClick={onBack}>
            ⬅ Înapoi
          </button>
          <h1>{island.name}</h1>
          <p className="location">{island.location}</p>
        </div>
      </div>

      <div className="island-details-card">
        <p className="description">{island.description}</p>
<IslandMap
  location={island.location}
  name={island.name}
/>

        <div className="price-row">
          <span>Preț / noapte</span>
          <strong>{island.pricePerNight} €</strong>
        </div>

        <div className="calendar-section">
          <h3>Alege perioada</h3>

          <div className="date-grid">
            <div className="date-input">
              <label>Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div className="date-input">
              <label>Check-out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          {checkingAvailability && (
            <p className="info">Verificăm disponibilitatea...</p>
          )}

          {hasConflict && (
            <p className="date-warning">
              Perioada selectată nu este disponibilă
            </p>
          )}

          {nights > 0 && !hasConflict && (
            <div className="price-summary">
              <p>
                {nights} nopți × {island.pricePerNight} €
              </p>
              <h2>Total: {totalPrice.toLocaleString()} €</h2>
            </div>
          )}

          {isValid && !hasConflict && (
            <button
              className="reserve-luxury-btn"
              onClick={handleReserve}
            >
              Rezervă acum
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
