import React from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Building2,
  Utensils,
  Bus,
  BedDouble,
  FileText,
  GraduationCap,
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  CalendarClock,
  Info,
  BriefcaseBusiness,
  CircleDot,
} from "lucide-react";

const EventsAttendedDetailView = ({
  data = {},
  status = "Acknowledged",
  onBack,
  onClose,
}) => {
  // Default values prevent errors when fields are missing.
  const event = {
    type: data.type || data.programType || "",
    name: data.name || data.programName || "",
    participants: data.participants || data.numberOfParticipants || "",
    expectedOutcome: data.expectedOutcome || "",
    fromDate: data.fromDate || data.startDate || "",
    toDate: data.toDate || data.endDate || "",
    dutyFromDate: data.dutyFromDate || data.onDutyFromDate || "",
    dutyToDate: data.dutyToDate || data.onDutyToDate || "",
    foodRequired: data.foodRequired ?? "No",
    transportRequired: data.transportRequired ?? "No",
    accommodationRequired: data.accommodationRequired ?? "No",
    otherRequirements: data.otherRequirements || data.others || "",
    ...data,
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isRequired = (value) => {
    return (
      value === true ||
      String(value).toLowerCase() === "yes" ||
      String(value).toLowerCase() === "true"
    );
  };

  const getValue = (value) => {
    if (value === undefined || value === null || value === "") {
      return "Not specified";
    }

    return value;
  };

  // Reusable detail card
  const DetailCard = ({ icon: Icon, label, value, className = "" }) => (
    <div
      className={`rounded-lg border border-slate-700/80
      bg-slate-800/70 p-4 transition-all duration-300
      hover:border-purple-500/50 hover:bg-slate-800 ${className}`}
    >
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        <Icon size={15} className="shrink-0 text-purple-400" />
        <span className="text-[10px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="break-words text-sm font-semibold text-slate-100">
        {getValue(value)}
      </p>
    </div>
  );

  // Reusable section heading
  const SectionHeading = ({ icon: Icon, title, subtitle }) => (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="rounded-md bg-purple-500/10 p-2">
          <Icon size={17} className="text-purple-400" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-purple-400">{title}</h3>

          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Yes / No requirement badge
  const RequirementBadge = ({ value }) => {
    const required = isRequired(value);

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full
        px-3 py-1.5 text-xs font-medium
        ${
          required
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-slate-500/10 text-slate-400"
        }`}
      >
        {required ? <CheckCircle2 size={14} /> : <XCircle size={14} />}

        {required ? "Required" : "Not Required"}
      </span>
    );
  };

  const statusColors = {
    Acknowledged: "bg-emerald-500/10 text-emerald-400",
    Approved: "bg-emerald-500/10 text-emerald-400",
    Pending: "bg-amber-500/10 text-amber-400",
    Rejected: "bg-red-500/10 text-red-400",
    Closed: "bg-slate-500/10 text-slate-300",
  };

  const normalizedStatus =
    status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();

  return (
    
    <div className="min-h-screen py-3 bg-[#0b1124]  text-white ">
        {console.log("redered")}
      <div className="mx-auto px-14 ">
        {/* TOP NAVIGATION */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="mr-1 rounded-md p-2 text-slate-400
                transition hover:bg-slate-800 hover:text-white"
                title="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            )}

            <span className="text-slate-500">Faculty Request List</span>

            <span className="text-slate-600">&gt;</span>

            <span className="font-medium text-purple-300">
              {getValue(event.name)}
            </span>

            <span
              className="ml-2 rounded-full bg-purple-500/10
              px-3 py-1 text-[11px] font-medium text-purple-400"
            >
              {getValue(event.type)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-md
              px-4 py-2 text-xs font-semibold
              ${
                statusColors[normalizedStatus] || "bg-slate-700 text-slate-300"
              }`}
            >
              <CheckCircle2 size={14} />
              {status || "Acknowledged"}
            </span>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-emerald-600 px-5 py-2
                text-xs font-semibold text-white transition
                hover:bg-emerald-500"
              >
                <CheckCircle2 size={14} className="mr-2 inline" />
                Close
              </button>
            )}
          </div>
        </div>

        {/* MAIN DETAILS CARD */}
        <div
          className="overflow-hidden rounded-lg border
          border-slate-800 bg-[#151e33] shadow-xl"
        >
          {/* HEADER */}
          <div
            className="border-b border-slate-700/70
            bg-gradient-to-r from-[#202a40] to-[#182137]
            px-5 py-4 sm:px-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2
                  className="flex items-center gap-2 text-base
                  font-semibold text-purple-400 sm:text-lg"
                >
                  <BriefcaseBusiness size={19} />
                  Events Attended Details
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Complete information about the requested program, event or
                  visit.
                </p>
              </div>

              <span
                className="rounded-full border border-slate-600
                bg-slate-800/70 px-3 py-1 text-[10px]
                font-medium uppercase tracking-wider text-slate-300"
              >
                Request Details
              </span>
            </div>
          </div>

          {/* CARD CONTENT */}
          <div className="space-y-6 p-4 sm:p-6">
            {/* SECTION 1: EVENT INFORMATION */}
            <section>
              <SectionHeading
                icon={FileText}
                title="Program / Event Information"
                subtitle="Basic details of the program or visit"
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <DetailCard
                  icon={GraduationCap}
                  label="Type of Program / Event / Visit"
                  value={event.type}
                />

                <DetailCard
                  icon={BriefcaseBusiness}
                  label="Name of Program / Event / Visit"
                  value={event.name}
                />

                <DetailCard
                  icon={Users}
                  label="Number of Participants"
                  value={
                    event.participants
                      ? `${event.participants} Participants`
                      : ""
                  }
                  className="md:col-span-2"
                />

                <DetailCard
                  icon={ClipboardCheck}
                  label="Expected Outcome"
                  value={event.expectedOutcome}
                  className="md:col-span-2"
                />
              </div>
            </section>

            {/* SECTION 2: PROGRAM DATES */}
            <section>
              <SectionHeading
                icon={CalendarDays}
                title="Program / Event Dates"
                subtitle="Scheduled dates of the program or visit"
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <DetailCard
                  icon={CalendarCheck}
                  label="From Date"
                  value={formatDate(event.fromDate)}
                />

                <DetailCard
                  icon={CalendarCheck}
                  label="To Date"
                  value={formatDate(event.toDate)}
                />
              </div>

              {/* Date range banner */}
              <div
                className="mt-3 flex flex-wrap items-center gap-3
                rounded-lg border border-purple-500/20
                bg-purple-500/5 p-4"
              >
                <div className="rounded-lg bg-purple-500/10 p-2.5">
                  <CalendarDays size={20} className="text-purple-400" />
                </div>

                <div className="flex-1">
                  <p
                    className="text-[10px] uppercase tracking-wider
                    text-slate-400"
                  >
                    Event Duration
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-100">
                    {formatDate(event.fromDate)}
                    <span className="mx-3 text-purple-400">→</span>
                    {formatDate(event.toDate)}
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: ON-DUTY / OFF-CAMPUS */}
            <section>
              <SectionHeading
                icon={Clock}
                title="On-Duty / Off-Campus Time"
                subtitle="Requested duty or off-campus period"
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <DetailCard
                  icon={CalendarClock}
                  label="From Date"
                  value={formatDate(event.dutyFromDate)}
                />

                <DetailCard
                  icon={CalendarClock}
                  label="To Date"
                  value={formatDate(event.dutyToDate)}
                />
              </div>
            </section>

            {/* SECTION 4: FACILITIES */}
            <section>
              <SectionHeading
                icon={Building2}
                title="Facilities & Requirements"
                subtitle="Facilities requested for the program"
              />

              <div
                className="grid grid-cols-1 gap-3
                md:grid-cols-3"
              >
                {/* FOOD */}
                <div
                  className="rounded-lg border border-slate-700/80
                  bg-slate-800/70 p-4 transition duration-300
                  hover:border-purple-500/50"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-orange-500/10 p-2">
                        <Utensils size={17} className="text-orange-400" />
                      </div>

                      <span className="text-sm font-medium text-slate-200">
                        Food Required
                      </span>
                    </div>
                  </div>

                  <RequirementBadge value={event.foodRequired} />
                </div>

                {/* TRANSPORT */}
                <div
                  className="rounded-lg border border-slate-700/80
                  bg-slate-800/70 p-4 transition duration-300
                  hover:border-purple-500/50"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-blue-500/10 p-2">
                        <Bus size={17} className="text-blue-400" />
                      </div>

                      <span className="text-sm font-medium text-slate-200">
                        Transport Required
                      </span>
                    </div>
                  </div>

                  <RequirementBadge value={event.transportRequired} />
                </div>

                {/* ACCOMMODATION */}
                <div
                  className="rounded-lg border border-slate-700/80
                  bg-slate-800/70 p-4 transition duration-300
                  hover:border-purple-500/50"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-indigo-500/10 p-2">
                        <BedDouble size={17} className="text-indigo-400" />
                      </div>

                      <span className="text-sm font-medium text-slate-200">
                        Accommodation Required
                      </span>
                    </div>
                  </div>

                  <RequirementBadge value={event.accommodationRequired} />
                </div>
              </div>
            </section>

            {/* SECTION 5: OTHER REQUIREMENTS */}
            <section>
              <SectionHeading
                icon={Info}
                title="Other Requirements"
                subtitle="Additional information and special requests"
              />

              <div
                className="rounded-lg border border-slate-700/80
                bg-slate-800/70 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-center gap-2">
                  <CircleDot size={15} className="text-purple-400" />

                  <h4
                    className="text-xs font-medium uppercase
                    tracking-wider text-slate-400"
                  >
                    Others, If Any Requirements
                  </h4>
                </div>

                <p
                  className="whitespace-pre-wrap break-words
                  text-sm leading-7 text-slate-300"
                >
                  {event.otherRequirements ||
                    "No additional requirements specified."}
                </p>
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <div
            className="flex flex-wrap items-center justify-between
            gap-3 border-t border-slate-700/70
            bg-[#111a2d] px-5 py-4 sm:px-6"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={15} className="text-emerald-400" />
              Events Attended Request Details
            </div>

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-md
                border border-slate-600 bg-slate-800 px-5 py-2.5
                text-sm font-medium text-slate-200 transition
                hover:border-purple-500 hover:bg-slate-700"
              >
                <ArrowLeft size={16} />
                Back to List
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsAttendedDetailView;
