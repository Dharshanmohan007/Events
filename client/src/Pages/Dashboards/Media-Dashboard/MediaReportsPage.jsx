import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Download, Search, X } from 'lucide-react'
import { buildEventTemplate } from '../../../templates/eventTemplate'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'

// ── Helpers ──────────────────────────────────────────────────────────────────
const normalizeMediaType = (type) => {
  const t = String(type).toLowerCase().trim()
  if (t === 'poster and video') return ['poster', 'video']
  if (t === 'poster') return ['poster']
  if (t === 'video') return ['video']
  return []
}

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

const deriveMediaStatus = (mediaEntries = []) => {
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
  const hasPending = relevantStatuses.some((s) => String(s).toLowerCase().includes('pending'))
  if (hasPending) return 'Pending for Acknowledge'
  return relevantStatuses[0]
}

const TableSkeleton = ({ cols = 5 }) => (
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

const ReportStatus = ({ status }) => {
  const isCompleted = String(status).toLowerCase() === 'completed' || String(status).toLowerCase() === 'acknowledged'
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${isCompleted ? 'text-[#34D399]' : 'text-[#B32058]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-[#34D399]' : 'bg-[#B32058]'}`} />
      {status || '-'}
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

const MediaReportsPage = () => {
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('events')
  const [individualRows, setIndividualRows] = useState([])
  const [individualLoading, setIndividualLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const abortControllerRef = useRef(null)
  const individualFetchedRef = useRef(false)

  // ── Fetch event requests ────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true
    const token = localStorage.getItem('token')
    if (!token) { setEventsLoading(false); return }

    ;(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/table/dashboard-table?module=media`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const json = await res.json()
        if (json.data && isMounted) {
          setEvents(
            (json.data || []).map((ev) => ({
              id: ev.eventId || ev.id || ev._id,
              eventName: ev.eventName || ev.name || '-',
              department: ev.organizingDepartment || ev.department || '-',
              type: getMediaTypeLabels(ev.media),
              status: deriveMediaStatus(ev.media),
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
  const fetchIndividualRequests = useCallback(async () => {
    let isMounted = true
    const token = localStorage.getItem('token')
    if (!token) { setIndividualLoading(false); return }

    try {
      setIndividualLoading(true)
      const res = await fetch(`${API_BASE_URL}/api/individual-submissions/getrequest/?module=media`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      if (json.success && Array.isArray(json.data) && isMounted) {
        setIndividualRows(
          json.data.map((r) => ({
            id: r.id || r._id,
            eventName: r.eventName || r.employee || '-',
            department: r.department || r.organizingDepartment || '-',
            type: Array.isArray(r.mediaType) ? r.mediaType.join(', ') : (r.mediaType || r.typeOfMedia || '-'),
            status: r.status || r.overallStatus || '-',
          }))
        )
      } else if (isMounted) {
        setIndividualRows([])
      }
    } catch (err) {
      console.warn('Individual requests:', err)
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

  // ── Derived filtering options ───────────────────────────────────────────────
  const typeOptions = Array.from(new Set(events.map((e) => e.type).filter(Boolean)))
  const statusOptions = Array.from(new Set(events.map((e) => e.status).filter(Boolean)))

  // ── Apply filters ───────────────────────────────────────────────────────────
  let filteredEvents = events.filter((e) => {
    const matchesSearch = e.eventName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || e.type === typeFilter
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const filteredIndividual = individualRows.filter((r) => {
    const matchesSearch = r.eventName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || r.type === typeFilter
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  // ── Print / PDF Generation ──────────────────────────────────────────────────
  const downloadRow = async (row, type = 'events') => {
    if (type === 'individual') {
      const lines = [
        ['Field', 'Value'],
        ['Event Name', row.eventName || '-'],
        ['Dept', row.department || '-'],
        ['Type', row.type || '-'],
        ['Status', row.status || '-'],
      ]
      const csv = lines.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `media-individual-${row.id}.csv`
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

  const currentData = activeTab === 'events' ? filteredEvents : filteredIndividual
  const isLoading = activeTab === 'events' ? eventsLoading : individualLoading

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen flex-col bg-[#0b1326] font-poppins text-white">
      <DashboardHeader basePath="/dashboard-media" />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-wide">Media Reports</h1>
            <p className="mt-1 text-xs text-[#FFFFFF66]">View and manage media requests</p>
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
                placeholder="Search events, departments..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-[#FFFFFF66] hover:text-white">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <ReportSelectFilter
                value={typeFilter}
                onChange={setTypeFilter}
                options={typeOptions}
                label="Type"
              />
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
            <table className="w-full min-w-[700px]">
              <thead className="sticky top-0 bg-[#151c2c]">
                <tr className="border-y border-[#1d2638]">
                  {['EVENT NAME', 'DEPT', 'TYPE', 'STATUS', 'ACTION'].map((col) => (
                    <th key={col} className={`px-5 py-3 text-left text-[10px] font-semibold tracking-wide text-[#FFFFFF66] ${col === 'ACTION' ? 'text-center' : ''}`}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {isLoading ? (
                <TableSkeleton cols={5} />
              ) : (
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-sm text-[#FFFFFF66]">
                        No {activeTab} found.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-[#1d2638] last:border-b-0 transition-colors hover:bg-[#161d2e]"
                      >
                        <td className="px-5 py-3.5 text-[12px] font-medium text-white">{row.eventName}</td>
                        <td className="px-5 py-3.5 text-[12px] text-white">{row.department}</td>
                        <td className="px-5 py-3.5 text-[12px] text-white">{row.type}</td>
                        <td className="px-5 py-3.5">
                          <ReportStatus status={row.status} />
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            type="button"
                            title="Download row as CSV or PDF"
                            onClick={() => downloadRow(row, activeTab)}
                            className="text-[#FFFFFF66] transition hover:text-white mx-auto block"
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
      </div>
    </div>
  )
}

export default MediaReportsPage
