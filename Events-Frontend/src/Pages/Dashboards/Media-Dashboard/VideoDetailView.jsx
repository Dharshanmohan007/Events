import React, { useState, useEffect } from 'react'
import {
  CalendarDays, Check, ClipboardList, Clock3,
  FileText, Mail, MapPin, Network, Phone, Shuffle, Sparkles, UserRound, Users, Video
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import smallLogo from '../../../assets/small-logo.svg'
import LogoutButton from '../../../Components/LogoutButton'
import RequestToInterchangeModal from './RequestToInterchangeModal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ── Helpers ──────────────────────────────────────────────────────────────

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

const getStatusClassName = (status) => {
  if (status === 'Completed') return 'bg-[#4A2BB7]/35 text-[#A78BFA]'
  if (status === 'Pending for Acknowledge') return 'bg-[#5D1438]/50 text-[#FF4F91]'
  if (status === 'Acknowledged') return 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-[#ffffff]/80'
  if (status === 'Admin Canceled') return 'bg-yellow-700 text-[#FF4F91]'
  return 'bg-[#0e5149]/55 text-[#20D18C]'
}

const getStatusStyle = (status) => {
  if (!status || status === '-') return 'text-[#8b93a7]'
  const s = String(status).toLowerCase()
  if (s.includes('pending')) return 'text-[#F20768]'
  if (s === 'acknowledged' || s === 'completed') return 'text-[#20D18C]'
  return 'text-[#8b93a7]'
}

const getStatusDotStyle = (status) => {
  if (!status || status === '-') return 'bg-[#8b93a7]'
  const s = String(status).toLowerCase()
  if (s.includes('pending')) return 'bg-[#F20768]'
  if (s === 'acknowledged' || s === 'completed') return 'bg-[#20D18C]'
  return 'bg-[#8b93a7]'
}

// ── Sub-components ───────────────────────────────────────────────────────

const DetailHeader = () => (
  <header className="sticky top-0 z-40 flex h-[71px] items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-5">
    <div className="flex items-center gap-4">
      <img src={smallLogo} alt="Logo" className="h-10 w-10" />
      <nav className="flex items-center gap-4 text-sm font-medium">
        <Link to="/dashboard-video" className="text-[#FFFFFF80]">Dashboard</Link>
        <Link to="/dashboard-video/requests" className="text-[#FFFFFF80] hover:text-white">Request List</Link>
        <Link to="/calendar" className="text-[#FFFFFF80] hover:text-white">Calendar</Link>
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

const ListCard = ({ title, items = [] }) => (
  <section className="rounded-lg border border-[#3a4560] bg-[#1b2335]/80 p-5">
    <h3 className="flex items-center gap-2 text-lg font-medium text-[#dce4f7]">
      <ClipboardList size={17} />
      {title}
    </h3>
    <div className="mt-5 divide-y divide-[#2b3449]">
      {items.length > 0
        ? items.map((item, idx) => (
            <p
              key={`${item}-${idx}`}
              className="py-3 text-sm font-semibold text-[#DDE3F2] first:pt-0 last:pb-0"
            >
              {displayValue(item)}
            </p>
          ))
        : <p className="py-3 text-sm font-medium text-[#d6d1e4]/60">-</p>}
    </div>
  </section>
)

const ReferenceRow = ({ label, files = [], icon: Icon = FileText }) => {
  const names = files.map(renderFileName).join(', ') || '-'
  return (
    <div className="grid min-h-[70px] grid-cols-[1fr_1fr] items-center rounded-lg border border-[#3a4560] bg-[#20283A]">
      <div className="px-7 text-sm text-[#d6d1e4]/85">{label}</div>
      <div className="flex h-full items-center gap-3 border-l border-[#6a7288] px-9">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#075852]/60 text-[#20D18C]">
          <Icon size={17} />
        </span>
        <span className="text-base font-semibold text-[#d6d1e4]">{names}</span>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────

const VideoDetailView = () => {
  const { videoId } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [eventData, setEventData] = useState(null)
  const [isInterchangeOpen, setIsInterchangeOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [activeDayIndex, setActiveDayIndex] = useState(0)

  // ── Background refresh (does not show loading spinner) ──────────────
  const refreshDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/events/${videoId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.message || 'Failed to fetch')
      const data = payload.data || payload
      setEventData(data)

      // ── Re-derive status from fresh data ────────────────────────────
      const freshMediaReq = data?.mediaRequirementDetails || {}
      const freshReqs = freshMediaReq.mediaRequirements || []
      const freshActiveReq = freshReqs.find(
        (r) => r.dayIndex === activeDayIndex && r.typeOfMedia?.includes('video')
      )
      const freshVideo = freshActiveReq?.video || null
      const freshStatus = freshVideo?.status || freshMediaReq?.status?.status || 'Submitted'
      if (freshStatus) setStatus(freshStatus)
    } catch (err) {
      console.error('Failed to refresh video details:', err)
    }
  }

  // ── Status update handler ────────────────────────────────────────────
  const handleStatusUpdate = async (action, mediaType) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/events/${videoId}/status`, {
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
    const abortController = new AbortController()

    const fetchEventDetail = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${videoId}`, {
          signal: abortController.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch event details')

        const data = payload.data || payload
        setEventData(data)

        // ── Set initial status from video requirement ─────────────────
        const mediaReqDetails = data?.mediaRequirementDetails || {}
        const reqs = mediaReqDetails.mediaRequirements || []
        const activeReq = reqs.find(
          (r) => r.dayIndex === activeDayIndex && r.typeOfMedia?.includes('video')
        )
        const videoData = activeReq?.video || null
        const initialStatus = videoData?.status || mediaReqDetails?.status?.status || data?.status || 'Submitted'
        if (initialStatus) setStatus(initialStatus)
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Failed to fetch video detail:', err)
        setError(err.message || 'Failed to load event details')
      } finally {
        if (!abortController.signal.aborted) setLoading(false)
      }
    }

    fetchEventDetail()
    return () => abortController.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId])

  // ── Recalculate status when day tab changes ─────────────────────────
  useEffect(() => {
    if (eventData) {
      const mediaReqDetails = eventData?.mediaRequirementDetails || {}
      const reqs = mediaReqDetails.mediaRequirements || []
      const activeReq = reqs.find(
        (r) => r.dayIndex === activeDayIndex && r.typeOfMedia?.includes('video')
      )
      const videoData = activeReq?.video || null
      const dayStatus = videoData?.status || mediaReqDetails?.status?.status || 'Submitted'
      if (dayStatus) setStatus(dayStatus)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDayIndex, eventData])

  // ── Derive data from nested API response ────────────────────────────
  // Structure:
  //   data.requestDetails.organizerDetails
  //   data.requestDetails.eventDetails
  //   data.mediaRequirementDetails.mediaRequirements

  const organizerDetails = eventData?.requestDetails?.organizerDetails
  const eventDetails = eventData?.requestDetails?.eventDetails
  const mediaReqDetails = eventData?.mediaRequirementDetails

  const ed = eventDetails || {}
  const od = organizerDetails || {}
  const organizers = od.organizers || []
  const firstOrganizer = organizers[0] || {}

  const eventName = ed.eventName || '-'
  const eventType = ed.eventType || '-'
  const organizerName = firstOrganizer.name || '-'
  const organizerEmail = firstOrganizer.email || '-'
  const organizerPhone = firstOrganizer.mobile || '-'
  const organizerDepartment = od.organizingDepartment || firstOrganizer.department || '-'

  const eventSchedule = ed.eventSchedule || []
  const dayLabels = eventSchedule.map((_, i) => `Day ${i + 1}`)

  const mediaRequirements = mediaReqDetails?.mediaRequirements || []

  // Default to the first day that actually has a video request
  const firstVideoDayIndex = (() => {
    for (const req of mediaRequirements) {
      if (req.typeOfMedia?.includes('video')) return req.dayIndex
    }
    return 0
  })()

  // Keep in sync when data loads (firstVideoDayIndex may change)
  useEffect(() => {
    setActiveDayIndex(firstVideoDayIndex)
  }, [firstVideoDayIndex])

  // Active requirement — match by dayIndex AND check typeOfMedia includes "video"
  const activeRequirement = mediaRequirements.find(
    (r) => r.dayIndex === activeDayIndex && r.typeOfMedia?.includes('video')
  )
  const video = activeRequirement?.video || null

  // Active schedule entry
  const activeSchedule = eventSchedule[activeDayIndex] || {}
  const activeEventTime =
    activeSchedule.startTime && activeSchedule.endTime
      ? `${activeSchedule.startTime} - ${activeSchedule.endTime}`
      : '-'

  // ── Render ────────────────────────────────────────────────────────────

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
                <Link to="/dashboard-video" className="hover:text-white">Video Dashboard</Link>
                <span className="mx-2 text-[#596276]">&gt;</span>
                <span className="text-[#D0BCFF]">{eventName}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* <button
                  type="button"
                  onClick={() => setIsInterchangeOpen(true)}
                  className="flex h-10 items-center gap-2 rounded-md bg-linear-to-r from-[#078B72] to-[#035546] hover:bg-linear-to-l hover:from-[#078B72] hover:to-[#035546] px-5 text-base font-medium text-white"
                >
                  <Shuffle size={17} />
                  Request to Interchange
                </button> */}

                {/* ── Status actions (only when active video exists) ─── */}
                {video && (
                  <>
                    {status === 'Pending for Acknowledge' && activeRequirement?.typeOfMedia?.includes('video') && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate('acknowledge', 'video')}
                        disabled={actionLoading}
                        className="flex h-10 items-center gap-2 rounded-md bg-gradient-to-r from-[#8D3CF2] to-[#55279E] hover:opacity-90 px-5 text-base font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check size={17} />
                        {actionLoading ? 'Processing...' : 'Acknowledge'}
                      </button>
                    )}
                    {status === 'Acknowledged' && activeRequirement?.typeOfMedia?.includes('video') && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate('complete', 'video')}
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
                    Video request details for {eventName}
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

            {/* Day Tabs + Video Requirements */}
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
                        aria-label={`${label}${mediaRequirements.some((r) => r.dayIndex === i && r.typeOfMedia?.includes('video')) ? ' (has video request)' : ''}`}
                      >
                        {label}
                      </button>
                    ))
                  : (
                    <span className="px-7 pb-3 text-sm text-[#9aa2b5]">No schedule available</span>
                  )}
              </div>

              {/* Day Info: Date, Time, Guests (from eventSchedule), Venue is "-" */}
              <div className="mt-5 grid grid-cols-4 rounded-lg border border-[#2e384e] bg-[#232A3B] py-2">
                <InfoItem icon={MapPin} label="Venue Name" value="-" />
                <InfoItem icon={CalendarDays} label="Event Date" value={formatDate(activeSchedule.eventDate)} />
                <InfoItem icon={Clock3} label="Event Time" value={activeEventTime} />
                <InfoItem icon={Users} label="Total Members" value={displayValue(activeSchedule.totalGuests)} />
              </div>

              <div className="mt-7">
                <h2 className="text-xl font-semibold text-white">Video Request List</h2>
                <p className="mt-3 text-sm leading-5 text-[#9aa2b5]">
                  {activeDayIndex + 1} of {dayLabels.length} day{dayLabels.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Video Requirement Details */}
              {!video ? (
                <div className="mt-7 rounded-lg border border-[#3a4560] bg-[#20283A] px-7 py-8 text-center">
                  <p className="text-sm text-[#CBC3D7]/65">No video request for this day.</p>
                </div>
              ) : (
                <div className="mt-7 space-y-4">
                  <TextCard title="Content for Video">
                    {displayValue(video.videoContent)}
                  </TextCard>

                  <ReferenceRow label="Reference video" files={video.referenceFiles} icon={Video} />

                  <ListCard title="Pre-Event Videos Needed" items={video.preEventVideos} />
                  <ListCard title="Event Coverage Needed" items={video.eventCoverage} />
                  <ListCard title="Post-Event Videos Needed" items={video.postEventVideos} />
                  <ListCard title="Special Videos Needed" items={video.specialVideos} />

                  <div className="grid grid-cols-2 rounded-lg border border-[#3a4560] bg-[#20283A]">
                    <div className="flex items-center justify-between border-r border-[#6a7288] px-7 py-5">
                      <span className="flex items-center gap-2 text-sm text-[#d6d1e4]/85">
                        <CalendarDays size={16} className="text-[#c3a8ff]" />
                        Delivery Date
                      </span>
                      <span className="text-base font-semibold text-white">
                        {formatDate(video.deliveryDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-7 py-5">
                      <span className="text-sm text-[#d6d1e4]/85">Priority</span>
                      <span className="text-sm font-bold text-[#F20768]">
                        {displayValue(video.priority)}
                      </span>
                    </div>
                  </div>

                  <TextCard title="Special Requirement">
                    {displayValue(video.specialRequirements)}
                  </TextCard>

                  {/* Assigned Staff */}
                  {video.staff && video.staff.length > 0 && (
                    <ListCard
                      title="Assigned Staff"
                      items={video.staff.map((s) =>
                        typeof s === 'string' ? s : displayValue(s.name)
                      )}
                    />
                  )}

                  {/* Video Status with proper styling */}
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
        <RequestToInterchangeModal
          onClose={() => setIsInterchangeOpen(false)}
          isInterchangeOpen={isInterchangeOpen}
        />
      )}
    </section>
  )
}

export default VideoDetailView
