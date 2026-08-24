import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getRooms = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${BASE_URL}/api/accommodation/rooms`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Get Rooms Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};