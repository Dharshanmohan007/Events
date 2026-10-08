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
        <h2 className="text-xl font-semibold text-purple-400 playfair">
          Food Preview
        </h2>

        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1 max-w-3xl leading-6">
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
    <div className="rounded-xl bg-slate-50 dark:bg-[#20263B] border border-slate-200 dark:border-[#343C59] overflow-hidden">
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

            <span className="text-slate-500 dark:text-gray-400 text-xs uppercase">
              {leftLabel}
            </span>
          </div>

          <span className="font-semibold text-slate-900 dark:text-white text-[16px]">
            {leftValue || "—"}
          </span>
        </div>

        {/* Right */}

        <div className="border-l border-slate-200 dark:border-slate-200 dark:border-[#434A60] flex items-center justify-between gap-6 px-6 py-6">

          <div className="flex items-center gap-3">

            {RightIcon && (
              <RightIcon
                size={18}
                className="text-[#C4B5FD]"
              />
            )}

            <span className="text-slate-500 dark:text-gray-400 text-xs uppercase">
              {rightLabel}
            </span>
          </div>

          <span className="font-semibold text-slate-900 dark:text-white text-[16px] text-right">
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
    <div className="rounded-xl bg-slate-50 dark:bg-[#20263B] border border-slate-200 dark:border-[#343C59] overflow-hidden">
      <div className={`grid grid-cols-1 ${rightLabel ? 'lg:grid-cols-2' : ''}`}>

        <div className="flex justify-between items-center px-5 py-6">
          <span className="text-slate-500 dark:text-gray-400 text-xs uppercase">
            {leftLabel}
          </span>

          <span className="font-bold text-slate-900 dark:text-white text-[20px]">
            {leftValue ?? 0}
          </span>
        </div>

        {rightLabel && (
          <div className="border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-200 dark:border-[#434A60] flex justify-between items-center px-5 py-6">
            <span className="text-slate-500 dark:text-gray-400 text-xs uppercase">
              {rightLabel}
            </span>

            <span className="font-bold text-slate-900 dark:text-white text-[20px]">
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
    <div className="rounded-xl bg-slate-50 dark:bg-[#20263B] border border-slate-200 dark:border-[#343C59] p-5">
      <h3 className="font-semibold mb-5 text-lg">
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
      <div className="bg-white dark:bg-[#161B2D] rounded-xl border border-slate-200 dark:border-[#2E3652] p-12 text-center text-slate-900 dark:text-white">
        <p className="text-slate-500 dark:text-gray-400">
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
                  ? "bg-purple-600 text-slate-900 dark:text-white"
                  : "bg-white dark:bg-[#1c1c34] text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-[#2a2a45] hover:text-slate-900 dark:text-white"
              }`}
            >
              Day {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Main Card */}

      <div className="bg-white dark:bg-[#161B2D] rounded-xl border border-slate-200 dark:border-[#2E3652] p-6 text-slate-900 dark:text-white space-y-6">

        <PreviewHeader />

        {/* Information Cards */}

        <TwoColumnCard
          leftLabel="From Date"
          leftValue={formatDate(day.fromDate)}
          leftIcon={Calendar}
          rightLabel="To Date"
          rightValue={formatDate(day.toDate)}
          rightIcon={Calendar}
        />

        <TwoColumnCard
          leftLabel="Type of Resource Person"
          leftValue={(day.resourcePersonType || []).join(" / ")}
          leftIcon={Users}
          rightLabel="Total number of Resource Person"
          rightValue={
            day.resourcePersons
              ? `${day.resourcePersons} Members`
              : "0 Members"
          }
          rightIcon={Users}
        />

        <TwoColumnCard
          leftLabel="Total number of Internal Accompanying Person"
          leftValue={
            day.internalCount
              ? `${day.internalCount} Members`
              : "0 Members"
          }
          leftIcon={Users}
          rightLabel="-"
          rightValue="-"
          rightIcon={null}
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

        <div className="rounded-xl bg-slate-50 dark:bg-[#20263B] border border-slate-200 dark:border-[#343C59] p-5">

          <h3 className="font-semibold mb-5 text-lg">
            Special Requirements
          </h3>

          <div className="rounded-xl bg-slate-50 dark:bg-[#20263B] border border-slate-200 dark:border-[#343C59] p-5">

            <p className="text-slate-500 dark:text-gray-400 text-sm leading-6 whitespace-pre-wrap">
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