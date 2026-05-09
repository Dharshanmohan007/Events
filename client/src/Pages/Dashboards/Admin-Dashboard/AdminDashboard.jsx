import React from 'react'
import AdminDashboardHeader from './AdminDashboardHeader'
import AdminStatcard from './AdminStatcard'
import AdminUpcomingEventsTable from './AdminUpcomingEventsTable'
import AdminDepartmentPieChart from './AdminDepartmentPieChart'

// Admin Dashboard specific data
import calendarFill from '../../../assets/calendarFill.svg'
import hourglassFill from '../../../assets/hourglassFill.svg'
import tick from '../../../assets/tick.svg'
import circleTick from '../../../assets/circle-tick.svg'
import AdminBarChart from './AdminBarChart'
const statCardData = [
    {
        title: "Event Request",
        stats: [
            {
                label: "Total Event Request",
                value: 50,
                icon: calendarFill,
                bgColor: "from-[#2e2754] via-[#3d216f] to-[#5f1b89]",
                borderColor: "border-l-[#7357ff]",
                iconBg: "bg-[#a98cff]",
            },
            {
                label: "Approved Events",
                value: 50,
                icon: tick,
                bgColor: "from-[#163e46] via-[#0f5e4a] to-[#07864d]",
                borderColor: "border-l-[#20d18c]",
                iconBg: "bg-[#36d99b]",
            },
            {
                label: "Completed Events",
                value: 50,
                icon: circleTick,
                bgColor: "from-[#252d5c] via-[#25258a] to-[#2116a5]",
                borderColor: "border-l-[#7181ff]",
                iconBg: "bg-[#8292ff]",
            },
            {
                label: "Pending Approval Events",
                value: 50,
                icon: hourglassFill,
                bgColor: "from-[#342238] via-[#652049] to-[#9b1b59]",
                borderColor: "border-l-[#eb3f99]",
                iconBg: "bg-[#ef68ad]",
            },
        ],
    },
    {
        title: "Individual Request",
        stats: [
            {
                label: "Total Request",
                value: 50,
                icon: calendarFill,
                bgColor: "from-[#2e2754] via-[#3d216f] to-[#5f1b89]",
                borderColor: "border-l-[#7357ff]",
                iconBg: "bg-[#a98cff]",
            },
            {
                label: "Approved Request",
                value: 50,
                icon: tick,
                bgColor: "from-[#163e46] via-[#0f5e4a] to-[#07864d]",
                borderColor: "border-l-[#20d18c]",
                iconBg: "bg-[#36d99b]",
            },
            {
                label: "Completed",
                value: 50,
                icon: circleTick,
                bgColor: "from-[#252d5c] via-[#25258a] to-[#2116a5]",
                borderColor: "border-l-[#7181ff]",
                iconBg: "bg-[#8292ff]",
            },
            {
                label: "Pending Approval Request",
                value: 50,
                icon: hourglassFill,
                bgColor: "from-[#342238] via-[#652049] to-[#9b1b59]",
                borderColor: "border-l-[#eb3f99]",
                iconBg: "bg-[#ef68ad]",
            },
        ],
    },
];

const upcomingEvents = [
    {
        eventName: 'Tech Conference 2026',
        eventType: 'Conference',
        eventDate: '15-03-2026',
        department: 'IT',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Workshop on AI Ethics',
        eventType: 'Workshop',
        eventDate: '18-03-2026',
        department: 'Research',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Annual Sports Meet',
        eventType: 'Sports',
        eventDate: '22-03-2026',
        department: 'Sports',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Cultural Fest',
        eventType: 'Festival',
        eventDate: '28-03-2026',
        department: 'Cultural',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Science Exhibition',
        eventType: 'Exhibition',
        eventDate: '05-04-2026',
        department: 'Science',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Alumni Meet',
        eventType: 'Meeting',
        eventDate: '10-04-2026',
        department: 'Alumni Relations',
        acknowledgeStatus: 'Acknowledged',
    },
]

const departmentData = [
    { name: 'IT', value: 30, color: '#74b9ff' },
    { name: 'Research', value: 25, color: '#159283' },
    { name: 'Sports', value: 20, color: '#68df85' },
    { name: 'Cultural', value: 15, color: '#4169e1' },
    { name: 'Science', value: 10, color: '#a29bfe' },
]

const AdminDashboard = () => {
    return (
        <>
            <section className='bg-[#0b1326] poppins '>
                {/* header  */}
                <AdminDashboardHeader basePath="/dashboard-admin" />

                {/* main-container  */}
                <div className='main-body-container  px-6 '>
                    {/* heading */}
                    <div className="heading mt-2">
                        <h1 className='text-white text-lg font-medium'>Admin Dashboard Overview</h1>
                        <h1 className='text-[#FFFFFF80] text-sm'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</h1>
                    </div>

                    {/* stat cards  */}
                    <AdminStatcard data={statCardData} />

                    {/* table and charts   */}
                    <div className="main-container mt-4 h-[calc(100vh-270px)] w-full flex gap-3">
                        {/* table  */}
                        <AdminUpcomingEventsTable
                            events={upcomingEvents}
                            viewAllLink="/dashboard-admin/events"
                            title="Upcoming Events"
                        />
                        {/* charts  */}
                        <AdminDepartmentPieChart
                            data={departmentData}
                            title="Events By Department"
                        />
                    </div>

                    {/* bar chart  */}
                    <AdminBarChart />
                </div>
            </section>
        </>
    )
}

export default AdminDashboard