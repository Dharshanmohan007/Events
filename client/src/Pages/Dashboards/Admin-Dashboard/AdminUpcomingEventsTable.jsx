import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sece-events.onrender.com'
const EVENT_REQUEST_URL = `${API_BASE_URL}/api/table/dashboard-table?module=admin`
const INDIVIDUAL_REQUEST_URL = `${API_BASE_URL}/api/individual-submissions`

const formatDate = (dateValue) => {
    if (!dateValue) return '-'

    const date = new Date(dateValue)
    if (Number.isNaN(date.getTime())) return dateValue

    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

const normalizeEvent = (event) => ({
    eventId: event.eventId,
    eventName: event.eventName,
    eventType: event.eventType,
    dates: Array.isArray(event.dates)
        ? event.dates.map(formatDate)
        : [event.eventDate].filter(Boolean),
    venues: Array.isArray(event.venues)
        ? event.venues
        : [event.eventVenue || event.venue].filter(Boolean),
    department: event.organizingDepartment || event.department,
    status: event.overallStatus || event.acknowledgeStatus,
    approvedStatus: event.adminApproval ? 'Approved' : 'Pending',
})

const normalizeIndividualRequest = (request) => ({
    id: request.id,
    organizerName: request.employee || '-',
    organizerEmail: request.employeeEmail || '-',
    eventType: request.formType || '-',
    date: request.createdAt
        ? formatDate(request.createdAt)
        : '-',
    status: typeof request.status === 'string' ? request.status : '-',
})

const getStatusClassName = (status = '') => {
    const normalizedStatus = status.toLowerCase()

    if (normalizedStatus.includes('rejected')) {
        return 'text-[#B32058]'
    }

    if (normalizedStatus.includes('admin') && normalizedStatus.includes('approved')) {
        return 'text-[#34D399]'
    }

    if (normalizedStatus.includes('hod') && normalizedStatus.includes('approved')) {
        return 'text-[#60A5FA]'
    }

    if (normalizedStatus.includes('submitted')) {
        return 'text-[#fdcb6e]'
    }

    return 'text-white'
}

const StatusBadge = ({ status }) => {
    const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : ''
    const isPositive = normalizedStatus.includes('approved') || normalizedStatus.includes('acknowledged')

    return (
        <span
            className={`inline-flex items-center gap-2 ${isPositive ? 'text-[#34D399]' : 'text-[#B32058]'
                }`}
        >
            <span
                className={`h-2 w-2 rounded-full ${isPositive ? 'bg-[#34D399]' : 'bg-[#B32058]'
                    }`}
            />
            {status}
        </span>
    )
}

const ExpandableListCell = ({ values }) => {
    const list = values?.length ? values : ['-']
    const remainingItems = list.slice(1)

    return (
        <div className="min-w-35.5 relative">
            <div className="flex items-center gap-2">
                <span className="whitespace-nowrap">{list[0]}</span>
                {remainingItems.length > 0 && (
                    <div className="group relative inline-flex">
                        <span className="cursor-default rounded bg-[#263044] px-1.5 py-0.5 text-xs font-semibold text-[#aeb7ca]">
                            +{remainingItems.length}
                        </span>

                        <div className="pointer-events-none  absolute left-1/2 -top-4  z-20 mt-2 hidden min-w-max  rounded-md border border-[#303b52] bg-[#101827] px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                            <div className="space-y-1">
                                {remainingItems.map((value, index) => (
                                    <div key={`${value}-${index}`} className="whitespace-nowrap">
                                        {value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const AdminUpcomingEventsTable = ({ events, viewAllLink, title = "Upcoming Events" }) => {
    const [requestType, setRequestType] = useState('event')
    const [fetchedEvents, setFetchedEvents] = useState([])
    const [fetchedIndividualRequests, setFetchedIndividualRequests] = useState([])
    const propEvents = useMemo(() => events?.map(normalizeEvent), [events])
    const tableEvents = propEvents || fetchedEvents
    const isEventRequest = requestType === 'event'
    const tableRows = isEventRequest ? tableEvents : fetchedIndividualRequests

    useEffect(() => {
        if (events) {
            return
        }

        let isMounted = true
        const token = localStorage.getItem('token')

        fetch(EVENT_REQUEST_URL, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch admin upcoming events')
                }
                return response.json()
            })
            .then((responseData) => {
                if (isMounted) {
                    setFetchedEvents((responseData.data || []).map(normalizeEvent))
                }
            })
            .catch((error) => {
                console.warn(error.message)
            })

        return () => {
            isMounted = false
        }
    }, [events])

    useEffect(() => {
        let isMounted = true
        const token = localStorage.getItem('token')

        fetch(INDIVIDUAL_REQUEST_URL, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch individual requests')
                }
                return response.json()
            })
            .then((responseData) => {
                if (isMounted) {
                    setFetchedIndividualRequests((responseData.data || []).map(normalizeIndividualRequest))
                }
            })
            .catch((error) => {
                console.warn(error.message)
            })

        return () => {
            isMounted = false
        }
    }, [])

    return (
        <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] w-full h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
                <h2 className="text-white font-medium">{title}</h2>

                <div className="flex items-center gap-3">
                    <nav className="flex rounded-md bg-[#1b2335] p-0.5" aria-label="Request type tabs">
                        <button
                            type="button"
                            onClick={() => setRequestType('event')}
                            className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${isEventRequest
                                ? 'bg-[#8B3DFF] text-white shadow-sm'
                                : 'text-[#8b93a7] hover:text-white'
                                }`}
                        >
                            Event Requests
                        </button>
                        <button
                            type="button"
                            onClick={() => setRequestType('individual')}
                            className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${!isEventRequest
                                ? 'bg-[#8B3DFF] text-white shadow-sm'
                                : 'text-[#8b93a7] hover:text-white'
                                }`}
                        >
                            Individual Requests
                        </button>
                    </nav>

                    {viewAllLink && (
                        <Link to={viewAllLink} className="flex items-center gap-2 text-[#853FF9] hover:text-[#a76df9] cursor-pointer text-sm font-medium">
                            View All
                            <ArrowRight size={16} />
                        </Link>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto flex-1 table-custom-scrollbar">
                <table className="w-full text-left">
                    <thead className='sticky top-0 bg-[#151c2c]'>
                        {isEventRequest ? (
                            <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
                                <th className="px-6 py-4 font-semibold">Event Name</th>
                                <th className="px-6 py-4 font-semibold">Event Type</th>
                                <th className="px-6 py-4 font-semibold">Event Venue</th>
                                <th className="px-6 py-4 font-semibold">Event Date</th>
                                <th className="px-6 py-4 font-semibold">Dpt</th>
                                <th className="px-6 py-4 font-semibold">Event Status</th>
                                <th className="px-6 py-4 font-semibold">Approved Status</th>
                                <th className="px-6 py-4 font-semibold text-center">Action</th>
                            </tr>
                        ) : (
                            <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Organizer Name</th>
                                <th className="px-6 py-4 font-semibold">Event Type</th>
                                <th className="px-6 py-4 font-semibold">Organizer Email</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-center">Action</th>
                            </tr>
                        )}
                    </thead>

                    <tbody>
                        {tableRows.length > 0 ? (
                            isEventRequest ? tableRows.map((event, index) => {
                                const rowId = event.eventId || index

                                return (
                                    <tr
                                        key={rowId}
                                        className="border-t border-[#20283a] text-sm text-white align-top"
                                    >
                                        <td className="px-6 py-4 font-medium whitespace-nowrap">
                                            <div className="max-w-30 truncate" title={event.eventName}>
                                                {event.eventName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{event.eventType}</td>
                                        <td className="px-6 py-4">
                                            <ExpandableListCell
                                                values={event.venues}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <ExpandableListCell
                                                values={event.dates}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{event.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={getStatusClassName(event.status)}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={event.approvedStatus} />
                                        </td>
                                    <td className="px-6 py-4">
                                        <button className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white">
                                            <ExternalLink size={17} />
                                        </button>
                                    </td>
                                    </tr>
                                )
                            }) : tableRows.map((row, index) => {
                                const rowId = row.id || index

                                return (
                                    <tr
                                        key={rowId}
                                        className="border-t border-[#20283a] text-sm text-white align-top"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">{row.date}</td>
                                        <td className="px-6 py-4 font-medium whitespace-nowrap">
                                            <div className="max-w-34 truncate" title={row.organizerName}>
                                                {row.organizerName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{row.eventType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="max-w-40 truncate" title={row.organizerEmail}>
                                                {row.organizerEmail}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={row.status} />
                                        </td>
                                    <td className="px-6 py-4">
                                        <Link
                                            to={`/dashboard/IndividualEvents/${row.id}`}
                                            className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white"
                                            title="Open request details"
                                        >
                                            <ExternalLink size={17} />
                                        </Link>
                                    </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr className="border-t border-[#20283a] text-sm text-[#8b93a7]">
                                <td className="px-6 py-8 text-center" colSpan={isEventRequest ? 8 : 6}>
                                    No requests available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default AdminUpcomingEventsTable
