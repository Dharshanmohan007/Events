import React, { useState, useEffect, useMemo } from 'react'
import { ListFilter, ChevronDown, Loader2 } from 'lucide-react'
import { fetchVenues } from '../../../api/calendarApi.js'
import { fetchVenueAvailabilitySchedule } from '../../../api/venueAvailabilityApi.js'

const times = [
    { label: '9 am - 10 am', value: '9 am' },
    { label: '10 am - 11 am', value: '10 am' },
    { label: '11 am - 12 pm', value: '11 am' },
    { label: '12 pm - 1 pm', value: '12 pm' },
    { label: '1 pm - 2 pm', value: '1 pm' },
    { label: '2 pm - 3 pm', value: '2 pm' },
    { label: '3 pm - 4 pm', value: '3 pm' },
    { label: '4 pm - 5 pm', value: '4 pm' },
];

const getYYYYMMDD = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const isSameDay = (d1, d2) => {
    return getYYYYMMDD(d1) === getYYYYMMDD(d2);
};

const timeStringToMinutes = (timeStr) => {
    if (!timeStr) return -1;
    const str = String(timeStr).trim().toLowerCase();
    
    const isPm = str.includes('pm');
    const isAm = str.includes('am');
    
    const cleaned = str.replace(/(am|pm)/gi, '').trim();
    const parts = cleaned.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parseInt(parts[1], 10) : 0;
    
    if (isNaN(hours)) return -1;
    
    if (isPm && hours < 12) hours += 12;
    if (isAm && hours === 12) hours = 0;
    // Smart fallback: if no AM/PM is specified and hours are 1 to 6 (typical afternoon venue times), assume PM
    if (!isAm && !isPm && hours > 0 && hours <= 6) hours += 12;
    
    return hours * 60 + minutes;
};

