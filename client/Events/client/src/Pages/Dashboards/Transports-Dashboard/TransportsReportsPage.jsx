import React from 'react'
import RequesterReportsPage from '../../../Components/RequesterReportsPage'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'

const transportReportRows = Array.from({ length: 12 }, (_, index) => ({
    eventName: 'Welcome Freshers',
    department: index % 2 === 0 ? 'CSE' : 'ECE',
    requesterName: index % 2 === 0 ? 'Dr. Sarah Jenkins' : 'Dr. Meera Nair',
    requesterPhone: index % 2 === 0 ? '+91 98765 43210' : '+91 98765 56780',
    requiredDate: '15-03-2026',
    status: [1, 4, 9].includes(index) ? 'Not Completed' : 'Completed',
}))

const TransportsReportsPage = () => (
    <RequesterReportsPage
        Header={<DashboardHeader basePath="/dashboard-transports" />}
        rows={transportReportRows}
        title="Transport Reports"
        downloadPrefix="transport"
    />
)

export default TransportsReportsPage
