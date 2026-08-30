import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ExternalLink, ListFilter, Search, X } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import CustomDatePicker from '../../../Components/CustomDatePicker'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return Number.isNaN(date.getTime())
        ? dateStr
        : date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}


// Updated in laptop need to merge this 
const getStatusColor = (status = '') => {
    const normalizedStatus = String(status).toLowerCase()

    if (normalizedStatus.includes('rejected')) {
        return {
            text: 'text-red-400',
            dot: 'bg-red-400'
        }
    }

    if (normalizedStatus.includes('acknowledged')) {
        return {
            text: 'text-emerald-400',
            dot: 'bg-emerald-400'
        }
    }

    if (normalizedStatus.includes('approved')) {
        return {
            text: 'text-emerald-400',
            dot: 'bg-emerald-400'
        }
    }

    if (normalizedStatus.includes('pending')) {
        return {
            text: 'text-pink-600',
            dot: 'bg-pink-600'
        }
    }

    if (normalizedStatus.includes('submitted')) {
        return {
            text: 'text-yellow-400',
            dot: 'bg-yellow-400'
        }
    }

    if (normalizedStatus.includes('completed')) {
        return {
            text: 'text-emerald-400',
            dot: 'bg-emerald-400'
        }
    }

    return {
        text: 'text-white',
        dot: 'bg-white'
    }
}

const Status = ({ status }) => {
    const colors = getStatusColor(status)

    return (
        <span
            className={`flex items-center gap-1.5 text-[10px] font-semibold ${colors.text}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${colors.dot}`}
            />
            <span>{status}</span>
        </span>
    )
}

