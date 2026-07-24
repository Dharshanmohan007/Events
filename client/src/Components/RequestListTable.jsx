import { ExternalLink, ListFilter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ThemedDatePicker from "./ThemedDatePicker";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://sece-events.onrender.com";

// ── Safe string helpers ───────────────────────────────────────────────
// API may return objects for some fields (e.g. status, department).
// These helpers ensure every renderable value is a safe string.

/** Convert any value to a display-safe string. Objects are joined as "key: value | ..." */
const safeString = (value, fallback = "-") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value || fallback;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    try {
      const entries = Object.entries(value).filter(([, v]) => v != null);
      if (entries.length === 0) return fallback;
      return entries.map(([k, v]) => `${k}: ${v}`).join(" | ");
    } catch {
      return fallback;
    }
  }
  return String(value);
};

const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return safeString(dateValue);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const toDateKey = (dateValue) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  const parts = dateValue.split(/[-/]/);
  if (parts.length !== 3) return safeString(dateValue);
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const normalizeEventRequest = (event) => ({
  id: event.eventId || event.id,
  eventName: safeString(event.eventName),
  eventType: safeString(event.eventType),
  venues: Array.isArray(event.venues) ? event.venues.map(safeString) : [safeString(event.eventVenue || event.venue)].filter(Boolean),
  dates: Array.isArray(event.dates) ? event.dates.map(formatDate) : [event.eventDate || event.requiredDate].filter(Boolean).map(formatDate),
  dateKeys: Array.isArray(event.dates) ? event.dates.map(toDateKey) : [event.eventDate || event.requiredDate].filter(Boolean).map(toDateKey),
  department: safeString(event.organizingDepartment || event.department),
  approvedStatus: event.adminApproval ? "Approved" : "Pending",
  eventStatus: safeString(event.overallStatus || event.eventStatus),
  rawEventId: event.eventId || event.id,
});

const normalizeIndividualRequest = (request) => ({
  id: request.id,
  employee: safeString(request.employee || request.employeeDetail?.name),
  employeeEmail: safeString(request.employeeEmail),
  formType: safeString(request.formType),
  createdAt: request.createdAt ? formatDate(request.createdAt) : "-",
  dateKeys: request.createdAt ? [toDateKey(request.createdAt)] : [],
  status: safeString(typeof request.status === "string" ? request.status : "Pending"),
});

/** Used only to pick a colour – receives already-safe string values. */
const getEventStatusClassName = (status = "") => {
  const s = status.toLowerCase();
  if (s.includes("rejected")) return "text-[#B32058]";
  if (s.includes("admin") && s.includes("approved")) return "text-[#34D399]";
  if (s.includes("hod") && s.includes("approved")) return "text-[#60A5FA]";
  if (s.includes("submitted")) return "text-[#fdcb6e]";
  return "text-white";
};

const StatusBadge = ({ status, className }) => {
  const s = (status || "").toLowerCase();
  const isPositive = s.includes("approved") || s.includes("acknowledged");
  const colorClass = className || (isPositive ? "text-[#34D399]" : "text-[#B32058]");
  return (
    <span className={`inline-flex items-center gap-2 ${colorClass}`}>
      <span className={`h-2 w-2 rounded-full ${colorClass.replace("text-", "bg-")}`} />
      {status}
    </span>
  );
};

