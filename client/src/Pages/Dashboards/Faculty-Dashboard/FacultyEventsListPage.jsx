import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import FacultyDahsboardHeader from "./FacultyDahsboardHeader";
import RequestListTable from "../../../Components/RequestListTable";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const FacultyEventsListPage = () => {
  const [eventRows, setEventRows] = useState([]);
  const [individualRows, setIndividualRows] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem("token");
    if (!token) return;

    // Fetch events from faculty API
    (async () => {
      try {
        const decoded = jwtDecode(token);
        const facultyId = decoded.id || decoded._id || decoded.userId || decoded.facultyId;
        const res = await fetch(
          `${API_BASE_URL}/api/table/faculty-dashboard-table?facultyId=${facultyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (json.success && isMounted) {
          // Normalize to match what RequestListTable expects
          setEventRows((json.data || []).map((ev) => ({
            id: ev.eventId || ev.id,
            eventName: ev.eventName || "-",
            eventType: ev.eventType || "-",
            venues: Array.isArray(ev.venues) ? ev.venues : [ev.eventVenue || ev.venue].filter(Boolean),
            dates: Array.isArray(ev.dates || ev.eventDates) 
              ? (ev.dates || ev.eventDates).map((d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }))
              : [ev.eventDate].filter(Boolean).map((d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })),
            dateKeys: Array.isArray(ev.dates || ev.eventDates)
              ? (ev.dates || ev.eventDates).map((d) => new Date(d).toISOString().slice(0, 10))
              : [ev.eventDate].filter(Boolean).map((d) => new Date(d).toISOString().slice(0, 10)),
            department: ev.organizingDepartment || ev.department || "-",
            approvedStatus: ev.adminApproval ? "Approved" : "Pending",
            eventStatus: ev.eventStatus || ev.overallStatus || "-",
            rawEventId: ev.eventId || ev.id,
          })));
        }
      } catch (err) {
        console.warn("Failed to fetch faculty events:", err.message);
      }
    })();

    // Fetch individual submissions
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/individual-submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success && isMounted) {
          setIndividualRows((json.data || []).map((req) => ({
            id: req.id,
            employee: req.employee || req.employeeDetail?.name || "-",
            employeeEmail: req.employeeEmail || "-",
            formType: req.formType || "-",
            createdAt: req.createdAt
              ? new Date(req.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
              : "-",
            dateKeys: req.createdAt ? [new Date(req.createdAt).toISOString().slice(0, 10)] : [],
            status: typeof req.status === "string" ? req.status : "Pending",
          })));
        }
      } catch (err) {
        console.warn("Failed to fetch individual submissions:", err.message);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  return (
    <section className="min-h-screen bg-[#0b1326] poppins">
      <FacultyDahsboardHeader />
      <main className="px-6 pb-8">
        <div className="pt-3 pb-4">
          <h1 className="text-white text-lg font-medium">Request List Overview</h1>
          <p className="text-[#FFFFFF80] text-sm">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
          </p>
        </div>
        <RequestListTable
          eventRows={eventRows}
          individualRows={individualRows}
          detailViewPath="/dashboard-faculty/events/detailView"
          individualDetailViewPath="/dashboard/IndividualEvents"
        />
      </main>
    </section>
  );
};

export default FacultyEventsListPage;
