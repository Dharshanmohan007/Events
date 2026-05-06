// import React, { useState } from 'react'
// import EventOrganizerDetails from './EventOrganizerDetails'
// import EventDetails from './EventDetails'
// import EventRequirements from './EventRequirements'

// // ─── Validators ───────────────────────────────────────────────────────────────

// function validateOrganizer(data = {}) {
//   const e = {};
//   if (!data.name?.trim()) e.name = "Name is required";
//   if (!data.department) e.department = "Department is required";
//   if (!data.mobile?.trim()) {
//     e.mobile = "Mobile number is required";
//   } else if (!/^[6-9]\d{9}$/.test(data.mobile.trim())) {
//     e.mobile = "Enter a valid 10-digit Indian mobile number";
//   }
//   if (!data.designation?.trim()) e.designation = "Designation is required";
//   if (!data.empId?.trim()) e.empId = "Employee ID is required";
//   return e;
// }

// function validateGuest(data = {}) {
//   const e = {};
//   if (!data.name?.trim()) e.name = "Guest name is required";
//   if (!data.designation?.trim()) e.designation = "Designation is required";
//   if (!data.organization?.trim()) e.organization = "Organization is required";
//   return e;
// }

// function validateDay(day = {}, idx) {
//   const e = {};
//   if (!day.date) e.date = `Day ${idx} date is required`;
//   if (!day.startTime) e.startTime = `Start time is required`;
//   if (!day.endTime) e.endTime = `End time is required`;
//   if (day.startTime && day.endTime && day.endTime <= day.startTime)
//     e.endTime = "End time must be after start time";
//   if (!day.numGuests || parseInt(day.numGuests) < 1)
//     e.numGuests = "At least 1 guest is required";

//   const guestCount = parseInt(day.numGuests) || 0;
//   const guestErrors = Array.from({ length: guestCount }, (_, i) =>
//     validateGuest((day.guests || [])[i])
//   );
//   if (guestErrors.some((ge) => Object.keys(ge).length > 0))
//     e.guests = guestErrors;

//   return e;
// }

// function validateOrganizerSection(state) {
//   const e = {};
//   if (!state.doc) e.doc = "This field is required";

//   // File required only when doc === "Yes"
//   if (state.doc === "Yes" && !state.file)
//     e.file = "Please upload the previous event documentation";

//   // Reason required only when doc === "No"
//   if (state.doc === "No" && !state.reason?.trim())
//     e.reason = "Reason is required";

//   if (!state.budget) e.budget = "This field is required";
//   if (!state.finance) e.finance = "This field is required";
//   if (!state.department?.trim()) e.department = "Department name is required";
//   if (!state.numOrganizers || parseInt(state.numOrganizers) < 1)
//     e.numOrganizers = "At least 1 organizer is required";

//   const count = parseInt(state.numOrganizers) || 0;
//   const orgErrors = Array.from({ length: count }, (_, i) =>
//     validateOrganizer((state.organizers || [])[i])
//   );
//   if (orgErrors.some((oe) => Object.keys(oe).length > 0))
//     e.organizers = orgErrors;

//   return e;
// }

// function validateEventDetails(data = {}, days = []) {
//   const e = {};
//   if (!data.eventName?.trim()) e.eventName = "Event name is required";
//   if (!data.tagging) e.tagging = "Tagging is required";
//   if (!data.taggingDetails?.trim()) e.taggingDetails = "Tagging details are required";
//   if (!data.eventType) e.eventType = "Event type is required";
//   if (data.eventType === "Other" && !data.eventTypeOther?.trim())
//     e.eventTypeOther = "Please specify the event type";
//   if (!data.society) e.society = "Society is required";
//   if (data.society === "Other" && !data.societyOther?.trim())
//     e.societyOther = "Please specify the society";
//   if (!data.logos) e.logos = "Logos selection is required";
//   if (data.logos === "Other" && !data.logosOther?.trim())
//     e.logosOther = "Please specify the logos";
//   if (!days.length) e.numDays = "Enter the number of days";
//   if (!data.audience) e.audience = "Target audience is required";

