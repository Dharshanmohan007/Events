import React from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import StatCard from '../../../Components/StatCard'
import UpcomingEventsTable from '../../../Components/UpcomingEventsTable'
import FeedbackRatings from '../../../Components/FeedbackRatings'

// AUDIO Dashboard specific data
import calendarFill from '../../../assets/calendarFill.svg'
import hourglassFill from '../../../assets/hourglassFill.svg'
import tick from '../../../assets/tick.svg'
import circleTick from '../../../assets/circle-tick.svg'

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

const upcomingEvents = [
    {
        eventName: 'Audio Mixing Workshop',
        eventType: 'Workshop',
        eventDate: '20-03-2026',
        department: 'Audio Eng.',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Sound Design Masterclass',
        eventType: 'Masterclass',
        eventDate: '22-03-2026',
        department: 'Media',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Podcast Recording Session',
        eventType: 'Recording',
        eventDate: '25-03-2026',
        department: 'Broadcasting',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Live Sound Engineering',
        eventType: 'Training',
        eventDate: '28-03-2026',
        department: 'Audio Eng.',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Music Production Seminar',
        eventType: 'Seminar',
        eventDate: '01-04-2026',
        department: 'Music',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Voice Over Workshop',
        eventType: 'Workshop',
        eventDate: '05-04-2026',
        department: 'Broadcasting',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Audio Post-Production',
        eventType: 'Training',
        eventDate: '08-04-2026',
        department: 'Media',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Spatial Audio Seminar',
        eventType: 'Seminar',
        eventDate: '10-04-2026',
        department: 'Audio Eng.',
        acknowledgeStatus: 'Acknowledged',
    },
]

const departmentData = [
    { name: 'Audio Eng.', value: 35, color: '#74b9ff' },
    { name: 'Media', value: 30, color: '#159283' },
    { name: 'Broadcasting', value: 20, color: '#68df85' },
    { name: 'Music', value: 15, color: '#4169e1' },
]

const AUDIODashboard = () => {
    console.log("AUDIO Dashboard rendered") // Debug log to check rendering 
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
                    <StatCard data={statCardData} />

                    {/* table and charts   */}
                    <div className="main-container mt-4 h-[calc(100vh-270px)] w-full [&>section]:w-full">
                        <UpcomingEventsTable
                            events={upcomingEvents}
                            viewAllLink="/dashboard-audio/events"
                            title="Upcoming Events"
                        />
                    </div>

                    <div className="mt-8 grid grid-cols-12 gap-3 pb-5">
                        <FeedbackRatings feedbackLink="/dashboard-audio/feedback" />
                        <DepartmentRequestChart data={departmentData} title="Audio Request By Department" />
                    </div>

                </div>
            </section>
        </>
    )
}

export default AUDIODashboard
