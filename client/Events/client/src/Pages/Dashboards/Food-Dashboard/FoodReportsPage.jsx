import React from 'react'
import RequesterReportsPage from '../../../Components/RequesterReportsPage'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'

const foodReportRows = Array.from({ length: 12 }, (_, index) => ({
    eventName: index % 2 === 0 ? 'Annual Tech Fest 2026' : 'Cultural Night',
    department: index % 2 === 0 ? 'CSE' : 'ECE',
    requesterName: index % 2 === 0 ? 'Dr. Sarah Jenkins' : 'Dr. Meera Nair',
    requesterPhone: index % 2 === 0 ? '+91 98765 43210' : '+91 98765 56780',
    requiredDate: '20-03-2026',
    status: [3, 7, 11].includes(index) ? 'Not Completed' : 'Completed',
}))

const FoodReportsPage = () => (
    <RequesterReportsPage
        Header={<DashboardHeader basePath="/dashboard-food" />}
        rows={foodReportRows}
        title="Food Reports"
        downloadPrefix="food"
    />
)

export default FoodReportsPage
