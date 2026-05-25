import React from 'react'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'
import DepartmentRequestChart from '../../../Components/DepartmentRequestChart'
import PurchaseStatcard from './PurchaseStatcard'
import PurchaseRequestTable from './PurchaseRequestTable'
import FeedbackRatings from '../../../Components/FeedbackRatings'

const purchaseRequests = [
    {
        eventName: 'Annual Tech Fest 2026',
        department: 'CSE',
        category: 'Electronics',
        estimatedCost: '₹50,000',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Annual Tech Fest 2026',
        department: 'CSE',
        category: 'Stationery',
        estimatedCost: '₹15,000',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Cultural Night',
        department: 'ECE',
        category: 'Electronics',
        estimatedCost: '₹75,000',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Cultural Night',
        department: 'ECE',
        category: 'Furniture',
        estimatedCost: '₹30,000',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Workshop on AI',
        department: 'AIML',
        category: 'Lab Equipment',
        estimatedCost: '₹1,20,000',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Workshop on AI',
        department: 'AIML',
        category: 'Electronics',
        estimatedCost: '₹45,000',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Sports Meet',
        department: 'ME',
        category: 'Furniture',
        estimatedCost: '₹60,000',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Sports Meet',
        department: 'ME',
        category: 'Stationery',
        estimatedCost: '₹10,000',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Hackathon 2026',
        department: 'IT',
        category: 'Electronics',
        estimatedCost: '₹85,000',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Hackathon 2026',
        department: 'IT',
        category: 'Lab Equipment',
        estimatedCost: '₹95,000',
        acknowledgeStatus: 'Acknowledged',
    },
    {
        eventName: 'Robotics Expo',
        department: 'EEE',
        category: 'Lab Equipment',
        estimatedCost: '₹1,50,000',
        acknowledgeStatus: 'Pending Acknowledge',
    },
    {
        eventName: 'Robotics Expo',
        department: 'EEE',
        category: 'Electronics',
        estimatedCost: '₹70,000',
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

const PurchaseDashboard = () => {
    return (
        <>
            <section className='bg-[#0b1326] poppins h-screen border overflow-auto table-custom-scrollbar'>
                {/* header  */}
                <div className='header-container sticky top-0'>
                    <DashboardHeader basePath="/dashboard-purchase" />
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
                        <PurchaseRequestTable requests={purchaseRequests} viewAllLink="/purchase-requests" />
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
