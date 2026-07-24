import React, { useState, useEffect } from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import TransportStatcard from './TransportStatcard'
import UpcomingEventsTable from '../../../Components/UpcomingEventsTable'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import FeedbackRatings from '../../../Components/FeedbackRatings'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const individualRequests = [
    {
        requiredDate: '15-03-2026',
        organizerName: 'Surya Chandran',
        department: 'CSE',
        organizerPhone: '9080884370',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        requiredDate: '16-03-2026',
        organizerName: 'Vikram Raj',
        department: 'ECE',
        organizerPhone: '9876543210',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        requiredDate: '22-03-2026',
        organizerName: 'Ananya Devi',
        department: 'AIML',
        organizerPhone: '8765432109',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        requiredDate: '25-03-2026',
        organizerName: 'Karthik Rajan',
        department: 'ME',
        organizerPhone: '7654321098',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        requiredDate: '28-03-2026',
        organizerName: 'Deepika Patel',
        department: 'IT',
        organizerPhone: '6543210987',
        acknowledgeStatus: 'Acknowledged',
    },
]

const departmentData = [
    { name: 'CSE', value: 25, color: '#74b9ff' },
    { name: 'AIML', value: 55, color: '#159283' },
    { name: 'EEE', value: 12, color: '#68df85' },
    { name: 'VLSI', value: 8, color: '#4169e1' },
]

const transformTransportData = (apiData) =>
    apiData.map((item) => ({
        eventId: item.eventId,
        eventName: item.eventName || '-',
        eventDate: item.dates || [],
        department: item.organizingDepartment || '-',
        acknowledgeStatus: item.departmentStatus || item.overallStatus || '-',
    }))

const TransportsDashboard = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${API_BASE_URL}/api/table/dashboard-table?module=transport`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                })
                const json = await res.json()
                if (json.data && Array.isArray(json.data)) {
                    setEvents(transformTransportData(json.data))
                }
            } catch (err) {
                console.error('Failed to fetch transport dashboard data:', err)
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
                <div className='header-container sticky top-0 z-10'>
                    <DashboardHeader basePath="/dashboard-transports" />
                </div>

                {/* main-container  */}
                <div className='main-body-container  px-6 '>
                    {/* heading */}
                    <div className="heading mt-2">
                        <h1 className='text-white text-lg font-medium'>Transport Dashboard Overview</h1>
                        <h1 className='text-[#FFFFFF80] text-sm'>Lorem Ipsumis simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</h1>
                    </div>

                    {/* stat cards  */}

                    <TransportStatcard />

                    {/* table and charts    */}
                    <div className="main-container mt-4 h-[calc(100vh-270px)] w-full [&>section]:w-full">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-[#CBC3D7]/65">Loading events...</p>
                            </div>
                        ) : (
                            <UpcomingEventsTable
                                events={events}
                                viewAllLink="/dashboard-transports/events"
                                title="Upcoming Event Transport Request"
                                module="transport"
                                individualEvents={individualRequests}
                                detailViewPath="/dashboard-transports/events/detailView"
                            />
                        )}
                    </div>

                    <div className="mt-8 grid grid-cols-12 gap-3 pb-5">
                        <FeedbackRatings feedbackLink="/dashboard-transports/feedback" />
                        <DepartmentRequestChart data={departmentData} title="Transport Request By Department" />
                    </div>
                </div>

            </section>
        </>
    )
}

export default TransportsDashboard
