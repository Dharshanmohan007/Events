import {
    CalendarRange,
    Check,
    Hourglass,
} from 'lucide-react'
import calendarFill from '../../assets/calendarFill.svg'
import hourglassFill from '../../assets/hourglassFill.svg'
import tick from '../../assets/tick.svg'

import React from 'react'

const data = [
    {
        lable: 'Total Events',
        value: 50,
        icon: calendarFill,
        bgColor: 'bg-gradient-to-r from-[#8b5cf6] to-[#8b5cf6]',
        sideColor: 'bg-[#b89aff]',
        iconBg: 'bg-[#b89aff]',
    },
    {
        lable: 'Acknowledged Events',
        value: 50,
        icon: tick,
        bgColor: 'bg-gradient-to-r from-[#3c3fbf] to-[#2252c3]',
        sideColor: 'bg-[#818cf8]',
        iconBg: 'bg-[#8ea2ff]',
    },
    {
        lable: 'Pending Acknowledgements',
        value: 50,
        icon: hourglassFill,
        bgColor: 'bg-gradient-to-r from-[#b22264] to-[#b61b42]',
        sideColor: 'bg-[#f472b6]',
        iconBg: 'bg-[#ff78a8]',
    },
    {
        lable: 'Completed Events',
        value: 50,
        icon: tick,
        bgColor: 'bg-gradient-to-r from-[#077c5e] to-[#0c7a73]',
        sideColor: 'bg-[#34d399]',
        iconBg: 'bg-[#34d399]',
    },
]


const IctcsStatcard = () => {
    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {data.map((item, index) => (
                <div
                    className={`card h-20 rounded-lg flex ${item.bgColor} w-full`}
                    key={index}
                >
                    <div className={`side-box ${item.sideColor} h-full w-2 rounded-l-lg`} />

                    <div className="first-cotent-container flex h-fit items-start w-full justify-between px-4 mt-2">
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
