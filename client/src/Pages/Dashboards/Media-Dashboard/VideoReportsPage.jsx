import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'
import { Search, ListFilter, Download, ChevronDown, Bell, CircleQuestionMark, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildEventTemplate } from '../../../templates/eventTemplate'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
}

export const deriveVideoStatus = (videoRequirements = []) => {
  if (!Array.isArray(videoRequirements)) return '-'
  const statuses = videoRequirements.map((r) => r.status).filter(Boolean)
  if (statuses.length === 0) return '-'
  const hasPending = statuses.some((s) => String(s).toLowerCase().includes('pending'))
  if (hasPending) return 'Pending for Acknowledge'
  return statuses[0]
}

// ── Status badge ─────────────────────────────────────────────────────────────
const POSITIVE_STATUSES = ['closed', 'approved', 'completed', 'accepted', 'acknowledged']

const ReportStatus = ({ status }) => {
  const label = status || 'Pending'
  const isPositive = POSITIVE_STATUSES.includes(String(label).toLowerCase())
  return (
    <span
      className={`flex items-center gap-1.5 text-[11px] font-semibold ${
        isPositive ? 'text-[#34D399]' : 'text-[#F87171]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPositive ? 'bg-[#34D399]' : 'bg-[#F87171]'
        }`}
      />
      {label}
    </span>
  )
}

