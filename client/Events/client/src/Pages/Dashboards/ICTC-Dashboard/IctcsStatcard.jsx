import React from 'react'
import {
    CalendarRange,
    Check,
    Hourglass,
} from 'lucide-react'
import calendarFill from '../../../assets/calendarFill.svg'
import hourglassFill from '../../../assets/hourglassFill.svg'
import tick from '../../../assets/tick.svg'
import pattern from '../../../assets/pattern.svg'
import circleTick from '../../../assets/circle-tick.svg'
const data = [
    {
        lable: 'Total Events',
        value: 50,
        icon: calendarFill,
        bgColor: 'bg-gradient-to-r from-[#241d43] to-[#3d196b]',
        sideColor: 'bg-[#654ec3]',
        iconBg: 'bg-[#b89aff]',
    },
    {
        lable: 'Acknowledged Events',
        value: 50,
        icon: tick,
        bgColor: 'bg-gradient-to-r from-[#171d3b] to-[#1b196c]',
        sideColor: 'bg-[#6871ce]',
        iconBg: 'bg-[#818cf8]',
    },
    {
        lable: 'Completed Events',

        value: 50,
        icon: circleTick,

        bgColor: 'bg-gradient-to-r from-[#162d36] to-[#146147]',
        sideColor: 'bg-[#08805e]',
        iconBg: 'bg-[#34d399]',

    },
    {
        lable: 'Pending Acknowledgements',
        value: 50,
        icon: hourglassFill,
        bgColor: 'bg-gradient-to-r from-[#261e35] to-[#591941]',
        sideColor: 'bg-[#b6256a]',
      
        iconBg: 'bg-[#ff78a8]',
    },
]


const IctcsStatcard = () => {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {data.map((item, index) => (
                <div
                    className={`card relative h-20 overflow-hidden rounded-lg flex ${item.bgColor} w-full`}
                    key={index}
                >
                    <img src={pattern} className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10" />
                    <div className={`side-box relative ${item.sideColor} h-full w-2 rounded-l-lg`} />

                    <div className="first-cotent-container relative flex h-fit items-start w-full justify-between px-4 mt-2">
                        <div>
                            <h1 className="text-white text-sm font-medium">{item.lable}</h1>
                            <h1 className="text-white text-lg font-semibold">{item.value}</h1>
                        </div>

                        <div
                            className={`icon-container flex items-center w-8 h-8 rounded-lg justify-center ${item.iconBg} mt-1`}
                        >
                            {/* <item.icon size={18} className="text-white" /> */}
                            <img src={item.icon} className="" />
                        </div>
                    </div>
                </div>
            ))}
        </section>
    )
}

export default IctcsStatcard
