import React from 'react'
import { CalendarDays, FileText, Phone, User } from 'lucide-react'

const foodSummaryRows = [
    [
        ['Date', '12/05/2026', CalendarDays],
        ['Type of resource Person', 'VIP / Trainer / Placement'],
    ],
    [
        ['Total number of resource Person', '5 Members'],
        ['Total number of Internal Accompanying Person', '2 Members'],
    ],
    [
        ['Accompanying Staff Name', 'Surya Chandran', User],
        ['Accompanying Mobile Number', '1234567890', Phone],
    ],
]

const mealSections = [
    {
        title: 'Breakfast',
        rows: [
            [['No. of veg In Participants Menu', '01'], ['No. of veg In Guest/VIP Menu', '02']],
            [['No. of Non-veg In Participants Menu', '01'], ['No. of Non-veg In Guest/VIP Menu', '02']],
        ],
    },
    {
        title: 'Lunch',
        rows: [
            [['No. of veg In Participants Menu', '01'], ['No. of veg In Guest/VIP Menu', '02']],
            [['No. of Non-veg In Participants Menu', '01'], ['No. of Non-veg In Guest/VIP Menu', '02']],
        ],
    },
    {
        title: 'Dinner',
        rows: [
            [['No. of veg In Participants Menu', '01'], ['No. of veg In Guest/VIP Menu', '02']],
            [['No. of Non-veg In Participants Menu', '01'], ['No. of Non-veg In Guest/VIP Menu', '02']],
        ],
    },
]

const specialRequirement =
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s'

const SplitInfoRow = ({ items }) => (
    <div className="grid grid-cols-2 rounded-md border border-[#374155]/60 bg-[#242B3D] px-4 py-4">
        {items.map(([label, value, Icon], index) => (
            <div key={label} className={`flex items-center justify-between gap-5 px-2 text-sm ${index === 0 ? 'border-r border-[#6b7280]/50 pr-9' : 'pl-5'}`}>
                <div className="flex items-start gap-3">
                    {Icon && <Icon size={16} className="mt-0.5 text-[#C9B6FF]" />}
                    <div>
                        <p className="text-[10px] font-semibold uppercase text-[#CBC3D7]/45">{label}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                    </div>
                </div>
            </div>
        ))}
    </div>
)

const MealSection = ({ title, rows }) => (
    <section className="rounded-lg border border-[#465168] bg-[#232A3B] p-4">
        <h3 className="text-lg font-semibold text-[#8F5BFF]">{title}</h3>
        <div className="mt-4 space-y-3">
            {rows.map((row) => (
                <SplitInfoRow key={row[0][0]} items={row} />
            ))}
        </div>
    </section>
)

const FoodRefreshmentDetailsPanel = () => {
    return (
        <div className="w-[80%] max-h-[calc(100vh-150px)] overflow-auto table-custom-scrollbar rounded-lg border border-[#27334c] bg-[#151d31] p-5">
            <h2 className="text-lg font-medium text-[#8F5BFF]">Food & Refreshment Details</h2>
            <p className="mt-1 text-xs leading-5 text-[#CBC3D7]/50">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
            </p>

            <div className="mt-6 space-y-5">
                {foodSummaryRows.map((row) => (
                    <SplitInfoRow key={row[0][0]} items={row} />
                ))}

                {mealSections.map((meal) => (
                    <MealSection key={meal.title} {...meal} />
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

export default FoodRefreshmentDetailsPanel
