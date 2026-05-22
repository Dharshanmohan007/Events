import React from 'react'
import { ListFilter } from 'lucide-react'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const times = ['9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm', '3 pm', '4 pm'];

const venueAvailabilityData = {
    venue: "Main Board Room",
    availability: [
        { day: "Thu", time: "9 am", available: true },
        { day: "Fri", time: "9 am", available: true },

        { day: "Wed", time: "10 am", available: true },
        { day: "Thu", time: "10 am", available: true },
        { day: "Fri", time: "10 am", available: true },

        { day: "Tue", time: "11 am", available: true },
        { day: "Wed", time: "11 am", available: true },
        { day: "Thu", time: "11 am", available: true },
        { day: "Fri", time: "11 am", available: true },
        { day: "Sat", time: "11 am", available: true },

        { day: "Mon", time: "12 pm", available: true },
        { day: "Tue", time: "12 pm", available: true },
        { day: "Wed", time: "12 pm", available: true },
        { day: "Thu", time: "12 pm", available: true },
        { day: "Fri", time: "12 pm", available: true },
        { day: "Sat", time: "12 pm", available: true },
        { day: "Sun", time: "12 pm", available: true },

        { day: "Tue", time: "1 pm", available: true },
        { day: "Wed", time: "1 pm", available: true },
        { day: "Thu", time: "1 pm", available: true },
        { day: "Fri", time: "1 pm", available: true },

        { day: "Thu", time: "2 pm", available: true },
        { day: "Thu", time: "3 pm", available: true },
        { day: "Thu", time: "4 pm", available: true },
    ]
}

const availableSlots = new Set(
    venueAvailabilityData.availability
        .filter(slot => slot.available)
        .map(slot => {
            const rowIndex = times.indexOf(slot.time)
            const colIndex = days.indexOf(slot.day)
            return `${rowIndex}-${colIndex}`
        })
)

// const availableSlots = new Set([
//     '0-3', '0-4',
//     '1-2', '1-3', '1-4',
//     '2-1', '2-2', '2-3', '2-4', '2-5',
//     '3-0', '3-1', '3-2', '3-3', '3-4', '3-5', '3-6',
//     '4-1', '4-2', '4-3', '4-4',
//     '5-3',
//     '6-3',
//     '7-3',
// ])

const FacultyVenueAvailability = () => {
    return (
        <section className="rounded-lg border border-[#263044] bg-[#151d2d] p-4">
            <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-white">Venue Availability</h2>
                <div className="flex items-center gap-4">
                    <span className="text-[11px] text-[#FFFFFF80]">Past 7 Days</span>
                    <button className="flex items-center gap-1.5 rounded-md bg-[#222b3d] px-3 py-2 text-[10px] text-white">
                        <ListFilter size={12} />
                        Main Board Room
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-[38px_repeat(7,minmax(0,1fr))] gap-x-3 gap-y-3">
                <div />
                {days.map((day) => (
                    <div key={day} className="text-center text-[9px] text-[#FFFFFF80]">{day}</div>
                ))}

                {times.map((time, rowIndex) => (
                    <React.Fragment key={time}>
                        <div className="flex items-center text-[9px]  text-[#FFFFFF80]">{time}</div>
                        {days.map((day, colIndex) => {
                            const isAvailable = availableSlots.has(`${rowIndex}-${colIndex}`)
                            return (
                                <div
                                    key={`${time}-${day}`}
                                    className={`h-10 rounded-md ${isAvailable ? 'bg-[#7C3AED]' : 'bg-[#2d3548]'}`}
                                />
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-4 flex justify-center gap-8 text-xs text-[#FFFFFF80]">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-7 rounded-full bg-[#2d3548]" />
                    Booked
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-7 rounded-full bg-[#7C3AED]" />
                    Available
                </div>
            </div>
        </section>
    )
}

export default FacultyVenueAvailability
