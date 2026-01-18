import "./IslandDetailsPage.css";
import fallbackImg from "../../assets/insul.jpeg";
import { useEffect, useMemo, useState } from "react";

import { Booking } from "../../api/generated/models/Booking";
import { PublicIslandsControllerService } from "../../api/generated/services/PublicIslandsControllerService";
import { BookingControllerService } from "../../api/generated/services/BookingControllerService";
import { UserControllerService } from "../../api/generated/services/UserControllerService";

import type { IslandResponse } from "../../api/generated/models/IslandResponse";
import IslandMap from "./IslandMap";

interface Props {
  island: IslandResponse;
  onConfirmBooking: () => void;
  onBack: () => void;
}

export default function IslandDetailsPage({ island, onConfirmBooking, onBack }: Props) {
  /* ================= STATE ================= */

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [occupiedDates, setOccupiedDates] = useState<string[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // ✅ Favorites
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  /* ================= DERIVED ================= */

  const isValid =
    checkIn !== "" &&
    checkOut !== "" &&
    new Date(checkOut) > new Date(checkIn);

  const hasConflict = occupiedDates.length > 0;

  const nights = isValid
    ? Math.max(
        0,
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const totalPrice = nights * island.pricePerNight;

  /* ================= FAVORITES HELPERS (fallback local) ================= */

  const favKey = "favoriteIslands";
  const localFavs: string[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(favKey) || "[]");
    } catch {
      return [];
    }
  }, []);

  const setLocalFav = (next: boolean) => {
    try {
      const current: string[] = JSON.parse(localStorage.getItem(favKey) || "[]");
      const set = new Set(current);

      if (next) set.add(String(island.id));
      else set.delete(String(island.id));

      localStorage.setItem(favKey, JSON.stringify(Array.from(set)));
    } catch {
      // ignore
    }
  };

  const extractFavIslandIds = (me: any): string[] => {
    const candidates = [
      me?.favoriteIslandIds,          // string[]
      me?.favIslandIds,               // string[]
      me?.favorites?.islands,         // string[] or {id}[]
      me?.favoriteIslands,            // string[] or {id}[]
      me?.favIslands,                 // string[] or {id}[]
    ];

    for (const c of candidates) {
      if (!c) continue;

      // array of ids (string/number)
      if (Array.isArray(c) && (typeof c[0] === "string" || typeof c[0] === "number")) {
        return c.map((x: any) => String(x));
      }

      // array of objects with id
      if (Array.isArray(c) && typeof c[0] === "object") {
        return c.map((x: any) => String(x?.id)).filter(Boolean);
      }
    }

    return [];
  };

  useEffect(() => {
    let cancelled = false;

    const loadFav = async () => {
      // ✅ immediate local fallback
      setIsFavorite(localFavs.includes(String(island.id)));

      try {
        const me = await UserControllerService.me();
        const ids = extractFavIslandIds(me);

        if (!cancelled && ids.length > 0) {
          setIsFavorite(ids.includes(String(island.id)));
          // optional: sync local cache from backend truth
          localStorage.setItem(favKey, JSON.stringify(ids));
        }
      } catch {
        // keep local fallback
      }
    };

    loadFav();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [island.id]);

  /* ================= TOGGLE FAVORITE ================= */

  const handleToggleFavorite = async () => {
  if (loadingFav) return;

  const next = !isFavorite;

  // optimistic UI
  setIsFavorite(next);
  setLocalFav(next);

  setLoadingFav(true);
  try {
    const me = next
      ? await UserControllerService.addFavIsland(String(island.id))
      : await UserControllerService.removeFavIsland(String(island.id));

    const ids = extractFavIslandIds(me);
    if (ids.length > 0) {
      localStorage.setItem(favKey, JSON.stringify(ids));
      setIsFavorite(ids.includes(String(island.id)));
    }
  } catch {
    // rollback on error
    setIsFavorite(!next);
    setLocalFav(!next);
    console.warn("Favorite update failed");
  } finally {
    setLoadingFav(false);
  }
};

  /* ================= AVAILABILITY ================= */

  useEffect(() => {
    if (!isValid) return;

    setCheckingAvailability(true);

    PublicIslandsControllerService.availability(island.id, checkIn, checkOut)
      .then((res) => {
        setOccupiedDates(res.occupiedDates || []);
      })
      .catch(() => {
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

    const existing = JSON.parse(localStorage.getItem("bookings") || "[]");

    localStorage.setItem("bookings", JSON.stringify([bookingForUI, ...existing]));

    try {
      await BookingControllerService.create({
        type: Booking.type.ISLAND,
        islandId: island.id,
        startDate: checkIn,
        endDate: checkOut,
      });
    } catch {
      console.warn("Backend booking failed, using local booking only");
    }

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

          {/* ✅ Favorite button */}
          <button
            className={`fav-btn ${isFavorite ? "active" : ""}`}
            onClick={handleToggleFavorite}
            disabled={loadingFav}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? "♥ Remove Favorite" : "♡ Add Favorite"}
          </button>

          <h1>{island.name}</h1>
          <p className="location">{island.location}</p>
        </div>
      </div>

      <div className="island-details-card">
        <p className="description">{island.description}</p>

        <IslandMap location={island.location} name={island.name} />

        <div className="price-row">
          <span>Preț / noapte</span>
          <strong>{island.pricePerNight} €</strong>
        </div>

        <div className="calendar-section">
          <h3>Alege perioada</h3>

          <div className="date-grid">
            <div className="date-input">
              <label>Check-in</label>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>

            <div className="date-input">
              <label>Check-out</label>
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
          </div>

          {checkingAvailability && <p className="info">Verificăm disponibilitatea...</p>}

          {hasConflict && <p className="date-warning">Perioada selectată nu este disponibilă</p>}

          {nights > 0 && !hasConflict && (
            <div className="price-summary">
              <p>
                {nights} nopți × {island.pricePerNight} €
              </p>
              <h2>Total: {totalPrice.toLocaleString()} €</h2>
            </div>
          )}

          {isValid && !hasConflict && (
            <button className="reserve-luxury-btn" onClick={handleReserve}>
              Rezervă acum
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