const IndividualStatus = ({ status }) => {
    // Status can be a string like "Pending" or an object like { admin: "Pending", accounts: "Pending", purchase: "Pending" }
    const getStatusDisplay = () => {
        if (typeof status === 'string') return status
        if (typeof status === 'object' && status !== null) {
            // Show the first non-null status value
            const values = Object.values(status).filter(v => v)
            return values.length > 0 ? values[0] : 'Pending'
        }
        return 'Pending'
    }

    const displayStatus = getStatusDisplay()
    const isApproved = displayStatus === 'Approved'

    return (
        <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${isApproved ? 'text-[#20D18C]' : 'text-[#F20768]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isApproved ? 'bg-[#20D18C]' : 'bg-[#F20768]'}`} />
            {displayStatus}
        </span>
    )
}

const FacultyLatestEventsRequestTable = () => {
    const [activeTab, setActiveTab] = useState('events')
    const [events, setEvents] = useState([])
    const [filteredEvents, setFilteredEvents] = useState([])
    const [individualRequests, setIndividualRequests] = useState([])
    const [showFilters, setShowFilters] = useState(false)
    const [eventTypes, setEventTypes] = useState([])

    const [statusFilter, setStatusFilter] = useState('')
    const [eventTypeFilter, setEventTypeFilter] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    const filterRef = useRef(null)

    // Fetch event requests
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return

                const decoded = jwtDecode(token)
                const facultyId = decoded.facultyId

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

    // Fetch individual requests
    useEffect(() => {
        const fetchIndividualRequests = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return

                const decoded = jwtDecode(token)
                const facultyId = decoded.facultyId || decoded.id || decoded._id || decoded.userId

                const res = await fetch(
                    `${API_BASE_URL}/api/individual-submissions`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )

                const response = await res.json()
                if (response.success) {
                    setIndividualRequests(response.data)
                }
            } catch (err) {
                console.error('Failed to fetch individual requests:', err)
            }
        }

        fetchIndividualRequests()
    }, [])

    // Filter event requests
    useEffect(() => {
        let result = [...events]

        const query = searchQuery.trim().toLowerCase()
        if (query) {
            result = result.filter(e => {
                const date = new Date(e.eventDates?.[0])
                const dateStr = Number.isNaN(date.getTime())
                    ? ''
                    : date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                return [e.eventName, e.eventType, dateStr, e.eventStatus].join(' ').toLowerCase().includes(query)
            })
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
    }, [statusFilter, eventTypeFilter, dateFrom, dateTo, events, searchQuery])

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

    const filteredIndividualRequests = useMemo(() => {
        let result = [...individualRequests]

        const query = searchQuery.trim().toLowerCase()
        if (query) {
            result = result.filter(request => {
                console.log("date req : ", request)
                const status =
                    typeof request.status === 'object' && request.status !== null
                        ? Object.values(request.status).filter(Boolean).join(' ')
                        : request.status || ''
                return [
                    request.employee,
                    request.employeeDetail?.name,
                    request.formType,
                    request.employeeEmail,
                    formatDate(request.date),
                    status,
                ].join(' ').toLowerCase().includes(query)
            })
        }

        return result
    }, [individualRequests, searchQuery])
    console.log("req : ", filteredIndividualRequests)

    return (
        <section className="flex max-h-[570px] flex-col overflow-hidden rounded-lg border border-[#263044] bg-[#151d2d]">
            <div className="flex flex-shrink-0 items-center justify-between px-4 py-4">
                <h2 className="text-sm font-semibold text-white">Latest Requests</h2>
                <div className="flex items-center gap-4">
                    {/* Tabs */}
                    <nav className="flex rounded-md bg-[#1b2435] p-0.5" aria-label="Request type tabs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('events')}
                            className={`rounded px-3 py-1.5 text-[10px] font-medium transition ${
                                activeTab === 'events'
                                    ? 'bg-[#853FF9] text-white shadow-sm'
                                    : 'text-[#8b93a7] hover:text-white'
                            }`}
                        >
                            Event Requests
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('individual')}
                            className={`rounded px-3 py-1.5 text-[10px] font-medium transition ${
                                activeTab === 'individual'
                                    ? 'bg-[#853FF9] text-white shadow-sm'
                                    : 'text-[#8b93a7] hover:text-white'
                            }`}
                        >
                            Individual Requests
                        </button>
                    </nav>

                    {activeTab === 'events' && (
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-[10px] text-white cursor-pointer transition ${showFilters || hasActiveFilters ? 'bg-[#853FF9]' : 'bg-[#222b3d]'}`}
                            >
                                <ListFilter size={12} />
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
                    )}

                    <Link
                        to={activeTab === 'events' ? '/dashboard-faculty/events' : '/dashboard-faculty/individual-requests'}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#8B5CF6]"
                    >
                        View All
                        <ArrowRight size={13} />
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="flex-shrink-0 px-4 pb-4">
                <div className="flex items-center gap-2 rounded-md border border-[#2e394e] bg-[#1b2435] px-3 py-2 transition focus-within:border-[#853FF9]">
                    <Search size={13} className="shrink-0 text-[#8b93a4]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab === 'events' ? 'events' : 'requests'} by name, type, date, or status`}
                        className="w-full bg-transparent text-[11px] text-white outline-none placeholder:text-[#FFFFFF66]"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="shrink-0 cursor-pointer text-[#8b93a4] transition hover:text-white"
                            title="Clear search"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto table-custom-scrollbar">
                {activeTab === 'events' ? (
                    <table className="w-full min-w-[520px]">
                        <thead className="sticky top-0 z-10 bg-[#1b2435]">
                            <tr>
                                {['EVENT NAME', 'EVENT TYPE', 'EVENT DATE', 'STATUS', 'ACTION'].map((column) => (
                                    <th key={column} className="px-4 py-3 text-left text-[10px] font-semibold text-[#FFFFFF66]">
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map((event) => (
                                <tr key={event.eventId} className="border-b border-[#222b3d] last:border-b-0">
                                    <td className="px-4 py-3 text-[12px] font-medium text-white">{event.eventName}</td>
                                    <td className="px-4 py-3 text-[12px] text-white">{event.eventType}</td>
                                    <td className="px-4 py-3 text-[12px] text-white">
                                        {new Date(event.eventDates[0]).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3"><Status status={event.eventStatus} /></td>
                                    <td className="px-4 py-3">
                                        <Link to={`/dashboard-faculty/events/detailView/${event.eventId}`} className="inline-flex text-[#FFFFFF80] transition hover:text-white" title="Open event">
                                            <ExternalLink size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredEvents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-[12px] text-[#FFFFFF66]">
                                        No events found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full min-w-[520px]">
                        <thead className="sticky top-0 z-10 bg-[#1b2435]">
                            <tr>
                                {['DATE', 'ORGANIZER NAME', 'EVENT TYPE', 'ORGANIZER EMAIL', 'STATUS', 'ACTION'].map((column) => (
                                    <th key={column} className="px-4 py-3 text-left text-[10px] font-semibold text-[#FFFFFF66]">
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIndividualRequests.map((request) => (
                                <tr key={request.id} className="border-b border-[#222b3d] last:border-b-0">
                                    <td className="px-4 py-3 text-[12px] text-white">
                                        {formatDate(request.date)}
                                    </td>
                                    <td className="px-4 py-3 text-[12px] font-medium text-white">
                                        {request.employee || request.employeeDetail?.name || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-[12px] font-medium text-white">
                                        {request.formType || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-[12px] text-white">
                                        {request.employeeEmail || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <IndividualStatus status={request.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            to={`/dashboard-faculty/individual-requests/${request.id}`}
                                            className="inline-flex text-[#FFFFFF80] transition hover:text-white"
                                            title="Open request"
                                        >
                                            <ExternalLink size={14} />
                                        </Link>
                                        <Link
                                            to={`/dashboard-faculty/individual-detailView/v2/${request.id}`}
                                            className="inline-flex text-red-500 transition hover:text-white"
                                            title="Open request"
                                        >
                                            <ExternalLink size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredIndividualRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-[12px] text-[#FFFFFF66]">
                                        No individual requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </section>
    )
}

export default FacultyLatestEventsRequestTable