const MultiValueCell = ({ values }) => {
  const [isHovered, setIsHovered] = useState(false);
  const list = values?.length ? values : ["-"];
  const remainingItems = list.slice(1);
  if (remainingItems.length === 0) return <span className="whitespace-nowrap">{list[0]}</span>;
  return (
    <div className="relative inline-flex items-center gap-1.5" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <span className="whitespace-nowrap">{list[0]}</span>
      <span className="cursor-pointer text-xs font-medium text-[#853FF9] hover:text-[#a76df9]">+{remainingItems.length}</span>
      {isHovered && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsHovered(false)} />
          <div className="absolute left-full z-50 mb-2 min-w-[180px] rounded-lg border border-[#374155] bg-[#1B2334] p-3 shadow-xl">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">Details</p>
            {remainingItems.map((value, index) => (
              <p key={`${value}-${index}`} className="py-0.5 text-sm text-white">{value}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const getFilteredDateValues = (values, dateKeys, selectedDateKey) => {
  if (!selectedDateKey) return values;
  const idx = dateKeys.findIndex((k) => k === selectedDateKey);
  if (idx <= 0) return values;
  return [values[idx], ...values.slice(0, idx), ...values.slice(idx + 1)];
};

const SelectFilter = ({ icon, value, onChange, options, ariaLabel }) => (
  <div className="filter-container border border-[#343b4a] rounded-lg flex items-center py-2 px-3 gap-2 bg-[#232A3C]">
    {icon}
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={ariaLabel} className="bg-transparent text-xs text-gray-300 outline-none">
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#171F31] text-white">{opt.label}</option>
      ))}
    </select>
  </div>
);

const EmptyRow = ({ colSpan }) => (
  <tr className="border-t border-[#20283a] text-sm text-[#8b93a7]">
    <td className="px-6 py-8 text-center" colSpan={colSpan}>No requests available</td>
  </tr>
);

const EventRequestTable = ({ rows, selectedDateKey, detailViewPath }) => (
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
          <td className="px-6 py-4"><MultiValueCell values={getFilteredDateValues(event.dates, event.dateKeys, selectedDateKey)} /></td>
          <td className="px-6 py-4 whitespace-nowrap">{event.department}</td>
          <td className="px-6 py-4 whitespace-nowrap"><span className={getEventStatusClassName(event.eventStatus)}>{event.eventStatus}</span></td>
          <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={event.approvedStatus} /></td>
          <td className="px-6 py-4">
            {detailViewPath ? (
              <Link to={`${detailViewPath}/${event.rawEventId}`} className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white" title="Open">
                <ExternalLink size={17} />
              </Link>
            ) : (
              <button className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white" title="Open">
                <ExternalLink size={17} />
              </button>
            )}
          </td>
        </tr>
      )) : <EmptyRow colSpan={8} />}
    </tbody>
  </table>
);

const IndividualRequestTable = ({ rows, individualDetailViewPath }) => (
  <table className="w-full text-left">
    <thead className="sticky top-0 bg-[#151c2c]">
      <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
        <th className="px-6 py-4 font-semibold">Date</th>
        <th className="px-6 py-4 font-semibold">Organizer</th>
        <th className="px-6 py-4 font-semibold">Form Type</th>
        <th className="px-6 py-4 font-semibold">Email</th>
        <th className="px-6 py-4 font-semibold">Status</th>
        <th className="px-6 py-4 font-semibold text-center">Action</th>
      </tr>
    </thead>
    <tbody>
      {rows.length > 0 ? rows.map((row, index) => (
        <tr key={row.id || index} className="border-t border-[#20283a] text-sm text-white align-top">
          <td className="px-6 py-4 whitespace-nowrap">{row.createdAt}</td>
          <td className="px-6 py-4 font-medium whitespace-nowrap"><div className="max-w-34 truncate" title={row.employee}>{row.employee}</div></td>
          <td className="px-6 py-4 whitespace-nowrap">{row.formType}</td>
          <td className="px-6 py-4 whitespace-nowrap"><div className="max-w-40 truncate" title={row.employeeEmail}>{row.employeeEmail}</div></td>
          <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={row.status} /></td>
          <td className="px-6 py-4">
            {individualDetailViewPath ? (
              <Link to={`${individualDetailViewPath}/${row.id}`} className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white" title="Open request">
                <ExternalLink size={17} />
              </Link>
            ) : (
              <button className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white" title="Open">
                <ExternalLink size={17} />
              </button>
            )}
          </td>
        </tr>
      )) : <EmptyRow colSpan={6} />}
    </tbody>
  </table>
);

