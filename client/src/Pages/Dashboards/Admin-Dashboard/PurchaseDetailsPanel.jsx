import React from 'react'
import { FileText } from 'lucide-react'

const hardCopyDetails = [['Id Card Hard copy Quantity', '100'], ['Certificate Hard Copy Quantity', '100']]

const purchaseSections = [
    {
        title: 'Students',
        rows: [
            [['Basic Trophy Quantity', '01'], ['Elite Trophy Quantity', '02']],
            [['Cash Prize Amount', 'Rs. 5000'], ['Registration Kit Quantity', '50']],
            [['Voucher worth', 'Rs. 5000'], ['Voucher worth Quantity ( Rs 5000 )', '02']],
        ],
    },
    {
        title: 'Guest',
        rows: [
            [['Basic Trophy Quantity', '01'], ['Elite Trophy Quantity', '02']],
            [['Cash Prize Amount', 'Rs. 5000'], ['Registration Kit Quantity', '50']],
            [['Voucher worth', 'Rs. 5000'], ['Voucher worth Quantity ( Rs 5000 )', '02']],
        ],
    },
]

const specialRequirement =
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s'

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

const SpecialRequirement = () => (
    <section className="rounded-lg border border-[#465168] bg-[#232A3B] p-5">
        <div className="mb-4 flex items-center gap-2 text-base font-medium text-[#E6E2F0]">
            <FileText size={16} />
            Special Requirement
        </div>
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">{specialRequirement}</p>
    </section>
)

const PurchaseSection = ({ title, rows }) => (
    <section className="rounded-lg border border-[#465168] bg-[#1B2334] p-5">
        <h3 className="text-lg font-semibold text-[#8F5BFF]">{title}</h3>
        <div className="mt-5 space-y-4">
            {rows.map((row) => (
                <SplitInfoRow key={row[0][0]} items={row} />
            ))}
            <SpecialRequirement />
        </div>
    </section>
)

const PurchaseDetailsPanel = () => {
    return (
        <div className="w-[80%] max-h-[calc(100vh-150px)] overflow-auto table-custom-scrollbar rounded-lg border border-[#27334c] bg-[#151d31] p-5">
            <h2 className="text-lg font-medium text-[#8F5BFF]">Purchase Details</h2>
            <p className="mt-1 text-xs leading-5 text-[#CBC3D7]/50">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
            </p>

            <div className="mt-6 space-y-6">
                <SplitInfoRow items={hardCopyDetails} />
                {purchaseSections.map((section) => (
                    <PurchaseSection key={section.title} {...section} />
                ))}
            </div>
        </div>
    )
}

export default PurchaseDetailsPanel
