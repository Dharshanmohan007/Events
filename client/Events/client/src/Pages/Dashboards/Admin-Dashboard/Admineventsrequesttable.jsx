import { Calendar, ExternalLink, Filter, ListFilter, Search } from "lucide-react";
import { useState } from "react";

const eventsData = [
    { id: 1, eventName: "Welcome Freshers", eventType: "Seminar", eventVenue: "Main Board Room", eventDate: "15-03-2026", department: "CSE", approvedStatus: "Approved", acknowledgementStatus: "Acknowledged" },
    { id: 2, eventName: "Welcome Freshers", eventType: "Seminar", eventVenue: "Main Board Room", eventDate: "15-03-2026", department: "CSE", approvedStatus: "Pending Approval", acknowledgementStatus: "Pending Approval" },
    { id: 3, eventName: "Welcome Freshers", eventType: "Seminar", eventVenue: "Main Board Room", eventDate: "15-03-2026", department: "CSE", approvedStatus: "Approved", acknowledgementStatus: "Acknowledged" },
    { id: 4, eventName: "Welcome Freshers", eventType: "Seminar", eventVenue: "Main Board Room", eventDate: "15-03-2026", department: "CSE", approvedStatus: "Pending Approval", acknowledgementStatus: "Pending Approval" },
    { id: 5, eventName: "Welcome Freshers", eventType: "Seminar", eventVenue: "Main Board Room", eventDate: "15-03-2026", department: "CSE", approvedStatus: "Approved", acknowledgementStatus: "Acknowledged" },
    { id: 6, eventName: "Welcome Freshers", eventType: "Seminar", eventVenue: "Main Board Room", eventDate: "15-03-2026", department: "CSE", approvedStatus: "Approved", acknowledgementStatus: "Acknowledged" },
    { id: 7, eventName: "Welcome Freshers", eventType: "Seminar", eventVenue: "Main Board Room", eventDate: "15-03-2026", department: "CSE", approvedStatus: "Pending Approval", acknowledgementStatus: "Pending Approval" },
    { id: 8, eventName: "Welcome Freshers", eventType: "Seminar", eventVenue: "Main Board Room", eventDate: "15-03-2026", department: "CSE", approvedStatus: "Approved", acknowledgementStatus: "Acknowledged" },
    { id: 9, eventName: "Welcome Freshers", eventType: "Seminar", eventVenue: "Main Board Room", eventDate: "15-03-2026", department: "CSE", approvedStatus: "Pending Approval", acknowledgementStatus: "Pending Approval" },
];

const getStatusColor = (status = "") => {
    const normalizedStatus = String(status).toLowerCase();

    if (normalizedStatus.includes("rejected")) return { text: "text-red-400", dot: "bg-red-400" };
    if (normalizedStatus.includes("acknowledged")) return { text: "text-emerald-400", dot: "bg-emerald-400" };
    if (normalizedStatus.includes("approved")) return { text: "text-emerald-400", dot: "bg-emerald-400" };
    if (normalizedStatus.includes("pending")) return { text: "text-pink-600", dot: "bg-pink-600" };
    if (normalizedStatus.includes("submitted")) return { text: "text-yellow-400", dot: "bg-yellow-400" };
    return { text: "text-white", dot: "bg-white" };
};

const StatusBadge = ({ status }) => {
    const { text, dot } = getStatusColor(status);
    return (
        <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
            <span className={`text-sm font-medium ${text}`}>
                {status}
            </span>
        </span>
    );
};

const FilterChip = ({ icon, label, onRemove }) => (
    <button
        onClick={onRemove}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2a2d3e] border border-[#3a3d52] text-gray-300 text-sm hover:bg-[#32354a] transition-colors"
    >
        <span className="text-gray-400 text-xs">{icon}</span>
        <span>{label}</span>
        <span className="ml-1 text-gray-500 hover:text-gray-300">✕</span>
    </button>
);

export default function AdminEventsRequestTable() {
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        seminar: true,
        acknowledged: true,
        date: "15/03/2026",
    });

    const filteredData = eventsData.filter((event) => {
        const query = searchQuery.toLowerCase();
        return (
            event.eventName.toLowerCase().includes(query) ||
            event.eventVenue.toLowerCase().includes(query) ||
            event.department.toLowerCase().includes(query)
        );
    });

    const columns = [
        "EVENT NAME",
        "EVENT TYPE",
        "EVENT VENUE",
        "EVENT DATE",
        "DEPARTMENT",
        "APPROVED STATUS",
        "ACKNOWLEDGEMENT STATUS",
        "ACTION",
    ];

    return (
        <div className="bg-[#171F31] mt-4 border border-gray-800 rounded-xl py-4">
            <div className="max-w-full  ">
                {/* Toolbar */}
                <div className="flex items-center justify-end gap-3 mb-4 flex-wrap px-6">
                    {/* Search */}
                    <div className="search-bar flex items-center gap-2 border border-gray-700 py-2 px-4 rounded-full bg-[#232A3C]">
                        <Search size={16} className="text-gray-400" />
                        <input onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search events, venue" className="text-gray-300 bg-[#171F31] placeholder:text-gray-500 outline-none bg-[#232A3C]" />
                    </div>

                    {/* seminar filter  */}

                    <div className="filter-container border border-gray-700 rounded-lg flex items-center py-2 px-3 gap-3 bg-[#232A3C]">
                        <ListFilter size={16} className="text-gray-400" />
                        <p className="text-gray-300">Seminar</p>
                    </div>

                    {/* accnowledgement status filter */}
                    <div className="filter-container border border-gray-700 rounded-lg flex items-center py-2 px-3 gap-3 bg-[#232A3C]">
                        <ListFilter size={16} className="text-gray-400" />
                        <p className="text-gray-300">Acknowledged</p>
                    </div>

                    {/* calendar date filter */}
                    <div className="filter-container border border-gray-700 rounded-lg flex items-center py-2 px-3 gap-3 bg-[#232A3C]">
                        <Calendar size={16} className="text-gray-400" />
                        <p className="text-gray-300">15/03/2026</p>
                    </div>

                </div>

                {/* Table */}
                <div className="max-h-[calc(100vh-260px)] table-custom-scrollbar overflow-auto">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-[#1C2335]">
                            <tr className="border-b border-[#22253a] ">
                                {columns.map((col) => (
                                    <th
                                        key={col}
                                        className="px-5 py-3.5 text-left text-[11px] font-semibold tracking-widest text-gray-500 uppercase whitespace-nowrap"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((event, idx) => (
                                <tr
                                    key={event.id}
                                    className={`border-b border-[#1e2130] text-[#FFFFFF]/80 transition-colors hover:bg-[#1e2232] ${idx % 2 === 0 ? "" : ""
                                        }`}
                                >
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap">
                                        {event.eventName}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm  whitespace-nowrap">
                                        {event.eventType}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap">
                                        {event.eventVenue}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm whitespace-nowrap">
                                        {event.eventDate}
                                    </td>
                                    <td className="px-5 py-3.5 text-sm  whitespace-nowrap">
                                        {event.department}
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <StatusBadge status={event.approvedStatus} />
                                    </td>
                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                        <StatusBadge status={event.acknowledgementStatus} />
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <button
                                            className="text-gray-400 hover:text-white transition-colors text-lg"
                                            title="Open"
                                        >
                                            <ExternalLink size={17} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}