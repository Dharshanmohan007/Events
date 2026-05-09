import React from 'react'

const AdminBarChart = () => {
    return (
        <>
            <section className="w-full bg-[#171f31] rounded-lg mt-4 p-4">
                <h2 className="text-white text-base font-medium ">
                    Faculty By Department
                </h2>

                {/* chart  */}
                <div className="chart-contaner">
                    <div className="flex flex-col items-center justify-end h-64 w-20  rounded-md px-2 py-3">

                        {/* Value */}
                        <span className="text-white text-xs mb-2">215</span>

                        {/* Bar container */}
                        <div className="relative w-12 h-full flex items-end">

                            {/* Main bar */}
                            <div className="w-full h-full bg-gradient-to-b from-[#192c4a] to-[#0b1f3a] rounded-md flex items-end overflow-hidden">

                                {/* Bottom highlight fill */}
                                <div className="w-full h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-md"></div>

                            </div>

                            
                        </div>

                        {/* Label */}
                        <span className="text-gray-300 text-xs mt-2">CSE</span>
                    </div>
                </div>
            </section>
        </>
    )
}

export default AdminBarChart