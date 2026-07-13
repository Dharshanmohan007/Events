import React, { useEffect, useMemo, useState } from 'react'
import pattern from '../../../assets/pattern.svg'
import calendarFill from '../../../assets/calendarFill.svg'
import hourglassFill from '../../../assets/hourglassFill.svg'
import tick from '../../../assets/tick.svg'
import circleTick from '../../../assets/circle-tick.svg'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sece-events.onrender.com'

const applyEventStats = (sections, eventStats) => {
    if (!eventStats) return sections

    return sections.map((section) => {
        if (section.title !== 'Event Request') return section

        return {
            ...section,
            stats: section.stats.map((item) => {
                const label = item.label.toLowerCase()

                if (label.includes('total')) {
                    return { ...item, value: eventStats.total ?? item.value }
                }

                if (label.includes('approved')) {
                    return { ...item, value: eventStats.approved ?? item.value }
                }

                if (label.includes('completed')) {
                    return { ...item, value: eventStats.completed ?? item.value }
                }

                if (label.includes('pending')) {
                    return { ...item, value: eventStats.pending ?? item.value }
                }

                return item
            }),
        }
    })
}

const AdminStatcard = ({ data }) => {
    const [eventStats, setEventStats] = useState(null)

    useEffect(() => {
        let isMounted = true
        const token = localStorage.getItem('token')

        fetch(`${API_BASE_URL}/api/dashboard/stats?module=admin`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch admin dashboard stats')
                }
                return response.json()
            })
            .then((responseData) => {
                if (isMounted) {
                    setEventStats(responseData.events)
                }
            })
            .catch((error) => {
                console.warn(error.message)
            })

        return () => {
            isMounted = false
        }
    }, [])

    const displayData = useMemo(() => applyEventStats(data, eventStats), [data, eventStats])

    return (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            {displayData.map((section, idx) => (
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
                                    <img src={item.icon} className="w-4 h-4" />
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
