import React, { useState, useEffect, useRef } from 'react'
import EventOrganizerDetails from './EventOrganizerDetails'
import EventDetails from './EventDetails'
import EventRequirements from './EventRequirements'

// ─── Validators ───────────────────────────────────────────────────────────────

function validateOrganizer(data = {}) {
  const e = {};
  if (!data.name?.trim()) e.name = "Name is required";
  if (!data.department) e.department = "Department is required";
  const mobile = data.mobile != null ? String(data.mobile).trim() : "";
  if (!mobile) {
    e.mobile = "Mobile number is required";
  } 
  // else if (!/^[6-9]\d{9}$/.test(mobile)) {
  //   e.mobile = "Enter a valid 10-digit Indian mobile number";
  // }
  if (!data.designation?.trim()) e.designation = "Designation is required";
  if (!data.empId?.trim()) e.empId = "Employee ID is required";
  return e;
}

function validateGuest(data = {}) {
  const e = {};
  if (!data.name?.trim()) {
    e.name = "Guest name is required";
  } else if (/^\d+$/.test(data.name.trim())) {
    e.name = "Name cannot be a number";
  }
  if (!data.designation?.trim()) e.designation = "Designation is required";
  if (!data.organization?.trim()) e.organization = "Organization is required";
  const mobile = data.mobile != null ? String(data.mobile).trim() : "";
  if (!mobile) {
    e.mobile = "Mobile number is required";
  } 
  // else if (!/^[6-9]\d{9}$/.test(mobile)) {
  //   e.mobile = "Enter a valid 10-digit Indian mobile number";
  // }
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
  if (day.numGuests === undefined || day.numGuests === null || day.numGuests === "" || parseInt(day.numGuests) < 0)
    e.numGuests = "Please enter a valid number of guests (0 or more)";

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
  if (state.finance === "Yes" && !state.principalApprovalDocument)
    e.principalApprovalDocument = "Principal Approval Form is required";
  // if (!state.doc) e.doc = "This field is required";
  // if (state.doc === "Yes" && !state.file)
  //   e.file = "Please upload the previous event documentation";
  // if (state.doc === "No" && !state.reason?.trim())
  //   e.reason = "Reason is required";
  if (!state.budget) e.budget = "This field is required";
  if (!state.finance) e.finance = "This field is required";
  if (state.finance === "Yes") {
    if (!state.estimatedBudget?.trim()) {
      e.estimatedBudget = "Estimated budget is required";
    }

    if (!state.advanceAmount?.trim()) {
      e.advanceAmount = "Advance amount is required";
    }

    if (
      state.estimatedBudget?.trim() &&
      state.advanceAmount?.trim() &&
      Number(state.advanceAmount) >= Number(state.estimatedBudget)
    ) {
      e.advanceAmount = "Advance amount must be less than estimated budget";
    }

    if (!state.purposeOfAdvance?.trim()) {
      e.purposeOfAdvance = "Purpose of advance is required";
    }
    if (!state.advanceToBeReceivedWithin?.toString().trim()) {
      e.advanceToBeReceivedWithin = "Number of days is required";
    }
  }
  if (!state.department?.trim()) e.department = "Department name is required";
  if (state.numOrganizers === "" || parseInt(state.numOrganizers) < 0)
    e.numOrganizers = "Enter a valid number of organizers";

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
  const societyArr = Array.isArray(data.society) ? data.society : data.society ? [data.society] : [];
  if (societyArr.length === 0) e.society = "Society is required";
  if (societyArr.includes("Other") && !data.societyOther?.trim())
    e.societyOther = "Please specify the society";
  // logos is now an array
  const logosArr = Array.isArray(data.logos) ? data.logos : data.logos ? [data.logos] : [];
  if (logosArr.length === 0) e.logos = "Logos selection is required";
  if (logosArr.includes("Other") && !data.logosOther?.trim())
    e.logosOther = "Please specify the logos";
  if (!days.length) e.numDays = "Enter the number of days";
  const audienceArr = Array.isArray(data.audience)
    ? data.audience
    : data.audience
      ? [data.audience]
      : [];
  if (audienceArr.length === 0) e.audience = "Target audience is required"; 

  const dayErrors = days.map((d, i) => {
    const errs = validateDay(d, i + 1);
    
    // Check for exact date/time duplication with previous days
    for (let j = 0; j < i; j++) {
      const prev = days[j];
      if (
        d.date && prev.date && d.date === prev.date &&
        d.startTime && prev.startTime && d.startTime === prev.startTime &&
        d.endTime && prev.endTime && d.endTime === prev.endTime
      ) {
        errs.startTime = `Cannot choose the start time and date as Day ${j + 1}`;
        errs.endTime = `Cannot choose the end time and date as Day ${j + 1}`;
      }
    }
    
    return errs;
  });

  if (dayErrors.some((de) => Object.keys(de).length > 0))
    e.days = dayErrors;

  return e;
}

  function validateRequirements(values = {}) {
    const e = {};

    const LABEL_MAP = {
      venue: "Venue",
      icts: "ICTS",
      audio: "Audio",
      transport: "Transport",
      foodandrefreshments: "Food & Refreshments",
      accommodation: "Accommodation",
      purchase: "Purchase",
      media: "Media",
    };

    Object.keys(LABEL_MAP).forEach((key) => {
      if (!values[key]) {
        e[key] = `${LABEL_MAP[key]} is required`;
      }
    });

    return e;
  }

