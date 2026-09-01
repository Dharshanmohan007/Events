import React, { useState, useEffect } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import FacultyDahsboardHeader from './FacultyDahsboardHeader'
import FacultyAccommodationDetailsPanel from './FacultyAccommodationDetailsPanel'
import FacultyAudioDetailsPanel from './FacultyAudioDetailsPanel'
import FacultyEventDetailsSidePanel from './FacultyEventDetailsSidePanel'
import FacultyEventRequisitionDetailsPanel from './FacultyEventRequisitionDetailsPanel'
import FacultyFoodRefreshmentDetailsPanel from './FacultyFoodRefreshmentDetailsPanel'
import FacultyIctcsDetailsPanel from './FacultyIctcsDetailsPanel'
import FacultyMediaDetailsPanel from './FacultyMediaDetailsPanel'
import FacultyPurchaseDetailsPanel from './FacultyPurchaseDetailsPanel'
import FacultyStaticDetailsPanel from './FacultyStaticDetailsPanel'
import FacultyTransportationDetailsPanel from './FacultyTransportationDetailsPanel'
import FacultyVenueDetailsPanel from './FacultyVenueDetailsPanel'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const DEPARTMENT_TAB_MAP = {
  venue: { name: 'Venue Details', color: '#F20768' },
  icts: { name: 'ICTCS Details', color: '#48E0CF' },
  audio: { name: 'Audio Details', color: '#8B3DFF' },
  transport: { name: 'Transportation Details', color: '#8B3DFF' },
  refreshment: { name: 'Food Details', color: '#48E0CF' },
  accommodation: { name: 'Accommodation Details', color: '#48E0CF' },
  purchase: { name: 'Purchase Details', color: '#F20768' },
  media: { name: 'Media Details', color: '#F20768' },
  poster: { name: 'Media Details', color: '#F20768' },
  video: { name: 'Media Details', color: '#F20768' },
}

