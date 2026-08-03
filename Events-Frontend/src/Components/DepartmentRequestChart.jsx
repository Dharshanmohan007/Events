import React, { useState, useEffect } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sece-events.onrender.com'

const COLORS = [
    '#74b9ff', '#159283', '#68df85', '#4169e1', '#a29bfe',
    '#fd79a8', '#fdcb6e', '#e17055', '#00cec9', '#6c5ce7',
    '#0984e3', '#d63031', '#e84393', '#55efc4', '#ffeaa7',
]

const mapDepartmentData = (departmentWise = []) =>
    departmentWise.map((item, index) => ({
        name: item.department ?? item.name,
        value: item.count ?? item.value ?? 0,
        color: item.color ?? COLORS[index % COLORS.length],
    }))

const DepartmentRequestChart = ({
    module,
    title = 'Events By Department',
    className = 'col-span-5',
}) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let isMounted = true

        const fetchDepartmentData = async () => {
            setLoading(true)
            setError('')
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(
                    `${API_BASE_URL}/api/dashboard/department-wise?module=${encodeURIComponent(module)}`,
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
                )
                if (!res.ok) throw new Error('Failed to fetch department-wise data')
                const responseData = await res.json()
                if (!isMounted) return
                setData(mapDepartmentData(responseData?.departmentWise))
            } catch (err) {
                console.warn(err.message)
                if (isMounted) setError(err.message)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchDepartmentData()

        return () => {
            isMounted = false
        }
    }, [module])

    return (
        <section className={`rounded-lg border border-[#2a3347] bg-[#151c2c] p-4 ${className}`}>
            <div className="flex items-center gap-3 justify-between">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
            </div>
            {loading ? (
                <div className="mt-6 flex h-[300px] items-center justify-center">
                    <p className="text-sm text-[#CBC3D7]/65">Loading department data...</p>
                </div>
            ) : error ? (
                <div className="mt-6 flex h-[300px] items-center justify-center">
                    <p className="text-sm text-[#FF4F91]">Failed to load department data</p>
                </div>
            ) : data.length === 0 ? (
                <div className="mt-6 flex h-[300px] items-center justify-center">
                    <p className="text-sm text-[#CBC3D7]/65">No department data available</p>
                </div>
            ) : (
                <div className="mt-6 grid h-[300px] grid-cols-[minmax(0,1fr)_150px] items-center gap-4">
                    <div className="h-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={data} dataKey="value" nameKey="name" innerRadius={78} outerRadius={118} paddingAngle={2} stroke="none" isAnimationActive={false}>
                                    {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#151c2c', border: '1px solid #2a3347', borderRadius: 8 }} itemStyle={{ color: '#fff' }} labelStyle={{ color: '#fff' }} />
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
            )}
        </section>
    )
}

export default DepartmentRequestChart
