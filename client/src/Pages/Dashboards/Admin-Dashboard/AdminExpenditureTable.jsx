import React, { useEffect, useState } from "react";
import {
  Search,
  Check,
  ChevronDown,
  CalendarDays,
  ExternalLink,
  Download,
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router-dom";

const tabs = ["Event expenditures", "Individual expenditures"];

const data = [
  {
    eventName: "Welcome Freshers",
    eventDate: "15-03-2026",
    eventType: "Seminar",
    submissionDate: "15-03-2026",
    status: "Approved",
  },
  {
    eventName: "Welcome Freshers",
    eventDate: "15-03-2026",
    eventType: "Seminar",
    submissionDate: "15-03-2026",
    status: "Pending",
  },
  {
    eventName: "Welcome Freshers",
    eventDate: "15-03-2026",
    eventType: "Seminar",
    submissionDate: "15-03-2026",
    status: "Approved",
  },
  {
    eventName: "Welcome Freshers",
    eventDate: "15-03-2026",
    eventType: "Seminar",
    submissionDate: "15-03-2026",
    status: "Approved",
  },
  {
    eventName: "Welcome Freshers",
    eventDate: "15-03-2026",
    eventType: "Seminar",
    submissionDate: "15-03-2026",
    status: "Approved",
  },
  {
    eventName: "Welcome Freshers",
    eventDate: "15-03-2026",
    eventType: "Seminar",
    submissionDate: "15-03-2026",
    status: "Approved",
  },
  {
    eventName: "Welcome Freshers",
    eventDate: "15-03-2026",
    eventType: "Seminar",
    submissionDate: "15-03-2026",
    status: "Pending",
  },
  {
    eventName: "Welcome Freshers",
    eventDate: "15-03-2026",
    eventType: "Seminar",
    submissionDate: "15-03-2026",
    status: "Pending",
  },
  {
    eventName: "Welcome Freshers",
    eventDate: "15-03-2026",
    eventType: "Seminar",
    submissionDate: "15-03-2026",
    status: "Pending",
  },
];

const AdminExpenditureTable = () => {
  // Auth
  const token = localStorage.getItem("token");

  // states
  const [individualExpenditureList, setIndividualExpenditureList] = useState(
    [],
  );
  const [eventsExpenditureData, setEventsExpenditureData] = useState([]);
  const [selectedTab, setselectedTab] = useState("Event expenditures");

  // functions
  const fetchIndividualList = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/individual/expenditure`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("individual expenditure list : ", res);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEventsList = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/event-expenditures`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log("events expenditure list : ", res.data.data);
      setEventsExpenditureData(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchIndividualList();
    fetchEventsList();
  }, []);

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

  return (
    <>
      <div className="header mx-7 mt-4">
        <h1 className="text-xl font-medium text-white">Expenditure List</h1>

        <div className="tabs mt-4 flex items-center gap-3 text-white border-b border-gray-600">
          {tabs.map((item) => {
            return (
              <button
                onClick={() => setselectedTab(item)}
                className={`pb-3 px-3 ${selectedTab == item ? "border-b border-violet-700 text-violet-500 font-semibold" : "cursor-pointer"}`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* -------------------------- Events expenditure table  ----------------------- */}
      {selectedTab == "Event expenditures" ? (
        <div className="w-[96%] mt-4 m-auto  bg-[#171f31] rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-3  py-3">
            <h2 className="text-[18px] text-white font-medium">
              Events Expenditure List{" "}
              <span className="text-[#a855f7]">( 0 )</span>
            </h2>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex h-7 w-[275px] items-center gap-2 rounded-full border border-[#30394d] bg-[#222b3e] py-4 px-3">
                <Search size={14} className="text-gray-500" />

                <input
                  type="text"
                  placeholder="Search events, venues"
                  className="w-full text-[14px] text-white outline-none placeholder:text-gray-500"
                />
              </div>

              {/* Date */}
              <button className="flex h-7 items-center gap-2 rounded-md border border-[#30394d] bg-[#222b3e] px-2.5 text-[14px] text-gray-300">
                <CalendarDays size={10} />
                15/03/2026
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full rounded-md border border-[#252d40] max-h-[calc(100vh-270px)] overflow-auto bg-[#151d30]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="h-[34px] bg-[#192235]">
                  <th className="px-3 text-left text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Event Name
                  </th>

                  <th className="px-3 text-left text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Event Date
                  </th>

                  <th className="px-3 text-left text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Event Type
                  </th>

                  <th className="px-3 text-left text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Submission Date
                  </th>

                  <th className="px-3 text-left text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Status
                  </th>

                  <th className="px-3 text-center text-[14px] font-semibold uppercase tracking-wide text-[#7d8495]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {eventsExpenditureData.map((item, index) => (
                  <tr
                    key={index}
                    className="h-[40px]  border-t border-[#252d40] hover:bg-[#192235]"
                  >
                    <td className="px-3 text-[14px] font-medium text-white">
                      {item?.basicDetails?.eventName}
                    </td>

                    <td className="px-3 text-[14px] text-[#d1d5db] flex items-center gap-2">
                      <span className="mt-2">
                        {formatDate(
                          item?.eventId?.requestDetails?.eventDetails
                            ?.eventSchedule[0].eventDate,
                        )}
                      </span>

                      {item?.eventId?.requestDetails?.eventDetails
                        ?.eventSchedule.length > 1 && (
                        <>
                          <div className="relative mt-1 group">
                            <button
                              type="button"
                              className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#374151] px-1.5 text-[11px] font-medium text-white"
                            >
                              +{item?.eventId?.requestDetails?.eventDetails?.eventSchedule.length - 1}
                            </button>

                            <div className="pointer-events-none absolute left-0 -top-10 z-50 mt-2 hidden w-max -translate-x-1/2 rounded-md bg-[#1f2937] px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                              <div className="space-y-1">
                                {item?.eventId?.requestDetails?.eventDetails.eventSchedule.map((item, index) => (
                                  <div key={index}>
                                    {console.log("event date : ", item)}
                                    {formatDate(item.eventDate)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </td>

                    <td className="px-3 text-[14px] text-[#d1d5db]">
                      {item.eventId?.requestDetails?.eventDetails?.eventType}
                    </td>

                    <td className="px-3 text-[14px] text-[#d1d5db]">
                      {formatDate(item?.createdAt)}
                    </td>

                    <td className="px-3">
                      <div
                        className={`flex items-center gap-1 text-[14px] font-medium ${
                          item?.eventId?.documentExpenditureApproved
                            ? "text-[#00d69b]"
                            : "text-[#e90067]"
                        }`}
                      >
                        <span
                          className={`h-[5px] w-[5px] rounded-full ${
                            item?.eventId?.documentExpenditureApproved
                              ? "bg-[#00d69b]"
                              : "bg-[#e90067]"
                          }`}
                        />

                        {item?.eventId?.documentExpenditureApproved
                          ? "Approved"
                          : "Pending"}
                      </div>
                    </td>

                    <td className="px-3">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          to={`/dashboard-admin/expenditures/EventExpenditureDetailView/${item?.eventId?._id}`}
                          type="button"
                          className="text-[#8b93a5] transition hover:text-white"
                        >
                          <ExternalLink size={13} strokeWidth={1.8} />
                        </Link>

                        <button
                          type="button"
                          className="text-[#8b93a5] transition hover:text-white"
                        >
                          <Download size={13} strokeWidth={1.8} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="w-[96%] mt-4 m-auto bg-[#171f31] rounded-xl ">
          {/* Header */}
          <div className="flex items-center justify-between px-3  py-3">
            <h2 className="text-[18px] text-white font-medium">
              Individual Expenditure List{" "}
              <span className="text-[#a855f7]">( 0 )</span>
            </h2>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="flex h-7 w-[275px] items-center gap-2 rounded-full border border-[#30394d] bg-[#222b3e] py-4 px-3">
                <Search size={14} className="text-gray-500" />

                <input
                  type="text"
                  placeholder="Search events, venues"
                  className="w-full text-[14px] text-white outline-none placeholder:text-gray-500"
                />
              </div>

              {/* Date */}
              <button className="flex h-7 items-center gap-2 rounded-md border border-[#30394d] bg-[#222b3e] px-2.5 text-[14px] text-gray-300">
                <CalendarDays size={10} />
                15/03/2026
              </button>
            </div>
          </div>

          <div className="w-full rounded-md border border-[#252d40] max-h-[calc(100vh-270px)] overflow-auto bg-[#151d30]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="h-[48px] bg-[#192235]">
                  <th className="px-3 text-left text-[14px] font-medium uppercase text-[#777f91]">
                    Individual Request Name
                  </th>

                  <th className="px-3 text-left text-[14px] font-medium uppercase text-[#777f91]">
                    Requested Date
                  </th>

                  <th className="px-3 text-left text-[14px] font-medium uppercase text-[#777f91]">
                    Department
                  </th>

                  <th className="px-3 text-left text-[14px] font-medium uppercase text-[#777f91]">
                    Expenditure Submission Date
                  </th>

                  <th className="px-3 text-left text-[14px] font-medium uppercase text-[#777f91]">
                    Status
                  </th>

                  <th className="px-3 text-center text-[14px] font-medium uppercase text-[#777f91]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* Row 1 */}
                <tr className="h-[50px] border-b border-[#252d40]">
                  <td className="px-3 text-[14px] font-medium text-white">
                    Transport
                  </td>

                  <td className="px-3 text-[14px] text-[#d1d5db]">
                    15-03-2026
                  </td>

                  <td className="px-3 text-[14px] text-[#d1d5db]">CES</td>

                  <td className="px-3 text-[14px] text-[#d1d5db]">
                    15-03-2026
                  </td>

                  <td className="px-3">
                    <div className="flex items-center gap-1 text-[14px] font-medium text-[#00d69b]">
                      <span className="h-[5px] w-[5px] rounded-full bg-[#00d69b]" />
                      Approved
                    </div>
                  </td>

                  <td className="px-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        className="text-[#8b93a5] hover:text-white"
                      >
                        <ExternalLink size={13} strokeWidth={1.8} />
                      </button>

                      <button
                        type="button"
                        className="text-[#8b93a5] hover:text-white"
                      >
                        <Download size={13} strokeWidth={1.8} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="h-[39px] border-[#252d40]">
                  <td className="px-3 text-[14px] font-medium text-white">
                    Transport
                  </td>

                  <td className="px-3 text-[14px] text-[#d1d5db]">
                    15-03-2026
                  </td>

                  <td className="px-3 text-[14px] text-[#d1d5db]">MECH</td>

                  <td className="px-3 text-[14px] text-[#d1d5db]">
                    15-03-2026
                  </td>

                  <td className="px-3">
                    <div className="flex items-center gap-1 text-[14px] font-medium text-[#e90067]">
                      <span className="h-[5px] w-[5px] rounded-full bg-[#e90067]" />
                      Pending
                    </div>
                  </td>

                  <td className="px-3">
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        className="text-[#8b93a5] hover:text-white"
                      >
                        <Download size={13} strokeWidth={1.8} />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminExpenditureTable;
