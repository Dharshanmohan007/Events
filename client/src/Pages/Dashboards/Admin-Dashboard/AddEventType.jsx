import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X,Search  } from 'lucide-react';
import {
  getEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} from "../../../services/events/eventTypesService";

export default function AddEventType({
  isOpen,
  onClose,
  onDataChanged,
}) {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editEventName, setEditEventName] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [deleteModalId, setDeleteModalId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchEventTypes();
      // Reset states when opened
      setIsAdding(false);
      setNewEventName('');
      setEditingId(null);
      setDeleteModalId(null);
      setSearchQuery('');
    }
  }, [isOpen]);

  const fetchEventTypes = async () => {
    try {
      setLoading(true);
      const res = await getEventTypes();
      // Adjust based on actual API response structure
      const data = res?.data || res || [];
      setEventTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch event types:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
  if (!newEventName.trim()) return;

  try {
    setLoading(true);

    await createEventType({
      eventType: newEventName.trim(),
      documents: [],
    });

    setIsAdding(false);
    setNewEventName("");

    await fetchEventTypes();

    // Refresh ViewEventDocumentMapping automatically
    onDataChanged?.();
  } catch (error) {
    console.error(
      "Failed to create event type:",
      error
    );
  } finally {
    setLoading(false);
  }
};

  const handleUpdate = async (id) => {
  if (!editEventName.trim()) return;

  try {
    setLoading(true);

    const original = eventTypes.find(
      (eventType) =>
        eventType._id === id ||
        eventType.id === id
    );

    await updateEventType(id, {
      eventType: editEventName.trim(),
      documents: original?.documents || [],
    });

    setEditingId(null);
    setEditEventName("");

    await fetchEventTypes();

    // Refresh ViewEventDocumentMapping automatically
    onDataChanged?.();
  } catch (error) {
    console.error(
      "Failed to update event type:",
      error
    );
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async () => {
  if (!deleteModalId) return;

  try {
    setLoading(true);

    await deleteEventType(deleteModalId);

    setDeleteModalId(null);

    await fetchEventTypes();

    // Refresh ViewEventDocumentMapping automatically
    onDataChanged?.();
  } catch (error) {
    console.error(
      "Failed to delete event type:",
      error
    );
  } finally {
    setLoading(false);
  }
};

  const getEventTypeName = (id) => {
    const item = eventTypes.find(et => et._id === id || et.id === id);
    return item?.eventType || "Event Type";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Off-canvas panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#16162A] shadow-xl transform transition-transform duration-300 flex flex-col border-l border-[#3A3A5A]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A3A5A]">
          <h2 className="text-xl font-semibold text-white">Event Type List</h2>
          <div className="flex items-center gap-3">
            <button
                onClick={() => {
                    setIsAdding(true);
                    setNewEventName("");
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#6730C0] hover:bg-[#5A29A8] transition-colors"
                title="Add Event Type"
                >
                <Plus size={18} className="text-white" />
            </button>
            {/* <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button> */}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 pt-6 pb-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search event types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full
                h-11
                pl-11
                pr-4
                rounded-lg
                border border-[#3A3A5A]
                bg-[#1E1E2F]
                text-white
                placeholder:text-gray-500
                text-sm
                outline-none
                focus:border-[#6730C0]
                focus:ring-1
                focus:ring-[#6730C0]
                transition-all
              "
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar relative">
          
          {loading && eventTypes.length === 0 && (
            <div className="text-center text-gray-400 py-4">Loading...</div>
          )}

          {/* Add Row */}
          {isAdding && (
            <div className="flex items-center justify-between bg-transparent border border-purple-500 rounded-lg p-3 w-full">
              <input 
                type="text"
                autoFocus
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="Enter event type name..."
                className="bg-transparent text-white text-sm outline-none flex-1 placeholder-gray-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setIsAdding(false);
                }}
              />
              <button 
                onClick={handleCreate}
                disabled={loading || !newEventName.trim()}
                className="text-purple-400 hover:text-purple-300 p-1 disabled:opacity-50"
              >
                <Check size={18} />
              </button>
            </div>
          )}

          {/* Event Types List */}
          {eventTypes
            .filter((et) => et.eventType.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((et) => {
            const id = et._id || et.id;
            const isEditing = editingId === id;

            return (
              <div key={id} className="flex items-center justify-between bg-transparent border border-[#3A3A5A] rounded-lg p-3 w-full group hover:border-gray-500 transition-colors">
                
                {isEditing ? (
                  <input 
                    type="text"
                    autoFocus
                    value={editEventName}
                    onChange={(e) => setEditEventName(e.target.value)}
                    className="bg-transparent text-white text-sm outline-none flex-1 placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                ) : (
                  <span className="text-gray-200 text-sm">{et.eventType}</span>
                )}

                <div className="flex items-center gap-2 ml-3">
                  {isEditing ? (
                    <button 
                      onClick={() => handleUpdate(id)}
                      disabled={loading || !editEventName.trim()}
                      className="text-green-400 hover:text-green-300 p-1 disabled:opacity-50"
                    >
                      <Check size={18} />
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setEditingId(id);
                          setEditEventName(et.eventType);
                        }}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteModalId(id)}
                        className="text-gray-400 hover:text-red-400 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Delete Confirmation Modal (Inline) */}
          {deleteModalId && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
              {/* Blur backdrop for modal within drawer */}
              <div className="absolute inset-0 bg-[#16162A]/80 backdrop-blur-sm" onClick={() => setDeleteModalId(null)} />
              
              <div className="bg-[#1E1E2F] border border-[#3A3A5A] rounded-lg p-5 shadow-2xl relative z-20 w-full max-w-sm text-center">
                <p className="text-white mb-6 text-sm">
                  Are you sure want to delete the event type <strong>{getEventTypeName(deleteModalId)}</strong>?
                </p>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => setDeleteModalId(null)}
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-500 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
