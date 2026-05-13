import { Pencil, Trash2, MapPin, Info } from "lucide-react";
import infoIcon from '../../../assets/info.svg'
export default function VenueCard({ venues = [] }) {
    return (
        <div className="grid grid-cols-3 gap-4 mt-4 max-h-[calc(100vh-240px)] overflow-auto table-custom-scrollbar pr-2">
            {venues.map((venue, index) => (
                <div
                    key={index}
                    className="bg-[#171F31] hover:bg-[#121724a1] transition-all duration-300 rounded-xl p-4 border border-gray-700"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="first-container">
                            <div className="flex items-center gap-3">
                                <h2 className="text-white text-lg font-medium">{venue.name}</h2>
                                <img src={infoIcon} className="Info translate-y-[3px]" />
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
                                <MapPin size={13} className="text-gray-500" />
                                <span>{venue.location}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="w-8 h-8 rounded-lg bg-[#2a2d3e] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#32354a] transition-colors">
                                <Pencil size={14} />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-[#2a2d3e] flex items-center justify-center text-gray-400 hover:text-rose-400 hover:bg-[#32354a] transition-colors">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>



                    {/* Stats Grid - Row 1 */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <StatBox label="CAPACITY" value={venue.capacity} />
                        <StatBox label="WITH PROCTORING" value={venue.withProctoring} />
                        <StatBox label="WITHOUT PROCTORING" value={venue.withoutProctoring} />
                    </div>

                    {/* Stats Row 2 */}
                    <div className="bg-[#232A3B]/30 border border-[#2a2d3e] rounded-xl grid grid-cols-4 overflow-hidden">

                        <StatItem
                            label="COLLAR MIC"
                            value={venue.collarMic}
                        />

                        <StatItem
                            label="HAND MIC"
                            value={venue.handMic}
                            border
                        />

                        <StatItem
                            label="HAND SPEAKER"
                            value={venue.handSpeaker}
                            border
                        />

                        <StatItem
                            label="PODIUM WITH MIC"
                            value={venue.podiumWithMic}
                            border
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

function StatBox({ label, value }) {
    return (
        <div className="bg-[#232A3B]/30 rounded-lg p-2 border border-[#2a2d3e]">
            <p className="text-[9px] font-  text-[#ffffff]/60 uppercase whitespace-nowrap">
                {label}
            </p>
            <p className="text-white text-[13px] font-medium mt-1">{value}</p>
        </div>
    );
}

function StatItem({ label, value, border }) {
    return (
        <div
            className={`p-3 ${border ? "border-l border-[#3a4154]" : ""
                }`}
        >
            <p className="text-[9px] text-white/60 uppercase whitespace-nowrap">
                {label}
            </p>

            <p className="text-white text-[13px] font-medium mt-1">
                {value}
            </p>
        </div>
    );
}