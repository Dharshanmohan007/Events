import React, { useState, useEffect, useMemo, useRef } from 'react'
import { jwtDecode } from 'jwt-decode'
import { Search, ListFilter, Download, ChevronDown } from 'lucide-react'
import FacultyDahsboardHeader from './FacultyDahsboardHeader'
import { buildEventTemplate } from '../../../templates/eventTemplate'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ─── Status badge (mirrors FacultyLatestEventsRequestTable) ──────────────────
const POSITIVE_STATUSES = ['closed', 'approved', 'completed', 'accepted', 'acknowledged']

const ReportStatus = ({ status }) => {
  const label = status || 'Pending'
  const isPositive = POSITIVE_STATUSES.includes(label.toLowerCase())
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

// ─── Dropdown filter (mirrors FacultyVenueListPage's SelectFilter) ────────────
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
        <div className="absolute right-0 z-30 mt-2 min-w-full overflow-hidden rounded-lg border border-[#343b4a] bg-[#171f31] shadow-xl">
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

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const TableSkeleton = ({ cols = 6 }) => (
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

// ─── CSV / PDF Download Helper ────────────────────────────────────────────────
const downloadRow = async (row, tabContext) => {
  if (tabContext === 'events') {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/events/${row.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      console.log('[PDF Fetch] Raw response for', row.id, ':', json)

      // The backend might return { success: true, data: {...} } or { success: true, event: {...} } 
      // or just the raw event object containing requestDetails.
      const eventData = json.data || json.event || (json.requestDetails ? json : null)

      if (eventData) {
        // Generate HTML from template
        const html = buildEventTemplate(eventData)

        // Create a hidden iframe to print the PDF
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        document.body.appendChild(iframe)
        
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
        iframeDoc.open()
        iframeDoc.write(html)
        iframeDoc.close()

        // Wait for images/styles to load then print
        iframe.onload = () => {
          iframe.contentWindow.focus()
          iframe.contentWindow.print()
          // Clean up iframe after print dialog opens
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe)
            }
          }, 1000)
        }
      } else {
        console.error('[PDF Fetch] Failed to find event data in response:', json)
        alert(`Failed to fetch event details. See console for API response.`)
      }
    } catch (err) {
      console.error('[PDF Fetch] Error generating PDF:', err)
      alert('Error connecting to API to generate PDF.')
    }
    return
  }

  // Logic for Individual Requests (CSV Download)
  const lines = [
    ['Field', 'Value'],
    ['Organizer', row.employee],
    ['Email', row.employeeEmail],
    ['Form Type', row.formType],
    ['Venue', row.eventVenue],
    ['Date', row.createdAt],
    ['Status', row.status],
  ]

  const csv = lines
    .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `report-${row.eventName || row.employee || 'row'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Format date helper ───────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ─── Main page ────────────────────────────────────────────────────────────────
const FacultyReportsPage = () => {
  const [activeTab, setActiveTab] = useState('events')

  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  const [individualRows, setIndividualRows] = useState([])
  const [individualLoading, setIndividualLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // ── Fetch event requests ────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem('token')
    if (!token) { setEventsLoading(false); return }

    ;(async () => {
      try {
        const decoded = jwtDecode(token)
        // Prioritize facultyId since the token has both "id" and "facultyId"
        const facultyId = decoded.facultyId || decoded.id || decoded._id || decoded.userId

        const res = await fetch(
          `${API_BASE_URL}/api/table/faculty-dashboard-table?facultyId=${facultyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const json = await res.json()
        if (json.success && isMounted) {
          setEvents(
            (json.data || []).map((ev) => ({
              id: ev.eventId || ev.id || ev._id,
              eventName: ev.eventName || '-',
              eventType: ev.eventType || '-',
              eventVenue: (Array.isArray(ev.venues) && ev.venues.length > 0)
                ? ev.venues[0]
                : ev.eventVenue || ev.venue || '-',
              eventDate: formatDate(
                (Array.isArray(ev.eventDates) && ev.eventDates.length > 0)
                  ? ev.eventDates[0]
                  : ev.eventDate
              ),
              eventStatus: ev.eventStatus || ev.overallStatus || '-',
            }))
          )
        }
      } catch (err) {
        console.warn('FacultyReportsPage events:', err.message)
      } finally {
        if (isMounted) setEventsLoading(false)
      }
    })()

    return () => { isMounted = false }
  }, [])

  // ── Fetch individual submissions ────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem('token')
    if (!token) { setIndividualLoading(false); return }

    ;(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/individual-submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (json.success && isMounted) {
          setIndividualRows(
            (json.data || []).map((req) => ({
              id: req.id || req._id,
              employee: req.employee || req.employeeDetail?.name || '-',
              employeeEmail: req.employeeEmail || '-',
              formType: req.formType || '-',
              eventVenue: req.venue || req.eventVenue || '-',
              createdAt: formatDate(req.createdAt),
              status:
                typeof req.status === 'string'
                  ? req.status
                  : Object.values(req.status || {}).find(Boolean) || 'Pending',
            }))
          )
        }
      } catch (err) {
        console.warn('FacultyReportsPage individual:', err.message)
      } finally {
        if (isMounted) setIndividualLoading(false)
      }
    })()

    return () => { isMounted = false }
  }, [])

  // ── Derived filter option lists ─────────────────────────────────────────────
  const eventTypeOptions = useMemo(
    () => [...new Set(events.map((e) => e.eventType).filter(Boolean))],
    [events]
  )
  const eventStatusOptions = useMemo(
    () => [...new Set(events.map((e) => e.eventStatus).filter(Boolean))],
    [events]
  )
  const individualFormTypeOptions = useMemo(
    () => [...new Set(individualRows.map((r) => r.formType).filter(Boolean))],
    [individualRows]
  )
  const individualStatusOptions = useMemo(
    () => [...new Set(individualRows.map((r) => r.status).filter(Boolean))],
    [individualRows]
  )

  // ── Client-side filtering ───────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return events.filter((e) => {
      const matchSearch =
        !q ||
        [e.eventName, e.eventType, e.eventVenue, e.eventDate, e.eventStatus]
          .join(' ')
          .toLowerCase()
          .includes(q)
      const matchType = eventTypeFilter === 'all' || e.eventType === eventTypeFilter
      const matchStatus = statusFilter === 'all' || e.eventStatus === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [events, searchQuery, eventTypeFilter, statusFilter])

  const filteredIndividual = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return individualRows.filter((r) => {
      const matchSearch =
        !q ||
        [r.employee, r.employeeEmail, r.formType, r.eventVenue, r.createdAt, r.status]
          .join(' ')
          .toLowerCase()
          .includes(q)
      const matchType = eventTypeFilter === 'all' || r.formType === eventTypeFilter
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [individualRows, searchQuery, eventTypeFilter, statusFilter])

  // Reset filters when switching tabs
  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    setSearchQuery('')
    setEventTypeFilter('all')
    setStatusFilter('all')
  }

  const isLoading = activeTab === 'events' ? eventsLoading : individualLoading
  const typeOptions = activeTab === 'events' ? eventTypeOptions : individualFormTypeOptions
  const statusOptions = activeTab === 'events' ? eventStatusOptions : individualStatusOptions

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-[#0b1326] poppins">
      <FacultyDahsboardHeader />

      <main className="px-6 pb-10">
        {/* Page header row — title/subtitle left, pill-toggle right */}
        <div className="flex items-center justify-between pt-5 pb-5">
          <div>
            <h1 className="text-[22px] font-semibold text-white">Reports</h1>
            <p className="mt-1 text-sm text-[#FFFFFF80]">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s
            </p>
          </div>

          {/* Pill-toggle (mirrors RequestListTable nav) */}
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

            {/* Event/form-type filter */}
            <ReportSelectFilter
              value={eventTypeFilter}
              onChange={setEventTypeFilter}
              options={typeOptions}
              label={activeTab === 'events' ? 'Event Type' : 'Form Type'}
            />

            {/* Status filter */}
            <ReportSelectFilter
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              label="Status"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[calc(100vh-240px)] overflow-auto table-custom-scrollbar" >
            {activeTab === 'events' ? (
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-y border-[#1d2638]">
                    {['EVENT NAME', 'EVENT TYPE', 'EVENT VENUE', 'EVENT DATE', 'EVENT STATUS', 'ACTION'].map(
                      (col) => (
                        <th
                          key={col}
                          className="px-5 py-3 text-left text-[10px] font-semibold tracking-wide text-[#FFFFFF66]"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                {isLoading ? (
                  <TableSkeleton cols={6} />
                ) : (
                  <tbody>
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#FFFFFF66]">
                          No events found.
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-[#1d2638] last:border-b-0 transition-colors hover:bg-[#161d2e]"
                        >
                          <td className="px-5 py-3.5 text-[12px] font-medium text-white">{row.eventName}</td>
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.eventType}</td>
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.eventVenue}</td>
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.eventDate}</td>
                          <td className="px-5 py-3.5">
                            <ReportStatus status={row.eventStatus} />
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              title="Download row as CSV"
                              onClick={() => downloadRow(row, 'events')}
                              className="text-[#FFFFFF66] transition hover:text-white"
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
            ) : (
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-y border-[#1d2638]">
                    {['ORGANIZER NAME', 'FORM TYPE', 'VENUE', 'DATE', 'STATUS', 'ACTION'].map((col) => (
                      <th
                        key={col}
                        className="px-5 py-3 text-left text-[10px] font-semibold tracking-wide text-[#FFFFFF66]"
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
                    {filteredIndividual.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-sm text-[#FFFFFF66]">
                          No individual requests found.
                        </td>
                      </tr>
                    ) : (
                      filteredIndividual.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-[#1d2638] last:border-b-0 transition-colors hover:bg-[#161d2e]"
                        >
                          <td className="px-5 py-3.5 text-[12px] font-medium text-white">{row.employee}</td>
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.formType}</td>
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.eventVenue}</td>
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.createdAt}</td>
                          <td className="px-5 py-3.5">
                            <ReportStatus status={row.status} />
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              title="Download row as CSV"
                              onClick={() => downloadRow(row, 'individual')}
                              className="text-[#FFFFFF66] transition hover:text-white"
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
            )}
          </div>
        </div>
      </main>
    </section>
  )
}

export default FacultyReportsPage