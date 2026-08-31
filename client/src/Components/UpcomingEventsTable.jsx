import React, { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime())
    ? dateStr
    : date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");
};

const formatDateShort = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime())
    ? dateStr
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const HEADERS_CONFIG = {
  default: {
    event: [
      "Event Name",
      "Event Date",
      "Event Type",
      "Dept",
      "Status",
      "Action",
    ],
  },
  venue: {
    event: [
      "Event Name",
      "Date",
      "Event Type",
      "Dept",
      "Venue",
      "Status",
      "Action",
    ],
  },
  audio: {
    event: [
      "Event Name",
      "Date",
      "Event Type",
      "Dept",
      "Venue",
      "Status",
      "Action",
    ],
  },
  ictc: {
    event: [
      "Event Name",
      "Date",
      "Event Type",
      "Dept",
      "Venue",
      "Status",
      "Action",
    ],
  },
  accommodation: {
    event: ["Event Name", "Check In-Check Out", "Dept", "Status", "Action"],
  },
  transport: {
    event: ["Event Name", "Required Date", "Dept", "Status", "Action"],
    individual: [
      "Required Date",
      "Organizer Name",
      "Department",
      "Organizer Phone No",
      "Status",
      "Action",
    ],
  },
  food: {
    event: [
      "Event Name",
      "Required Date",
      "Event Type",
      "Dept",
      "Status",
      "Action",
    ],
    individual: [
      "Required Date",
      "Organizer Name",
      "Department",
      "Organizer Phone No",
      "Status",
      "Action",
    ],
  },
  purchase: {
    event: ["Event Name", "Date", "Dept", "Status", "Action"],
    individual: [
      "Required Date",
      "Organizer Name",
      "Department",
      "Organizer Phone No",
      "Status",
      "Action",
    ],
  },
};

const MODULES_WITH_TABS = ["food", "transport", "purchase"];

