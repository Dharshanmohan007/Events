import React, { useState } from "react";
import { CalendarDays, FileText, Phone, User } from "lucide-react";
import EventDataHeader from "../../Dashboards/EventHeaderData";

const displayValue = (value) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
};

const SplitInfoRow = ({ items }) => (
  <div className="grid grid-cols-2 rounded-md border border-[#374155]/60 bg-[#242B3D] px-4 py-4">
    {items.map(([label, value, Icon], index) => (
      <div
        key={label}
        className={`flex items-center justify-between gap-5 px-2 text-sm ${index === 0 ? "border-r border-[#6b7280]/50 pr-9" : "pl-5"}`}
      >
        <div className="flex items-start gap-3">
          {Icon && (
            <Icon size={16} className="mt-0.5 shrink-0 text-[#C9B6FF]" />
          )}
          <div>
            <p className="text-[10px] font-semibold uppercase text-[#CBC3D7]/45">
              {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {displayValue(value)}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const MealSection = ({ title, foodType }) => {
  if (!foodType) return null;
  const { participants = {}, vipGuests = {}, refreshmentCount } = foodType;

  // For Morning/Evening Refreshment - show only refreshment count
  const isRefreshment = foodType.type === 'Morning Refreshment' || foodType.type === 'Evening Refreshment';

  return (
    <section className="rounded-lg border border-[#465168] bg-[#232A3B] p-4">
      <h3 className="text-lg font-semibold text-[#8F5BFF]">{title}</h3>
      <div className="mt-4 space-y-3">
        {isRefreshment ? (
          <div className="rounded-md border border-[#374155]/60 bg-[#242B3D] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase text-[#CBC3D7]/45">Refreshment Count</p>
            <p className="mt-1 text-sm font-semibold text-white">{displayValue(refreshmentCount)}</p>
          </div>
        ) : (
          <>
            <SplitInfoRow
              items={[
                ['No. of veg In Participants Menu', displayValue(participants.vegCount)],
                ['No. of veg In Guest/VIP Menu', displayValue(vipGuests.vegCount)],
              ]}
            />
            {/* Only show non-veg section for Lunch, not for Breakfast/Dinner */}
            {foodType.type !== 'Breakfast' && foodType.type !== 'Dinner' && (
              <SplitInfoRow
                items={[
                  ['No. of Non-veg In Participants Menu', displayValue(participants.nonVegCount)],
                  ['No. of Non-veg In Guest/VIP Menu', displayValue(vipGuests.nonVegCount)],
                ]}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
};

const FoodDetails = ({ refreshment }) => {
  const resourcePersonTypes =
    (refreshment.resourcePersonType || []).filter(Boolean).join(" / ") || "-";
  const staff = refreshment.accompanyingStaff || [];
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
  const foodTypes = refreshment.foodTypes || [];

  const mealTitleMap = {
    "Morning Refreshment": "Morning Refreshment",
    Breakfast: "Breakfast",
    Lunch: "Lunch",
    "Evening Refreshment": "Evening Refreshment",
    Dinner: "Dinner",
    Snacks: "Snacks",
  };

  const summaryRows = [
    [
      ["Date", formatDate(refreshment.date), CalendarDays],
      ["Type of Resource Person", resourcePersonTypes],
    ],
    [
      [
        "Total number of Resource Persons",
        displayValue(refreshment.numberOfResourcePersons),
      ],
      [
        "Total number of Internal Accompanying Staff",
        displayValue(refreshment.numberOfInternalAccompanyingStaff),
      ],
    ],
    [
      ["Accompanying Staff Name", staffNames, User],
      ["Accompanying Mobile Number", staffMobiles, Phone],
    ],
  ];

  return (
    <div className="space-y-5">
      {summaryRows.map((row, i) => (
        <SplitInfoRow key={i} items={row} />
      ))}

      {foodTypes.map((foodType) => (
        <MealSection
          key={foodType.type}
          title={mealTitleMap[foodType.type] || foodType.type}
          foodType={foodType}
        />
      ))}

      {refreshment.specialRequirements ? (
        <section className="rounded-lg border border-[#465168] bg-[#232A3B] p-5">
          <div className="mb-4 flex items-center gap-2 text-base font-medium text-[#E6E2F0]">
            <FileText size={16} />
            Special Requirement
          </div>
          <p className="text-sm font-medium leading-7 text-[#E6E2F0]">
            {displayValue(refreshment.specialRequirements)}
          </p>
        </section>
      ) : null}
    </div>
  );
};

const FacultyFoodRefreshmentDetailsPanel = ({
  refreshmentDetails,
  eventData,
  eventSchedule = [],
}) => {
  const [activeDay, setActiveDay] = useState(0);
  const refreshments = refreshmentDetails?.refreshments || [];
  if (!refreshmentDetails)
    return (
      <p className="py-10 text-center text-sm text-[#CBC3D7]/65">
        No food details are available.
      </p>
    );
  const dayCount = Math.max(eventSchedule.length, refreshments.length, 1);
  const selectedDay = Math.min(activeDay, dayCount - 1);
  const dayRefreshment = refreshments[selectedDay];

  return (
    <div className="space-y-5">
      <EventDataHeader data={eventData?.requestDetails} />

      {dayCount > 1 && (
        <nav
          className="flex border-b border-[#374155]"
          aria-label="Food event days"
        >
          {Array.from({ length: dayCount }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveDay(index)}
              className={`border-b-2 px-5 py-2 text-[10px] font-medium transition ${
                selectedDay === index
                  ? "border-[#8B3DFF] text-[#9F68FF]"
                  : "border-transparent text-[#CBC3D7]/75 hover:text-white"
              }`}
            >
              Day {index + 1}
            </button>
          ))}
        </nav>
      )}

      {dayRefreshment ? (
        <>
          <FoodDetails refreshment={dayRefreshment} />
        </>
      ) : (
        <p className="py-8 text-center text-sm text-[#CBC3D7]/65">
          No food details were submitted for Day {selectedDay + 1}.
        </p>
      )}
    </div>
  );
};

export default FacultyFoodRefreshmentDetailsPanel;
