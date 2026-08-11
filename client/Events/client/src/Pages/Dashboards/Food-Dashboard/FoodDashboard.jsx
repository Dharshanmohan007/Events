import React from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import FoodStatcard from './FoodStatcard'
import FoodRequestTable from './FoodRequestTable'
import FeedbackRatings from '../../../Components/FeedbackRatings'

const foodRequests = [
    {
        eventName: 'Annual Tech Fest 2026',
        department: 'CSE',
        type: 'Lunch & Snacks',
        expectedCount: 150,
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Annual Tech Fest 2026',
        department: 'CSE',
        type: 'Breakfast',
        expectedCount: 80,
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Cultural Night',
        department: 'ECE',
        type: 'Dinner',
        expectedCount: 200,
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Cultural Night',
        department: 'ECE',
        type: 'Snacks',
        expectedCount: 100,
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Workshop on AI',
        department: 'AIML',
        type: 'Lunch',
        expectedCount: 60,
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Workshop on AI',
        department: 'AIML',
        type: 'Breakfast',
        expectedCount: 40,
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Sports Meet',
        department: 'ME',
        type: 'Lunch & Snacks',
        expectedCount: 250,
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Sports Meet',
        department: 'ME',
        type: 'Dinner',
        expectedCount: 180,
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Hackathon 2026',
        department: 'IT',
        type: '24/7 Catering',
        expectedCount: 120,
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Hackathon 2026',
        department: 'IT',
        type: 'Snacks',
        expectedCount: 80,
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Robotics Expo',
        department: 'EEE',
        type: 'Lunch',
        expectedCount: 90,
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Robotics Expo',
        department: 'EEE',
        type: 'Breakfast',
        expectedCount: 50,
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

const FoodDashboard = () => {
    return (
        <>
            <section className='bg-[#0b1326] poppins h-screen border overflow-auto table-custom-scrollbar'>
                {/* header  */}
                <div className='header-container sticky top-0'>
                    <DashboardHeader basePath="/dashboard-food" />
                </div>

                {/* main-container  */}
                <div className='main-body-container  px-6 '>
                    {/* heading */}
                    <div className="heading mt-2">
                        <h1 className='text-white text-lg font-medium'>Food & Catering Dashboard Overview</h1>
                        <h1 className='text-[#FFFFFF80] text-sm'>Lorem Ipsumis simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s</h1>
                    </div>

                    {/* stat cards  */}
                    <FoodStatcard />

                    {/* table and charts    */}
                    <div className="main-container mt-4 h-[calc(100vh-270px)] w-full [&>section]:w-full">
                        <FoodRequestTable requests={foodRequests} viewAllLink="/food-requests" />
                    </div>

                    <div className="mt-8 grid grid-cols-12 gap-3 pb-5">
                        <FeedbackRatings feedbackLink="/dashboard-food/feedback" />
                        <DepartmentRequestChart data={departmentData} title="Catering Request By Department" />
                    </div>
                </div>

            </section>
        </>
    )
}

export default FoodDashboard
