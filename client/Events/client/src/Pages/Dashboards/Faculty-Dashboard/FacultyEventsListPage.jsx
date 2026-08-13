import React, { useState } from 'react'
import { Calendar, ExternalLink, ListFilter, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import FacultyDahsboardHeader from './FacultyDahsboardHeader'

const eventsData = [
  { id: 1, eventName: 'Welcome Freshers', eventType: 'Seminar', eventVenue: 'Main Board Room', eventDate: '15-03-2026', approvedStatus: 'Approved', acknowledgementStatus: 'Acknowledged' },
  { id: 2, eventName: 'Welcome Freshers', eventType: 'Seminar', eventVenue: 'Main Board Room', eventDate: '15-03-2026', approvedStatus: 'Pending Approval', acknowledgementStatus: 'Pending Approval' },
  { id: 3, eventName: 'Welcome Freshers', eventType: 'Seminar', eventVenue: 'Main Board Room', eventDate: '15-03-2026', approvedStatus: 'Approved', acknowledgementStatus: 'Acknowledged' },
  { id: 4, eventName: 'Welcome Freshers', eventType: 'Seminar', eventVenue: 'Main Board Room', eventDate: '15-03-2026', approvedStatus: 'Pending Approval', acknowledgementStatus: 'Pending Approval' },
  { id: 5, eventName: 'Welcome Freshers', eventType: 'Seminar', eventVenue: 'Main Board Room', eventDate: '15-03-2026', approvedStatus: 'Approved', acknowledgementStatus: 'Acknowledged' },
  { id: 6, eventName: 'Welcome Freshers', eventType: 'Seminar', eventVenue: 'Main Board Room', eventDate: '15-03-2026', approvedStatus: 'Approved', acknowledgementStatus: 'Acknowledged' },
  { id: 7, eventName: 'Welcome Freshers', eventType: 'Seminar', eventVenue: 'Main Board Room', eventDate: '15-03-2026', approvedStatus: 'Pending Approval', acknowledgementStatus: 'Pending Approval' },
  { id: 8, eventName: 'Welcome Freshers', eventType: 'Seminar', eventVenue: 'Main Board Room', eventDate: '15-03-2026', approvedStatus: 'Approved', acknowledgementStatus: 'Acknowledged' },
  { id: 9, eventName: 'Welcome Freshers', eventType: 'Seminar', eventVenue: 'Main Board Room', eventDate: '15-03-2026', approvedStatus: 'Pending Approval', acknowledgementStatus: 'Pending Approval' },
]

const columns = [
  'EVENT NAME',
  'EVENT TYPE',
  'EVENT VENUE',
  'EVENT DATE',
  'APPROVED STATUS',
  'STATUS',
  'ACTION',
]

const StatusBadge = ({ status }) => {
  const isApproved = status === 'Approved' || status === 'Acknowledged'

  return (
    <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${isApproved ? 'text-[#20D18C]' : 'text-[#F20768]'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isApproved ? 'bg-[#20D18C]' : 'bg-[#F20768]'}`} />
      {status}
    </span>
  )
}

const FacultyEventsListPage = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = eventsData.filter((event) => {
    const query = searchQuery.toLowerCase()

    return (
      event.eventName.toLowerCase().includes(query) ||
      event.eventType.toLowerCase().includes(query) ||
      event.eventVenue.toLowerCase().includes(query)
    )
  })

  return (
    <section className="min-h-screen bg-[#0b1326] poppins">
      <FacultyDahsboardHeader />

      <main className="px-6 pb-8">
        <div className="mt-3">
          <h1 className="text-lg font-medium text-white">Request List Overview</h1>
          <p className="mt-1 text-sm text-[#FFFFFF80]">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
          </p>
        </div>

        <section className="mt-4 rounded-lg border border-gray-800 bg-[#171F31] py-4">
          <div className="mb-4 flex flex-wrap items-center justify-end gap-3 px-6">
            <div className="flex items-center gap-2 rounded-full border border-gray-700 bg-[#232A3C] px-4 py-2">
              <Search size={14} className="text-gray-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                type="text"
                placeholder="Search events, venues"
                className="w-[230px] bg-transparent text-xs text-gray-300 outline-none placeholder:text-gray-500"
              />
            </div>

            <button className="flex items-center gap-2 rounded-lg border border-gray-700 bg-[#232A3C] px-3 py-2 text-xs text-gray-300">
              <ListFilter size={14} className="text-gray-400" />
              Seminar
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-700 bg-[#232A3C] px-3 py-2 text-xs text-gray-300">
              <ListFilter size={14} className="text-gray-400" />
              Acknowledged
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-gray-700 bg-[#232A3C] px-3 py-2 text-xs text-gray-300">
              <Calendar size={14} className="text-gray-400" />
              15/03/2026
            </button>
          </div>

          <div className="max-h-[calc(100vh-260px)] overflow-auto table-custom-scrollbar">
            <table className="w-full min-w-[950px]">
              <thead className="sticky top-0 bg-[#1C2335]">
                <tr className="border-b border-[#22253a]">
                  {columns.map((column) => (
                    <th key={column} className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-widest text-gray-500">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-[#1e2130] text-[#FFFFFF]/80 transition-colors hover:bg-[#1e2232] last:border-b-0">
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">{event.eventName}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">{event.eventType}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">{event.eventVenue}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-sm">{event.eventDate}</td>
                    <td className="whitespace-nowrap px-5 py-3.5"><StatusBadge status={event.approvedStatus} /></td>
                    <td className="whitespace-nowrap px-5 py-3.5"><StatusBadge status={event.acknowledgementStatus} /></td>
                    <td className="px-5 py-3.5 text-center">
                      <Link
                        to={`/dashboard-faculty/events/detailView/${event.id}`}
                        className="inline-flex text-gray-400 transition-colors hover:text-white"
                        title="Open event"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </section>
  )
}

export default FacultyEventsListPage
