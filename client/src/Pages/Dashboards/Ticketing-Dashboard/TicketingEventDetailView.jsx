import React, { useEffect, useState } from "react";
import TicketingNavbar from "./TicketingNavbar";
import {
  ChevronRight,
  UserRound,
  Phone,
  BriefcaseBusiness,
  Building2,
  MapPin,
  VenusAndMars,
  ClipboardList,
  PartyPopper,
  CalendarDays,
  Clock,
  Check,
} from "lucide-react";
import EventHeaderData from "../EventHeaderData";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const TicketingEventDetailView = () => {
  const token = localStorage.getItem("token");

  const { eventId } = useParams();

  // states
  const [eventData, setEventData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // function to fetch the details
  async function fetchEventDetails() {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}?module=externalTransports`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setEventData(res.data.data);
    } catch (err) {
      console.error(
        "error occured while fetching the detail page : ",
        err.message,
      );
    }
  }

  console.log("event external transport data : ", eventData);

  const status = eventData?.externalTransportDetails?.status?.status || "";

  const handleStatusUpdate = async (action) => {
    setActionLoading(true);
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}/status`,
        { action, module: "externalTransports" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.data.success)
        throw new Error(res.data.message || `Failed to ${action}`);
      toast.success(
        `Status updated to ${action === "acknowledge" ? "Acknowledged" : "Completed"} successfully`,
      );
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err.message || `Failed to ${action}`);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, reloadKey]);

  return (
    <>
      <main className="bg-[#0b1326] ">
        <TicketingNavbar />
        <div className="header px-4 mt-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1>Event Details</h1>
            <ChevronRight />
            <h1 className="text-[#d0bcff]">
              {eventData?.requestDetails?.eventDetails?.eventName}
            </h1>
            <h1>--</h1>
            <button className="text-amber-300 bg-amber-200/20 text-xs py-2 px-2 rounded-full">
              {
                eventData?.requestDetails?.organizerDetails
                  ?.organizingDepartment
              }
            </button>
            <h1>--</h1>
            <button
              className={`  ${status.toLowerCase().includes("pending") ? "text-red-500 bg-red-300/10" : "text-green-500"}  text-xs py-2 px-2 rounded-full`}
            >
              {status}
            </button>
          </div>
          {status.toLowerCase() == "pending for acknowledge" && (
            <button
              onClick={() => handleStatusUpdate("acknowledge")}
              disabled={actionLoading}
              className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white px-4 py-2 rounded-lg flex items-center gap-1 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={16} />{" "}
              {actionLoading ? "Processing..." : "Acknowledge"}
            </button>
          )}
          {status.toLowerCase() == "acknowledged" && (
            <button
              onClick={() => handleStatusUpdate("complete")}
              disabled={actionLoading}
              className="bg-gradient-to-r from-[#4A2BB7] to-[#6D3BD8] text-white px-4 py-2 rounded-lg flex items-center gap-1 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={16} /> {actionLoading ? "Processing..." : "Complete"}
            </button>
          )}
        </div>

        {/* main content  */}

        <div className="main-content border border-[#202739] rounded-lg bg-[#182032] mx-5 p-4 mt-4">
          <h1 className="mb-4 font-medium text-violet-700">
            Transportation Details
          </h1>
          <div className="w-full px-1 ">
            {/* Outer Container */}
            <div className="rounded-2xl border border-[#354258] bg-[#1d2638] p-3 shadow-lg">
              {/* Details Container */}
              <div className="grid grid-cols-1 overflow-hidden rounded-xl bg-[#303a4f] md:grid-cols-4">
                {/* Event Name */}
                <div className="flex min-h-[74px] items-center gap-4 border-b border-[#526078] px-5 md:border-b-0 md:border-r">
                  <PartyPopper
                    size={20}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />

                  <div>
                    <p className="text-[10px] font-semibold tracking-[1px] text-[#aeb6c6]">
                      EVENT NAME
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {eventData?.requestDetails?.eventDetails?.eventName}
                    </p>
                  </div>
                </div>

                {/* Event Date */}
                <div className="flex min-h-[74px] items-center gap-4 border-b border-[#526078] px-5 md:border-b-0 md:border-r">
                  <CalendarDays
                    size={20}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />

                  <div>
                    <p className="text-[10px] font-semibold tracking-[1px] text-[#aeb6c6]">
                      EVENT DATE
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {eventData?.requestDetails?.eventDetails?.eventSchedule
                        ?.map((item) =>
                          new Date(item.eventDate).toLocaleDateString("en-GB"),
                        )
                        .join(", ")}
                    </p>
                  </div>
                </div>

                {/* Event Start Time */}
                <div className="flex min-h-[74px] items-center gap-4 border-b border-[#526078] px-5 md:border-b-0 md:border-r">
                  <Clock
                    size={20}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />

                  <div>
                    <p className="text-[10px] font-semibold tracking-[1px] text-[#aeb6c6]">
                      EVENT START TIME
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {eventData?.requestDetails?.eventDetails?.eventSchedule?.map(
                        (item) => {
                          return <p>{item.startTime}</p>;
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* Event End Time */}
                <div className="flex min-h-[74px] items-center gap-4 px-5">
                  <Clock
                    size={20}
                    strokeWidth={1.8}
                    className="text-[#b8a9ed]"
                  />

                  <div>
                    <p className="text-[10px] font-semibold tracking-[1px] text-[#aeb6c6]">
                      EVENT END TIME
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {eventData?.requestDetails?.eventDetails?.eventSchedule?.map(
                        (item) => {
                          return <p>{item.endTime}</p>;
                        },
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* organizer details  */}

          {eventData?.requestDetails?.organizerDetails?.organizers?.map(
            (item) => {
              return (
                <div class="flex w-full mt-2 items-center rounded-lg border border-[#374151] bg-[#2d37489d] px-5 py-3">
                  <div class="flex flex-1 items-center gap-4 border-r border-[#4b5563] pr-6">
                    <i data-lucide="user" class="h-5 w-5 text-[#c4b5fd]"></i>

                    <div>
                      <p class="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                        Organizer Name
                      </p>

                      <p class="mt-1 text-[15px] font-semibold text-white">
                        {item?.name}
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-1 items-center gap-4 border-r border-[#4b5563] px-6">
                    <i data-lucide="mail" class="h-5 w-5 text-[#c4b5fd]"></i>

                    <div>
                      <p class="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                        Organizer Email
                      </p>

                      <p class="mt-1 text-[15px] font-semibold text-white">
                        {item?.email}
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-1 items-center gap-4 border-r border-[#4b5563] px-6">
                    <i data-lucide="phone" class="h-5 w-5 text-[#c4b5fd]"></i>

                    <div>
                      <p class="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                        Organizer Phone Number
                      </p>

                      <p class="mt-1 text-[15px] font-semibold text-white">
                        {item?.mobile}
                      </p>
                    </div>
                  </div>

                  {/* Organizer Department  */}
                  <div class="flex flex-1 items-center gap-4 pl-6">
                    <i data-lucide="network" class="h-5 w-5 text-[#c4b5fd]"></i>

                    <div>
                      <p class="text-[10px] font-medium uppercase tracking-wider text-[#94a3b8]">
                        Organizer Department
                      </p>

                      <p class="mt-1 text-[15px] font-semibold text-white">
                        {item?.department}
                      </p>
                    </div>
                  </div>
                </div>
              );
            },
          )}

          {/* Guest details  */}

          {eventData?.externalTransportDetails?.externalTransports?.map(
            (transport, transportIndex) => (
              <div
                key={transport?._id || transportIndex}
                className="guest-detail-container mt-4 rounded-lg border border-gray-700 p-2"
              >
                <h1 className="mb-2 font-medium text-[#6508e7]">
                  Passenger Details
                </h1>

                {transport?.passengers?.map((item, index) => (
                  <div key={item?._id || index} className="mb-3 last:mb-0">
                    <div className="flex min-h-[100px] items-center rounded-xl bg-[#2d37489d] px-5">
                      {/* Passenger Name */}
                      <div className="flex flex-1 items-center gap-4 border-r border-[#536078] px-4">
                        <UserRound
                          size={22}
                          strokeWidth={1.8}
                          className="text-[#b8a9ed]"
                        />

                        <div>
                          <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                            PASSENGER NAME
                          </p>

                          <p className="text-[15px] font-bold text-[#f4ede8]">
                            {item?.name || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div className="flex flex-1 items-center gap-4 border-r border-[#536078] px-4">
                        <Phone
                          size={22}
                          strokeWidth={1.8}
                          className="text-[#b8a9ed]"
                        />

                        <div>
                          <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                            MOBILE NUMBER
                          </p>

                          <p className="text-[15px] font-bold text-[#f4ede8]">
                            {item?.phone || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Designation */}
                      <div className="flex flex-1 items-center gap-4 border-r border-[#536078] px-4">
                        <BriefcaseBusiness
                          size={22}
                          strokeWidth={1.8}
                          className="text-[#b8a9ed]"
                        />

                        <div>
                          <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                            DESIGNATION
                          </p>

                          <p className="text-[15px] font-bold text-[#f4ede8]">
                            {item?.designation || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Organization */}
                      <div className="flex flex-1 items-center gap-4 border-r border-[#536078] px-4">
                        <Building2
                          size={22}
                          strokeWidth={1.8}
                          className="text-[#b8a9ed]"
                        />

                        <div>
                          <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                            ORGANIZATION
                          </p>

                          <p className="text-[15px] font-bold leading-5 text-[#f4ede8]">
                            {item?.organization || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="flex flex-1 items-center gap-4 px-4">
                        <VenusAndMars
                          size={22}
                          strokeWidth={1.8}
                          className="text-[#b8a9ed]"
                        />

                        <div>
                          <p className="mb-1 text-[10px] font-semibold tracking-[1.2px] text-[#b9c0ce]">
                            GENDER
                          </p>

                          <p className="text-[15px] font-bold text-[#f4ede8]">
                            {item?.gender || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ),
          )}

          {/* Pickup  ---  drop  */}
          {eventData?.externalTransportDetails?.externalTransports?.map(
            (item) => {
              return (
                <>
                  <div className="w-full border border-gray-700 rounded-lg mt-3 px-3 py-3">
                    <div className="flex items-center">
                      {/* Pickup Location */}
                      <div className="flex w-[290px] items-center gap-3 rounded-lg bg-[#344057] px-4 py-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600">
                          <MapPin size={14} className="text-white" />
                        </div>

                        <div>
                          <p className="text-sm font-medium uppercase text-[#aab3c5]">
                            Pickup Location
                          </p>
                          <p className="text-sm font-semibold text-white">
                            {item?.from}
                          </p>
                        </div>
                      </div>

                      <div className="h-0 flex-1 border-t border-dashed border-[#536078]" />

                      {/* Drop Location */}
                      <div className="flex w-[290px] items-center gap-3 rounded-lg bg-[#344057] px-4 py-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600">
                          <MapPin size={14} className="text-white" />
                        </div>

                        <div>
                          <p className="text-sm font-medium uppercase text-[#aab3c5]">
                            Drop Location
                          </p>
                          <p className="text-sm font-semibold text-white">
                            {item?.to}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* count section  */}

                  <div className="w-full rounded-lg  border border-gray-700 mt-3 p-2">
                    {/* First Row */}
                    <div className="grid grid-cols-2 rounded-md border border-[#3d4a61] bg-[#2d37489d]">
                      {/* Total Number of Members */}
                      <div className="flex items-center justify-between border-r border-[#46536a] px-3 py-3">
                        <span className="text-[15px] font-medium text-[#c3c9d5]">
                          Total Number of Members
                        </span>

                        <span className="text-[15px] font-bold text-[#f1eee9]">
                          {item?.totalPassengers}
                        </span>
                      </div>

                      {/* Types of Vehicle Needed */}
                      <div className="flex items-center justify-between px-3 py-3">
                        <span className="text-[15px] font-medium text-[#c3c9d5]">
                          Type of Vehicle
                        </span>

                        <span className="text-[15px] font-bold text-[#f1eee9]">
                          {item?.travelOption}
                        </span>
                      </div>
                    </div>

                    {/* Second Row */}

                    <div className="mt-1 grid grid-cols-1 rounded-md border border-[#3d4a61] bg-[#2d37489d]">
                      {item?.travelOption?.toLowerCase() === "train" ? (
                        /* Train Class */
                        <div className="flex items-center justify-between border-b border-[#46536a] px-3 py-3">
                          <span className="text-[15px] font-medium text-[#c3c9d5]">
                            Train Coach Class
                          </span>

                          <div className="text-right text-[15px] font-bold text-[#f1eee9]">
                            {item?.classOrBerth?.map((classItem, index) => (
                              <p key={index}>{classItem}</p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Flight Class */
                        <div className="flex items-center justify-between px-3 py-3">
                          <span className="text-[15px] font-medium text-[#c3c9d5]">
                            Travel Class
                          </span>

                          <span className="text-[15px] font-bold text-[#f1eee9]">
                            {item?.classOrBerth.map((item) => {
                              return <p>{item}</p>;
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* special requirements  */}
                    <div className="w-full rounded-lg border border-[#46536a] mt-3 px-4 py-3">
                      {/* Heading */}
                      <div className="flex items-center gap-2">
                        <ClipboardList
                          size={15}
                          strokeWidth={1.8}
                          className="text-[#c3c9d5]"
                        />

                        <h3 className="text-[15px] font-semibold text-[#f1eee9]">
                          Special Requirement
                        </h3>
                      </div>

                      {/* Requirement Content */}
                      <p className="mt-3 text-[15px] font-medium leading-relaxed text-[#c3c9d5]">
                        {item?.specialRequirements}
                      </p>
                    </div>
                  </div>
                </>
              );
            },
          )}
        </div>
      </main>
    </>
  );
};

export default TicketingEventDetailView;
