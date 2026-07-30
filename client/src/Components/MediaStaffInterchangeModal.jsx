import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Search, UserRoundCog, Loader2, RefreshCw } from 'lucide-react'
import { showSuccessToast, showErrorToast } from './CustomToast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ── Normalize a single typeOfMedia entry ───────────────────────────────
const normalizeMediaType = (type) => {
  if (type === 'poster and video') return ['poster', 'video']
  if (type === 'poster') return ['poster']
  if (type === 'video') return ['video']
  return []
}

// ── Derive available media types from event.media ────────────────────────
const deriveAvailableMediaTypes = (media = []) => [
  ...new Set(
    media.flatMap((item) => (item.typeOfMedia || []).flatMap(normalizeMediaType))
  ),
]

// ── Normalize faculty API response ──────────────────────────────────────
const normalizeFacultyOptions = (payload) => {
  // Support: payload.data, payload.users, payload.faculties, payload.heads, or payload itself
  const rawList = Array.isArray(payload)
    ? payload
    : payload?.data ?? payload?.users ?? payload?.faculties ?? payload?.heads ?? []

  if (!Array.isArray(rawList)) return []

  const seen = new Set()
  const result = []

  for (const item of rawList) {
    const name = item?.name ?? item?.fullName ?? item?.facultyName ?? ''
    const email = item?.email ?? item?.emailId ?? ''

    if (name && email && !seen.has(email)) {
      seen.add(email)
      result.push({ name, email })
    }
  }

  return result
}

// ── Validation helper ───────────────────────────────────────────────────

const useValidation = (selectedFaculty, reason) => {
  const [touched, setTouched] = useState({ faculty: false, reason: false })

  const facultyError =
    touched.faculty && !selectedFaculty
      ? 'Please select a faculty member.'
      : ''
  const reasonError =
    touched.reason && !reason.trim()
      ? 'Please enter a reason for the interchange.'
      : ''

  const touch = useCallback((field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  const reset = useCallback(() => {
    setTouched({ faculty: false, reason: false })
  }, [])

  return { facultyError, reasonError, touch, reset }
}

// ── Fetch faculty options helper ────────────────────────────────────────

const fetchFacultyOptions = async (mediaType, signal) => {
  if (mediaType !== 'poster' && mediaType !== 'video') {
    return { data: [], error: '' }
  }

  const endpoint =
    mediaType === 'poster'
      ? `${API_BASE_URL}/api/individual-submissions/poster-head`
      : `${API_BASE_URL}/api/individual-submissions/video-head`

  const token = localStorage.getItem('token')
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(endpoint, { headers })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}))
    throw new Error(errorBody?.message || 'Failed to load faculty list')
  }

  const json = await res.json()
  const normalized = normalizeFacultyOptions(json)
  return { data: normalized, error: '' }
}

// ── MediaStaffInterchangeModal ──────────────────────────────────────────

