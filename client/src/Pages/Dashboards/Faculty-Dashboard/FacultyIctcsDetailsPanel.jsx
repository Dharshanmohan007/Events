import React, { useState } from 'react'
import { FacultySectionCard } from './FacultyDetailsPanelShared'

const displayValue = (value) => (value === null || value === undefined || value === '' ? '-' : String(value))

const yesNo = (value) => (value ? 'Yes' : 'No')

const KeyValueList = ({ items }) => (
  <div>
    {items.map(([label, value]) => (
      <div key={label} className="flex items-center justify-between border-b border-[#30384d]/60 py-3 text-sm last:border-b-0">
        <span className="text-[#CBC3D7]/75">{label}</span>
        <span className="font-medium text-[#E6E2F0]">{value}</span>
      </div>
    ))}
  </div>
)

const IctsVenueDetails = ({ icts }) => {
  const desktopLaptopItems = (icts.desktopLaptop || []).map(
    (item) => [`${item.type || 'System'} Count`, displayValue(item.count)]
  )

  const basicItems = [
    ...desktopLaptopItems,
    ['Internet Facility', displayValue(icts.internetFacility)],
    ['Expected Internet Users', displayValue(icts.expectedInternetUsers)],
    ['Proctoring / Exam Users', displayValue(icts.proctoringUsers)],
    ['Guest WiFi Needed', yesNo(icts.guestWifiNeeded)],
  ]

  if (icts.guestWifiNeeded) {
    basicItems.push(['Guest WiFi Exceeds 5 Devices', yesNo(icts.guestWifiExceed5)])
    basicItems.push(['Total Guest Count', displayValue(icts.totalGuestCount)])
  }

  const objectRequirements = (icts.requirements || []).filter(Boolean)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[#8F5BFF]">{displayValue(icts.venueName)}</h3>

      <div className="grid grid-cols-[1fr_0.75fr_1.2fr] gap-4">
        <FacultySectionCard title="Basic Requirement">
          <KeyValueList items={basicItems} />
        </FacultySectionCard>

        <FacultySectionCard title="Object Requirement">
          {objectRequirements.length ? (
            <div className="divide-y divide-[#30384d]/60">
              {objectRequirements.map((item) => (
                <p key={item} className="py-2.5 text-sm font-medium text-[#E6E2F0] first:pt-0 last:pb-0">
                  {item}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#CBC3D7]/75">-</p>
          )}
        </FacultySectionCard>

        <FacultySectionCard title="Special Requirement">
          <p className="text-sm leading-7 text-[#E6E2F0]">{displayValue(icts.specialRequirements)}</p>
        </FacultySectionCard>
      </div>

      {icts.otherRequirements ? (
        <FacultySectionCard title="Other Requirements">
          <p className="text-sm leading-7 text-[#E6E2F0]">{displayValue(icts.otherRequirements)}</p>
        </FacultySectionCard>
      ) : null}
    </div>
  )
}

const FacultyIctcsDetailsPanel = ({ ictsDetails, eventSchedule = [] }) => {
  const [activeDay, setActiveDay] = useState(0)
  const ictses = ictsDetails?.ictses ?? []
  if (!ictsDetails) return <p className="py-10 text-center text-sm text-[#CBC3D7]/65">No ICTS details are available.</p>
  const dayCount = Math.max(eventSchedule.length, ...ictses.map((i) => Number(i.dayIndex) + 1), 1)
  const selectedDay = Math.min(activeDay, dayCount - 1)
  const dayIctses = ictses.filter((icts) => Number(icts.dayIndex) === selectedDay)

  return (
    <div className="space-y-5">
      {dayCount > 1 && (
        <nav className="flex border-b border-[#374155]" aria-label="ICTCS event days">
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

      {dayIctses.map((icts, index) => (
        <section key={`${icts.venueName}-${index}`} className="rounded-lg border border-[#374155] bg-[#232A3C] p-5">
          <IctsVenueDetails icts={icts} />
        </section>
      ))}

      {!dayIctses.length && (
        <p className="py-8 text-center text-sm text-[#CBC3D7]/65">No ICTS requirements were submitted for Day {selectedDay + 1}.</p>
      )}
    </div>
  )
}

export default FacultyIctcsDetailsPanel
