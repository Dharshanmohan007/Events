import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowRight, ExternalLink, Shuffle } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import MediaStatcard from './MediaStatcard'
import FeedbackRatings from '../../../Components/FeedbackRatings'
import MediaStaffInterchangeModal from '../../../Components/MediaStaffInterchangeModal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ── Status derivation helper ────────────────────────────────────────────
// Pure function, easy to test and reuse.
export const deriveMediaStatus = (mediaEntries = []) => {
  const relevantStatuses = []

  for (const entry of mediaEntries) {
    const rawTypes = entry.typeOfMedia || []
    const types = rawTypes.flatMap(normalizeMediaType)
    for (const type of types) {
      if (type === 'poster' && entry.poster?.status) {
        relevantStatuses.push(entry.poster.status)
      } else if (type === 'video' && entry.video?.status) {
        relevantStatuses.push(entry.video.status)
      }
    }
  }

  if (relevantStatuses.length === 0) return '-'

  const hasPending = relevantStatuses.some((s) =>
    String(s).toLowerCase().includes('pending')
  )

  if (hasPending) return 'Pending for Acknowledge'

  // Return the first resolved status
  return relevantStatuses[0]
}

// ── Normalize a single typeOfMedia entry ───────────────────────────────
// Handles "poster", "video", and "poster and video" (single string)
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

// ── Media type label helper ─────────────────────────────────────────────
const getMediaTypeLabels = (mediaEntries = []) => {
  const types = new Set()
  for (const entry of mediaEntries) {
    const entryTypes = entry.typeOfMedia || []
    for (const t of entryTypes) {
      const normalized = normalizeMediaType(t)
      if (normalized.includes('poster')) types.add('Poster')
      if (normalized.includes('video')) types.add('Video')
    }
  }
  return types.size > 0 ? Array.from(types).join(', ') : '-'
}

// ── Transform API data ──────────────────────────────────────────────────
const transformMediaData = (apiData) =>
  (apiData || []).map((item) => ({
    eventId: item.eventId,
    eventName: item.eventName || '-',
    department: item.organizingDepartment || item.department || '-',
    mediaTypes: getMediaTypeLabels(item.media),
    status: deriveMediaStatus(item.media),
  }))

const departmentData = [
  { name: 'CSE', value: 25, color: '#74b9ff' },
  { name: 'AIML', value: 55, color: '#159283' },
  { name: 'EEE', value: 12, color: '#68df85' },
  { name: 'VLSI', value: 8, color: '#4169e1' },
  { name: 'ECE', value: 15, color: '#ff7675' },
  { name: 'ME', value: 20, color: '#fdcb6e' },
  { name: 'IT', value: 18, color: '#00b894' },
]

