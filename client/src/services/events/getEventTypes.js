import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getEventTypes = async () => {
  try {
    console.log("========== LOCAL STORAGE ==========");
    console.log(localStorage);

    const token = localStorage.getItem("token");

    console.log("Token:", token);

    const response = await axios.get(`${BASE_URL}/api/eventTypes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.log("Error Response:", error.response?.data);
    throw error;
  }
};