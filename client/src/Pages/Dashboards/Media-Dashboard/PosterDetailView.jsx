import React, { useState, useEffect } from 'react'
import {
  CalendarDays, Check, ClipboardList, Clock3,
  FileText, Mail, MapPin, Network, Phone, Shuffle, Sparkles, UserRound, Users
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import smallLogo from '../../../assets/small-logo.svg'
import LogoutButton from '../../../Components/LogoutButton'
import MediaStaffInterchangeModal from '../../../Components/MediaStaffInterchangeModal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ── Helpers ──────────────────────────────────────────────────────────────

const getStatusClassName = (status) => {
  if (status === 'Completed') return 'bg-[#4A2BB7]/35 text-[#A78BFA]'
  if (status === 'Pending for Acknowledge') return 'bg-[#5D1438]/50 text-[#FF4F91]'
  if (status === 'Acknowledged') return 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-[#ffffff]/80'
  if (status === 'Admin Canceled') return 'bg-yellow-700 text-[#FF4F91]'
  return 'bg-[#0e5149]/55 text-[#20D18C]'
}

const displayValue = (val) =>
  val === null || val === undefined || val === '' ? '-' : String(val)

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date
    .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '-')
}

const resolveFileName = (file) =>
  file?.originalName ||
  file?.name ||
  file?.filename ||
  (typeof file === 'string' ? file.split('/').pop() : null)

const renderFileName = (file) => {
  const name = resolveFileName(file)
  return name || '-'
}

// ── Sub-components ───────────────────────────────────────────────────────

const DetailHeader = () => (
  <header className="sticky top-0 z-40 flex h-[71px] items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-5">
    <div className="flex items-center gap-4">
      <img src={smallLogo} alt="Logo" className="h-10 w-10" />
      <nav className="flex items-center gap-4 text-sm font-medium">
        <Link to="/dashboard-poster" className="text-[#FFFFFF80]">Dashboard</Link>
        <Link to="/dashboard-poster/requests" className="border-b border-[#8B3DFF] pb-1 text-[#8B3DFF]">Request List</Link>
        <Link to="/calendar" className="text-[#FFFFFF80] hover:text-white">Calendar</Link>
        <Link to="/dashboard-poster/reports" className="text-[#FFFFFF80] hover:text-white">Reports</Link>
        <Link to="/dashboard-poster/feedback" className="text-[#FFFFFF80] hover:text-white">Feedback</Link>
      </nav>
    </div>

    <div className="flex items-center gap-6">
      <LogoutButton />
    </div>
  </header>
)

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="border-r border-[#5b6378] px-3 py-1 last:border-r-0">
    <Icon size={15} className="text-[#c3a8ff]" />
    <p className="mt-2 text-[10px] font-semibold uppercase text-[#8f96a8]">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
  </div>
)

const TextCard = ({ title, children }) => (
  <section className="rounded-lg border border-[#3a4560] bg-[#1b2335]/80 p-5">
    <h3 className="flex items-center gap-2 text-lg font-medium text-[#dce4f7]">
      <ClipboardList size={17} />
      {title}
    </h3>
    <p className="mt-5 text-sm font-medium leading-7 text-[#d6d1e4]/90">{children}</p>
  </section>
)

const ReferenceRow = ({ label, files = [] }) => {
  const names = files.map(renderFileName).join(', ') || '-'
  return (
    <div className="grid min-h-[70px] grid-cols-[1fr_1fr] items-center rounded-lg border border-[#3a4560] bg-[#20283A]">
      <div className="px-7 text-sm text-[#d6d1e4]/85">{label}</div>
      <div className="flex h-full items-center gap-3 border-l border-[#6a7288] px-9">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#075852]/60 text-[#20D18C]">
          <FileText size={17} />
        </span>
        <span className="text-base font-semibold text-[#d6d1e4]">{names}</span>
      </div>
    </div>
  )
}

