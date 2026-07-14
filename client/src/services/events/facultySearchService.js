import axios from "axios";

export const searchFaculty = async (query) => {
  try {
    if (!query.trim()) return [];

    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/faculty/search?q=${query}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data.data || [];
  } catch (error) {
    console.log(error);
    return [];
  }
};