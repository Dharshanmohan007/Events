import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { clampRating, formatRelativeTime } from '../api/feedbackApi'

const defaultFeedbackRows = Array.from({ length: 13 }, () => ({
    name: 'Dr. Sarah Jenkins',
    department: 'Dept. of Computer Science',
    quote: '"The event service exceeded expectations. The team captured the technical essence perfectly with modern aesthetics."',
    time: '2 HOURS AGO',
    rating: 5,
}))

// First letter of the displayed name, with a safe fallback (E).
const getInitial = (name) => {
    const first = String(name || '').trim().charAt(0)
    return first ? first.toUpperCase() : 'E'
}

const FeedbackRatings = ({
    rows = defaultFeedbackRows,
    individualRows = defaultFeedbackRows,
    feedbackLink,
    className = 'col-span-7',
    tabs = false,
}) => {
    const [activeTab, setActiveTab] = useState('events')
    const displayedRows = tabs ? (activeTab === 'events' ? rows : individualRows) : rows

    const content = (
        <span className="text-sm font-semibold text-[#8B3DFF]">View All -&gt;</span>
    )

    return (
        <section className={`rounded-lg border h-[calc(100vh-190px)] table-custom-scrollbar overflow-auto border-[#2a3347] bg-[#151c2c] ${className}`}>
            <div className="flex items-center justify-between sticky top-0 z-10 bg-[#151c2c] p-4">
                <h2 className="text-lg font-semibold text-white">Latest Feedback & Ratings</h2>
                <div className="flex items-center gap-3">
                    {tabs && (
                        <nav
                            className="flex rounded-md bg-[#1b2335] p-0.5"
                            aria-label="Feedback type tabs"
                        >
                            <button
                                type="button"
                                onClick={() => setActiveTab('events')}
                                className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                                    activeTab === 'events'
                                        ? 'bg-[#8B3DFF] text-white shadow-sm'
                                        : 'text-[#8b93a7] hover:text-white'
                                }`}
                            >
                                Events
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('individual')}
                                className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                                    activeTab === 'individual'
                                        ? 'bg-[#8B3DFF] text-white shadow-sm'
                                        : 'text-[#8b93a7] hover:text-white'
                                }`}
                            >
                                Individual
                            </button>
                        </nav>
                    )}
                    {feedbackLink ? (
                        <Link to={feedbackLink}>
                            {content}
                        </Link>
                    ) : (
                        <button type="button">
                            {content}
                        </button>
                    )}
                </div>
            </div>
            {displayedRows.length === 0 ? (
                <p className="py-10 text-center text-sm text-[#CBC3D7]/65">No feedback available yet.</p>
            ) : (
                <div className="mt-4 space-y-3 px-4">
                    {displayedRows.map((feedback, index) => (
                        <article key={index} className="rounded-md border border-[#2a3347] bg-[#20283A] p-2">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8B3DFF]/20 text-sm font-semibold text-[#D0BCFF]">
                                        {getInitial(feedback.name)}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-[#DDE3F2]">{feedback.name}</p>
                                        <p className="text-xs text-[#FFFFFF66]">{feedback.department}</p>
                                    </div>
                                </div>
                                <div className="flex text-[#FFC107]">
                                    {Array.from({ length: clampRating(feedback.rating) }, (_, starIndex) => (
                                        <Star key={starIndex} size={15} fill="currentColor" />
                                    ))}
                                </div>
                            </div>
                            <p className="mt-2 text-xs italic leading-5 text-[#DDE3F2]/85">{feedback.quote}</p>
                            <p className="mt-2 text-right text-[10px] text-[#FFFFFF66]">
                                {feedback.time || formatRelativeTime(feedback.submittedAt)}
                            </p>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

export default FeedbackRatings