const RequirementBox = ({ title, rows }) => (
  <section className="rounded-lg border border-[#3a4560] bg-[#1b2335]/80 p-5">
    <h3 className="flex items-center gap-2 text-lg font-medium text-[#dce4f7]">
      <ClipboardList size={17} />
      {title}
    </h3>
    <div className="mt-5 divide-y divide-[#2b3449]">
      {rows.length > 0
        ? rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <span className="text-sm font-medium text-[#d6d1e4]">{displayValue(label)}</span>
              {value !== undefined && <span className="text-sm font-bold text-[#d9c8ff]">{displayValue(value)}</span>}
            </div>
          ))
        : <p className="py-3 text-sm font-medium text-[#d6d1e4]/60">-</p>}
    </div>
  </section>
)

// ── Main component ───────────────────────────────────────────────────────

const PosterDetailView = () => {
  const { posterId } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eventData, setEventData] = useState(null)
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [isInterchangeOpen, setIsInterchangeOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchEventDetail = async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/events/${posterId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.message || 'Failed to fetch event details')

      const data = payload.data || payload
      setEventData(data)

      // ── Set initial status from poster requirement ──────────────────
      const mediaReqDetails = data?.mediaRequirementDetails || {}
      const allReqs = mediaReqDetails.mediaRequirements || data?.posterRequirements || []
      const activeReq = allReqs.find((r) => r.dayIndex === activeDayIndex)
      const posterData = activeReq?.poster || activeReq || null
      const initialStatus = posterData?.status || mediaReqDetails?.status?.status || data?.status || 'Submitted'
      if (initialStatus) setStatus(initialStatus)
    } catch (err) {
      console.error('Failed to fetch poster detail:', err)
      setError(err.message || 'Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  // ── Background refresh (does not show loading spinner) ──────────────
  const refreshDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/events/${posterId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.message || 'Failed to fetch')
      const data = payload.data || payload
      setEventData(data)

      // ── Re-derive status from fresh data ────────────────────────────
      const freshMediaReq = data?.mediaRequirementDetails || {}
      const freshReqs = freshMediaReq.mediaRequirements || data?.posterRequirements || []
      const freshActiveReq = freshReqs.find((r) => r.dayIndex === activeDayIndex)
      const freshPoster = freshActiveReq?.poster || freshActiveReq || null
      const freshStatus = freshPoster?.status || freshMediaReq?.status?.status || 'Submitted'
      if (freshStatus) setStatus(freshStatus)
    } catch (err) {
      console.error('Failed to refresh poster details:', err)
    }
  }

  // ── Status update handler ────────────────────────────────────────────
  const handleStatusUpdate = async (action, mediaType) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/events/${posterId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, module: 'media', mediaType }),
      })
      const responseData = await res.json()
      if (!res.ok || !responseData.success) throw new Error(responseData.message || `Failed to ${action}`)
      toast.success(`Status updated to ${action === 'acknowledge' ? 'Acknowledged' : 'Completed'} successfully`)
      setStatus(action === 'acknowledge' ? 'Acknowledged' : 'Completed')
      await refreshDetails()
    } catch (err) {
      toast.error(err.message || `Failed to ${action}`)
    } finally {
      setActionLoading(false)
    }
  }

  useEffect(() => {
    fetchEventDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posterId])

  // ── Recalculate status when day tab changes ─────────────────────────
  useEffect(() => {
    if (eventData) {
      const mediaReqDetails = eventData?.mediaRequirementDetails || {}
      const allReqs = mediaReqDetails.mediaRequirements || eventData?.posterRequirements || []
      const activeReq = allReqs.find((r) => r.dayIndex === activeDayIndex)
      const posterData = activeReq?.poster || activeReq || null
      const dayStatus = posterData?.status || mediaReqDetails?.status?.status || 'Submitted'
      if (dayStatus) setStatus(dayStatus)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDayIndex, eventData])

  // ── Derive data from eventData ────────────────────────────────────────
  // Support both nested (data.requestDetails.eventDetails.*) and flat
  // (data.eventName, data.eventSchedule, ...) API response formats.

  const rd = eventData?.requestDetails || {}
  const ed = rd.eventDetails || {}
  const od = rd.organizerDetails || {}
  const organizers = od.organizers || []
  const firstOrganizer = organizers[0] || {}

  const eventName = ed.eventName || eventData?.eventName || '-'
  const eventType = ed.eventType || eventData?.eventType || '-'
  const organizerName = firstOrganizer.name || eventData?.organizingDepartment || '-'
  const organizerEmail = firstOrganizer.email || '-'
  const organizerPhone = firstOrganizer.mobile || '-'
  const organizerDepartment = od.organizingDepartment || firstOrganizer.department || eventData?.organizingDepartment || '-'

  const eventSchedule = ed.eventSchedule || eventData?.eventSchedule || []
  const dayLabels = eventSchedule.map((_, i) => `Day ${i + 1}`)

  // Extract poster requirements — handle both nested (mediaRequirements[*].poster)
  // and flat (posterRequirements[*] directly) API response format
  const mediaReqDetails = eventData?.mediaRequirementDetails || {}
  const allRequirements =
    mediaReqDetails.mediaRequirements ||
    eventData?.posterRequirements ||
    []
  const activeRequirement = allRequirements.find((r) => r.dayIndex === activeDayIndex)
  // If the requirement has a nested .poster object use it, otherwise use the
  // requirement itself (flat format where fields live at the top level).
  const poster = activeRequirement?.poster || activeRequirement || null



  return (
    <section className="min-h-screen bg-[#0b1326] text-white poppins">
      <DetailHeader />

      <main className="px-5 pb-8 pt-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#CBC3D7]/65">Loading event details...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#FF4F91]">{error}</p>
          </div>
        ) : !eventData ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-[#CBC3D7]/65">Event data not available.</p>
          </div>
        ) : (
          <>
            {/* Breadcrumb + Action Buttons */}
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold text-[#8c94a8]">
                <Link to="/dashboard-poster/requests" className="hover:text-white">Poster Request List</Link>
                <span className="mx-2 text-[#596276]">&gt;</span>
                <span className="text-[#D0BCFF]">{eventName}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsInterchangeOpen(true)}
                  className="flex h-10 items-center gap-2 rounded-md bg-linear-to-r from-[#078B72] to-[#035546] hover:bg-linear-to-l hover:from-[#078B72] hover:to-[#035546] px-5 text-base font-medium text-white"
                >
                  <Shuffle size={17} />
                  Request to Interchange
                </button>

                {/* ── Status actions (only when active poster exists) ── */}
                {poster && (
                  <>
                    {status === 'Pending for Acknowledge' && activeRequirement?.typeOfMedia?.includes('poster') && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate('acknowledge', 'poster')}
                        disabled={actionLoading}
                        className="flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#8D3CF2] to-[#55279E] hover:opacity-90 px-5 text-base font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check size={17} />
                        {actionLoading ? 'Processing...' : 'Acknowledge'}
                      </button>
                    )}
                    {status === 'Acknowledged' && activeRequirement?.typeOfMedia?.includes('poster') && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate('complete', 'poster')}
                        disabled={actionLoading}
                        className="flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#4A2BB7] to-[#6D3BD8] hover:opacity-90 px-5 text-base font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check size={17} />
                        {actionLoading ? 'Processing...' : 'Complete'}
                      </button>
                    )}
                    {status && (
                      <span className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-medium ${getStatusClassName(status)}`}>
                        {status}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Event Summary Card */}
            <section className="mt-5 rounded-lg border border-[#2a3347] bg-[#151c2c] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={31} className="text-[#cbb6ff]" />
                    <h1 className="text-lg font-medium text-[#e8edfb]">{eventName}</h1>
                  </div>
                  <p className="mt-4 text-sm leading-5 text-[#9aa2b5]">
                    Poster request details for {eventName}
                  </p>
                </div>
                <span className="rounded-full bg-[#063f43] px-5 py-2 text-sm font-semibold text-[#20D18C]">
                  {eventType}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-4 rounded-lg border border-[#2e384e] bg-[#232A3B] py-2">
                <InfoItem icon={UserRound} label="Organizer Name" value={organizerName} />
                <InfoItem icon={Mail} label="Organizer Email" value={organizerEmail} />
                <InfoItem icon={Phone} label="Organizer Phone Number" value={organizerPhone} />
                <InfoItem icon={Network} label="Organizer Department" value={organizerDepartment} />
              </div>
            </section>

            {/* Day Tabs + Poster Requirements */}
            <section className="mt-4 rounded-lg border border-[#2a3347] bg-[#151c2c] p-4">
              {/* Day Tabs */}
              <div className="flex border-b border-[#3a4560]">
                {dayLabels.length > 0
                  ? dayLabels.map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setActiveDayIndex(i)}
                        className={`min-w-[90px] px-7 pb-3 text-left text-base font-semibold ${
                          activeDayIndex === i
                            ? 'border-b-2 border-[#8B3DFF] text-[#8B3DFF]'
                            : 'text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))
                  : (
                    <span className="px-7 pb-3 text-sm text-[#9aa2b5]">No schedule available</span>
                  )}
              </div>

              {/* Venue / Date / Time (static from event schedule if available) */}
              <div className="mt-5 grid grid-cols-4 rounded-lg border border-[#2e384e] bg-[#232A3B] py-2">
                <InfoItem icon={MapPin} label="Venue Name" value={ed.venue || ed.eventVenue || '-'} />
                <InfoItem icon={CalendarDays} label="Event Date" value={formatDate(eventSchedule[activeDayIndex]?.eventDate)} />
                <InfoItem icon={Clock3} label="Event Time" value={ed.eventTime || '-'} />
                <InfoItem icon={Users} label="Total Members" value={displayValue(ed.totalMembers || ed.totalParticipants)} />
              </div>

              <div className="mt-7">
                <h2 className="text-xl font-semibold text-white">Poster Request List</h2>
                <p className="mt-3 text-sm leading-5 text-[#9aa2b5]">
                  {activeDayIndex + 1} of {dayLabels.length} day{dayLabels.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Poster Requirement Details */}
              {!poster ? (
                <div className="mt-7 rounded-lg border border-[#3a4560] bg-[#20283A] px-7 py-8 text-center">
                  <p className="text-sm text-[#CBC3D7]/65">No poster request for this day.</p>
                </div>
              ) : (
                <div className="mt-7 space-y-4">
                  <TextCard title="Content for Poster">
                    {displayValue(poster.posterContent)}
                  </TextCard>
                  <ReferenceRow label="Reference poster" files={poster.referencePosterFiles} />
                  <TextCard title="Content for Certificate">
                    {displayValue(poster.certificateContent)}
                  </TextCard>
                  <ReferenceRow label="Reference Certificate" files={poster.referenceCertificateFiles} />
                  <TextCard title="Content for Trophy">
                    {displayValue(poster.trophyContent)}
                  </TextCard>

                  <div className="grid grid-cols-2 gap-7">
                    <RequirementBox
                      title="Display Requirement"
                      rows={(poster.displayNeeded || []).map((d) => [d])}
                    />
                    <RequirementBox
                      title="Size Requirement"
                      rows={(poster.sizes || []).map((s) => [s.type || displayValue(s), s.value])}
                    />
                  </div>

                  <div className="grid grid-cols-2 rounded-lg border border-[#3a4560] bg-[#20283A]">
                    <div className="flex items-center justify-between border-r border-[#6a7288] px-7 py-5">
                      <span className="flex items-center gap-2 text-sm text-[#d6d1e4]/85">
                        <CalendarDays size={16} className="text-[#c3a8ff]" />
                        Delivery Date
                      </span>
                      <span className="text-base font-semibold text-white">
                        {formatDate(poster.deliveryDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-7 py-5">
                      <span className="text-sm text-[#d6d1e4]/85">Priority</span>
                      <span className="text-sm font-bold text-[#F20768]">
                        {displayValue(poster.priority)}
                      </span>
                    </div>
                  </div>

                  <TextCard title="Special Requirement">
                    {displayValue(poster.specialRequirements)}
                  </TextCard>

                  {status && (
                    <div className="grid grid-cols-1 rounded-lg border border-[#3a4560] bg-[#20283A]">
                      <div className="flex items-center justify-between px-7 py-5">
                        <span className="text-sm text-[#d6d1e4]/85">Status</span>
                        <span className={`rounded-full px-5 py-1.5 text-sm font-medium ${getStatusClassName(status)}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {isInterchangeOpen && (
        <MediaStaffInterchangeModal
          event={{
            eventId: posterId,
            _id: posterId,
            media: [{ typeOfMedia: ["poster"] }],
          }}
          mediaType="poster"
          isIndividualInterchange={false}
          title="Interchange Media Staff"
          onClose={() => setIsInterchangeOpen(false)}
          onSuccess={() => refreshDetails()}
        />
      )}
    </section>
  )
}

export default PosterDetailView
