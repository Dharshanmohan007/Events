import React, { useState, useEffect, useRef } from 'react'
import EventOrganizerDetails from './EventOrganizerDetails'
import EventDetails from './EventDetails'
import EventRequirements from './EventRequirements'

// ─── Validators (kept here for local field-level error display) ───────────────

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
  if (!data.mobile?.trim()) e.mobile = "Mobile is required";
  if (!data.gender) e.gender = "Gender is required";
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

function validateRequirements(requirements = []) {
  if (!requirements || requirements.length === 0)
    return { requirements: "Select at least one requirement" };
  return {};
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventRequisitionDetails({
  nextStep,
  // onSave is called by Form.jsx's sectionProps.event.onSave — it handles the API call
  onSave,
  setSelectedRequirements,
  setEventDays,
  setEventId,
  user,
  eventRequisition: initialEventRequisition = {},
  setEventRequisition,
  errors: parentErrors = {},
  isLoading: parentIsLoading = false,
}) {
  // ── Local state (mirrors what Form.jsx stores in formData.event) ─────────
  const [doc, setDoc] = useState(initialEventRequisition.doc || "");
  const [finance, setFinance] = useState(initialEventRequisition.finance || "");
  const [budget, setBudget] = useState(initialEventRequisition.budget || "");
  const [department, setDepartment] = useState(initialEventRequisition.department || "");
  const [file, setFile] = useState(initialEventRequisition.file || null);
  const [reason, setReason] = useState(initialEventRequisition.reason || "");
  const [numOrganizers, setNumOrganizers] = useState(initialEventRequisition.numOrganizers || "");
  const [organizers, setOrganizers] = useState(initialEventRequisition.organizers || []);

  const [eventData, setEventData] = useState(initialEventRequisition.eventData || {});
  const [eventDaysLocal, setEventDaysLocal] = useState(initialEventRequisition.eventDays || []);

  const [requirements, setRequirements] = useState(initialEventRequisition.requirements || []);

  // ── Local validation errors ───────────────────────────────────────────────
  const [orgErrors, setOrgErrors] = useState({});
  const [eventErrors, setEventErrors] = useState({});
  const [reqErrors, setReqErrors] = useState({});

  // ── Sync local state → parent (Form.jsx formData.event) ──────────────────
  const lastSynced = useRef(null);

  useEffect(() => {
    if (!setEventRequisition) return;
    const next = {
      doc, finance, budget, department, file, reason,
      numOrganizers, organizers, eventData,
      eventDays: eventDaysLocal, requirements,
    };
    // Serialize without the File object for comparison
    const comparable = JSON.stringify({
      doc, finance, budget, department, reason,
      numOrganizers, organizers, eventData,
      eventDays: eventDaysLocal, requirements,
      file: file ? { name: file.name, size: file.size, type: file.type } : null,
    });
    if (comparable !== lastSynced.current) {
      lastSynced.current = comparable;
      setEventRequisition(next);
    }
  }, [doc, finance, budget, department, file, reason, numOrganizers, organizers, eventData, eventDaysLocal, requirements, setEventRequisition]);

  // ── Keep parent eventDays in sync ─────────────────────────────────────────
  const syncEventDays = (days) => {
    setEventDaysLocal(days);
    if (setEventDays) setEventDays(days);
  };

  // ── Requirements change handler ────────────────────────────────────────────
  const handleRequirementsChange = (selectedReqs) => {
    setRequirements(selectedReqs);
    if (setSelectedRequirements) setSelectedRequirements(selectedReqs);
    setReqErrors({});
  };

  // ── Called when user clicks "Save & Next" in EventRequirements ────────────
  //    This is the ONLY place we trigger validation + hand off to Form.jsx.
  //    Form.jsx's onSave handles the actual API call (POST /api/events).
  const handleSaveAndNext = async (selectedReqs) => {
    const currentRequirements = selectedReqs ?? requirements;

    // Validate all three sections locally before handing off
    const oErr = validateOrganizerSection({
      doc, file, reason, budget, finance, department, numOrganizers, organizers,
    });
    const eErr = validateEventDetails(eventData, eventDaysLocal);
    const rErr = validateRequirements(currentRequirements);

    setOrgErrors(oErr);
    setEventErrors(eErr);
    setReqErrors(rErr);

    if (
      Object.keys(oErr).length > 0 ||
      Object.keys(eErr).length > 0 ||
      Object.keys(rErr).length > 0
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Merge everything into a single object and hand it to Form.jsx's onSave.
    // Form.jsx will build the FormData payload and POST to /api/events.
    if (onSave) {
      await onSave(currentRequirements);
    }
  };

  // Merge parent errors (from Form.jsx re-validation) with local errors
  const mergedOrgErrors = { ...orgErrors, ...parentErrors };
  const mergedEventErrors = { ...eventErrors, ...parentErrors };
  const mergedReqErrors = { ...reqErrors, ...parentErrors };

  const requirementValues = requirements.reduce(
    (acc, key) => ({ ...acc, [key]: "Yes" }),
    {}
  );

  return (
    <div className='w-full flex flex-col'>
      <EventOrganizerDetails
        doc={doc} setDoc={setDoc}
        finance={finance} setFinance={setFinance}
        budget={budget} setBudget={setBudget}
        department={department} setDepartment={setDepartment}
        file={file} setFile={setFile}
        reason={reason} setReason={setReason}
        numOrganizers={numOrganizers} setNumOrganizers={setNumOrganizers}
        organizers={organizers} setOrganizers={setOrganizers}
        errors={mergedOrgErrors}
      />
      <hr className="my-1 border-[#333351]" />

      <EventDetails
        setEventDays={syncEventDays}
        errors={mergedEventErrors}
        eventData={eventData}
        setEventData={setEventData}
        setErrors={setEventErrors}
      />
      <hr className="my-1 border-[#333351]" />

      <EventRequirements
        // nextStep here is handleSaveAndNext — called when user clicks Save & Next
        nextStep={handleSaveAndNext}
        setSelectedRequirements={setRequirements}
        onRequirementsChange={handleRequirementsChange}
        isLoading={parentIsLoading}
        initialValues={requirementValues}
        errors={mergedReqErrors}
      />
    </div>
  );
}