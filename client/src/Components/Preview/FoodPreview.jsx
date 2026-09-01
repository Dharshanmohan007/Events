import React, { useState } from "react";
import {
  Calendar,
  Users,
  Phone,
  User,
  CheckCircle2,
} from "lucide-react";

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function formatDate(date) {
  if (!date) return "—";

  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const MEALS = ["Breakfast", "Lunch", "Dinner"];

// -------------------------------------------------------
// Header
// -------------------------------------------------------

function PreviewHeader() {
  return (
    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <h2 className="text-[24px] font-bold text-[#8B5CF6]">
          Food Preview
        </h2>

        <p className="mt-2 text-sm text-[#98A2B3] max-w-3xl leading-6">
          Review the complete food and refreshments arrangement for the
          selected event day, including resource persons, accompanying
          staff, meal preferences and any special catering requirements
          before final submission.
        </p>
      </div>

    </div>
  );
}

// -------------------------------------------------------
// Divider Card
// -------------------------------------------------------

function TwoColumnCard({
  leftLabel,
  leftValue,
  leftIcon: LeftIcon,
  rightLabel,
  rightValue,
  rightIcon: RightIcon,
}) {
  return (
    <div className="bg-[#252C3F] border border-[#343C59] rounded-xl overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* Left */}

        <div className="flex items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-3">

            {LeftIcon && (
              <LeftIcon
                size={18}
                className="text-[#C4B5FD]"
              />
            )}

            <span className="text-[14px] text-[#C4C8D4]">
              {leftLabel}
            </span>
          </div>

          <span className="font-semibold text-white text-[16px]">
            {leftValue || "—"}
          </span>
        </div>

        {/* Right */}

        <div className="border-l border-[#434A60] flex items-center justify-between gap-6 px-6 py-6">

          <div className="flex items-center gap-3">

            {RightIcon && (
              <RightIcon
                size={18}
                className="text-[#C4B5FD]"
              />
            )}

            <span className="text-[14px] text-[#C4C8D4]">
              {rightLabel}
            </span>
          </div>

          <span className="font-semibold text-white text-[16px] text-right">
            {rightValue || "—"}
          </span>
        </div>

      </div>
    </div>
  );
}

// -------------------------------------------------------
// Meal Row
// -------------------------------------------------------

function MealRow({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}) {
  return (
    <div className="bg-[#2A3042] border border-[#394156] rounded-xl overflow-hidden">
      <div className={`grid grid-cols-1 ${rightLabel ? 'lg:grid-cols-2' : ''}`}>

        <div className="flex justify-between items-center px-5 py-6">
          <span className="text-[#C4C8D4] text-[14px]">
            {leftLabel}
          </span>

          <span className="font-bold text-white text-[20px]">
            {leftValue ?? 0}
          </span>
        </div>

        {rightLabel && (
          <div className="border-t lg:border-t-0 lg:border-l border-[#434A60] flex justify-between items-center px-5 py-6">
            <span className="text-[#C4C8D4] text-[14px]">
              {rightLabel}
            </span>

            <span className="font-bold text-white text-[20px]">
              {rightValue ?? 0}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
// -------------------------------------------------------
// Meal Section
// -------------------------------------------------------

function MealSection({ title, data = {} }) {
  // data is day[meal.toLowerCase()] e.g., day.breakfast
  const participants = data?.participants || {};
  const vipGuests = data?.vipGuests || {};
  const trainer = data?.trainer || {};
  const placement = data?.placement || {};

  return (
    <div className="border border-[#343C59] rounded-2xl bg-[#1E2435] p-5">
      <h3 className="text-[26px] font-bold text-[#8B5CF6] mb-5">
        {title}
      </h3>

      <div className="space-y-3">
        {/* Participants & VIP */}
        <MealRow
          leftLabel="No. of Veg In Participants Menu"
          leftValue={participants.vegCount || 0}
          rightLabel="No. of Veg In Guest/VIP Menu"
          rightValue={vipGuests.vegCount || 0}
        />

        <MealRow
          leftLabel="No. of Non-veg In Participants Menu"
          leftValue={participants.nonVegCount || 0}
          rightLabel={title === "Lunch" ? "No. of Non-veg In Guest/VIP Menu" : ""}
          rightValue={title === "Lunch" ? (vipGuests.nonVegCount || 0) : ""}
        />
        
        {/* Trainer & Placement */}
        {(title === "Lunch") && (
          <>
            <MealRow
              leftLabel="No. of Veg In Trainer Menu"
              leftValue={trainer.vegCount || 0}
              rightLabel="No. of Veg In Placement Menu"
              rightValue={placement.vegCount || 0}
            />
            <MealRow
              leftLabel="No. of Non-veg In Trainer Menu"
              leftValue={trainer.nonVegCount || 0}
              rightLabel="No. of Non-veg In Placement Menu"
              rightValue={placement.nonVegCount || 0}
            />
          </>
        )}
        {(title === "Breakfast" || title === "Dinner") && (
          <MealRow
            leftLabel="No. of Veg In Trainer Menu"
            leftValue={trainer.vegCount || 0}
            rightLabel="No. of Veg In Placement Menu"
            rightValue={placement.vegCount || 0}
          />
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Main Component
// -------------------------------------------------------

export default function FoodPreview({ foodData = [] }) {
  const [activeDay, setActiveDay] = useState(0);

  if (!Array.isArray(foodData) || foodData.length === 0) {
    return (
      <div className="rounded-2xl border border-[#343C59] bg-[#1E2435] p-12 text-center">
        <p className="text-[#98A2B3]">
          No Food & Refreshment Details Added
        </p>
      </div>
    );
  }

  const safeIndex = Math.min(activeDay, foodData.length - 1);

  const day = foodData[safeIndex] || {};

  const staffList =
    day.staffList && day.staffList.length
      ? day.staffList
      : day.staffName
      ? [
          {
            name: day.staffName,
            mobile: day.mobileNumber,
          },
        ]
      : [];

  const selectedMeals = MEALS.filter((meal) =>
    (day.foodTypes || []).includes(meal)
  );

  return (
    <div className="space-y-6">

      {/* Day Tabs */}

      {foodData.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {foodData.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveDay(index)}
              className={`px-6 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap ${
                safeIndex === index
                  ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                  : "bg-[#252C3F] border-[#343C59] text-[#C4C8D4] hover:border-[#7C3AED]"
              }`}
            >
              Day {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Main Card */}

      <div className="rounded-2xl bg-[#1C2233] border border-[#343C59] p-6 space-y-6">

        <PreviewHeader />

        {/* Information Cards */}

        <TwoColumnCard
          leftLabel="Date"
          leftValue={formatDate(day.date)}
          leftIcon={Calendar}
          rightLabel="Type of Resource Person"
          rightValue={(day.resourcePersonType || []).join(" / ")}
          rightIcon={Users}
        />

        <TwoColumnCard
          leftLabel="Total number of Resource Person"
          leftValue={
            day.resourcePersons
              ? `${day.resourcePersons} Members`
              : "0 Members"
          }
          leftIcon={Users}
          rightLabel="Total number of Internal Accompanying Person"
          rightValue={
            day.internalCount
              ? `${day.internalCount} Members`
              : "0 Members"
          }
          rightIcon={Users}
        />

        <TwoColumnCard
          leftLabel="Accompanying Staff Name"
          leftValue={
            staffList.length
              ? staffList.map((s) => s.name).join(", ")
              : "—"
          }
          leftIcon={User}
          rightLabel="Accompanying Mobile Number"
          rightValue={
            staffList.length
              ? staffList
                  .map((s) => s.mobile || s.mobileNumber)
                  .join(", ")
              : "—"
          }
          rightIcon={Phone}
        />

        {/* Remaining content (Breakfast, Lunch, Dinner, Special Requirements)
            will come in Part 2B */}
        {/* Refreshment Counts */}

        {(day.foodTypes || []).includes("Morning Refreshment") && !(day.foodTypes || []).includes("Evening Refreshment") && (
          <MealRow
            leftLabel="Morning Refreshment Count"
            leftValue={day.morningRefreshmentCount || "0"}
          />
        )}
        
        {!(day.foodTypes || []).includes("Morning Refreshment") && (day.foodTypes || []).includes("Evening Refreshment") && (
          <MealRow
            leftLabel="Evening Refreshment Count"
            leftValue={day.eveningRefreshmentCount || "0"}
          />
        )}

        {(day.foodTypes || []).includes("Morning Refreshment") && (day.foodTypes || []).includes("Evening Refreshment") && (
          <MealRow
            leftLabel="Morning Refreshment Count"
            leftValue={day.morningRefreshmentCount || "0"}
            rightLabel="Evening Refreshment Count"
            rightValue={day.eveningRefreshmentCount || "0"}
          />
        )}

        {/* Meal Sections */}

        {selectedMeals.includes("Breakfast") && (
          <MealSection
            title="Breakfast"
            data={day.breakfast || {}}
          />
        )}

        {selectedMeals.includes("Lunch") && (
          <MealSection
            title="Lunch"
            data={day.lunch || {}}
          />
        )}

        {selectedMeals.includes("Dinner") && (
          <MealSection
            title="Dinner"
            data={day.dinner || {}}
          />
        )}

        {/* Special Requirements */}

        <div className="border border-[#343C59] rounded-2xl bg-[#1E2435] p-5">

          <h3 className="text-[24px] font-bold text-[#8B5CF6] mb-4">
            Special Requirements
          </h3>

          <div className="bg-[#2A3042] border border-[#343C59] rounded-xl p-5">

            <p className="text-[#D6D8E1] text-[14px] leading-6 whitespace-pre-wrap">
              {day.specialRequirements?.trim()
                ? day.specialRequirements
                : "No special requirements provided."}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}