// src/api/feedbackApi.js
// Small module for fetching department (Events) feedback and mapping it to
// the row shape consumed by <FeedbackRatings />.

import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ── Rating helper ────────────────────────────────────────────────────────
// Clamp a rating into the supported 1–5 range. Missing/invalid values fall
// back to the component's historical default (5 filled stars).
export const clampRating = (rating) => {
  if (rating === null || rating === undefined || rating === "") return 5;
  const num = Number(rating);
  if (!Number.isFinite(num)) return 5;
  return Math.min(5, Math.max(1, Math.round(num)));
};

// ── Relative time helper ─────────────────────────────────────────────────
// "Just now", "2h ago", "3d ago", ... derived from an ISO timestamp.
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

// ── Row mapping ──────────────────────────────────────────────────────────
// Maps one raw feedback API row to the row shape <FeedbackRatings /> uses.
// The sample response has no organizer-name field, so we fall back to
// eventName when an organizer name isn't present (without inventing data).
// Individual feedback rows may carry the employee name instead, so those
// fields are also considered.
export const mapFeedbackRow = (item = {}) => {
  const organizerName =
    item.organizerName || item.organizer || item.organizer_name;
  const name =
    organizerName ||
    item.employeeName ||
    item.employee?.name ||
    item.employeeDetail?.name ||
    item.name ||
    item.eventName ||
    "Event Organizer";
  return {
    name,
    department:
      item.organizingDepartment ||
      item.department ||
      item.employee?.department ||
      item.employeeDetail?.department ||
      "-",
    quote: item.feedback || "",
    time: formatRelativeTime(item.submittedAt || item.createdAt),
    rating: clampRating(item.rating),
  };
};

// ── Fetch Events feedback for a department ───────────────────────────────
// Returns mapped rows; returns [] on failure/empty so dashboards keep their
// existing empty/no-feedback state.
export const fetchDepartmentFeedback = async (department) => {
  try {
    const token = localStorage.getItem("token");
    const decoded = jwtDecode(token);
    const email = decoded.email;
    const res = await fetch(
      `${API_BASE}/api/feedback/department/${department}/feedbacks?email=${email}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data ?? json.results ?? [];
    return Array.isArray(data) ? data.map(mapFeedbackRow) : [];
  } catch (err) {
    console.warn(`Failed to fetch ${department} feedback:`, err);
    return [];
  }
};

// ── Hook: fetch Events feedback when the dashboard loads ─────────────────
export const useDepartmentFeedback = (department) => {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    let isMounted = true;
    fetchDepartmentFeedback(department).then((mapped) => {
      if (isMounted) setRows(mapped);
    });
    return () => {
      isMounted = false;
    };
  }, [department]);
  return rows;
};

// ── Fetch Individual feedback (scoped by the logged-in token) ─────────────
// GET /api/feedback/individual returns the individual-module feedback for
// the authenticated user. Returns mapped rows; [] on failure/empty so the
// dashboards keep their existing empty/no-feedback state.
export const fetchIndividualFeedback = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/feedback/individual`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data ?? json.results ?? [];
    return Array.isArray(data) ? data.map(mapFeedbackRow) : [];
  } catch (err) {
    console.warn("Failed to fetch individual feedback:", err);
    return [];
  }
};

// ── Hook: fetch Individual feedback when the dashboard loads ─────────────
export const useIndividualFeedback = () => {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    let isMounted = true;
    fetchIndividualFeedback().then((mapped) => {
      if (isMounted) setRows(mapped);
    });
    return () => {
      isMounted = false;
    };
  }, []);
  return rows;
};
