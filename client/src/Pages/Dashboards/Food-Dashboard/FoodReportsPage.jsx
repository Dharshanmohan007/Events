import React, { useState, useEffect } from 'react'
import { Download, Filter, Search } from 'lucide-react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import { buildEventTemplate } from '../../../templates/eventTemplate'
import { buildIndividualRequestTemplate } from '../../../templates/individualRequestTemplate'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const TableSkeleton = ({ cols }) => (
    <tbody>
        {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i} className="border-t border-[#20283a]">
                {Array.from({ length: cols }).map((__, j) => (
                    <td key={j} className="px-5 py-4">
                        <div className="h-3 w-full animate-pulse rounded bg-[#20283a]" />
                    </td>
                ))}
            </tr>
        ))}
    </tbody>
)

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return Number.isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const POSITIVE_STATUSES = ['closed', 'approved', 'completed', 'accepted', 'acknowledged']

const Status = ({ status }) => {
    const label = status || 'Pending'
    const isPositive = POSITIVE_STATUSES.includes(String(label).toLowerCase())

    return (
        <span className={`inline-flex items-center gap-2 font-semibold ${isPositive ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isPositive ? 'bg-[#34D399]' : 'bg-[#F87171]'}`} />
            {label}
        </span>
    )
}

const FoodReportsTable = ({ rows, activeTab, isLoading }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const isEventReport = activeTab === 'event'
    const columns = isEventReport 
        ? ['Event Name', 'Event Type/Dept', 'Venue', 'Date', 'Status', 'Action']
        : ['Event Name', 'Dept', 'Requester Name', 'Requester Phone', 'Required Date', 'Status', 'Action']

    const filteredRows = rows.filter((row) => (
        Object.values(row).join(' ').toLowerCase().includes(searchTerm.toLowerCase())
    ))

    const handleDownload = async (row) => {
        if (activeTab === 'event') {
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
                            if (document.body.contains(iframe)) {
                                document.body.removeChild(iframe)
                            }
                        }, 1000)
                    }
                } else {
                    alert(`Failed to fetch event details. See console for API response.`)
                }
            } catch (err) {
                console.error('[PDF Fetch] Error generating PDF:', err)
                alert('Error connecting to API to generate PDF.')
            }
            return
        }

        // Individual Requests — PDF via shared template (same as Faculty/Admin)
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(
                `${API_BASE_URL}/api/individual-submissions/getrequest/${row.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            const json = await res.json()
            // API returns { success, count, data: [ {...} ] } — take first element
            const reqObj = Array.isArray(json.data) ? json.data[0] : (json.data || json)
            if (reqObj && (reqObj.id || reqObj._id || reqObj.formType)) {
                const htmlString = buildIndividualRequestTemplate(reqObj)
                const iframe = document.createElement('iframe')
                iframe.style.position = 'absolute'
                iframe.style.width = '0'
                iframe.style.height = '0'
                iframe.style.border = 'none'
                document.body.appendChild(iframe)
                // Set onload BEFORE writing so we don't miss the event
                iframe.onload = () => {
                    iframe.contentWindow.focus()
                    setTimeout(() => {
                        iframe.contentWindow.print()
                        setTimeout(() => {
                            if (document.body.contains(iframe)) document.body.removeChild(iframe)
                        }, 2000)
                    }, 300)
                }
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
                iframeDoc.open()
                iframeDoc.write(htmlString)
                iframeDoc.close()
            } else {
                console.error('[PDF Fetch] Failed to find individual request data:', json)
                alert('Failed to fetch individual request details.')
            }
        } catch (err) {
            console.error('[PDF Fetch] Error generating individual PDF:', err)
            alert('Error connecting to API to generate PDF.')
        }
    }

    return (
        <section className="mt-5 h-[calc(100vh-270px)] rounded-lg border border-[#2a3347] bg-[#151c2c] flex flex-col">
            <div className="flex flex-wrap items-center justify-end gap-3 px-5 py-4 flex-shrink-0">
                <div className="flex h-9 w-[285px] items-center gap-2 rounded-full border border-[#343b4a] bg-[#232A3C] px-3">
                    <Search size={14} className="text-[#8b93a4]" />
                    <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#FFFFFF66]"
                        placeholder="Search..."
                    />
                </div>
                <button type="button" className="flex h-9 items-center gap-2 rounded-md border border-[#343b4a] bg-[#232A3C] px-3 text-xs text-white">
                    <Filter size={12} className="text-[#8b93a4]" />
                    Filters
                </button>
            </div>

            <div className="flex-1 overflow-auto table-custom-scrollbar">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-[#1B2335] text-xs uppercase text-[#7f8799]">
                        <tr>
                            {columns.map((column) => (
                                <th key={column} className="px-5 py-4 font-semibold last:text-center">{column}</th>
                            ))}
                        </tr>
                    </thead>
                    {isLoading ? (
                        <TableSkeleton cols={columns.length} />
                    ) : (
                        <tbody>
                            {filteredRows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-[#FFFFFF66]">
                                        No reports found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRows.map((row, index) => (
                                    <tr key={row.id || index} className="border-t border-[#20283a] text-xs text-white">
                                        <td className="px-5 py-4 font-medium">{row.eventName}</td>
                                        {isEventReport ? (
                                            <>
                                                <td className="px-5 py-4">{row.eventTypeDept}</td>
                                                <td className="px-5 py-4">{row.eventVenue}</td>
                                                <td className="px-5 py-4">{row.eventDate}</td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-5 py-4">{row.department}</td>
                                                <td className="px-5 py-4">{row.requesterName}</td>
                                                <td className="px-5 py-4">{row.requesterPhone}</td>
                                                <td className="px-5 py-4">{row.requiredDate}</td>
                                            </>
                                        )}
                                        <td className="px-5 py-4"><Status status={row.status} /></td>
                                        <td className="px-5 py-4 text-center">
                                            <button type="button" onClick={() => handleDownload(row)} className="inline-flex text-[#8b93a7] hover:text-white" aria-label="Download report">
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
        </section>
    )
}

const FoodReportsPage = () => {
    const [activeTab, setActiveTab] = useState('event')
    const isEventReport = activeTab === 'event'

    const [events, setEvents] = useState([])
    const [eventsLoading, setEventsLoading] = useState(true)

    const [individualRows, setIndividualRows] = useState([])
    const [individualLoading, setIndividualLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        const token = localStorage.getItem('token')
        if (!token) {
            setEventsLoading(false)
            return
        }

        ;(async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/table/dashboard-table?module=food`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const json = await res.json()
                if (Array.isArray(json.data) && isMounted) {
                    setEvents(
                        (json.data || []).map((ev) => ({
                            id: ev.eventId || ev.id || ev._id,
                            eventName: ev.eventName || '-',
                            eventTypeDept: `${ev.eventType || '-'} / ${ev.organizingDepartment || '-'}`,
                            eventVenue: (Array.isArray(ev.venues) && ev.venues.length > 0)
                                ? ev.venues[0]
                                : ev.eventVenue || ev.venue || '-',
                            eventDate: formatDate(
                                (Array.isArray(ev.dates) && ev.dates.length > 0)
                                    ? ev.dates[0]
                                    : ev.eventDate
                            ),
                            status: ev.overallStatus || ev.departmentStatus || ev.acknowledgeStatus || '-',
                        }))
                    )
                }
            } catch (err) {
                console.warn('FoodReportsPage events:', err.message)
            } finally {
                if (isMounted) setEventsLoading(false)
            }
        })()

        return () => { isMounted = false }
    }, [])

    useEffect(() => {
        let isMounted = true
        const token = localStorage.getItem('token')
        if (!token) {
            setIndividualLoading(false)
            return
        }

        ;(async () => {
            try {
                // Confirmed correct endpoint: returns real food individual submissions
                const res = await fetch(`${API_BASE_URL}/api/individual-submissions/getrequest?module=food`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                const json = await res.json()
                if (json.success && isMounted) {
                    setIndividualRows(
                        (json.data || []).map((req) => ({
                            id: req.id || req._id,
                            // Map from confirmed response shape: employeeDetail.firstName, formType, status, createdAt
                            eventName: req.employeeDetail?.firstName || req.employee || '-',
                            department: req.employeeDetail?.department || req.department || '-',
                            requesterName: req.employeeDetail?.firstName || req.employee || '-',
                            requesterPhone: req.employeeDetail?.phone || req.employeePhone || '-',
                            requiredDate: formatDate(req.createdAt),
                            status:
                                typeof req.status === 'string'
                                    ? req.status
                                    : Object.values(req.status || {}).find(Boolean) || 'Pending',
                        }))
                    )
                }
            } catch (err) {
                console.warn('FoodReportsPage individual:', err.message)
            } finally {
                if (isMounted) setIndividualLoading(false)
            }
        })()

        return () => { isMounted = false }
    }, [])

    return (
        <section className="min-h-screen overflow-auto bg-[#0b1326] text-white poppins table-custom-scrollbar">
            <div className="sticky top-0 z-50 bg-[#0b1326]">
                <DashboardHeader basePath="/dashboard-food" />
            </div>
            
            <main className="px-6 pb-10">
                <div className="flex items-center justify-between pt-5 pb-5">
                    <div>
                        <h1 className="text-[22px] font-semibold text-white">Food Reports</h1>
                        <p className="mt-1 text-sm text-[#FFFFFF80]">
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                        </p>
                    </div>

                    <nav className="flex rounded-md bg-[#1b2335] p-0.5" aria-label="Request type tabs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('event')}
                            className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${isEventReport
                                ? 'bg-[#8B3DFF] text-white shadow-sm'
                                : 'text-[#8b93a7] hover:text-white'
                                }`}
                        >
                            Event Request Report
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('individual')}
                            className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${!isEventReport
                                ? 'bg-[#8B3DFF] text-white shadow-sm'
                                : 'text-[#8b93a7] hover:text-white'
                                }`}
                        >
                            Individual Request Report
                        </button>
                    </nav>
                </div>

                <FoodReportsTable 
                    rows={isEventReport ? events : individualRows} 
                    activeTab={activeTab} 
                    isLoading={isEventReport ? eventsLoading : individualLoading} 
                />
            </main>
        </section>
    )
}

export default FoodReportsPage
