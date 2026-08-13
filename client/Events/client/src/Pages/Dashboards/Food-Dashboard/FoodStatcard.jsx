import React from 'react'
import pattern from '../../../assets/pattern.svg'

const UtensilsIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" aria-hidden="true">
        <path d="M5 3v18M9 3v18M13 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 3v7a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const CheckBadgeIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" aria-hidden="true">
        <path
            d="m12 3 2.1 2.6 3.3-.2.8 3.2 2.8 1.8-1.5 3 1.5 3-2.8 1.8-.8 3.2-3.3-.2L12 21l-2.1-2.6-3.3.2-.8-3.2L3 13.6l1.5-3L3 7.6l2.8-1.8.8-3.2 3.3.2L12 3Z"
            fill="currentColor"
            opacity=".95"
        />
        <path d="m8.8 12.2 2.1 2.1 4.4-4.6" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" aria-hidden="true">
        <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const HourglassIcon = () => (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" aria-hidden="true">
        <path d="M6 3h12M6 21h12M8 3v4.5L12 12l4 4.5V21M16 3v4.5L12 12l-4 4.5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 8h4M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const defaultSections = [
    {
        title: 'Food Service Overview',
        stats: [
            {
                label: 'Total Meals Served',
                value: 50,
                cardClass: 'from-[#2e2754] via-[#3d216f] to-[#5f1b89] border-l-[#7357ff]',
                iconClass: 'bg-[#a98cff]',
                icon: <UtensilsIcon />,
            },
            {
                label: 'Completed Services',
                value: 50,
                cardClass: 'from-[#163e46] via-[#0f5e4a] to-[#07864d] border-l-[#20d18c]',
                iconClass: 'bg-[#36d99b]',
                icon: <CheckBadgeIcon />,
            },
            {
                label: 'Active Catering',
                value: 50,
                cardClass: 'from-[#252d5c] via-[#25258a] to-[#2116a5] border-l-[#7181ff]',
                iconClass: 'bg-[#8292ff]',
                icon: <CheckIcon />,
            },
            {
                label: 'Pending Requests',
                value: 50,
                cardClass: 'from-[#342238] via-[#652049] to-[#9b1b59] border-l-[#eb3f99]',
                iconClass: 'bg-[#ef68ad]',
                icon: <HourglassIcon />,
            },
        ],
    },
    {
        title: 'Catering Requests',
        stats: [
            {
                label: 'Total Requests',
                value: 50,
                cardClass: 'from-[#2e2754] via-[#3d216f] to-[#5f1b89] border-l-[#7357ff]',
                iconClass: 'bg-[#a98cff]',
                icon: <UtensilsIcon />,
            },
            {
                label: 'Approved Requests',
                value: 50,
                cardClass: 'from-[#163e46] via-[#0f5e4a] to-[#07864d] border-l-[#20d18c]',
                iconClass: 'bg-[#36d99b]',
                icon: <CheckBadgeIcon />,
            },
            {
                label: 'In Progress',
                value: 50,
                cardClass: 'from-[#252d5c] via-[#25258a] to-[#2116a5] border-l-[#7181ff]',
                iconClass: 'bg-[#8292ff]',
                icon: <CheckIcon />,
            },
            {
                label: 'Pending Approval',
                value: 50,
                cardClass: 'from-[#342238] via-[#652049] to-[#9b1b59] border-l-[#eb3f99]',
                iconClass: 'bg-[#ef68ad]',
                icon: <HourglassIcon />,
            },
        ],
    },
]

const FoodStatcard = ({ sections = defaultSections }) => {
    return (
        <section className="grid grid-cols-1 gap-7 xl:grid-cols-2 mt-6">
            {sections.map((section) => (
                <div key={section.title} className="rounded-lg border border-[#263044] bg-[#141b2b] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
                    <h2 className="mb-3 text-lg font-medium text-white">{section.title}</h2>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {section.stats.map((item) => (
                            <div
                                key={item.label}
                                className={`relative h-[78px] overflow-hidden rounded-lg border-l bg-gradient-to-r ${item.cardClass}`}
                            >
                                <img
                                    src={pattern}
                                    alt=""
                                    className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10"
                                />

                                <div className="relative flex h-full items-start justify-between px-3 py-3">
                                    <div>
                                        <p className="text-sm font-medium text-white">{item.label}</p>
                                        <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                                    </div>

                                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.iconClass}`}>
                                        {item.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    )
}

export default FoodStatcard