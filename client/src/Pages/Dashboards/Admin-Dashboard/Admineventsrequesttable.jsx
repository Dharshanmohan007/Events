import { ExternalLink, ListFilter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ThemedDatePicker from "../../../Components/ThemedDatePicker";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";
const EVENT_REQUEST_URL = `${API_BASE_URL}/api/table/dashboard-table?module=admin`;
const INDIVIDUAL_REQUEST_URL = `${API_BASE_URL}/api/table/dashboard-table?module=individual`;

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
    id: request.requestId || request.eventId || request.id,
    eventName: request.eventName || request.name || "-",
    requestType: request.requestType || request.type || "-",
    requiredDates: Array.isArray(request.requiredDates)
        ? request.requiredDates.map(formatDate)
        : [request.requiredDate || request.date].filter(Boolean).map(formatDate),
    dateKeys: Array.isArray(request.requiredDates)
        ? request.requiredDates.map(toDateKey)
        : [request.requiredDate || request.date].filter(Boolean).map(toDateKey),
    approvedStatus: request.adminApproval ? "Approved" : (request.approvedStatus || "Pending"),
    acknowledgedStatus: request.acknowledgedStatus || request.acknowledgementStatus || "Pending",
    eventStatus: request.overallStatus || request.eventStatus || "-",
});

const getEventStatusClassName = (status = "") => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus.includes("rejected")) return "text-[#B32058]";
    if (normalizedStatus.includes("admin") && normalizedStatus.includes("approved")) return "text-[#34D399]";
    if (normalizedStatus.includes("hod") && normalizedStatus.includes("approved")) return "text-[#60A5FA]";
    if (normalizedStatus.includes("submitted")) return "text-[#fdcb6e]";

    return "text-white";
};

const StatusBadge = ({ status, className }) => {
    const normalizedStatus = status.toLowerCase();
    const isPositive = normalizedStatus.includes("approved") || normalizedStatus.includes("acknowledged");
    const colorClass = className || (isPositive ? "text-[#34D399]" : "text-[#B32058]");
    const dotClass = colorClass.replace("text-", "bg-");

    return (
        <span className={`inline-flex items-center gap-2 ${colorClass}`}>
            <span className={`h-2 w-2 rounded-full ${dotClass}`} />
            {status}
        </span>
    );
};