const getStatusClassName = (status) => {
  if (status === 'Completed') return 'bg-[#4A2BB7]/35 text-[#A78BFA]'
  if (status === 'Pending for Acknowledge') return 'bg-[#5D1438]/50 text-[#FF4F91]'
  if (status === 'Acknowledged') return 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-[#ffffff]/80'
  if (status === 'Admin Canceled') return 'bg-yellow-700 text-[#FF4F91]'
  return 'bg-[#0e5149]/55 text-[#20D18C]'
}

const FacultyEventsDetailViewPage = () => {
  const { eventId } = useParams()
  const [detailTabs, setDetailTabs] = useState([])
  const [activeTab, setActiveTab] = useState('')
  const [requestDetails, setRequestDetails] = useState(null)
  const [requisitionLoading, setRequisitionLoading] = useState(true)
  const [requisitionError, setRequisitionError] = useState('')
  const [venueDetails, setVenueDetails] = useState(null)
  const [venueLoading, setVenueLoading] = useState(false)
  const [venueError, setVenueError] = useState('')
  const [audioDetails, setAudioDetails] = useState(null)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioError, setAudioError] = useState('')
  const [transportDetails, setTransportDetails] = useState(null)
  const [transportLoading, setTransportLoading] = useState(false)
  const [transportError, setTransportError] = useState('')
  const [mediaDetails, setMediaDetails] = useState(null)
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaError, setMediaError] = useState('')
  const [refreshmentDetails, setRefreshmentDetails] = useState(null)
  const [refreshmentLoading, setRefreshmentLoading] = useState(false)
  const [refreshmentError, setRefreshmentError] = useState('')
  const [ictsDetails, setIctsDetails] = useState(null)
  const [ictsLoading, setIctsLoading] = useState(false)
  const [ictsError, setIctsError] = useState('')
  const [accommodationDetails, setAccommodationDetails] = useState(null)
  const [accommodationLoading, setAccommodationLoading] = useState(false)
  const [accommodationError, setAccommodationError] = useState('')
  const [purchaseDetails, setPurchaseDetails] = useState(null)
  const [data, setData] = useState([]);
  const [reloadKey, setReloadKey] = useState(0)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')
  const activeTabConfig = detailTabs.find((tab) => tab.name === activeTab)
  const [closeLoading, setCloseLoading] = useState(false)
  const navigate = useNavigate();



  useEffect(() => {
    const fetchRequisitionDetails = async () => {
      setRequisitionLoading(true)
      setRequisitionError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(
          `${API_BASE_URL}/api/events/${eventId}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        )
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch event requisition details')

        const eventData = payload.data || payload
        const details = eventData.requestDetails
        setData(eventData);
        // console.log("event tabs data : ", details)
        if (!details) throw new Error('Event requisition details are not available')

        setRequestDetails(details)
        const tabs = [{ name: 'Event Requisition Details', color: '#8B5CF6', status: eventData.status || 'Submitted' }]
        const requirements = details.requirementDetails || {}
        const seen = new Set()
        for (const [key, required] of Object.entries(requirements)) {
          const module = key.replace(/Required$/, '')
          const config = DEPARTMENT_TAB_MAP[module]
          if (required && config && !seen.has(config.name)) {
            seen.add(config.name)
            tabs.push({
              name: config.name,
              color: config.color,
              status: 'Pending for Acknowledge',
            })
          }
        }
        setDetailTabs(tabs)
        setActiveTab('Event Requisition Details')

        // Fetch all module statuses upfront
        fetchAllModuleStatuses(tabs)
      } catch (err) {
        console.error('Failed to fetch requisition details:', err)
        setRequestDetails(null)
        setDetailTabs([])
        setRequisitionError(err.message || 'Failed to fetch event requisition details')
      } finally {
        setRequisitionLoading(false)
      }
    }

    fetchRequisitionDetails()
  }, [eventId, reloadKey])

  // ── Fetch all module statuses upfront ──────────────────────────────
  const fetchAllModuleStatuses = async (tabs) => {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const moduleMap = {
        'Venue Details': 'venue',
        'ICTCS Details': 'icts',
        'Audio Details': 'audio',
        'Transportation Details': 'transport',
        'Food Details': 'refreshment',
        'Accommodation Details': 'accommodation',
        'Purchase Details': 'purchase',
        'Media Details': 'media',
      }

      const fetches = tabs
        .filter((tab) => moduleMap[tab.name])
        .map((tab) =>
          fetch(`${API_BASE_URL}/api/events/${eventId}?module=${moduleMap[tab.name]}`, { headers })
            .then((res) => res.json())
            .then((payload) => ({
              tabName: tab.name,
              status: payload.data?.[`${moduleMap[tab.name]}Details`]?.status?.status || null,
            }))
            .catch(() => ({ tabName: tab.name, status: null }))
        )

      const results = await Promise.all(fetches)

      setDetailTabs((prevTabs) =>
        prevTabs.map((tab) => {
          const result = results.find((r) => r.tabName === tab.name)
          return result?.status ? { ...tab, status: result.status } : tab
        })
      )
    } catch (err) {
      console.error('Failed to fetch module statuses:', err)
    }
  }

  useEffect(() => {
    if (activeTab !== 'Venue Details') return

    const fetchVenueDetails = async () => {
      setVenueLoading(true)
      setVenueError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}?module=venue`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch venue details')

        const eventData = payload.data || payload
        if (!eventData.venueDetails) throw new Error('Venue details are not available')
        setVenueDetails(eventData.venueDetails)

        const venueStatus = eventData.venueDetails.status?.status
        if (venueStatus) {
          setDetailTabs((tabs) => tabs.map((tab) => (
            tab.name === 'Venue Details' ? { ...tab, status: venueStatus } : tab
          )))
        }
      } catch (err) {
        console.error('Failed to fetch venue details:', err)
        setVenueDetails(null)
        setVenueError(err.message || 'Failed to fetch venue details')
      } finally {
        setVenueLoading(false)
      }
    }

    fetchVenueDetails()
  }, [activeTab, eventId])

  useEffect(() => {
    if (activeTab !== 'Audio Details') return

    const fetchAudioDetails = async () => {
      setAudioLoading(true)
      setAudioError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}?module=audio`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch audio details')

        const eventData = payload.data || payload
        if (!eventData.audioDetails) throw new Error('Audio details are not available')
        setAudioDetails(eventData.audioDetails)

        const audioStatus = eventData.audioDetails.status?.status
        if (audioStatus) {
          setDetailTabs((tabs) => tabs.map((tab) => (
            tab.name === 'Audio Details' ? { ...tab, status: audioStatus } : tab
          )))
        }
      } catch (err) {
        console.error('Failed to fetch audio details:', err)
        setAudioDetails(null)
        setAudioError(err.message || 'Failed to fetch audio details')
      } finally {
        setAudioLoading(false)
      }
    }

    fetchAudioDetails()
  }, [activeTab, eventId])

  useEffect(() => {
    if (activeTab !== 'Transportation Details') return

    const fetchTransportDetails = async () => {
      setTransportLoading(true)
      setTransportError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}?module=transport`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch transportation details')

        const eventData = payload.data || payload
        if (!eventData.transportDetails) throw new Error('Transportation details are not available')
        setTransportDetails(eventData.transportDetails)

        const transportStatus = eventData.transportDetails.status?.status
        if (transportStatus) {
          setDetailTabs((tabs) => tabs.map((tab) => (
            tab.name === 'Transportation Details' ? { ...tab, status: transportStatus } : tab
          )))
        }
      } catch (err) {
        console.error('Failed to fetch transportation details:', err)
        setTransportDetails(null)
        setTransportError(err.message || 'Failed to fetch transportation details')
      } finally {
        setTransportLoading(false)
      }
    }

    fetchTransportDetails()
  }, [activeTab, eventId])

  useEffect(() => {
    if (activeTab !== 'Media Details') return

    const fetchMediaDetails = async () => {
      setMediaLoading(true)
      setMediaError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}?module=media`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch media details')

        const eventData = payload.data || payload
        if (!eventData.mediaRequirementDetails) throw new Error('Media details are not available')
        setMediaDetails(eventData.mediaRequirementDetails)

        const mediaRequirements = eventData.mediaRequirementDetails.mediaRequirements || []
        const statuses = mediaRequirements.flatMap((requirement) => (
          (requirement.typeOfMedia || []).map((type) => requirement[type]?.status)
        )).filter(Boolean)
        if (statuses.length) {
          setDetailTabs((tabs) => tabs.map((tab) => (
            tab.name === 'Media Details' ? { ...tab, status: statuses[0] } : tab
          )))
        }
      } catch (err) {
        console.error('Failed to fetch media details:', err)
        setMediaDetails(null)
        setMediaError(err.message || 'Failed to fetch media details')
      } finally {
        setMediaLoading(false)
      }
    }

    fetchMediaDetails()
  }, [activeTab, eventId])

  useEffect(() => {
    if (activeTab !== 'Food Details') return

    const fetchRefreshmentDetails = async () => {
      setRefreshmentLoading(true)
      setRefreshmentError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}?module=refreshment`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch food details')

        const eventData = payload.data || payload
        if (!eventData.refreshmentDetails) throw new Error('Food details are not available')
        setRefreshmentDetails(eventData.refreshmentDetails)

        const foodStatus = eventData.refreshmentDetails.status?.status
        if (foodStatus) {
          setDetailTabs((tabs) => tabs.map((tab) => (
            tab.name === 'Food Details' ? { ...tab, status: foodStatus } : tab
          )))
        }
      } catch (err) {
        console.error('Failed to fetch food details:', err)
        setRefreshmentDetails(null)
        setRefreshmentError(err.message || 'Failed to fetch food details')
      } finally {
        setRefreshmentLoading(false)
      }
    }

    fetchRefreshmentDetails()
  }, [activeTab, eventId])

  useEffect(() => {
    if (activeTab !== 'ICTCS Details') return

    const fetchIctsDetails = async () => {
      setIctsLoading(true)
      setIctsError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}?module=icts`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch ICTS details')

        const eventData = payload.data || payload
        if (!eventData.ictsDetails) throw new Error('ICTS details are not available')
        setIctsDetails(eventData.ictsDetails)

        const ictsStatus = eventData.ictsDetails.status?.status
        if (ictsStatus) {
          setDetailTabs((tabs) => tabs.map((tab) => (
            tab.name === 'ICTCS Details' ? { ...tab, status: ictsStatus } : tab
          )))
        }
      } catch (err) {
        console.error('Failed to fetch ICTS details:', err)
        setIctsDetails(null)
        setIctsError(err.message || 'Failed to fetch ICTS details')
      } finally {
        setIctsLoading(false)
      }
    }

    fetchIctsDetails()
  }, [activeTab, eventId])

  useEffect(() => {
    if (activeTab !== 'Accommodation Details') return

    const fetchAccommodationDetails = async () => {
      setAccommodationLoading(true)
      setAccommodationError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}?module=accommodation`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch accommodation details')

        const eventData = payload.data || payload
        if (!eventData.accommodationDetails) throw new Error('Accommodation details are not available')
        setAccommodationDetails(eventData.accommodationDetails)

        const accommodationStatus = eventData.accommodationDetails.status?.status
        if (accommodationStatus) {
          setDetailTabs((tabs) => tabs.map((tab) => (
            tab.name === 'Accommodation Details' ? { ...tab, status: accommodationStatus } : tab
          )))
        }
      } catch (err) {
        console.error('Failed to fetch accommodation details:', err)
        setAccommodationDetails(null)
        setAccommodationError(err.message || 'Failed to fetch accommodation details')
      } finally {
        setAccommodationLoading(false)
      }
    }

    fetchAccommodationDetails()
  }, [activeTab, eventId])

  useEffect(() => {
    if (activeTab !== 'Purchase Details') return

    const fetchPurchaseDetails = async () => {
      setPurchaseLoading(true)
      setPurchaseError('')
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}?module=purchase`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        const payload = await res.json()
        if (!res.ok) throw new Error(payload.message || 'Failed to fetch purchase details')

        const eventData = payload.data || payload
        if (!eventData.purchaseDetails) throw new Error('Purchase details are not available')
        setPurchaseDetails(eventData.purchaseDetails)

        const purchaseStatus = eventData.purchaseDetails.status?.status
        if (purchaseStatus) {
          setDetailTabs((tabs) => tabs.map((tab) => (
            tab.name === 'Purchase Details' ? { ...tab, status: purchaseStatus } : tab
          )))
        }
      } catch (err) {
        console.error('Failed to fetch purchase details:', err)
        setPurchaseDetails(null)
        setPurchaseError(err.message || 'Failed to fetch purchase details')
      } finally {
        setPurchaseLoading(false)
      }
    }

    fetchPurchaseDetails()
  }, [activeTab, eventId])



  // const openFeedbackPage = async () => {
  //   // const newTab = window.open("", "_blank");

  //   try {
  //     const token = localStorage.getItem("token");

  //    const res =  await axios.patch(
  //       `${API_BASE_URL}/api/events/${eventId}/status`,
  //       { action: "close" },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     if (res.status === 200) {
  //       toast.success('Event closed successfully')
  //       setReloadKey((k) => k + 1)
  //       const newTab = window.open("", "_blank");

  //       if (newTab) {
  //         newTab.location.href = `/dashboard-faculty/feedback/${eventId}`;
  //       } else {
  //         console.error("Popup was blocked by the browser.");
  //       }
  //     }

  //   } catch (err) {
  //     console.error(err);
  //   }

  // }

  const openFeedbackPage = async () => {
    // try {
    //   setCloseLoading(true);
    //   const token = localStorage.getItem("token");

    //   const res = await axios.patch(
    //     `${API_BASE_URL}/api/events/${eventId}/status`,
    //     { action: "close" },
    //     {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //       },
    //     }
    //   );

    //   if (res.status === 200) {
    //     toast.success("Event closed successfully");
    //     setReloadKey((k) => k + 1);

    //     navigate(`/dashboard-faculty/events/detailView/${eventId}/documentUpload`);
    //   }
    //   setCloseLoading(false);
    // } catch (err) {
    //   setCloseLoading(false);
    //   console.error(err);
    // }
    navigate(`/dashboard-faculty/events/detailView/${eventId}/documentUpload`);
  };

  const renderActivePanel = () => {
    if (activeTab === 'Event Requisition Details') {
      return (
        <FacultyEventRequisitionDetailsPanel
          requestDetails={requestDetails}
        />
      )
    }

    if (activeTab === 'Venue Details') {
      return (
        <FacultyVenueDetailsPanel
          venueDetails={venueDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      )
    }

    if (activeTab === 'ICTCS Details') {
      return (
        <FacultyIctcsDetailsPanel
          ictsDetails={ictsDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
          allocationId={eventId}
        />
      )
    }

    if (activeTab === 'Audio Details') {
      return (
        <FacultyAudioDetailsPanel
          audioDetails={audioDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      )
    }

    if (activeTab === 'Transportation Details') {
      return (
        <FacultyTransportationDetailsPanel
          transportDetails={transportDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      )
    }

    if (activeTab === 'Food Details') {
      return (
        <FacultyFoodRefreshmentDetailsPanel
          refreshmentDetails={refreshmentDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      )
    }

    if (activeTab === 'Accommodation Details') {
      return (
        <FacultyAccommodationDetailsPanel
          accommodationDetails={accommodationDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      )
    }

    if (activeTab === 'Purchase Details') {
      return (
        <FacultyPurchaseDetailsPanel
          purchaseDetails={purchaseDetails}
          eventSchedule={requestDetails?.eventDetails?.eventSchedule}
        />
      )
    }

    if (activeTab === 'Media Details') {
      return <FacultyMediaDetailsPanel mediaDetails={mediaDetails} />
    }

    return <FacultyStaticDetailsPanel activeTab={activeTab} />
  }


  return (
    <>

      <FacultyDahsboardHeader />
      <section className="bg-[#0b1326] px-7 h-[93vh] pt-2  text-white poppins">
        <header className="flex  items-center justify-between gap-5 mt-4 ">
          <div className=''>
            <div className="flex items-center gap-2">
              <h1 className="text-md font-medium text-[#CBC3D7]/50">Event Details</h1>
              <ChevronRight size={16} className="text-white" />
              <h2 className="text-md font-medium text-[#D0BCFF]">{requestDetails?.eventDetails?.eventName}</h2>
              {requestDetails?.eventDetails?.organizingDepartment && (
                <div className="ml-3 bg-green-400/10 text-sm text-[#10B981] px-5 py-2 rounded-full">
                  <h1>{requestDetails.eventDetails.organizingDepartment}</h1>
                </div>
              )}
            </div>
          </div>
          {console.log("eve data : ", data)}
          {data?.isClosed ? (
            <div className="flex items-center gap-2 rounded-md bg-linear-to-r from-[#078B72] to-[#035546] px-6 py-2 text-white">
              <Check size={18} />
              Closed
            </div>
          ) : (
            data?.adminApproval === true &&
            (!data?.isDocumentsCompleted ||
              !data?.isExpenditureCompleted ||
              !data?.isFeedbackCompleted) && (
              <button
                type="button"
                onClick={openFeedbackPage}
                disabled={closeLoading}
                className="flex items-center gap-2 rounded-md cursor-pointer hover:bg-linear-to-l hover:from-[#0a755f] bg-linear-to-r from-[#078B72] to-[#035546] px-6 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              >
                {closeLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Closing...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Close
                  </>
                )}
              </button>
            )
          )}




          {/* <button
            type="button"
            onClick={openFeedbackPage}
            className="flex items-center gap-2 rounded-md cursor-pointer hover:bg-linear-to-l hover:from-[#0a755f] bg-linear-to-r from-[#078B72] to-[#035546] px-6 py-2 font- text-white transition-colors hover:bg-[#0a755f]"
          >
            <Check size={18} />
            Completed
          </button> */}
        </header>

        <section className="mt-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-6 font-medium text-[10px] text-[#CBC3D7]/65">
              {(() => {
                const counts = { acknowledged: 0, pending: 0, completed: 0 }
                detailTabs.forEach(t => {
                  if (t.status === 'Acknowledged') counts.acknowledged++
                  else if (t.status === 'Pending for Acknowledge') counts.pending++
                  else if (t.status === 'Completed') counts.completed++
                })
                return (
                  <>
                    <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#25A987]" />ACKNOWLEDGED ({counts.acknowledged})</span>
                    <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#B32058]" />PENDING ({counts.pending})</span>
                    <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#6D3BD8]" />COMPLETED ({counts.completed})</span>
                  </>
                )
              })()}
            </div>
          </div>
        </section>

        <section className="mt-3 flex  overflow-hidden gap-4">
          <FacultyEventDetailsSidePanel
            tabs={detailTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <main className="flex-1 overflow-auto rounded-lg border  border-[#27334c] max-h-[calc(100vh-170px)] overflow-auto bg-[#151d31] p-5 table-custom-scrollbar">
            {requisitionLoading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading event requisition details...</p>
            ) : requisitionError ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">{requisitionError}</p>
            ) : venueLoading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading venue details...</p>
            ) : venueError && activeTab === 'Venue Details' ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">{venueError}</p>
            ) : audioLoading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading audio details...</p>
            ) : audioError && activeTab === 'Audio Details' ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">{audioError}</p>
            ) : transportLoading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading transportation details...</p>
            ) : transportError && activeTab === 'Transportation Details' ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">{transportError}</p>
            ) : mediaLoading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading media details...</p>
            ) : mediaError && activeTab === 'Media Details' ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">{mediaError}</p>
            ) : refreshmentLoading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading food details...</p>
            ) : refreshmentError && activeTab === 'Food Details' ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">{refreshmentError}</p>
            ) : ictsLoading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading ICTS details...</p>
            ) : ictsError && activeTab === 'ICTCS Details' ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">{ictsError}</p>
            ) : accommodationLoading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading accommodation details...</p>
            ) : accommodationError && activeTab === 'Accommodation Details' ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">{accommodationError}</p>
            ) : purchaseLoading ? (
              <p className="py-10 text-center text-sm text-[#CBC3D7]/65">Loading purchase details...</p>
            ) : purchaseError && activeTab === 'Purchase Details' ? (
              <p className="py-10 text-center text-sm text-[#FF4F91]">{purchaseError}</p>
            ) : activeTabConfig && (
              <>
                <div className="flex items-start justify-between gap-4 ">
                  <div>
                    <h2 className="text-lg font-medium text-[#8B3DFF]">{activeTab}</h2>
                    <p className="mt-2 text-xs leading-6 text-[#CBC3D7]/55">
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry&apos;s standard dummy text ever since the 1500s
                    </p>
                  </div>
                  <span className={`rounded-full px-5 py-2 whitespace-nowrap text-sm font-medium ${getStatusClassName(activeTabConfig.status)}`}>
                    {activeTabConfig.status}
                  </span>
                </div>

                <div className="mt-8">{renderActivePanel()}</div>
              </>
            )}
          </main>
        </section>
      </section>
    </>
  )
}

export default FacultyEventsDetailViewPage
