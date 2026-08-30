import React, { useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Mail,
  Phone,
  UserRound,
  Network,
  FileText,
  CalendarDays,
  Mars,
  Venus,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";
import axios from "axios";

const documents = [
  {
    name: "Reference poster",
    file: "Previous Event Completion Document.pdf",
  },
  {
    name: "Reference poster",
    file: "Previous Event Completion Document.pdf",
  },
  {
    name: "Reference poster",
    file: "Previous Event Completion Document.pdf",
  },
];

const incomeDetails = [
  {
    title: "Scholarship",
    registration: "2",
    calculation: "1",
    amount: "20",
    details:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s Lorem Ipsum is simply dummy text of the printing",
  },
  {
    title: "Details",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s Lorem Ipsum is simply dummy text of the printing",
  },
  {
    title: "Institutional Amount",
    registration: "2",
    calculation: "1",
    amount: "20",
  },
  {
    title: "Details",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s Lorem Ipsum is simply dummy text of the printing",
  },
];

const EventsExpenditureDetailView = () => {
  const { eventId } = useParams();

  // Auth
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const role = decoded.role;

  const isAdmin = () => {
    if (
      role === "super admin 1" ||
      role === "admin" ||
      role === "super admin 2"
    ) {
      return true;
    }

    return false;
  };

  isAdmin();

  //    ------------------ states ---------------------

  const [eventDocuments, setEventDocuments] = useState(null);
  const [eventData, setEventData] = useState(null);
  const [organizerData, setOrganizerData] = useState(null);
  const [overAllData, setOverAllData] = useState(null);
  const [incomeData, setIncomeData] = useState(null);
  const [expenditureData, setExpenditureData] = useState(null);
  const [participantsData, setParticipantsData] = useState(null);
  const [expenditureOverAllData, setExpenditureOverAllData] = useState(null);
  const [expenditureToBeShown, setExpenditureToBeShown] = useState(null);

  //   -------------------- functions ----------------

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDocuments = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/event-closing-documents/event/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setOverAllData(res.data.data);
      setEventDocuments(res.data?.data?.documents);
      setEventData(res.data.data.eventId.requestDetails.eventDetails);
      setOrganizerData(
        res.data.data.eventId.requestDetails.organizerDetails.organizers,
      );
    } catch (err) {
      console.error(
        "error occured while fetching closing documents in Events - Expenditure detail view : ",
        err.message,
      );
    }
  };

  const fetchExpenditureDetails = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/event-expenditures/event/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("Expenditure data  : ", res.data.data);
      setExpenditureOverAllData(res.data.data);
      setIncomeData(res.data.data.income);
      setExpenditureData(res.data.data.expenditure);
      setParticipantsData(res.data.data.participants);
    } catch (err) {
      console.error(
        "error occured while fetching expenditure data in Events - Expenditure detail view : ",
        err.message,
      );
    }
  };

  //  -------------------------- useEffect's -----------------
  useEffect(() => {
    getDocuments();
    fetchExpenditureDetails();
  }, [eventId]);

  //   ----------------- consoles ----------------------

  console.log("expenditure data : ", expenditureOverAllData);
  //   console.log("organizer's data : ", organizerData);

  //  --------------------- jsx ------------------------

  return (
    <>
      <main className="bg-[#0b1326] mx-6">
        {/* ------------- header -----------   */}
        <div className="flex h-[54px] w-full items-center justify-between">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-medium text-[#737b8f]">
              Expenditure reports
            </span>

            <span className="text-[18px] text-[#4c556b]">
              <ChevronRight size={16} />
            </span>

            <span className="text-[18px] font-medium text-[#d9ddeb]">
               {eventData?.eventName}
            </span>

            <button
              type="button"
              className="ml-1 flex h-[26px] w-[26px] items-center justify-center rounded-[3px] bg-[#172137] text-[#00c99a] transition hover:bg-[#202b43]"
            >
              <Pencil size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Approve button */}
          <button
            type="button"
            className="flex h-[34px] cursor-pointer items-center gap-1.5 rounded-[3px] bg-linear-to-r from-emerald-700 to-emerald-900 px-4 text-[14px] font-medium text-white transition hover:bg-[#009f89]"
          >
            <Check size={16} strokeWidth={2.5} />
            Approve
          </button>
        </div>

        <div className="content-container bg-[#171f31] p-4  rounded-lg border border-gray-800">
          <section className="w-full text-white">
            {/* Heading */}
            <div className="mb-3">
              <h2 className="text-[18px] font-medium text-[#9747ff]">
                Event Request Details
              </h2>
            </div>

            {/* Event Basic Details */}
            <div className="flex min-h-[52px] items-center rounded-md border border-[#283147] bg-[#20283b] px-2">
              {/* Event Name */}
              <div className="flex w-[27%] py-3 items-center gap-2 border-r border-[#4a5264] pr-3">
                <div className="flex h-5 w-5 items-center justify-center">
                  <Pencil size={11} className="text-[#b9a0ff]" />
                </div>

                <div>
                  <p className="text-[12px] uppercase text-[#777f91]">
                    Event Name
                  </p>
                  <p className="mt-[2px] text-[14px] font-medium text-white">
                    {eventData?.eventName}
                  </p>
                </div>
              </div>

              {/* Event Type */}
              <div className="flex w-[27%] items-center gap-2 border-r border-[#4a5264] px-3">
                <div className="flex h-5 w-5 items-center justify-center">
                  <Pencil size={11} className="text-[#b9a0ff]" />
                </div>

                <div>
                  <p className="text-[12px] uppercase text-[#777f91]">
                    Event Type
                  </p>
                  <p className="mt-[2px] text-[14px]  font-medium text-white">
                    {eventData?.eventType}
                  </p>
                </div>
              </div>

              {/* Submission Date */}
              <div className="flex flex-1 items-center gap-2 px-3">
                <div className="flex h-5 w-5 items-center justify-center">
                  <CalendarDays size={11} className="text-[#b9a0ff]" />
                </div>

                <div>
                  <p className="text-[12px] uppercase text-[#777f91]">
                    Submission Date
                  </p>
                  <p className="mt-[2px] text-[14px] font-medium text-white">
                    {formatDate(overAllData?.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Organizer Details */}
            {isAdmin() == true && (
              <>
                {organizerData?.map((item) => {
                  return (
                    <div className="mt-2 rounded-md border border-[#283147] bg-[#20283b] p-2">
                      {/* Organizer Row 1 */}
                      <div className="flex h-[60px] items-center rounded-md bg-[#2a3347] px-2">
                        {/* Name */}
                        <div className="flex w-[27%]  items-center gap-2 border-r border-[#555d6f] pr-3">
                          <UserRound size={11} className="text-[#b9a0ff]" />

                          <div>
                            <p className="text-[12px] uppercase text-[#777f91]">
                              Organizer Name
                            </p>
                            <p className="mt-[2px] text-[14px] font-medium">
                              {item?.name}
                            </p>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex w-[27%] items-center gap-2 border-r border-[#555d6f] px-3">
                          <Mail size={11} className="text-[#b9a0ff]" />

                          <div>
                            <p className="text-[12px] uppercase text-[#777f91]">
                              Organizer Email
                            </p>
                            <p className="mt-[2px] text-[14px] font-medium">
                              {item?.email}
                            </p>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="flex w-[27%] items-center gap-2 border-r border-[#555d6f] px-3">
                          <Phone size={11} className="text-[#b9a0ff]" />

                          <div>
                            <p className="text-[12px] uppercase text-[#777f91]">
                              Organizer Phone Number
                            </p>
                            <p className="mt-[2px] text-[14px] font-medium">
                              {item?.mobile}
                            </p>
                          </div>
                        </div>

                        {/* Department */}
                        <div className="flex flex-1 items-center gap-2 pl-3">
                          <Network size={11} className="text-[#b9a0ff]" />

                          <div>
                            <p className="text-[12px] uppercase text-[#777f91]">
                              Organizer Department
                            </p>
                            <p className="mt-[2px] text-[14px] font-medium">
                              {item?.department}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </section>

          {/* -------------- List of documents ---------------  */}
          <div className="w-full rounded-md mt-4 border border-[#283147] bg-[#20283b] p-2">
            {/* Heading */}
            <h2 className="mb-2 px-2 text-[18px] font-medium text-[#9747ff]">
              List of documents
            </h2>

            {/* Documents */}
            <div className="space-y-2">
              {eventDocuments?.map((item, index) => (
                <div
                  key={index}
                  className="flex h-[46px] items-center rounded-md bg-[#2a3347] px-3"
                >
                  {/* Document Type */}
                  <div className="flex w-[50%] items-center border-r border-[#555d6f]">
                    <p className="text-[14px] font-normal text-[#aeb4c2]">
                      {item?.label}
                    </p>
                  </div>

                  {/* File */}
                  <div className="flex flex-1 items-center gap-2 pl-6">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#174b4a]">
                      <FileText
                        size={12}
                        strokeWidth={1.8}
                        className="text-[#00b89c]"
                      />
                    </div>

                    <button
                      onClick={() => {
                        window.open(`${item?.file?.url}`, "_blank");
                      }}
                      className="text-[14px] font-medium underline cursor-pointer text-[#d5d8e1]"
                    >
                      {item?.key}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --------------------------------------- Income source --------------------------------- */}

          <div className="w-full rounded-md mt-4 border border-[#283147] bg-[#20283b] p-2">
            {/* Heading */}
            <h2 className="mb-2 px-2 text-[18px] font-medium text-[#9747ff]">
              Income Source Details
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {incomeData?.map((item) => {
                return (
                  <div className="min-h-[94px] rounded-md mb-2 border border-[#283147] bg-[#2a3347] p-3">
                    <div className="mb-2 flex items-center gap-1">
                      <FileText
                        size={14}
                        strokeWidth={1.8}
                        className="text-[#d2d5de]"
                      />

                      <p className="text-[14px] font-medium text-[#e0e2e8]">
                        {item?.type}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {/* <div className="flex items-center justify-between">
                    <p className="text-[14px] text-[#a1a7b5]">
                      Registration ( NO's )
                    </p>

                    <p className="text-[14px] font-medium text-white">2</p>
                  </div> */}

                      {/* <div className="flex items-center justify-between">
                    <p className="text-[14px] text-[#a1a7b5]">Calculation</p>

                    <p className="text-[14px] font-medium text-white">1</p>
                  </div> */}

                      <div className="flex items-center justify-between">
                        <p className="text-[14px] text-[#a1a7b5]">Amount</p>

                        <p className="text-[14px] font-medium text-white">20</p>
                      </div>
                    </div>

                    <div className="mb-2  mt-3 flex items-center gap-1">
                      <FileText
                        size={14}
                        strokeWidth={1.8}
                        className="text-[#d2d5de]"
                      />

                      <p className="text-[14px] font-medium text-[#e0e2e8]">
                        Details
                      </p>
                    </div>

                    <p className="text-[14px] leading-[14px] text-[#a7a8ac]">
                      {item?.details}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------------------------------------------  Expenditure details -------------------------------  */}
          <div className="w-full rounded-md mt-4 border border-[#283147] bg-[#20283b] p-2">
            {/* Heading */}
            <h2 className="mb-2 px-2 text-[18px] font-medium text-[#9747ff]">
              Expenditure details
            </h2>

            {Object.entries(expenditureData || {}).map(([key, value]) => {
              // Ignore totalAmount, remarks, etc.
              if (!Array.isArray(value) || value.length === 0) {
                return null;
              }

              return (
                <div key={key} className="space-y-2 mb-2">
                  {/* Records inside category */}
                  {value.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-md border border-[#3b4458] bg-[#2a3347] p-2"
                    >
                      <div className="flex items-center">
                        {/* Left Side */}
                        <div className="w-1/2 border-r border-[#555d6f] pr-2">
                          <div className="mb-2 flex items-center gap-1">
                            <FileText
                              size={14}
                              strokeWidth={1.8}
                              className="text-[#d2d5de]"
                            />

                            <p className="text-[14px] font-medium capitalize text-[#e0e2e8]">
                              {key}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[14px] text-[#a1a7b5]">Name</p>

                              <p className="text-[14px] font-medium text-white">
                                {item.name || "-"}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-[14px] text-[#a1a7b5]">
                                Bill No
                              </p>

                              <p className="text-[14px] font-medium text-white">
                                {item.billNo || "-"}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-[14px] text-[#a1a7b5]">
                                Amount
                              </p>

                              <p className="text-[14px] font-medium text-white">
                                ₹{item.billAmount || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Right Side */}
                        <div className="mt-6 w-1/2 pl-2">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[14px] text-[#a1a7b5]">
                                Guest Name
                              </p>

                              <p className="text-[14px] font-medium text-white">
                                {item.guestName || "-"}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-[14px] text-[#a1a7b5]">Date</p>

                              <p className="text-[14px] font-medium text-white">
                                {item.date
                                  ? new Date(item.date).toLocaleDateString(
                                      "en-IN",
                                    )
                                  : "-"}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-[14px] text-[#a1a7b5]">
                                Document
                              </p>

                              {item.supportingDocuments?.length > 0 ? (
                                <div className="flex items-center gap-1">
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#174b4a]">
                                    <FileText
                                      size={10}
                                      strokeWidth={1.8}
                                      className="text-[#00b89c]"
                                    />
                                  </div>

                                  <a
                                    href={item.supportingDocuments[0]?.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="max-w-[220px] truncate text-[14px] font-medium text-[#d5d8e1] hover:underline"
                                  >
                                    View Document
                                  </a>
                                </div>
                              ) : (
                                <p className="text-[14px] text-[#a1a7b5]">
                                  No document
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* ------------------------------------------------ Other details -------------------- */}

          <div className="w-full rounded-md border border-[#283147] mt-4 bg-[#20283b] p-2">
            {/* Heading */}
            <h2 className="mb-2 px-2 text-[18px] font-medium text-[#9747ff]">
              Other details
            </h2>

            {/* Participants Details */}
            <div className="rounded-md border border-[#3b4458] bg-[#2a3347] p-2">
              <div className="mb-2 flex items-center gap-1">
                <FileText
                  size={14}
                  strokeWidth={1.8}
                  className="text-[#d2d5de]"
                />

                <p className="text-[14px] font-medium text-[#e0e2e8]">
                  Participants Details
                </p>
              </div>

              <div className="container-1 grid grid-cols-2 gap-2">
                <div className="space-y-2 mt-2 bg-[#2a34497e] p-2 rounded-lg border border-gray-700">
                  <p className="text-[14px] flex items-center gap-2 font-medium text-[#e0e2e8]">
                    <span>
                      <Mars size={14} />
                    </span>{" "}
                    Male
                  </p>
                  {/* Left */}
                  <div className="w-full">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] text-[#a1a7b5]">
                          Within State
                        </p>

                        <p className="text-[14px] font-medium text-white">
                          {participantsData?.male?.withinState}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full ">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] text-[#a1a7b5]">
                          Outside State
                        </p>

                        <p className="text-[14px] font-medium text-white">
                          {participantsData?.male?.outsideState}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-2 bg-[#2a34497e] p-2 rounded-lg border border-gray-700">
                  <p className="text-[14px] flex items-center gap-2 font-medium text-[#e0e2e8]">
                    <span>
                      <Venus size={14} />
                    </span>{" "}
                    Female
                  </p>
                  {/* Left */}
                  <div className="w-full">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] text-[#a1a7b5]">
                          Within State
                        </p>

                        <p className="text-[14px] font-medium text-white">
                          {participantsData?.female?.withinState}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full ">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] text-[#a1a7b5]">
                          Outside State
                        </p>

                        <p className="text-[14px] font-medium text-white">
                          {participantsData?.female?.outsideState}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SDG Details */}
            <div className="mt-2 flex h-[35px] items-center rounded-md border border-[#3b4458] bg-[#2a3347]">
              {/* Primary SDG */}
              <div className="flex w-1/2 items-center justify-between border-r border-[#555d6f] px-3">
                <p className="text-[14px] text-[#a1a7b5]">Primary SDG</p>

                <p className="text-[14px] font-medium text-white">{expenditureOverAllData?.primarySdg || "--"}</p>
              </div>

              {/* Secondary SDG */}
              <div className="flex w-1/2 items-center justify-between px-3">
                <p className="text-[14px] text-[#a1a7b5]">Secondary SDG</p>

                <p className="text-[14px] font-medium text-white flex flex-wrap gap-1 items-center">
                  {expenditureOverAllData?.secondarySdg.map((item)=>{
                    return <p>{item} ,</p>
                  })}
                </p>
              </div>
            </div>

            {/* About the Program */}
            <div className="mt-2 rounded-md border border-[#3b4458] bg-[#2a3347] p-2">
              <div className="mb-2 flex items-center gap-1">
                <FileText
                  size={14}
                  strokeWidth={1.8}
                  className="text-[#d2d5de]"
                />

                <p className="text-[14px] font-medium text-[#e0e2e8]">
                  About the program
                </p>
              </div>

              <p className="text-[14px] leading-[14px] text-[#d0d3dc]">
               {expenditureOverAllData?.aboutProgram}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EventsExpenditureDetailView;