// ── Dropdown filter ──────────────────────────────────────────────────────────
const ReportSelectFilter = ({ value, onChange, options, label }) => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const selectedLabel = value === 'all' ? label : value

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 rounded-md border bg-[#171f31] px-4 py-2 text-xs text-white transition ${
          open ? 'border-[#8B5CF6]' : 'border-[#343b4a] hover:border-[#8B5CF6]'
        }`}
      >
        <ListFilter size={13} className="text-[#8b93a4]" />
        {selectedLabel}
        <ChevronDown size={12} className={`text-[#8b93a4] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 min-w-[140px] max-w-[200px] overflow-hidden rounded-lg border border-[#343b4a] bg-[#171f31] shadow-xl">
          <div className="max-h-[260px] overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => { onChange('all'); setOpen(false) }}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#232a3c] ${
                value === 'all' ? 'text-[#8B5CF6]' : 'text-gray-300'
              }`}
            >
              All
            </button>
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => { onChange(option); setOpen(false) }}
                className={`block w-full px-4 py-2 text-left text-sm hover:bg-[#232a3c] ${
                  value === option ? 'text-[#8B5CF6]' : 'text-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Loading skeleton ─────────────────────────────────────────────────────────
const TableSkeleton = ({ cols = 7 }) => (
  <tbody>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i} className="border-b border-[#1d2638]">
        {Array.from({ length: cols }).map((__, j) => (
          <td key={j} className="px-5 py-3.5">
            <div className="h-3 w-full animate-pulse rounded bg-[#1d2638]" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
)

const VideoReportsPage = () => {
  const [activeTab, setActiveTab] = useState('events')
  
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  const [individualRows, setIndividualRows] = useState([])
  const [individualLoading, setIndividualLoading] = useState(false)
  const individualFetchedRef = useRef(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // ── Fetch event requests ───────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem('token')
    if (!token) { setEventsLoading(false); return }

    ;(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/table/dashboard-table?module=video`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const json = await res.json()
        if (json.data && isMounted) {
          setEvents(
            (json.data || []).map((ev) => {
              let status = deriveVideoStatus(ev.video || ev.videoRequirements)
              if (status === '-') {
                status = ev.eventStatus || ev.departmentStatus || ev.overallStatus || ev.status || '-'
              }

              return {
                id: ev.eventId || ev.id || ev._id,
                eventName: ev.eventName || ev.name || '-',
                eventType: ev.eventType || '-',
                eventVenue: Array.isArray(ev.venues) 
                  ? ev.venues.map(v => typeof v === 'object' && v !== null ? (v.venueName || v.venue || v.name || '-') : String(v)).join(', ') 
                  : (typeof ev.venues === 'object' && ev.venues !== null ? (ev.venues.venueName || ev.venues.venue || ev.venues.name || '-') : (ev.venues || ev.venue || '-')),
                eventDate: (Array.isArray(ev.dates) && ev.dates.length > 0) 
                    ? `${formatDate(ev.dates[0])}${ev.dates.length > 1 ? ` +${ev.dates.length - 1}` : ''}`
                    : formatDate(ev.dates || ev.eventDate || ev.requiredDate || ev.eventSchedule?.[0]?.eventDate),
                department: ev.organizingDepartment || ev.department || '-',
                status,
              }
            })
          )
        }
      } catch (err) {
        // Ignore silently
      } finally {
        if (isMounted) setEventsLoading(false)
      }
    })()

    return () => { isMounted = false }
  }, [])

  // ── Fetch individual requests ──────────────────────────────────────────────
  const fetchIndividualRequests = useCallback(async () => {
    let isMounted = true
    const token = localStorage.getItem('token')
    if (!token) { setIndividualLoading(false); return }

    try {
      setIndividualLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/individual-submissions/video`, {
        headers: { Authorization: `Bearer ${token}` },
      })
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
            department: r.department || r.organizingDepartment || '-',
            status: r.status || r.overallStatus || '-',
          }))
        )
      } else if (isMounted) {
        setIndividualRows([])
      }
    } catch (err) {
      // Ignore silently
    } finally {
      if (isMounted) setIndividualLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'individual' && !individualFetchedRef.current && !individualLoading) {
      individualFetchedRef.current = true
      fetchIndividualRequests()
    }
  }, [activeTab, individualLoading, fetchIndividualRequests])

  // ── Dynamic filtering options ──────────────────────────────────────────────
  const eventTypeOptions = useMemo(
    () => [...new Set(events.map((e) => e.eventType).filter(Boolean))],
    [events]
  )
  const eventStatusOptions = useMemo(
    () => [...new Set(events.map((e) => e.status).filter(Boolean))],
    [events]
  )

  const individualFormTypeOptions = useMemo(
    () => [...new Set(individualRows.map((r) => r.eventType).filter(Boolean))],
    [individualRows]
  )
  const individualStatusOptions = useMemo(
    () => [...new Set(individualRows.map((r) => r.status).filter(Boolean))],
    [individualRows]
  )

  // ── Client-side filtering ──────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return events.filter((e) => {
      const matchSearch =
        !q ||
        [e.eventName, e.eventDate, e.department, e.status]
          .join(' ')
          .toLowerCase()
          .includes(q)
      const matchStatus = statusFilter === 'all' || e.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [events, searchQuery, statusFilter])

  const filteredIndividual = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return individualRows.filter((r) => {
      const matchSearch =
        !q ||
        [r.eventName, r.eventDate, r.department, r.status]
          .join(' ')
          .toLowerCase()
          .includes(q)
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
  const downloadRow = async (row, tabContext) => {
    if (tabContext === 'individual') {
      const lines = [
        ['Field', 'Value'],
        ['Event Name', row.eventName || '-'],
        ['Event Date', row.eventDate || '-'],
        ['Dept', row.department || '-'],
        ['Status', row.status || '-'],
      ]
      const csv = lines.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `video-individual-${row.id}.csv`
      a.click()
      URL.revokeObjectURL(url)
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/events/${row.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const detailJson = await res.json()
      
      let fullEventData = null
      if (detailJson.success && detailJson.event) {
        fullEventData = detailJson.event
      } else if (detailJson.data) {
        fullEventData = detailJson.data
      }
      
      const payload = fullEventData || {}
      const htmlString = buildEventTemplate(payload)
      
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      document.body.appendChild(iframe)

      const iframeDoc = iframe.contentWindow || iframe.contentDocument
      iframeDoc.document.open()
      iframeDoc.document.write(htmlString)
      iframeDoc.document.close()

      iframe.onload = () => {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
        setTimeout(() => document.body.removeChild(iframe), 1000)
      }
    } catch (err) {
      alert('Could not generate PDF. Please try again.')
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-[#0b1326] font-poppins">
      <DashboardHeader basePath="/dashboard-video" />

      <main className="px-6 pb-10">
        {/* Page header row — title/subtitle left, pill-toggle right */}
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
              className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === 'events'
                  ? 'bg-[#8B3DFF] text-white shadow-sm'
                  : 'text-[#8b93a7] hover:text-white'
              }`}
            >
              Event Request Report
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('individual')}
              className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                activeTab === 'individual'
                  ? 'bg-[#8B3DFF] text-white shadow-sm'
                  : 'text-[#8b93a7] hover:text-white'
              }`}
            >
              Individual Request Report
            </button>
          </nav>
        </div>

        {/* Table card */}
        <div className="mt-5 rounded-xl border border-[#1d2638] bg-[#111827]">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-end gap-3 px-5 py-4">
            {/* Search */}
            <div className="flex w-[260px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#161a23] px-3 py-2">
              <Search size={14} className="shrink-0 text-[#8b93a4]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, venues"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]"
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
            <table className="w-full min-w-[900px]">
              <thead className="sticky top-0 bg-[#151c2c] z-10">
                <tr className="border-y border-[#1d2638] bg-[#1b2335]">
                  {['EVENT NAME', 'EVENT TYPE', 'EVENT VENUE', 'EVENT DATE', 'DEPT', 'STATUS', 'ACTION'].map((col) => (
                    <th
                      key={col}
                      className={`px-5 py-3 text-[10px] font-semibold tracking-wide text-[#7f8799] ${col === 'ACTION' ? 'text-center' : 'text-left'}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {isLoading ? (
                <TableSkeleton cols={7} />
              ) : (
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#FFFFFF66]">
                        No data found.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-[#20283a] last:border-b-0 transition-colors hover:bg-[#161d2e] text-sm whitespace-nowrap"
                      >
                        <td className="px-5 py-4 font-medium text-white">{row.eventName}</td>
                        <td className="px-5 py-4 text-white">{row.eventType}</td>
                        <td className="px-5 py-4 text-white">{row.eventVenue}</td>
                        <td className="px-5 py-4 text-white">{row.eventDate}</td>
                        <td className="px-5 py-4 text-white">{row.department}</td>
                        <td className="px-5 py-4">
                          <ReportStatus status={row.status} />
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            title="Download row as PDF"
                            onClick={() => downloadRow(row, activeTab)}
                            className="text-[#FFFFFF66] transition hover:text-white inline-flex items-center justify-center"
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

export default VideoReportsPage
