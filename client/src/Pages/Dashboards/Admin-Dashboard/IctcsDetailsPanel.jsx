import React from 'react'
import { FileText } from 'lucide-react'

const basicRequirements = [
    ['Desktop', 'Yes'],
    ['Internet Facility', 'LAN'],
    ['Expected Internet Users', '20'],
    ['Total Number of Guest WIFI Count', '20'],
]

const objectRequirements = ['Chief Guest AV', 'Stage LED', 'Pointer', 'WebCam']

const RequirementCard = ({ title, children, className = '' }) => (
    <section className={`rounded-lg border border-[#374155] bg-[#232A3B] p-5 ${className}`}>
        <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#E6E2F0]">
            <FileText size={17} />
            {title}
        </div>
        {children}
    </section>
)

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

const TextList = ({ items }) => (
    <div>
        {items.map((item) => (
            <p key={item} className="border-b border-[#30384d]/60 py-3 text-sm font-medium text-[#E6E2F0] last:border-b-0">
                {item}
            </p>
        ))}
    </div>
)

const IctcsDetailsPanel = () => {
    return (
        <div className="w-[80%] max-h-[calc(100vh-150px)] overflow-auto table-custom-scrollbar rounded-lg border border-[#27334c] bg-[#151d31] p-5">
            <h2 className="text-lg font-medium text-[#8F5BFF]">ICTCS Details</h2>
            <p className="mt-1 text-xs leading-5 text-[#CBC3D7]/50">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
            </p>

            <div className="mt-8 grid grid-cols-2 gap-5">
                <RequirementCard title="Basic Requirement">
                    <KeyValueList items={basicRequirements} />
                </RequirementCard>

                <RequirementCard title="Object Requirement">
                    <TextList items={objectRequirements} />
                </RequirementCard>
            </div>

            <RequirementCard title="Special Requirement" className="mt-5">
                <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
                </p>
            </RequirementCard>
        </div>
    )
}

export default IctcsDetailsPanel
