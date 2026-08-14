import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../Components/Calendar/Sidebar.jsx";
import CalendarHeader from "../../Components/Calendar/CalendarHeader.jsx";
import WeekView from "../../Components/Calendar/WeekView.jsx";
import MonthView from "../../Components/Calendar/MonthView.jsx";
import DayView from "../../Components/Calendar/DayView.jsx";
import AllVenuesView from "../../Components/Calendar/AllVenuesView.jsx";
import { fetchEvents, fetchVenues } from "../../api/calendarApi.js";
import { addDays, addMonths } from "../../utils/dateUtils.js";
import DashboardHeader from "../Dashboards/ICTC-Dashboard/DashboardHeader.jsx";
import FacultyDahsboardHeader from "../Dashboards/Faculty-Dashboard/FacultyDahsboardHeader.jsx";

export default function Calendar() {
  const [venues, setVenues] = useState([]);
  const [venue, setVenue] = useState("");
  const [view, setView] = useState("week"); // "week" | "month" | "day"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // load venue list once
  useEffect(() => {
    fetchVenues()
      .then((list) => {
        setVenues(list);
        if (list.length) setVenue((prev) => prev || list[0]);
      })
      .catch(() => setError("Couldn't load venues"));
  }, []);

  // reload events whenever venue / view / date changes (skip for allVenues)
  useEffect(() => {
    if (!venue || view === "allVenues") return;
    setLoading(true);
    setError(null);
    fetchEvents({ venue, view, date: currentDate })
      .then(setEvents)
      .catch(() => setError("Couldn't load events for this venue"))
      .finally(() => setLoading(false));
  }, [venue, view, currentDate]);

  const goPrev = useCallback(() => {
    setCurrentDate((d) => {
      if (view === "day") return addDays(d, -1);
      if (view === "week") return addDays(d, -7);
      return addMonths(d, -1); // month & allVenues
    });
  }, [view]);

  const goNext = useCallback(() => {
    setCurrentDate((d) => {
      if (view === "day") return addDays(d, 1);
      if (view === "week") return addDays(d, 7);
      return addMonths(d, 1); // month & allVenues
    });
  }, [view]);

  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  const handleSelectEvent = (event) => {
    // Hook up to a detail drawer / modal / route as needed.
    console.log("Selected event:", event);
  };

  return (
    <>
      <div className="max-h-[100vh] overflow-auto table-custom-scrollbar">
        {/* <FacultyDahsboardHeader /> */}

        <div className="flex h-screen w-full bg-[#0b0f1a] text-slate-200">
          <Sidebar selectedDate={currentDate} onSelectDate={setCurrentDate} />

          <div className="flex flex-1 flex-col overflow-hidden">
            <CalendarHeader
              currentDate={currentDate}
              view={view}
              onChangeView={setView}
              venue={venue}
              venues={venues}
              onChangeVenue={setVenue}
              onPrev={goPrev}
              onNext={goNext}
              onToday={goToday}
            />

            {error && (
              <div className="mx-8 mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
                Loading events…
              </div>
            ) : (
              <>
                {view === "week" && (
                  <WeekView
                    currentDate={currentDate}
                    events={events}
                    onSelectEvent={handleSelectEvent}
                  />
                )}
                {view === "month" && (
                  <MonthView
                    currentDate={currentDate}
                    events={events}
                    onSelectEvent={handleSelectEvent}
                  />
                )}
                {view === "day" && (
                  <DayView
                    currentDate={currentDate}
                    events={events}
                    onSelectEvent={handleSelectEvent}
                  />
                )}
                {view === "allVenues" && (
                  <AllVenuesView
                    currentDate={currentDate}
                    onSelectEvent={handleSelectEvent}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
