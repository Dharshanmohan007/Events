import React from 'react'
import AccommodationHeader from './AccommodationHeader'
import StatCard from '../../../Components/StatCard'
import UpcomingEventsTable from '../../../Components/UpcomingEventsTable'
import DepartmentPieChart from '../../../Components/DepartmentPieChart'

// Accommodation Dashboard specific data
import calendarFill from '../../../assets/calendarFill.svg'
import hourglassFill from '../../../assets/hourglassFill.svg'
import tick from '../../../assets/tick.svg'
import circleTick from '../../../assets/circle-tick.svg'

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
        lable: 'Completed Stays',
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

const upcomingEvents = [
    {
        eventName: 'National Conference 2026',
        eventType: 'Seminar',
        eventDate: '15-03-2026',
        department: 'CSE',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'National Conference 2026',
        eventType: 'Seminar',
        eventDate: '15-03-2026',
        department: 'CSE',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Faculty Meet',
        eventType: 'Meeting',
        eventDate: '18-03-2026',
        department: 'AIML',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Faculty Meet',
        eventType: 'Meeting',
        eventDate: '18-03-2026',
        department: 'AIML',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Workshop on IoT',
        eventType: 'Workshop',
        eventDate: '22-03-2026',
        department: 'EEE',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Workshop on IoT',
        eventType: 'Workshop',
        eventDate: '22-03-2026',
        department: 'EEE',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'International Symposium',
        eventType: 'Seminar',
        eventDate: '28-03-2026',
        department: 'IT',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'International Symposium',
        eventType: 'Seminar',
        eventDate: '28-03-2026',
        department: 'IT',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Alumni Meet',
        eventType: 'Event',
        eventDate: '05-04-2026',
        department: 'ME',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Alumni Meet',
        eventType: 'Event',
        eventDate: '05-04-2026',
        department: 'ME',
        acknowledgeStatus: 'Pending Acknowledge',
    },
]

const departmentData = [
    { name: 'CSE', value: 25, color: '#74b9ff' },
    { name: 'AIML', value: 55, color: '#159283' },
    { name: 'EEE', value: 12, color: '#68df85' },
    { name: 'VLSI', value: 8, color: '#4169e1' },
]

const AccommodationDashboard = () => {
    return (
        <>
            <section className='bg-[#0b1326] poppins h-screen'>
                {/* header  */}
                <AccommodationHeader />

                {/* main-container  */}
                <div className='main-body-container  px-6 '>
                    {/* heading */}
                    <div className="heading mt-2">
                        <h1 className='text-white text-lg font-medium'>Accommodation Dashboard Overview</h1>
                        <h1 className='text-[#FFFFFF80] text-sm'>Lorem Ipsumis simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</h1>
                    </div>

                    {/* stat cards  */}
                    <StatCard data={statCardData} />

                    {/* table and charts   */}
                    <div className="main-container mt-4 h-[calc(100vh-270px)] w-full flex gap-3">
                        {/* table  */}
                        <UpcomingEventsTable 
                            events={upcomingEvents} 
                            viewAllLink="/dashboard-accommodation/requests"
                        />
                        {/* charts  */}
                        <DepartmentPieChart 
                            data={departmentData} 
                        />
                    </div>

                </div>
                
            </section>
        </>
    )
}

export default AccommodationDashboard