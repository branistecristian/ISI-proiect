export type BookingSource = "map" | "island" | "jet";

export type LocalBooking = {
  id: string;
  from: string;
  to: string;
  date: string; // text display
  source: BookingSource;

  // optional extra info
  meta?: Record<string, any>;
};

export function addLocalBooking(b: LocalBooking) {
  const existing: LocalBooking[] = JSON.parse(localStorage.getItem("bookings") || "[]");
  localStorage.setItem("bookings", JSON.stringify([b, ...existing]));
}

export function getLocalBookings(): LocalBooking[] {
  return JSON.parse(localStorage.getItem("bookings") || "[]");
}
