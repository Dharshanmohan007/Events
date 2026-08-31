import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

import { createRoom } from "../services/Admin/createRoomService";
import { updateRoom } from "../services/Admin/updateRoomService";

// Change this import path according to your project structure.
import CustomDropdown from "../Components/CustomSelect";

const initialFormData = {
  venue: "",
  roomNumber: "",
  capacity: "",
  isActive: true,
};

/*
 * IMPORTANT:
 *
 * CustomSelect is shared across the application and is NOT modified.
 *
 * The existing CustomSelect is receiving/rendering the option values
 * directly. Therefore, passing objects such as:
 *
 * {
 *   label: "Active",
 *   value: true
 * }
 *
 * causes:
 *
 * "Objects are not valid as a React child"
 *
 * Instead, AddRooms passes simple strings to CustomSelect and converts
 * the selected string back into the boolean required by the API.
 */
const statusOptions = ["Active", "Inactive"];

export default function AddRooms({
  selectedRoom,
  onClose,
  onSuccess,
  onError,
}) {
  const isEditMode = Boolean(selectedRoom);

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // Populate Form When Editing
  // --------------------------------------------------

  useEffect(() => {
    if (selectedRoom) {
      setFormData({
        venue: selectedRoom.venue || "",
        roomNumber: selectedRoom.roomNumber || "",
        capacity:
          selectedRoom.capacity !== undefined &&
          selectedRoom.capacity !== null
            ? String(selectedRoom.capacity)
            : "",
        isActive:
          selectedRoom.isActive !== undefined
            ? selectedRoom.isActive
            : true,
      });
    } else {
      setFormData(initialFormData);
    }

    setErrors({});
  }, [selectedRoom]);

  // --------------------------------------------------
  // Input Change
  // --------------------------------------------------

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // --------------------------------------------------
  // Status Change
  // --------------------------------------------------
  //
  // CustomDropdown returns:
  //
  // "Active"
  // or
  // "Inactive"
  //
  // Convert that value into the boolean expected by
  // the backend:
  //
  // "Active"   -> true
  // "Inactive" -> false
  //
  // --------------------------------------------------

  const handleStatusChange = (value) => {
    const isActive = value === "Active";

    setFormData((previous) => ({
      ...previous,
      isActive,
    }));

    setErrors((previous) => ({
      ...previous,
      isActive: "",
    }));
  };

  // --------------------------------------------------
  // Convert API boolean to CustomDropdown value
  // --------------------------------------------------
  //
  // The API stores:
  //
  // true  -> Active
  // false -> Inactive
  //
  // CustomDropdown receives:
  //
  // "Active"
  // "Inactive"
  //
  // --------------------------------------------------

  const selectedStatus = formData.isActive
    ? "Active"
    : "Inactive";

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    if (!formData.venue.trim()) {
      newErrors.venue = "Venue is required.";
    }

    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = "Room number is required.";
    }

    if (
      formData.capacity === "" ||
      formData.capacity === null ||
      formData.capacity === undefined
    ) {
      newErrors.capacity = "Capacity is required.";
    } else if (
      !Number.isInteger(Number(formData.capacity)) ||
      Number(formData.capacity) <= 0
    ) {
      newErrors.capacity =
        "Capacity must be a positive whole number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // --------------------------------------------------
  // Submit
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * isActive is already converted back to boolean in
     * handleStatusChange().
     *
     * Therefore the API receives exactly:
     *
     * isActive: true
     *
     * or:
     *
     * isActive: false
     */

    const payload = {
      venue: formData.venue.trim(),
      roomNumber: formData.roomNumber.trim(),
      capacity: Number(formData.capacity),
      isActive: Boolean(formData.isActive),
    };

    try {
      setLoading(true);

      if (isEditMode) {
        // UPDATE

        await updateRoom(selectedRoom._id, payload);

        onSuccess("Room details updated successfully.");
      } else {
        // CREATE

        await createRoom(payload);

        onSuccess("Room created successfully.");
      }
    } catch (error) {
      console.error("Room Submit Error:", error);

      const apiMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (isEditMode
          ? "Failed to update room."
          : "Failed to create room.");

      onError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Close Drawer
  // --------------------------------------------------

  const handleCancel = () => {
    if (loading) {
      return;
    }

    onClose();
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
          z-[998]
          bg-black/60
          backdrop-blur-[2px]
        "
        onClick={handleCancel}
      />

      {/* --------------------------------------------- */}
      {/* DRAWER */}
      {/* --------------------------------------------- */}

      <div
        className="
          fixed
          top-0
          right-0
          z-[999]
          h-screen
          w-full
          max-w-[470px]
          bg-[#0E1729]
          border-l
          border-[#263552]
          shadow-2xl
          flex
          flex-col
        "
      >
        {/* ------------------------------------------- */}
        {/* DRAWER HEADER */}
        {/* ------------------------------------------- */}

        <div
          className="
            flex
            items-center
            justify-between
            px-6
            py-5
            border-b
            border-[#263552]
          "
        >
          <div>
            <h2 className="text-white text-lg font-medium">
              {isEditMode ? "Edit Rooms" : "Add Rooms"}
            </h2>

            <p className="text-[#FFFFFF66] text-xs mt-1">
              {isEditMode
                ? "Update room details"
                : "Add a new room"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="
              text-[#FFFFFF99]
              hover:text-white
              transition
              disabled:opacity-50
            "
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ------------------------------------------- */}
        {/* FORM */}
        {/* ------------------------------------------- */}

        <form
          onSubmit={handleSubmit}
          className="
            flex
            flex-col
            flex-1
            overflow-hidden
          "
        >
          {/* ----------------------------------------- */}
          {/* FORM BODY */}
          {/* ----------------------------------------- */}

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* VENUE */}

            <div className="mb-5">
              <label
                htmlFor="venue"
                className="
                  block
                  text-sm
                  font-medium
                  text-white
                  mb-2
                "
              >
                Venue
                <span className="text-red-400 ml-1">*</span>
              </label>

              <input
                id="venue"
                name="venue"
                type="text"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="Enter venue"
                disabled={loading}
                className={`
                  w-full
                  h-11
                  px-4
                  rounded-lg
                  bg-[#182238]
                  border
                  ${
                    errors.venue
                      ? "border-red-500"
                      : "border-[#2A3958]"
                  }
                  text-white
                  text-sm
                  placeholder:text-[#FFFFFF40]
                  outline-none
                  focus:border-[#7C3AE7]
                  transition
                `}
              />

              {errors.venue && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.venue}
                </p>
              )}
            </div>

            {/* ROOM NUMBER */}

            <div className="mb-5">
              <label
                htmlFor="roomNumber"
                className="
                  block
                  text-sm
                  font-medium
                  text-white
                  mb-2
                "
              >
                Room Number
                <span className="text-red-400 ml-1">*</span>
              </label>

              <input
                id="roomNumber"
                name="roomNumber"
                type="text"
                value={formData.roomNumber}
                onChange={handleInputChange}
                placeholder="Enter room number"
                disabled={loading}
                className={`
                  w-full
                  h-11
                  px-4
                  rounded-lg
                  bg-[#182238]
                  border
                  ${
                    errors.roomNumber
                      ? "border-red-500"
                      : "border-[#2A3958]"
                  }
                  text-white
                  text-sm
                  placeholder:text-[#FFFFFF40]
                  outline-none
                  focus:border-[#7C3AE7]
                  transition
                `}
              />

              {errors.roomNumber && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.roomNumber}
                </p>
              )}
            </div>

            {/* CAPACITY */}

            <div className="mb-5">
              <label
                htmlFor="capacity"
                className="
                  block
                  text-sm
                  font-medium
                  text-white
                  mb-2
                "
              >
                Capacity
                <span className="text-red-400 ml-1">*</span>
              </label>

              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Enter capacity"
                disabled={loading}
                className={`
                  w-full
                  h-11
                  px-4
                  rounded-lg
                  bg-[#182238]
                  border
                  ${
                    errors.capacity
                      ? "border-red-500"
                      : "border-[#2A3958]"
                  }
                  text-white
                  text-sm
                  placeholder:text-[#FFFFFF40]
                  outline-none
                  focus:border-[#7C3AE7]
                  transition
                `}
              />

              {errors.capacity && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.capacity}
                </p>
              )}
            </div>

            {/* STATUS */}

            <div className="mb-5">
              <label
                className="
                  block
                  text-sm
                  font-medium
                  text-white
                  mb-2
                "
              >
                Status
                <span className="text-red-400 ml-1">*</span>
              </label>

              {/*
                IMPORTANT:

                Do NOT pass objects here.

                ❌ Before:

                [
                  {
                    label: "Active",
                    value: true
                  },
                  {
                    label: "Inactive",
                    value: false
                  }
                ]

                That caused the React error because the existing
                CustomSelect tries to render the option itself.

                ✅ Now:

                [
                  "Active",
                  "Inactive"
                ]

                CustomSelect remains completely untouched.
              */}

              <CustomDropdown
                options={statusOptions}
                value={selectedStatus}
                onChange={handleStatusChange}
                placeholder="Select status"
              />

              {errors.isActive && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.isActive}
                </p>
              )}
            </div>
          </div>

          {/* ----------------------------------------- */}
          {/* FOOTER */}
          {/* ----------------------------------------- */}

          <div
            className="
              px-6
              py-5
              border-t
              border-[#263552]
              bg-[#0C1526]
              flex
              items-center
              justify-end
              gap-3
            "
          >
            <button
              type="button"
              onClick={handleCancel}
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
                hover:text-white
                hover:bg-[#182238]
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                min-w-[100px]
                px-5
                py-2.5
                rounded-lg
                bg-gradient-to-r
                from-[#7C3AE7]
                to-[#4E2593]
                text-white
                text-sm
                font-medium
                hover:from-[#8A4EF0]
                hover:to-[#5A2FA8]
                transition
                disabled:opacity-60
                disabled:cursor-not-allowed
                flex
                items-center
                justify-center
                gap-2
              "
            >
              {loading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}

              {loading
                ? isEditMode
                  ? "Saving..."
                  : "Submitting..."
                : isEditMode
                ? "Save"
                : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}