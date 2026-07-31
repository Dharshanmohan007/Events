import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ArrowRight, Calendar, Check, ExternalLink, Hourglass } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import FeedbackRatings from '../../../Components/FeedbackRatings'
import { useDepartmentFeedback } from '../../../api/feedbackApi'
import smallLogo from '../../../assets/small-logo.svg'
import LogoutButton from '../../../Components/LogoutButton'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ── Pure helpers (outside component) ─────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '-'
  return date
    .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '-')
}

const getEventDateDisplay = (eventSchedule = []) => {
  const dates = eventSchedule.map((s) => s.eventDate).filter(Boolean)
  if (dates.length === 0) return '-'
  const first = formatDate(dates[0])
  if (dates.length === 1) return first
  return `${first} +${dates.length - 1}`
}

const deriveVideoStatus = (videoRequirements = []) => {
  const statuses = videoRequirements.map((r) => r.status).filter(Boolean)
  if (statuses.length === 0) return '-'
  const hasPending = statuses.some((s) => String(s).toLowerCase().includes('pending'))
  if (hasPending) return 'Pending for Acknowledge'
  return statuses[0]
}

const transformVideoEvents = (events = []) =>
  events.map((event) => ({
    _id: event._id,
    eventName: event.eventName || '-',
    eventDate: getEventDateDisplay(event.eventSchedule),
    department: event.organizingDepartment || '-',
    status: deriveVideoStatus(event.videoRequirements || event.posterRequirements),
  }))

// ── Static data ──────────────────────────────────────────────────────────

const statGroups = [
  {
    title: 'Event Video Media Request',
    cards: [
      { label: 'Total Request', value: 50, icon: Calendar, className: 'from-[#3A286F] to-[#5B1B8F]', iconBg: 'bg-[#A78BFA]' },
      { label: 'Completed Request', value: 50, icon: Check, className: 'from-[#143D40] to-[#0B8C64]', iconBg: 'bg-[#45D6A4]' },
      { label: 'Acknowledged', value: 50, icon: Check, className: 'from-[#1A2A63] to-[#2921A3]', iconBg: 'bg-[#8EA0FF]' },
      { label: 'Pending Acknowledgement', value: 50, icon: Hourglass, className: 'from-[#3B213A] to-[#8C174B]', iconBg: 'bg-[#FF6DB3]' },
    ],
  },
  {
    title: 'Individual Video Media Request',
    cards: [
      { label: 'Total Request', value: 50, icon: Calendar, className: 'from-[#3A286F] to-[#5B1B8F]', iconBg: 'bg-[#A78BFA]' },
      { label: 'Completed Request', value: 50, icon: Check, className: 'from-[#143D40] to-[#0B8C64]', iconBg: 'bg-[#45D6A4]' },
      { label: 'Acknowledged', value: 50, icon: Check, className: 'from-[#1A2A63] to-[#2921A3]', iconBg: 'bg-[#8EA0FF]' },
      { label: 'Pending Acknowledgement', value: 50, icon: Hourglass, className: 'from-[#3B213A] to-[#8C174B]', iconBg: 'bg-[#FF6DB3]' },
    ],
  },
]

const chartData = [
  { name: 'CSE', value: 25, color: '#74B9FF' },
  { name: 'AI&ML', value: 55, color: '#159283' },
  { name: 'EEE', value: 12, color: '#68DF85' },
  { name: 'VLSI', value: 8, color: '#3352C8' },
]

// ── Sub-components ───────────────────────────────────────────────────────

