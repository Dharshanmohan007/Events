import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Venue API
const VENUE_API = axios.create({
  baseURL: API_BASE,
});

// Calendar API
const CALENDAR_API = axios.create({
  baseURL: API_BASE,
});

// Attach JWT token to every request
const attachToken = (config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

VENUE_API.interceptors.request.use(attachToken);
CALENDAR_API.interceptors.request.use(attachToken);

// -------------------------
// GET /api/venues
// -------------------------
export async function fetchVenues() {
  const { data } = await VENUE_API.get("/api/venues");

  if (!Array.isArray(data)) return [];

  return data.map((item) => item.venue);
}

// -------------------------
// GET /api/calendar/events
// -------------------------
export async function fetchEvents({ venue, view, date }) {
  const { data } = await CALENDAR_API.get("/api/calendar/events", {
    params: {
      venue,
      view,
      date: date.toISOString(),
    },
  });

  return data?.events || [];
}

// ----------------------------------------
// GET /api/calendar/all-venues-events
// Single API call to fetch all venues and their events for a month
// Returns { venues: string[], eventsByVenue: { [venue]: Event[] } }
// ----------------------------------------
export async function fetchAllVenuesEvents({ date }) {
  const { data } = await CALENDAR_API.get("/api/calendar/all-venues-events", {
    params: {
      date: date.toISOString(),
    },
  });

  return {
    venues: data?.venues || [],
    eventsByVenue: data?.eventsByVenue || {},
  };
}