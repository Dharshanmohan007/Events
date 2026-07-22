import React, { useState, useEffect, useRef } from 'react'
import { ExternalLink, ListFilter, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import CustomDatePicker from '../../../Components/CustomDatePicker'
import FacultyDahsboardHeader from './FacultyDahsboardHeader'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const columns = [
  'EVENT NAME',
  'EVENT TYPE',
  'EVENT VENUE',
  'EVENT DATE',
  'APPROVED STATUS',
  'STATUS',
  'ACTION',
]

const StatusBadge = ({ status }) => {
  const isApproved = status === 'Approved' || status === 'Acknowledged'

  return (
    <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${isApproved ? 'text-[#20D18C]' : 'text-[#F20768]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isApproved ? 'bg-[#20D18C]' : 'bg-[#F20768]'}`} />
      {status}
    </span>
  )
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const EventDateCell = ({ eventDates }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const hasMultiple = eventDates.length > 1
  const firstDate = formatDate(eventDates[0])

  return (
    <td className="whitespace-nowrap px-5 py-3.5 text-sm relative">
      <div className="flex items-center gap-1.5">
        <span>{firstDate}</span>
        {hasMultiple && (
          <span
            className="relative inline-flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-[#853FF9] text-[8px] font-bold text-white"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            +{eventDates.length - 1}
            {showTooltip && (
              <span className="absolute bottom-full left-1/2 z-30 mb-2 w-44 -translate-x-1/2 rounded-lg border border-[#283247] bg-[#151d2e] px-3 py-2 text-[10px] text-[#FFFFFFCC] shadow-xl">
                {eventDates.map((d, i) => (
                  <div key={i} className="py-0.5">{formatDate(d)}</div>
                ))}
                <span className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-transparent border-t-[#283247]" />
              </span>
            )}
          </span>
        )}
      </div>
    </td>
  )
}

const FacultyEventsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [eventTypes, setEventTypes] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const [statusFilter, setStatusFilter] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filterRef = useRef(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const decoded = jwtDecode(token)
        const facultyId = decoded.id || decoded._id || decoded.userId

        const res = await fetch(
          `${API_BASE_URL}/api/table/faculty-dashboard-table?facultyId=${facultyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const data = await res.json()
        if (data.success) {
          setEvents(data.data)
          setFilteredEvents(data.data)
          const types = [...new Set(data.data.map(e => e.eventType))]
          setEventTypes(types)
        }
      } catch (err) {
        console.error('Failed to fetch events:', err)
      }
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    let result = [...events]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(e =>
        e.eventName.toLowerCase().includes(query) ||
        e.eventType.toLowerCase().includes(query) ||
        (e.venues && e.venues.some(v => v.toLowerCase().includes(query)))
      )
    }

    if (statusFilter) {
      result = result.filter(e => e.eventStatus === statusFilter)
    }

    if (eventTypeFilter) {
      result = result.filter(e => e.eventType === eventTypeFilter)
    }

    if (dateFrom) {
      const from = new Date(dateFrom)
      result = result.filter(e => new Date(e.eventDates[0]) >= from)
    }

    if (dateTo) {
      const to = new Date(dateTo)
      result = result.filter(e => new Date(e.eventDates[0]) <= to)
    }

    setFilteredEvents(result)
  }, [searchQuery, statusFilter, eventTypeFilter, dateFrom, dateTo, events])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilters(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const clearFilters = () => {
    setStatusFilter('')
    setEventTypeFilter('')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters = statusFilter || eventTypeFilter || dateFrom || dateTo

  return (
    <section className="min-h-screen bg-[#0b1326] poppins">
      <FacultyDahsboardHeader />

      <main className="px-6 pb-8">
        <div className="mt-3">
          <h1 className="text-lg font-medium text-white">Request List Overview</h1>
          <p className="mt-1 text-sm text-[#FFFFFF80]">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
          </p>
        </div>

        <section className="mt-4 rounded-lg border border-gray-800 bg-[#171F31] py-4">
          <div className="mb-4 flex flex-wrap items-center justify-end gap-3 px-6">
            <div className="flex items-center gap-2 rounded-full border border-gray-700 bg-[#232A3C] px-4 py-2">
              <Search size={14} className="text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="text"
                placeholder="Search events, venues"
                className="w-[230px] bg-transparent text-xs text-gray-300 outline-none placeholder:text-gray-500"
              />
            </div>

            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-[11px] text-white cursor-pointer transition ${showFilters || hasActiveFilters ? 'bg-[#853FF9]' : 'bg-[#232A3C] border border-gray-700'}`}
              >
                <ListFilter size={14} />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F20768] text-[8px] font-bold">
                    {[statusFilter, eventTypeFilter, dateFrom, dateTo].filter(Boolean).length}
                  </span>
                )}
              </button>

              {showFilters && (
                <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-[#283247] bg-[#151d2e] p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-white">Filters</h4>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="text-[10px] text-[#F20768] cursor-pointer hover:underline">
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="mb-1 block text-[10px] text-[#FFFFFF80]">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-md border border-[#283247] bg-[#1b2435] px-2 py-1.5 text-[11px] text-white outline-none focus:border-[#853FF9]"
                    >
                      <option value="">All</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="mb-1 block text-[10px] text-[#FFFFFF80]">Event Type</label>
                    <select
                      value={eventTypeFilter}
                      onChange={(e) => setEventTypeFilter(e.target.value)}
                      className="w-full rounded-md border border-[#283247] bg-[#1b2435] px-2 py-1.5 text-[11px] text-white outline-none focus:border-[#853FF9]"
                    >
                      <option value="">All</option>
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="mb-1 block text-[10px] text-[#FFFFFF80]">Date From</label>
                    <CustomDatePicker
                      value={dateFrom}
                      onChange={setDateFrom}
                      placeholder="From date"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] text-[#FFFFFF80]">Date To</label>
                    <CustomDatePicker
                      value={dateTo}
                      onChange={setDateTo}
                      placeholder="To date"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="max-h-[calc(100vh-260px)] overflow-auto table-custom-scrollbar">
            {filteredEvents.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-sm text-[#FFFFFF66]">No events found.</p>
              </div>
            ) : (
            <table className="w-full min-w-[950px]">
              <thead className="sticky top-0 bg-[#1C2335]">
                <tr className="border-b border-[#22253a]">
                  {columns.map((column) => (
                    <th key={column} className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-widest text-gray-500">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.eventId} className="border-b border-[#1e2130] text-[#FFFFFF]/80 transition-colors hover:bg-[#1e2232] last:border-b-0">
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">{event.eventName}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">{event.eventType}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">{event.venues?.join(', ') || '—'}</td>
                    <EventDateCell eventDates={event.eventDates} />
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <StatusBadge status={event.approvedStatus ? 'Approved' : 'Pending Approval'} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <StatusBadge status={event.eventStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Link
                        to={`/dashboard-faculty/events/detailView/${event.eventId}`}
                        className="inline-flex text-gray-400 transition-colors hover:text-white"
                        title="Open event"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </section>
      </main>
    </section>
  )
}

export default FacultyEventsListPage