const MediaDashboard = () => {
  const [events, setEvents] = useState([])
  const [rawData, setRawData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('events')
  const [selectedEventForInterchange, setSelectedEventForInterchange] = useState(null)
  const [interchangeMediaType, setInterchangeMediaType] = useState('')
  const abortControllerRef = useRef(null)

  const fetchMediaDashboardData = useCallback(async () => {
    // Abort any in-flight request before starting a new one
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(
        `${API_BASE_URL}/api/table/dashboard-table?module=media`,
        { headers, signal }
      )

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const json = await response.json()
      if (json.data && Array.isArray(json.data)) {
        setRawData(json.data)
        setEvents(transformMediaData(json.data))
      } else {
        setRawData([])
        setEvents([])
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('Failed to fetch media dashboard data:', err)
      setError(err.message || 'Failed to load media requests')
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMediaDashboardData()
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [fetchMediaDashboardData])

  const headers = ['Event Name', 'Dept', 'Type', 'Status', 'Action']

  const renderTable = () => (
    <div className="overflow-x-auto overflow-y-auto flex-1 table-custom-scrollbar">
      <table className="w-full text-left">
        <thead className="sticky top-0 bg-[#151c2c]">
          <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
            {headers.map((header) => (
              <th
                key={header}
                className={`px-6 py-4 font-semibold ${
                  header === 'Action' ? 'text-center' : ''
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {events.length === 0 ? (
            <tr className="border-t border-[#20283a] text-sm text-[#8b93a7]">
              <td className="px-6 py-8 text-center" colSpan={headers.length}>
                No event media requests found.
              </td>
            </tr>
          ) : (
            events.map((item) => {
              const isPending = String(item.status)
                .toLowerCase()
                .includes('pending')
              const rawEvent = rawData.find(
                (r) => r.eventId === item.eventId
              )
              return (
                <tr
                  key={item.eventId}
                  className="border-t border-[#20283a] text-sm text-white whitespace-nowrap"
                >
                  <td className="px-6 py-4 font-medium">{item.eventName}</td>
                  <td className="px-6 py-4">{item.department}</td>
                  <td className="px-6 py-4">{item.mediaTypes}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 ${
                        isPending ? 'text-[#B32058]' : 'text-[#34D399]'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isPending ? 'bg-[#B32058]' : 'bg-[#34D399]'
                        }`}
                      />
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/dashboard-media/events/detailView/${item.eventId}`}
                        className="flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white transition"
                        aria-label={`View details for ${item.eventName}`}
                      >
                        <ExternalLink size={17} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const types = deriveAvailableMediaTypes(rawEvent?.media)
                          if (types.length === 0) return
                          setSelectedEventForInterchange(rawEvent || item)
                          setInterchangeMediaType(types[0])
                        }}
                        className="flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white transition"
                        title="Interchange staff"
                        aria-label={`Interchange staff for ${item.eventName}`}
                      >
                        <Shuffle size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      <section className="bg-[#0b1326] poppins h-screen border overflow-auto table-custom-scrollbar">
        {/* header */}
        <div className="header-container sticky top-0">
          <DashboardHeader basePath="/dashboard-media" />
        </div>

        {/* main-container */}
        <div className="main-body-container px-6">
          {/* heading */}
          <div className="heading mt-2">
            <h1 className="text-white text-lg font-medium">
              Media Dashboard Overview
            </h1>
            <h1 className="text-[#FFFFFF80] text-sm">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry&apos;s standard dummy
              text ever since the 1500s
            </h1>
          </div>

          {/* stat cards */}
          <MediaStatcard />

          {/* table */}
          <div className="main-container mt-4 h-[calc(100vh-270px)] w-full [&>section]:w-full">
            <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] w-[70%] h-full flex flex-col">
              <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
                <h2 className="text-white font-medium text-sm">
                  Upcoming Event Media Request
                </h2>

                <div className="flex items-center gap-4">
                  {/* Tabs */}
                  <nav
                    className="flex rounded-md bg-[#1b2335] p-0.5"
                    aria-label="Request type tabs"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab('events')}
                      className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                        activeTab === 'events'
                          ? 'bg-[#8B3DFF] text-white shadow-sm'
                          : 'text-[#8b93a7] hover:text-white'
                      }`}
                    >
                      Event Requests
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('individual')}
                      className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                        activeTab === 'individual'
                          ? 'bg-[#8B3DFF] text-white shadow-sm'
                          : 'text-[#8b93a7] hover:text-white'
                      }`}
                    >
                      Individual Requests
                    </button>
                  </nav>

                  <Link
                    to="/dashboard-media/events"
                    className="flex items-center gap-2 text-[#853FF9] hover:text-[#a76df9] cursor-pointer text-sm font-medium"
                  >
                    View All
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-[#CBC3D7]/65">
                    Loading events...
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-[#FF4F91]">{error}</p>
                </div>
              ) : activeTab === 'events' ? (
                renderTable()
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-[#CBC3D7]/65">
                    Individual media requests will be available soon.
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="mt-8 grid grid-cols-12 gap-3 pb-5">
            <FeedbackRatings feedbackLink="/dashboard-media/feedback" />
            <DepartmentRequestChart
              data={departmentData}
              title="Event Media Request By Department"
            />
          </div>
        </div>
      </section>

      {/* Staff Interchange Modal */}
      {selectedEventForInterchange && interchangeMediaType && (
        <MediaStaffInterchangeModal
          event={selectedEventForInterchange}
          mediaType={interchangeMediaType}
          onClose={() => {
            setSelectedEventForInterchange(null)
            setInterchangeMediaType('')
          }}
          onSuccess={fetchMediaDashboardData}
        />
      )}
    </>
  )
}

export default MediaDashboard
