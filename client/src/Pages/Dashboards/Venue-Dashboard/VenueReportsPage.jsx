import React from 'react'
import ServiceReportsPage from '../../../Components/ServiceReportsPage'
import VenueHeader from './VenueHeader'

const venueReportRows = Array.from({ length: 12 }, (_, index) => ({
    eventName: index % 2 === 0 ? 'National Conference 2026' : 'Faculty Meet',
    eventType: index % 2 === 0 ? 'Seminar' : 'Meeting',
    eventVenue: index % 3 === 0 ? 'Main Board Room' : 'Vista Hall',
    eventDate: '15-03-2026',
    status: [3, 5, 11].includes(index) ? 'Not Completed' : 'Completed',
}))

const VenueReportsPage = () => (
    <ServiceReportsPage
        Header={<VenueHeader />}
        rows={venueReportRows}
        title="Venue Reports"
        downloadPrefix="venue"
    />
)

export default VenueReportsPage
