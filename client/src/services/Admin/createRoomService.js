import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createRoom = async (roomData) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${BASE_URL}/api/accommodation/rooms`,
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
      "Create Room Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};