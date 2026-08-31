import React, { useEffect, useState } from "react";
import { Plus, XCircle, CheckCircle } from "lucide-react";

import RoomsTableData from "../../../Components/RoomsTableData";
import AddRooms from "../../../Components/AddRooms";
import DeleteRoomModal from "../../../Components/DeleteRoomModal";

import { getRooms } from "../../../services/Admin/getRoomsService";

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);

  const [showDrawer, setShowDrawer] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // --------------------------------------------------
  // Fetch Rooms
  // --------------------------------------------------

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getRooms();

      if (response?.success) {
        setRooms(response.data || []);
      } else {
        setRooms([]);
        setError(response?.message || "Failed to fetch rooms.");
      }
    } catch (error) {
      console.error("Fetch Rooms Error:", error);

      setRooms([]);

      setError(
        error.response?.data?.message ||
          "Unable to fetch room details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Initial API Call
  // --------------------------------------------------

  useEffect(() => {
    fetchRooms();
  }, []);

  // --------------------------------------------------
  // Open Add Drawer
  // --------------------------------------------------

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setErrorMessage("");
    setSuccessMessage("");
    setShowDrawer(true);
  };

  // --------------------------------------------------
  // Open Edit Drawer
  // --------------------------------------------------

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setErrorMessage("");
    setSuccessMessage("");
    setShowDrawer(true);
  };

  // --------------------------------------------------
  // Open Delete Modal
  // --------------------------------------------------

  const handleDeleteRoom = (room) => {
    setSelectedRoom(room);
    setShowDeleteModal(true);
  };

  // --------------------------------------------------
  // Close Drawer
  // --------------------------------------------------

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setSelectedRoom(null);
  };

  // --------------------------------------------------
  // Close Delete Modal
  // --------------------------------------------------

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedRoom(null);
  };

  // --------------------------------------------------
  // After Create / Update
  // --------------------------------------------------

  const handleRoomSuccess = async (message) => {
    setShowDrawer(false);
    setSelectedRoom(null);

    await fetchRooms();

    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // --------------------------------------------------
  // Error from Add/Edit
  // --------------------------------------------------

  const handleRoomError = (message) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  };

  // --------------------------------------------------
  // Delete Success
  // --------------------------------------------------

  const handleDeleteSuccess = async (message) => {
    setShowDeleteModal(false);
    setSelectedRoom(null);

    await fetchRooms();

    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // --------------------------------------------------
  // Delete Error
  // --------------------------------------------------

  const handleDeleteError = (message) => {
    setErrorMessage(message);

    setTimeout(() => {
      setErrorMessage("");
    }, 4000);
  };

  return (
    <div className="min-h-full text-white">
      {/* --------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* --------------------------------------------- */}

      <div className="mt-2 flex items-center justify-between p-5">
        <div>
          <h1 className="text-white text-lg font-medium">
            Room Management
          </h1>

          <p className="text-[#FFFFFF80] text-sm mt-1">
            View, manage, and organize all room details, availability,
            and booking information easily.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRoom}
          className="
            flex items-center gap-2
            cursor-pointer
            px-4 py-2.5
            rounded-lg
            text-white
            text-sm
            font-medium
            bg-gradient-to-r
            from-[#7C3AE7]
            to-[#4E2593]
            hover:from-[#8A4EF0]
            hover:to-[#5A2FA8]
            transition-all
            duration-200
            shadow-lg
            shadow-purple-900/20
          "
        >
          <Plus className="w-4 h-4" />
          Add Rooms
        </button>
      </div>

      {/* --------------------------------------------- */}
      {/* SUCCESS MESSAGE */}
      {/* --------------------------------------------- */}

      {successMessage && (
        <div
          className="
            mt-4
            flex items-center gap-3
            px-4 py-3
            rounded-lg
            border
            border-green-500/20
            bg-green-500/10
            text-green-400
            text-sm
          "
        >
          <CheckCircle className="w-5 h-5" />

          <span>{successMessage}</span>
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* ERROR MESSAGE */}
      {/* --------------------------------------------- */}

      {errorMessage && (
        <div
          className="
            mt-4
            flex items-center gap-3
            px-4 py-3
            rounded-lg
            border
            border-red-500/20
            bg-red-500/10
            text-red-400
            text-sm
          "
        >
          <XCircle className="w-5 h-5" />

          <span>{errorMessage}</span>
        </div>
      )}

      {/* --------------------------------------------- */}
      {/* TABLE */}
      {/* --------------------------------------------- */}

      <div className="p-5">
        <RoomsTableData
          rooms={rooms}
          loading={loading}
          error={error}
          onEdit={handleEditRoom}
          onDelete={handleDeleteRoom}
          onRetry={fetchRooms}
        />
      </div>

      {/* --------------------------------------------- */}
      {/* ADD / EDIT DRAWER */}
      {/* --------------------------------------------- */}

      {showDrawer && (
        <AddRooms
          selectedRoom={selectedRoom}
          onClose={handleCloseDrawer}
          onSuccess={handleRoomSuccess}
          onError={handleRoomError}
        />
      )}

      {/* --------------------------------------------- */}
      {/* DELETE MODAL */}
      {/* --------------------------------------------- */}

      {showDeleteModal && selectedRoom && (
        <DeleteRoomModal
          room={selectedRoom}
          onClose={handleCloseDeleteModal}
          onSuccess={handleDeleteSuccess}
          onError={handleDeleteError}
        />
      )}
    </div>
  );
}