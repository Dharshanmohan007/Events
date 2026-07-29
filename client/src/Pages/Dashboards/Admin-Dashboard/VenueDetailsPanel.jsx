import React, { useState } from 'react'
import { FileText } from 'lucide-react'

const displayValue = (value) => (value === null || value === undefined || value === '' ? '-' : String(value))
const EMPTY_VENUES = []

const SplitInfoRow = ({ items }) => (
  <div className="grid grid-cols-2 rounded-lg border border-[#374155] bg-[#232A3B] px-5 py-5">
    {items.map(([label, value], index) => (
      <div key={label} className={`flex items-center justify-between gap-4 text-sm ${index === 0 ? 'border-r border-[#6b7280]/50 pr-7' : 'pl-7'}`}>
        <span className="text-[#CBC3D7]/75">{label}</span>
        <span className="text-right font-medium text-white">{displayValue(value)}</span>
      </div>
    ))}
  </div>
)

const RequirementColumn = ({ items }) => (
  <div>
    {items.map((requirement, index) => (
      <div key={`${requirement.type}-${index}`} className="flex items-center justify-between border-b border-[#30384d]/60 py-3 text-sm last:border-b-0">
        <span className="text-[#CBC3D7]/75">{requirement.type || 'Requirement'}</span>
        <span className="font-medium text-[#E6E2F0]">{displayValue(requirement.quantity)}</span>
      </div>
    ))}
  </div>
)

const HallRequirements = ({ requirements }) => {
  if (!requirements?.length) return null
  const splitAt = Math.ceil(requirements.length / 2)
  return (
    <section className="rounded-lg border border-[#374155] bg-[#232A3B] p-5">
      <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#E6E2F0]"><FileText size={17} />Hall Requirements</div>
      <div className="grid grid-cols-2 gap-7">
        <div className="border-r border-[#6b7280]/50 pr-7"><RequirementColumn items={requirements.slice(0, splitAt)} /></div>
        <RequirementColumn items={requirements.slice(splitAt)} />
      </div>
    </section>
  )
}

const VenueBlock = ({ venue }) => (
  <section className="rounded-lg border border-[#374155] bg-[#232A3C] p-5">
    <h3 className="text-lg font-medium text-[#8F5BFF]">{displayValue(venue.venueName)}</h3>
    <div className="mt-5 space-y-5">
      <SplitInfoRow items={[
        ['Number of Participants', venue.numberOfParticipants],
        ['Number of Seating Capacity Required', venue.seatingCapacity],
      ]} />
      <HallRequirements requirements={venue.hallRequirements} />
      {venue.specialRequirements ? (
        <section className="rounded-lg border border-[#374155] bg-[#232A3B] p-5">
          <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#E6E2F0]"><FileText size={17} />Special Requirement</div>
          <p className="text-sm font-medium leading-7 text-[#E6E2F0]">{venue.specialRequirements}</p>
        </section>
      ) : null}
    </div>
  </section>
)

const VenueDetailsPanel = ({ venueDetails, eventSchedule = [] }) => {
  const [activeDay, setActiveDay] = useState(0)
  const venues = venueDetails?.venues ?? EMPTY_VENUES
  const dayCount = Math.max(eventSchedule.length, ...venues.map((venue) => Number(venue.dayIndex) + 1), 1)
  const selectedDay = Math.min(activeDay, dayCount - 1)
  const dayVenues = venues.filter((venue) => Number(venue.dayIndex) === selectedDay)
  const participantCount = dayVenues.reduce((total, venue) => total + (Number(venue.numberOfParticipants) || 0), 0)

  if (!venueDetails) return <p className="py-10 text-center text-sm text-[#CBC3D7]/65">No venue details are available.</p>

  return (
    <div className="space-y-5">
      {dayCount > 1 && (
        <nav className="flex border-b border-[#374155]" aria-label="Venue event days">
          {Array.from({ length: dayCount }, (_, index) => (
            <button key={index} type="button" onClick={() => setActiveDay(index)} className={`border-b-2 px-5 py-2 text-[10px] font-medium transition ${selectedDay === index ? 'border-[#8B3DFF] text-[#9F68FF]' : 'border-transparent text-[#CBC3D7]/75 hover:text-white'}`}>Day {index + 1}</button>
          ))}
        </nav>
      )}

      <SplitInfoRow items={[
        ['Total Number of Participants', participantCount],
        ['Venue Required', dayVenues.map((venue) => venue.venueName).filter(Boolean).join(' / ')],
      ]} />

      {dayVenues.map((venue, index) => <VenueBlock key={`${venue.venueName}-${index}`} venue={venue} />)}
      {!dayVenues.length && <p className="py-8 text-center text-sm text-[#CBC3D7]/65">No venue requirements were submitted for Day {selectedDay + 1}.</p>}
    </div>
  )
}

export default VenueDetailsPanel