//   const dayErrors = days.map((d, i) => validateDay(d, i + 1));
//   if (dayErrors.some((de) => Object.keys(de).length > 0))
//     e.days = dayErrors;

//   return e;
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export default function EventRequisitionDetails({ nextStep, setSelectedRequirements, setEventDays }) {
//   // ── Organizer section state (lifted up) ──
//   const [doc, setDoc] = useState("");
//   const [finance, setFinance] = useState("");
//   const [budget, setBudget] = useState("");
//   const [department, setDepartment] = useState("");
//   const [file, setFile] = useState(null);
//   const [reason, setReason] = useState("");
//   const [numOrganizers, setNumOrganizers] = useState("");
//   const [organizers, setOrganizers] = useState([]);

//   // ── Event details state ──
//   const [eventData, setEventData] = useState({});
//   const [eventDays, setEventDaysLocal] = useState([]);

//   // ── Error state ──
//   const [orgErrors, setOrgErrors] = useState({});
//   const [eventErrors, setEventErrors] = useState({});

//   const syncEventDays = (days) => {
//     setEventDaysLocal(days);
//     setEventDays(days);
//   };

//   const handleNextWithValidation = () => {
//     const oErr = validateOrganizerSection({
//       doc, file, reason, budget, finance, department,
//       numOrganizers, organizers,
//     });
//     const eErr = validateEventDetails(eventData, eventDays);

//     setOrgErrors(oErr);
//     setEventErrors(eErr);

//     if (Object.keys(oErr).length > 0 || Object.keys(eErr).length > 0) {
//       window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }

//     nextStep();
//   };

//   return (
//     <div className='w-full flex flex-col gap-6 pb-3'>
//       <EventOrganizerDetails
//         // state passed down
//         doc={doc} setDoc={setDoc}
//         finance={finance} setFinance={setFinance}
//         budget={budget} setBudget={setBudget}
//         department={department} setDepartment={setDepartment}
//         file={file} setFile={setFile}
//         reason={reason} setReason={setReason}
//         numOrganizers={numOrganizers} setNumOrganizers={setNumOrganizers}
//         organizers={organizers} setOrganizers={setOrganizers}
//         errors={orgErrors}
//       />
//       <EventDetails
//         setEventDays={syncEventDays}
//         errors={eventErrors}
//         eventData={eventData}
//         setEventData={setEventData}
//       />
//       <EventRequirements
//         nextStep={handleNextWithValidation}
//         setSelectedRequirements={setSelectedRequirements}
//       />
//     </div>
//   );
// }





import React, { useState } from 'react'
import EventOrganizerDetails from './EventOrganizerDetails'
import EventDetails from './EventDetails'
import EventRequirements from './EventRequirements'

const BASE_URL = 'https://sece-events.onrender.com'

// ─── Validators ───────────────────────────────────────────────────────────────

function validateOrganizer(data = {}) {
  const e = {};
  if (!data.name?.trim()) e.name = "Name is required";
  if (!data.department) e.department = "Department is required";
  if (!data.mobile?.trim()) {
    e.mobile = "Mobile number is required";
  } else if (!/^[6-9]\d{9}$/.test(data.mobile.trim())) {
    e.mobile = "Enter a valid 10-digit Indian mobile number";
  }
  if (!data.designation?.trim()) e.designation = "Designation is required";
  if (!data.empId?.trim()) e.empId = "Employee ID is required";
  return e;
}

function validateGuest(data = {}) {
  const e = {};
  if (!data.name?.trim()) e.name = "Guest name is required";
  if (!data.designation?.trim()) e.designation = "Designation is required";
  if (!data.organization?.trim()) e.organization = "Organization is required";
  return e;
}

function validateDay(day = {}, idx) {
  const e = {};
  if (!day.date) e.date = `Day ${idx} date is required`;
  if (!day.startTime) e.startTime = `Start time is required`;
  if (!day.endTime) e.endTime = `End time is required`;
  if (day.startTime && day.endTime && day.endTime <= day.startTime)
    e.endTime = "End time must be after start time";
  if (!day.numGuests || parseInt(day.numGuests) < 1)
    e.numGuests = "At least 1 guest is required";

  const guestCount = parseInt(day.numGuests) || 0;
  const guestErrors = Array.from({ length: guestCount }, (_, i) =>
    validateGuest((day.guests || [])[i])
  );

  if (guestErrors.some((ge) => Object.keys(ge).length > 0))
    e.guests = guestErrors;

  return e;
}

function validateOrganizerSection(state) {
  const e = {};
  if (!state.doc) e.doc = "This field is required";
  if (state.doc === "Yes" && !state.file)
    e.file = "Please upload the previous event documentation";
  if (state.doc === "No" && !state.reason?.trim())
    e.reason = "Reason is required";
  if (!state.budget) e.budget = "This field is required";
  if (!state.finance) e.finance = "This field is required";
  if (!state.department?.trim()) e.department = "Department name is required";
  if (!state.numOrganizers || parseInt(state.numOrganizers) < 1)
    e.numOrganizers = "At least 1 organizer is required";

  const count = parseInt(state.numOrganizers) || 0;
  const orgErrors = Array.from({ length: count }, (_, i) =>
    validateOrganizer((state.organizers || [])[i])
  );

  if (orgErrors.some((oe) => Object.keys(oe).length > 0))
    e.organizers = orgErrors;

  return e;
}

function validateEventDetails(data = {}, days = []) {
  const e = {};
  if (!data.eventName?.trim()) e.eventName = "Event name is required";
  if (!data.eventType) e.eventType = "Event type is required";

  if (data.eventType === "Other" && !data.eventTypeOther?.trim())
    e.eventTypeOther = "Please specify the event type";

  if (!data.society) e.society = "Society is required";

  if (data.society === "Other" && !data.societyOther?.trim())
    e.societyOther = "Please specify the society";

  if (!data.logos) e.logos = "Logos selection is required";

  if (data.logos === "Other" && !data.logosOther?.trim())
    e.logosOther = "Please specify the logos";

  if (!days.length) e.numDays = "Enter the number of days";
  if (!data.audience) e.audience = "Target audience is required";

  const dayErrors = days.map((d, i) => validateDay(d, i + 1));

  if (dayErrors.some((de) => Object.keys(de).length > 0))
    e.days = dayErrors;

  return e;
}

// ─── Build Payload ─────────────────────────────────────────────────────────────

function buildPayload({
  doc, file, reason, budget, finance, department,
  numOrganizers, organizers, eventData, eventDays, requirements, user,
}) {
  const formData = new FormData();

  // 🔴 Critical: dynamic organizerId
  formData.append('organizerId', user?._id ?? null);

  const requestDetails = {
    organizerDetails: {
      previousEventDocumentation: doc === "Yes",
      previousEventReason: doc === "No" ? reason : "",
      isBudgetApproved: budget === "Yes",
      financeRequired: finance === "Yes",
      organizingDepartment: department,
      organizerCount: parseInt(numOrganizers) || 0,

      organizers: (organizers || []).map(o => ({
        name: o.name || "",
        department: o.department || "",
        mobile: parseInt(o.mobile) || 0,
        designation: o.designation || "",
        email: o.empEmail || "",
        empId: o.empId || "",

        // 🔴 Safe dynamic facultyId
        facultyId: user?._id ?? null,
      })),
    },

    eventDetails: {
      eventName: eventData.eventName || "",
      involvedIIC: false,
      eventType: eventData.eventType || "",
      eventTypeOther: eventData.eventTypeOther || "",
      professionalSociety: eventData.society ? [eventData.society] : [],
      professionalSocietyOther: eventData.societyOther || "",
      logosInPoster: eventData.logos ? [eventData.logos] : [],
      logosOther: eventData.logosOther || "",
      targetAudience: eventData.audience || "",
      numberOfDays: eventDays.length,

      eventSchedule: eventDays.map(day => ({
        eventDate: day.date ? new Date(day.date).toISOString() : "",
        startTime: day.startTime || "",
        endTime: day.endTime || "",
        totalGuests: parseInt(day.numGuests) || 0,

        guests: (day.guests || []).map(g => ({
          name: g.name || "",
          organization: g.organization || "",
          designation: g.designation || "",
          mobile: parseInt(g.mobile) || 0,
          gender: g.gender || "",
        })),
      })),
    },

    requirementDetails: {
      venueRequired: requirements.includes("venue"),
      audioRequired: requirements.includes("audio"),
      ictsRequired: requirements.includes("icts"),
      transportRequired: requirements.includes("transport"),
      accommodationRequired: requirements.includes("accommodation"),
      mediaRequired: requirements.includes("media"),
    },
  };

  formData.append('requestDetails', JSON.stringify(requestDetails));

  if (doc === "Yes" && file) {
    formData.append('previousEventDocumentation', file);
  }

  return formData;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventRequisitionDetails({
  nextStep,
  setSelectedRequirements,
  setEventDays,
  setEventId,
  user
}) {

  const [doc, setDoc] = useState("");
  const [finance, setFinance] = useState("");
  const [budget, setBudget] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState(null);
  const [reason, setReason] = useState("");
  const [numOrganizers, setNumOrganizers] = useState("");
  const [organizers, setOrganizers] = useState([]);

  const [eventData, setEventData] = useState({});
  const [eventDays, setEventDaysLocal] = useState([]);

  const [requirements, setRequirements] = useState([]);

  const [orgErrors, setOrgErrors] = useState({});
  const [eventErrors, setEventErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const syncEventDays = (days) => {
    setEventDaysLocal(days);
    setEventDays(days);
  };

  const handleNextWithValidation = async (selectedReqs) => {
    console.log('handleNextWithValidation called with selectedReqs:', selectedReqs);
    console.log('Current user:', user);
    console.log('Current eventData:', eventData);
    console.log('Current eventDays:', eventDays);

    if (!user?._id) {
      console.error('User not authenticated');
      setApiError("User not authenticated. Please login again.");
      return;
    }

    const oErr = validateOrganizerSection({
      doc, file, reason, budget, finance, department,
      numOrganizers, organizers,
    });
    console.log('Organizer errors:', oErr);

    const eErr = validateEventDetails(eventData, eventDays);
    console.log('Event errors:', eErr);

    setOrgErrors(oErr);
    setEventErrors(eErr);

    if (Object.keys(oErr).length > 0 || Object.keys(eErr).length > 0) {
      console.log('Validation failed, scrolling to top');
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    console.log('Validation passed, proceeding with API call');
    setIsLoading(true);
    setApiError("");

    try {
      const payload = buildPayload({
        doc, file, reason, budget, finance, department,
        numOrganizers, organizers,
        eventData,
        eventDays,
        requirements: selectedReqs,
        user
      });
      console.log('Payload built:', payload);

      const response = await fetch(`${BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: payload,
      });

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      const eventId = data.data?._id;
      console.log('Event created successfully, ID:', eventId);
      if (eventId && setEventId) {
        setEventId(eventId);
      }

      setSelectedRequirements(selectedReqs);
      nextStep();

    } catch (err) {
      console.error('API Error:', err.message);
      setApiError(err.message || "Failed to save event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='w-full flex flex-col gap-6 pb-3'>

      {apiError && (
        <div className="mx-6 rounded-lg bg-red-500/10 border border-red-500/40 px-4 py-3 flex items-start gap-3">
          <p className="text-red-400 text-sm">{apiError}</p>
        </div>
      )}

      <EventOrganizerDetails
        doc={doc} setDoc={setDoc}
        finance={finance} setFinance={setFinance}
        budget={budget} setBudget={setBudget}
        department={department} setDepartment={setDepartment}
        file={file} setFile={setFile}
        reason={reason} setReason={setReason}
        numOrganizers={numOrganizers} setNumOrganizers={setNumOrganizers}
        organizers={organizers} setOrganizers={setOrganizers}
        errors={orgErrors}
      />

      <EventDetails
        setEventDays={syncEventDays}
        errors={eventErrors}
        eventData={eventData}
        setEventData={setEventData}
      />

      <EventRequirements
        nextStep={handleNextWithValidation}
        setSelectedRequirements={setRequirements}
        isLoading={isLoading}
      />

    </div>
  );
}