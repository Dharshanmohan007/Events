import React from 'react'
import calendarFill from '../../../assets/calendarFill.svg'
import circleTick from '../../../assets/circle-tick.svg'
import hourglassFill from '../../../assets/hourglassFill.svg'
import tick from '../../../assets/tick.svg'

const statCardData = [
    {
        title: 'Event Request',
        stats: [
            { label: 'Total Event request', value: 50, icon: calendarFill, bgColor: 'from-[#2d2851] via-[#45216f] to-[#67208f]', iconBg: 'bg-[#A78BFA]' },
            { label: 'Approved Events', value: 50, icon: tick, bgColor: 'from-[#173945] via-[#0d5c4b] to-[#0f8f55]', iconBg: 'bg-[#36D399]' },
            { label: 'Completed Events', value: 50, icon: circleTick, bgColor: 'from-[#252d5c] via-[#26278b] to-[#2018a6]', iconBg: 'bg-[#8390FF]' },
            { label: 'pending Approval Events', value: 50, icon: hourglassFill, bgColor: 'from-[#36243c] via-[#61214b] to-[#9d1c5a]', iconBg: 'bg-[#EE67AD]' },
        ],
    },
    {
        title: 'Individual Request',
        stats: [
            { label: 'Total Request', value: 50, icon: calendarFill, bgColor: 'from-[#2d2851] via-[#45216f] to-[#67208f]', iconBg: 'bg-[#A78BFA]' },
            { label: 'Approved Request', value: 50, icon: tick, bgColor: 'from-[#173945] via-[#0d5c4b] to-[#0f8f55]', iconBg: 'bg-[#36D399]' },
            { label: 'Completed', value: 50, icon: circleTick, bgColor: 'from-[#252d5c] via-[#26278b] to-[#2018a6]', iconBg: 'bg-[#8390FF]' },
            { label: 'pending Approval Request', value: 50, icon: hourglassFill, bgColor: 'from-[#36243c] via-[#61214b] to-[#9d1c5a]', iconBg: 'bg-[#EE67AD]' },
        ],
    },
]

const FacultyStatcard = () => {
    return (
        <section className="mt-4 grid grid-cols-1 gap-7 xl:grid-cols-2">
            {statCardData.map((section) => (
                <div key={section.title} className="rounded-lg border border-[#263044] bg-[#151d2d] p-5">
                    <h2 className="mb-2 text-lg font-medium text-white">{section.title}</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {section.stats.map((item) => (
                            <div
                                key={item.label}
                                className={`relative min-h-[78px] overflow-hidden rounded-lg border-l-2 border-l-[#7C6DFF] bg-gradient-to-r ${item.bgColor} p-3 text-white`}
                            >
                                <p className="pr-10 text-sm font-normal text-[#FFFFFFE6]">{item.label}</p>
                                <p className="mt-1 text-2xl font-medium leading-none">{item.value}</p>
                                <div className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md ${item.iconBg}`}>
                                    <img src={item.icon} alt="" className="h-4 w-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    )
}

export default FacultyStatcard
