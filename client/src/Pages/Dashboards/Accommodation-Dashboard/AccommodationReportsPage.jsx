import React from 'react'
import RequesterReportsPage from '../../../Components/RequesterReportsPage'
import AccommodationHeader from './AccommodationHeader'

const accommodationReportRows = Array.from({ length: 12 }, (_, index) => ({
    eventName: index % 2 === 0 ? 'National Conference 2026' : 'Faculty Meet',
    department: index % 2 === 0 ? 'CSE' : 'AIML',
    requesterName: index % 2 === 0 ? 'Dr. Sarah Jenkins' : 'Dr. Arun Kumar',
    requesterPhone: index % 2 === 0 ? '+91 98765 43210' : '+91 98765 12340',
    requiredDate: '18-03-2026',
    status: [2, 6, 10].includes(index) ? 'Not Completed' : 'Completed',
}))

const AccommodationReportsPage = () => (
    <RequesterReportsPage
        Header={<AccommodationHeader />}
        rows={accommodationReportRows}
        title="Accommodation Reports"
        downloadPrefix="accommodation"
    />
)

export default AccommodationReportsPage
