import React, { useState, useEffect, useRef } from 'react'
import AccommodationHeader from './AccommodationHeader'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import StatCard from '../../../Components/StatCard'
import UpcomingEventsTable from '../../../Components/UpcomingEventsTable'
import FeedbackRatings from '../../../Components/FeedbackRatings'
import { useDepartmentFeedback } from '../../../api/feedbackApi'
import { Download, Loader2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { generateAccommodationConsolidatedReportPdf } from '../../../utils/accommodationConsolidatedReportPdf'

// Accommodation Dashboard specific data
import calendarFill from '../../../assets/calendarFill.svg'
import hourglassFill from '../../../assets/hourglassFill.svg'
import tick from '../../../assets/tick.svg'
import circleTick from '../../../assets/circle-tick.svg'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const statCardData = [
    {
        lable: 'Total Requests',
        value: 50,
        icon: calendarFill,
        bgColor: 'bg-gradient-to-r from-[#241d43] to-[#3d196b]',
        sideColor: 'bg-[#654ec3]',
        iconBg: 'bg-[#b89aff]',
    },
    {
        lable: 'Approved Requests',
        value: 50,
        icon: tick,
        bgColor: 'bg-gradient-to-r from-[#171d3b] to-[#1b196c]',
        sideColor: 'bg-[#6871ce]',
        iconBg: 'bg-[#818cf8]',
    },
    {
        lable: 'Completed Requests',
        value: 50,
        icon: circleTick,
        bgColor: 'bg-gradient-to-r from-[#162d36] to-[#146147]',
        sideColor: 'bg-[#08805e]',
        iconBg: 'bg-[#34d399]',
    },
    {
        lable: 'Pending Requests',
        value: 50,
        icon: hourglassFill,
        bgColor: 'bg-gradient-to-r from-[#261e35] to-[#591941]',
        sideColor: 'bg-[#b6256a]',
        iconBg: 'bg-[#ff78a8]',
    },
]

const transformAccommodationData = (apiData) =>
    apiData.map((item) => ({
        eventId: item.eventId,
        eventName: item.eventName || '-',
        eventDate: item.dates || [],
        eventType: item.eventType || '-',
        department: item.organizingDepartment || '-',
        acknowledgeStatus: item.departmentStatus || item.overallStatus || '-',
    }))

const EMPTY_STATS = {
    total: 0,
    approved: 0,
    completed: 0,
    pending: 0,
    rejected: 0,
}

const AccommodationDashboard = () => {
    const now = new Date()
    const [reportModalOpen, setReportModalOpen] = useState(false)
    const [generatingReport, setGeneratingReport] = useState(false)
    const reportRequestInProgress = useRef(false)
    const [reportMonth, setReportMonth] = useState(now.getMonth())
    const reportYear = now.getFullYear()
    const monthRange = (month, year) => ({
        from: `${year}-${String(month + 1).padStart(2, '0')}-01`,
        to: `${year}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`,
    })
    const [reportDates, setReportDates] = useState(() => monthRange(now.getMonth(), now.getFullYear()))
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [eventStats, setEventStats] = useState(null)
    const feedbackRows = useDepartmentFeedback('accommodation')

    const handleReportMonthChange = (event) => {
        const month = Number(event.target.value)
        setReportMonth(month)
        setReportDates(monthRange(month, reportYear))
    }

    const handleGenerateReport = async (event) => {
        event.preventDefault()
        if (reportRequestInProgress.current) return

        const { from, to } = reportDates
        const datePattern = /^\d{4}-\d{2}-\d{2}$/
        if (!datePattern.test(from) || !datePattern.test(to) || from > to) {
            toast.error('Please select a valid date range. The from date must be on or before the to date.')
            return
        }

        const token = localStorage.getItem('token')
        if (!token) {
            toast.error('Your session has expired. Please sign in again to generate the report.')
            return
        }

        if (!API_BASE_URL) {
            toast.error('The API URL is not configured. Please contact support.')
            return
        }

        reportRequestInProgress.current = true
        setGeneratingReport(true)
        try {
            const query = new URLSearchParams({ fromDate: from, toDate: to })
            const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/consolidated-reports/accommodation?${query.toString()}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            })
            let payload
            try {
                payload = await response.json()
            } catch {
                payload = null
            }
            if (!response.ok) {
                throw new Error(payload?.message || payload?.error || 'Failed to fetch the accommodation consolidated report.')
            }
            if (!Array.isArray(payload?.data)) {
                throw new Error(payload?.message || 'The accommodation report response has an unexpected format.')
            }

            generateAccommodationConsolidatedReportPdf({ data: payload.data, fromDate: from, toDate: to })
            toast.success('Accommodation consolidated report downloaded.')
            setReportModalOpen(false)
        } catch (error) {
            console.error('Accommodation consolidated report generation failed:', error)
            toast.error(error.message || 'Failed to generate the accommodation report. Please try again.')
        } finally {
            reportRequestInProgress.current = false
            setGeneratingReport(false)
        }
    }

    useEffect(() => {
        let isMounted = true
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        Promise.all([
            fetch(`${API_BASE_URL}/api/dashboard/stats?module=accommodation`, { headers }),
            fetch(`${API_BASE_URL}/api/dashboard/individual-stats?module=accommodation`, { headers }),
        ])
            .then(([eventRes]) => Promise.all([
                eventRes.ok ? eventRes.json() : Promise.resolve({}),
            ]))
            .then(([eventData]) => {
                if (isMounted) {
                    setEventStats(eventData.modules?.accommodation ?? eventData.events ?? EMPTY_STATS)
                }
            })
            .catch((error) => {
                console.warn(error.message)
                if (isMounted) setEventStats(EMPTY_STATS)
            })

        return () => { isMounted = false }
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_BASE_URL}/api/table/dashboard-table?module=accommodation`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                })
                const json = await res.json()
                if (json.data && Array.isArray(json.data)) {
                    setEvents(transformAccommodationData(json.data))
                }
            } catch (err) {
                console.error('Failed to fetch accommodation dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <>
            <section className='bg-[#0b1326] poppins h-screen overflow-auto table-custom-scrollbar'>
                {/* header  */}
                <AccommodationHeader />

                {/* main-container  */}
                <div className='main-body-container  px-6 '>
                    {/* heading */}
                    <div className="heading mt-2 flex items-center justify-between gap-4">
                        <h1 className='text-white text-lg font-medium'>Accommodation Dashboard Overview</h1>
                        <button type="button" onClick={() => setReportModalOpen(true)} className="shrink-0 rounded-md bg-linear-to-r from-[#813df2] to-[#512696] px-4 py-2 text-white cursor-pointer flex items-center gap-2">
                            <Download size={14} /> Consolidated report
                        </button>
                    </div>
                    <p className='mt-2 text-sm text-[#FFFFFF80]'>Lorem Ipsumis simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</p>

                    {/* stat cards  */}
                    <StatCard data={statCardData.map((item) => {
                        const label = item.lable.toLowerCase()
                        const stats = eventStats ?? EMPTY_STATS
                        if (label.includes('total')) return { ...item, value: stats.total ?? 0 }
                        if (label.includes('approved')) return { ...item, value: stats.approved ?? 0 }
                        if (label.includes('completed')) return { ...item, value: stats.completed ?? 0 }
                        if (label.includes('pending')) return { ...item, value: stats.pending ?? 0 }
                        return item
                    })} />

                    {/* table and charts   */}
                    <div className="main-container mt-4 h-[calc(100vh-270px)] w-full [&>section]:w-full">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-[#CBC3D7]/65">Loading events...</p>
                            </div>
                        ) : (
                            <UpcomingEventsTable 
                                events={events} 
                                viewAllLink="/dashboard-accommodation/requests"
                                module="accommodation"
                                detailViewPath="/dashboard-accommodation/events/detailView"
                            />
                        )}
                    </div>

                    <div className="mt-8 grid grid-cols-12 gap-3 pb-5">
                        <FeedbackRatings rows={feedbackRows} feedbackLink="/dashboard-accommodation/feedback" />
                        <DepartmentRequestChart module="accommodation" title="Accommodation Request By Department" />
                    </div>

                </div>
                
            </section>
            {reportModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/75 px-4 py-6 backdrop-blur-sm"
                    onMouseDown={(event) => { if (!generatingReport && event.target === event.currentTarget) setReportModalOpen(false) }}
                    onKeyDown={(event) => { if (event.key === 'Escape' && !generatingReport) setReportModalOpen(false) }}
                >
                    <div role="dialog" aria-modal="true" aria-labelledby="accommodation-report-title" className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#151c2c]/75 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8">
                        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#813df2]/20 blur-3xl" />
                        <button type="button" onClick={() => setReportModalOpen(false)} disabled={generatingReport} aria-label="Close report dialog" className="absolute right-4 top-4 rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"><X size={18} /></button>
                        <div className="relative">
                            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#b99aff]">Accommodation dashboard</p>
                            <h2 id="accommodation-report-title" className="text-xl font-semibold">Generate consolidated report</h2>
                            <p className="mt-2 text-sm text-[#aeb7ca]">Choose a month and the date range to include in your report.</p>
                            <form className="mt-7 space-y-5" onSubmit={handleGenerateReport}>
                                <label className="block text-sm font-medium text-[#e7eaf1]">
                                    Month
                                    <select value={reportMonth} disabled={generatingReport} onChange={handleReportMonthChange} className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-[#111827]/80 px-3 text-sm text-white outline-none transition focus:border-[#9b6bff] focus:ring-2 focus:ring-[#813df2]/25 disabled:opacity-60">
                                        {Array.from({ length: 12 }, (_, month) => (
                                            <option key={month} value={month} className="bg-[#151c2c]">{new Date(2000, month, 1).toLocaleString('en', { month: 'long' })}</option>
                                        ))}
                                    </select>
                                </label>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <label className="block text-sm font-medium text-[#e7eaf1]">
                                        From date
                                        <input type="date" value={reportDates.from} disabled={generatingReport} onChange={(event) => setReportDates((dates) => ({ ...dates, from: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-[#111827]/80 px-3 text-sm text-white outline-none transition focus:border-[#9b6bff] focus:ring-2 focus:ring-[#813df2]/25 [color-scheme:dark] disabled:opacity-60" />
                                    </label>
                                    <label className="block text-sm font-medium text-[#e7eaf1]">
                                        To date
                                        <input type="date" value={reportDates.to} disabled={generatingReport} onChange={(event) => setReportDates((dates) => ({ ...dates, to: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border border-white/15 bg-[#111827]/80 px-3 text-sm text-white outline-none transition focus:border-[#9b6bff] focus:ring-2 focus:ring-[#813df2]/25 [color-scheme:dark] disabled:opacity-60" />
                                    </label>
                                </div>
                                <button type="submit" disabled={generatingReport} className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#813df2] to-[#512696] px-4 text-sm font-semibold text-white shadow-lg shadow-[#512696]/25 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[#b99aff] focus:ring-offset-2 focus:ring-offset-[#151c2c] disabled:cursor-wait disabled:opacity-70">
                                    {generatingReport ? <><Loader2 size={16} className="animate-spin" /> Generating report...</> : <><Download size={16} /> Generate report</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default AccommodationDashboard
