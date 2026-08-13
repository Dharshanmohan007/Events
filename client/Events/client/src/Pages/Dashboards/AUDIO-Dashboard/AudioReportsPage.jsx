import React from 'react'
import ServiceReportsPage from '../../../Components/ServiceReportsPage'
import DashboardHeader from '../ICTC-Dashboard/DashboardHeader'

const audioReportRows = Array.from({ length: 12 }, (_, index) => ({
    eventName: index % 2 === 0 ? 'Audio Mixing Workshop' : 'Sound Design Masterclass',
    eventType: index % 2 === 0 ? 'Workshop' : 'Masterclass',
    eventVenue: index % 3 === 0 ? 'Studio Hall' : 'Vista Hall',
    eventDate: '20-03-2026',
    status: [1, 6, 9].includes(index) ? 'Not Completed' : 'Completed',
}))

const AudioReportsPage = () => (
    <ServiceReportsPage
        Header={<DashboardHeader basePath="/dashboard-audio" />}
        rows={audioReportRows}
        title="Audio Reports"
        downloadPrefix="audio"
    />
)

export default AudioReportsPage
