import React, { useState, useEffect } from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import PurchaseStatcard from './PurchaseStatcard'
import UpcomingEventsTable from '../../../Components/UpcomingEventsTable'
import FeedbackRatings from '../../../Components/FeedbackRatings'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return Number.isNaN(date.getTime())
    ? dateStr
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
}

const transformPurchaseData = (apiData) =>
    apiData.map((item) => ({
        eventId: item.eventId,
        eventName: item.eventName || '-',
        eventDate: item.dates || [],
        eventType: item.eventType || '-',
        department: item.organizingDepartment || '-',
        acknowledgeStatus: item.departmentStatus || item.overallStatus || '-',
    }))

const transformIndividualData = (apiData) =>
    apiData.map((item) => {
        const emp = item.data?.employee
        const purchase = item.data?.purchases?.[0]
        return {
            requiredDate: purchase?.deliveryDate ? formatDate(purchase.deliveryDate) : formatDate(item.createdAt),
            organizerName: emp?.name || item.employee || '-',
            department: emp?.department || '-',
            organizerPhone: emp?.phone ? String(emp.phone) : '-',
            acknowledgeStatus: item.data?.overallStatus || item.status || '-',
            eventId: item.id || item.data?._id,
        }
    })

const departmentData = [
    { name: 'CSE', value: 25, color: '#74b9ff' },
    { name: 'AIML', value: 55, color: '#159283' },
    { name: 'EEE', value: 12, color: '#68df85' },
    { name: 'VLSI', value: 8, color: '#4169e1' },
    { name: 'ECE', value: 15, color: '#ff7675' },
    { name: 'ME', value: 20, color: '#fdcb6e' },
    { name: 'IT', value: 18, color: '#00b894' },
]

const PurchaseDashboard = () => {
    const [events, setEvents] = useState([])
    const [individualEvents, setIndividualEvents] = useState([])
    const [loading, setLoading] = useState(true)

    const getToken = () => localStorage.getItem('token')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getToken()
                const headers = token ? { Authorization: `Bearer ${token}` } : {}

                const [eventsRes, individualsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/table/dashboard-table?module=purchase`, { headers }),
                    fetch(`${API_BASE_URL}/api/individual-submissions/getrequest?module=purchase`, { headers }),
                ])

                if (eventsRes.ok) {
                    const json = await eventsRes.json()
                    if (json.data && Array.isArray(json.data)) {
                        setEvents(transformPurchaseData(json.data))
                    }
                }

                if (individualsRes.ok) {
                    const json = await individualsRes.json()
                    if (json.data && Array.isArray(json.data)) {
                        setIndividualEvents(transformIndividualData(json.data))
                    }
                }
            } catch (err) {
                console.error('Failed to fetch purchase dashboard data:', err)
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
                    <DashboardHeader basePath="/dashboard-purchase" showReports={false} />
                </div>
                {/* main-container  */}
                <div className='main-body-container  px-6 '>
                    {/* heading */}
                    <div className="heading mt-2">
                        <h1 className='text-white text-lg font-medium'>Purchase & Procurement Dashboard Overview</h1>
                        <h1 className='text-[#FFFFFF80] text-sm'>Lorem Ipsumis simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</h1>
                    </div>
                    {/* stat cards  */}
                    <PurchaseStatcard />
                    {/* table and charts    */}
                    <div className="main-container mt-4 h-[calc(100vh-270px)] w-full [&>section]:w-full">
                        {loading ? (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-sm text-[#CBC3D7]/65">Loading events...</p>
                            </div>
                        ) : (
                            <UpcomingEventsTable
                                events={events}
                                viewAllLink="/dashboard-purchase/events"
                                title="Upcoming Purchase Requests"
                                module="purchase"
                                individualEvents={individualEvents}
                                detailViewPath="/dashboard-purchase/events/detailView"
                                individualDetailViewPath="/dashboard-purchase/events/individualDetailView"
                            />
                        )}
                    </div>

                    <div className="mt-8 grid grid-cols-12 gap-3 pb-5">
                        <FeedbackRatings feedbackLink="/dashboard-purchase/feedback" />
                        <DepartmentRequestChart data={departmentData} title="Purchase Request By Department" />
                    </div>
                </div>
            </section>
        </>
    )
}

export default PurchaseDashboard
