import React from 'react'
import ServiceReportsPage from '../../../Components/ServiceReportsPage'
import DashboardHeader from './DashboardHeader'

const ictcsReportRows = Array.from({ length: 12 }, (_, index) => ({
    eventName: 'Welcome Freshers',
    eventType: index % 2 === 0 ? 'Seminar' : 'Workshop',
    eventVenue: index % 3 === 0 ? 'Main Board Room' : 'Vista Hall',
    eventDate: '15-03-2026',
    status: [2, 7, 10].includes(index) ? 'Not Completed' : 'Completed',
}))

const Reports = () => {
    return (
        <ServiceReportsPage
            Header={<DashboardHeader />}
            rows={ictcsReportRows}
            title="ICTCS Reports"
            downloadPrefix="ictcs"
        />
    )
}

export default Reports