const DashboardHeader = () => {
  const location = useLocation();
  const isRequests = location.pathname.includes('/dashboard-video/requests');

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-6 py-3">
      <div className="flex items-center gap-6">
        <img src={smallLogo} alt="Logo" className="h-11 w-11" />
        <nav className="flex items-center gap-8 text-sm">
          <Link to="/dashboard-video" className={`pb-2 ${!isRequests ? 'border-b border-[#8B3DFF] font-semibold text-[#8B3DFF]' : 'text-[#FFFFFF80] hover:text-white'}`}>
            Dashboard
          </Link>
          <Link to="/dashboard-video/requests" className={`pb-2 ${isRequests ? 'border-b border-[#8B3DFF] font-semibold text-[#8B3DFF]' : 'text-[#FFFFFF80] hover:text-white'}`}>
            Request List
          </Link>
          <Link to="/calendar" className="pb-2 text-[#FFFFFF80] hover:text-white">
            Calendar
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <LogoutButton />
      </div>
    </header>
  );
}

const StatGroup = ({ title, cards }) => (
  <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] p-2">
    <h2 className="text-lg font-medium text-white">{title}</h2>
    <div className="mt-4 grid grid-cols-2 gap-3">
      {cards.map(({ label, value, icon, className, iconBg }) => {
        const IconComponent = icon
        return (
          <article key={label} className={`flex h-[70px] justify-between rounded-lg bg-gradient-to-r ${className} px-3 py-3`}>
            <div>
              <p className="text-sm text-white">{label}</p>
              <p className="text-xl font-medium text-white">{value}</p>
            </div>
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
              <IconComponent size={17} className="text-white" />
            </span>
          </article>
        )
      })}
    </div>
  </section>
)

const Status = ({ status }) => {
  const isPending = String(status).toLowerCase().includes('pending')
  return (
    <span className={`inline-flex items-center gap-2 font-semibold ${isPending ? 'text-[#F20768]' : 'text-[#20D18C]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isPending ? 'bg-[#F20768]' : 'bg-[#20D18C]'}`} />
      {status}
    </span>
  )
}

// ── Main component ───────────────────────────────────────────────────────

