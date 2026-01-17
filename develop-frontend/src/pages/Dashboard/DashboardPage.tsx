import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./DashboardPage.css";

interface Booking {
  from: string;
  to: string;
  date: string;
  source: "island" | "jet" | "map";
}

/* ================= DEMO DATA ================= */

const MOCK_BOOKINGS: Booking[] = [
  { from: "Paris", to: "Maldive", date: "2025-01-10", source: "island" },
  { from: "London", to: "Maldive", date: "2025-01-12", source: "island" },
  { from: "Rome", to: "Bora Bora", date: "2025-01-15", source: "island" },
  { from: "Dubai", to: "Seychelles", date: "2025-01-18", source: "island" },

  { from: "Paris", to: "Gulfstream G700", date: "2025-01-20", source: "jet" },
  { from: "Berlin", to: "Gulfstream G700", date: "2025-01-21", source: "jet" },
  { from: "Madrid", to: "Bombardier Global 8000", date: "2025-01-22", source: "jet" },
  { from: "Zurich", to: "Dassault Falcon 10X", date: "2025-01-23", source: "jet" },
];

/* ================= COMPONENT ================= */

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("bookings");
    if (saved && JSON.parse(saved).length > 0) {
      setBookings(JSON.parse(saved));
    } else {
      setBookings(MOCK_BOOKINGS);
    }
  }, []);

  /* ================= AGGREGATIONS ================= */

  const countByTo = (source: "island" | "jet") => {
    const map: Record<string, number> = {};
    bookings
      .filter((b) => b.source === source)
      .forEach((b) => {
        map[b.to] = (map[b.to] || 0) + 1;
      });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const islandData = countByTo("island");
  const jetData = countByTo("jet");

  const distribution = [
    { name: "Islands", value: bookings.filter(b => b.source === "island").length },
    { name: "Private Jets", value: bookings.filter(b => b.source === "jet").length },
  ];

  const totalRevenue =
    bookings.filter(b => b.source === "island").length * 1400 +
    bookings.filter(b => b.source === "jet").length * 18000;

  const COLORS = ["#d4af37", "#6a6af5"];

  /* ================= RENDER ================= */

  return (
    <div className="dashboard">

      <h1 className="dashboard-title">Luxury Platform Insights</h1>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <KPI title="Total Bookings" value={bookings.length} />
        <KPI title="Island Reservations" value={distribution[0].value} />
        <KPI title="Jet Reservations" value={distribution[1].value} />
        <KPI title="Estimated Revenue" value={`€ ${totalRevenue.toLocaleString()}`} />
      </div>

      {/* CHARTS */}
      <div className="charts-grid">

        <div className="chart-card">
          <h3>Top Island Destinations</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={islandData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#d4af37" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Most Requested Private Jets</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={jetData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6a6af5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Bookings Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={distribution} dataKey="value" innerRadius={50} outerRadius={80}>
                {distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            {bookings.slice(-5).reverse().map((b, i) => (
              <li key={i}>
                <strong>{b.from}</strong> → {b.to}
                <span>{b.source.toUpperCase()}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
    
  );
}

/* ================= SMALL COMPONENT ================= */

function KPI({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="kpi-card">
      <span className="kpi-title">{title}</span>
      <strong className="kpi-value">{value}</strong>
    </div>
  );
}
