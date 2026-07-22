import React, { useState } from 'react'
import {
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  Mail,
  Network,
  PartyPopper,
  Phone,
  User,
} from 'lucide-react'

const displayValue = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || '-'
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

const yesNo = (value) => (value ? 'Yes' : 'No')

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '-'
    : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

const formatTime = (value) => {
  if (!value) return '-'
  const [hours, minutes] = String(value).split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return value
  return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    .format(new Date(2000, 0, 1, hours, minutes))
    .toUpperCase()
}

const InfoCell = ({ icon, label, value }) => {
  const IconComponent = icon
  return (
    <div className="border-r border-[#6b7280]/50 px-4 last:border-r-0">
      <IconComponent size={16} className="mb-2 text-[#c6b5ff]" />
      <p className="text-[10px] font-semibold uppercase text-[#CBC3D7]/35 ">{label}</p>
      <p className="mt-1 text-sm font-medium whitespace-break-spaces text-white truncate" title={displayValue(value)}>{displayValue(value)}</p>
    </div>
  )
}

const InfoRow = ({ items }) => (
  <div className="grid grid-cols-4 rounded-md bg-[#232A3B] py-3">
    {items.map((item) => <InfoCell key={item.label} {...item} />)}
  </div>
)

const YesNoValue = ({ value }) => {
  const positive = Boolean(value)
  return <span className={positive ? 'font-semibold text-[#2AF5A7]' : 'font-semibold text-[#FF0063]'}>{yesNo(value)}</span>
}

const DetailColumn = ({ items }) => (
  <div className="space-y-0">
    {items.map(([label, value, boolean]) => (
      <div key={label} className="flex items-center justify-between gap-4 border-b border-[#30384d]/60 py-3 text-sm last:border-b-0">
        <span className="text-[#CBC3D7]/75">{label}</span>
        {boolean ? <YesNoValue value={value} /> : <span className="text-right font-medium text-[#E6E2F0]">{displayValue(value)}</span>}
      </div>
    ))}
  </div>
)

const DocumentLink = ({ document, label }) => {
  if (!document?.url) return null
  return (
    <a href={document.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 pl-8 text-sm font-medium text-white hover:text-[#c6b5ff]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0e5149]/30 text-[#0fc982]"><FileText size={17} /></span>
      <span>{label}</span>
    </a>
  )
}

const FacultyEventRequisitionDetailsPanel = ({ requestDetails }) => {
  const [activeDay, setActiveDay] = useState(0)
  const organizer = requestDetails?.organizerDetails || {}
  const event = requestDetails?.eventDetails || {}
  const schedule = event.eventSchedule || []
  const selectedDay = Math.min(activeDay, Math.max(schedule.length - 1, 0))
  const currentDay = schedule[selectedDay] || {}

  if (!requestDetails) return <p className="py-10 text-center text-sm text-[#CBC3D7]/65">No event requisition details are available.</p>

  const eventSummary = [
    { icon: PartyPopper, label: 'Event Name', value: event.eventName },
    { icon: CalendarDays, label: 'Event Date', value: formatDate(currentDay.eventDate) },
    { icon: Clock3, label: 'Event Start Time', value: formatTime(currentDay.startTime) },
    { icon: Clock3, label: 'Event End Time', value: formatTime(currentDay.endTime) },
  ]
  const leftDetails = [
    ['Finance Required', organizer.financeRequired, true],
    ['Is It Approved in Budget', organizer.isBudgetApproved, true],
    ['Organizing Department', organizer.organizingDepartment],
    ['No. of Days', event.numberOfDays || schedule.length],
    ['Involved IIC', event.involvedIIC, true],
  ]
  const rightDetails = [
    ['Type of the Event', event.eventTypeOther || event.eventType],
    ['Professional Society Involved', event.professionalSocietyOther || event.professionalSociety],
    ['Target Audience', event.targetAudience],
    ['Logos in Poster', event.logosOther || event.logosInPoster],
    ['Advance Amount', organizer.financeRequired ? `₹${displayValue(organizer.advanceAmount)}` : '-'],
  ]

  return (
    <div className="space-y-5">
      {schedule.length > 1 && (
        <nav className="flex border-b border-[#374155]" aria-label="Event days">
          {schedule.map((day, index) => (
            <button key={`${day.eventDate}-${index}`} type="button" onClick={() => setActiveDay(index)} className={`border-b-2 px-5 py-2 text-[10px] font-medium transition ${selectedDay === index ? 'border-[#8B3DFF] text-[#9F68FF]' : 'border-transparent text-[#CBC3D7]/75 hover:text-white'}`}>
              Day {index + 1}
            </button>
          ))}
        </nav>
      )}

      <InfoRow items={eventSummary} />

      <div className="grid grid-cols-[1fr_1fr] items-center rounded-lg border border-[#374155] bg-[#232A3B] px-4 py-4">
        <div className="flex items-center justify-between border-r border-[#6b7280]/50 pr-6 text-sm">
          <span className="text-[#CBC3D7]/80">Completion of previous event documentation</span>
          <YesNoValue value={organizer.previousEventDocumentation} />
        </div>
        {organizer.previousEventDocumentation ? <DocumentLink document={organizer.previousEventDocumentationDetails} label="Previous Event Completion Document" /> : <p className="pl-8 text-sm text-white">{displayValue(organizer.previousEventReason)}</p>}
      </div>

      {organizer.principalApprovalDocument?.url && (
        <div className="rounded-lg border border-[#374155] bg-[#232A3B] px-4 py-4">
          <DocumentLink document={organizer.principalApprovalDocument} label="Principal Approval Document" />
        </div>
      )}

      <section className="space-y-3 rounded-lg border border-[#374155] bg-[#2E3545] p-4">
        {(organizer.organizers || []).map((person, index) => (
          <InfoRow key={`${person.email || person.name}-${index}`} items={[
            { icon: User, label: 'Organizer Name', value: person.name },
            { icon: Mail, label: 'Organizer Email', value: person.email },
            { icon: Phone, label: 'Organizer Phone Number', value: person.mobile },
            { icon: Network, label: 'Organizer Department', value: person.department },
          ]} />
        ))}
      </section>

      <section className="rounded-lg border border-[#374155] bg-[#232A3C] p-5">
        <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#E6E2F0]"><FileText size={17} />Event Details</div>
        <div className="grid grid-cols-2 gap-7">
          <div className="border-r border-[#6b7280]/50 pr-7"><DetailColumn items={leftDetails} /></div>
          <DetailColumn items={rightDetails} />
        </div>
        {organizer.financeRequired && organizer.purposeOfAdvance && <p className="mt-4 border-t border-[#30384d]/60 pt-4 text-sm text-[#CBC3D7]/75">Purpose of advance: <span className="text-white">{organizer.purposeOfAdvance}</span></p>}
      </section>

      <section className="space-y-3 rounded-lg border border-[#374155] bg-[#2E3545] p-4">
        {(currentDay.guests || []).map((guest, index) => (
          <InfoRow key={`${guest.mobile || guest.name}-${index}`} items={[
            { icon: User, label: 'Guest Name', value: guest.name },
            { icon: Building2, label: 'Guest Organization', value: guest.organization },
            { icon: Phone, label: 'Guest Phone Number', value: guest.mobile },
            { icon: Network, label: 'Guest Designation', value: guest.designation },
          ]} />
        ))}
        {!currentDay.guests?.length && <p className="py-2 text-center text-sm text-[#CBC3D7]/65">No guests scheduled for this day.</p>}
      </section>
    </div>
  )
}

export default FacultyEventRequisitionDetailsPanel
