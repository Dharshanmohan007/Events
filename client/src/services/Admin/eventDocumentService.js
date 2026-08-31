import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

// ================= GET ALL DOCUMENT NAMES =================

export const getDocumentNames = async (active = null) => {
  try {
    const params = {};

    if (active !== null) {
      params.active = active;
    }

    const response = await axios.get(
      `${BASE_URL}/api/document-names`,
      {
        headers: getHeaders(),
        params,
      }
    );

    return response.data;
  } catch (error) {
    console.log(
      "Get Document Names Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ================= GET SINGLE DOCUMENT =================

export const getDocumentNameById = async (id) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/document-names/${id}`,
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.log(
      "Get Document Name Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ================= CREATE DOCUMENT =================

export const createDocumentName = async (data) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/document-names`,
      data,
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.log(
      "Create Document Name Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ================= UPDATE DOCUMENT =================

export const updateDocumentName = async (id, data) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/document-names/${id}`,
      data,
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.log(
      "Update Document Name Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ================= TOGGLE DOCUMENT STATUS =================

export const toggleDocumentNameStatus = async (id) => {
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/document-names/${id}/toggle-status`,
      {},
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.log(
      "Toggle Document Status Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ================= DELETE DOCUMENT =================

export const deleteDocumentName = async (id) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/document-names/${id}`,
      {
        headers: getHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.log(
      "Delete Document Name Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// ================= IMPORT DOCUMENTS =================

export const importDocumentNames = async (file) => {
  try {
    const formData = new FormData();

    formData.append("file", file);

    const response = await axios.post(
      `${BASE_URL}/api/document-names/import`,
      formData,
      {
        headers: {
          ...getHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(
      "Import Document Names Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};