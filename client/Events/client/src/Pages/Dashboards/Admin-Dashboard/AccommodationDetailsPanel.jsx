import React from 'react'
import { CalendarDays, Clock3, FileText, Phone, User } from 'lucide-react'

const stayDates = [
    { icon: CalendarDays, label: 'Check-in Date', value: '12/06/2026' },
    { icon: Clock3, label: 'Check-in Time', value: '09:30 AM' },
    { icon: CalendarDays, label: 'Check-out Date', value: '12/06/2026' },
    { icon: Clock3, label: 'Check-out Time', value: '09:30 AM' },
]

const guestRows = [
    ['Surya Chandran', 'Male', '9080884370'],
    ['Surya Chandran', 'Male', '9080884370'],
]

const roomRows = [
    [['No. of Single Rooms', '100'], ['No. of Double Rooms', '10']],
    [['No. of Suite Rooms', '10'], ['No. of D - Block Rooms', '10']],
    [['No. of Guest In hostel Dine-in', '10'], ['No. of Guest In Amenity Dine-in', '10']],
]

const specialRequirement =
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s'

const IconInfoCell = ({ icon, label, value, className = '' }) => {
    const IconComponent = icon

    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <IconComponent size={16} className="mt-0.5 text-[#C9B6FF]" />
            <div>
                <p className="text-[10px] font-semibold uppercase text-[#CBC3D7]/45">{label}</p>
                <p className="mt-1 text-sm font-semibold text-white">{value}</p>
            </div>
        </div>
    )
}

const SplitInfoRow = ({ items }) => (
    <div className="grid grid-cols-2 rounded-lg border border-[#374155]/70 bg-[#242B3D] px-4 py-5">
        {items.map(([label, value], index) => (
            <div key={label} className={`flex items-center justify-between gap-5 px-2 text-sm ${index === 0 ? 'border-r border-[#6b7280]/50 pr-9' : 'pl-5'}`}>
                <span className="text-[#CBC3D7]/75">{label}</span>
                <span className="font-semibold text-white">{value}</span>
            </div>
        ))}
    </div>
)

const GuestRow = ({ name, gender, phone }) => (
    <div className="flex items-center justify-between rounded-md bg-[#2A3143] px-4 py-4">
        <p className="text-sm font-semibold text-white">{name}</p>
        <div className="flex items-center gap-6 text-xs text-[#CBC3D7]/65">
            <span className="flex items-center gap-2">
                <User size={15} className="text-[#C9B6FF]" />
                {gender}
            </span>
            <span className="flex items-center gap-2">
                <Phone size={15} className="text-[#C9B6FF]" />
                {phone}
            </span>
        </div>
    </div>
)

const AccommodationDetailsPanel = () => {
    return (
        <div className="w-[80%] max-h-[calc(100vh-150px)] overflow-auto table-custom-scrollbar rounded-lg border border-[#27334c] bg-[#151d31] p-5">
            <h2 className="text-lg font-medium text-[#8F5BFF]">Accommodation Details</h2>
            <p className="mt-1 text-xs leading-5 text-[#CBC3D7]/50">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
            </p>

            <div className="mt-6 space-y-5 rounded-lg border border-[#374155] bg-[#1B2334] p-4">
                <div className="grid grid-cols-4 rounded-md border border-[#374155]/60 bg-[#242B3D] py-4">
                    {stayDates.map((item, index) => (
                        <IconInfoCell key={item.label} {...item} className={`px-4 ${index !== stayDates.length - 1 ? 'border-r border-[#6b7280]/50' : ''}`} />
                    ))}
                </div>

                {guestRows.map(([name, gender, phone], index) => (
                    <GuestRow key={`${name}-${index}`} name={name} gender={gender} phone={phone} />
                ))}

                {roomRows.map((row) => (
                    <SplitInfoRow key={row[0][0]} items={row} />
                ))}

                <section className="rounded-lg border border-[#465168] bg-[#232A3B] p-5">
                    <div className="mb-4 flex items-center gap-2 text-base font-medium text-[#E6E2F0]">
                        <FileText size={16} />
                        Special Requirement
                    </div>
                    <p className="text-sm font-medium leading-7 text-[#E6E2F0]">{specialRequirement}</p>
                </section>
            </div>
        </div>
    )
}

export default AccommodationDetailsPanel
