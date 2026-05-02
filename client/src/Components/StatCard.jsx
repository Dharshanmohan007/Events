import React from 'react'
import pattern from '../assets/pattern.svg'

const StatCard = ({ data }) => {
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
                            <img src={item.icon} className="" />
                        </div>
                    </div>
                </div>
            ))}
        </section>
    )
}

export default StatCard