import { API_BASE } from "../utils/apiConfig";

export async function fetchAvailableRooms(startDateTime, endDateTime) {
  const params = new URLSearchParams({ startDateTime, endDateTime });
  const response = await fetch(`${API_BASE}/api/accommodation/rooms/availability?${params}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Unable to load room availability.");
  }

  const rooms = Array.isArray(data)
    ? data
    : data.rooms || data.availableRooms || (Array.isArray(data.data) ? data.data : data.data?.rooms) || [];
  return rooms.map((room, index) => ({
    roomId: room.roomId || room._id || room.id || `room-${index}`,
    roomNumber: room.roomNumber || room.name || room.identifier || "",
    venue: room.venue || room.venueName || "",
    occupantCount: room.occupantCount ?? room.capacity ?? room.maxOccupants ?? 0,
    requiresAdminConfirmation: room.requiresAdminConfirmation === true,
    adminMessage: room.message || "This room was occupied immediately before the requested time. Please contact the admin team to confirm room availability.",
  }));
}