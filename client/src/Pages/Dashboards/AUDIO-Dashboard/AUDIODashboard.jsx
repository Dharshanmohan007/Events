import React, { useState, useEffect, useRef } from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import StatCard from '../../../Components/StatCard'
import UpcomingEventsTable from '../../../Components/UpcomingEventsTable'
import FeedbackRatings from '../../../Components/FeedbackRatings'
import { useDepartmentFeedback } from '../../../api/feedbackApi'

// AUDIO Dashboard specific data
import calendarFill from '../../../assets/calendarFill.svg'
import hourglassFill from '../../../assets/hourglassFill.svg'
import tick from '../../../assets/tick.svg'
import circleTick from '../../../assets/circle-tick.svg'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const statCardData = [
    {
        lable: 'Total Sessions',
        value: 120,
        icon: calendarFill,
        bgColor: 'bg-gradient-to-r from-[#241d43] to-[#3d196b]',
        sideColor: 'bg-[#654ec3]',
        iconBg: 'bg-[#b89aff]',
    },
    {
        lable: 'Active Sessions',
        value: 45,
        icon: tick,
        bgColor: 'bg-gradient-to-r from-[#171d3b] to-[#1b196c]',
        sideColor: 'bg-[#6871ce]',
        iconBg: 'bg-[#818cf8]',
    },
    {
        lable: 'Completed Sessions',
        value: 65,
        icon: circleTick,
        bgColor: 'bg-gradient-to-r from-[#162d36] to-[#146147]',
        sideColor: 'bg-[#08805e]',
        iconBg: 'bg-[#34d399]',
    },
    {
        lable: 'Scheduled Sessions',
        value: 10,
        icon: hourglassFill,
        bgColor: 'bg-gradient-to-r from-[#261e35] to-[#591941]',
        sideColor: 'bg-[#b6256a]',
        iconBg: 'bg-[#ff78a8]',
    },
]

const departmentData = [
    { name: 'Audio Eng.', value: 35, color: '#74b9ff' },
    { name: 'Media', value: 30, color: '#159283' },
    { name: 'Broadcasting', value: 20, color: '#68df85' },
    { name: 'Music', value: 15, color: '#4169e1' },
]

const transformAudioData = (apiData) =>
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

const AUDIODashboard = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [eventStats, setEventStats] = useState(null)
    const feedbackRows = useDepartmentFeedback('audio')

    useEffect(() => {
        let isMounted = true
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        Promise.all([
            fetch(`${API_BASE_URL}/api/dashboard/stats?module=audio`, { headers }),
            fetch(`${API_BASE_URL}/api/dashboard/individual-stats?module=audio`, { headers }),
        ])
            .then(([eventRes]) => Promise.all([
                eventRes.ok ? eventRes.json() : Promise.resolve({}),
            ]))
            .then(([eventData]) => {
                if (isMounted) {
                    setEventStats(eventData.modules?.audio ?? eventData.events ?? EMPTY_STATS)
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
                const res = await fetch(`${API_BASE_URL}/api/table/dashboard-table?module=audio`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                })
                const json = await res.json()
                if (json.data && Array.isArray(json.data)) {
                    setEvents(transformAudioData(json.data))
                }
            } catch (err) {
                console.error('Failed to fetch audio dashboard data:', err)
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
                <DashboardHeader basePath="/dashboard-audio" />

                {/* main-container  */}
                <div className='main-body-container  px-6 '>
                    {/* heading */}
                    <div className="heading mt-2">
                        <h1 className='text-white text-lg font-medium'>AUDIO Dashboard Overview</h1>
                        <h1 className='text-[#FFFFFF80] text-sm'>Lorem Ipsumis simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</h1>
                    </div>

                    {/* stat cards  */}
                    <StatCard data={statCardData.map((item) => {
                        const label = item.lable.toLowerCase()
                        const stats = eventStats ?? EMPTY_STATS
                        if (label.includes('total')) return { ...item, value: stats.total ?? 0 }
                        if (label.includes('completed')) return { ...item, value: stats.completed ?? 0 }
                        if (label.includes('scheduled') || label.includes('pending')) return { ...item, value: stats.pending ?? 0 }
                        if (label.includes('active') || label.includes('acknowledged') || label.includes('approved')) return { ...item, value: stats.approved ?? 0 }
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
                                viewAllLink="/dashboard-audio/events"
                                title="Upcoming Events"
                                module="audio"
                                detailViewPath="/dashboard-audio/events/detailView"
                            />
                        )}
                    </div>

                    <div className="mt-8 grid grid-cols-12 gap-3 pb-5">
                        <FeedbackRatings rows={feedbackRows} feedbackLink="/dashboard-audio/feedback" />
                        <DepartmentRequestChart data={departmentData} title="Audio Request By Department" />
                    </div>

                </div>
            </section>
        </>
    )
}

export default AUDIODashboard
