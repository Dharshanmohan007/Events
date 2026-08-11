import React from 'react'
import { FileText } from 'lucide-react'

const venueOverview = [
  ['Total Number of Participants', '1000 Members'],
  ['Venue Required', 'Main Board Room / Vista Hall / Lab'],
]

const hallRequirements = [
  [
    ['Chair', '100'],
    ['NotePad', '120'],
  ],
  [
    ['Water Bottle', '100'],
    ['Snacks', '100'],
  ],
]

const venues = ['Main Board Room', 'Vista Hall']

const SplitInfoRow = ({ items }) => (
  <div className="grid grid-cols-2 rounded-lg border border-[#374155] bg-[#232A3B] px-5 py-5">
    {items.map(([label, value], index) => (
      <div
        key={label}
        className={`flex items-center justify-between gap-4 text-sm ${index === 0 ? 'border-r border-[#6b7280]/50 pr-7' : 'pl-7'}`}
      >
        <span className="text-[#CBC3D7]/75">{label}</span>
        <span className="font-medium text-white">{value}</span>
      </div>
    ))}
  </div>
)

const RequirementColumn = ({ items }) => (
  <div>
    {items.map(([label, value]) => (
      <div key={label} className="flex items-center justify-between border-b border-[#30384d]/60 py-3 text-sm last:border-b-0">
        <span className="text-[#CBC3D7]/75">{label}</span>
        <span className="font-medium text-[#E6E2F0]">{value}</span>
      </div>
    ))}
  </div>
)

const HallRequirements = () => (
  <section className="rounded-lg border border-[#374155] bg-[#232A3B] p-5">
    <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#E6E2F0]">
      <FileText size={17} />
      Hall Requirements
    </div>
    <div className="grid grid-cols-2 gap-7">
      <div className="border-r border-[#6b7280]/50 pr-7">
        <RequirementColumn items={hallRequirements[0]} />
      </div>
      <RequirementColumn items={hallRequirements[1]} />
    </div>
  </section>
)

const SpecialRequirement = () => (
  <section className="rounded-lg border border-[#374155] bg-[#232A3B] p-5">
    <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#E6E2F0]">
      <FileText size={17} />
      Special Requirement
    </div>
    <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
      Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
    </p>
  </section>
)

const VenueBlock = ({ name }) => (
  <section className="rounded-lg border border-[#374155] bg-[#232A3C] p-5">
    <h3 className="text-lg font-medium text-[#8F5BFF]">{name}</h3>

    <div className="mt-5 space-y-5">
      <SplitInfoRow
        items={[
          ['Number of Participants', '100'],
          ['Number of Seating Capacity Required', '120'],
        ]}
      />
      <HallRequirements />
      <SpecialRequirement />
    </div>
  </section>
)

const FacultyVenueDetailsPanel = () => {
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <span className="rounded-full bg-green-400/10 px-5 py-2 text-sm font-medium text-[#10B981]">
          Placement
        </span>
      </div>

      <SplitInfoRow items={venueOverview} />

      {venues.map((venue) => (
        <VenueBlock key={venue} name={venue} />
      ))}
    </div>
  )
}

export default FacultyVenueDetailsPanel