const RequestListTable = ({
  eventRows: propEventRows,
  individualRows: propIndividualRows,
  detailViewPath,
  individualDetailViewPath,
  onFetchEvents,
  onFetchIndividuals,
  showIndividualTab = false,
}) => {
  const [activeTab, setActiveTab] = useState("event");
  const [internalEventRows, setInternalEventRows] = useState([]);
  const [internalIndividualRows, setInternalIndividualRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const hasExternalEvents = Boolean(propEventRows);
  const hasExternalIndividuals = Boolean(propIndividualRows);
  const showIndividual = showIndividualTab || hasExternalIndividuals || Boolean(onFetchIndividuals);

  useEffect(() => {
    if (hasExternalEvents || !onFetchEvents) return;
    let mounted = true;
    onFetchEvents().then((data) => {
      if (mounted) setInternalEventRows((data || []).map(normalizeEventRequest));
    }).catch((err) => console.warn(err.message));
    return () => { mounted = false; };
  }, [hasExternalEvents, onFetchEvents]);

  useEffect(() => {
    if (!showIndividual || hasExternalIndividuals || !onFetchIndividuals) return;
    let mounted = true;
    onFetchIndividuals().then((data) => {
      if (mounted) setInternalIndividualRows((data || []).map(normalizeIndividualRequest));
    }).catch((err) => console.warn(err.message));
    return () => { mounted = false; };
  }, [showIndividual, hasExternalIndividuals, onFetchIndividuals]);

  const eventRows = hasExternalEvents ? propEventRows : internalEventRows;
  const individualRows = showIndividual ? (hasExternalIndividuals ? propIndividualRows : internalIndividualRows) : [];
  const isEventTab = activeTab === "event";
  const activeRows = isEventTab ? eventRows : individualRows;

  const eventTypeOptions = useMemo(() => {
    const types = [...new Set(eventRows.map((r) => r.eventType).filter(Boolean))];
    return [{ value: "all", label: "All Types" }, ...types.map((t) => ({ value: t, label: t }))];
  }, [eventRows]);

  const filteredRows = activeRows.filter((row) => {
    const q = searchQuery.toLowerCase();
    const text = Object.values(row).flat().join(" ").toLowerCase();
    const matchesSearch = !q || text.includes(q);
    const matchesEventType = !isEventTab || eventTypeFilter === "all" || row.eventType === eventTypeFilter;
    const matchesApproval = approvalFilter === "all" || (row.approvedStatus || "").toLowerCase() === approvalFilter;
    const matchesDate = !dateFilter || (row.dateKeys || []).includes(dateFilter);
    return matchesSearch && matchesEventType && matchesApproval && matchesDate;
  });

  return (
    <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] w-full flex flex-col max-h-[calc(100vh-160px)]">
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
              className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${isEventTab ? "bg-[#8B3DFF] text-white shadow-sm" : "text-[#8b93a7] hover:text-white"}`}
            >
              Event Requests
            </button>
            {showIndividual && (
              <button
                type="button"
                onClick={() => setActiveTab("individual")}
                className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${!isEventTab ? "bg-[#8B3DFF] text-white shadow-sm" : "text-[#8b93a7] hover:text-white"}`}
              >
                Individual Requests
              </button>
            )}
          </nav>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-6 pb-3 flex-shrink-0">
        <div />
        <div className="flex items-center justify-end gap-3 flex-wrap">
          <div className="search-bar flex items-center gap-2 border border-[#343b4a] py-2 px-4 rounded-lg bg-[#232A3C]">
            <Search size={14} className="text-[#8b93a4]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          <ThemedDatePicker value={dateFilter} onChange={setDateFilter} placeholder="Date" />
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto flex-1 table-custom-scrollbar">
        {isEventTab ? (
          <EventRequestTable rows={filteredRows} selectedDateKey={dateFilter} detailViewPath={detailViewPath} />
        ) : (
          <IndividualRequestTable rows={filteredRows} individualDetailViewPath={individualDetailViewPath} />
        )}
      </div>
    </section>
  );
};

export default RequestListTable;
