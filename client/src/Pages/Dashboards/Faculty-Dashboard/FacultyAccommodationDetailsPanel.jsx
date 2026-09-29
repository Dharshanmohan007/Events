import React, { useState } from 'react'
import { CalendarDays, Clock3, FileText, Phone, User } from 'lucide-react'
import EventDataHeader from '../../Dashboards/EventHeaderData'


const displayValue = (value) => (value === null || value === undefined || value === '' ? '-' : String(value))

const formatDateTime = (value, options) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : new Intl.DateTimeFormat('en-GB', options).format(date)
}

const IconInfoCell = ({ icon, label, value, className = '' }) => {
  const IconComponent = icon
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <IconComponent size={16} className="mt-0.5 shrink-0 text-[#C9B6FF]" />
      <div>
        <p className="text-[10px] font-semibold uppercase text-[#CBC3D7]/45">{label}</p>
        <p className="mt-1 text-sm font-semibold text-white">{displayValue(value)}</p>
      </div>
    </div>
  )
}

const SplitInfoRow = ({ items }) => (
  <div className="grid grid-cols-2 rounded-lg border border-[#374155]/70 bg-[#242B3D] px-4 py-5">
    {items.map(([label, value], index) => (
      <div key={label} className={`flex items-center justify-between gap-5 px-2 text-sm ${index === 0 ? 'border-r border-[#6b7280]/50 pr-9' : 'pl-5'}`}>
        <span className="text-[#CBC3D7]/75">{label}</span>
        <span className="font-semibold text-white">{displayValue(value)}</span>
      </div>
    ))}
  </div>
)

const GuestRow = ({ name, gender, phone }) => (
  <div className="flex items-center justify-between rounded-md bg-[#2A3143] px-4 py-4">
    <p className="text-sm font-semibold text-white">{displayValue(name)}</p>
    <div className="flex items-center gap-6 text-xs text-[#CBC3D7]/65">
      <span className="flex items-center gap-2">
        <User size={15} className="text-[#C9B6FF]" />
        {displayValue(gender)}
      </span>
      <span className="flex items-center gap-2">
        <Phone size={15} className="text-[#C9B6FF]" />
        {displayValue(phone)}
      </span>
    </div>
  </div>
)

const AccommodationDayDetails = ({ accommodation }) => {
  const guests = accommodation.guests || []
  const roomSelections = accommodation.roomSelections || []
  const dineInCounts = accommodation.dineInCounts || []

  const stayDates = [
    {
      icon: CalendarDays,
      label: 'Check-in Date',
      value: formatDateTime(accommodation.checkInDateTime, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    },
    {
      icon: Clock3,
      label: 'Check-in Time',
      value: formatDateTime(accommodation.checkInDateTime, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    },
    {
      icon: CalendarDays,
      label: 'Check-out Date',
      value: formatDateTime(accommodation.checkOutDateTime, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    },
    {
      icon: Clock3,
      label: 'Check-out Time',
      value: formatDateTime(accommodation.checkOutDateTime, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    },
  ]

  const dineInRows = []

  for (let i = 0; i < dineInCounts.length; i += 2) {
    dineInRows.push(
      dineInCounts.slice(i, i + 2).map((item) => [
        `No. of Guest In ${item.type} Dine-in`,
        displayValue(item.count),
      ])
    )
  }

  return (
    <div className="space-y-5">

      {/* Check-in / Check-out Details */}
      <div className="grid grid-cols-4 rounded-md border border-[#374155]/60 bg-[#242B3D] py-4">
        {stayDates.map((item, index) => (
          <IconInfoCell
            key={item.label}
            {...item}
            className={`px-4 ${
              index !== stayDates.length - 1
                ? 'border-r border-[#6b7280]/50'
                : ''
            }`}
          />
        ))}
      </div>

      {/* Guests */}
      {guests.map((guest, index) => (
        <GuestRow
          key={`${guest.name}-${index}`}
          name={guest.name}
          gender={guest.gender}
          phone={guest.mobile}
        />
      ))}

      {/* Room Selections */}
      {roomSelections.length > 0 && (
        <section className="rounded-lg border border-[#465168] bg-[#232A3B]">
          
          <div className="border-b border-[#465168] px-5 py-4">
            <h3 className="text-base font-medium text-[#E6E2F0]">
              Room Details
            </h3>
          </div>

          <div className="divide-y divide-[#465168]">
            {roomSelections.map((room, index) => (
              <div
                key={`${room.roomId}-${index}`}
                className="grid grid-cols-3"
              >
                <div className="border-r border-[#465168] px-5 py-4">
                  <p className="mb-1 text-xs text-gray-400">
                    Venue
                  </p>

                  <p className="text-sm font-medium text-[#E6E2F0]">
                    {displayValue(room.venue)}
                  </p>
                </div>

                <div className="border-r border-[#465168] px-5 py-4">
                  <p className="mb-1 text-xs text-gray-400">
                    Room Number
                  </p>

                  <p className="text-sm font-medium text-[#E6E2F0]">
                    {displayValue(room.roomNumber)}
                  </p>
                </div>

                <div className="px-5 py-4">
                  <p className="mb-1 text-xs text-gray-400">
                    Number of Occupants
                  </p>

                  <p className="text-sm font-medium text-[#E6E2F0]">
                    {displayValue(room.occupantCount)}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </section>
      )}

      {/* Dine-in Details */}
      {dineInRows.map((row, i) => (
        <SplitInfoRow key={i} items={row} />
      ))}

      {/* Special Requirements */}
      {accommodation.specialRequirements ? (
        <section className="rounded-lg border border-[#465168] bg-[#232A3B] p-5">
          <div className="mb-4 flex items-center gap-2 text-base font-medium text-[#E6E2F0]">
            <FileText size={16} />
            Special Requirement
          </div>

          <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
            {displayValue(accommodation.specialRequirements)}
          </p>
        </section>
      ) : null}

    </div>
  )
}

const FacultyAccommodationDetailsPanel = ({ accommodationDetails, eventData, eventSchedule = [] }) => {
  const [activeDay, setActiveDay] = useState(0)
  const accommodations = accommodationDetails?.accommodations || []
  if (!accommodationDetails) return <p className="py-10 text-center text-sm text-[#CBC3D7]/65">No accommodation details are available.</p>
  const dayCount = Math.max(eventSchedule.length, accommodations.length, 1)
  const selectedDay = Math.min(activeDay, dayCount - 1)
  const dayAccommodation = accommodations[selectedDay]

  return (
    <div className="space-y-5">
      <EventDataHeader data={eventData?.requestDetails}/>
      {dayCount > 1 && (
        <nav className="flex border-b border-[#374155]" aria-label="Accommodation event days">
          {Array.from({ length: dayCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`border-b-2 px-5 py-2 text-[10px] font-medium transition ${
                selectedDay === index
                  ? 'border-[#8B3DFF] text-[#9F68FF]'
                  : 'border-transparent text-[#CBC3D7]/75 hover:text-white'
              }`}
            >
              Day {index + 1}
            </button>
          ))}
        </nav>
      )}

      {dayAccommodation ? (
        <div className="rounded-lg border border-[#374155] bg-[#1B2334] p-4">
          <AccommodationDayDetails accommodation={dayAccommodation} />
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-[#CBC3D7]/65">No accommodation details were submitted for Day {selectedDay + 1}.</p>
      )}
    </div>
  )
}

export default FacultyAccommodationDetailsPanel
