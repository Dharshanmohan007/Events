import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sece-events.onrender.com'

const COLORS = [
    '#74b9ff', '#159283', '#68df85', '#4169e1', '#a29bfe',
    '#fd79a8', '#fdcb6e', '#e17055', '#00cec9', '#6c5ce7',
    '#0984e3', '#d63031', '#e84393', '#55efc4', '#ffeaa7',
]

const mapDepartmentData = (departmentWise = []) => (
    departmentWise.map((item, index) => ({
        name: item.department ?? item.name,
        value: item.count ?? item.value ?? 0,
        color: item.color ?? COLORS[index % COLORS.length],
    }))
)

const AdminDepartmentPieChart = ({ data: propData, title = "Events By Department" }) => {
    const [data, setData] = useState(propData ? mapDepartmentData(propData) : [])

    useEffect(() => {
        if (propData) {
            setData(mapDepartmentData(propData))
            return
        }

        let isMounted = true
        const token = localStorage.getItem('token')

        fetch(`${API_BASE_URL}/api/dashboard/department-wise`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch department-wise data')
                return res.json()
            })
            .then((responseData) => {
                if (!isMounted) return
                const departmentWise = responseData.departmentWise || []
                setData(mapDepartmentData(departmentWise))
            })
            .catch((err) => {
                console.warn(err.message)
            })

        return () => {
            isMounted = false
        }
    }, [propData])

    return (
        <section className="w-[25%] rounded-lg border border-[#2a3347] bg-[#171f31] p-5">
            <h2 className="text-white text-base font-semibold">
                {title}
            </h2>

            <div className="mt-5 h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
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
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-2 flex items-center flex-wrap justify-center gap-6 w-[90%] overflow-auto table-custom-scrollbar">
                {data.map((item) => (
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

export default AdminDepartmentPieChart
