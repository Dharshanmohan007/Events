import React, { useEffect } from "react";
import { motion } from "motion/react";

import {
  Clock1,
  X,
  Check,
  CheckCircle2,
  ShieldCheck,
  Clock3,

  // Department icons
  Bus,
  Building2,
  Volume2,
  Utensils,
  Monitor,
  Video,
  ShoppingCart,
  Hotel,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| Canvas Animation
|--------------------------------------------------------------------------
*/

const canvasVariants = {
  hidden: {
    opacity: 0,
    x: 200,
  },

  visible: {
    opacity: 1,
    x: 0,

    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

/*
|--------------------------------------------------------------------------
| Department Configuration
|--------------------------------------------------------------------------
|
| The backend gives us only the department key.
|
| Example:
|
| audio
| icts
| refreshment
|
| Here we tell the UI which icon, label and colors
| should be used for each department.
|
*/

const departmentConfig = {
  transport: {
    label: "Transport",
    icon: Bus,
    iconColor: "text-blue-400",
    iconBackground: "bg-blue-500/15",
  },

  venue: {
    label: "Venue",
    icon: Building2,
    iconColor: "text-orange-400",
    iconBackground: "bg-orange-500/15",
  },

  audio: {
    label: "Audio",
    icon: Volume2,
    iconColor: "text-purple-400",
    iconBackground: "bg-purple-500/15",
  },

  refreshment: {
    label: "Refreshment",
    icon: Utensils,
    iconColor: "text-yellow-400",
    iconBackground: "bg-yellow-500/15",
  },

  /*
   * If your backend uses "food"
   * instead of "refreshment".
   */
  food: {
    label: "Food",
    icon: Utensils,
    iconColor: "text-yellow-400",
    iconBackground: "bg-yellow-500/15",
  },

  icts: {
    label: "ICTS",
    icon: Monitor,
    iconColor: "text-cyan-400",
    iconBackground: "bg-cyan-500/15",
  },

  media: {
    label: "Media",
    icon: Video,
    iconColor: "text-pink-400",
    iconBackground: "bg-pink-500/15",
  },

  purchase: {
    label: "Purchase",
    icon: ShoppingCart,
    iconColor: "text-green-400",
    iconBackground: "bg-green-500/15",
  },

  accommodation: {
    label: "Accommodation",
    icon: Hotel,
    iconColor: "text-indigo-400",
    iconBackground: "bg-indigo-500/15",
  },
};

/*
|--------------------------------------------------------------------------
| Date Formatter
|--------------------------------------------------------------------------
|
| Converts:
|
| 2026-09-18T02:38:42.860Z
|
| into:
|
| Sep 18, 2026
|
*/

const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/*
|--------------------------------------------------------------------------
| Time Formatter
|--------------------------------------------------------------------------
|
| Converts the timestamp into the user's local time.
|
*/

const formatTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/*
|--------------------------------------------------------------------------
| Date + Time Formatter
|--------------------------------------------------------------------------
*/

const formatDateTime = (dateString) => {
  if (!dateString) return "";

  return `${formatDate(dateString)} · ${formatTime(dateString)}`;
};

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

const ApprovalHistoryCanvas = ({ timeLineData, setShowApprovalCanvas }) => {
  /*
   |--------------------------------------------------------------------------
   | Disable body scrolling while canvas is open
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Get timeline data
   |--------------------------------------------------------------------------
   |
   | Your prop is expected to contain:
   |
   | {
   |   departments: {...},
   |   submittedAt: "...",
   |   adminApprovedAt: "..."
   | }
   |
   */

  const timeline = timeLineData?.timeline || timeLineData || {};

  /*
   |--------------------------------------------------------------------------
   | Get departments
   |--------------------------------------------------------------------------
   |
   | Example:
   |
   | departments = {
   |   audio: {...},
   |   icts: {...},
   |   refreshment: {...}
   | }
   |
   */

  const departments = timeline.departments || {};

  /*
   |--------------------------------------------------------------------------
   | Convert departments object into an array
   |--------------------------------------------------------------------------
   |
   | Object.keys() gives us ONLY the departments
   | that actually exist in the API response.
   |
   | So we DON'T show pending departments.
   |
   */

  const departmentTimeline = Object.keys(departments)
    .map((departmentKey) => {
      /*
       * Get the department data.
       *
       * Example:
       *
       * departmentKey = "audio"
       *
       * departmentData =
       * {
       *   acknowledgedAt: "2026-09-18..."
       * }
       */

      const departmentData = departments[departmentKey];

      /*
       * Get UI configuration.
       *
       * Example:
       *
       * audio -> Volume2 icon
       */

      const config = departmentConfig[departmentKey];

      /*
       * Return everything needed by the UI.
       */

      return {
        key: departmentKey,

        /*
         * If a department doesn't have configuration,
         * use the department name as a fallback.
         */

        label:
          config?.label ||
          departmentKey.charAt(0).toUpperCase() + departmentKey.slice(1),

        /*
         * Use configured icon.
         *
         * CircleHelp could also be used as fallback,
         * but here we simply use Clock3.
         */

        icon: config?.icon || Clock3,

        iconColor: config?.iconColor || "text-slate-400",

        iconBackground: config?.iconBackground || "bg-slate-500/15",

        /*
         * Timestamp received from backend.
         */

        acknowledgedAt: departmentData?.acknowledgedAt || null,
      };
    })

    /*
     * Sort departments based on acknowledgement time.
     *
     * This means the timeline follows the actual order
     * in which departments acknowledged the request.
     */

    .sort((a, b) => {
      return new Date(a.acknowledgedAt) - new Date(b.acknowledgedAt);
    });

  /*
   |--------------------------------------------------------------------------
   | Number of departments
   |--------------------------------------------------------------------------
   */

  const departmentCount = departmentTimeline.length;

  return (
    <>
      {/* ================================================================
          BACKDROP
          ================================================================ */}

      <div
        className="
          fixed
          inset-0
          z-[100]
          bg-black/40
          backdrop-blur-[2px]
        "
      />

      {/* ================================================================
          RIGHT SIDE CANVAS
          ================================================================ */}

      <motion.div
        variants={canvasVariants}
        initial="hidden"
        animate="visible"
        className="
          fixed
          right-0
          top-0
          z-[110]

          h-screen
          w-full
          sm:w-[420px]
          lg:w-[30%]

          overflow-hidden

          bg-[linear-gradient(17deg,rgba(15,23,43,1)_0%,rgba(1,11,36,1)_64%,rgba(0,13,61,1)_94%)]

          text-white

          shadow-[-20px_0_60px_rgba(0,0,0,0.35)]
        "
      >
        {/* ==============================================================
            HEADER
            ============================================================== */}

        <div
          className="
            flex
            items-center
            justify-between

            border-b
            border-white/10

            px-4
            py-4
          "
        >
          {/* Header */}

          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center

                rounded-lg

                bg-blue-500/10

                text-blue-400

                ring-1
                ring-blue-400/20
              "
            >
              <Clock1 size={18} />
            </div>

            <div>
              <h1 className="text-sm font-semibold">Approval Timeline</h1>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Track request progress
              </p>
            </div>
          </div>

          {/* Close button */}

          <button
            onClick={() => setShowApprovalCanvas(false)}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* ==============================================================
            TIMELINE CONTENT
            ============================================================== */}

        <div
          className="
            h-[calc(100vh-73px)]
            overflow-y-auto
            px-5
            py-6
            table-custom-scrollbar
          "
        >
          {/* ============================================================
              MAIN TIMELINE
              ============================================================ */}

          <div className="relative">
            {/* ==========================================================
                MAIN VERTICAL LINE
                ========================================================== */}

            <div
              className="
                absolute

                left-[15px]
                top-5
                bottom-5

                w-px

                bg-gradient-to-b
                from-emerald-400/70
                via-blue-400/50
                to-slate-700
              "
            />

            {/* ==========================================================
                SUBMITTED
                ========================================================== */}

            <div className="relative flex gap-4">
              {/* Timeline icon */}

              <div
                className="
                  relative
                  z-10
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-emerald-700
                  text-white
                  shadow-[0_0_15px_rgba(16,185,129,0.25)]
                "
              >
                <Check size={15} strokeWidth={3} />
              </div>

              {/* Timeline content */}

              <div className="min-w-0 flex-1 pb-7">
                <h2 className="text-sm font-semibold">Submitted</h2>

                <p className="mt-1 text-xs text-slate-400">
                  Request submitted successfully
                </p>

                {timeline.submittedAt && (
                  <p className="mt-1.5 text-[10px] text-slate-500">
                    {formatDateTime(timeline.submittedAt)}
                  </p>
                )}
              </div>
            </div>

            {/* ==========================================================
                ADMIN APPROVED
                ========================================================== */}

            <div className="relative flex gap-4">
              {/* Timeline icon */}

              <div
                className="
                  relative
                  z-10

                  flex
                  h-8
                  w-8
                  shrink-0

                  items-center
                  justify-center

                  rounded-full

                  bg-emerald-700

                  text-white

                  shadow-[0_0_15px_rgba(16,185,129,0.25)]
                "
              >
                <ShieldCheck size={16} strokeWidth={2.5} />
              </div>

              {/* Content */}

              <div className="min-w-0 flex-1 pb-8">
                <h2 className="text-sm font-semibold">Admin Approved</h2>

                <p className="mt-1 text-xs text-slate-400">
                  Approved by administrator
                </p>

                {timeline.adminApprovedAt && (
                  <p className="mt-1.5 text-[10px] text-slate-500">
                    {formatDateTime(timeline.adminApprovedAt)}
                  </p>
                )}
              </div>
            </div>

            {/* ==========================================================
                DEPARTMENT SECTION
                ========================================================== */}

            {departmentCount > 0 && (
              <>
                {/* Section heading */}

                <div className="relative ml-12 mb-5">
                  <div
                    className="
                      flex
                      items-center
                      justify-between

                      rounded-lg

                      bg-white/[0.04]

                      px-3
                      py-2

                      ring-1
                      ring-white/[0.05]
                    "
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="
                          flex
                          h-6
                          w-6

                          items-center
                          justify-center

                          rounded-md

                          bg-blue-500/10

                          text-blue-400
                        "
                      >
                        <Clock3 size={13} />
                      </div>

                      <span
                        className="
                          text-[11px]
                          font-medium
                          text-slate-300
                        "
                      >
                        Department Acknowledgements
                      </span>
                    </div>

                    {/* Number of departments */}

                    <span
                      className="
                        rounded-full
                        bg-white/[0.06]
                        w-8 h-8
                        flex items-center justify-center
                        px-2
                        py-2
                        text-[12px]
                        text-white"
                    >
                      {departmentCount}
                    </span>
                  </div>
                </div>

                {/* ======================================================
                    DEPARTMENT TIMELINE
                    ====================================================== */}

                <div className="relative ml-4">
                  {/* Department vertical line */}

                  <div
                    className="
                      absolute
                      left-0
                      top-0
                      bottom-0
                      w-px
                      bg-slate-700/70
                    "
                  />

                  {/* ====================================================
                      DYNAMIC DEPARTMENTS
                      ==================================================== */}

                  {departmentTimeline.map((department) => {
                    /*
                     * Get the icon component.
                     */

                    const DepartmentIcon = department.icon;

                    return (
                      <div
                        key={department.key}
                        className="
                          relative

                          flex
                          gap-3

                          pl-5
                        "
                      >
                        {/* =================================================
                            Timeline dot
                            ================================================= */}

                        <div
                          className="
                            absolute

                            left-[-4px]
                            top-3

                            h-2
                            w-2

                            rounded-full

                            bg-emerald-400

                            shadow-[0_0_8px_rgba(52,211,153,0.7)]
                          "
                        />

                        {/* =================================================
                            Department Icon
                            ================================================= */}

                        <div
                          className={`
                            flex
                            h-9
                            w-9
                            shrink-0

                            items-center
                            justify-center

                            rounded-full

                            ${department.iconBackground}

                            ${department.iconColor}

                            ring-1
                            ring-white/5
                          `}
                        >
                          <DepartmentIcon size={17} />
                        </div>

                        {/* =================================================
                            Department Information
                            ================================================= */}

                        <div
                          className="
                            min-w-0
                            flex-1

                            pb-5
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-2
                            "
                          >
                            {/* Department name */}

                            <h3
                              className="
                                text-xs
                                font-semibold
                                text-white
                              "
                            >
                              {department.label}
                            </h3>

                            {/* Check icon */}

                            <div
                              className="
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-emerald-500/20
                                text-emerald-400
                              "
                            >
                              <Check size={15} strokeWidth={3} />
                            </div>
                          </div>

                          {/* Status */}

                          <p
                            className="
                              -mt-1
                              text-[10px]
                              text-slate-400
                            "
                          >
                            Acknowledged
                          </p>

                          {/* Date */}

                          <p className="mt-1 text-[9px]text-white ">
                            {formatDateTime(department.acknowledgedAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ==========================================================
                END OF TIMELINE
                ========================================================== */}

            <div
              className="
                relative
                mt-2

                flex
                gap-4
              "
            >
              {/* Final icon */}

              <div
                className="
                  relative
                  z-10
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-slate-800
                  text-slate-400
                  ring-1
                  ring-slate-700
                "
              >
                <CheckCircle2 size={17} />
              </div>

              {/* Final text */}

              <div className="min-w-0 flex-1">
                <h2
                  className="
                    text-sm
                    font-semibold
                    text-slate-400
                  "
                >
                  Department Review
                </h2>

                <p
                  className="
                    mt-1

                    text-xs

                    text-slate-600
                  "
                >
                  {departmentCount} department
                  {departmentCount !== 1 ? "s" : ""} acknowledged
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ApprovalHistoryCanvas;
