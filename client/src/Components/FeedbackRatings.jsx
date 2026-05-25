import React from 'react'
import { Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import profileAvatar from '../assets/profile-avatar.svg'

const defaultFeedbackRows = Array.from({ length: 13 }, () => ({
    name: 'Dr. Sarah Jenkins',
    department: 'Dept. of Computer Science',
    quote: '"The event service exceeded expectations. The team captured the technical essence perfectly with modern aesthetics."',
    time: '2 HOURS AGO',
}))

const FeedbackRatings = ({
    rows = defaultFeedbackRows,
    feedbackLink,
    className = 'col-span-7',
}) => {
    const content = (
        <span className="text-sm font-semibold text-[#8B3DFF]">View All -&gt;</span>
    )

    return (
        <section className={`rounded-lg border h-[calc(100vh-190px)] table-custom-scrollbar overflow-auto border-[#2a3347] bg-[#151c2c] ${className}`}>
            <div className="flex items-center justify-between sticky top-0 z-10 bg-[#151c2c] p-4">
                <h2 className="text-lg font-semibold text-white">Latest Feedback & Ratings</h2>
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
            <div className="mt-4 space-y-3 px-4">
                {rows.map((feedback, index) => (
                    <article key={index} className="rounded-md border border-[#2a3347] bg-[#20283A] p-2">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <img src={profileAvatar} alt="" className="h-10 w-10 rounded-full" />
                                <div>
                                    <p className="text-xs font-medium text-[#DDE3F2]">{feedback.name}</p>
                                    <p className="text-xs text-[#FFFFFF66]">{feedback.department}</p>
                                </div>
                            </div>
                            <div className="flex text-[#FFC107]">
                                {Array.from({ length: feedback.rating || 5 }, (_, starIndex) => (
                                    <Star key={starIndex} size={15} fill="currentColor" />
                                ))}
                            </div>
                        </div>
                        <p className="mt-2 text-xs italic leading-5 text-[#DDE3F2]/85">{feedback.quote}</p>
                        <p className="mt-2 text-right text-[10px] text-[#FFFFFF66]">{feedback.time}</p>
                    </article>
                ))}
            </div>
        </section>
    )
}

export default FeedbackRatings