const MultiValueHoverCell = ({ items, displayFn, label = "Items" }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (!items || items.length === 0) return <span>-</span>;

  const firstItem = displayFn(items[0], 0);
  const remainingCount = items.length - 1;

  return (
    <div
      className="relative inline-flex items-center gap-1.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span>{firstItem}</span>
      {remainingCount > 0 && (
        <>
          <span className="cursor-pointer text-xs font-medium text-[#853FF9] hover:text-[#a76df9]">
            +{remainingCount}
          </span>
          {isHovered && (
            <>
              <div
                className="fixed inset-0  z-40"
                onClick={() => setIsHovered(false)}
              />
              <div className="absolute  left-full z-50 mb-2 min-w-[180px] rounded-lg border border-[#374155] bg-[#1B2334] p-3 shadow-xl">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#CBC3D7]/45">
                  {label}
                </p>
                {items.map((item, i) => (
                  <p key={i} className="py-0.5 text-sm text-white">
                    {displayFn(item, i)}
                  </p>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

const displayVenueName = (venue) => {
  if (typeof venue === "object" && venue !== null)
    return venue.venueName || venue.venue || "-";
  return String(venue);
};

const displayTransportDateRange = (transport) => {
  const pickup = transport.pickupDateTime
    ? formatDateShort(transport.pickupDateTime)
    : "-";
  const drop = transport.dropDateTime
    ? formatDateShort(transport.dropDateTime)
    : "-";
  return `${pickup} - ${drop}`;
};

const getStatusColor = (status = "") => {
  const normalizedStatus = String(status).toLowerCase();

  if (normalizedStatus.includes("rejected")) {
    return {
      text: "text-red-400",
      dot: "bg-red-400",
    };
  }

  if (normalizedStatus.includes("acknowledged")) {
    return {
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    };
  }

  if (normalizedStatus.includes("approved")) {
    return {
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    };
  }

  if (normalizedStatus.includes("pending")) {
    return {
      text: "text-pink-600",
      dot: "bg-pink-600",
    };
  }

  if (normalizedStatus.includes("submitted")) {
    return {
      text: "text-yellow-400",
      dot: "bg-yellow-400",
    };
  }
  if (normalizedStatus.includes("completed")) {
    return {
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    };
  }

  return {
    text: "text-white",
    dot: "bg-white",
  };
};

const renderCellValue = (event, header, detailViewPath) => {
  switch (header) {
    case "Event Name":
      return <span className="font-medium">{event.eventName}</span>;
    case "Date":
    case "Event Date":
      if (Array.isArray(event.eventDate)) {
        if (event.eventDate.length === 0) return "-";
        return (
          <MultiValueHoverCell
            items={event.eventDate}
            displayFn={formatDate}
            label="Event Dates"
          />
        );
      }
      return event.eventDate || "-";
    case "Required Date":
      if (Array.isArray(event.eventDate) && event.eventDate.length > 0) {
        return (
          <MultiValueHoverCell
            items={event.eventDate}
            displayFn={formatDate}
            label="Required Dates"
          />
        );
      }
      if (Array.isArray(event.requiredDate)) {
        return (
          <MultiValueHoverCell
            items={event.requiredDate}
            displayFn={displayTransportDateRange}
            label="Transport Schedule"
          />
        );
      }
      return event.requiredDate || "-";
    case "Event Type":
      return event.eventType || "-";
    case "Dept":
    case "Department":
      return event.department || event.organizingDepartment || "-";
    case "Venue":
      if (Array.isArray(event.venue) || Array.isArray(event.venues)) {
        const venues = event.venue || event.venues;
        return (
          <MultiValueHoverCell
            items={venues}
            displayFn={displayVenueName}
            label="All Venues"
          />
        );
      }
      return event.venue || event.venues || "-";
    case "Check In-Check Out":
      if (Array.isArray(event.eventDate) && event.eventDate.length > 0) {
        return (
          <MultiValueHoverCell
            items={event.eventDate}
            displayFn={formatDate}
            label="Stay Dates"
          />
        );
      }
      if (Array.isArray(event.requiredDate)) {
        return (
          <MultiValueHoverCell
            items={event.requiredDate}
            displayFn={displayTransportDateRange}
            label="Stay Schedule"
          />
        );
      }
      return `${event.checkInDate || "-"} - ${event.checkOutDate || "-"}`;
    case "Organizer Name":
      return event.organizerName || "-";
    case "Organizer Phone No":
      return event.organizerPhone || "-";
    case "Status": {
      const status =
        event.acknowledgeStatus ||
        event.departmentStatus ||
        event.overallStatus ||
        "-";

      const colors = getStatusColor(status);

      return (
        <span className={`inline-flex items-center gap-2 ${colors.text}`}>
          <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
          {status}
        </span>
      );
    }
    case "Action":
      const eventId = event.eventId;
      if (detailViewPath && eventId) {
        return (
          <Link
            to={`${detailViewPath}/${eventId}`}
            className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white"
          >
            <ExternalLink size={17} />
          </Link>
        );
      }
      return (
        <button className="mx-auto flex h-8 w-8 items-center justify-center text-[#8b93a7] hover:text-white">
          <ExternalLink size={17} />
        </button>
      );
    default:
      return event[header] || "-";
  }
};

const UpcomingEventsTable = ({
  events,
  viewAllLink,
  title = "Upcoming Events",
  module = "default",
  individualEvents = [],
  detailViewPath,
  individualDetailViewPath = "/dashboard/IndividualEvents",
}) => {
  const [activeTab, setActiveTab] = useState("events");

  const config = HEADERS_CONFIG[module] || HEADERS_CONFIG.default;
  const hasTabs = MODULES_WITH_TABS.includes(module);
  const currentHeaders =
    activeTab === "events" ? config.event : config.individual;
  const currentData = activeTab === "events" ? events : individualEvents;

  return (
    <section className="rounded-lg border border-[#2a3347] bg-[#151c2c] w-[70%] h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0">
        <h2 className="text-white font-medium">{title}</h2>

        <div className="flex items-center gap-4">
          {hasTabs && (
            <nav
              className="flex rounded-md bg-[#1b2335] p-0.5"
              aria-label="Request type tabs"
            >
              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className={`rounded px-3.5 py-1.5 text-xs font-medium transition ${
                  activeTab === "events"
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
                  activeTab === "individual"
                    ? "bg-[#8B3DFF] text-white shadow-sm"
                    : "text-[#8b93a7] hover:text-white"
                }`}
              >
                Individual Requests
              </button>
            </nav>
          )}

          <Link
            to={viewAllLink}
            className="flex items-center gap-2 text-[#853FF9] hover:text-[#a76df9] cursor-pointer text-sm font-medium"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto flex-1 table-custom-scrollbar">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-[#151c2c]">
            <tr className="bg-[#1b2335] text-[#7f8799] uppercase text-xs">
              {currentHeaders.map((header) => (
                <th
                  key={header}
                  className={`px-6 py-4 font-semibold ${
                    header === "Action" ? "text-center" : ""
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentData.map((item, index) => (
              <tr
                key={index}
                className="border-t border-[#20283a] text-sm text-white"
              >
                {currentHeaders.map((header) => (
                  <td key={header} className="px-6 py-4 whitespace-nowrap">
                    {renderCellValue(
                      item,
                      header,
                      activeTab === "individual"
                        ? individualDetailViewPath
                        : detailViewPath,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default UpcomingEventsTable;
