import React, { useState } from "react";
import {
  CalendarDays,
  Clock3,
  FileText,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import ExpenditureDetailsForm from "./ExpenditureDetailsForm";
import EventHeaderData from "../EventHeaderData";

const displayValue = (value) =>
  value === null || value === undefined || value === "" ? "-" : String(value);
const formatDateTime = (value, options) =>
  value
    ? new Intl.DateTimeFormat("en-GB", options).format(new Date(value))
    : "-";

const IconInfoCell = ({ icon: Icon, label, value, className = "" }) => (
  <div className={`flex items-start gap-3 ${className}`}>
    {Icon && <Icon size={16} className="mt-0.5 text-[#C9B6FF]" />}
    <div>
      <p className="text-[10px] font-semibold uppercase text-[#CBC3D7]/45">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  </div>
);

const TransportTimeline = ({ transport }) => {
  const checkpoints =
    transport.checkpoints
      ?.map((c) => c.location)
      .filter(Boolean)
      .join(", ") || "-";
  const transportStops = [
    { label: "Pickup Location", value: displayValue(transport.pickupLocation) },
    { label: "Checkpoint", value: checkpoints },
    { label: "Drop Location", value: displayValue(transport.dropLocation) },
  ];

  return (
    <div className="grid grid-cols-3 items-center gap-5">
      {transportStops.map((stop, index) => (
        <div key={stop.label} className="relative">
          {index < transportStops.length - 1 && (
            <span className="absolute left-[calc(100%-10px)] top-1/2 hidden h-px w-[calc(100%+20px)] border-t border-dashed border-[#BBC1D5]/45 lg:block" />
          )}
          <div className="relative z-[1] flex items-center gap-3 rounded-md bg-[#2A3143] px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.12)]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8B3DFF]">
              <MapPin size={15} className="text-white" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase text-[#CBC3D7]/45">
                {stop.label}
              </p>
              <p className="mt-1 text-xs font-semibold text-white">
                {stop.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const SplitRow = ({ items }) => (
  <div className="grid grid-cols-2 rounded-md border border-[#374155]/70 bg-[#242B3D] px-4 py-4">
    {items.map(([label, value, Icon], index) => (
      <div
        key={label}
        className={`flex items-center justify-between gap-5 px-2 text-sm ${index === 0 ? "border-r border-[#6b7280]/50 pr-9" : "pl-5"}`}
      >
        {Icon ? (
          <IconInfoCell icon={Icon} label={label} value={value} />
        ) : (
          <>
            <span className="text-[#CBC3D7]/75">{label}</span>
            <span className="font-semibold text-white">{value}</span>
          </>
        )}
      </div>
    ))}
  </div>
);

const TransportDetails = ({ transport }) => {
  const vehicles = transport.vehicles || [];
  const staff = transport.accompanyingStaff || [];
  const transportSummary = [
    {
      icon: CalendarDays,
      label: "Pickup Date",
      value: formatDateTime(transport.pickupDateTime, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    },
    {
      icon: Clock3,
      label: "Pickup Time",
      value: formatDateTime(transport.pickupDateTime, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    },
    {
      icon: CalendarDays,
      label: "Drop Date",
      value: formatDateTime(transport.dropDateTime, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    },
    {
      icon: Clock3,
      label: "Drop Time",
      value: formatDateTime(transport.dropDateTime, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    },
  ];
  const vehicleTypes = vehicles
    .map((vehicle) => vehicle.type)
    .filter(Boolean)
    .join(" / ");
  const vehicleCountItems = vehicles.map((vehicle) => [
    `Total ${displayValue(vehicle.type)} needed`,
    displayValue(vehicle.count),
  ]);
  const vehicleCountPairs = [];
  for (let i = 0; i < vehicleCountItems.length; i += 2) {
    vehicleCountPairs.push(vehicleCountItems.slice(i, i + 2));
  }
  const staffNames =
    staff
      .map((member) => member.name)
      .filter(Boolean)
      .join(", ") || "-";
  const staffMobiles =
    staff
      .map((member) => member.mobile)
      .filter(Boolean)
      .join(", ") || "-";

  return (
    <div className="space-y-5 rounded-lg border border-[#374155] bg-[#1B2334] p-4">
      <div className="grid grid-cols-4 rounded-md border border-[#374155]/60 bg-[#242B3D] py-4">
        {transportSummary.map((item, index) => (
          <IconInfoCell
            key={item.label}
            {...item}
            className={`px-4 ${index !== transportSummary.length - 1 ? "border-r border-[#6b7280]/50" : ""}`}
          />
        ))}
      </div>
      <TransportTimeline transport={transport} />
      <SplitRow
        items={[
          ["Total Number of Members", displayValue(transport.totalPassengers)],
          ["Types of Vehicle needed", displayValue(vehicleTypes)],
        ]}
      />
      {vehicleCountPairs.map((pair, i) => (
        <SplitRow key={i} items={pair} />
      ))}
      <SplitRow
        items={[
          ["Accompanying Staff Name", staffNames, User],
          ["Accompanying Mobile Number", staffMobiles, Phone],
        ]}
      />
      <section className="rounded-lg border border-[#465168] bg-[#232A3B] p-5">
        <div className="mb-4 flex items-center gap-2 text-base font-medium text-[#E6E2F0]">
          <FileText size={16} />
          Special Requirement
        </div>
        <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
          {displayValue(transport.specialRequirements)}
        </p>
      </section>
    </div>
  );
};

const FacultyTransportationDetailsPanel = ({
  transportDetails,
  eventData,
  eventSchedule = [],
}) => {
  const [activeDay, setActiveDay] = useState(0);
  const transports = transportDetails?.transports || [];
  if (!transportDetails)
    return (
      <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
        No transportation details are available.
      </p>
    );
  const dayCount = Math.max(eventSchedule.length, transports.length, 1);
  const selectedDay = Math.min(activeDay, dayCount - 1);
  const dayTransport = transports[selectedDay];

  return (
    <div className="space-y-5">
      <EventHeaderData  data={eventData.requestDetails}/>
      {dayCount > 1 && (
        <nav
          className="flex border-b border-[#374155]"
          aria-label="Transportation event days"
        >
          {Array.from({ length: dayCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`border-b-2 px-5 py-2 text-[10px] font-medium transition ${selectedDay === index ? "border-[#8B3DFF] text-[#9F68FF]" : "border-transparent text-[#CBC3D7]/75 hover:text-white"}`}
            >
              Day {index + 1}
            </button>
          ))}
        </nav>
      )}
      {dayTransport ? (
        <TransportDetails transport={dayTransport} />
      ) : (
        <p className="py-8 text-center text-sm text-[#CBC3D7]/65">
          No transportation details were submitted for Day {selectedDay + 1}.
        </p>
      )}
    </div>
  );
};

export default FacultyTransportationDetailsPanel;
