import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const VENUE_AVAILABILITY_API = axios.create({
  baseURL: API_BASE,
});

const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

VENUE_AVAILABILITY_API.interceptors.request.use(attachToken);

/**
 * Dedicated API call for Venue Availability schedule
 * GET /api/venues/availability-schedule
 */
export async function fetchVenueAvailabilitySchedule({ venue, startDate, endDate }) {
  const { data } = await VENUE_AVAILABILITY_API.get("/api/venues/availability-schedule", {
    params: {
      venue,
      startDate: startDate instanceof Date ? startDate.toISOString() : startDate,
      endDate: endDate instanceof Date ? endDate.toISOString() : endDate,
    },
  });

  return data?.events || [];
}
