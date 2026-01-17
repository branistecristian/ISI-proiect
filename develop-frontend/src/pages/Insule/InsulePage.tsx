import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import dorna from "../../assets/drona.webp";
import insula from "../../assets/insul.jpeg";
import maldive from "../../assets/maldive2.webp";

import "./InsulePage.css";

import { PublicIslandsControllerService } from "../../api/generated/services/PublicIslandsControllerService";
import type { IslandResponse } from "../../api/generated/models/IslandResponse";

/* ======================================================
   PROPS
====================================================== */

interface Props {
  onSelectIsland: (island: IslandResponse) => void;
}

/* ======================================================
   INSULE LOCALE (fallback)
====================================================== */

const localIslands: IslandResponse[] = [
  {
    id: "local-1",
    name: "Seychelles",
    description:
      "Seychelles oferă un mix unic de plaje virgine cu nisip alb, ape turcoaz și păduri tropicale dense.",
    location: "Seychelles",
    pricePerNight: 1200,
    images: [dorna],
    amenities: ["Plajă privată", "Resort de lux", "Spa", "Piscină"],
    isAvailable: true,
  },
  {
    id: "local-2",
    name: "Bora Bora",
    description:
      "Bora Bora, perla Polineziei Franceze, impresionează prin lagunele albastre.",
    location: "Polinezia Franceză",
    pricePerNight: 1500,
    images: [insula],
    amenities: ["Bungalow pe apă", "Spa", "Iaht privat"],
    isAvailable: true,
  },
  {
    id: "local-3",
    name: "Maldive",
    description:
      "Maldive sunt un adevărat paradis tropical, cu vile private pe apă.",
    location: "Maldive",
    pricePerNight: 1800,
    images: [maldive],
    amenities: ["Vilă pe apă", "Spa", "Chef privat"],
    isAvailable: true,
  },
];

const filterLocalIslands = (query: string) => {
  if (!query) return localIslands;

  return localIslands.filter(
    (island) =>
      island.name.toLowerCase().includes(query.toLowerCase()) ||
      island.location.toLowerCase().includes(query.toLowerCase())
  );
};

/* ======================================================
   COMPONENTĂ
====================================================== */

export default function InsulePage({ onSelectIsland }: Props) {
  const [islands, setIslands] = useState<IslandResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* ================= FETCH INSULE ================= */

  useEffect(() => {
    setLoading(true);

    PublicIslandsControllerService.list1(
      search || undefined,
      undefined,
      undefined,
      undefined,
      true
    )
      .then((data) => {
        if (data && data.length > 0) {
          setIslands(data);
        } else {
          setIslands(filterLocalIslands(search));
        }
      })
      .catch(() => {
        setIslands(filterLocalIslands(search));
      })
      .finally(() => setLoading(false));
  }, [search]);

  /* ================= RENDER ================= */

  return (
    <>
      <motion.div
        className="page-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="title">Insule Exclusive 🏝️</h1>

        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Caută insula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
        </div>

        {loading && <p className="loading">Se încarcă insulele...</p>}

        {!loading && (
          <div className="island-grid">
            {islands.map((island) => (
              <motion.div
                key={island.id}
                className="island-card"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={island.images?.[0] ?? insula}
                  alt={island.name}
                  className="island-image"
                />

                <h2>{island.name}</h2>
                <p>{island.description}</p>

                <p className="price">
                  💰 {island.pricePerNight} € / noapte
                </p>

                <button
                  className="reserve-button"
                  onClick={() => onSelectIsland(island)}
                >
                  Rezervă acum
                </button>
              </motion.div>
            ))}

            {islands.length === 0 && (
              <p className="no-results">Nicio insulă găsită.</p>
            )}
          </div>
        )}
      </motion.div>
    </>
  );
}
