import React, { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { FacultySectionCard } from './FacultyDetailsPanelShared'
import EventHeaderData from '../../Dashboards/EventHeaderData'
import Modal from '../../../Components/Modal'
import ictsFacultyData from '../../../data/ictsFacultyData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005'

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

const getAllocatedStaff = (icts) => icts.allocatedStaff || icts.staffAllocation?.staff || (
  icts.staff?.name ? icts.staff : null
)

const normalizeStaff = (staff) => staff ? ({
  name: staff.name || staff.NAME || '',
  email: staff.email || staff['MAIL ID'] || '',
  phone: String(staff.phone || staff['PH NO'] || ''),
  empId: staff.empId || staff['STAFF ID'] || '',
  designation: staff.designation || staff.DESIG || '',
}) : null

const IctsVenueDetails = ({ icts, dayIndex, allocationId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStaff, setSelectedStaff] = useState(() => normalizeStaff(getAllocatedStaff(icts)))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const allocatedStaff = selectedStaff || normalizeStaff(getAllocatedStaff(icts))
  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredFaculty = useMemo(() => {
    if (!normalizedSearchTerm) return []
    const matchingFaculty = ictsFacultyData.filter((faculty) => (
      faculty.NAME.toLowerCase().includes(normalizedSearchTerm) ||
      faculty['MAIL ID'].toLowerCase().includes(normalizedSearchTerm) ||
      faculty['STAFF ID'].toLowerCase().includes(normalizedSearchTerm)
    ))
    return matchingFaculty.filter((faculty, index, facultyList) => (
      index === facultyList.findIndex((candidate) => (
        candidate.NAME === faculty.NAME &&
        candidate['MAIL ID'] === faculty['MAIL ID'] &&
        candidate['STAFF ID'] === faculty['STAFF ID']
      ))
    ))
  }, [normalizedSearchTerm])

  const openModal = () => {
    setSearchTerm('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedStaff) return
    setIsSubmitting(true)
    if (!allocationId) {
      toast.error('Unable to identify this event for staff allocation')
      return
    }
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/icts-staff-allocation/${allocationId}/allocate-icts-staff`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ venueName: icts.venueName, dayIndex, staff: selectedStaff }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || 'Failed to allocate staff')
      setIsModalOpen(false)
      toast.success('ICTS staff allocated successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to allocate staff')
    } finally {
      setIsSubmitting(false)
    }
  }
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
  const tallRequirementClass = allocatedStaff ? 'lg:row-span-2' : ''

  return (
    <div className="space-y-4">
      <div className='flex flex-row justify-between'>
        <div className='flex flex-row gap-5 items-center'>
          <h3 className="text-lg font-medium text-[#8F5BFF]">{displayValue(icts.venueName)}</h3>
          {allocatedStaff && <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">Allocated</span>}
        </div>
        
        <div className="flex items-center gap-3">
          
          <button type="button" onClick={openModal} className="rounded-md border border-[#59647d] px-3 py-2 text-sm text-white transition hover:border-[#8F5BFF] hover:text-[#D0BCFF]">
            {allocatedStaff ? 'Edit Allocated Staff' : 'Allocate Staff'}
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Allocate Staff">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label htmlFor={`staff-search-${dayIndex}-${icts.venueName}`} className="mb-2 block text-sm text-[#CBC3D7]">Search faculty</label>
            <div className="flex items-center rounded-md border border-[#39445d] bg-[#10182a] px-3 focus-within:border-[#8F5BFF]">
              <Search size={16} className="text-[#CBC3D7]/70" />
              <input
                id={`staff-search-${dayIndex}-${icts.venueName}`}
                value={searchTerm}
                onChange={(event) => { setSearchTerm(event.target.value); setSelectedStaff(null) }}
                placeholder="Search by name, email, or staff ID"
                className="w-full bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-[#CBC3D7]/45"
              />
              {searchTerm && <button type="button" onClick={() => { setSearchTerm(''); setSelectedStaff(null) }} aria-label="Clear search"><X size={16} className="text-[#CBC3D7]/70" /></button>}
            </div>
            {normalizedSearchTerm && <div className="mt-1 max-h-48 overflow-auto rounded-md border border-[#39445d] bg-[#182237]">
              {filteredFaculty.length ? filteredFaculty.map((faculty) => (
                <button
                  type="button"
                  key={faculty['STAFF ID']}
                  onClick={() => { setSelectedStaff(normalizeStaff(faculty)); setSearchTerm(faculty.NAME) }}
                  className="block w-full border-b border-[#39445d]/60 px-3 py-2 text-left last:border-b-0 hover:bg-[#263452]"
                >
                  <span className="block text-sm text-white">{faculty.NAME}</span>
                  <span className="block text-xs text-[#CBC3D7]/70">{faculty['MAIL ID']} | {faculty['STAFF ID']}</span>
                </button>
              )) : <p className="px-3 py-3 text-sm text-[#CBC3D7]/70">No faculty found.</p>}
            </div>}
          </div>

          <div className="rounded-md border border-[#39445d] bg-[#10182a] p-4">
            <p className="mb-3 text-xs uppercase tracking-wide text-[#CBC3D7]/60">Chosen faculty</p>
            {selectedStaff ? (
              <div className="space-y-1 text-sm text-[#E6E2F0]">
                <p className="font-medium text-white">{selectedStaff.name}</p>
                <p>{selectedStaff.email}</p>
                <p>{selectedStaff.phone}</p>
                <p>{selectedStaff.designation} | {selectedStaff.empId}</p>
              </div>
            ) : <p className="text-sm text-[#CBC3D7]/70">Choose a faculty member from the search results.</p>}
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-[#59647d] px-4 py-2 text-sm text-[#E6E2F0]">Cancel</button>
            <button type="submit" disabled={!selectedStaff || isSubmitting} className="rounded-md bg-[#8F5BFF] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? 'Submitting...' : allocatedStaff ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.75fr_1.2fr]">
        <FacultySectionCard title="Basic Requirement" className={tallRequirementClass}>
          <KeyValueList items={basicItems} />
        </FacultySectionCard>

        <FacultySectionCard title="Object Requirement" className={tallRequirementClass}>
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

      {allocatedStaff ? (
        <FacultySectionCard title="Allocated Staff" className="lg:col-start-3">
          <div className="grid grid-cols-2 gap-x-5 gap-y-3">
            <div>
              <p className="text-xs text-[#CBC3D7]/65">Name</p>
              <p className="mt-1 text-sm font-medium text-[#E6E2F0]">{displayValue(allocatedStaff.name)}</p>
            </div>
            <div>
              <p className="text-xs text-[#CBC3D7]/65">Employee ID / Designation</p>
              <p className="mt-1 text-sm font-medium text-[#E6E2F0]">
                {displayValue(allocatedStaff.empId)} / {displayValue(allocatedStaff.designation)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#CBC3D7]/65">Email</p>
              <p className="mt-1 wrap-break-word text-sm font-medium text-[#E6E2F0]">{displayValue(allocatedStaff.email)}</p>
            </div>
            <div>
              <p className="text-xs text-[#CBC3D7]/65">Phone</p>
              <p className="mt-1 text-sm font-medium text-[#E6E2F0]">{displayValue(allocatedStaff.phone)}</p>
            </div>
          </div>
        </FacultySectionCard>
      ) : null}

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

const FacultyIctcsDetailsPanel = ({ ictsDetails, eventData, eventSchedule = [] }) => {
  const [activeDay, setActiveDay] = useState(0)
  const ictses = ictsDetails?.ictses ?? []
  if (!ictsDetails) return <p className="py-10 text-center text-sm text-[#CBC3D7]/65">No ICTS details are available.</p>
  const dayCount = Math.max(eventSchedule.length, ...ictses.map((i) => Number(i.dayIndex) + 1), 1)
  const selectedDay = Math.min(activeDay, dayCount - 1)
  const dayIctses = ictses.filter((icts) => Number(icts.dayIndex) === selectedDay)

  return (
    <div className="space-y-5">

      <EventHeaderData data={eventData?.requestDetails}/>

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
          <IctsVenueDetails icts={icts} dayIndex={selectedDay} allocationId={allocationId} />
        </section>
      ))}

      {!dayIctses.length && (
        <p className="py-8 text-center text-sm text-[#CBC3D7]/65">No ICTS requirements were submitted for Day {selectedDay + 1}.</p>
      )}
    </div>
  )
}

export default FacultyIctcsDetailsPanel
