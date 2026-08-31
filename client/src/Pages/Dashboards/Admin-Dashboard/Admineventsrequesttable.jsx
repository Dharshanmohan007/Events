import { ExternalLink, ListFilter, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import ThemedDatePicker from "../../../Components/ThemedDatePicker";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";
const EVENT_REQUEST_URL = `${API_BASE_URL}/api/table/dashboard-table?module=admin`;
const INDIVIDUAL_REQUEST_URL = `${API_BASE_URL}/api/individual-submissions`;

const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const toDateKey = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (!Number.isNaN(date.getTime())) {
        return date.toISOString().slice(0, 10);
    }

    const parts = dateValue.split(/[-/]/);
    if (parts.length !== 3) return dateValue;

    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const normalizeEventRequest = (event) => ({
    id: event.eventId || event.id,
    eventName: event.eventName || "-",
    eventType: event.eventType || "-",
    venues: Array.isArray(event.venues)
        ? event.venues
        : [event.eventVenue || event.venue].filter(Boolean),
    dates: Array.isArray(event.dates)
        ? event.dates.map(formatDate)
        : [event.eventDate || event.requiredDate].filter(Boolean).map(formatDate),
    dateKeys: Array.isArray(event.dates)
        ? event.dates.map(toDateKey)
        : [event.eventDate || event.requiredDate].filter(Boolean).map(toDateKey),
    department: event.organizingDepartment || event.department || "-",
    approvedStatus: event.adminApproval ? "Approved" : "Pending",
    eventStatus: event.overallStatus || event.eventStatus || "-",
});

const normalizeIndividualRequest = (request) => ({
    id: request.id,
    organizerName: request.employee || "-",
    organizerEmail: request.employeeEmail || "-",
    eventType: request.formType || "-",
    date: request.createdAt ? formatDate(request.createdAt) : "-",
    dateKeys: request.createdAt ? [toDateKey(request.createdAt)] : [],
    status: typeof request.status === "string" ? request.status : "-",
});

const getStatusColor = (status = "") => {
    const normalizedStatus = String(status).toLowerCase();

    if (normalizedStatus.includes("rejected")) return { text: "text-red-400", dot: "bg-red-400" };
    if (normalizedStatus.includes("acknowledged")) return { text: "text-emerald-400", dot: "bg-emerald-400" };
    if (normalizedStatus.includes("approved")) return { text: "text-emerald-400", dot: "bg-emerald-400" };
    if (normalizedStatus.includes("pending")) return { text: "text-pink-600", dot: "bg-pink-600" };
    if (normalizedStatus.includes("submitted")) return { text: "text-yellow-400", dot: "bg-yellow-400" };
    if (normalizedStatus.includes("completed")) return { text: "text-emerald-400", dot: "bg-emerald-400" };
    return { text: "text-white", dot: "bg-white" };
};

const getEventStatusClassName = (status = "") => getStatusColor(status).text;

const StatusBadge = ({ status, className }) => {
    const colorClass = className || getStatusColor(status).text;
    const dotClass = colorClass.replace("text-", "bg-");

    return (
        <span className={`inline-flex items-center gap-2 ${colorClass}`}>
            <span className={`h-2 w-2 rounded-full ${dotClass}`} />
            {status}
        </span>
    );
};

const MultiValueCell = ({ values }) => {
    const [isHovered, setIsHovered] = useState(false);
    const list = values?.length ? values : ["-"];
    const remainingItems = list.slice(1);

    if (remainingItems.length === 0) {
        return <span className="whitespace-nowrap">{list[0]}</span>;
    }

    return (
        <div
            className="relative inline-flex items-center gap-1.5"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className="whitespace-nowrap">{list[0]}</span>
            <span className="cursor-pointer text-xs font-medium text-[#853FF9] hover:text-[#a76df9]">
                +{remainingItems.length}
            </span>
            {isHovered && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsHovered(false)} />
                    <div className="absolute left-full z-50 mb-2 min-w-[180px] rounded-lg border border-[#374155] bg-[#1B2334] p-3 shadow-xl">
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
                            Details
                        </p>
                        {remainingItems.map((value, index) => (
                            <p key={`${value}-${index}`} className="py-0.5 text-sm text-white">
                                {value}
                            </p>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const getFilteredDateValues = (values, dateKeys, selectedDateKey) => {
    if (!selectedDateKey) return values;

    const selectedDateIndex = dateKeys.findIndex((dateKey) => dateKey === selectedDateKey);
    if (selectedDateIndex <= 0) return values;

    return [
        values[selectedDateIndex],
        ...values.slice(0, selectedDateIndex),
        ...values.slice(selectedDateIndex + 1),
    ];
};

const SelectFilter = ({ icon, value, onChange, options, ariaLabel }) => (
    <div className="filter-container border border-[#343b4a] rounded-lg flex items-center py-2 px-3 gap-2 bg-[#232A3C]">
        {icon}
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label={ariaLabel}
            className="bg-transparent text-xs text-gray-300 outline-none"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#171F31] text-white">
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

export default function AdminEventsRequestTable() {
    const [activeTab, setActiveTab] = useState("event");
    const [eventRows, setEventRows] = useState([]);
    const [individualRows, setIndividualRows] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [eventTypeFilter, setEventTypeFilter] = useState("all");
    const [approvalFilter, setApprovalFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem("token");

        fetch(EVENT_REQUEST_URL, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch event requests");
                return response.json();
            })
            .then((responseData) => {
                if (isMounted) setEventRows((responseData.data || []).map(normalizeEventRequest));
            })
            .catch((error) => {
                console.warn(error.message);
            });

        fetch(INDIVIDUAL_REQUEST_URL, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch individual requests");
                return response.json();
            })
            .then((responseData) => {
                if (isMounted) setIndividualRows((responseData.data || []).map(normalizeIndividualRequest));
            })
            .catch((error) => {
                console.warn(error.message);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const eventTypeOptions = useMemo(() => {
        const eventTypes = [...new Set(eventRows.map((event) => event.eventType).filter(Boolean))];
        return [
            { value: "all", label: "All Types" },
            ...eventTypes.map((eventType) => ({ value: eventType, label: eventType })),
        ];
    }, [eventRows]);

    const activeRows = activeTab === "event" ? eventRows : individualRows;
    const isEventTab = activeTab === "event";

    const filteredRows = activeRows.filter((row) => {
        const query = searchQuery.toLowerCase();
        const searchableText = Object.values(row)
            .flat()
            .join(" ")
            .toLowerCase();
        const matchesSearch = searchableText.includes(query);
        const matchesEventType = !isEventTab || eventTypeFilter === "all" || row.eventType === eventTypeFilter;
        const matchesApproval = approvalFilter === "all" || row.approvedStatus.toLowerCase() === approvalFilter;
        const matchesDate = !dateFilter || row.dateKeys.includes(dateFilter);

        return matchesSearch && matchesEventType && matchesApproval && matchesDate;
    });

    return (
        <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] w-full flex flex-col max-h-[calc(100vh-160px)]">
            {/* Header with tabs */}
            <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
                <h2 className="text-white font-medium">
                    {isEventTab ? "Event Request List" : "Individual Request List"}{" "}
                    <span className="text-[#8B3DFF]">({filteredRows.length})</span>
                </h2>

                <div className="flex items-center gap-3">
                    <nav className="flex rounded-md bg-[#1b2335] p-0.5" aria-label="Request type tabs">
                        <button
                            type="button"
                            onClick={() => setActiveTab("event")}
                            className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                                isEventTab
                                    ? "bg-[#8B3DFF] text-white shadow-sm"
                                    : "text-[#8b93a7] hover:text-white"
                            }`}
                        >
                            Event Requests
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("individual")}
                            className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                                !isEventTab
                                    ? "bg-[#8B3DFF] text-white shadow-sm"
                                    : "text-[#8b93a7] hover:text-white"
                            }`}
                        >
                            Individual Requests
                        </button>
                    </nav>
                </div>
            </div>

            {/* Filters row */}
            <div className="flex items-center justify-between gap-3 px-6 pb-3 flex-shrink-0">
                <div /> {/* spacer */}
                <div className="flex items-center justify-end gap-3 flex-wrap">
                    <div className="search-bar flex items-center gap-2 border border-[#343b4a] py-2 px-4 rounded-lg bg-[#232A3C]">
                        <Search size={14} className="text-[#8b93a4]" />
                        <input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            type="text"
                            placeholder="Search events, venues"
                            className="w-[200px] bg-transparent text-xs text-gray-300 placeholder:text-gray-500 outline-none"
                        />
                    </div>

                    {isEventTab && (
                        <SelectFilter
                            icon={<ListFilter size={14} className="text-[#8b93a4]" />}
                            value={eventTypeFilter}
                            onChange={setEventTypeFilter}
                            options={eventTypeOptions}
                            ariaLabel="Filter by event type"
                        />
                    )}

                    <SelectFilter
                        icon={<ListFilter size={14} className="text-[#8b93a4]" />}
                        value={approvalFilter}
                        onChange={setApprovalFilter}
                        options={[
                            { value: "all", label: "All Approval" },
                            { value: "approved", label: "Approved" },
                            { value: "pending", label: "Pending" },
                        ]}
                        ariaLabel="Filter by approval status"
                    />

                    <ThemedDatePicker
                        value={dateFilter}
                        onChange={setDateFilter}
                        placeholder="Date"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto flex-1 table-custom-scrollbar">
                {isEventTab ? (
                    <EventRequestTable rows={filteredRows} selectedDateKey={dateFilter} />
                ) : (
                    <IndividualRequestTable rows={filteredRows} selectedDateKey={dateFilter} />
                )}
            </div>
        </section>
    );
}

const EventRequestTable = ({ rows, selectedDateKey }) => (
    <table className="w-full text-left">
        <thead className="sticky top-0 bg-[#151c2c]">
            <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
                <th className="px-6 py-4 font-semibold">Event Name</th>
                <th className="px-6 py-4 font-semibold">Event Type</th>
                <th className="px-6 py-4 font-semibold">Event Venue</th>
                <th className="px-6 py-4 font-semibold">Event Date</th>
                <th className="px-6 py-4 font-semibold">Dpt</th>
                <th className="px-6 py-4 font-semibold">Event Status</th>
                <th className="px-6 py-4 font-semibold">Approved Status</th>
                <th className="px-6 py-4 font-semibold text-center">Action</th>
            </tr>
        </thead>
        <tbody>
            {rows.length > 0 ? rows.map((event, index) => (
                <tr key={event.id || index} className="border-t border-[#20283a] text-sm text-white align-top">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                        <div className="max-w-34 truncate" title={event.eventName}>{event.eventName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{event.eventType}</td>
                    <td className="px-6 py-4"><MultiValueCell values={event.venues} /></td>
                    <td className="px-6 py-4">
                        <MultiValueCell values={getFilteredDateValues(event.dates, event.dateKeys, selectedDateKey)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{event.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getEventStatusClassName(event.eventStatus)}>{event.eventStatus}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={event.approvedStatus} />
                    </td>
                    <td className="px-6 py-4">
                        <Link
                            to={`/dashboard-admin/AdminEventsRequests/${event.id}`}
                            className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white"
                            title="Open event details"
                        >
                            <ExternalLink size={17} />
                        </Link>
                    </td>
                </tr>
            )) : (
                <EmptyRow colSpan={8} />
            )}
        </tbody>
    </table>
);

const IndividualRequestTable = ({ rows, selectedDateKey }) => (
    <table className="w-full text-left">
        <thead className="sticky top-0 bg-[#151c2c]">
            <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Organizer Name</th>
                <th className="px-6 py-4 font-semibold">Event Type</th>
                <th className="px-6 py-4 font-semibold">Organizer Email</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Action</th>
            </tr>
        </thead>
        <tbody>
            {rows.length > 0 ? rows.map((request, index) => (
                <tr key={request.id || index} className="border-t border-[#20283a] text-sm text-white align-top">
                    <td className="px-6 py-4 whitespace-nowrap">{request.date}</td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                        <div className="max-w-34 truncate" title={request.organizerName}>
                            {request.organizerName}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.eventType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-40 truncate" title={request.organizerEmail}>
                            {request.organizerEmail}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={request.status} /></td>
                    <td className="px-6 py-4">
                        <Link
                            to={`/dashboard/IndividualEvents/${request.id}`}
                            className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white"
                            title="Open request details"
                        >
                            <ExternalLink size={17} />
                        </Link>
                    </td>
                </tr>
            )) : (
                <EmptyRow colSpan={6} />
            )}
        </tbody>
    </table>
);

const EmptyRow = ({ colSpan }) => (
    <tr className="border-t border-[#20283a] text-sm text-[#8b93a7]">
        <td className="px-6 py-8 text-center" colSpan={colSpan}>
            No requests available
        </td>
    </tr>
);
