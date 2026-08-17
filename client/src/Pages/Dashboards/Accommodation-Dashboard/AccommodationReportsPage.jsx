
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Search, ListFilter, Download, ChevronDown } from 'lucide-react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import { buildEventTemplate } from '../../../templates/eventTemplate'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ─── Status badge ─────────────────────────────────────────────────────────────
const POSITIVE_STATUSES = ['closed', 'approved', 'completed', 'accepted']

const ReportStatus = ({ status }) => {
  const label = status || 'Pending'
  const isPositive = POSITIVE_STATUSES.includes(label.toLowerCase())
  return (
    <span
      className={`flex items-center gap-1.5 text-[11px] font-semibold ${
        isPositive ? 'text-[#20D18C]' : 'text-[#F20768]'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPositive ? 'bg-[#20D18C]' : 'bg-[#F20768]'
        }`}
      />
      {label}
    </span>
  )
}

// ─── Dropdown filter ──────────────────────────────────────────────────────────
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

// ─── PDF Download Helper ──────────────────────────────────────────────────────
const downloadRow = async (row) => {
  try {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_BASE_URL}/api/events/${row.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    const eventData = json.data || json.event || (json.requestDetails ? json : null)

    if (eventData) {
      const html = buildEventTemplate(eventData)
      const iframe = document.createElement('iframe')
      iframe.style.display = 'none'
      document.body.appendChild(iframe)
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
      iframeDoc.open()
      iframeDoc.write(html)
      iframeDoc.close()
      iframe.onload = () => {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
        setTimeout(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe)
        }, 1000)
      }
    } else {
      console.error('[PDF Fetch] Failed to find event data in response:', json)
      alert('Failed to fetch event details. See console for API response.')
    }
  } catch (err) {
    console.error('[PDF Fetch] Error generating PDF:', err)
    alert('Error connecting to API to generate PDF.')
  }
}

// ─── Format date helper ───────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
}

// ─── Main page ────────────────────────────────────────────────────────────────
const AccommodationReportsPage = () => {
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // ── Fetch event requests ────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem('token')
    if (!token) { setEventsLoading(false); return }

    ;(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/table/dashboard-table?module=accommodation`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const json = await res.json()

        if (json.data && isMounted) {
          setEvents(
            (json.data || []).map((ev) => ({
              id: ev.eventId || ev.id || ev._id,
              eventName: ev.eventName || ev.name || '-',
              department: ev.organizingDepartment || ev.department || '-',
              requesterName: ev.requesterName || ev.employee || '-',
              requesterPhone: ev.requesterPhone || ev.phone || '-',
              requiredDate: (Array.isArray(ev.dates) && ev.dates.length > 0)
                  ? `${formatDate(ev.dates[0])}${ev.dates.length > 1 ? ` +${ev.dates.length - 1}` : ''}`
                  : formatDate(ev.dates || ev.eventDate || ev.requiredDate),
              status: ev.eventStatus || ev.departmentStatus || ev.overallStatus || ev.status || '-',
            }))
          )
        }
      } catch (err) {
        console.warn('AccommodationReportsPage events:', err.message)
      } finally {
        if (isMounted) setEventsLoading(false)
      }
    })()

    return () => { isMounted = false }
  }, [])

  // ── Derived filter option lists ─────────────────────────────────────────────
  const eventStatusOptions = useMemo(
    () => [...new Set(events.map((e) => e.status).filter(Boolean))],
    [events]
  )

  // ── Client-side filtering ───────────────────────────────────────────────────
  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return events.filter((e) => {
      const matchSearch =
        !q ||
        [e.eventName, e.department, e.requiredDate, e.status]
          .join(' ')
          .toLowerCase()
          .includes(q)
      const matchStatus = statusFilter === 'all' || e.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [events, searchQuery, statusFilter])

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-[#0b1326] poppins">
      <DashboardHeader basePath="/dashboard-accommodation" />

      <main className="px-6 pb-10">
        {/* Page header row — title/subtitle only, no tab toggle */}
        <div className="pt-5 pb-5">
          <h1 className="text-[22px] font-semibold text-white">Reports</h1>
          <p className="mt-1 text-sm text-[#FFFFFF80]">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s
          </p>
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

            {/* Status filter */}
            <ReportSelectFilter
              value={statusFilter}
              onChange={setStatusFilter}
              options={eventStatusOptions}
              label="Status"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[calc(100vh-240px)] overflow-auto table-custom-scrollbar">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-y border-[#1d2638]">
                  {['EVENT NAME', 'CHECK IN-CHECK OUT', 'DEPT', 'STATUS', 'ACTION'].map(
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
                <TableSkeleton cols={5} />
              ) : (
                <tbody>
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-sm text-[#FFFFFF66]">
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
                        <td className="px-5 py-3.5 text-[12px] text-white">{row.department}</td>
                        <td className="px-5 py-3.5">
                          <ReportStatus status={row.status} />
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            type="button"
                            title="Download PDF"
                            onClick={() => downloadRow(row)}
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
          </div>
        </div>
      </main>
    </section>
  )
}

export default AccommodationReportsPage