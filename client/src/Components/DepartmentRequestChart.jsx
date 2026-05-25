import React from 'react'
import { Filter } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

const DepartmentRequestChart = ({
    data,
    title = 'Events By Department',
    className = 'col-span-5',
}) => (
    <section className={`rounded-lg border border-[#2a3347] bg-[#151c2c] p-4 ${className}`}>
        <div className="flex items-center gap-3 justify-between">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button className="flex items-center gap-2 rounded-md border border-[#343b4a] bg-[#232A3C] px-3 py-2 text-xs text-white">
                <Filter size={12} />
                Filters
            </button>
        </div>
        <div className="mt-6 grid h-[300px] grid-cols-[minmax(0,1fr)_150px] items-center gap-4">
            <div className="h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} dataKey="value" nameKey="name" innerRadius={78} outerRadius={118} paddingAngle={2} stroke="none" isAnimationActive={false}>
                            {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="max-h-[300px] space-y-5 overflow-y-auto pr-1 table-custom-scrollbar">
                {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-3 text-sm font-semibold text-white">
                        <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: item.color }} />
                        {item.name}
                    </div>
                ))}
            </div>
        </div>
    </section>
)

export default DepartmentRequestChart
