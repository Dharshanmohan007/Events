import React, { useEffect, useMemo, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://sece-events.onrender.com'

const EMPTY_STATS = {
    total: 0,
    approved: 0,
    completed: 0,
    pending: 0,
    rejected: 0,
}

const getDepartment = () => {
    try {
        const token = localStorage.getItem('token')
        return token ? jwtDecode(token).department || '' : ''
    } catch {
        return ''
    }
}

const applyEventStats = (sections, eventStats) => {
    const stats = eventStats ?? EMPTY_STATS

    return sections.map((section) => {
        if (section.title !== 'Event Request') return section

        return {
            ...section,
            stats: section.stats.map((item) => {
                const label = item.label.toLowerCase()

                if (label.includes('total')) {
                    return { ...item, value: stats.total ?? 0 }
                }

                if (label.includes('approved')) {
                    return { ...item, value: stats.approved ?? 0 }
                }

                if (label.includes('completed')) {
                    return { ...item, value: stats.completed ?? 0 }
                }

                if (label.includes('pending')) {
                    return { ...item, value: stats.pending ?? 0 }
                }

                return item
            }),
        }
    })
}

const applyIndividualStats = (sections, individualStats) => {
    const stats = individualStats ?? EMPTY_STATS

    return sections.map((section) => {
        if (section.title !== 'Individual Request') return section

        return {
            ...section,
            stats: section.stats.map((item) => {
                const label = item.label.toLowerCase()

                if (label.includes('total')) {
                    return { ...item, value: stats.total ?? 0 }
                }

                if (label.includes('approved')) {
                    return { ...item, value: stats.approved ?? 0 }
                }

                if (label.includes('completed')) {
                    return { ...item, value: stats.completed ?? 0 }
                }

                if (label.includes('pending')) {
                    return { ...item, value: stats.pending ?? 0 }
                }

                return item
            }),
        }
    })
}

const HodStatcard = ({ data }) => {
    const [eventStats, setEventStats] = useState(null)
    const [individualStats, setIndividualStats] = useState(null)

    useEffect(() => {
        let isMounted = true
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const department = getDepartment()

        fetch(`${API_BASE_URL}/api/dashboard/hod-stats?department=${encodeURIComponent(department)}`, { headers })
            .then((response) => response.ok ? response.json() : Promise.resolve({}))
            .then((eventData) => {
                if (isMounted) {
                    const stats = eventData?.data ?? {}
                    setEventStats({
                        total: stats.totalEvents ?? 0,
                        approved: stats.hodApprovedEvents ?? 0,
                        completed: stats.closedEvents ?? 0,
                        pending: stats.pendingEvents ?? 0,
                    })
                }
            })
            .catch((error) => {
                console.warn(error.message)
            })

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        let isMounted = true
        const token = localStorage.getItem('token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}

        fetch(`${API_BASE_URL}/api/dashboard/individual-department-wise-stats`, { headers })
            .then((response) => response.ok ? response.json() : Promise.resolve({}))
            .then((responseData) => {
                if (isMounted) {
                    const overall = responseData?.overall ?? {}
                    setIndividualStats({
                        total: overall.total ?? 0,
                        approved: overall.approved ?? 0,
                        completed: overall.completed ?? 0,
                        pending: overall.pending ?? 0,
                    })
                }
            })
            .catch((error) => {
                console.warn(error.message)
            })

        return () => {
            isMounted = false
        }
    }, [])

    const displayData = useMemo(() => {
        const withEventStats = applyEventStats(data, eventStats)
        return applyIndividualStats(withEventStats, individualStats)
    }, [data, eventStats, individualStats])

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

export default HodStatcard
