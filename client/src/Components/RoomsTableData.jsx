import React from "react";
import {
  Pencil,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function RoomsTableData({
  rooms,
  loading,
  error,
  onEdit,
  onDelete,
  onRetry,
}) {
  return (
    <div
      className="
        w-full
        rounded-xl
        border
        border-[#263552]
        bg-[#111A2D]
        overflow-hidden
      "
    >
      {/* --------------------------------------------- */}
      {/* TABLE HEADER */}
      {/* --------------------------------------------- */}

      <div
        className="
          px-6
          py-5
          border-b
          border-[#263552]
          flex
          items-center
          justify-between
        "
      >
        <div>
          <h2 className="text-white text-base font-medium">
            Room List{" "}
            <span className="text-[#8B4CF5]">
              ({rooms?.length || 0})
            </span>
          </h2>

          <p className="text-[#FFFFFF66] text-xs mt-1">
            Manage all available rooms
          </p>
        </div>

        {/* <button
          type="button"
          onClick={onRetry}
          disabled={loading}
          className="
            flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            border
            border-[#2D3B5A]
            bg-[#182238]
            text-[#FFFFFF99]
            text-xs
            hover:text-white
            hover:border-[#7C3AE7]
            transition
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        >
          <RefreshCw
            className={`w-4 h-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button> */}
      </div>

      {/* --------------------------------------------- */}
      {/* TABLE CONTAINER */}
      {/* --------------------------------------------- */}

      <div className="table-custom-scrollbar overflow-x-auto max-h-[400px] overflow-y-auto">
  <table className="w-full min-w-[700px]">

    {/* ------------------------------------------- */}
    {/* TABLE HEAD */}
    {/* ------------------------------------------- */}

    <thead className="sticky top-0 z-10">
      <tr className="bg-[#182943]">

        <th
          className="
            px-5
            py-4
            text-left
            text-xs
            font-medium
            text-[#FFFFFF99]
            uppercase
            tracking-wide
          "
        >
          Venue
        </th>

        <th
          className="
            px-5
            py-4
            text-left
            text-xs
            font-medium
            text-[#FFFFFF99]
            uppercase
            tracking-wide
          "
        >
          Room Number
        </th>

        <th
          className="
            px-5
            py-4
            text-left
            text-xs
            font-medium
            text-[#FFFFFF99]
            uppercase
            tracking-wide
          "
        >
          Capacity
        </th>

        <th
          className="
            px-5
            py-4
            text-left
            text-xs
            font-medium
            text-[#FFFFFF99]
            uppercase
            tracking-wide
          "
        >
          Status
        </th>

        <th
          className="
            px-5
            py-4
            text-center
            text-xs
            font-medium
            text-[#FFFFFF99]
            uppercase
            tracking-wide
            w-[130px]
          "
        >
          Actions
        </th>

      </tr>
    </thead>

          {/* ------------------------------------------- */}
          {/* TABLE BODY */}
          {/* ------------------------------------------- */}

          <tbody>
            {/* LOADING */}
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-7 h-7 text-[#7C3AE7] animate-spin" />

                    <p className="text-[#FFFFFF80] text-sm">
                      Loading rooms...
                    </p>
                  </div>
                </td>
              </tr>
            ) : error ? (
              /* ERROR */
              <tr>
                <td
                  colSpan="5"
                  className="py-16 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-red-400 text-sm">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={onRetry}
                      className="
                        px-4
                        py-2
                        rounded-lg
                        bg-[#7C3AE7]
                        text-white
                        text-sm
                        hover:bg-[#6D2ED2]
                        transition
                      "
                    >
                      Try Again
                    </button>
                  </div>
                </td>
              </tr>
            ) : rooms?.length === 0 ? (
              /* EMPTY */
              <tr>
                <td
                  colSpan="5"
                  className="py-16 text-center"
                >
                  <p className="text-[#FFFFFF66] text-sm">
                    No rooms found.
                  </p>
                </td>
              </tr>
            ) : (
              /* DATA */
              rooms.map((room) => (
                <tr
                  key={room._id}
                  className="
                    border-t
                    border-[#263552]
                    hover:bg-[#17233A]
                    transition-colors
                  "
                >
                  {/* VENUE */}
                  <td
                    className="
                      px-5
                      py-4
                      text-sm
                      text-white
                      font-medium
                    "
                  >
                    {room.venue || "-"}
                  </td>

                  {/* ROOM NUMBER */}
                  <td
                    className="
                      px-5
                      py-4
                      text-sm
                      text-[#FFFFFFB3]
                    "
                  >
                    {room.roomNumber || "-"}
                  </td>

                  {/* CAPACITY */}
                  <td
                    className="
                      px-5
                      py-4
                      text-sm
                      text-[#FFFFFFB3]
                    "
                  >
                    {room.capacity ?? "-"}
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-4">
                    {room.isActive ? (
                      <span
                        className="
                          inline-flex
                          items-center
                          px-3
                          py-1
                          rounded-full
                          bg-green-500/10
                          border
                          border-green-500/20
                          text-green-400
                          text-xs
                          font-medium
                        "
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        className="
                          inline-flex
                          items-center
                          px-3
                          py-1
                          rounded-full
                          bg-red-500/10
                          border
                          border-red-500/20
                          text-red-400
                          text-xs
                          font-medium
                        "
                      >
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() => onEdit(room)}
                        title="Edit Room"
                        className="
                          w-9
                          h-9
                          flex
                          items-center
                          justify-center
                          rounded-lg
                          bg-[#1A2940]
                          text-[#00D4A8]
                          hover:bg-[#203A45]
                          transition
                        "
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => onDelete(room)}
                        title="Delete Room"
                        className="
                          w-9
                          h-9
                          flex
                          items-center
                          justify-center
                          rounded-lg
                          bg-[#291E2D]
                          text-[#FF3B6B]
                          hover:bg-[#3A202D]
                          transition
                        "
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}