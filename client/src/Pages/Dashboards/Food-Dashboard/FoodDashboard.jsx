import React, { useState, useEffect, useRef } from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import FoodStatcard from './FoodStatcard'
import UpcomingEventsTable from '../../../Components/UpcomingEventsTable'
import FeedbackRatings from '../../../Components/FeedbackRatings'
import { useDepartmentFeedback, useIndividualFeedback } from '../../../api/feedbackApi'
import { Download, X, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { generateFoodConsolidatedReportPdf } from '../../../utils/foodConsolidatedReportPdf'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return Number.isNaN(date.getTime())
        ? dateStr
        : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
}

const transformFoodData = (apiData) =>
    apiData.map((item) => ({
        eventId: item.eventId,
        eventName: item.eventName || '-',
        eventDate: item.dates || [],
        eventType: item.eventType || '-',
        department: item.organizingDepartment || '-',
        acknowledgeStatus: item.departmentStatus || item.overallStatus || '-',
    }))

const transformIndividualData = (apiData) =>
    apiData.map((item) => ({
        requiredDate: formatDate(item.createdAt),
        organizerName: item.data.employee?.firstName || item.employee || '-',
        department: item.employeeDetail?.department || '-',
        organizerPhone: item.employeeDetail?.phone ? String(item.employeeDetail.phone) : '-',
        acknowledgeStatus: item.data?.overallStatus || item.status || '-',
        eventId: item.id || item.data?._id,
    }))

const FoodDashboard = () => {
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
    const [individualEvents, setIndividualEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const feedbackRows = useDepartmentFeedback('food')
    const individualFeedbackRows = useIndividualFeedback()

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

        reportRequestInProgress.current = true
        setGeneratingReport(true)
        try {
            const query = new URLSearchParams({ fromDate: from, toDate: to })
            const response = await fetch(`${API_BASE_URL?.replace(/\/$/, '')}/api/consolidated-reports/food?${query.toString()}`, {
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
                throw new Error(payload?.message || payload?.error || 'Failed to fetch the food consolidated report.')
            }

            generateFoodConsolidatedReportPdf({ data: payload?.data, fromDate: from, toDate: to })
            toast.success('Food consolidated report downloaded.')
            setReportModalOpen(false)
        } catch (error) {
            console.error('Food consolidated report generation failed:', error)
            toast.error(error.message || 'Failed to generate the food report. Please try again.')
        } finally {
            reportRequestInProgress.current = false
            setGeneratingReport(false)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                const headers = token ? { Authorization: `Bearer ${token}` } : {}

                const [eventsRes, individualsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/table/dashboard-table?module=food`, { headers }),
                    fetch(`${API_BASE_URL}/api/individual-submissions/getrequest?module=food`, { headers }),
                ])

                if (eventsRes.ok) {
                    const json = await eventsRes.json()
                    if (json.data && Array.isArray(json.data)) {
                        setEvents(transformFoodData(json.data))
                    }
                }

                if (individualsRes.ok) {
                    const json = await individualsRes.json()
                    if (json.data && Array.isArray(json.data)) {
                        setIndividualEvents(transformIndividualData(json.data))
                    }
                }
            } catch (err) {
                console.error('Failed to fetch food dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <>
            <section className='bg-[#0b1326] poppins h-screen border overflow-auto table-custom-scrollbar'>
                {/* header  */}
                <div className='header-container sticky top-0 z-50'>
                    <DashboardHeader basePath="/dashboard-food" />
                </div>

                {/* main-container  */}
                <div className='main-body-container  px-6 '>
                    {/* heading */}
                    <div className="heading mt-2 flex items-center justify-between">
                        <h1 className='text-white text-lg font-medium'>Food Dashboard Overview</h1>
                        <div className="report-button">
                            <button type="button" onClick={() => setReportModalOpen(true)} className="bg-linear-to-r from-[#813df2] to-[#512696] text-white cursor-pointer px-4 py-2 rounded-md flex items-center gap-2"><Download size={14} /> Consolidated report</button>
                        </div>
                    </div>

                    {/* stat cards  */}
                    <FoodStatcard />

                    {/* table and charts    */}
                    <div className="main-container mt-4 h-[calc(100vh-270px)] w-full [&>section]:w-full">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-[#CBC3D7]/65">Loading events...</p>
                            </div>
                        ) : (
                            <UpcomingEventsTable
                                events={events}
                                viewAllLink="/dashboard-food/events"
                                title="Upcoming food requests"
                                module="food"
                                individualEvents={individualEvents}
                                detailViewPath="/dashboard-food/events/detailView"
                            />
                        )}
                    </div>

                    <div className="mt-8 grid grid-cols-12 gap-3 pb-5">
                        <FeedbackRatings tabs rows={feedbackRows} individualRows={individualFeedbackRows} feedbackLink="/dashboard-food/feedback" />
                        <DepartmentRequestChart module="food" title="Catering Request By Department" />
                    </div>
                </div>

            </section>
            {reportModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/75 px-4 py-6 backdrop-blur-sm"
                    onMouseDown={(event) => { if (!generatingReport && event.target === event.currentTarget) setReportModalOpen(false) }}
                    onKeyDown={(event) => { if (event.key === 'Escape') setReportModalOpen(false) }}
                >
                    <div role="dialog" aria-modal="true" aria-labelledby="food-report-title" className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#151c2c]/75 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-8">
                        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#813df2]/20 blur-3xl" />
                        <button type="button" onClick={() => setReportModalOpen(false)} disabled={generatingReport} aria-label="Close report dialog" className="absolute right-4 top-4 rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"><X size={18} /></button>
                        <div className="relative">
                            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#b99aff]">Food dashboard</p>
                            <h2 id="food-report-title" className="text-xl font-semibold">Generate consolidated report</h2>
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

export default FoodDashboard
