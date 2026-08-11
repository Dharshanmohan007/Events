import React from 'react'
import { CalendarDays, Clock3, FileText, MapPin, Phone, User } from 'lucide-react'

const transportSummary = [
  { icon: CalendarDays, label: 'Pickup Date', value: '12/06/2026' },
  { icon: Clock3, label: 'Pickup Time', value: '09:30 AM' },
  { icon: CalendarDays, label: 'Drop Date', value: '12/06/2026' },
  { icon: Clock3, label: 'Drop Time', value: '09:30 AM' },
]

const transportStops = [
  { label: 'Pickup Location', value: 'Sri Eshwar College of engineering' },
  { label: 'Checkpoint', value: 'Hotel' },
  { label: 'Drop Location', value: 'Coimbatore Airport' },
]

const vehicleDetails = [
  [
    ['Total Number of Members', '100'],
    ['Types of Vehicle needed', 'Car / bus'],
  ],
  [
    ['Total bus needed', '10'],
    ['Total car needed', '10'],
  ],
  [
    ['Accompanying Staff Name', 'Surya Chandran', User],
    ['Accompanying Mobile Number', '1234567890', Phone],
  ],
]

const specialRequirement =
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s'

const IconInfoCell = ({ icon: Icon, label, value, className = '' }) => (
  <div className={`flex items-start gap-3 ${className}`}>
    {Icon && <Icon size={16} className="mt-0.5 text-[#C9B6FF]" />}
    <div>
      <p className="text-[10px] font-semibold uppercase text-[#CBC3D7]/45">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  </div>
)

const TransportTimeline = () => (
  <div className="grid grid-cols-3 items-center gap-5">
    {transportStops.map((stop, index) => (
      <div key={stop.label} className="relative">
        {index < transportStops.length - 1 && (
          <span className="absolute left-[calc(100%-10px)] top-1/2 hidden h-px w-[calc(100%+20px)] border-t border-dashed border-[#BBC1D5]/45 lg:block" />
        )}
        <div className="relative z-[1] flex items-center gap-3 rounded-md bg-[#2A3143] px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8B3DFF]">
            <MapPin size={15} className="text-white" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase text-[#CBC3D7]/45">{stop.label}</p>
            <p className="mt-1 text-xs font-semibold text-white">{stop.value}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
)

const SplitRow = ({ items }) => (
  <div className="grid grid-cols-2 rounded-md border border-[#374155]/70 bg-[#242B3D] px-4 py-4">
    {items.map(([label, value, Icon], index) => (
      <div key={label} className={`flex items-center justify-between gap-5 px-2 text-sm ${index === 0 ? 'border-r border-[#6b7280]/50 pr-9' : 'pl-5'}`}>
        {Icon ? (
          <IconInfoCell icon={Icon} label={label} value={value} />
        ) : (
          <>
            <span className="text-[#CBC3D7]/75">{label}</span>
            <span className="font-semibold text-white">{value}</span>
          </>
        )}
      </div>
    ))}
  </div>
)

const FacultyTransportationDetailsPanel = () => {
  return (
    <div className="space-y-5 rounded-lg border border-[#374155] bg-[#1B2334] p-4">
      <div className="grid grid-cols-4 rounded-md border border-[#374155]/60 bg-[#242B3D] py-4">
        {transportSummary.map((item, index) => (
          <IconInfoCell
            key={item.label}
            {...item}
            className={`px-4 ${index !== transportSummary.length - 1 ? 'border-r border-[#6b7280]/50' : ''}`}
          />
        ))}
      </div>

      <TransportTimeline />

      {vehicleDetails.map((row) => (
        <SplitRow key={row[0][0]} items={row} />
      ))}

      <section className="rounded-lg border border-[#465168] bg-[#232A3B] p-5">
        <div className="mb-4 flex items-center gap-2 text-base font-medium text-[#E6E2F0]">
          <FileText size={16} />
          Special Requirement
        </div>
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">{specialRequirement}</p>
      </section>
    </div>
  )
}

export default FacultyTransportationDetailsPanel
