import React from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import TransportStatcard from './TransportStatcard'
import TransportsRequestTable from './TransportsRequestTable'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import FeedbackRatings from '../../../Components/FeedbackRatings'
const transportRequests = [
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 10,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 4,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 10,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 4,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 10,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 4,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 10,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 4,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 10,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 4,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 10,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 4,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 10,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 4,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 10,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Welcome Freshers',
        department: 'CSE',
        members: 4,
        requiredDate: '15-03-2026',
        acknowledgeStatus: 'Acknowledged',
    },
]

const departmentData = [
    { name: 'CSE', value: 25, color: '#74b9ff' },
    { name: 'AIML', value: 55, color: '#159283' },
    { name: 'EEE', value: 12, color: '#68df85' },
    { name: 'VLSI', value: 8, color: '#4169e1' },
]

const TransportsDashboard = () => {
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
                        <TransportsRequestTable requests={transportRequests} viewAllLink="/transport-requests" />
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
