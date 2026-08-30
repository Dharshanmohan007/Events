import React, { useState, useEffect } from 'react'
import { Download, Search, X } from 'lucide-react'
import { buildEventTemplate } from '../../../templates/eventTemplate'
import VenueHeader from './VenueHeader'

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
}

const TableSkeleton = ({ cols = 7 }) => (
  <tbody className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="border-b border-[#1d2638]">
        {[...Array(cols)].map((_, j) => (
          <td key={j} className="px-5 py-4">
            <div className="h-4 w-full rounded bg-[#FFFFFF14]"></div>
          </td>
        ))}
      </tr>
    ))}
  </tbody>
)

const POSITIVE_STATUSES = ['closed', 'approved', 'completed', 'accepted', 'acknowledged']

const ReportStatus = ({ status }) => {
  const label = status || 'Pending'
  const isPositive = POSITIVE_STATUSES.includes(label.toLowerCase())
  return (
    <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${isPositive ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isPositive ? 'bg-[#34D399]' : 'bg-[#F87171]'}`} />
      {label}
    </span>
  )
}

const ReportSelectFilter = ({ value, onChange, options, label }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none rounded-lg border border-[#2a3347] bg-[#151c2c] py-2 pl-4 pr-10 text-xs text-[#FFFFFF66] outline-none transition-colors hover:border-[#374155] focus:border-[#8B3DFF] focus:ring-1 focus:ring-[#8B3DFF]"
    >
      <option value="all">All {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#FFFFFF66]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  </div>
)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

const VenueReportsPage = () => {
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('events')
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
        const res = await fetch(
          `${API_BASE_URL}/api/table/dashboard-table?module=venue`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const json = await res.json()

        if (json.data && isMounted) {
          setEvents(
            (json.data || []).map((ev) => ({
              id: ev.eventId || ev.id || ev._id,
              eventName: ev.eventName || ev.name || '-',
              eventType: ev.eventType || '-',
              department: ev.organizingDepartment || ev.department || '-',
              eventVenue: Array.isArray(ev.venues) 
                ? ev.venues.map(v => typeof v === 'object' && v !== null ? (v.venueName || v.venue || v.name || '-') : String(v)).join(', ') 
                : (typeof ev.venues === 'object' && ev.venues !== null ? (ev.venues.venueName || ev.venues.venue || ev.venues.name || '-') : (ev.venues || ev.venue || '-')),
              requiredDate: (Array.isArray(ev.dates) && ev.dates.length > 0) 
                  ? `${formatDate(ev.dates[0])}${ev.dates.length > 1 ? ` +${ev.dates.length - 1}` : ''}`
                  : formatDate(ev.dates || ev.eventDate || ev.requiredDate),
              status: ev.eventStatus || ev.departmentStatus || ev.overallStatus || ev.status || '-',
            }))
          )
        }
      } catch (err) {
        console.warn('Reports events:', err.message)
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
        if (json.data && isMounted) {
          setIndividualRows(
            json.data.map((r) => ({
              id: r.id || r._id,
              eventName: r.eventName || r.employee || '-',
              department: r.department || r.organizingDepartment || '-',
              requiredDate: formatDate(r.date || r.requiredDate || r.createdAt),
              status: r.status || r.overallStatus || '-',
            }))
          )
        }
      } catch (err) {
        console.warn('Individual requests:', err)
      } finally {
        if (isMounted) setIndividualLoading(false)
      }
    })()

    return () => { isMounted = false }
  }, [])

  // ── Derived filtering options ───────────────────────────────────────────────
  const typeOptions = Array.from(new Set(events.map((e) => e.eventType).filter(Boolean)))
  const statusOptions = Array.from(new Set(events.map((e) => e.status).filter(Boolean)))

  // ── Apply filters ───────────────────────────────────────────────────────────
  let filteredEvents = events.filter((e) => {
    const matchesSearch = e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.eventVenue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = eventTypeFilter === 'all' || e.eventType === eventTypeFilter
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const filteredIndividual = individualRows.filter((r) => {
    const matchesSearch = r.eventName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // ── Print / PDF Generation ──────────────────────────────────────────────────
  const downloadRow = async (row, type = 'events') => {
    if (type === 'individual') {
      const lines = [
        ['Field', 'Value'],
        ['Event Name', row.eventName || '-'],
        ['Dept', row.department || '-'],
        ['Date', row.requiredDate || '-'],
        ['Status', row.status || '-'],
      ]
      const csv = lines.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `venue-individual-${row.id}.csv`
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
      console.error('Failed to download row:', err)
      alert('Could not generate PDF. Please try again.')
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-[#0b1326] font-poppins text-white">
      <VenueHeader />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-wide">Venue Reports</h1>
            <p className="mt-1 text-xs text-[#FFFFFF66]">View and manage venue requests</p>
          </div>
          <nav className="flex items-center gap-1 rounded-lg border border-[#2a3347] bg-[#151c2c] p-1">
            <button
              onClick={() => setActiveTab('events')}
              className={`rounded-md px-4 py-2 text-xs font-medium transition-colors ${
                activeTab === 'events'
                  ? 'bg-[#8B3DFF] text-white'
                  : 'text-[#FFFFFF66] hover:text-white'
              }`}
            >
              Event Request Report
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`rounded-md px-4 py-2 text-xs font-medium transition-colors ${
                activeTab === 'individual'
                  ? 'bg-[#8B3DFF] text-white'
                  : 'text-[#FFFFFF66] hover:text-white'
              }`}
            >
              Individual Request Report
            </button>
          </nav>
        </div>

        <div className="flex min-h-[500px] flex-col rounded-xl border border-[#2a3347] bg-[#151c2c]">
          {/* Controls Bar */}
          <div className="flex flex-col gap-4 border-b border-[#2a3347] p-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-[#2a3347] bg-[#0b1326] px-3 transition-colors focus-within:border-[#8B3DFF]">
              <Search size={16} className="text-[#FFFFFF66]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, venues..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              {activeTab === 'events' && (
                <ReportSelectFilter
                  value={eventTypeFilter}
                  onChange={setEventTypeFilter}
                  options={typeOptions}
                  label="Event Type"
                />
              )}
              <ReportSelectFilter
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                label="Status"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[calc(100vh-240px)] overflow-auto table-custom-scrollbar">
            {activeTab === 'events' ? (
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-y border-[#1d2638]">
                    {['EVENT NAME', 'DATE', 'EVENT TYPE', 'DEPT', 'VENUE', 'STATUS', 'ACTION'].map(
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

                {eventsLoading ? (
                  <TableSkeleton cols={7} />
                ) : (
                  <tbody>
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-sm text-[#FFFFFF66]">
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
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.requiredDate}</td>
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.eventType}</td>
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.department}</td>
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.eventVenue}</td>
                          <td className="px-5 py-3.5">
                            <ReportStatus status={row.status} />
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              title="Download PDF"
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
                    {['EVENT NAME', 'DATE', 'DEPT', 'STATUS', 'ACTION'].map(
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

                {individualLoading ? (
                  <TableSkeleton cols={5} />
                ) : (
                  <tbody>
                    {filteredIndividual.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-sm text-[#FFFFFF66]">
                          No individual requests found.
                        </td>
                      </tr>
                    ) : (
                      filteredIndividual.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-[#1d2638] last:border-b-0 transition-colors hover:bg-[#161d2e]"
                        >
                          <td className="px-5 py-3.5 text-[12px] font-medium text-white">{row.eventName}</td>
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.requiredDate}</td>
                          <td className="px-5 py-3.5 text-[12px] text-white">{row.department}</td>
                          <td className="px-5 py-3.5">
                            <ReportStatus status={row.status} />
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              title="Download CSV"
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
      </div>
    </div>
  )
}

export default VenueReportsPage