const MultiValueCell = ({ values }) => {
    const list = values?.length ? values : ["-"];
    const remainingItems = list.slice(1);

    return (
        <div className="min-w-35.5 relative">
            <div className="flex items-center gap-2">
                <span className="whitespace-nowrap">{list[0]}</span>
                {remainingItems.length > 0 && (
                    <div className="group relative inline-flex">
                        <span className="cursor-default rounded bg-[#263044] px-1.5 py-0.5 text-xs font-semibold text-[#aeb7ca]">
                            +{remainingItems.length}
                        </span>
                        <div className="pointer-events-none absolute left-1/2 -top-6 z-20 mt-2 hidden min-w-max  rounded-md border border-[#303b52] bg-[#101827] px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                            <div className="space-y-1">
                                {remainingItems.map((value, index) => (
                                    <div key={`${value}-${index}`} className="whitespace-nowrap">
                                        {value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
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
    <div className="filter-container border border-gray-700 rounded-lg flex items-center py-2 px-3 gap-2 bg-[#232A3C]">
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
        <>
            <div className="mt-5 flex border-b border-[#52596b]">
                <button
                    type="button"
                    onClick={() => setActiveTab("event")}
                    className={`min-w-[145px] px-3 pb-3 text-left text-base font-medium ${isEventTab ? "border-b-2 border-[#8B3DFF] text-[#8B3DFF]" : "text-white"}`}
                >
                    Event Request
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("individual")}
                    className={`min-w-[165px] px-3 pb-3 text-left text-base font-medium ${!isEventTab ? "border-b-2 border-[#8B3DFF] text-[#8B3DFF]" : "text-white"}`}
                >
                    Individual Request
                </button>
            </div>

            <div className="bg-[#171F31] mt-3 border border-gray-800 rounded-xl py-4">
                <div className="flex items-center justify-between gap-3 mb-4 flex-wrap px-6">
                    <h2 className="text-white font-semibold">
                        {isEventTab ? "Overall Event Request List" : "Individual Request List"}{" "}
                        <span className="text-[#8B3DFF]">( {filteredRows.length} )</span>
                    </h2>

                    <div className="flex items-center justify-end gap-3 flex-wrap">
                        <div className="search-bar flex items-center gap-2 border border-gray-700 py-2 px-4 rounded-full bg-[#232A3C]">
                            <Search size={16} className="text-gray-400" />
                            <input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                type="text"
                                placeholder="Search events, venues"
                                className="w-[250px] bg-transparent text-xs text-gray-300 placeholder:text-gray-500 outline-none"
                            />
                        </div>

                        {isEventTab && (
                            <SelectFilter
                                icon={<ListFilter size={16} className="text-gray-400" />}
                                value={eventTypeFilter}
                                onChange={setEventTypeFilter}
                                options={eventTypeOptions}
                                ariaLabel="Filter by event type"
                            />
                        )}

                        <SelectFilter
                            icon={<ListFilter size={16} className="text-gray-400" />}
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

                <div className="max-h-[calc(100vh-290px)] table-custom-scrollbar overflow-auto">
                    {isEventTab ? (
                        <EventRequestTable rows={filteredRows} selectedDateKey={dateFilter} />
                    ) : (
                        <IndividualRequestTable rows={filteredRows} selectedDateKey={dateFilter} />
                    )}
                </div>
            </div>
        </>
    );
}

const EventRequestTable = ({ rows, selectedDateKey }) => (
    <table className="w-full text-left">
        <thead className="sticky top-0 bg-[#1C2335]">
            <tr className="border-b border-[#22253a] text-[#7f8799] uppercase text-xs">
                <th className="px-5 py-3.5 font-semibold">Event Name</th>
                <th className="px-5 py-3.5 font-semibold">Event Type</th>
                <th className="px-5 py-3.5 font-semibold">Event Venue</th>
                <th className="px-5 py-3.5 font-semibold">Event Date</th>
                <th className="px-5 py-3.5 font-semibold">Dpt</th>
                <th className="px-5 py-3.5 font-semibold">Event Status</th>
                <th className="px-5 py-3.5 font-semibold">Approved Status</th>
                <th className="px-5 py-3.5 font-semibold text-center">Action</th>
            </tr>
        </thead>
        <tbody>
            {rows.length > 0 ? rows.map((event, index) => (
                <tr key={event.id || index} className="border-b border-[#1e2130] text-sm text-white align-top hover:bg-[#1e2232]">
                    <td className="px-5 py-3.5 font-medium whitespace-nowrap">
                        <div className="max-w-34 truncate" title={event.eventName}>{event.eventName}</div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">{event.eventType}</td>
                    <td className="px-5 py-3.5"><MultiValueCell values={event.venues} /></td>
                    <td className="px-5 py-3.5">
                        <MultiValueCell values={getFilteredDateValues(event.dates, event.dateKeys, selectedDateKey)} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">{event.department}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={getEventStatusClassName(event.eventStatus)}>{event.eventStatus}</span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                        <StatusBadge status={event.approvedStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-center">
                        <button className="text-gray-400 hover:text-white transition-colors" title="Open">
                            <ExternalLink size={17} />
                        </button>
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
        <thead className="sticky top-0 bg-[#1C2335]">
            <tr className="border-b border-[#22253a] text-[#7f8799] uppercase text-xs">
                <th className="px-5 py-3.5 font-semibold">Event Name</th>
                <th className="px-5 py-3.5 font-semibold">Request Type</th>
                <th className="px-5 py-3.5 font-semibold">Required Date</th>
                <th className="px-5 py-3.5 font-semibold">Approved Status</th>
                <th className="px-5 py-3.5 font-semibold">Acknowledged Status</th>
                <th className="px-5 py-3.5 font-semibold">Event Status</th>
                <th className="px-5 py-3.5 font-semibold text-center">Action</th>
            </tr>
        </thead>
        <tbody>
            {rows.length > 0 ? rows.map((request, index) => (
                <tr key={request.id || index} className="border-b border-[#1e2130] text-sm text-white align-top hover:bg-[#1e2232]">
                    <td className="px-5 py-3.5 font-medium whitespace-nowrap">{request.eventName}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">{request.requestType}</td>
                    <td className="px-5 py-3.5">
                        <MultiValueCell values={getFilteredDateValues(request.requiredDates, request.dateKeys, selectedDateKey)} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={request.approvedStatus} /></td>
                    <td className="px-5 py-3.5 whitespace-nowrap"><StatusBadge status={request.acknowledgedStatus} /></td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={getEventStatusClassName(request.eventStatus)}>{request.eventStatus}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                        <button className="text-gray-400 hover:text-white transition-colors" title="Open">
                            <ExternalLink size={17} />
                        </button>
                    </td>
                </tr>
            )) : (
                <EmptyRow colSpan={7} />
            )}
        </tbody>
    </table>
);

const EmptyRow = ({ colSpan }) => (
    <tr className="border-b border-[#1e2130] text-sm text-[#8b93a7]">
        <td className="px-5 py-8 text-center" colSpan={colSpan}>
            No requests available
        </td>
    </tr>
);
