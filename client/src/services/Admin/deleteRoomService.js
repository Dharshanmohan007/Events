import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const deleteRoom = async (roomId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.delete(
      `${BASE_URL}/api/accommodation/rooms/${roomId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Delete Room Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};