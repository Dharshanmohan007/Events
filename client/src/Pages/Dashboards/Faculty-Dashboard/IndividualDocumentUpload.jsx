import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Upload, Plus, Calendar, Trash2, FileText, X } from "lucide-react";
import { API_BASE } from "../../../utils/apiConfig";

const isSupportedRequiredDocument = (file) =>
  file.type === "application/pdf" ||
  file.type === "image/jpeg" ||
  /\.(pdf|jpe?g)$/i.test(file.name);

export default function IndividualDocumentUpload({
  requestType = "Expenditure Request",
  sectionTitle = "Expenditure Details",
}) {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const documentsSubmittedKey = `individual-attendance-documents-submitted-${eventId}`;
  const eventAttendingDetails = location.state?.eventAttendingDetails;
  const requestKey = (() => {
    const label = String(requestType || "").toLowerCase();
    if (label.includes("attend")) return "eventattending";
    if (label.includes("purchase")) return "purchase";
    if (label.includes("transport")) return "transport";
    if (label.includes("media")) return "media";
    return "food";
  })();
  const isAttendanceRequest = requestKey === "eventattending";
  const foodRequired = [true, "yes", "true"].includes(
    typeof eventAttendingDetails?.foodRequired === "string"
      ? eventAttendingDetails.foodRequired.trim().toLowerCase()
      : eventAttendingDetails?.foodRequired,
  );
  const participantNames = Array.isArray(eventAttendingDetails?.participantNames)
    ? eventAttendingDetails.participantNames.join(", ")
    : "";
  const [foodDetails, setFoodDetails] = useState([
    {
      name: requestKey === "eventattending" && foodRequired ? "Food" : "",
      billNo: "",
      billDate: "",
      vendor: requestKey === "eventattending" ? participantNames : "",
      amount: "",
      file: null,
      fileError: "",
    }
  ]);
  const [miscDetails, setMiscDetails] = useState([
    { name: "", billNo: "", billDate: "", vendor: "", amount: "", file: null, fileError: "" }
  ]);
  const [remarks, setRemarks] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [expenditureRecordId, setExpenditureRecordId] = useState(null);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [requiredDocumentFiles, setRequiredDocumentFiles] = useState({});
  const [closingEventId, setClosingEventId] = useState(null);
  const [attendanceEventId, setAttendanceEventId] = useState(eventId);
  const [closingDocumentId, setClosingDocumentId] = useState(null);
  const [documentStep, setDocumentStep] = useState(isAttendanceRequest);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(isAttendanceRequest);
  const [documentLoadError, setDocumentLoadError] = useState("");

  const toDocumentKey = (name) =>
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  const toDocumentFileRef = (document) =>
    `doc_${toDocumentKey(document.name)}_file`;
  const getDefaultEventAttendingDocuments = () => [
    { order: 1, name: "Jio Tag Required Document" },
    { order: 2, name: "Report Required Document" },
    { order: 3, name: "Certificate Required Document" },
  ];

  useEffect(() => {
    if (!isAttendanceRequest || !eventId) return;

    const fetchRequiredDocuments = async () => {
      setIsLoadingDocuments(true);
      setDocumentLoadError("");

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const requestResponse = await fetch(
          `${API_BASE}/api/individual-submissions/getrequest/${eventId}`,
          { headers },
        );
        const requestPayload = await requestResponse.json();
        if (!requestResponse.ok) {
          throw new Error(
            requestPayload.message || "Failed to load the transport request",
          );
        }

        const requestResult = requestPayload.data || requestPayload;
        const request = Array.isArray(requestResult)
          ? requestResult[0]
          : requestResult;
        const submission = request?.data || request || {};
        const requestDetails = submission?.requestDetails || request?.requestDetails || {};
        const eventDetails =
          submission?.eventDetails ||
          requestDetails?.eventDetails ||
          requestDetails?.event ||
          {};
        const linkedEvent =
          request?.eventId ||
          request?.event?._id ||
          submission?.eventId ||
          submission?.event?._id ||
          requestDetails?.eventId ||
          requestDetails?.event?._id ||
          eventDetails?._id ||
          eventDetails?.id ||
          submission?.event ||
          request?.event;
        const closingEventId = typeof linkedEvent === "object"
          ? linkedEvent?._id || linkedEvent?.id
          : linkedEvent;
        const resolvedAttendanceEventId = closingEventId || eventId;
        setAttendanceEventId(closingEventId || eventId);

        let attendanceDocumentsSubmitted = false;
        if (isAttendanceRequest) {
          const attendanceResponse = await fetch(
            `${API_BASE}/api/individual-attendance/documents/${resolvedAttendanceEventId}`,
            { headers },
          );
          attendanceDocumentsSubmitted = attendanceResponse.ok;
          if (attendanceResponse.ok) {
            localStorage.setItem(documentsSubmittedKey, "true");
          } else if (attendanceResponse.status !== 404) {
            const attendanceError = await attendanceResponse.json().catch(() => ({}));
            throw new Error(
              attendanceError.message || "Failed to check uploaded attendance documents",
            );
          }
        }

        let requiredData;
        let existingClosingData = {};
        let documents = [];

        if (closingEventId) {
          const [requiredResponse, uploadedResponse] = await Promise.all([
            fetch(`${API_BASE}/api/events/documents/${closingEventId}`, { headers }),
            fetch(`${API_BASE}/api/event-closing-documents/event/${closingEventId}`, { headers }),
          ]);
          const requiredPayload = await requiredResponse.json().catch(() => ({}));
          if (!requiredResponse.ok && requiredResponse.status !== 404) {
            throw new Error(requiredPayload.message || "Failed to load required documents");
          }

          const uploadedPayload = uploadedResponse.ok
            ? await uploadedResponse.json()
            : null;
          if (!uploadedResponse.ok && uploadedResponse.status !== 404) {
            const errorPayload = await uploadedResponse.json().catch(() => ({}));
            throw new Error(errorPayload.message || "Failed to check uploaded documents");
          }

          requiredData = requiredPayload.data || requiredPayload;
          existingClosingData = uploadedPayload?.data || uploadedPayload || {};
          documents = requiredData.requiredDocuments || [];
        } else {
          const candidateLists = [
            submission?.requiredDocuments,
            submission?.data?.requiredDocuments,
            requestDetails?.requiredDocuments,
            eventDetails?.requiredDocuments,
          ];
          documents = candidateLists.find(
            (candidate) => Array.isArray(candidate) && candidate.length,
          ) || [];
        }

        if (isAttendanceRequest) {
          documents = getDefaultEventAttendingDocuments();
        }
        documents = [...documents].sort(
          (first, second) => first.order - second.order,
        );

        const uploadedDocuments = existingClosingData.documents || [];
        const allDocumentsAlreadyUploaded = documents.length > 0 && documents.every((requiredDocument) => {
          const key = toDocumentKey(requiredDocument.name);
          return uploadedDocuments.some((uploadedDocument) => (
            uploadedDocument.label?.trim().toLowerCase() === requiredDocument.name?.trim().toLowerCase()
            || (uploadedDocument.key && toDocumentKey(uploadedDocument.key) === key)
          ));
        });

        setRequiredDocuments(documents);
        setClosingEventId(closingEventId || eventId);
        setClosingDocumentId(existingClosingData._id || null);
        setDocumentStep(
          !attendanceDocumentsSubmitted && !allDocumentsAlreadyUploaded,
        );
      } catch (error) {
        console.error("Failed to load required transport documents:", error);
        setDocumentLoadError(error.message || "Failed to load required documents");
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchRequiredDocuments();
  }, [documentsSubmittedKey, eventId, requestKey]);

  const normalizeFormRow = (row = {}) => ({
    name: row?.expenseName || row?.name || row?.mediaName || "",
    billNo: row?.billNo || row?.billNumber || "",
    billDate: row?.billDate || row?.date || "",
    vendor: row?.vendorOrGuestName || row?.vendor || row?.guestName || "",
    amount: row?.amount || row?.totalAmount || row?.cost || "",
    file: null,
    fileError: "",
  });

  useEffect(() => {
    const fetchExistingData = async () => {
      const expenditureEventId =
        requestKey === "eventattending" ? attendanceEventId : eventId;
      if (!expenditureEventId) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE}/api/individual/expenditure/${expenditureEventId}`, {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) return;

        const payload = await response.json();
        const data = payload?.data ?? payload;
        const requestData = data?.expenditure ?? data ?? {};

        const sectionRows = Array.isArray(requestData?.[requestKey])
          ? requestData[requestKey].map(normalizeFormRow)
          : [];
        const miscRows = Array.isArray(requestData?.others)
          ? requestData.others.map(normalizeFormRow)
          : [];

        if (sectionRows.length) setFoodDetails(sectionRows);
        if (miscRows.length) setMiscDetails(miscRows);
        if (data?.remarks || requestData?.remarks) setRemarks(data?.remarks || requestData?.remarks || "");
        const savedExpenditureId = requestData?._id;
        setExpenditureRecordId(savedExpenditureId || null);
        setIsEditMode(Boolean(savedExpenditureId && (sectionRows.length || miscRows.length)));
      } catch (error) {
        console.error("Failed to load individual expenditure for edit:", error);
      }
    };

    fetchExistingData();
  }, [attendanceEventId, eventId, requestKey]);

  const handleFoodChange = (index, field, value) => {
    setFoodDetails((currentDetails) => currentDetails.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  const handleMiscChange = (index, field, value) => {
    setMiscDetails((currentDetails) => currentDetails.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  const handleFileUpload = (file, section, index) => {
    if (!file) return;

    const change = section === "food" ? handleFoodChange : handleMiscChange;
    const fileName = file.name || "";
    const isPdf = fileName.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";

    if (!isPdf) {
      change(index, "file", null);
      change(index, "fileError", "Only PDF files are allowed");
      return;
    }

    if (file.size > 1024 * 1024) {
      change(index, "file", null);
      change(index, "fileError", "File is more than 1 MB");
      return;
    }

    change(index, "file", file);
    change(index, "fileError", "");
  };

  const handleFileDrop = (e, section, index) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files?.[0], section, index);
  };

  const removeFile = (section, index) => {
    if (section === "food") {
      handleFoodChange(index, "file", null);
      handleFoodChange(index, "fileError", "");
    } else {
      handleMiscChange(index, "file", null);
      handleMiscChange(index, "fileError", "");
    }
  };

  const addFoodRow = () => {
    setFoodDetails([...foodDetails, { name: "", billNo: "", billDate: "", vendor: "", amount: "", file: null, fileError: "" }]);
  };

  const addMiscRow = () => {
    setMiscDetails([...miscDetails, { name: "", billNo: "", billDate: "", vendor: "", amount: "", file: null, fileError: "" }]);
  };

  const removeFoodRow = (index) => {
    setFoodDetails(foodDetails.filter((_, rowIndex) => rowIndex !== index));
  };

  const removeMiscRow = (index) => {
    setMiscDetails(miscDetails.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!eventId) {
      setSubmitError("Request ID is missing");
      return;
    }

    const expenditureEventId =
      requestKey === "eventattending" ? attendanceEventId : eventId;
    const hasDetails = (item) => (
      item.name || item.billNo || item.billDate || item.vendor || item.amount || item.file
    );
    const getFilledRows = (rows) => rows.filter(hasDetails);
    const foodRows = getFilledRows(foodDetails);
    const miscRows = getFilledRows(miscDetails);

    if (isAttendanceRequest && foodRows.some((item) => !item.name.trim())) {
      setSubmitError("Expense name is required");
      return;
    }

    if (isAttendanceRequest && foodRows.some((item) => (
      !String(item.amount ?? "").trim() || !Number.isFinite(Number(item.amount))
    ))) {
      setSubmitError("Enter a valid amount");
      return;
    }

    const hasExpenditureRows = isAttendanceRequest
      ? foodRows.length > 0
      : foodRows.length > 0 || miscRows.length > 0;
    if (!hasExpenditureRows) {
      setSubmitError("Please enter at least one expenditure");
      return;
    }

    const submittedRows =
      isAttendanceRequest ? foodDetails : [...foodDetails, ...miscDetails];
    const invalidFile = submittedRows.find((item) => item.fileError);
    if (invalidFile) {
      setSubmitError(invalidFile.fileError);
      return;
    }

    const missingUpload = submittedRows.find((item) => {
      const hasEntry = item.name || item.billNo || item.billDate || item.vendor || item.amount;
      return hasEntry && !item.file;
    });
    if (missingUpload) {
      setSubmitError("Please upload a PDF file for each entered expenditure");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append(isAttendanceRequest ? "eventId" : "requestId", expenditureEventId);

      const foodPayload = foodRows.map((item) => ({
        expenseName: item.name,
        billNo: item.billNo,
        billDate: item.billDate,
        vendorOrGuestName: item.vendor,
        amount: isAttendanceRequest ? Number(item.amount) : item.amount,
      }));
      const othersPayload = miscRows.map((item) => ({
        expenseName: item.name,
        billNo: item.billNo,
        billDate: item.billDate,
        vendorOrGuestName: item.vendor,
        amount: item.amount,
      }));

      formData.append(requestKey, JSON.stringify(foodPayload));
      if (!isAttendanceRequest) {
        formData.append("others", JSON.stringify(othersPayload));
        formData.append("remarks", remarks);
      }

      foodRows.forEach((item) => {
        if (item.file) formData.append(`${requestKey}Files`, item.file, item.file.name);
      });
      if (!isAttendanceRequest) {
        miscRows.forEach((item) => {
          if (item.file) formData.append("othersFiles", item.file, item.file.name);
        });

        if (miscRows[0]?.file) formData.append("othersFile", miscRows[0].file, miscRows[0].file.name);
      }

      const endpoint = isAttendanceRequest
        ? `${API_BASE}/api/individual/expenditure`
        : isEditMode
          ? `${API_BASE}/api/individual/expenditure/${expenditureEventId}`
          : `${API_BASE}/api/individual/expenditure`;

      const response = await fetch(endpoint, {
        method: isAttendanceRequest || !isEditMode ? "POST" : "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Unable to upload expenditure details");
      }

      navigate(`/dashboard-faculty/individual-feedback/${eventId}`);
    } catch (error) {
      setSubmitError(error.message || "Unable to upload expenditure details");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequiredDocumentSubmit = async () => {
    const missingDocuments = requiredDocuments.filter(
      (document) =>
        !requiredDocumentFiles[toDocumentFileRef(document)],
    );
    if (missingDocuments.length) {
      setSubmitError(
        `Please upload all required documents. Missing: ${missingDocuments.map((document) => document.name).join(", ")}`,
      );
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const invalidDocument = requiredDocuments.find((document) => {
        const file = requiredDocumentFiles[toDocumentFileRef(document)];
        return file && !isSupportedRequiredDocument(file);
      });
      if (invalidDocument) {
        throw new Error(`${invalidDocument.name} must be a PDF or JPG file.`);
      }
      const token = localStorage.getItem("token");
      const requiredDocumentsToSubmit = requiredDocuments;
      if (!requiredDocumentsToSubmit.length) {
        throw new Error("Please keep at least one required document.");
      }
      const formData = new FormData();
      formData.append("event", closingEventId || eventId);
      requiredDocumentsToSubmit.forEach((document) => {
        const file = requiredDocumentFiles[toDocumentFileRef(document)];
        formData.append(toDocumentFileRef(document), file, file.name);
      });

      const response = await fetch(`${API_BASE}/api/individual-attendance/documents`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const responsePayload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMessage = responsePayload.message || "Unable to submit required documents";
        if (errorMessage.toLowerCase().includes("attendance documents already exist")) {
          localStorage.setItem(documentsSubmittedKey, "true");
          setClosingDocumentId(responsePayload?.data?._id || closingDocumentId);
          setDocumentStep(false);
          return;
        }
        throw new Error(errorMessage);
      }

      localStorage.setItem(documentsSubmittedKey, "true");
      setDocumentStep(false);

      const savedDocuments = responsePayload?.data || responsePayload;
      setClosingDocumentId(savedDocuments?._id || closingDocumentId);
      setSubmitSuccess("");
    } catch (error) {
      console.error("Failed to submit required transport documents:", error);
      setSubmitError(error.message || "Unable to submit required documents");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {documentStep ? (
        <>
          <div className="mb-6 text-sm text-slate-400">
            <span>{requestType}</span> <span className="mx-2">›</span>{" "}
            <span className="text-purple-300">Document Upload</span>
          </div>

          <div className="mb-8">
            <h1 className="mb-2 text-2xl font-bold">Upload Required Documents</h1>
            <p className="text-xs text-slate-400">
              Upload every required document and submit them before entering expenditure details.
            </p>
          </div>

          {isLoadingDocuments ? (
            <p className="py-12 text-center text-sm text-slate-400">
              Loading required documents...
            </p>
          ) : documentLoadError ? (
            <div className="py-8">
              <p role="alert" className="text-sm text-red-400">
                {documentLoadError}
              </p>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-6 rounded border border-purple-600 px-4 py-2 text-sm font-medium text-purple-400 transition hover:bg-purple-600/10"
              >
                ← Back
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8 space-y-6">
                {requiredDocuments.map((document) => {
                  const fileRef = toDocumentFileRef(document);
                  const file = requiredDocumentFiles[fileRef];

                  return (
                    <div key={fileRef}>
                      <label
                        htmlFor={fileRef}
                        className="mb-3 block text-sm font-medium text-slate-200"
                      >
                        {document.order}. {document.name}
                        <span className="ml-1 text-red-400">*</span>
                      </label>
                      <div
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          const droppedFile = event.dataTransfer.files?.[0];
                          if (droppedFile) {
                            if (
                              isSupportedRequiredDocument(droppedFile)
                            ) {
                              setRequiredDocumentFiles((currentFiles) => ({
                                ...currentFiles,
                                [fileRef]: droppedFile,
                              }));
                              setSubmitError("");
                            } else {
                              setSubmitError("Only PDF or JPG files are allowed.");
                            }
                          }
                        }}
                        className="flex min-h-[68px] items-center justify-center gap-2 rounded-md border border-dashed border-slate-700 bg-[#151d31] px-5 py-4 text-sm text-slate-300 hover:border-purple-500"
                      >
                        <label
                          htmlFor={fileRef}
                          className="flex cursor-pointer items-center justify-center gap-2"
                        >
                          {file ? (
                            <>
                              <FileText size={17} className="shrink-0 text-purple-400" />
                              <span className="max-w-[70%] truncate">{file.name}</span>
                            </>
                          ) : (
                            <>
                              <Upload size={17} className="text-slate-400" />
                              <span>
                                Drag and drop the file here or{" "}
                                <span className="text-purple-400">choose file</span>
                              </span>
                            </>
                          )}
                        </label>
                        <input
                          id={fileRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                          className="hidden"
                          onChange={(event) => {
                            const selectedFile = event.target.files?.[0];
                            if (selectedFile) {
                              if (
                                isSupportedRequiredDocument(selectedFile)
                              ) {
                                setRequiredDocumentFiles((currentFiles) => ({
                                  ...currentFiles,
                                  [fileRef]: selectedFile,
                                }));
                                setSubmitError("");
                              } else {
                                event.target.value = "";
                                setSubmitError("Only PDF or JPG files are allowed.");
                              }
                            }
                          }}
                        />
                        {file && (
                          <button
                            type="button"
                            aria-label={`Delete ${document.name} row`}
                            onClick={() => {
                              setRequiredDocuments((currentDocuments) =>
                                currentDocuments.filter(
                                  (currentDocument) =>
                                    toDocumentFileRef(currentDocument) !== fileRef,
                                ),
                              );
                              setRequiredDocumentFiles((currentFiles) => {
                                const nextFiles = { ...currentFiles };
                                delete nextFiles[fileRef];
                                return nextFiles;
                              });
                              const input = window.document.getElementById(fileRef);
                              if (input) input.value = "";
                            }}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            <X size={17} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {submitError && (
                <p role="alert" className="mb-4 text-sm text-red-400">
                  {submitError}
                </p>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="rounded border border-purple-600 px-4 py-2 text-sm font-medium text-purple-400 transition hover:bg-purple-600/10"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleRequiredDocumentSubmit}
                  disabled={isSubmitting || isLoadingDocuments || !!documentLoadError}
                  className="rounded bg-purple-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Loading..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-slate-400">
        <span>{requestType}</span> <span className="mx-2">›</span> <span>Expenditure Details</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Expenditure Details</h1>
        {/* <p className="text-slate-400 text-xs">Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s</p> */}
      </div>

      {/* Food Details Section */}
      <div className="mb-12">
        {foodDetails.map((item, index) => (
          <div key={index} className="mb-8 last:mb-0 bg-[#191D36] border border-slate-700/50 p-6 rounded-lg">
            {index === 0 && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-medium text-purple-400">{sectionTitle}</h2>
                <button
                  onClick={addFoodRow}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            )}
            {index > 0 && (
              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  onClick={() => removeFoodRow(index)}
                  className="border border-red-500/60 text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            )}
            {/* Name of expense */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Name of the expense <span className=""></span>
              </label>
              <input
                type="text"
                placeholder="e.g.pcs"
                value={item.name}
                onChange={(e) => handleFoodChange(index, "name", e.target.value)}
                className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Bill No and Bill Date */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Bill No <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="123456789"
                  value={item.billNo}
                  onChange={(e) => handleFoodChange(index, "billNo", e.target.value)}
                  className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Bill Date <span className=""></span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={item.billDate}
                    onChange={(e) => handleFoodChange(index, "billDate", e.target.value)}
                    className="w-full border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer pr-10"
                    style={{ colorScheme: 'dark' }}
                  />
                  {item.billDate && <span className="absolute right-10 top-2.5 text-slate-300 text-sm pointer-events-none">{new Date(item.billDate).toLocaleDateString()}</span>}
                 
                </div>
              </div>
            </div>

            {/* Vendor and Amount */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Vendor / Guest name <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g.Vikram"
                  value={item.vendor}
                  onChange={(e) => handleFoodChange(index, "vendor", e.target.value)}
                  className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Amount <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="₹"
                  value={item.amount}
                  onChange={(e) => handleFoodChange(index, "amount", e.target.value)}
                  className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Upload <span className="text-red-400">*</span>
              </label>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, "food", index)}
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded px-4 py-6 cursor-pointer hover:border-slate-500 transition"
              >
                <Upload size={20} className="mb-2 text-slate-400" />
                {item.file ? (
                  <div className="relative flex w-full justify-center text-slate-300 text-xs">
                    <span>{item.file.name}</span>
                    <button
                      type="button"
                      aria-label="Delete uploaded file"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFile("food", index);
                      }}
                      className="absolute right-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">Drag and drop the files here or <span className="text-purple-500">choose file</span></span>
                )}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], "food", index)}
                  className="hidden"
                />
              </label>
              {item.fileError && <p className="mt-2 text-xs text-red-400">{item.fileError}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Miscellaneous Section */}
      {!isAttendanceRequest && <div className="mb-12">
        {miscDetails.map((item, index) => (
          <div key={index} className="mb-8 last:mb-0 bg-[#191D36] border border-slate-700/50 p-6 rounded-lg">
            {index === 0 && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-medium text-purple-400">miscellaneous ( others )</h2>
                <button
                  onClick={addMiscRow}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            )}
            {index > 0 && (
              <div className="flex justify-end mb-6">
                <button
                  type="button"
                  onClick={() => removeMiscRow(index)}
                  className="border border-red-500/60 text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            )}
            {/* Name of expense */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Name of the expense <span className=""></span>
              </label>
              <input
                type="text"
                placeholder="e.g.pcs"
                value={item.name}
                onChange={(e) => handleMiscChange(index, "name", e.target.value)}
                className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Bill No and Bill Date */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Bill No <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="111632782"
                  value={item.billNo}
                  onChange={(e) => handleMiscChange(index, "billNo", e.target.value)}
                  className="w-full border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Bill Date <span className=""></span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={item.billDate}
                    onChange={(e) => handleMiscChange(index, "billDate", e.target.value)}
                    className="w-full  border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 cursor-pointer pr-10"
                    style={{ colorScheme: 'dark' }}
                  />
                  {item.billDate && <span className="absolute right-10 top-2.5 text-slate-300 text-sm pointer-events-none">{new Date(item.billDate).toLocaleDateString()}</span>}
                  <span className="absolute right-3 top-2 text-slate-400 pointer-events-none"><Calendar size={16} /></span>
                </div>
              </div>
            </div>

            {/* Vendor and Amount */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Vendor / Guest name <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="e.g.Vikram"
                  value={item.vendor}
                  onChange={(e) => handleMiscChange(index, "vendor", e.target.value)}
                  className="w-full border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Amount <span className=""></span>
                </label>
                <input
                  type="text"
                  placeholder="₹"
                  value={item.amount}
                  onChange={(e) => handleMiscChange(index, "amount", e.target.value)}
                  className="w-full border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Upload <span className="text-red-400">*</span>
              </label>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleFileDrop(e, "misc", index)}
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded px-4 py-6 cursor-pointer hover:border-slate-500 transition"
              >
                <Upload size={20} className="mb-2 text-slate-400" />
                {item.file ? (
                  <div className="relative flex w-full justify-center text-slate-300 text-xs">
                    <span>{item.file.name}</span>
                    <button
                      type="button"
                      aria-label="Delete uploaded file"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFile("misc", index);
                      }}
                      className="absolute right-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">Drag and drop the files here or <span className="text-purple-500">choose file</span></span>
                )}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], "misc", index)}
                  className="hidden"
                />
              </label>
              {item.fileError && <p className="mt-2 text-xs text-red-400">{item.fileError}</p>}
            </div>
          </div>
        ))}
      </div>}

      {/* Remarks */}
      {!isAttendanceRequest && <div className="mb-8">
        <label className="block text-xs font-medium text-slate-300 mb-2">
          Remarks if any <span className=""></span>
        </label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder=""
          rows="3"
          className="w-full border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        ></textarea>
      </div>}

      {/* Action Buttons */}
      {(submitError || submitSuccess) && (
        <p className={`mb-4 text-sm ${submitError ? "text-red-400" : "text-green-400"}`}>
          {submitError || submitSuccess}
        </p>
      )}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={requestKey === "eventattending" ? () => navigate(-1) : undefined}
          className="border border-purple-600 text-purple-500 hover:bg-purple-600/10 px-4 py-2 rounded text-sm font-medium transition"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded text-sm font-medium transition"
        >
          {isSubmitting
            ? isEditMode
              ? "Saving..."
              : "Uploading..."
            : isEditMode
              ? "Save"
              : "Continue →"}
        </button>
      </div>
        </>
      )}
    </div>
  );
}
