import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getEventTypes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/eventTypes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching event types:", error);
    throw error;
  }
};