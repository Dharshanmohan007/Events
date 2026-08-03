import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Bell, CircleQuestionMark, Download, Search, Settings,Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { buildEventTemplate } from '../../../templates/eventTemplate'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import smallLogo from '../../../assets/small-logo.svg'
import LogoutButton from '../../../Components/LogoutButton'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
}
const eventReportRows = Array.from({ length: 9 }, (_, index) => ({
    eventName: 'Welcome Freshers',
    eventType: 'Seminar',
    eventVenue: 'Main Board Room',
    eventDate: '15-03-2026',
    status: [1, 6, 7, 8].includes(index) ? 'Not Completed' : 'Completed',
}))

const individualReportRows = Array.from({ length: 9 }, (_, index) => ({
    eventName: 'Dharsan',
    eventType: 'Individual',
    eventVenue: index % 2 === 0 ? 'Main Board Room' : 'Vista Hall',
    eventDate: '15-03-2026',
    status: [2, 5, 8].includes(index) ? 'Not Completed' : 'Completed',
}))

const PosterHeader = () => (
    <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#1d2638] bg-[#0a0e18] px-6 py-3">
        <div className="flex items-center gap-8">
            <img src={smallLogo} alt="Logo" className="h-11 w-11" />
            <nav className="flex items-center gap-8 text-sm font-medium">
                <Link to="/dashboard-poster" className="pb-2 text-[#FFFFFF80] hover:text-white">Dashboard</Link>
                <Link to="/dashboard-poster/requests" className="pb-2 text-[#FFFFFF80] hover:text-white">Request List</Link>
                <Link to="/calendar" className="pb-2 text-[#FFFFFF80] hover:text-white">Calendar</Link>
                <Link to="/dashboard-poster/reports" className="border-b border-[#8B3DFF] pb-2 text-[#8B3DFF]">Reports</Link>
                <Link to="/dashboard-poster/feedback" className="pb-2 text-[#FFFFFF80] hover:text-white">Feedback</Link>
            </nav>
        </div>

        <div className="flex items-center gap-6">
            <LogoutButton />
        </div>
    </header>
)

const derivePosterStatus = (posterRequirements = []) => {
  if (!Array.isArray(posterRequirements)) return '-'
  const statuses = posterRequirements.map((r) => r.status).filter(Boolean)
  if (statuses.length === 0) return '-'
  const hasPending = statuses.some((s) => String(s).toLowerCase().includes('pending'))
  if (hasPending) return 'Pending for Acknowledge'
  const allCompleted = statuses.every((s) => String(s).toLowerCase().includes('completed'))
  if (allCompleted) return 'Completed'
  return statuses[0] || '-'
}

// ── Components ───────────────────────────────────────────────────────────────

const ReportStatus = ({ status }) => {
  const completed = String(status).toLowerCase().includes('completed')
  return (
    <span className={`inline-flex items-center gap-2 font-semibold ${completed ? 'text-[#20D18C]' : 'text-[#F20768]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${completed ? 'bg-[#20D18C]' : 'bg-[#F20768]'}`} />
      {status || '-'}
    </span>
  )
}

