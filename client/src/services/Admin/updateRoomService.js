import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const updateRoom = async (roomId, roomData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.put(
      `${BASE_URL}/api/accommodation/rooms/${roomId}`,
      roomData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Update Room Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};