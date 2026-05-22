import React, { useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { useParams } from 'react-router-dom'
import FacultyDahsboardHeader from './FacultyDahsboardHeader'
import FacultyAccommodationDetailsPanel from './FacultyAccommodationDetailsPanel'
import FacultyAudioDetailsPanel from './FacultyAudioDetailsPanel'
import FacultyEventDetailsSidePanel from './FacultyEventDetailsSidePanel'
import FacultyEventRequisitionDetailsPanel from './FacultyEventRequisitionDetailsPanel'
import FacultyFoodRefreshmentDetailsPanel from './FacultyFoodRefreshmentDetailsPanel'
import FacultyIctcsDetailsPanel from './FacultyIctcsDetailsPanel'
import FacultyMediaDetailsPanel from './FacultyMediaDetailsPanel'
import FacultyPurchaseDetailsPanel from './FacultyPurchaseDetailsPanel'
import FacultyStaticDetailsPanel from './FacultyStaticDetailsPanel'
import FacultyTransportationDetailsPanel from './FacultyTransportationDetailsPanel'
import FacultyVenueDetailsPanel from './FacultyVenueDetailsPanel'

const detailTabs = [
  { name: 'Event Requisition Details', color: '#8B5CF6', status: 'Acknowledged' },
  { name: 'Venue Details', color: '#F20768', status: 'Pending' },
  { name: 'ICTCS Details', color: '#48E0CF', status: 'Acknowledged' },
  { name: 'Audio Details', color: '#8B3DFF', status: 'Completed' },
  { name: 'Transportation Details', color: '#8B3DFF', status: 'Pending' },
  { name: 'Food Details', color: '#48E0CF', status: 'Acknowledged' },
  { name: 'Accommodation Details', color: '#48E0CF', status: 'Acknowledged' },
  { name: 'Purchase Details', color: '#F20768', status: 'Pending' },
  { name: 'Media Details', color: '#F20768', status: 'Completed' },
]

const eventSummary = [
  ['Event Name', 'Nexus Annual Tech Summit 2024'],
  ['Event Date', '12/06/2026'],
  ['Event Start Time', '09:30 AM'],
  ['Event End Time', '12:30 PM'],
]

const eventDetails = [
  ['Finance Required', 'Yes'],
  ['Is It approved in budget', 'Yes'],
  ['Organizing Department', 'Placement'],
  ['No of Days', '5 Days'],
  ['Involved IIC', 'No'],
  ['Type of the Event', 'FDP'],
  ['Professional Society Involved', 'FDP'],
  ['Target Audience', 'Student'],
]

const venueDetails = [
  ['Total Number of Participants', '1000 Members'],
  ['Venue Required', 'Main Board Room / Vista Hall / Lab'],
  ['Number of Seating Capacity Required', '120'],
  ['Chair', '100'],
  ['NotePad', '120'],
  ['Water Bottle', '100'],
  ['Snacks', '100'],
]

const ictsDetails = [
  ['Desktop', 'Yes'],
  ['Internet Facility', 'LAN'],
  ['Expected Internet Users', '20'],
  ['Total Number of Guest WIFI Count', '20'],
  ['Chief Guest AV', 'Required'],
  ['Stage LED', 'Required'],
  ['Pointer', 'Required'],
  ['WebCam', 'Required'],
]

const audioDetails = [
  ['Hand Mic', '2'],
  ['Collar Mic', '1'],
  ['Speaker Setup', 'Main Auditorium'],
  ['Audio Console', 'Required'],
]

const organizerDetails = [
  ['Organizer Name', 'Surya Chandran'],
  ['Organizer Email', 'user@gmail.com'],
  ['Organizer Phone Number', '1234567890'],
  ['Organizer Department', 'CSE'],
]

const specialRequirement =
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.'

const getStatusClassName = (status) => {
  if (status === 'Completed') return 'bg-[#4A2BB7]/35 text-[#A78BFA]'
  if (status === 'Pending') return 'bg-[#5D1438]/50 text-[#FF4F91]'
  return 'bg-[#0e5149]/55 text-[#20D18C]'
}

const FacultyEventsDetailViewPage = () => {
  const { eventId } = useParams()
  const [activeTab, setActiveTab] = useState(detailTabs[0].name)
  const activeTabConfig = detailTabs.find((tab) => tab.name === activeTab)

  const openFeedbackPage = () => {
    window.open(`/dashboard-faculty/feedback/${eventId}`, '_blank', 'noopener,noreferrer')
  }

  const renderActivePanel = () => {
    if (activeTab === 'Event Requisition Details') {
      return (
        <FacultyEventRequisitionDetailsPanel
          eventSummary={eventSummary}
          eventDetails={eventDetails}
          organizerDetails={organizerDetails}
        />
      )
    }

    if (activeTab === 'Venue Details') {
      return (
        <FacultyVenueDetailsPanel
          venueDetails={venueDetails}
          specialRequirement={specialRequirement}
        />
      )
    }

    if (activeTab === 'ICTCS Details') {
      return (
        <FacultyIctcsDetailsPanel
          ictsDetails={ictsDetails}
          specialRequirement={specialRequirement}
        />
      )
    }

    if (activeTab === 'Audio Details') {
      return (
        <FacultyAudioDetailsPanel
          audioDetails={audioDetails}
          specialRequirement={specialRequirement}
        />
      )
    }

    if (activeTab === 'Transportation Details') {
      return <FacultyTransportationDetailsPanel />
    }

    if (activeTab === 'Food Details') {
      return <FacultyFoodRefreshmentDetailsPanel />
    }

    if (activeTab === 'Accommodation Details') {
      return <FacultyAccommodationDetailsPanel />
    }

    if (activeTab === 'Purchase Details') {
      return <FacultyPurchaseDetailsPanel />
    }

    if (activeTab === 'Media Details') {
      return <FacultyMediaDetailsPanel />
    }

    return <FacultyStaticDetailsPanel activeTab={activeTab} />
  }

  return (
    <>


      <FacultyDahsboardHeader />
      <section className="bg-[#0b1326] px-7 h-[93vh] pt-2  text-white poppins">
        <header className="flex  items-center justify-between gap-5 mt-4 ">
          <div className=''>
            <div className="flex items-center gap-2">
              <h1 className="text-md font-medium text-[#CBC3D7]/50">ICTCS Request List</h1>
              <ChevronRight size={16} className="text-white" />
              <h2 className="text-md font-medium text-[#D0BCFF]">Nexus Annual Tech Summit 2024</h2>
              <span className="ml-3 rounded-full bg-[#063f43] px-5 py-1.5 text-xs font-medium text-[#20D18C]">
                Placement
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={openFeedbackPage}
            className="flex items-center gap-2 rounded-md cursor-pointer hover:bg-linear-to-l hover:from-[#0a755f] bg-linear-to-r from-[#078B72] to-[#035546] px-6 py-2 font- text-white transition-colors hover:bg-[#0a755f]"
          >
            <Check size={18} />
            Completed
          </button>
        </header>

        <section className="mt-3">
          <div className="mb-2 flex items-center justify-between">
            {/* <h2 className="text-lg font-medium">Overall Summary</h2> */}
            <div className="flex flex-wrap items-center gap-6 font-medium text-[10px] text-[#CBC3D7]/65">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#25A987]" />ACKNOWLEDGED (5)</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#B32058]" />PENDING (2)</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#6D3BD8]" />COMPLETED (3)</span>
            </div>
          </div>
          {/* <div className="flex h-2 overflow-hidden rounded-full">
            <div className="w-[49%] bg-[#229180]" />
            <div className="w-[19%] bg-[#6D3BD8]" />
            <div className="w-[32%] bg-[#B32058]" />
          </div> */}
        </section>

        <section className="mt-3 flex overflow-hidden gap-4">
          <FacultyEventDetailsSidePanel
            tabs={detailTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <main className="flex-1 overflow-auto rounded-lg border  border-[#27334c] max-h-[calc(100vh-170px)] overflow-auto bg-[#151d31] p-5 table-custom-scrollbar">
            <div className="flex items-start justify-between gap-4 ">
              <div>
                <h2 className="text-lg font-medium text-[#8B3DFF]">{activeTab}</h2>
                <p className="mt-2 text-xs leading-6 text-[#CBC3D7]/55">
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                </p>
              </div>
              <span className={`rounded-full px-5 py-2 text-sm font-medium ${getStatusClassName(activeTabConfig.status)}`}>
                {activeTabConfig.status}
              </span>
            </div>

            <div className="mt-8">{renderActivePanel()}</div>
          </main>
        </section>
      </section>
    </>
  )
}

export default FacultyEventsDetailViewPage