const VideoDashboard = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('events')
  const [eventStats, setEventStats] = useState(null)
  const [individualStats, setIndividualStats] = useState(null)
  const feedbackRows = useDepartmentFeedback('video')

  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    Promise.all([
      fetch(`${API_BASE_URL}/api/dashboard/stats?module=video`, { headers }),
      fetch(`${API_BASE_URL}/api/dashboard/individual-stats?module=video`, { headers }),
    ])
      .then(([eventRes, individualRes]) => Promise.all([
        eventRes.ok ? eventRes.json() : Promise.resolve({}),
        individualRes.ok ? individualRes.json() : Promise.resolve({}),
      ]))
      .then(([eventData, individualData]) => {
        if (isMounted) {
          setEventStats(eventData.modules?.video ?? eventData.events ?? null)
          setIndividualStats(individualData.stats ?? null)
        }
      })
      .catch((error) => console.warn(error.message))

    return () => { isMounted = false }
  }, [])

  // ── Individual tab state ────────────────────────────────────────────────
  const [individualRequests, setIndividualRequests] = useState([])
  const [individualLoading, setIndividualLoading] = useState(false)
  const [individualError, setIndividualError] = useState('')
  const individualFetchedRef = useRef(false)

  useEffect(() => {
    const abortController = new AbortController()

    const fetchVideoEvents = async () => {
      setLoading(true)
      setError('')

      try {
        const token = localStorage.getItem('token')
        if (!token) throw new Error('Authentication token not found')

        const decoded = jwtDecode(token)
        const email = decoded?.email
        if (!email) throw new Error('Email not found in token')

        const url = `${API_BASE_URL}/api/dashboard/video-dashboard?email=${encodeURIComponent(email)}`

        const response = await fetch(url, {
          signal: abortController.signal,
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error(`API request failed with status ${response.status}`)

        const json = await response.json()
        if (json.events && Array.isArray(json.events)) {
          setEvents(transformVideoEvents(json.events))
        } else {
          setEvents([])
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Failed to fetch video dashboard data:', err)
        setError(err.message || 'Failed to load video requests')
      } finally {
        if (!abortController.signal.aborted) setLoading(false)
      }
    }

    fetchVideoEvents()
    return () => abortController.abort()
  }, [])

  const EMPTY_STATS = {
    total: 0,
    approved: 0,
    completed: 0,
    pending: 0,
    rejected: 0,
  }

  const displayStatGroups = useMemo(() => {
    if (!eventStats && !individualStats) return statGroups

    const eventValues = eventStats ?? EMPTY_STATS
    const individualValues = individualStats ?? EMPTY_STATS

    return statGroups.map((group) => {
      const isEventSection = group.title.toLowerCase().includes('event')
      const isIndividualSection = group.title.toLowerCase().includes('individual')
      const stats = isEventSection ? eventValues : (isIndividualSection ? individualValues : EMPTY_STATS)

      return {
        ...group,
        cards: group.cards.map((card) => {
          const label = card.label.toLowerCase()

          if (label.includes('total')) {
            return { ...card, value: stats.total ?? 0 }
          }

          if (label.includes('completed')) {
            return { ...card, value: stats.completed ?? 0 }
          }

          if (label.includes('pending')) {
            return { ...card, value: stats.pending ?? 0 }
          }

          if (label.includes('acknowledged')) {
            return { ...card, value: stats.approved ?? 0 }
          }

          return card
        }),
      }
    })
  }, [eventStats, individualStats])

  // ── Fetch individual video requests ─────────────────────────────────────
  const fetchIndividualRequests = useCallback(async () => {
    try {
      setIndividualLoading(true)
      setIndividualError('')
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const response = await fetch(
        `${API_BASE_URL}/api/individual-submissions/video`,
        { headers }
      )

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const json = await response.json()
      const data = json.data || json.results || json
      if (Array.isArray(data)) {
        setIndividualRequests(data)
      } else {
        setIndividualRequests([])
      }
    } catch (err) {
      console.error('Failed to fetch individual video requests:', err)
      setIndividualError(err.message || 'Failed to load individual requests')
    } finally {
      setIndividualLoading(false)
    }
  }, [])

  // ── Reset fetch flag when tab changes ───────────────────────────────────
  useEffect(() => {
    individualFetchedRef.current = false
  }, [activeTab])

  // ── Fetch individual data when tab switches to 'individual' ───────────
  useEffect(() => {
    if (activeTab === 'individual' && !individualFetchedRef.current && !individualLoading) {
      individualFetchedRef.current = true
      fetchIndividualRequests()
    }
  }, [activeTab, individualLoading, fetchIndividualRequests])

  const headers = ['Event Name', 'Event Date', 'Dept', 'Status', 'Action']
  const individualHeaders = ['Request No', 'Employee', 'Emp ID', 'Dept', 'Media Type', 'Priority', 'Delivery Date', 'Status', 'Action']

  const renderTable = () => {
    if (events.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-[#CBC3D7]/65">No video event requests found.</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto overflow-y-auto flex-1 table-custom-scrollbar">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-[#151c2c]">
            <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
              {headers.map((header) => (
                <th
                  key={header}
                  className={`px-6 py-4 font-semibold ${header === 'Action' ? 'text-center' : ''}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const isPending = String(event.status).toLowerCase().includes('pending')
              return (
                <tr
                  key={event._id}
                  className="border-t border-[#20283a] text-sm text-white whitespace-nowrap"
                >
                  <td className="px-6 py-4 font-medium">{event.eventName}</td>
                  <td className="px-6 py-4">{event.eventDate}</td>
                  <td className="px-6 py-4">{event.department}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 ${
                        isPending ? 'text-[#F20768]' : 'text-[#20D18C]'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isPending ? 'bg-[#F20768]' : 'bg-[#20D18C]'
                        }`}
                      />
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/dashboard-video/detailView/${event._id}`}
                      className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white"
                      aria-label={`View details for ${event.eventName}`}
                    >
                      <ExternalLink size={17} />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  // ── Render individual table ────────────────────────────────────────────
  const renderIndividualTable = () => {
    if (individualRequests.length === 0) {
      return (
        <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-sm text-[#CBC3D7]/65">No individual video requests found.</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto overflow-y-auto flex-1 table-custom-scrollbar">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-[#151c2c]">
            <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
              {individualHeaders.map((header) => (
                <th
                  key={header}
                  className={`px-6 py-4 font-semibold ${header === 'Action' ? 'text-center' : ''}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {individualRequests.map((item) => {
              const data = item.data || {}
              const emp = data.employee || item.employeeDetail || {}
              const requestNo = data.requestNo || item.requestNo || '-'
              const empName = item.employee || emp.name || '-'
              const empId = emp.empId || '-'
              const dept = emp.department || '-'
              const mediaTypes = Array.isArray(data.typeOfMedia)
                ? data.typeOfMedia.join(', ')
                : data.typeOfMedia || 'Video'
              const status = item.finalStatus || item.status || '-'
              const isPending = String(status).toLowerCase().includes('pending')
              const videoPriority = data.video?.priority || 'Medium'
              const deliveryDate = formatDate(data.video?.deliveryDate)

              return (
                <tr
                  key={item.id || item._id}
                  className="border-t border-[#20283a] text-sm text-white whitespace-nowrap"
                >
                  <td className="px-6 py-4 font-medium">{requestNo}</td>
                  <td className="px-6 py-4">{empName}</td>
                  <td className="px-6 py-4">{empId}</td>
                  <td className="px-6 py-4">{dept}</td>
                  <td className="px-6 py-4">{mediaTypes}</td>
                  <td className="px-6 py-4">
                    <span className="text-[#F20768] font-semibold">{videoPriority}</span>
                  </td>
                  <td className="px-6 py-4">{deliveryDate}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 ${isPending ? 'text-[#F20768]' : 'text-[#20D18C]'}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${isPending ? 'bg-[#F20768]' : 'bg-[#20D18C]'}`}
                      />
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <Link
                        to={`/dashboard-video/individualDetailView/${item.id || item._id}`}
                        className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white"
                        aria-label={`View details for ${requestNo}`}
                      >
                        <ExternalLink size={17} />
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      <section className="min-h-screen overflow-auto bg-[#0b1326] pt-16.25 text-white poppins table-custom-scrollbar">
      <DashboardHeader />
      <main className="px-6 py-5">
        <h1 className="text-lg font-medium">Dashboard Overview</h1>
        <p className="mt-1 mb-1 text-sm text-[#FFFFFF80]">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {displayStatGroups.map((group) => <StatGroup key={group.title} {...group} />)}
        </div>

        <div className="mt-7">
          <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
              <h2 className="text-white font-medium text-sm">Upcoming Video Requests</h2>

              <div className="flex items-center gap-4">
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
                    Events
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
                    Individual
                  </button>
                </nav>
              </div>
            </div>

            {loading && activeTab === 'events' ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <p className="text-sm text-[#CBC3D7]/65">Loading video requests...</p>
              </div>
            ) : error && activeTab === 'events' ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <p className="text-sm text-[#FF4F91]">{error}</p>
              </div>
            ) : activeTab === 'events' ? (
              renderTable()
            ) : activeTab === 'individual' && individualLoading ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <p className="text-sm text-[#CBC3D7]/65">Loading individual video requests...</p>
              </div>
            ) : activeTab === 'individual' && individualError ? (
              <div className="flex flex-1 items-center justify-center py-12">
                <p className="text-sm text-[#FF4F91]">{individualError}</p>
              </div>
            ) : activeTab === 'individual' ? (
              renderIndividualTable()
            ) : null}
          </section>
        </div>

        <div className="mt-8 grid grid-cols-12 gap-3">
          <FeedbackRatings rows={feedbackRows} feedbackLink="/dashboard-video/feedback" />
          <DepartmentRequestChart data={chartData} title="Event Video Request By Department" />
        </div>
      </main>
      </section>


    </>
  )
}

export default VideoDashboard
