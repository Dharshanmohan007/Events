import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getEventTypes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/eventTypes`, getHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching event types:", error.response?.data || error.message);
    throw error;
  }
};

export const createEventType = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/eventTypes/`, data, getHeaders());
    return response.data;
  } catch (error) {
    console.error("Error creating event type:", error.response?.data || error.message);
    throw error;
  }
};

export const updateEventType = async (id, data) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/eventTypes/${id}`, data, getHeaders());
    return response.data;
  } catch (error) {
    console.error("Error updating event type:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteEventType = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/eventTypes/${id}`, getHeaders());
    return response.data;
  } catch (error) {
    console.error("Error deleting event type:", error.response?.data || error.message);
    throw error;
  }
};