const MediaStaffInterchangeModal = ({ event, mediaType: initialMediaType, onClose, onSuccess, isIndividualInterchange = false, title: customTitle }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Faculty API states
  const [facultyOptions, setFacultyOptions] = useState([])
  const [facultyLoading, setFacultyLoading] = useState(false)
  const [facultyError, setFacultyError] = useState('')

  // Media type selection
  const availableMediaTypes = deriveAvailableMediaTypes(event?.media)
  const hasBoth = availableMediaTypes.includes('poster') && availableMediaTypes.includes('video')
  const hasOnlyPoster = availableMediaTypes.includes('poster') && !availableMediaTypes.includes('video')
  const hasOnlyVideo = availableMediaTypes.includes('video') && !availableMediaTypes.includes('poster')
  const hasNoTypes = availableMediaTypes.length === 0

  // Determine effective media type: from props for single-type, state for mixed
  const [selectedMediaType, setSelectedMediaType] = useState(() => {
    if (hasOnlyPoster) return 'poster'
    if (hasOnlyVideo) return 'video'
    return initialMediaType || ''
  })

  const needsMediaTypeSelection = hasBoth

  const { facultyError: validationFacultyError, reasonError, touch, reset: resetValidation } =
    useValidation(selectedFaculty, reason)

  const abortRef = useRef(null)
  const searchRef = useRef(null)
  const modalContentRef = useRef(null)

  // Focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchRef.current?.focus()
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // ── Fetch faculty when effective media type is known ─────────────────
  useEffect(() => {
    // Don't fetch until user selects a type for mixed events
    if (needsMediaTypeSelection && !selectedMediaType) return
    if (!selectedMediaType) return

    // Abort any prior request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setFacultyLoading(true)
    setFacultyError('')
    setFacultyOptions([])
    setSelectedFaculty(null)
    setSearchQuery('')

    fetchFacultyOptions(selectedMediaType, controller.signal)
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setFacultyOptions(data)
          setFacultyLoading(false)
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setFacultyError(err.message || 'Failed to load faculty list')
        setFacultyLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [selectedMediaType, needsMediaTypeSelection])

  // ── Derived values ──────────────────────────────────────────────────

  const title = customTitle || 'Interchange Media Staff'
  const eventId = event?.eventId || event?._id || ''

  // Filter faculty list based on search query
  const filteredFaculty = facultyOptions.filter((faculty) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.trim().toLowerCase()
    return (
      faculty.name.toLowerCase().includes(query) ||
      faculty.email.toLowerCase().includes(query)
    )
  })

  // Check if selected faculty is in filtered list
  const selectedFacultyVisible = selectedFaculty && filteredFaculty.some(
    (f) => f.name === selectedFaculty.name && f.email === selectedFaculty.email
  )

  // ── Handlers ────────────────────────────────────────────────────────

  const handleMediaTypeSelect = (type) => {
    if (isSubmitting) return
    setSelectedMediaType(type)
  }

  const handleFacultySelect = (faculty) => {
    if (isSubmitting || facultyLoading) return
    setSelectedFaculty(faculty)
    touch('faculty')
  }

  const handleReasonChange = (e) => {
    if (isSubmitting) return
    setReason(e.target.value)
    touch('reason')
  }

  const handleSearchChange = (e) => {
    if (isSubmitting) return
    setSearchQuery(e.target.value)
  }

  const handleRetry = () => {
    if (!selectedMediaType) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setFacultyLoading(true)
    setFacultyError('')
    setFacultyOptions([])

    fetchFacultyOptions(selectedMediaType, controller.signal)
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          setFacultyOptions(data)
          setFacultyLoading(false)
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setFacultyError(err.message || 'Failed to load faculty list')
        setFacultyLoading(false)
      })
  }

  const handleClose = useCallback(() => {
    abortRef.current?.abort()
    setFacultyOptions([])
    setFacultyLoading(false)
    setFacultyError('')
    setSearchQuery('')
    setSelectedFaculty(null)
    setReason('')
    setIsSubmitting(false)
    // Reset to empty for mixed events so user must re-select; keep auto for single-type
    setSelectedMediaType(
      hasOnlyPoster ? 'poster' : hasOnlyVideo ? 'video' : ''
    )
    resetValidation()
    onClose()
  }, [hasOnlyPoster, hasOnlyVideo, onClose, resetValidation])

  const handleBackdropClick = (e) => {
    if (isSubmitting) return
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        handleClose()
      }
    },
    [isSubmitting, handleClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleConfirm = async () => {
    touch('faculty')
    touch('reason')

    if (!selectedFaculty || !reason.trim()) return
    if (!selectedMediaType) return
    if (facultyLoading) return
    if (facultyError) return

    setIsSubmitting(true)

    // Guard: ensure event/submission ID is present before making the API call
    const currentEventId = event?.eventId || event?._id || ''
    if (isIndividualInterchange && !currentEventId) {
      showErrorToast('Unable to identify this submission for interchange.')
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }

      const payload = isIndividualInterchange
        ? {
            reason: reason.trim(),
            staff: [
              {
                name: selectedFaculty.name,
                email: selectedFaculty.email,
              },
            ],
          }
        : {
            mediaType: selectedMediaType,
            reason: reason.trim(),
            staff: [
              {
                name: selectedFaculty.name,
                email: selectedFaculty.email,
              },
            ],
          }

          console.log("isIndividualInterchange : ", isIndividualInterchange)
      const endpoint = isIndividualInterchange
        ? `${API_BASE_URL}/api/individual-submissions/${eventId}/interchange`
        : `${API_BASE_URL}/api/media-staff-change/${eventId}/change-media-staff`

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      })

      const responseData = await res.json()

      if (res.ok && responseData.success !== false) {
        const successMessage = isIndividualInterchange
          ? 'Individual media staff interchanged successfully'
          : 'Media staff interchanged successfully'
        showSuccessToast(successMessage)

        abortRef.current?.abort()
        setFacultyOptions([])
        setFacultyLoading(false)
        setFacultyError('')
        setSearchQuery('')
        setSelectedFaculty(null)
        setReason('')
        setIsSubmitting(false)
        setSelectedMediaType(
          hasOnlyPoster ? 'poster' : hasOnlyVideo ? 'video' : initialMediaType || ''
        )
        resetValidation()

        onSuccess()
        onClose()
      } else {
        const errorMsg = responseData.message || (isIndividualInterchange
          ? 'Failed to interchange individual media staff'
          : 'Failed to interchange media staff')
        throw new Error(errorMsg)
      }
    } catch (err) {
      const fallbackMsg = isIndividualInterchange
        ? 'Unable to interchange this individual media request. Please try again.'
        : 'Failed to interchange media staff'
      showErrorToast(err.message || fallbackMsg)
      setIsSubmitting(false)
    }
  }

  const confirmDisabled =
    !selectedMediaType ||
    facultyLoading ||
    !!facultyError ||
    !selectedFaculty ||
    !reason.trim() ||
    isSubmitting

  // ── Render: Faculty list content ─────────────────────────────────────

  const renderFacultyListContent = () => {
    // Loading state
    if (facultyLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 size={16} className="animate-spin text-[#8B3DFF]" />
            <p className="text-sm text-[#CBC3D7]/65">Loading faculty...</p>
          </div>
        </div>
      )
    }

    // Error state
    if (facultyError) {
      return (
        <div className="flex flex-col items-center justify-center py-6 gap-3">
          <p className="text-sm text-[#FF4F91]">{facultyError}</p>
          <button
            type="button"
            onClick={handleRetry}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-md border border-[#283247] bg-[#1b2335] px-3 py-1.5 text-xs text-[#CBC3D7] hover:text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )
    }

    // Empty state
    if (facultyOptions.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-[#CBC3D7]/65">
            No faculty available for this media type.
          </p>
        </div>
      )
    }

    // Search no-results state
    if (filteredFaculty.length === 0 && searchQuery.trim()) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-[#CBC3D7]/65">Faculty not found</p>
        </div>
      )
    }

    // Normal faculty list
    return (
      <ul className="divide-y divide-[#283247]">
        {filteredFaculty.map((faculty) => {
          const isSelected =
            selectedFaculty?.name === faculty.name &&
            selectedFaculty?.email === faculty.email

          return (
            <li key={faculty.email}>
              <button
                type="button"
                onClick={() => handleFacultySelect(faculty)}
                disabled={isSubmitting}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-[#8B3DFF]/15 text-white'
                    : 'text-[#CBC3D7] hover:bg-[#283247] hover:text-white'
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    isSelected
                      ? 'border-[#8B3DFF] bg-[#8B3DFF]'
                      : 'border-[#4a5270]'
                  }`}
                >
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">
                    {faculty.name}
                  </span>
                  <span className="text-xs text-[#FFFFFF80] truncate">
                    {faculty.email}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center poppins"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="interchange-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal content */}
      <div
        ref={modalContentRef}
        className="relative z-10 w-full max-w-lg rounded-xl border border-[#283247] bg-[#151d2e] backdrop-blur-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#283247] px-6 py-4">
          <h3
            id="interchange-modal-title"
            className="text-base font-medium text-white"
          >
            {title}
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#FFFFFF80] transition hover:bg-[#283247] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Subtitle */}
          <p className="text-sm text-[#FFFFFF80]">
            Assign this media request to another faculty member.
          </p>

          {/* Media type selector (only when both poster and video are available) */}
          {needsMediaTypeSelection && (
            <div>
              <p className="mb-2 text-sm font-medium text-white">
                Select Media Type <span className="text-[#FF4F91]">*</span>
              </p>
              <div className="flex gap-4">
                {['poster', 'video'].map((type) => {
                  const isSelected = selectedMediaType === type
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleMediaTypeSelect(type)}
                      disabled={isSubmitting}
                      className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed ${
                        isSelected
                          ? 'border-[#8B3DFF] bg-[#8B3DFF]/15 text-white'
                          : 'border-[#283247] text-[#CBC3D7] hover:border-[#8B3DFF]/50 hover:text-white'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          isSelected
                            ? 'border-[#8B3DFF] bg-[#8B3DFF]'
                            : 'border-[#4a5270]'
                        }`}
                      >
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      {type === 'poster' ? 'Poster' : 'Video'}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* No media type available */}
          {hasNoTypes && (
            <p className="text-sm text-[#FF4F91]">
              No media type is available for this request.
            </p>
          )}

          {/* Search input - only show when faculty should be loaded */}
          {selectedMediaType && !hasNoTypes && !facultyLoading && !facultyError && facultyOptions.length > 0 && (
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b93a7]"
              />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search faculty by name or email"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-[#283247] bg-[#1b2335] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#FFFFFF66] outline-none transition focus:border-[#8B3DFF] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}

          {/* Faculty list */}
          {selectedMediaType && !hasNoTypes && (
            <div className="max-h-[200px] overflow-y-auto rounded-lg border border-[#283247] bg-[#1b2335] table-custom-scrollbar">
              {renderFacultyListContent()}
            </div>
          )}

          {/* Keep selected faculty in state even if hidden by search */}
          {selectedFaculty && !selectedFacultyVisible && !facultyLoading && (
            <p className="text-xs text-[#8B3DFF]">
              Currently selected: {selectedFaculty.name} ({selectedFaculty.email})
            </p>
          )}

          {/* Validation error: faculty */}
          {validationFacultyError && (
            <p className="text-xs text-[#FF4F91]">{validationFacultyError}</p>
          )}

          {/* Reason textarea */}
          <div>
            <p className="mb-1 text-sm text-white">
              Reason for interchange <span className="text-[#FF4F91]">*</span>
            </p>
            <textarea
              value={reason}
              onChange={handleReasonChange}
              placeholder="Enter the reason for changing staff"
              disabled={isSubmitting}
              rows={3}
              className="w-full rounded-lg border border-[#283247] bg-[#1b2335] p-3 text-sm text-white placeholder:text-[#FFFFFF66] outline-none transition resize-none focus:border-[#8B3DFF] disabled:cursor-not-allowed disabled:opacity-50"
            />
            {reasonError && (
              <p className="mt-1 text-xs text-[#FF4F91]">{reasonError}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#283247] px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg border border-[#283247] bg-transparent px-5 py-2 text-sm font-medium text-[#FFFFFF80] transition hover:bg-[#283247] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirmDisabled}
            className="flex items-center gap-2 rounded-lg bg-[#8B3DFF] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#7a2de8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Interchanging...
              </>
            ) : (
              <>
                <UserRoundCog size={16} />
                Confirm Interchange
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MediaStaffInterchangeModal