const FacultyVenueAvailability = () => {
    const [venues, setVenues] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState("");
    const [eventsList, setEventsList] = useState([]);
    const [loadingVenues, setLoadingVenues] = useState(true);
    const [loadingEvents, setLoadingEvents] = useState(false);

    // Fetch venues on mount
    useEffect(() => {
        let isMounted = true;
        setLoadingVenues(true);
        fetchVenues()
            .then((list) => {
                if (isMounted && Array.isArray(list) && list.length > 0) {
                    setVenues(list);
                    setSelectedVenue(list[0]);
                }
            })
            .catch((err) => {
                console.error("Failed to load venues:", err);
            })
            .finally(() => {
                if (isMounted) setLoadingVenues(false);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    // Next 7 days calculation starting from today
    const next7Days = useMemo(() => {
        const daysArr = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            daysArr.push({
                date: d,
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
                dayNum: d.getDate(),
                formattedDate: `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${d.getDate()}`
            });
        }
        return daysArr;
    }, []);

    // Fetch booked events using dedicated venue availability API whenever selectedVenue or date range changes
    useEffect(() => {
        if (!selectedVenue || next7Days.length === 0) return;
        let isMounted = true;
        setLoadingEvents(true);

        const startDate = new Date(next7Days[0].date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(next7Days[6].date);
        endDate.setHours(23, 59, 59, 999);

        fetchVenueAvailabilitySchedule({ venue: selectedVenue, startDate, endDate })
            .then((evts) => {
                if (isMounted && Array.isArray(evts)) {
                    setEventsList(evts);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch venue availability schedule:", err);
                if (isMounted) setEventsList([]);
            })
            .finally(() => {
                if (isMounted) setLoadingEvents(false);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedVenue, next7Days]);

    const startDateStr = `${next7Days[0].monthShort} ${next7Days[0].dayNum}`;
    const endDateStr = `${next7Days[6].monthShort} ${next7Days[6].dayNum}`;

    // Helper to find booked event for a specific day date and time slot
    const getBookedEvent = (dayDate, slotTimeStr) => {
        const slotStartMin = timeStringToMinutes(slotTimeStr);
        if (slotStartMin === -1) return null;
        const slotEndMin = slotStartMin + 60;

        return eventsList.find(evt => {
            if (!evt.eventDate) return false;
            if (!isSameDay(evt.eventDate, dayDate)) return false;

            const evtStartMin = timeStringToMinutes(evt.startTime);
            if (evtStartMin === -1) return false;

            const evtEndMin = evt.endTime ? timeStringToMinutes(evt.endTime) : (evtStartMin + 60);

            return evtStartMin < slotEndMin && evtEndMin > slotStartMin;
        });
    };

    return (
        <section className="rounded-lg border border-[#263044] bg-[#151d2d] p-4">
            <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">Venue Availability</h2>
                    {loadingEvents && (
                        <Loader2 size={13} className="animate-spin text-[#853FF9]" />
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[11px] text-[#FFFFFF80]">{startDateStr} - {endDateStr}</span>
                    <div className="relative flex items-center">
                        <ListFilter size={12} className="absolute left-2.5 text-white pointer-events-none z-10" />
                        <select
                            value={selectedVenue}
                            onChange={(e) => setSelectedVenue(e.target.value)}
                            disabled={loadingVenues}
                            className="appearance-none rounded-md bg-[#222b3d] pl-7 pr-6 py-1.5 text-[10px] text-white outline-none cursor-pointer border border-[#2e394e] hover:border-[#853FF9] transition disabled:opacity-50"
                        >
                            {venues.length === 0 ? (
                                <option value="Main Board Room" className="bg-[#151d2d] text-white">Main Board Room</option>
                            ) : (
                                venues.map((v) => (
                                    <option key={v} value={v} className="bg-[#151d2d] text-white">
                                        {v}
                                    </option>
                                ))
                            )}
                        </select>
                        <ChevronDown size={10} className="absolute right-2 text-[#FFFFFF80] pointer-events-none z-10" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[76px_repeat(7,minmax(0,1fr))] gap-x-3 gap-y-3">
                <div />
                {next7Days.map((dayObj, index) => (
                    <div key={index} className="text-center text-[9px] text-[#FFFFFF80] flex flex-col items-center">
                        <span className="font-medium text-white">{dayObj.dayName}</span>
                        <span className="text-[8px] text-[#FFFFFF60]">{dayObj.dayNum} {dayObj.monthShort}</span>
                    </div>
                ))}

                {times.map((tObj, rowIndex) => (
                    <React.Fragment key={tObj.value}>
                        <div className="flex items-center text-[9px] text-[#FFFFFF80] font-medium whitespace-nowrap">{tObj.label}</div>
                        {next7Days.map((dayObj) => {
                            const bookedEvent = getBookedEvent(dayObj.date, tObj.value);
                            const isBooked = !!bookedEvent;
                            
                            const orgName = bookedEvent?.organizerName || (bookedEvent?.organizers && bookedEvent.organizers[0]?.name) || 'N/A';
                            const orgEmpId = bookedEvent?.organizerEmpId || (bookedEvent?.organizers && bookedEvent.organizers[0]?.empId) || 'N/A';
                            const orgMobile = bookedEvent?.organizerMobile || (bookedEvent?.organizers && bookedEvent.organizers[0]?.mobile) || 'N/A';

                            return (
                                <div
                                    key={`${tObj.value}-${dayObj.formattedDate}`}
                                    className={`group relative h-10 rounded-md transition-all ${
                                        isBooked ? 'bg-[#2d3548] border border-gray-500/20 cursor-pointer' : 'bg-[#7C3AED]'
                                    }`}
                                >
                                    {isBooked && (
                                        <div className={`pointer-events-none absolute ${rowIndex === 0 ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 hidden -translate-x-1/2 group-hover:block z-50 w-52 rounded-lg border border-[#2e394e] bg-[#0f172a] p-2.5 shadow-xl text-left`}>
                                            <p className="text-[14px] font-semibold text-white truncate">{bookedEvent.eventName || 'Event'}</p>
                                            <p className="text-[14px] text-[#853FF9] font-medium mb-1.5">{bookedEvent.department || 'N/A'} • {bookedEvent.startTime || ''} - {bookedEvent.endTime || ''}</p>
                                            <div className="border-t border-[#1e293b] pt-1.5 space-y-0.5 text-[12px] text-slate-300">
                                                <p><span className="text-slate-400 font-medium">Organizer:</span> {orgName}</p>
                                                <p><span className="text-slate-400 font-medium">Emp ID:</span> {orgEmpId}</p>
                                                <p><span className="text-slate-400 font-medium">Mobile:</span> {orgMobile}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-4 flex justify-center gap-8 text-xs text-[#FFFFFF80]">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-7 rounded-full bg-[#2d3548]" />
                    Booked
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-7 rounded-full bg-[#7C3AED]" />
                    Available
                </div>
            </div>
        </section>
    )
}

export default FacultyVenueAvailability

