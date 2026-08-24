import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  Plus,
  Edit2,
  Trash2,
  Check,
  Search,
  X,
  Upload,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";

import {
  getDocumentNames,
  createDocumentName,
  updateDocumentName,
  deleteDocumentName,
  importDocumentNames,
} from "../../../services/Admin/eventDocumentService";

export default function AddEventDocument({
  isOpen,
  onClose,
  onDataChanged,
}) {
  // ============================================
  // GENERAL STATES
  // ============================================

  const [uploadMode, setUploadMode] =
    useState("single");

  const [documentNames, setDocumentNames] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // ============================================
  // SINGLE UPLOAD STATES
  // ============================================

  const [isAdding, setIsAdding] =
    useState(false);

  const [newDocumentName, setNewDocumentName] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [editDocumentName, setEditDocumentName] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [deleteModalId, setDeleteModalId] =
    useState(null);

  // ============================================
  // BULK UPLOAD STATES
  // ============================================

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [bulkLoading, setBulkLoading] =
    useState(false);

  const [bulkError, setBulkError] =
    useState("");

  const [bulkSuccess, setBulkSuccess] =
    useState("");

  const [importResult, setImportResult] =
    useState(null);

  const fileInputRef = useRef(null);

  // ============================================
  // COMMON ERROR STATE
  // ============================================

  const [errorMessage, setErrorMessage] =
    useState("");

  // ============================================
  // RESET WHEN OFF-CANVAS OPENS
  // ============================================

  useEffect(() => {
    if (isOpen) {
      fetchDocumentNames();

      // Default mode
      setUploadMode("single");

      // Single upload reset
      setIsAdding(false);
      setNewDocumentName("");
      setEditingId(null);
      setEditDocumentName("");
      setDeleteModalId(null);
      setSearchQuery("");

      // Bulk upload reset
      setSelectedFile(null);
      setBulkError("");
      setBulkSuccess("");
      setImportResult(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setErrorMessage("");
    }
  }, [isOpen]);

  // ============================================
  // FETCH DOCUMENTS
  // ============================================

  const fetchDocumentNames = async () => {
    try {
      setLoading(true);

      const response =
        await getDocumentNames();

      const data =
        response?.data ||
        response ||
        [];

      setDocumentNames(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch document names:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to fetch document names"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SWITCH UPLOAD MODE
  // ============================================

  const handleModeChange = (mode) => {
    setUploadMode(mode);

    // Clear common messages
    setErrorMessage("");

    // Reset single mode temporary states
    setIsAdding(false);
    setNewDocumentName("");
    setEditingId(null);
    setEditDocumentName("");

    // Reset bulk mode states
    setSelectedFile(null);
    setBulkError("");
    setBulkSuccess("");
    setImportResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================
  // CREATE DOCUMENT
  // ============================================

  const handleCreate = async () => {
    if (!newDocumentName.trim()) {
      setErrorMessage(
        "Please enter a document name"
      );

      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      await createDocumentName({
        name:
          newDocumentName.trim(),
        isActive: true,
      });

      setNewDocumentName("");
      setIsAdding(false);

      await fetchDocumentNames();

      // Refresh ViewEventDocumentMapping
      onDataChanged?.();
    } catch (error) {
      console.error(
        "Failed to create document:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to create document name"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // UPDATE DOCUMENT
  // ============================================

  const handleUpdate = async (id) => {
    if (!editDocumentName.trim()) {
      setErrorMessage(
        "Document name cannot be empty"
      );

      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const currentDocument =
        documentNames.find(
          (document) =>
            (
              document._id ||
              document.id
            ) === id
        );

      await updateDocumentName(id, {
        name:
          editDocumentName.trim(),

        isActive:
          currentDocument?.isActive ??
          true,
      });

      setEditingId(null);
      setEditDocumentName("");

      await fetchDocumentNames();

      // Refresh ViewEventDocumentMapping
      onDataChanged?.();
    } catch (error) {
      console.error(
        "Failed to update document:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to update document name"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DELETE DOCUMENT
  // ============================================

  const handleDelete = async () => {
    if (!deleteModalId) return;

    try {
      setLoading(true);
      setErrorMessage("");

      await deleteDocumentName(
        deleteModalId
      );

      setDeleteModalId(null);

      await fetchDocumentNames();

      // Refresh ViewEventDocumentMapping
      onDataChanged?.();
    } catch (error) {
      console.error(
        "Failed to delete document:",
        error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to delete document name"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FILE VALIDATION
  // ============================================

  const validateExcelFile = (file) => {
    if (!file) {
      return {
        valid: false,
        message:
          "Please select an Excel file",
      };
    }

    const allowedExtensions =
      [".xlsx", ".xls"];

    const fileName =
      file.name.toLowerCase();

    const hasValidExtension =
      allowedExtensions.some(
        (extension) =>
          fileName.endsWith(
            extension
          )
      );

    if (!hasValidExtension) {
      return {
        valid: false,
        message:
          "Invalid file type. Please upload only .xlsx or .xls files.",
      };
    }

    // 10 MB maximum file size
    const maxFileSize =
      10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      return {
        valid: false,
        message:
          "File size exceeds the maximum limit of 10 MB.",
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        message:
          "The selected file is empty.",
      };
    }

    return {
      valid: true,
      message: "",
    };
  };

  // ============================================
  // FILE CHANGE
  // ============================================

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    setBulkError("");
    setBulkSuccess("");
    setImportResult(null);

    if (!file) {
      setSelectedFile(null);

      return;
    }

    const validation =
      validateExcelFile(file);

    if (!validation.valid) {
      setSelectedFile(null);

      setBulkError(
        validation.message
      );

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }

      return;
    }

    setSelectedFile(file);
  };

  // ============================================
  // BULK UPLOAD
  // ============================================

  const handleBulkUpload = async () => {
    setBulkError("");
    setBulkSuccess("");
    setImportResult(null);

    const validation =
      validateExcelFile(selectedFile);

    if (!validation.valid) {
      setBulkError(
        validation.message
      );

      return;
    }

    try {
      setBulkLoading(true);

      const response =
        await importDocumentNames(
          selectedFile
        );

      /*
        Expected backend response:

        {
          success: true,
          message: "Document names imported successfully",
          importedCount: 10,
          skippedCount: 2,
          skipped: [],
          data: []
        }
      */

      if (response?.success === false) {
        throw new Error(
          response?.message ||
            "Failed to import document names"
        );
      }

      const importedCount =
        response?.importedCount ?? 0;

      const skippedCount =
        response?.skippedCount ?? 0;

      setImportResult(response);

      let successMessage =
        response?.message ||
        "Document names imported successfully";

      successMessage +=
        ` Successfully added: ${importedCount}.`;

      if (skippedCount > 0) {
        successMessage +=
          ` Skipped: ${skippedCount} duplicate or invalid document name(s).`;
      }

      setBulkSuccess(
        successMessage
      );

      // Refresh AddEventDocument list
      await fetchDocumentNames();

      /*
        Refresh ViewEventDocumentMapping
        without page refresh
      */
      onDataChanged?.();

      // Clear selected file
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    } catch (error) {
      console.error(
        "Bulk document upload failed:",
        error
      );

      let message =
        error.response?.data?.message ||
        error.message ||
        "Failed to process the Excel file.";

      /*
        Backend validation errors
      */

      if (
        message
          .toLowerCase()
          .includes("empty")
      ) {
        message =
          "The Excel file does not contain any document names.";
      }

      setBulkError(message);
    } finally {
      setBulkLoading(false);
    }
  };

  // ============================================
  // REMOVE SELECTED FILE
  // ============================================

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setBulkError("");
    setBulkSuccess("");
    setImportResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  // ============================================
  // GET DOCUMENT NAME
  // ============================================

  const getDocumentName = (id) => {
    const document =
      documentNames.find(
        (item) =>
          (
            item._id ||
            item.id
          ) === id
      );

    return (
      document?.name ||
      "Document"
    );
  };

  // ============================================
  // FILTER DOCUMENTS
  // ============================================

  const filteredDocuments =
    documentNames.filter(
      (document) =>
        document?.name
          ?.toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          )
    );

  if (!isOpen) return null;

  return (
    <>
      {/* ============================================ */}
      {/* BACKDROP */}
      {/* ============================================ */}

      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* ============================================ */}
      {/* OFF CANVAS */}
      {/* ============================================ */}

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#16162A] shadow-xl flex flex-col border-l border-[#3A3A5A]">

        {/* ============================================ */}
        {/* HEADER */}
        {/* ============================================ */}

        <div className="flex items-center justify-between p-6 border-b border-[#3A3A5A]">

          <h2 className="text-xl font-semibold text-white">
            Event Document
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close event document panel"
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-[#25253A] transition-colors"
          >
            <X size={20} />
          </button>

        </div>

        {/* ============================================ */}
        {/* UPLOAD MODE TOGGLE */}
        {/* ============================================ */}

        <div className="px-6 pt-5">

          <div
            className="grid grid-cols-2 gap-2 bg-[#1E1E2F] p-1 rounded-lg border border-[#3A3A5A]"
            role="tablist"
            aria-label="Document upload mode"
          >

            {/* SINGLE UPLOAD */}

            <button
              type="button"
              role="tab"
              aria-selected={
                uploadMode === "single"
              }
              aria-label="Single Upload"
              onClick={() =>
                handleModeChange("single")
              }
              className={`
                px-4
                py-2.5
                rounded-md
                text-sm
                font-medium
                transition-all
                ${
                  uploadMode === "single"
                    ? "bg-gradient-to-r from-[#7C3AE7] to-[#4E2593] text-white shadow"
                    : "text-gray-400 hover:text-white hover:bg-[#292940]"
                }
              `}
            >
              Single Upload
            </button>

            {/* BULK UPLOAD */}

            <button
              type="button"
              role="tab"
              aria-selected={
                uploadMode === "bulk"
              }
              aria-label="Bulk Upload"
              onClick={() =>
                handleModeChange("bulk")
              }
              className={`
                px-4
                py-2.5
                rounded-md
                text-sm
                font-medium
                transition-all
                ${
                  uploadMode === "bulk"
                    ? "bg-gradient-to-r from-[#7C3AE7] to-[#4E2593] text-white shadow"
                    : "text-gray-400 hover:text-white hover:bg-[#292940]"
                }
              `}
            >
              Bulk Upload
            </button>

          </div>

        </div>

        {/* ============================================ */}
        {/* SINGLE UPLOAD SECTION */}
        {/* ============================================ */}

        {uploadMode === "single" && (
          <>
            {/* SEARCH */}

            <div className="px-6 pt-6 pb-4">

              <div className="flex items-center justify-between gap-3 mb-4">

                <span className="text-sm text-gray-300">
                  Manage Document Names
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(true);
                    setNewDocumentName("");
                    setErrorMessage("");
                  }}
                  aria-label="Add event document"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[#6730C0] hover:bg-[#5A29A8] transition-colors"
                  title="Add Event Document"
                >
                  <Plus
                    size={18}
                    className="text-white"
                  />
                </button>

              </div>

              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search document name..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    h-11
                    pl-11
                    pr-4
                    rounded-lg
                    border
                    border-[#3A3A5A]
                    bg-[#1E1E2F]
                    text-white
                    placeholder:text-gray-500
                    text-sm
                    outline-none
                    focus:border-[#6730C0]
                    focus:ring-1
                    focus:ring-[#6730C0]
                  "
                />

              </div>

            </div>

            {/* SINGLE CONTENT */}

            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3 custom-scrollbar relative">

              {/* ERROR */}

              {errorMessage && (
                <div className="border border-red-500/40 bg-red-500/10 text-red-300 text-sm rounded-lg p-3 flex items-start gap-2">

                  <AlertCircle
                    size={17}
                    className="mt-0.5 flex-shrink-0"
                  />

                  <span>
                    {errorMessage}
                  </span>

                </div>
              )}

              {/* LOADING */}

              {loading &&
                documentNames.length === 0 && (
                  <div className="text-center text-gray-400 py-5">
                    Loading...
                  </div>
                )}

              {/* ADD DOCUMENT */}

              {isAdding && (
                <div className="flex items-center gap-2 border border-[#7C3AE7] rounded-lg p-3">

                  <input
                    type="text"
                    autoFocus
                    value={newDocumentName}
                    onChange={(e) =>
                      setNewDocumentName(
                        e.target.value
                      )
                    }
                    placeholder="add document name"
                    className="bg-transparent text-white text-sm outline-none flex-1 placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter"
                      ) {
                        handleCreate();
                      }

                      if (
                        e.key === "Escape"
                      ) {
                        setIsAdding(false);
                        setNewDocumentName("");
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={
                      loading ||
                      !newDocumentName.trim()
                    }
                    aria-label="Save document name"
                    className="text-purple-400 hover:text-purple-300 p-1 disabled:opacity-50"
                  >
                    <Check size={18} />
                  </button>

                </div>
              )}

              {/* EMPTY STATE */}

              {!loading &&
                filteredDocuments.length === 0 &&
                !isAdding && (
                  <div className="text-center text-gray-500 py-10 text-sm">
                    No document names found
                  </div>
                )}

              {/* DOCUMENT LIST */}

              {filteredDocuments.map(
                (document) => {
                  const id =
                    document._id ||
                    document.id;

                  const isEditing =
                    editingId === id;

                  return (
                    <div
                      key={id}
                      className="
                        flex
                        items-center
                        justify-between
                        border
                        border-[#3A3A5A]
                        rounded-lg
                        p-3
                        hover:border-gray-500
                        transition-colors
                      "
                    >

                      {isEditing ? (
                        <input
                          type="text"
                          autoFocus
                          value={
                            editDocumentName
                          }
                          onChange={(e) =>
                            setEditDocumentName(
                              e.target.value
                            )
                          }
                          className="bg-transparent text-white text-sm outline-none flex-1"
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter"
                            ) {
                              handleUpdate(id);
                            }

                            if (
                              e.key === "Escape"
                            ) {
                              setEditingId(null);
                              setEditDocumentName("");
                            }
                          }}
                        />
                      ) : (
                        <span className="text-gray-200 text-sm">
                          {document.name}
                        </span>
                      )}

                      <div className="flex items-center gap-2 ml-3">

                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdate(id)
                              }
                              disabled={
                                loading ||
                                !editDocumentName.trim()
                              }
                              aria-label="Save document changes"
                              className="text-green-400 hover:text-green-300 p-1 disabled:opacity-50"
                            >
                              <Check
                                size={18}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditDocumentName("");
                              }}
                              aria-label="Cancel document editing"
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <X
                                size={18}
                              />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(id);

                                setEditDocumentName(
                                  document.name
                                );

                                setErrorMessage("");
                              }}
                              aria-label={`Edit ${document.name}`}
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <Edit2
                                size={16}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteModalId(
                                  id
                                )
                              }
                              aria-label={`Delete ${document.name}`}
                              className="text-gray-400 hover:text-red-400 p-1"
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          </>
        )}

        {/* ============================================ */}
        {/* BULK UPLOAD SECTION */}
        {/* ============================================ */}

        {uploadMode === "bulk" && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

            <div>

              <h3 className="text-white text-base font-medium">
                Bulk Upload Event Documents
              </h3>

              <p className="text-gray-500 text-sm mt-1 leading-6">
                Upload an Excel file containing
                event document names.
              </p>

            </div>

            {/* EXCEL FORMAT INFO */}

            {/* ERROR MESSAGE */}

            {bulkError && (
              <div className="border border-red-500/40 bg-red-500/10 text-red-300 text-sm rounded-lg p-3 flex items-start gap-2">

                <AlertCircle
                  size={17}
                  className="mt-0.5 flex-shrink-0"
                />

                <span>
                  {bulkError}
                </span>

              </div>
            )}

            {/* SUCCESS MESSAGE */}

            {bulkSuccess && (
              <div className="border border-green-500/40 bg-green-500/10 text-green-300 text-sm rounded-lg p-3">

                {bulkSuccess}

              </div>
            )}

            {/* FILE INPUT */}

            <div>

              <label
                htmlFor="event-document-excel"
                className="text-sm text-gray-300 mb-2 block"
              >
                Select Excel File
              </label>

              <input
                ref={fileInputRef}
                id="event-document-excel"
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                disabled={bulkLoading}
                className="hidden"
              />

              {!selectedFile ? (
                <label
                  htmlFor="event-document-excel"
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-3
                    min-h-[180px]
                    border-2
                    border-dashed
                    border-[#4A4A6A]
                    rounded-xl
                    bg-[#1E1E2F]
                    cursor-pointer
                    hover:border-[#7C3AE7]
                    hover:bg-[#24243A]
                    transition-all
                  "
                >

                  <div className="w-12 h-12 rounded-full bg-[#7C3AE7]/15 flex items-center justify-center">

                    <Upload
                      size={22}
                      className="text-[#9B6CF0]"
                    />

                  </div>

                  <div className="text-center">

                    <p className="text-sm text-gray-200">
                      Click to select an Excel file
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      .xlsx or .xls only
                    </p>

                  </div>

                </label>
              ) : (
                <div className="border border-[#7C3AE7]/50 bg-[#1E1E2F] rounded-lg p-4">

                  <div className="flex items-center justify-between gap-3">

                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-10 h-10 rounded-lg bg-[#7C3AE7]/15 flex items-center justify-center flex-shrink-0">

                        <FileSpreadsheet
                          size={20}
                          className="text-[#9B6CF0]"
                        />

                      </div>

                      <div className="min-w-0">

                        <p className="text-sm text-white truncate">
                          {selectedFile.name}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {(
                            selectedFile.size /
                            1024
                          ).toFixed(2)}{" "}
                          KB
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleRemoveFile
                      }
                      disabled={
                        bulkLoading
                      }
                      aria-label="Remove selected Excel file"
                      className="text-gray-400 hover:text-red-400 p-1 disabled:opacity-50"
                    >
                      <X
                        size={18}
                      />
                    </button>

                  </div>

                </div>
              )}

            </div>

            {/* IMPORT RESULT DETAILS */}

            {importResult?.skippedCount > 0 &&
              Array.isArray(
                importResult?.skipped
              ) && (
                <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-lg p-4">

                  <p className="text-yellow-300 text-sm font-medium mb-2">
                    Skipped Documents
                  </p>

                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">

                    {importResult.skipped.map(
                      (item, index) => (
                        <p
                          key={index}
                          className="text-xs text-gray-400"
                        >
                          {item.name ||
                            "Unknown document"}{" "}
                          -{" "}
                          {item.reason ||
                            "Skipped"}
                        </p>
                      )
                    )}

                  </div>

                </div>
              )}

            {/* BULK UPLOAD BUTTON */}

            <button
              type="button"
              onClick={
                handleBulkUpload
              }
              disabled={
                bulkLoading ||
                !selectedFile
              }
              className="
                w-full
                flex
                items-center
                justify-center
                gap-2
                py-3
                rounded-lg
                text-sm
                font-medium
                text-white
                bg-gradient-to-r
                from-[#7C3AE7]
                to-[#4E2593]
                hover:from-[#6D31D8]
                hover:to-[#421F80]
                transition-all
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >

              {bulkLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                  Processing...
                </>
              ) : (
                <>
                  <Upload
                    size={17}
                  />

                  Upload Document Names
                </>
              )}

            </button>

          </div>
        )}

        {/* ============================================ */}
        {/* DELETE MODAL */}
        {/* ============================================ */}

        {deleteModalId &&
          uploadMode === "single" && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">

              <div
                className="absolute inset-0 bg-[#16162A]/80 backdrop-blur-sm"
                onClick={() =>
                  setDeleteModalId(
                    null
                  )
                }
              />

              <div className="bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg p-5 shadow-2xl relative z-20 w-full max-w-sm text-center">

                <p className="text-white mb-6 text-sm">

                  Are you sure you want to delete{" "}

                  <strong>
                    {getDocumentName(
                      deleteModalId
                    )}
                  </strong>

                  ?

                </p>

                <div className="flex justify-center gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteModalId(
                        null
                      )
                    }
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 text-sm"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleDelete
                    }
                    disabled={
                      loading
                    }
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm"
                  >

                    {loading
                      ? "Deleting..."
                      : "Delete"}

                  </button>

                </div>

              </div>

            </div>
          )}

      </div>
    </>
  );
}