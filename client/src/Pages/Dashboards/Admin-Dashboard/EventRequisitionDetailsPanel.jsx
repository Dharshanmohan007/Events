import React from 'react'
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

const eventSummary = [
    { icon: PartyPopper, label: 'Event Name', value: 'Nexus Annual Tech Summit 2024' },
    { icon: CalendarDays, label: 'Event Date', value: '12/06/2026' },
    { icon: Clock3, label: 'Event Start Time', value: '09:30 AM' },
    { icon: Clock3, label: 'Event End Time', value: '12:30 pm' },
]

const organizerRows = [
    [
        { icon: User, label: 'Organizer Name', value: 'Surya Chandran' },
        { icon: Mail, label: 'Organizer Email', value: 'user@gmail.com' },
        { icon: Phone, label: 'Organizer Phone Number', value: '1234567890' },
        { icon: Network, label: 'Organizer Department', value: 'CSE' },
    ],
    [
        { icon: User, label: 'Organizer Name', value: 'Surya Chandran' },
        { icon: Mail, label: 'Organizer Email', value: 'user@gmail.com' },
        { icon: Phone, label: 'Organizer Phone Number', value: '1234567890' },
        { icon: Network, label: 'Organizer Department', value: 'CSE' },
    ],
]

const guestRows = [
    [
        { icon: User, label: 'Guest Name', value: 'Surya Chandran' },
        { icon: Building2, label: 'Guest Organization', value: 'SECE' },
        { icon: Phone, label: 'Guest Phone Number', value: '1234567890' },
        { icon: Network, label: 'Guest Designation', value: 'CSE' },
    ],
    [
        { icon: User, label: 'Guest Name', value: 'Surya Chandran' },
        { icon: Building2, label: 'Guest Organization', value: 'SECE' },
        { icon: Phone, label: 'Guest Phone Number', value: '1234567890' },
        { icon: Network, label: 'Guest Designation', value: 'CSE' },
    ],
]

const leftDetails = [
    ['Finance Required', 'Yes', true],
    ['Is It approved in budget', 'Yes', true],
    ['Organizing Department', 'Placement'],
    ['No of Days', '5 Days'],
    ['Involved IIC', 'No', false],
]

const rightDetails = [
    ['Type of the Event', 'FDP'],
    ['Professional Society Involved', 'FDP'],
    ['Organizing Department', 'Placement'],
    ['Target Audience', 'Student'],
    ['Logos in poster', 'SECE / Army / Police'],
]

const InfoCell = ({ icon: Icon, label, value }) => (
    <div className="border-r border-[#6b7280]/50 px-4 last:border-r-0">
        <Icon size={16} className="mb-2 text-[#c6b5ff]" />
        <p className="text-[10px] font-semibold uppercase text-[#CBC3D7]/35">{label}</p>
        <p className="mt-1 text-sm font-medium whitespace-break-spaces text-white">{value}</p>
    </div>
)

const InfoRow = ({ items }) => (
    <div className="grid grid-cols-4 rounded-md bg-[#232A3B] py-3">
        {items.map((item) => (
            <InfoCell key={item.label} {...item} />
        ))}
    </div>
)

const YesNoValue = ({ value, positive }) => (
    <span className={positive ? 'font-semibold text-[#2AF5A7]' : 'font-semibold text-[#FF0063]'}>
        {value}
    </span>
)

const DetailColumn = ({ items }) => (
    <div className="space-y-0">
        {items.map(([label, value, positive]) => (
            <div key={label} className="flex items-center justify-between border-b border-[#30384d]/60 py-3 text-sm last:border-b-0">
                <span className="text-[#CBC3D7]/75">{label}</span>
                {typeof positive === 'boolean' ? (
                    <YesNoValue value={value} positive={positive} />
                ) : (
                    <span className="font-medium text-[#E6E2F0]">{value}</span>
                )}
            </div>
        ))}
    </div>
)

const EventRequisitionDetailsPanel = ({ activeTab }) => {
    return (
        <div className="w-[80%] max-h-[calc(100vh-150px)] overflow-auto table-custom-scrollbar rounded-lg border border-[#27334c] bg-[#151d31] p-5">
            <h2 className="text-lg font-medium text-[#8F5BFF]">{activeTab}</h2>
            <p className="mt-1 text-xs leading-5 text-[#CBC3D7]/50">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
            </p>

            <div className="mt-6 space-y-5">
                <InfoRow items={eventSummary} />

                <div className="grid grid-cols-[1fr_1fr] items-center rounded-lg border border-[#374155] bg-[#232A3B] px-4 py-4">
                    <div className="flex items-center justify-between border-r border-[#6b7280]/50 pr-6 text-sm">
                        <span className="text-[#CBC3D7]/80">Completion of previous Event documentation</span>
                        <YesNoValue value="Yes" positive />
                    </div>
                    <div className="flex items-center gap-3 pl-8">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0e5149]/30 text-[#0fc982]">
                            <FileText size={17} />
                        </span>
                        <span className="text-sm font-medium text-white">Previous Event Completion Document.pdf</span>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_1fr] items-center rounded-lg border border-[#374155] bg-[#232A3B] px-4 py-4">
                    <div className="flex items-center justify-between border-r border-[#6b7280]/50 pr-6 text-sm">
                        <span className="text-[#CBC3D7]/80">Completion of previous Event documentation</span>
                        <YesNoValue value="No" positive={false} />
                    </div>
                    <p className="pl-8 text-sm font-medium leading-5 text-white">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                        Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                    </p>
                </div>

                <section className="space-y-3 rounded-lg border border-[#374155] bg-[#2E3545] p-4">
                    {organizerRows.map((row, index) => (
                        <InfoRow key={index} items={row} />
                    ))}
                </section>

                <section className="rounded-lg border border-[#374155] bg-[#232A3C] p-5">
                    <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#E6E2F0]">
                        <FileText size={17} />
                        Event Details
                    </div>
                    <div className="grid grid-cols-2 gap-7">
                        <div className="border-r border-[#6b7280]/50 pr-7">
                            <DetailColumn items={leftDetails} />
                        </div>
                        <DetailColumn items={rightDetails} />
                    </div>
                </section>

                <section className="space-y-3 rounded-lg border border-[#374155] bg-[#2E3545] p-4">
                    {guestRows.map((row, index) => (
                        <InfoRow key={index} items={row} />
                    ))}
                </section>
            </div>
        </div>
    )
}

export default EventRequisitionDetailsPanel
