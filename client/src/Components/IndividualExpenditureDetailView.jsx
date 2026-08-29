import React from "react";
import {
  Megaphone,
  CalendarDays,
  UserRound,
  Mail,
  Phone,
  Network,
  FileCheck2,
  Pencil,
  Check,
  ClipboardList,
} from "lucide-react";

const EventRequestDetails = () => {
  const organizers = [
    {
      name: "Surya Chandran",
      email: "user@gmail.com",
      phone: "1234567890",
      department: "CSE",
    },
    {
      name: "Surya Chandran",
      email: "user@gmail.com",
      phone: "1234567890",
      department: "CSE",
    },
  ];

  const documents = [
    {
      type: "Reference poster",
      file: "Previous Event Completion Document.pdf",
    },
    {
      type: "Reference poster",
      file: "Previous Event Completion Document.pdf",
    },
    {
      type: "Reference poster",
      file: "Previous Event Completion Document.pdf",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0b1324] text-white">

      {/* =========================================================
          TOP HEADER
      ========================================================= */}

      <div className="flex h-[62px] w-full items-center justify-between px-[28px]">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-[8px]">

          <span className="text-[13px] font-medium text-[#7d8597]">
            Expenditure reports
          </span>

          <span className="text-[15px] text-[#6e7688]">
            ›
          </span>

          <span className="text-[14px] font-medium text-[#b9a7e8]">
            Welcome Freshers
          </span>

          {/* EDIT */}

          <button
            type="button"
            className="
              ml-[5px]
              flex
              h-[25px]
              w-[25px]
              items-center
              justify-center
              rounded-[5px]
              bg-[#1b263b]
              text-[#b477ff]
              transition
              hover:bg-[#26324a]
            "
          >
            <Pencil size={12} strokeWidth={2} />
          </button>

        </div>


        {/* APPROVE */}

        <button
          type="button"
          className="
            flex
            h-[32px]
            min-w-[119px]
            items-center
            justify-center
            gap-[7px]
            rounded-[5px]
            bg-[#008b76]
            px-[18px]
            text-[13px]
            font-semibold
            text-white
            transition
            hover:bg-[#009b83]
          "
        >
          <Check size={15} strokeWidth={2.5} />
          <span>Approve</span>
        </button>

      </div>


      {/* =========================================================
          PAGE CONTENT
      ========================================================= */}

      <div className="px-[24px] pb-[25px]">

        {/* =======================================================
            EVENT REQUEST DETAILS
        ======================================================= */}

        <div
          className="
            w-full
            rounded-[8px]
            border
            border-[#29364b]
            bg-[#172033]
            p-[13px]
          "
        >

          {/* TITLE */}

          <h1
            className="
              text-[16px]
              font-semibold
              leading-[20px]
              text-[#a84cff]
            "
          >
            Event Request Details
          </h1>


          {/* DESCRIPTION */}

          <p
            className="
              mt-[5px]
              text-[10px]
              font-normal
              leading-[14px]
              text-[#7d8597]
            "
          >
            Lorem Ipsum is simply dummy text of the printing and
            typesetting industry. Lorem Ipsum has been the industry's
            standard dummy text ever since the 1500s
          </p>


          {/* =====================================================
              EVENT DETAILS
          ===================================================== */}

          <div
            className="
              mt-[12px]
              grid
              h-[63px]
              grid-cols-[1fr_1fr_1.7fr]
              overflow-hidden
              rounded-[6px]
              bg-[#252f43]
            "
          >

            <EventField
              icon={<Megaphone size={15} strokeWidth={1.7} />}
              label="EVENT NAME"
              value="Nexus Annual Tech Summit 2024"
            />

            <EventField
              icon={<Megaphone size={15} strokeWidth={1.7} />}
              label="EVENT TYPE"
              value="Nexus Annual Tech Summit 2024"
            />

            <EventField
              icon={<CalendarDays size={15} strokeWidth={1.7} />}
              label="SUBMISSION DATE"
              value="09:30 AM"
              last
            />

          </div>


          {/* =====================================================
              ORGANIZER DETAILS
          ===================================================== */}

          <div
            className="
              mt-[12px]
              rounded-[7px]
              border
              border-[#344158]
              bg-[#202a3d]
              p-[11px]
            "
          >

            {organizers.map((organizer, index) => (
              <div
                key={index}
                className={`
                  grid
                  h-[55px]
                  grid-cols-[1.05fr_1fr_1fr_0.78fr]
                  overflow-hidden
                  rounded-[5px]
                  bg-[#2a3447]
                  ${index === 0 ? "mb-[8px]" : ""}
                `}
              >

                <OrganizerField
                  icon={<UserRound size={14} strokeWidth={1.7} />}
                  label="ORGANIZER NAME"
                  value={organizer.name}
                />

                <OrganizerField
                  icon={<Mail size={14} strokeWidth={1.7} />}
                  label="ORGANIZER EMAIL"
                  value={organizer.email}
                />

                <OrganizerField
                  icon={<Phone size={14} strokeWidth={1.7} />}
                  label="ORGANIZER PHONE NUMBER"
                  value={organizer.phone}
                />

                <OrganizerField
                  icon={<Network size={14} strokeWidth={1.7} />}
                  label="ORGANIZER DEPARTMENT"
                  value={organizer.department}
                  last
                />

              </div>
            ))}

          </div>


          {/* =====================================================
              LIST OF DOCUMENTS
          ===================================================== */}

          <div
            className="
              mt-[12px]
              rounded-[7px]
              border
              border-[#344158]
              bg-[#202a3d]
              px-[13px]
              pt-[13px]
              pb-[10px]
            "
          >

            <h2
              className="
                mb-[10px]
                text-[16px]
                font-semibold
                leading-[20px]
                text-[#a84cff]
              "
            >
              List of documents
            </h2>


            <div className="space-y-[10px]">

              {documents.map((document, index) => (
                <div
                  key={index}
                  className="
                    grid
                    h-[55px]
                    grid-cols-[1fr_1fr]
                    overflow-hidden
                    rounded-[6px]
                    bg-[#2a3447]
                  "
                >

                  {/* DOCUMENT TYPE */}

                  <div
                    className="
                      flex
                      items-center
                      border-r
                      border-[#505a6d]
                      px-[13px]
                    "
                  >
                    <span className="text-[12px] text-[#b6bdca]">
                      {document.type}
                    </span>
                  </div>


                  {/* FILE */}

                  <div
                    className="
                      flex
                      items-center
                      gap-[9px]
                      px-[13px]
                    "
                  >

                    <div
                      className="
                        flex
                        h-[29px]
                        w-[29px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-[7px]
                        bg-[#087d72]/30
                        text-[#00c6ad]
                      "
                    >
                      <FileCheck2 size={15} strokeWidth={1.8} />
                    </div>

                    <span
                      className="
                        truncate
                        text-[12px]
                        font-medium
                        text-[#c8ccd5]
                      "
                    >
                      {document.file}
                    </span>

                  </div>

                </div>
              ))}

            </div>

          </div>

        </div>


        {/* =========================================================
            EXPENDITURE DETAILS
        ========================================================= */}

        <div
          className="
            mt-[14px]
            w-full
            rounded-[8px]
            border
            border-[#29364b]
            bg-[#172033]
            px-[15px]
            pt-[14px]
            pb-[15px]
          "
        >

          {/* SECTION TITLE */}

          <h2
            className="
              mb-[14px]
              text-[16px]
              font-semibold
              leading-[20px]
              text-[#a84cff]
            "
          >
            Expenditure details
          </h2>


          {/* =====================================================
              FOOD
          ===================================================== */}

          <ExpenditureCard
            title="Food"
            rows={[
              {
                leftLabel: "Registration ( NO’s )",
                leftValue: "2",
                rightLabel: "Registration ( NO’s )",
                rightValue: "2",
              },
              {
                leftLabel: "Calculation",
                leftValue: "1",
                rightLabel: "Calculation",
                rightValue: "1",
              },
              {
                leftLabel: "Amount",
                leftValue: "20",
                rightLabel: "Document",
                rightValue: "Previous Event Completion Document.pdf",
                document: true,
              },
            ]}
          />


          {/* =====================================================
              TRANSPORT
          ===================================================== */}

          <ExpenditureCard
            title="Transport"
            rows={[
              {
                leftLabel: "Registration ( NO’s )",
                leftValue: "2",
                rightLabel: "Registration ( NO’s )",
                rightValue: "2",
              },
              {
                leftLabel: "Calculation",
                leftValue: "1",
                rightLabel: "Calculation",
                rightValue: "1",
              },
              {
                leftLabel: "Amount",
                leftValue: "20",
                rightLabel: "Document",
                rightValue: "Previous Event Completion Document.pdf",
                document: true,
              },
            ]}
          />

        </div>


        {/* =========================================================
            OTHER DETAILS
        ========================================================= */}

        <div
          className="
            mt-[14px]
            w-full
            rounded-[8px]
            border
            border-[#29364b]
            bg-[#172033]
            px-[15px]
            pt-[14px]
            pb-[15px]
          "
        >

          {/* TITLE */}

          <h2
            className="
              mb-[14px]
              text-[16px]
              font-semibold
              leading-[20px]
              text-[#a84cff]
            "
          >
            Other details
          </h2>


          {/* =====================================================
              PARTICIPANTS DETAILS
          ===================================================== */}

          <ExpenditureCard
            title="Participants Details"
            rows={[
              {
                leftLabel: "Registration ( NO’s )",
                leftValue: "2",
                rightLabel: "Registration ( NO’s )",
                rightValue: "2",
              },
              {
                leftLabel: "Calculation",
                leftValue: "1",
                rightLabel: "Calculation",
                rightValue: "1",
              },
              {
                leftLabel: "Amount",
                leftValue: "20",
                rightLabel: "Registration ( NO’s )",
                rightValue: "2",
              },
            ]}
          />


          {/* =====================================================
              SDG DETAILS
          ===================================================== */}

          <div
            className="
              mt-[14px]
              grid
              h-[54px]
              grid-cols-2
              overflow-hidden
              rounded-[7px]
              bg-[#2a3447]
            "
          >

            {/* PRIMARY SDG */}

            <div
              className="
                flex
                items-center
                justify-between
                border-r
                border-[#596274]
                px-[20px]
              "
            >

              <span className="text-[12px] text-[#b6bdca]">
                Primary SDG
              </span>

              <span className="text-[12px] font-semibold text-[#e1e4ea]">
                SDG1
              </span>

            </div>


            {/* SECONDARY SDG */}

            <div
              className="
                flex
                items-center
                justify-between
                px-[20px]
              "
            >

              <span className="text-[12px] text-[#b6bdca]">
                Secondary SDG
              </span>

              <span className="text-[12px] font-semibold text-[#e1e4ea]">
                SDG1,SDG2,SDG3
              </span>

            </div>

          </div>


          {/* =====================================================
              ABOUT THE PROGRAM
          ===================================================== */}

          <div
            className="
              mt-[14px]
              rounded-[7px]
              bg-[#2a3447]
              px-[16px]
              pt-[14px]
              pb-[15px]
            "
          >

            {/* TITLE */}

            <div className="flex items-center gap-[7px]">

              <ClipboardList
                size={15}
                strokeWidth={1.7}
                className="text-[#e1e4ea]"
              />

              <h3
                className="
                  text-[13px]
                  font-medium
                  text-[#e1e4ea]
                "
              >
                About the program
              </h3>

            </div>


            {/* DESCRIPTION */}

            <p
              className="
                mt-[13px]
                text-[11px]
                font-normal
                leading-[21px]
                text-[#c3c8d2]
              "
            >
              Lorem Ipsum is simply dummy text of the printing and
              typesetting industry. Lorem Ipsum has been the industry's
              standard dummy text ever since the 1500s Lorem Ipsum is
              simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever
              since the 1500s
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};


/* ================================================================
   EVENT FIELD
================================================================ */

const EventField = ({
  icon,
  label,
  value,
  last = false,
}) => {
  return (
    <div
      className={`
        flex
        min-w-0
        items-center
        gap-[9px]
        px-[11px]
        ${!last ? "border-r border-[#596274]" : ""}
      `}
    >

      <div className="shrink-0 text-[#c29cff]">
        {icon}
      </div>

      <div className="min-w-0">

        <div
          className="
            text-[8px]
            font-medium
            uppercase
            leading-[10px]
            text-[#858d9e]
          "
        >
          {label}
        </div>

        <div
          className="
            mt-[3px]
            truncate
            text-[12px]
            font-semibold
            leading-[15px]
            text-[#e1e4ea]
          "
        >
          {value}
        </div>

      </div>

    </div>
  );
};


/* ================================================================
   ORGANIZER FIELD
================================================================ */

const OrganizerField = ({
  icon,
  label,
  value,
  last = false,
}) => {
  return (
    <div
      className={`
        flex
        min-w-0
        items-center
        gap-[9px]
        px-[9px]
        ${!last ? "border-r border-[#596274]" : ""}
      `}
    >

      <div className="shrink-0 text-[#c29cff]">
        {icon}
      </div>

      <div className="min-w-0">

        <div
          className="
            truncate
            text-[8px]
            font-medium
            uppercase
            leading-[10px]
            text-[#858d9e]
          "
        >
          {label}
        </div>

        <div
          className="
            mt-[3px]
            truncate
            text-[12px]
            font-semibold
            leading-[15px]
            text-[#e1e4ea]
          "
        >
          {value}
        </div>

      </div>

    </div>
  );
};


/* ================================================================
   EXPENDITURE CARD
================================================================ */

const ExpenditureCard = ({
  title,
  rows,
}) => {
  return (
    <div
      className="
        mb-[13px]
        rounded-[8px]
        border
        border-[#3a465b]
        bg-[#252e41]
        px-[16px]
        pt-[14px]
        pb-[9px]
      "
    >

      {/* CARD TITLE */}

      <div className="mb-[7px] flex items-center gap-[6px]">

        <ClipboardList
          size={14}
          strokeWidth={1.7}
          className="text-[#e0e4eb]"
        />

        <h3
          className="
            text-[13px]
            font-medium
            text-[#e0e4eb]
          "
        >
          {title}
        </h3>

      </div>


      {/* TWO COLUMNS */}

      <div className="grid grid-cols-2">

        {/* LEFT */}

        <div className="border-r border-[#596274] pr-[20px]">

          {rows.map((row, index) => (
            <ExpenditureRow
              key={index}
              label={row.leftLabel}
              value={row.leftValue}
            />
          ))}

        </div>


        {/* RIGHT */}

        <div className="pl-[15px]">

          {rows.map((row, index) => (
            <ExpenditureRow
              key={index}
              label={row.rightLabel}
              value={row.rightValue}
              document={row.document}
            />
          ))}

        </div>

      </div>

    </div>
  );
};


/* ================================================================
   EXPENDITURE ROW
================================================================ */

const ExpenditureRow = ({
  label,
  value,
  document = false,
}) => {
  return (
    <div
      className="
        flex
        h-[38px]
        items-center
        justify-between
        border-b
        border-[#394357]
      "
    >

      {/* LABEL */}

      <span
        className="
          truncate
          pr-[10px]
          text-[11px]
          font-normal
          text-[#b8beca]
        "
      >
        {label}
      </span>


      {/* VALUE / DOCUMENT */}

      {document ? (
        <div className="flex min-w-0 items-center gap-[7px]">

          <div
            className="
              flex
              h-[26px]
              w-[26px]
              shrink-0
              items-center
              justify-center
              rounded-[7px]
              bg-[#087d72]/30
              text-[#00c6ad]
            "
          >
            <FileCheck2
              size={14}
              strokeWidth={1.8}
            />
          </div>

          <span
            className="
              max-w-[250px]
              truncate
              text-[12px]
              font-medium
              text-[#c9ced7]
            "
          >
            {value}
          </span>

        </div>
      ) : (
        <span
          className="
            shrink-0
            text-[12px]
            font-semibold
            text-[#e1e4ea]
          "
        >
          {value}
        </span>
      )}

    </div>
  );
};

export default EventRequestDetails;