import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  Upload,
} from "lucide-react";
import { API_BASE } from "../utils/apiConfig";

const EventRequestDetails = () => {
  const { requestId } = useParams();
  const [detailData, setDetailData] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const expenditureId = detailData?.expenditure?._id || "6a9552ebf8a412f5ec3babdb";

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/api/individual/expenditure/${expenditureId}/approve`, {
        method: "PUT",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          remarks: "Approved after review",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve expenditure");
      }

      const result = await response.json();
      console.log("Approval successful:", result);
      alert("Approved successfully");
    } catch (error) {
      console.error("Error approving expenditure:", error);
      alert("Approval failed. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  useEffect(() => {
    const fetchExpenditure = async () => {
      if (!requestId) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/individual/expenditure/${requestId}`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch expenditure details");
        }

        const payload = await response.json();
        setDetailData(payload?.data ?? payload);
      } catch (error) {
        console.error("Error fetching individual expenditure details:", error);
      }
    };

    fetchExpenditure();
  }, [requestId]);
  const faculty = detailData?.faculty || detailData?.data?.faculty || {};
  const organizer = faculty || {};
  const expenditure = detailData?.expenditure ?? {};
  const purchaseRows = Array.isArray(expenditure?.purchase) ? expenditure.purchase : [];
  const othersRows = Array.isArray(expenditure?.others) ? expenditure.others : [];
  const foodRows = Array.isArray(expenditure?.food) ? expenditure.food : [];
  const transportRows = Array.isArray(expenditure?.transport) ? expenditure.transport : [];
  const expenseRows = transportRows.length
    ? transportRows
    : purchaseRows.length
      ? purchaseRows
      : othersRows.length
        ? othersRows
        : foodRows;
  const expenseItem = expenseRows[0] ?? {};

  const moduleLabel =
    transportRows.length
      ? "Transport Details"
      : purchaseRows.length
        ? "Purchase Details"
        : othersRows.length
          ? "Other Details"
          : foodRows.length
            ? "Food Details"
            : "Expenditure Details";

  const nameCandidates = [
    detailData?.name,
    detailData?.facultyName,
    detailData?.fullName,
    detailData?.employeeName,
    detailData?.requesterName,
    detailData?.organizerName,
    detailData?.user?.name,
    detailData?.requester?.name,
    detailData?.organizer?.name,
    detailData?.faculty?.name,
    detailData?.faculty?.facultyName,
    detailData?.faculty?.fullName,
    detailData?.faculty?.employeeName,
    detailData?.faculty?.displayName,
    [detailData?.faculty?.firstName, detailData?.faculty?.lastName].filter(Boolean).join(" "),
    detailData?.faculty?.username,
    organizer?.name,
    organizer?.facultyName,
    organizer?.fullName,
    organizer?.employeeName,
    organizer?.displayName,
    [organizer?.firstName, organizer?.lastName].filter(Boolean).join(" "),
    organizer?.username,
  ];

  const organizerEmail = organizer?.email || organizer?.empEmail || organizer?.facultyEmail || organizer?.mail || detailData?.faculty?.email || detailData?.email || "";

  const getDisplayNameFromEmail = (email) => {
    if (!email || typeof email !== "string") return "";
    const localPart = email.split("@")[0];
    const parts = localPart.split(/[._-]+/).filter(Boolean);
    if (!parts.length) return "";

    return parts
      .map((part) => {
        const lower = part.toLowerCase();
        if (lower === "pm" || lower === "am" || lower === "hr") {
          return lower.toUpperCase();
        }
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .join(" ");
  };

  const organizerName =
    nameCandidates.find((value) => typeof value === "string" && value.trim()) ||
    getDisplayNameFromEmail(organizerEmail) ||
    "";
  const organizerPhone = organizer?.phone || organizer?.phoneNumber || organizer?.mobile || organizer?.mobileNumber || organizer?.contactNumber || organizer?.contactNo || detailData?.faculty?.phone || detailData?.phone || "";
  const organizerDepartment = organizer?.department || organizer?.departmentName || organizer?.program || organizer?.branch || organizer?.specialization || detailData?.faculty?.department || detailData?.department || "";

  const formatDisplayDate = (value) => {
    if (!value) return "";

    const normalizeDateParts = (year, month, day) => {
      const safeYear = Number(year);
      const safeMonth = Number(month);
      const safeDay = Number(day);

      if (!safeYear || !safeMonth || !safeDay) return "";

      return new Date(safeYear, safeMonth - 1, safeDay).toLocaleDateString("en-GB");
    };

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return "";

      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        const [year, month, day] = trimmed.split("-").map(Number);
        return normalizeDateParts(year, month, day);
      }

      if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(trimmed)) {
        const [day, month, year] = trimmed.split(/[/-]/).map(Number);
        return normalizeDateParts(year, month, day);
      }

      if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
        const dateOnly = trimmed.split("T")[0];
        const [year, month, day] = dateOnly.split("-").map(Number);
        return normalizeDateParts(year, month, day);
      }
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleDateString("en-GB");
  };

  const submissionDateValue =
    detailData?.createdAt ||
    detailData?.submittedAt ||
    detailData?.submittedDate ||
    detailData?.requestDate ||
    detailData?.data?.createdAt ||
    detailData?.data?.submittedAt ||
    detailData?.data?.submittedDate ||
    detailData?.data?.requestDate ||
    "";

  const submissionDate = formatDisplayDate(submissionDateValue);
  const resolveFileName = (file) => {
    if (!file) return "";
    if (typeof file === "string") return file.split("/").pop() || file;
    return file.originalName || file.name || file.filename || file.originalFilename || file.fileName || file.file?.name || "";
  };
  const resolveFileUrl = (file) => {
    if (!file) return "";
    if (typeof file === "string") return file;
    return file.url || file.fileUrl || file.downloadUrl || file.link || file.path || "";
  };
  const supportFile =
    expenseItem?.supportingDocument ||
    expenseItem?.supportingDocuments?.[0] ||
    expenditure?.supportingDocument ||
    expenditure?.supportingDocuments?.[0];
  const supportFileName = resolveFileName(supportFile);
  const supportFileUrl = resolveFileUrl(supportFile);

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
          onClick={handleApprove}
          disabled={isApproving}
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
            disabled:cursor-not-allowed
            disabled:opacity-70
          "
        >
          <Check size={15} strokeWidth={2.5} />
          <span>{isApproving ? "Approving..." : "Approve"}</span>
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
              text-[14px]
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
              text-[11px]
              font-normal
              leading-[16px]
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
              icon={<CalendarDays size={15} strokeWidth={1.7} />}
              label="SUBMISSION DATE"
              value={submissionDate}
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

            <div
              className="
                grid
                h-[55px]
                grid-cols-[1.05fr_1fr_1fr_0.78fr]
                overflow-hidden
                rounded-[5px]
                bg-[#2a3447]
              "
            >

              <OrganizerField
                icon={<UserRound size={14} strokeWidth={1.7} />}
                label="ORGANIZER NAME"
                value={organizerName}
              />

              <OrganizerField
                icon={<Mail size={14} strokeWidth={1.7} />}
                label="ORGANIZER EMAIL"
                value={organizerEmail}
              />

              <OrganizerField
                icon={<Phone size={14} strokeWidth={1.7} />}
                label="ORGANIZER PHONE NUMBER"
                value={organizerPhone}
              />

              <OrganizerField
                icon={<Network size={14} strokeWidth={1.7} />}
                label="ORGANIZER DEPARTMENT"
                value={organizerDepartment}
                last
              />

            </div>

          </div>


          {/* =====================================================
              LIST OF DOCUMENTS
          ===================================================== */}

         

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
              text-[12px]
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

          <div
            className="
              mb-[13px]
              rounded-[8px]
              border
              border-[#3a465b]
              bg-[#252e41]
              px-[16px]
              pt-[14px]
              pb-[14px]
            "
          >
            <div className="mb-[16px] flex items-center justify-between gap-4">
              <h3 className="text-[12px] font-semibold text-[#b16cff]">
                {moduleLabel}
              </h3>

              
            </div>

            <div className="space-y-[16px]">
              <div>
                <label className="mb-[8px] block text-[12px] font-medium text-[#e7ebf5]">
                  Name of the expense
                </label>
                <input
                  type="text"
                  value={expenseItem?.expenseName || ""}
                  readOnly
                  className="w-full rounded-[8px] border border-[#4b5670] bg-transparent px-[12px] py-[10px] text-[12px] text-[#dfe3ec] placeholder:text-[#7d8ba4]"
                />
              </div>

              <div className="grid gap-[16px] md:grid-cols-2">
                <div>
                  <label className="mb-[8px] block text-[12px] font-medium text-[#e7ebf5]">
                    Bill No
                  </label>
                  <input
                    type="text"
                    value={expenseItem?.billNo || ""}
                    readOnly
                    className="w-full rounded-[8px] border border-[#4b5670] bg-transparent px-[12px] py-[10px] text-[12px] text-[#dfe3ec]"
                  />
                </div>

                <div>
                  <label className="mb-[8px] block text-[12px] font-medium text-[#e7ebf5]">
                    Bill Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={expenseItem?.billDate ? formatDisplayDate(expenseItem.billDate) : ""}
                      readOnly
                      className="w-full rounded-[8px] border border-[#4b5670] bg-transparent px-[12px] py-[10px] pr-[42px] text-[12px] text-[#dfe3ec]"
                    />
                    <span className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[#dfe3ec]">
                      <CalendarDays size={18} strokeWidth={1.8} />
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-[16px] md:grid-cols-2">
                <div>
                  <label className="mb-[8px] block text-[12px] font-medium text-[#e7ebf5]">
                    Vendor / Guest name
                  </label>
                  <input
                    type="text"
                    value={expenseItem?.vendorOrGuestName || ""}
                    readOnly
                    className="w-full rounded-[8px] border border-[#4b5670] bg-transparent px-[12px] py-[10px] text-[12px] text-[#dfe3ec]"
                  />
                </div>

                <div>
                  <label className="mb-[8px] block text-[12px] font-medium text-[#e7ebf5]">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-[#dfe3ec]">
                      ₹
                    </span>
                    <input
                      type="text"
                      value={expenseItem?.amount || ""}
                      readOnly
                      className="w-full rounded-[8px] border border-[#4b5670] bg-transparent px-[36px] py-[10px] text-[12px] text-[#dfe3ec]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-[8px] block text-[12px] font-medium text-[#e7ebf5]">
                  Upload (if have any supporting document )
                </label>
                <div className="rounded-[10px] border-2 border-dashed border-[#4b5670] bg-[#111b2e] px-[20px] py-[22px] text-center text-[#c7d0e0]">
                  <div className="mb-[8px] flex justify-center text-[#dfe6f5]">
                    <Upload size={18} strokeWidth={1.8} />
                  </div>

                  {supportFileName ? (
                    <a
                      href={supportFileUrl || "#"}
                      target={supportFileUrl ? "_blank" : undefined}
                      rel={supportFileUrl ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-[8px] text-[12px] text-[#dfe3ec] underline decoration-[#bc7cff] underline-offset-2"
                    >
                      <span className="inline-flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-[#0d7268] text-[#c9fff8]">
                        <FileCheck2 size={14} strokeWidth={1.8} />
                      </span>
                      {supportFileName}
                    </a>
                  ) : (
                    <div className="text-[12px]">
                      Drag and drop the files here or
                      <span className="ml-1 font-medium text-[#bc7cff]">choose file</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* =====================================================
              TRANSPORT
          ===================================================== */}

        

        </div>


        {/* =========================================================
            OTHER DETAILS
        ========================================================= */}

      

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
            text-[11px]
            font-medium
            uppercase
            leading-[12px]
            text-[#858d9e]
          "
        >
          {label}
        </div>

        <div
          className="
            mt-[3px]
            truncate
            text-[13px]
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
            text-[11px]
            font-medium
            uppercase
            leading-[12px]
            text-[#858d9e]
          "
        >
          {label}
        </div>

        <div
          className="
            mt-[3px]
            truncate
            text-[13px]
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
            text-[14px]
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
  if (label === "F") {
    return null;
  }

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