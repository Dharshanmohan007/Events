import React from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import MediaStatcard from './MediaStatcard'
import MediaRequestTable from './MediaRequestTable'
import MediaDepartmentPieChart from './MediaDepartmentPieChart'

const mediaRequests = [
    {
        eventName: 'Annual Tech Fest 2026',
        department: 'CSE',
        type: 'Photography',
        dueDate: '20-03-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Annual Tech Fest 2026',
        department: 'CSE',
        type: 'Videography',
        dueDate: '20-03-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Cultural Night',
        department: 'ECE',
        type: 'Live Streaming',
        dueDate: '25-03-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Cultural Night',
        department: 'ECE',
        type: 'Photography',
        dueDate: '25-03-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Workshop on AI',
        department: 'AIML',
        type: 'Graphic Design',
        dueDate: '30-03-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Workshop on AI',
        department: 'AIML',
        type: 'Videography',
        dueDate: '30-03-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Sports Meet',
        department: 'ME',
        type: 'Photography',
        dueDate: '05-04-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Sports Meet',
        department: 'ME',
        type: 'Live Streaming',
        dueDate: '05-04-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Hackathon 2026',
        department: 'IT',
        type: 'Graphic Design',
        dueDate: '10-04-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Hackathon 2026',
        department: 'IT',
        type: 'Photography',
        dueDate: '10-04-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Robotics Expo',
        department: 'EEE',
        type: 'Videography',
        dueDate: '15-04-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Robotics Expo',
        department: 'EEE',
        type: 'Live Streaming',
        dueDate: '15-04-2026',
        acknowledgeStatus: 'Acknowledged',
    },
]

const departmentData = [
    { name: 'CSE', value: 25, color: '#74b9ff' },
    { name: 'AIML', value: 55, color: '#159283' },
    { name: 'EEE', value: 12, color: '#68df85' },
    { name: 'VLSI', value: 8, color: '#4169e1' },
    { name: 'ECE', value: 15, color: '#ff7675' },
    { name: 'ME', value: 20, color: '#fdcb6e' },
    { name: 'IT', value: 18, color: '#00b894' },
]

const MediaDashboard = () => {
    return (
        <>
            <section className='bg-[#0b1326] poppins h-screen border overflow-auto table-custom-scrollbar'>
                {/* header  */}
                <div className='header-container sticky top-0'>
                    <DashboardHeader basePath="/dashboard-media" />
                </div>

                {/* main-container  */}
                <div className='main-body-container  px-6 '>
                    {/* heading */}
                    <div className="heading mt-2">
                        <h1 className='text-white text-lg font-medium'>Media Dashboard Overview</h1>
                        <h1 className='text-[#FFFFFF80] text-sm'>Lorem Ipsumis simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</h1>
                    </div>

                    {/* stat cards  */}
                    <MediaStatcard />

                    {/* table and charts    */}
                    <div className="main-container mt-4 h-[calc(100vh-270px)] w-full flex gap-3">
                        {/* table  */}
                        <MediaRequestTable requests={mediaRequests} viewAllLink="/media-requests" />

                        {/* charts  */}
                        <MediaDepartmentPieChart
                            data={departmentData}
                        />
                    </div>
                </div>

            </section>
        </>
    )
}

export default MediaDashboard