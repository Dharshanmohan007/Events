import React, { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { SlidersHorizontal } from 'lucide-react'

const MediaDepartmentPieChart = ({ data, title = "Event Media Request By Department" }) => {
    const [selectedFilter, setSelectedFilter] = useState('All')

    const filterOptions = ['All', 'Photography', 'Videography', 'Live Streaming', 'Graphic Design']

    const filteredData = selectedFilter === 'All' 
        ? data 
        : data.filter(item => item.type === selectedFilter || item.type === undefined)

    return (
        <section className="w-[30%] rounded-lg border border-[#2a3347] bg-[#151c2c] p-5">
            <div className="">
                <h2 className="text-white text-base font-medium whitespace-nowrap">
                    {title}
                </h2>
                
                <div className="relative">
                    <select 
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value)}
                        className="bg-[#1b2335] text-[#8b93a7] text-xs px-3 py-2 rounded-md border border-[#2a3347] focus:outline-none focus:border-[#853FF9] appearance-none cursor-pointer pr-8"
                    >
                        {filterOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                    {/* <SlidersHorizontal 
                        size={13} 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#8b93a7] pointer-events-none" 
                    /> */}
                </div>
            </div>

            <div className="mt-5 h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={filteredData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="45%"
                            innerRadius={62}
                            outerRadius={105}
                            paddingAngle={2}
                            stroke="none"
                            isAnimationActive={false}
                        >
                            {filteredData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center justify-center gap-6 pb-2  overflow-auto">
                {filteredData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <span
                            className="h-3 w-3 rounded-sm"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs font-semibold text-white whitespace-nowrap">
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default MediaDepartmentPieChart