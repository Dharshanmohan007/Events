import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const departmentData = [
  { name: 'CSE', value: 25, color: '#74b9ff' },
  { name: 'AIML', value: 55, color: '#159283' },
  { name: 'EEE', value: 12, color: '#68df85' },
  { name: 'VLSI', value: 8, color: '#4169e1' },
]

const IctcsEventsByDepartmentPiechart = () => {
  return (
    <section className="w-[30%] rounded-lg border border-[#2a3347] bg-[#151c2c] p-5">
      <h2 className="text-white text-base font-semibold">
        Events By Department
      </h2>

      <div className="mt-5 h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={departmentData}
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
              {departmentData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-center gap-6">
        {departmentData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-semibold text-white">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default IctcsEventsByDepartmentPiechart
