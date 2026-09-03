import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  GripVertical,
  Search,
  Check,
} from "lucide-react";

import {
  getDocumentNames,
} from "../../../services/Admin/eventDocumentService";

import {
  getEventTypes,
} from "../../../services/events/getEventTypes";

import {
  updateEventType,
  getEventTypeById,
} from "../../../services/events/eventTypesService";

export default function ViewEventDocumentMapping({
  refreshKey,
}) {
  const [eventTypes, setEventTypes] =
    useState([]);

  const [selectedEventType, setSelectedEventType] =
    useState(null);

  const [documents, setDocuments] =
    useState([]);

  const [loadingEventTypes, setLoadingEventTypes] =
    useState(true);

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [searchEventType, setSearchEventType] =
    useState("");

  const [searchDocument, setSearchDocument] =
    useState("");

  const [draggedDocumentId, setDraggedDocumentId] =
    useState(null);

  const documentSelectionsRef = useRef(
    new Map()
  );

  const orderDocumentsBySelection = (
  documentList,
  selectedDocumentIds = []
) => {
  const selectedIds = selectedDocumentIds.map(
    String
  );

  // Selected documents in the exact order
  // in which the user selected them
  const selectedDocuments = selectedIds
    .map((documentId) =>
      documentList.find(
        (document) =>
          String(
            document._id || document.id
          ) === String(documentId)
      )
    )
    .filter(Boolean);

  // Remaining unchecked documents
  const unselectedDocuments = documentList.filter(
    (document) => {
      const documentId =
        document._id || document.id;

      return !selectedIds.includes(
        String(documentId)
      );
    }
  );

  return [
    ...selectedDocuments,
    ...unselectedDocuments,
  ];
};

  const getDocumentId = (document) =>
    document?._id ||
    document?.id ||
    document?.documentId ||
    document;

  const getEventTypeId = (eventType) =>
    eventType?._id || eventType?.id;

  const getStoredDocumentIds = (eventTypeId) => {
    try {
      const storedDocumentIds = localStorage.getItem(
        `event-document-mapping-${eventTypeId}`
      );

      return storedDocumentIds === null
        ? null
        : JSON.parse(storedDocumentIds);
    } catch (error) {
      console.error(
        "Error reading event document mapping:",
        error
      );

      return null;
    }
  };

  const saveDocumentIds = (eventTypeId, documentIds) => {
    localStorage.setItem(
      `event-document-mapping-${eventTypeId}`,
      JSON.stringify(documentIds)
    );
  };

  const getSavedDocumentIds = (eventType) => {
    const eventTypeId = getEventTypeId(eventType);

    if (documentSelectionsRef.current.has(eventTypeId)) {
      return documentSelectionsRef.current.get(eventTypeId);
    }

    const storedDocumentIds = getStoredDocumentIds(eventTypeId);

    return storedDocumentIds ||
      eventType?.documents?.map(getDocumentId) ||
      [];
  };

  // ============================================
  // FETCH EVENT TYPES
  // ============================================

  const fetchEventTypes = async () => {
    try {
      setLoadingEventTypes(true);

      const response =
        await getEventTypes();

      const eventTypeData =
        response?.data ||
        response ||
        [];

      const formattedEventTypes =
        Array.isArray(eventTypeData)
          ? eventTypeData
          : [];

      setEventTypes(
        formattedEventTypes
      );

      formattedEventTypes.forEach((eventType) => {
        const eventTypeId = getEventTypeId(eventType);

        if (!documentSelectionsRef.current.has(eventTypeId)) {
          const storedDocumentIds =
            getStoredDocumentIds(eventTypeId);

          documentSelectionsRef.current.set(
            eventTypeId,
            storedDocumentIds ||
              eventType.documents?.map(getDocumentId) ||
              []
          );
        }
      });

      if (
        formattedEventTypes.length > 0
      ) {
        setSelectedEventType(
          (previousSelected) => {
            const previousSelectedId =
              previousSelected?._id ||
              previousSelected?.id;

            const existingSelectedEvent =
              formattedEventTypes.find(
                (eventType) =>
                  (
                    eventType._id ||
                    eventType.id
                  ) === previousSelectedId
              );

            return (
              existingSelectedEvent ||
              formattedEventTypes[0]
            );
          }
        );
      } else {
        setSelectedEventType(null);
      }

      return formattedEventTypes;
    } catch (error) {
      console.error(
        "Error fetching event types:",
        error
      );
    } finally {
      setLoadingEventTypes(false);
    }
  };

  // ============================================
  // FETCH DOCUMENT NAMES
  // ============================================

  const fetchDocuments = async (
    eventType = selectedEventType,
    preservedDocumentIds = null
  ) => {
    try {
      setLoadingDocuments(true);

      const response =
        await getDocumentNames();

      const documentData =
        response?.data ||
        response ||
        [];
      const selectedDocumentIds =
        preservedDocumentIds || getSavedDocumentIds(eventType);

      const formattedDocuments =
        Array.isArray(documentData)
          ? documentData.map(
              (document) => ({
                ...document,

                checked:
                  selectedDocumentIds.includes(
                    document._id || document.id
                  ),
              })
            )
          : [];

      setDocuments(
        orderDocumentsBySelection(
          formattedDocuments,
          selectedDocumentIds
        )
      );
    } catch (error) {
      console.error(
        "Error fetching document names:",
        error
      );
    } finally {
      setLoadingDocuments(false);
    }
  };

  // ============================================
  // INITIAL LOAD / AUTO REFRESH
  // ============================================

  useEffect(() => {
    const loadMapping = async () => {
      const loadedEventTypes = await fetchEventTypes();
      const previousSelectedId =
        selectedEventType?._id || selectedEventType?.id;
      const eventTypeForDocuments =
        loadedEventTypes?.find(
          (eventType) =>
            (eventType._id || eventType.id) ===
            previousSelectedId
        ) || loadedEventTypes?.[0];
      const currentSelectedId =
        selectedEventType?._id || selectedEventType?.id;
      const eventTypeId =
        eventTypeForDocuments?._id ||
        eventTypeForDocuments?.id;
      const preservedDocumentIds =
        currentSelectedId === eventTypeId
          ? getSavedDocumentIds(eventTypeForDocuments)
          : null;

      await fetchDocuments(
        eventTypeForDocuments,
        preservedDocumentIds
      );
    };

    loadMapping();
  }, [refreshKey]);

 // ============================================
// CHECKBOX CHANGE
// ============================================

const handleCheckboxChange = (documentId) => {
  if (!selectedEventType) {
    return;
  }

  const eventTypeId =
    selectedEventType._id ||
    selectedEventType.id;

  setDocuments((previousDocuments) => {
    const clickedDocument =
      previousDocuments.find(
        (document) =>
          String(
            document._id || document.id
          ) === String(documentId)
      );

    if (!clickedDocument) {
      return previousDocuments;
    }

    const isCurrentlyChecked =
      clickedDocument.checked;

    // Get the current selected order
    let selectedDocumentIds =
      previousDocuments
        .filter((document) => document.checked)
        .map(
          (document) =>
            document._id || document.id
        );

    if (isCurrentlyChecked) {
      /*
        USER IS UNCHECKING

        Remove only this document
        and keep the remaining order unchanged.
      */
      selectedDocumentIds =
        selectedDocumentIds.filter(
          (id) =>
            String(id) !==
            String(documentId)
        );
    } else {
      /*
        USER IS CHECKING

        Add the document at the END.

        Example:

        First click:
        [Document A]

        Second click:
        [Document A, Document B]

        So A stays order 1
        and B becomes order 2.
      */
      selectedDocumentIds.push(
        documentId
      );
    }

    // Update checkbox state
    const updatedDocuments =
      previousDocuments.map(
        (document) => {
          const id =
            document._id || document.id;

          return String(id) ===
            String(documentId)
            ? {
                ...document,
                checked: !isCurrentlyChecked,
              }
            : document;
        }
      );

    // Arrange using CLICK ORDER
    const orderedDocuments =
      orderDocumentsBySelection(
        updatedDocuments,
        selectedDocumentIds
      );

    /*
      SAVE THE EXACT CLICK ORDER
    */

    documentSelectionsRef.current.set(
      eventTypeId,
      selectedDocumentIds
    );

    saveDocumentIds(
      eventTypeId,
      selectedDocumentIds
    );

    return orderedDocuments;
  });
};

  // ============================================
  // DRAG START
  // ============================================

  const handleDragStart = (
    event,
    documentId
  ) => {
    setDraggedDocumentId(
      documentId
    );

    event.dataTransfer.effectAllowed =
      "move";

    event.dataTransfer.setData(
      "text/plain",
      documentId
    );
  };

  // ============================================
  // DRAG OVER
  // ============================================

  const handleDragOver = (
    event
  ) => {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "move";
  };

  // ============================================
  // DROP
  // ============================================

  const handleDrop = (
    event,
    targetDocumentId
  ) => {
    event.preventDefault();

    if (
      !draggedDocumentId ||
      draggedDocumentId ===
        targetDocumentId
    ) {
      setDraggedDocumentId(null);

      return;
    }

    setDocuments(
      (previousDocuments) => {
        const updatedDocuments = [
          ...previousDocuments,
        ];

        const draggedIndex =
          updatedDocuments.findIndex(
            (document) =>
              (
                document._id ||
                document.id
              ) === draggedDocumentId
          );

        const targetIndex =
          updatedDocuments.findIndex(
            (document) =>
              (
                document._id ||
                document.id
              ) === targetDocumentId
          );

        if (
          draggedIndex === -1 ||
          targetIndex === -1
        ) {
          return previousDocuments;
        }

        const [
          draggedDocument,
        ] = updatedDocuments.splice(
          draggedIndex,
          1
        );

        /*
          After removing the dragged item,
          calculate the correct target position.
        */

        const adjustedTargetIndex =
          draggedIndex < targetIndex
            ? targetIndex - 1
            : targetIndex;

        updatedDocuments.splice(
          adjustedTargetIndex,
          0,
          draggedDocument
        );

        return orderDocumentsBySelection(updatedDocuments);
      }
    );

    setDraggedDocumentId(null);
  };

  // ============================================
  // DRAG END
  // ============================================

  const handleDragEnd = () => {
    setDraggedDocumentId(null);
  };

// ============================================
// SYNC DOCUMENTS
// ============================================

const handleSyncDocuments = async () => {
  if (!selectedEventType) {
    alert("Please select an event type");
    return;
  }

  try {
    const eventTypeId =
      selectedEventType._id || selectedEventType.id;

    // ONLY GET CHECKED DOCUMENTS
    const selectedDocuments = documents
      .filter((document) => document.checked)
      .map((document, index) => ({
        name: document.name,
        isActive: true,
        order: index + 1,
      }));

    const payload = {
      eventType: selectedEventType.eventType,
      documents: selectedDocuments,
    };

    console.log("========== SYNC DOCUMENTS ==========");
    console.log("Event Type ID:", eventTypeId);
    console.log(
      "Selected Documents:",
      selectedDocuments
    );
    console.log(
      "Payload:",
      JSON.stringify(payload, null, 2)
    );

    const response = await updateEventType(
      eventTypeId,
      payload
    );

    console.log(
      "Sync Documents Response:",
      response
    );

    // Save selected document IDs locally
    const selectedDocumentIds = documents
      .filter((document) => document.checked)
      .map(
        (document) =>
          document._id || document.id
      );

    documentSelectionsRef.current.set(
      eventTypeId,
      selectedDocumentIds
    );

    saveDocumentIds(
      eventTypeId,
      selectedDocumentIds
    );

    alert("Documents synced successfully");

  } catch (error) {
    console.error(
      "Error syncing event documents:",
      error
    );

    console.error(
      "API Error:",
      error?.response?.data
    );

    alert(
      error?.response?.data?.message ||
        "Failed to sync documents"
    );
  }
};

  // ============================================
  // FILTER EVENT TYPES
  // ============================================

  const filteredEventTypes =
    eventTypes.filter(
      (eventType) =>
        eventType.eventType
          ?.toLowerCase()
          .includes(
            searchEventType.toLowerCase()
          )
    );

  // ============================================
  // FILTER DOCUMENTS
  // ============================================

  const filteredDocuments =
    documents.filter(
      (document) =>
        document.name
          ?.toLowerCase()
          .includes(
            searchDocument.toLowerCase()
          )
    );

      const selectedDocumentCount =
        documents.filter((document) => document.checked).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4">

      {/* ===================================== */}
      {/* LEFT PANEL - EVENT TYPES */}
      {/* ===================================== */}

      <div
        className="
          flex
          min-h-[400px]
          h-[calc(100vh-220px)]
          max-h-[720px]
          flex-col
          bg-[#1B2334]
          border
          border-[#2D374D]
          rounded-xl
          p-4
        "
      >
        <h2 className="text-white font-medium mb-4">
          Event Types
        </h2>

        {/* SEARCH EVENT TYPE */}

        <div className="relative mb-4">
          <Search
            size={15}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-500
            "
          />

          <input
            type="text"
            placeholder="Search event type"
            value={searchEventType}
            onChange={(event) =>
              setSearchEventType(
                event.target.value
              )
            }
            className="
              w-full
              bg-[#252D3E]
              border
              border-[#354057]
              rounded-lg
              h-10
              pl-9
              pr-3
              text-sm
              text-white
              outline-none
              placeholder:text-gray-500
              focus:border-[#7C3AE7]
            "
          />
        </div>

        {/* EVENT TYPE LIST */}

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 table-custom-scrollbar">

          {loadingEventTypes && (
            <p className="text-gray-500 text-sm text-center py-5">
              Loading event types...
            </p>
          )}

          {!loadingEventTypes &&
            filteredEventTypes.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-5">
                No event types found
              </p>
            )}

          {filteredEventTypes.map(
            (eventType) => {
              const id =
                eventType._id ||
                eventType.id;

              const selectedId =
                selectedEventType?._id ||
                selectedEventType?.id;

              const isSelected =
                id === selectedId;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={async () => {
                    const eventTypeId = eventType._id || eventType.id;
                    try {
                      // Fetch the fresh event type from backend to get saved order
                      const fullEventType = await getEventTypeById(eventTypeId);
                      const backendDocuments = fullEventType?.documents || eventType.documents || [];
                      
                      setSelectedEventType(fullEventType || eventType);
                      
                      setDocuments((previousDocuments) => {
                        // Match backend documents by name to get original IDs
                        const selectedDocumentIds = backendDocuments
                          .filter(doc => doc.isActive)
                          .sort((a, b) => a.order - b.order)
                          .map(doc => {
                             const matchingDoc = previousDocuments.find(pd => pd.name === doc.name);
                             return matchingDoc ? getDocumentId(matchingDoc) : null;
                          })
                          .filter(Boolean);
                          
                        // Save locally for consistency
                        documentSelectionsRef.current.set(eventTypeId, selectedDocumentIds);
                        saveDocumentIds(eventTypeId, selectedDocumentIds);
                        
                        const documentsForEventType = previousDocuments.map((document) => ({
                          ...document,
                          checked: selectedDocumentIds.includes(getDocumentId(document)),
                        }));

                        return orderDocumentsBySelection(
                          documentsForEventType,
                          selectedDocumentIds
                        );
                      });
                    } catch (error) {
                      console.error("Error fetching event type details:", error);
                      // Fallback logic
                      const selectedDocumentIds = getSavedDocumentIds(eventType);
                      setSelectedEventType(eventType);
                      setDocuments((previousDocuments) => {
                        const documentsForEventType = previousDocuments.map((document) => ({
                          ...document,
                          checked: selectedDocumentIds.includes(getDocumentId(document)),
                        }));
                        return orderDocumentsBySelection(documentsForEventType, selectedDocumentIds);
                      });
                    }
                  }}
                  className={`
                    w-full
                    flex
                    items-center
                    justify-between
                    px-4
                    py-3
                    rounded-lg
                    text-sm
                    transition-all
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-[#4B3A73] to-[#2D2C4D] text-white border border-[#6246A6]"
                        : "bg-[#252D3E] text-gray-300 hover:bg-[#30394C]"
                    }
                  `}
                >
                  <span>
                    {eventType.eventType}
                  </span>

                  <span className="text-gray-400">
                    ›
                  </span>
                </button>
              );
            }
          )}

        </div>
      </div>

      {/* ===================================== */}
      {/* RIGHT PANEL - DOCUMENTS */}
      {/* ===================================== */}

      <div
        className="
          flex
          min-h-[400px]
          h-[calc(100vh-220px)]
          max-h-[720px]
          flex-col
          bg-[#1B2334]
          border
          border-[#2D374D]
          rounded-xl
          p-4
        "
      >

        {/* HEADER */}

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-medium">
              Event Documents
            </h2>

            {selectedEventType && (
              <p className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <span>
                  {selectedEventType.eventType}
                </span>
                <span className="rounded-full bg-[#30394C] px-2 py-0.5 text-gray-300">
                  {selectedDocumentCount} selected
                </span>
              </p>
            )}
          </div>
          <div className="text-right">
            <button onClick={handleSyncDocuments} className="bg-[#7637DC] text-white px-4 py-2 rounded-lg text-sm cursor-pointer">Sync Documents</button>
          </div>
        </div>

        {/* SEARCH DOCUMENT */}

        <div className="relative mb-4">
          <Search
            size={15}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-500
            "
          />

          <input
            type="text"
            placeholder="Search event document"
            value={searchDocument}
            onChange={(event) =>
              setSearchDocument(
                event.target.value
              )
            }
            className="
              w-full
              bg-[#252D3E]
              border
              border-[#354057]
              rounded-lg
              h-10
              pl-9
              pr-3
              text-sm
              text-white
              outline-none
              placeholder:text-gray-500
              focus:border-[#7C3AE7]
            "
          />
        </div>

        {/* DOCUMENT LIST */}

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 table-custom-scrollbar">

          {loadingDocuments && (
            <p className="text-gray-500 text-sm text-center py-5">
              Loading documents...
            </p>
          )}

          {!loadingDocuments &&
            filteredDocuments.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-5">
                No documents found
              </p>
            )}

          {filteredDocuments.map(
            (document) => {
              const id =
                document._id ||
                document.id;

              /*
                Find actual position from
                the main documents array.

                Serial number always reflects
                the current real order.
              */

              const actualIndex =
                documents.findIndex(
                  (item) =>
                    (
                      item._id ||
                      item.id
                    ) === id
                );

              const serialNumber =
                actualIndex + 1;

              const isDragging =
                draggedDocumentId === id;

              return (
                <div
                  key={id}
                  onDragOver={
                    handleDragOver
                  }
                  onDrop={(event) =>
                    handleDrop(
                      event,
                      id
                    )
                  }
                  className={`
                    flex
                    items-center
                    gap-3
                    px-4
                    py-3
                    rounded-lg
                    border
                    transition-all
                    ${
                      isDragging
                        ? "opacity-40 border-[#7C3AE7]"
                        : "bg-[#252D3E] border-[#354057] hover:border-[#6246A6]"
                    }
                  `}
                >

                  {/* DRAG HANDLE */}

                  <div
                    draggable
                    onDragStart={(event) =>
                      handleDragStart(
                        event,
                        id
                      )
                    }
                    onDragEnd={
                      handleDragEnd
                    }
                    className="
                      cursor-grab
                      active:cursor-grabbing
                      flex-shrink-0
                    "
                    title="Drag to reorder"
                  >
                    <GripVertical
                      size={18}
                      className="text-gray-500"
                    />
                  </div>
                  {/* CHECKBOX */}

                  <button
                    type="button"
                    draggable={false}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                    }}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.preventDefault();

                      event.stopPropagation();

                      handleCheckboxChange(
                        id
                      );
                    }}
                    className={`
                      w-5
                      h-5
                      rounded
                      border
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      cursor-pointer
                      ${
                        document.checked
                          ? "bg-[#7C3AE7] border-[#7C3AE7]"
                          : "border-[#6B7280]"
                      }
                    `}
                    aria-label={`Select ${document.name}`}
                  >
                    {document.checked && (
                      <Check
                        size={14}
                        className="text-white"
                      />
                    )}
                  </button>

                  

                  {/* SERIAL NUMBER */}

                  <span
                    className="
                      text-sm
                      text-gray-400
                      select-none
                      min-w-[24px]
                    "
                  >
                    {serialNumber}.
                  </span>

                  {/* DOCUMENT NAME */}

                  <span className="text-sm text-gray-200">
                    {document.name}
                  </span>

                </div>
              );
            }
          )}

        </div>
      </div>
    </div>
  );
}