const TableSkeleton = ({ cols }) => (
  <tbody>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-b border-[#20283a] last:border-b-0">
        {Array.from({ length: cols }).map((_, j) => (
          <td key={j} className="px-5 py-4">
            <div className="h-4 w-full animate-pulse rounded bg-[#20283a]" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
)

const ReportSelectFilter = ({ value, onChange, options, label }) => (
  <div className="flex h-9 items-center gap-2 rounded-md border border-[#343b4a] bg-[#232A3C] px-3 text-xs text-white">
    <span className="text-[#8b93a4]">{label}:</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-transparent outline-none cursor-pointer"
    >
      <option value="all">All</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
)

// ── Main Page ────────────────────────────────────────────────────────────────

const PosterReportsPage = () => {
  const [activeTab, setActiveTab] = useState('events')
  
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  const [individualRows, setIndividualRows] = useState([])
  const [individualLoading, setIndividualLoading] = useState(true)
  const individualFetchedRef = useRef(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // ── Fetch Event Requests ───────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem('token')
    if (!token) {
      setEventsLoading(false)
      return
    }

    ;(async () => {
      try {
        const decoded = jwtDecode(token)
        const email = decoded?.email
        if (!email) {
          console.error("Email not found in token")
          return
        }

        const res = await fetch(
          `${API_BASE_URL}/api/table/dashboard-table?module=poster`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const json = await res.json()
        const eventData = json.events || json.data || []
        
        if (isMounted) {
          setEvents(
            eventData.map((r) => {
              const schedule = r.eventSchedule || r.schedule || []
              const dates = r.dates || (schedule.length > 0 ? schedule.map((s) => s.eventDate || s.date) : [])
              const eventDate =
                dates.length > 0
                  ? `${formatDate(dates[0])}${dates.length > 1 ? ` +${dates.length - 1}` : ''}`
                  : formatDate(r.date || r.eventDate || r.requiredDate || r.createdAt)

              const venuesList = Array.isArray(r.venues)
                ? r.venues.map((v) => (typeof v === 'object' && v !== null ? v.venueName || v.venue || '-' : v))
                : typeof r.venues === 'object' && r.venues !== null
                ? [r.venues.venueName || r.venues.venue || '-']
                : []
              const venueStr = venuesList.length > 0 ? venuesList.join(', ') : r.eventVenue || r.venue || '-'

              let status = derivePosterStatus(r.poster || r.posterRequirements)
              if (status === '-') {
                status = r.eventStatus || r.departmentStatus || r.overallStatus || r.status || '-'
              }

              return {
                id: r.id || r._id || r.eventId,
                eventName: r.eventName || r.name || '-',
                eventType: r.eventType || r.typeOfEvent || 'Seminar',
                eventVenue: venueStr,
                eventDate,
                status,
                raw: r
              }
            })
          )
        }
      } catch (err) {
        console.error('Failed to fetch poster events:', err)
      } finally {
        if (isMounted) setEventsLoading(false)
      }
    })()

    return () => { isMounted = false }
  }, [])

  // ── Fetch Individual Requests ──────────────────────────────────────────────
  const fetchIndividualRequests = useCallback(async () => {
    let isMounted = true
    const token = localStorage.getItem('token')
    if (!token) {
      setIndividualLoading(false)
      return
    }

    try {
      setIndividualLoading(true)
      const res = await fetch(
        `${API_BASE_URL}/api/individual-submissions/poster`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const json = await res.json()
      const data = json.data || json.results || json
      if (Array.isArray(data) && isMounted) {
        setIndividualRows(
          data.map((r) => ({
            id: r.id || r._id,
            eventName: r.eventName || r.employee || '-',
            eventType: r.eventType || r.formType || r.mediaType || 'Individual',
            eventVenue: r.eventVenue || r.venue || '-',
            eventDate: formatDate(r.date || r.requiredDate || r.createdAt),
            status: r.status || r.overallStatus || '-',
            raw: r
          }))
        )
      } else if (isMounted) {
        setIndividualRows([])
      }
    } catch (err) {
      console.error('Failed to fetch individual poster submissions:', err)
    } finally {
      if (isMounted) setIndividualLoading(false)
    }
  }, [])

  useEffect(() => {
    individualFetchedRef.current = false
  }, [activeTab])

  useEffect(() => {
    if (activeTab === 'individual' && !individualFetchedRef.current && !individualLoading) {
      individualFetchedRef.current = true
      fetchIndividualRequests()
    }
  }, [activeTab, individualLoading, fetchIndividualRequests])

  // ── Derived State & Filtering ──────────────────────────────────────────────
  const eventStatusOptions = useMemo(() => [...new Set(events.map((e) => e.status).filter(Boolean))], [events])
  const individualStatusOptions = useMemo(() => [...new Set(individualRows.map((r) => r.status).filter(Boolean))], [individualRows])

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return events.filter((e) => {
      const matchSearch = !q || [e.eventName, e.eventType, e.eventVenue, e.eventDate, e.status].join(' ').toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || e.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [events, searchQuery, statusFilter])

  const filteredIndividual = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return individualRows.filter((r) => {
      const matchSearch = !q || [r.eventName, r.eventType, r.eventVenue, r.eventDate, r.status].join(' ').toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [individualRows, searchQuery, statusFilter])

  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setSearchQuery('')
    setStatusFilter('all')
  }

  const isLoading = activeTab === 'events' ? eventsLoading : individualLoading
  const currentData = activeTab === 'events' ? filteredEvents : filteredIndividual
  const statusOptions = activeTab === 'events' ? eventStatusOptions : individualStatusOptions

  // ── Download Handler ───────────────────────────────────────────────────────
  const downloadRow = async (row, tabType) => {
    try {
      const token = localStorage.getItem('token')
      // Note: VideoReports uses `/api/events/${row.id}` for events, but individual endpoints can differ.
      const endpoint = tabType === 'events' 
        ? `${API_BASE_URL}/api/events/${row.id}`
        : `${API_BASE_URL}/api/individual-submissions/${row.id}`
        
      const res = await fetch(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      
      const json = await res.json()
      let fullEventData = null
      if (json.success && json.event) {
        fullEventData = json.event
      } else if (json.data) {
        fullEventData = json.data
      }
      
      const payload = fullEventData || json
      const htmlString = buildEventTemplate(payload)
      
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      document.body.appendChild(iframe)
      
      iframe.contentWindow.document.open()
      iframe.contentWindow.document.write(htmlString)
      iframe.contentWindow.document.close()
      
      iframe.contentWindow.focus()
      setTimeout(() => {
        iframe.contentWindow.print()
        document.body.removeChild(iframe)
      }, 500)
    } catch (err) {
      console.error('Failed to download report:', err)
      alert('Failed to generate report. Please try again.')
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-[#0b1326] font-poppins">
      <DashboardHeader basePath="/dashboard-poster" />

      <main className="px-6 pb-10">
        {/* Page header row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-5 pb-5">
          <div>
            <h1 className="text-[22px] font-semibold text-white">Reports</h1>
            <p className="mt-1 text-sm text-[#FFFFFF80]">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s
            </p>
          </div>

          {/* Pill-toggle */}
          <nav className="flex rounded-md bg-[#1b2335] p-0.5" aria-label="Request type tabs">
            <button
              type="button"
              onClick={() => handleTabSwitch('events')}
              className={`rounded px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-[#8B3DFF] text-white shadow'
                  : 'text-[#FFFFFF80] hover:text-white'
              }`}
            >
              Event Request Report
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('individual')}
              className={`rounded px-6 py-2 text-sm font-medium transition-colors ${
                activeTab === 'individual'
                  ? 'bg-[#8B3DFF] text-white shadow'
                  : 'text-[#FFFFFF80] hover:text-white'
              }`}
            >
              Individual Request Report
            </button>
          </nav>
        </div>

        {/* Table container */}
        <div className="mt-2 rounded-xl border border-[#2a3347] bg-[#151c2c]">
          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-end gap-3 px-5 py-4">
            {/* Search */}
            <div className="flex h-9 w-[285px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#232A3C] px-3">
              <Search size={14} className="text-[#8b93a4]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]"
                placeholder="Search events, venues"
              />
            </div>

            {/* Status Filter */}
            <ReportSelectFilter
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              label="Status"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-auto table-custom-scrollbar">
            <table className="w-full min-w-[800px]">
              <thead className="sticky top-0 bg-[#151c2c] z-10">
                <tr className="border-y border-[#1d2638] bg-[#1b2335]">
                  {['EVENT NAME', 'EVENT TYPE', 'EVENT VENUE', 'EVENT DATE', 'STATUS', 'ACTION'].map((col) => (
                    <th
                      key={col}
                      className={`px-5 py-4 text-[10px] font-semibold uppercase tracking-wide text-[#7f8799] ${col === 'ACTION' ? 'text-center' : 'text-left'}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {isLoading ? (
                <TableSkeleton cols={6} />
              ) : (
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#FFFFFF66]">
                        No data found.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-[#20283a] last:border-b-0 transition-colors hover:bg-[#161d2e] text-sm whitespace-nowrap text-white"
                      >
                        <td className="px-5 py-4 font-medium">{row.eventName}</td>
                        <td className="px-5 py-4">{row.eventType}</td>
                        <td className="px-5 py-4">{row.eventVenue}</td>
                        <td className="px-5 py-4">{row.eventDate}</td>
                        <td className="px-5 py-4">
                          <ReportStatus status={row.status} />
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            title="Download row as PDF"
                            onClick={() => downloadRow(row, activeTab)}
                            className="text-[#8b93a7] transition hover:text-white inline-flex items-center justify-center"
                          >
                            <Download size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}
            </table>
          </div>
        </div>
      </main>
    </section>
  )
}

export default PosterReportsPage