// ─── Component ────────────────────────────────────────────────────────────────

export default function EventRequisitionDetails({
  nextStep,
  onSave,
  setSelectedRequirements,
  setEventDays,
  setEventId,
  user,
  eventRequisition: initialEventRequisition = {},
  setEventRequisition,
  errors: parentErrors = {},
  isLoading: parentIsLoading = false,
  registerChildNavigation,
}) {
  const [doc, setDoc] = useState(initialEventRequisition.doc || "");
  const [finance, setFinance] = useState(initialEventRequisition.finance || "");
  const [advanceAmount, setAdvanceAmount] = useState(
    initialEventRequisition.advanceAmount || ""
  );
  const [purposeOfAdvance, setPurposeOfAdvance] = useState(
    initialEventRequisition.purposeOfAdvance || ""
  );
  const [estimatedBudget, setEstimatedBudget] = useState(
    initialEventRequisition.estimatedBudget || ""
  );
  const [budget, setBudget] = useState(initialEventRequisition.budget || "");
  const [department, setDepartment] = useState(initialEventRequisition.department || "");
  const [principalApprovalDocument, setprincipalApprovalDocument] = useState(
    initialEventRequisition.principalApprovalDocument || null
  );
  const [file, setFile] = useState(initialEventRequisition.file || null);
  const [reason, setReason] = useState(initialEventRequisition.reason || "");
  const [numOrganizers, setNumOrganizers] = useState(initialEventRequisition.numOrganizers || "");
  const [organizers, setOrganizers] = useState(initialEventRequisition.organizers || []);
  const [advanceToBeReceivedWithin, setAdvanceToBeReceivedWithin] = useState(
    initialEventRequisition.advanceToBeReceivedWithin || ""
  );
  const [expectedEventOutcome, setExpectedEventOutcome] = useState(
    initialEventRequisition.expectedEventOutcome || ""
  );

  const [eventData, setEventData] = useState(initialEventRequisition.eventData || {});
  const [eventDaysLocal, setEventDaysLocal] = useState(initialEventRequisition.eventDays || []);

  const [requirements, setRequirements] = useState(
    initialEventRequisition.requirements || {
      venue: "",
      icts: "",
      audio: "",
      transport: "",
      foodandrefreshments: "",
      accommodation: "",
      purchase: "",
      media: "",
    }
  );

  const [orgErrors, setOrgErrors] = useState({});
  const [eventErrors, setEventErrors] = useState({});
  const [reqErrors, setReqErrors] = useState({});

  const lastSynced = useRef(null);

  useEffect(() => {
    if (!setEventRequisition) return;
    const next = {
      doc, finance, advanceAmount, purposeOfAdvance, advanceToBeReceivedWithin, estimatedBudget, budget, department, principalApprovalDocument, file, reason,
      numOrganizers, organizers, eventData, expectedEventOutcome,
      eventDays: eventDaysLocal, requirements,
    };
    const comparable = JSON.stringify({
      doc, finance, advanceAmount, purposeOfAdvance, advanceToBeReceivedWithin, estimatedBudget, budget, department, reason,
      numOrganizers, organizers, eventData, expectedEventOutcome,
      eventDays: eventDaysLocal, requirements,
      principalApprovalDocument: principalApprovalDocument
        ? {
            name: principalApprovalDocument.name,
            size: principalApprovalDocument.size,
            type: principalApprovalDocument.type,
          }
        : null,
      file: file ? { name: file.name, size: file.size, type: file.type } : null,
    });
    if (comparable !== lastSynced.current) {
      lastSynced.current = comparable;
      setEventRequisition(next);
    }
  }, [doc, finance, advanceAmount, purposeOfAdvance, advanceToBeReceivedWithin, estimatedBudget, budget, department, file, principalApprovalDocument, reason, numOrganizers, organizers, eventData, expectedEventOutcome, eventDaysLocal, requirements, setEventRequisition]);

  const syncEventDays = (days) => {
    setEventDaysLocal(days);
    if (setEventDays) setEventDays(days);
  };

  const handleRequirementsChange = (values) => {
    setRequirements(values);

    if (setSelectedRequirements) {
      setSelectedRequirements(values);
    }

    setReqErrors({});
  };

  const handleSaveAndNext = async (selectedReqs) => {
    const currentRequirements = selectedReqs ?? requirements;

    const oErr = validateOrganizerSection({
      principalApprovalDocument, doc, file, reason, budget, finance, advanceAmount, purposeOfAdvance, advanceToBeReceivedWithin, estimatedBudget, department, numOrganizers, organizers,
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
      return false;
    }

    if (onSave) {
      await onSave(currentRequirements);
    }
  };

  const navRef = useRef({ next: handleSaveAndNext });
  useEffect(() => { navRef.current = { next: handleSaveAndNext }; });

  useEffect(() => {
    if (!registerChildNavigation) return;
    const stableNext = (...args) => navRef.current.next(...args);
    registerChildNavigation({ next: stableNext, isLoading: parentIsLoading });
    return () => registerChildNavigation({ next: null, isLoading: false });
  }, [registerChildNavigation, parentIsLoading]);

  const mergedOrgErrors = { ...orgErrors, ...parentErrors };
  const mergedEventErrors = { ...eventErrors, ...parentErrors };
  const mergedReqErrors = { ...reqErrors, ...parentErrors };

  const requirementValues = requirements;

  const isPrincipalUploaded = !!principalApprovalDocument;
  return (
    <div className='w-full flex flex-col'>
      <EventOrganizerDetails
        principalApprovalDocument={principalApprovalDocument}
        setprincipalApprovalDocument={setprincipalApprovalDocument}
        doc={doc} setDoc={setDoc}
        finance={finance} setFinance={setFinance}
        advanceAmount={advanceAmount}
        setAdvanceAmount={setAdvanceAmount}
        purposeOfAdvance={purposeOfAdvance}
        setPurposeOfAdvance={setPurposeOfAdvance}
        advanceToBeReceivedWithin={advanceToBeReceivedWithin}
        setAdvanceToBeReceivedWithin={setAdvanceToBeReceivedWithin}
        expectedEventOutcome={expectedEventOutcome}
        setExpectedEventOutcome={setExpectedEventOutcome}
        estimatedBudget={estimatedBudget}
        setEstimatedBudget={setEstimatedBudget}
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
        // disabled={!isPrincipalUploaded}
        setEventDays={syncEventDays}
        errors={mergedEventErrors}
        eventData={eventData}
        setEventData={setEventData}
        setErrors={setEventErrors}
      />
      <hr className="my-1 border-[#333351]" />

      <EventRequirements
        // disabled={!isPrincipalUploaded}
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