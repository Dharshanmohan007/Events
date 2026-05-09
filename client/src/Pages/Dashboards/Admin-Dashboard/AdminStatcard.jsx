import React from 'react'
import pattern from '../../../assets/pattern.svg'
import calendarFill from '../../../assets/calendarFill.svg'
import hourglassFill from '../../../assets/hourglassFill.svg'
import tick from '../../../assets/tick.svg'
import circleTick from '../../../assets/circle-tick.svg'

const AdminStatcard = ({ data }) => {
    return (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            {data.map((section, idx) => (
                <div
                    key={idx}
                    className="rounded-lg border border-[#263044] bg-[#141b2b] p-4"
                >
                    <h2 className="text-white font-medium mb-4">
                        {section.title}
                    </h2>

                    <div className="grid grid-cols-2 gap-4">
                        {section.stats.map((item, i) => (
                            <div
                                key={i}
                                className={`relative rounded-lg p-3 text-white bg-gradient-to-r ${item.bgColor}`}
                            >
                                <p className="text-xs opacity-80">
                                    {item.label}
                                </p>

                                <p className="text-lg font-semibold mt-1">
                                    {item.value}
                                </p>

                                <div className={`absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md ${item.iconBg}`}>
                                    <img src={item.icon} alt="" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
};

export default AdminStatcard