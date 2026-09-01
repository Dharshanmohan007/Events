import React, { useState } from "react";
import { Plus } from "lucide-react";

import AddEventType from "./AddEventType";
import AddEventDocument from "./AddEventDocument";
import ViewEventDocumentMapping from "./ViewEventDocumentMapping";

export default function EventTypeManagement() {
  const [isAddEventTypeOpen, setIsAddEventTypeOpen] =
    useState(false);

  const [isAddEventDocumentOpen, setIsAddEventDocumentOpen] =
    useState(false);

  // This will trigger automatic refresh
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataChanged = () => {
    setRefreshKey((previous) => previous + 1);
  };

  return (
    <div className="w-full">
      {/* PAGE HEADER */}
      <div className="mt-2 flex items-start justify-between p-5">
        <div>
          <h1 className="text-white text-lg font-medium">
            Event Type Management
          </h1>

          <p className="text-[#FFFFFF80] text-sm mt-1">
            View, manage, and organize all event type details,
            availability, and booking information easily.
          </p>
        </div>

        <div className="flex flex-row items-center gap-4">
          {/* ADD EVENT TYPE */}
          <button
            onClick={() => setIsAddEventTypeOpen(true)}
            className="
              flex
              items-center
              gap-2
              cursor-pointer
              px-4
              py-2.5
              rounded-lg
              text-white
              bg-gradient-to-r
              from-[#7C3AE7]
              to-[#4E2593]
              hover:from-[#8A4AF0]
              hover:to-[#5B2AA8]
              transition-all
              whitespace-nowrap
            "
          >
            <Plus size={17} />
            Add Event type
          </button>

          {/* EVENT DOCUMENT */}
          <button
            onClick={() => setIsAddEventDocumentOpen(true)}
            className="
              flex
              items-center
              gap-2
              cursor-pointer
              px-4
              py-2.5
              rounded-lg
              text-white
              bg-gradient-to-r
              from-[#7C3AE7]
              to-[#4E2593]
              hover:from-[#8A4AF0]
              hover:to-[#5B2AA8]
              transition-all
              whitespace-nowrap
            "
          >
            <Plus size={17} />
            Event Document
          </button>
        </div>
      </div>

      {/* VIEW EVENT DOCUMENT MAPPING */}
      <div className="px-5 pb-5">
        <ViewEventDocumentMapping
          refreshKey={refreshKey}
        />
      </div>

      {/* ADD EVENT TYPE */}
      <AddEventType
        isOpen={isAddEventTypeOpen}
        onClose={() => setIsAddEventTypeOpen(false)}
        onDataChanged={handleDataChanged}
      />

      {/* ADD EVENT DOCUMENT */}
      <AddEventDocument
        isOpen={isAddEventDocumentOpen}
        onClose={() => setIsAddEventDocumentOpen(false)}
        onDataChanged={handleDataChanged}
      />
    </div>
  );
}