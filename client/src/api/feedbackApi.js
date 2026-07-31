// src/api/feedbackApi.js
// Small module for fetching department (Events) feedback and mapping it to
// the row shape consumed by <FeedbackRatings />.

import { useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL

// ── Rating helper ────────────────────────────────────────────────────────
// Clamp a rating into the supported 1–5 range. Missing/invalid values fall
// back to the component's historical default (5 filled stars).
export const clampRating = (rating) => {
  if (rating === null || rating === undefined || rating === '') return 5
  const num = Number(rating)
  if (!Number.isFinite(num)) return 5
  return Math.min(5, Math.max(1, Math.round(num)))
}

// ── Relative time helper ─────────────────────────────────────────────────
// "Just now", "2h ago", "3d ago", ... derived from an ISO timestamp.
export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

// ── Row mapping ──────────────────────────────────────────────────────────
// Maps one raw feedback API row to the row shape <FeedbackRatings /> uses.
// The sample response has no organizer-name field, so we fall back to
// eventName when an organizer name isn't present (without inventing data).
export const mapFeedbackRow = (item = {}) => {
  const organizerName =
    item.organizerName || item.organizer || item.organizer_name
  const name = organizerName || item.eventName || 'Event Organizer'
  return {
    name,
    department: item.organizingDepartment || item.department || '-',
    quote: item.feedback || '',
    time: formatRelativeTime(item.submittedAt),
    rating: clampRating(item.rating),
  }
}

// ── Fetch Events feedback for a department ───────────────────────────────
// Returns mapped rows; returns [] on failure/empty so dashboards keep their
// existing empty/no-feedback state.
export const fetchDepartmentFeedback = async (department) => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(
      `${API_BASE}/api/feedback/department/${department}/feedbacks`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
    if (!res.ok) return []
    const json = await res.json()
    const data = json.data ?? json.results ?? []
    return Array.isArray(data) ? data.map(mapFeedbackRow) : []
  } catch (err) {
    console.warn(`Failed to fetch ${department} feedback:`, err)
    return []
  }
}

// ── Hook: fetch Events feedback when the dashboard loads ─────────────────
export const useDepartmentFeedback = (department) => {
  const [rows, setRows] = useState([])
  useEffect(() => {
    let isMounted = true
    fetchDepartmentFeedback(department).then((mapped) => {
      if (isMounted) setRows(mapped)
    })
    return () => {
      isMounted = false
    }
  }, [department])
  return rows
}
