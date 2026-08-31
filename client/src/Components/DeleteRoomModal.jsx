import React, { useState } from "react";
import {
  Trash2,
  X,
  Loader2,
} from "lucide-react";

import { deleteRoom } from "../services/Admin/deleteRoomService";

export default function DeleteRoomModal({
  room,
  onClose,
  onSuccess,
  onError,
}) {
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // Delete Room
  // --------------------------------------------------

  const handleDelete = async () => {
    if (!room?._id) {
      onError("Room ID is missing.");
      return;
    }

    try {
      setLoading(true);

      await deleteRoom(room._id);

      onSuccess("Room deleted successfully.");
    } catch (error) {
      console.error("Delete Room Error:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to delete room.";

      onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* --------------------------------------------- */}
      {/* BACKDROP */}
      {/* --------------------------------------------- */}

      <div
        className="
          fixed
          inset-0
          z-[1000]
          bg-black/70
          backdrop-blur-[2px]
          flex
          items-center
          justify-center
          px-4
        "
      >
        {/* ------------------------------------------- */}
        {/* MODAL */}
        {/* ------------------------------------------- */}

        <div
          className="
            w-full
            max-w-[430px]
            rounded-xl
            bg-[#111A2D]
            border
            border-[#293856]
            shadow-2xl
            overflow-hidden
          "
        >
          {/* ----------------------------------------- */}
          {/* HEADER */}
          {/* ----------------------------------------- */}

          <div
            className="
              flex
              items-center
              justify-between
              px-5
              py-4
              border-b
              border-[#293856]
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  w-10
                  h-10
                  rounded-lg
                  bg-red-500/10
                  flex
                  items-center
                  justify-center
                "
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>

              <h2 className="text-white font-medium">
                Delete Room
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                text-[#FFFFFF66]
                hover:text-white
                transition
                disabled:opacity-50
              "
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ----------------------------------------- */}
          {/* BODY */}
          {/* ----------------------------------------- */}

          <div className="px-5 py-6">
            <p className="text-[#FFFFFFB3] text-sm leading-6">
              Are you sure you want to delete this room
              details?
            </p>

            {room && (
              <div
                className="
                  mt-4
                  px-4
                  py-3
                  rounded-lg
                  bg-[#182238]
                  border
                  border-[#293856]
                "
              >
                <div className="flex items-center justify-between">
                  <span className="text-[#FFFFFF66] text-xs">
                    Venue
                  </span>

                  <span className="text-white text-sm">
                    {room.venue}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-[#FFFFFF66] text-xs">
                    Room Number
                  </span>

                  <span className="text-white text-sm">
                    {room.roomNumber}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ----------------------------------------- */}
          {/* FOOTER */}
          {/* ----------------------------------------- */}

          <div
            className="
              px-5
              py-4
              border-t
              border-[#293856]
              flex
              justify-end
              gap-3
            "
          >
            {/* NO */}

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                px-5
                py-2.5
                rounded-lg
                border
                border-[#33415F]
                bg-transparent
                text-[#FFFFFFB3]
                text-sm
                hover:bg-[#182238]
                hover:text-white
                transition
                disabled:opacity-50
              "
            >
              No
            </button>

            {/* YES */}

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="
                min-w-[90px]
                px-5
                py-2.5
                rounded-lg
                bg-[#DC3155]
                text-white
                text-sm
                font-medium
                hover:bg-[#C92749]
                transition
                disabled:opacity-60
                flex
                items-center
                justify-center
                gap-2
              "
            >
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}

              {loading ? "Deleting..." : "Yes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}