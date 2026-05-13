import React, { useState } from "react";
import {
  Plus,
  CalendarDays,
  Clock3,
  MapPin,
  GripVertical,
  X,
} from "lucide-react";

const TransportDetailsPage = () => {
  // Checkpoints state
  const [checkpoints, setCheckpoints] = useState([
    "Sri Krishna Hotel",
  ]);

  // Add checkpoint
  const addCheckpoint = () => {
    setCheckpoints([...checkpoints, ""]);
  };

  // Update checkpoint
  const updateCheckpoint = (index, value) => {
    const updated = [...checkpoints];
    updated[index] = value;
    setCheckpoints(updated);
  };

  // Remove checkpoint
  const removeCheckpoint = (index) => {
    const updated = checkpoints.filter((_, i) => i !== index);
    setCheckpoints(updated);
  };

  return (
    <div className="min-h-screen bg-[#141428] text-white p-5">
      <h1 className="text-2xl font-semibold mb-5">
        Transport Details Form
      </h1>

      {/* Header */}
      <div className="w-full border-b border-[#2a2a40] pb-4 flex justify-end">
        <button className="flex items-center gap-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-medium px-4 py-2 rounded-md transition">
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Form Card */}
      <div className="mt-6 bg-[#1b1b35] rounded-xl p-5 border border-[#2a2a40]">
        
        {/* Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Pickup */}
          <div>
            <label className="text-sm text-white mb-2 block">
              Pickup date & Time *
            </label>

            <div className="flex items-center justify-between border border-[#3a3a5a] rounded-md px-4 py-3">
              <span className="text-[#8d8da8] text-sm">
                __/__/___
              </span>

              <div className="flex items-center gap-3">
                <CalendarDays size={18} />
                <Clock3 size={18} />
              </div>
            </div>
          </div>

          {/* Drop */}
          <div>
            <label className="text-sm text-white mb-2 block">
              Drop date & Time *
            </label>

            <div className="flex items-center justify-between border border-[#3a3a5a] rounded-md px-4 py-3">
              <span className="text-[#8d8da8] text-sm">
                __/__/___
              </span>

              <div className="flex items-center gap-3">
                <CalendarDays size={18} />
                <Clock3 size={18} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="text-sm text-white mb-2 block">
            Pickup Location *
          </label>

          <div className="flex items-center gap-3 border border-[#3a3a5a] rounded-md px-4 py-3">
            <MapPin size={18} />

            <input
              type="text"
              placeholder=""
              className="bg-transparent outline-none text-sm w-full text-white placeholder:text-[#8d8da8]"
            />
          </div>
        </div>

        {/* Add Checkpoint Button */}
        <div className="flex justify-center mt-5">
          <button
            onClick={addCheckpoint}
            className="flex items-center gap-2 text-[#9b5cff] text-sm font-medium"
          >
            <Plus
              size={16}
              className="bg-[#9b5cff] rounded-full p-[2px] text-white"
            />
            Add Checkpoint
          </button>
        </div>

        {/* Checkpoint List */}
        <div className="mt-5 space-y-3">
          {checkpoints.map((checkpoint, index) => (
            <div
              key={index}
              className="bg-[#26264a] rounded-md px-4 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 w-full">
                <GripVertical
                  size={18}
                  className="text-[#8d8da8]"
                />

                <MapPin size={18} />

                <input
                  type="text"
                  value={checkpoint}
                  onChange={(e) =>
                    updateCheckpoint(index, e.target.value)
                  }
                  placeholder={`Checkpoint ${index + 1}`}
                  className="bg-transparent outline-none text-sm w-full text-white placeholder:text-[#8d8da8]"
                />
              </div>

              <button onClick={() => removeCheckpoint(index)}>
                <X
                  size={18}
                  className="text-red-500 cursor-pointer"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransportDetailsPage;