import axios from "axios";

export const getFacultyById = async (facultyId) => {
  try {
    console.log("Calling Faculty API with ID:", facultyId);

    const token = localStorage.getItem("token");

    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/faculty/${facultyId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Faculty API Response:", response.data);

    return response.data;
  } catch (error) {
    console.log("Faculty API Error:", error.response?.data);
    throw error;
  }
};