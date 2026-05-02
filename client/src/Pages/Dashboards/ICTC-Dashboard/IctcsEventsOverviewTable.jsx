import { Calendar, ExternalLink, ListFilter, Search } from "lucide-react";

const events = [
    {
        id: 1,
        name: "Welcome Freshers",
        type: "Seminar",
        dateTime: "15-03-2024 / 09:00AM - 12:00PM",
        venue: "Main Board Room",
        department: "CSE",
        facility: "LAN",
        status: "Acknowledged",
    },
    {
        id: 2,
        name: "Welcome Freshers",
        type: "Seminar",
        dateTime: "15-03-2024 / 09:00AM - 12:00PM",
        venue: "Viras Hall",
        department: "CSE",
        facility: "WiFi",
        status: "Pending Acknowledge",
    },
    {
        id: 3,
        name: "Welcome Freshers",
        type: "Seminar",
        dateTime: "15-02-2024 / 02:00PM - 11:00PM",
        venue: "Viras Hall",
        department: "CSE",
        facility: "WiFi",
        status: "Acknowledged",
    },
    {
        id: 4,
        name: "Welcome Freshers",
        type: "Seminar",
        dateTime: "11-03-2024 / 09:00AM - 12:00PM",
        venue: "Viras Hall",
        department: "CSE",
        facility: "WiFi",
        status: "Pending Acknowledge",
    },
    {
        id: 5,
        name: "Welcome Freshers",
        type: "Seminar",
        dateTime: "15-03-2024 / 09:00AM - 12:00PM",
        venue: "Viras Hall",
        department: "CSE",
        facility: "WiFi",
        status: "Acknowledged",
    },
    {
        id: 6,
        name: "Welcome Freshers",
        type: "Seminar",
        dateTime: "15-03-2024 / 02:00PM - 11:00PM",
        venue: "Viras Hall",
        department: "CSE",
        facility: "WiFi",
        status: "Pending Acknowledge",
    },
    {
        id: 7,
        name: "Welcome Freshers",
        type: "Seminar",
        dateTime: "15-03-2024 / 09:00AM - 12:00PM",
        venue: "Viras Hall",
        department: "CSE",
        facility: "WiFi",
        status: "Acknowledged",
    },
    {
        id: 8,
        name: "Welcome Freshers",
        type: "Seminar",
        dateTime: "15-03-2024 / 09:00AM - 12:00PM",
        venue: "Viras Hall",
        department: "CSE",
        facility: "WiFi",
        status: "Acknowledged",
    },
    {
        id: 9,
        name: "Welcome Freshers",
        type: "Seminar",
        dateTime: "16-03-2024 / 08:00AM - 12:00PM",
        venue: "Viras Hall",
        department: "CSE",
        facility: "WiFi",
        status: "Acknowledged",
    },
    {
        id: 10,
        name: "Welcome Freshers",
        type: "Seminar",
        dateTime: "15-03-2024 / 08:00AM - 11:00PM",
        venue: "Viras Hall",
        department: "CSE",
        facility: "WiFi",
        status: "Acknowledged",
    },
];

const columns = [
    "Event Name",
    "Event Type",
    "Event Date & Time",
    "Event Venue",
    "Department",
    "Internet Facility",
    "Acknowledge Status",
    "Action",
];

function SearchIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-3 w-3 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-3 w-3 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3M5 11h14M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
            />
        </svg>
    );
}

function ExternalLinkIcon() {
    return (
        <svg
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H18m0 0v4.5M18 6l-7.5 7.5M10 6H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3"
            />
        </svg>
    );
}

function ToolbarButton({ children }) {
    return (
        <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#2a344a] bg-[#182234] px-3 text-[11px] font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:border-[#3a465e] hover:bg-[#1d2940]"
        >
            {children}
        </button>
    );
}

function StatusLabel({ status }) {
    const acknowledged = status === "Acknowledged";

    return (
        <span
            className={`inline-flex items-center gap-1.5 text-[12px]  ${acknowledged ? "text-[#34D399]" : "text-[#B32058]"
                }`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${acknowledged ? "bg-[#34D399]" : "bg-[#B32058]"
                    }`}
            />
            {status}
        </span>
    );
}

export default function IctcsEventsOverviewTable() {
    return (
        <section className="h-full w-full overflow-auto rounded-lg border border-[#202b3d] bg-[#171f31] table-custom-scrollbar">
            <div className="sticky top-0 z-30 flex min-w-[1180px] items-center justify-end gap-2 border-b border-[#202b3d] bg-[#171f31] px-4 py-4 ">
                <label className="relative block ">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                        <Search size="18" className="text-gray-400" />
                    </span>
                    <input
                        type="search"
                        placeholder="Search events, venues"
                        className="w-[290px] rounded-full border border-[#383e4e] bg-[#232a3b] pl-8 pr-3 py-2.5 text-[14px] text-white outline-none placeholder:text-slate-500 focus:border-[#43516a]"
                    />
                </label>

                <button className="flex items-center text-[#DAE2FD] text-sm border border-[#383e4e] bg-[#232a3b] px-3 py-2 rounded-xl gap-2 "><ListFilter size={16} />Seminar</button>
                <button className="flex items-center text-[#DAE2FD] text-sm border border-[#383e4e] bg-[#232a3b] px-3 py-2 rounded-xl gap-2 "><ListFilter size={16} />Acknowledged</button>
                <button className="flex items-center text-[#DAE2FD] text-sm border border-[#383e4e] bg-[#232a3b] px-3 py-2 rounded-xl gap-2 "><Calendar size={16} />15/03/2026</button>

            </div>

            <table className="w-full min-w-[1180px] border-collapse text-left">
                <thead className="sticky top-19 ">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column}
                                className="sticky top-[52px] z-20 border-b border-[#202b3d] bg-[#1c2335] px-4 py-2.5 text-[12px] font-bold uppercase tracking-[0.03em] text-[#767a85]"
                            >
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {events.map((event) => (
                        <tr
                            key={event.id}
                            className="border-b border-[#1b2638] text-[12px] font-semibold text-[#ffffff] last:border-b-0 hover:bg-[#172235]"
                        >
                            <td className="whitespace-nowrap px-4 py-4 ">{event.name}</td>
                            <td className="whitespace-nowrap px-4 py-4">{event.type}</td>
                            <td className="whitespace-nowrap px-4 py-4">
                                {event.dateTime}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">{event.venue}</td>
                            <td className="whitespace-nowrap px-4 py-4">
                                {event.department}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                                {event.facility}
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                                <StatusLabel status={event.status} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                                <button className="flex items-center justify-center w-full">

                                    <ExternalLink size={18} className="text-[#8a8e97] hover:text-white" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </section>
    );
}
