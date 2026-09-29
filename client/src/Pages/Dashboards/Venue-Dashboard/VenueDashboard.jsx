import React, { useState, useEffect, useRef } from 'react'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import FeedbackRatings from '../../../Components/FeedbackRatings'
import StatCard from '../../../Components/StatCard'
import UpcomingEventsTable from '../../../Components/UpcomingEventsTable'
import { useDepartmentFeedback } from '../../../api/feedbackApi'
import calendarFill from '../../../assets/calendarFill.svg'
import circleTick from '../../../assets/circle-tick.svg'
import hourglassFill from '../../../assets/hourglassFill.svg'
import tick from '../../../assets/tick.svg'
import VenueHeader from './VenueHeader'

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
        lable: 'Completed',
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

const transformVenueData = (apiData) =>
    apiData.map((item) => ({
        eventId: item.eventId,
        eventName: item.eventName || '-',
        eventDate: item.dates || [],
        eventType: item.eventType || '-',
        department: item.organizingDepartment || '-',
        venue: item.venues || [],
        acknowledgeStatus: item.departmentStatus || item.overallStatus || '-',
    }))

const EMPTY_STATS = {
    total: 0,
    approved: 0,
    completed: 0,
    pending: 0,
    rejected: 0,
}

const VenueDashboard = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [eventStats, setEventStats] = useState(null)
    const feedbackRows = useDepartmentFeedback('venue')

    useEffect(() => {
        let isMounted = true
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        Promise.all([
            fetch(`${API_BASE_URL}/api/dashboard/stats?module=venue`, { headers }),
            fetch(`${API_BASE_URL}/api/dashboard/individual-stats?module=venue`, { headers }),
        ])
            .then(([eventRes, individualRes]) => Promise.all([
                eventRes.ok ? eventRes.json() : Promise.resolve({}),
                individualRes.ok ? individualRes.json() : Promise.resolve({}),
            ]))
            .then(([eventData]) => {
                if (isMounted) {
                    setEventStats(eventData.modules?.venue ?? eventData.events ?? EMPTY_STATS)
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
                const res = await fetch(`${API_BASE_URL}/api/table/dashboard-table?module=venue`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                })
                const json = await res.json()
                if (json.data && Array.isArray(json.data)) {
                    setEvents(transformVenueData(json.data))
                }
            } catch (err) {
                console.error('Failed to fetch venue dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <section className="bg-[#0b1326] poppins h-screen overflow-auto table-custom-scrollbar">
            <VenueHeader />

            <div className="main-body-container px-6">
                <div className="heading mt-2">
                    <h1 className="text-white text-lg font-medium">Venue Dashboard Overview</h1>
                    <h1 className="text-[#FFFFFF80] text-sm">
                        Lorem Ipsumis simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                    </h1>
                </div>

                <StatCard data={statCardData.map((item) => {
                    const label = item.lable.toLowerCase()
                    const stats = eventStats ?? EMPTY_STATS
                    if (label.includes('total')) return { ...item, value: stats.total ?? 0 }
                    if (label.includes('approved')) return { ...item, value: stats.approved ?? 0 }
                    if (label.includes('booked') || label.includes('completed')) return { ...item, value: stats.completed ?? 0 }
                    if (label.includes('pending')) return { ...item, value: stats.pending ?? 0 }
                    return item
                })} />

                <div className="main-container mt-4 h-[calc(100vh-270px)] w-full [&>section]:w-full">
                    {loading ? (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-sm text-[#CBC3D7]/65">Loading events...</p>
                        </div>
                    ) : (
                        <UpcomingEventsTable
                            events={events}
                            viewAllLink="/dashboard-venue/requests"
                            module="venue"
                            detailViewPath="/dashboard-venue/events/detailView"
                        />
                    )}
                </div>

                <div className="mt-8 grid grid-cols-12 gap-3 pb-5">
                    <FeedbackRatings rows={feedbackRows} feedbackLink="/dashboard-venue/feedback" />
                    <DepartmentRequestChart module="venue" title="Venue Request By Department" />
                </div>
            </div>
        </section>
    )
}

export default VenueDashboard
