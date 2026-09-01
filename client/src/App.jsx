import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import EventsForm from './Pages/EventsForm'
import ICTCSDashboard from './Pages/Dashboards/ICTC-Dashboard/ICTCSDashboard'
import AUDIODashboard from './Pages/Dashboards/AUDIO-Dashboard/AUDIODashboard'
import AudioEventsDetailViewPage from './Pages/Dashboards/AUDIO-Dashboard/AudioEventsDetailViewPage'
import AudioReportsPage from './Pages/Dashboards/AUDIO-Dashboard/AudioReportsPage'
import Login from './Pages/Login.jsx'
import Login1 from './Pages/Login1.jsx'
import Events from './Pages/Dashboards/ICTC-Dashboard/Events'
import Reports from './Pages/Dashboards/ICTC-Dashboard/Reports'
import IctcEventDetailsPage from './Pages/Dashboards/ICTC-Dashboard/IctcEventDetailsPage'
import IctcsEventsDetailViewPage from './Pages/Dashboards/ICTC-Dashboard/IctcsEventsDetailViewPage'
import TransportsDashboard from './Pages/Dashboards/Transports-Dashboard/TransportsDashboard'
import TransportsReportsPage from './Pages/Dashboards/Transports-Dashboard/TransportsReportsPage'
import TransportEventsDetailViewPage from './Pages/Dashboards/Transports-Dashboard/TransportEventsDetailViewPage'
import TransportIndividualDetailViewPage from './Pages/Dashboards/Transports-Dashboard/TransportIndividualDetailViewPage'
import MediaDashboard from './Pages/Dashboards/Media-Dashboard/MediaDashboard'
import MediaEventsDetailViewPage from './Pages/Dashboards/Media-Dashboard/MediaEventsDetailViewPage'
import MediaIndividualDetailViewPage from './Pages/Dashboards/Media-Dashboard/MediaIndividualDetailViewPage'
import MediaReportsPage from './Pages/Dashboards/Media-Dashboard/MediaReportsPage'
import PosterDashboard from './Pages/Dashboards/Media-Dashboard/PosterDashboard'
import PosterRequestListPage from './Pages/Dashboards/Media-Dashboard/PosterRequestListPage'
import PosterReportsPage from './Pages/Dashboards/Media-Dashboard/PosterReportsPage'
import PosterFeedbackPage from './Pages/Dashboards/Media-Dashboard/PosterFeedbackPage'
import PosterDetailView from './Pages/Dashboards/Media-Dashboard/PosterDetailView'
import PosterIndividualDetailViewPage from './Pages/Dashboards/Media-Dashboard/PosterIndividualDetailViewPage'
import VideoDashboard from './Pages/Dashboards/Media-Dashboard/VideoDashboard'
import VideoRequestListPage from './Pages/Dashboards/Media-Dashboard/VideoRequestListPage'
import VideoDetailView from './Pages/Dashboards/Media-Dashboard/VideoDetailView'
import VideoIndividualDetailViewPage from './Pages/Dashboards/Media-Dashboard/VideoIndividualDetailViewPage'
import VideoReportsPage from './Pages/Dashboards/Media-Dashboard/VideoReportsPage'
import AdminDashboard from './Pages/Dashboards/Admin-Dashboard/AdminDashboard'
import AdminEventsListPage from './Pages/Dashboards/Admin-Dashboard/AdminEventsListPage'
import AdminDashboardLayout from './Pages/Dashboards/Admin-Dashboard/AdminDashboardLayout'
import VenueManagementPage from './Pages/Dashboards/Admin-Dashboard/VenueManagementPage'
import AdminManagementPage from './Pages/Dashboards/Admin-Dashboard/AdminManagementPage'
import FacultyManagementPage from './Pages/Dashboards/Admin-Dashboard/FacultyManagementPage'
import AdminReportsPage from './Pages/Dashboards/Admin-Dashboard/AdminReportsPage'
import HodDashboard from './Pages/Dashboards/Hod-Dashboard/HodDashboard'
import HodEventsListPage from './Pages/Dashboards/Hod-Dashboard/HodEventsListPage'
import HodDashboardLayout from './Pages/Dashboards/Hod-Dashboard/HodDashboardLayout'
import HodReportsPage from './Pages/Dashboards/Hod-Dashboard/HodReportsPage'
import HodEventDetailsPage from './Pages/Dashboards/Hod-Dashboard/HodEventDetailsPage'
import HodIndividualEventDetailPage from './Pages/Dashboards/Hod-Dashboard/HodIndividualEventDetailPage'
import AccommodationDashboard from './Pages/Dashboards/Accommodation-Dashboard/AccommodationDashboard'
import AccommodationEventsDetailViewPage from './Pages/Dashboards/Accommodation-Dashboard/AccommodationEventsDetailViewPage'
import AccommodationReportsPage from './Pages/Dashboards/Accommodation-Dashboard/AccommodationReportsPage'
import FoodDashboard from './Pages/Dashboards/Food-Dashboard/FoodDashboard'
import FoodEventsDetailViewPage from './Pages/Dashboards/Food-Dashboard/FoodEventsDetailViewPage'
import FoodIndividualDetailViewPage from './Pages/Dashboards/Food-Dashboard/FoodIndividualDetailViewPage'
import FoodReportsPage from './Pages/Dashboards/Food-Dashboard/FoodReportsPage'
import PurchaseDashboard from './Pages/Dashboards/Purchase-Dashboard/PurchaseDashboard'
import PurchaseEventsDetailViewPage from './Pages/Dashboards/Purchase-Dashboard/PurchaseEventsDetailViewPage'
import PurchaseReportsPage from './Pages/Dashboards/Purchase-Dashboard/PurchaseReportsPage'
import PurchaseIndividualDetailViewPage from './Pages/Dashboards/Purchase-Dashboard/PurchaseIndividualDetailViewPage'
import VenueDashboard from './Pages/Dashboards/Venue-Dashboard/VenueDashboard'
import VenueEventsDetailViewPage from './Pages/Dashboards/Venue-Dashboard/VenueEventsDetailViewPage'
import VenueReportsPage from './Pages/Dashboards/Venue-Dashboard/VenueReportsPage'
import ForgetPassword from './Components/ForgetPassword'
import EventDetailsPage from "./Pages/Dashboards/Admin-Dashboard/EventDetailsPage"
import IndividualEventDetailPage from "./Pages/Dashboards/Admin-Dashboard/IndividualEventDetailPage"
import FacultyDashboard from "./Pages/Dashboards/Faculty-Dashboard/FacultyDashboard"
import FacultyVenueListPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyVenueListPage"
import FacultyfeedbackPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyfeedbackPage"
import FacultyEventsListPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyEventsListPage"
import FacultyEventsDetailViewPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyEventsDetailViewPage"
import FacultyIndividualRequestDetailViewPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyIndividualRequestDetailViewPage"
import FacultyIndividualFeedbackPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyIndividualFeedbackPage"
import TransportDetailsPage from "./Pages/IndividualForm/TransportDetailsPage";
import MediaDetailsPage from "./Pages/IndividualForm/MediaDetailsPage";
import IndividualFoodAndRefreshmentPage from "./Pages/IndividualForm/IndividualFoodAndRefreshmentPage";
import PurchaseDetails from "./Pages/IndividualForm/PurchaseDetails";

// Module request list pages (Event / Individual two-tab)
import AudioEventsListPage from "./Pages/Dashboards/AUDIO-Dashboard/AudioEventsListPage"
import TransportEventsListPage from "./Pages/Dashboards/Transports-Dashboard/TransportEventsListPage"
import VenueRequestListPage from "./Pages/Dashboards/Venue-Dashboard/VenueRequestListPage"
import PurchaseEventsListPage from "./Pages/Dashboards/Purchase-Dashboard/PurchaseEventsListPage"
import FoodEventsListPage from "./Pages/Dashboards/Food-Dashboard/FoodEventsListPage"
import AccommodationRequestListPage from "./Pages/Dashboards/Accommodation-Dashboard/AccommodationRequestListPage"
import MediaEventsListPage from "./Pages/Dashboards/Media-Dashboard/MediaEventsListPage"

import Calendar from "./Pages/Calendar/Calendar.jsx";
import { AuthProvider, useAuth } from "./Components/AuthContext";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import FacultyReportsPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyReportsPage";
import RoomManagement from "./Pages/Dashboards/Admin-Dashboard/RoomManagement.jsx";
import EventTypeManagement from './Pages/Dashboards/Admin-Dashboard/EventTypeManagement.jsx'
// import AdminOtherManagementPage from "./Pages/Dashboards/Admin-Dashboard/AdminOtherManagementPage";

// ─── "/" always shows Login — even if token exists in localStorage ────────────
// Navigation after login is handled by Login.jsx itself via navigate()
function PublicRoute({ children }) {
  return children;
}


function AppRoutes() {
  return (
    <Routes>
      {/* ── Always show login at "/" ── */}
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/forget-password" element={<ForgetPassword />} />

      {/* ── Protected routes (just need to be logged in) ── */}
      <Route path="/forms" element={<ProtectedRoute><EventsForm /></ProtectedRoute>} />
      <Route path="/forms/:draftId" element={<ProtectedRoute><EventsForm /></ProtectedRoute>} />
      <Route path="/forms/edit/:id" element={<ProtectedRoute><EventsForm /></ProtectedRoute>} />

      <Route path="/dashboard-ictcs" element={<ProtectedRoute><ICTCSDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-ictcs/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/dashboard-ictcs/events/:eventId" element={<ProtectedRoute><IctcEventDetailsPage /></ProtectedRoute>} />
      <Route path="/dashboard-ictcs/events/detailView/:eventId" element={<ProtectedRoute><IctcsEventsDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-ictcs/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

      <Route path="/dashboard-audio" element={<ProtectedRoute><AUDIODashboard /></ProtectedRoute>} />
      <Route path="/dashboard-audio/events" element={<ProtectedRoute><AudioEventsListPage /></ProtectedRoute>} />
      <Route path="/dashboard-audio/events/detailView/:eventId" element={<ProtectedRoute><AudioEventsDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-audio/reports" element={<ProtectedRoute><AudioReportsPage /></ProtectedRoute>} />

      <Route path="/dashboard-transports" element={<ProtectedRoute><TransportsDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-transports/events" element={<ProtectedRoute><TransportEventsListPage /></ProtectedRoute>} />
      <Route path="/dashboard-transports/events/detailView/:eventId" element={<ProtectedRoute><TransportEventsDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-transports/events/individualDetailView/:id" element={<ProtectedRoute><TransportIndividualDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-transports/reports" element={<ProtectedRoute><TransportsReportsPage /></ProtectedRoute>} />

      <Route path="/dashboard-media" element={<ProtectedRoute><MediaDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-media/events" element={<ProtectedRoute><MediaEventsListPage /></ProtectedRoute>} />
      <Route path="/dashboard-media/events/detailView/:eventId" element={<ProtectedRoute><MediaEventsDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-media/individualDetailView/:id" element={<ProtectedRoute><MediaIndividualDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-media/reports" element={<ProtectedRoute><MediaReportsPage /></ProtectedRoute>} />
      <Route path="/dashboard-poster" element={<ProtectedRoute><PosterDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-poster/requests" element={<ProtectedRoute><PosterRequestListPage /></ProtectedRoute>} />
      <Route path="/dashboard-poster/reports" element={<ProtectedRoute><PosterReportsPage /></ProtectedRoute>} />
      <Route path="/dashboard-poster/feedback" element={<ProtectedRoute><PosterFeedbackPage /></ProtectedRoute>} />
      <Route path="/dashboard-poster/detailView/:posterId" element={<ProtectedRoute><PosterDetailView /></ProtectedRoute>} />
      <Route path="/dashboard-poster/individualDetailView/:id" element={<ProtectedRoute><PosterIndividualDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-video" element={<ProtectedRoute><VideoDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-video/reports" element={<ProtectedRoute><VideoReportsPage /></ProtectedRoute>} />
      <Route path="/dashboard-video/requests" element={<ProtectedRoute><VideoRequestListPage /></ProtectedRoute>} />
      <Route path="/dashboard-video/detailView/:videoId" element={<ProtectedRoute><VideoDetailView /></ProtectedRoute>} />
      <Route path="/dashboard-video/individualDetailView/:id" element={<ProtectedRoute><VideoIndividualDetailViewPage /></ProtectedRoute>} />

      <Route path="/dashboard-admin" element={<ProtectedRoute><AdminDashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="AdminEventsRequests" element={<AdminEventsListPage />} />
        <Route path="VenueManagement" element={<VenueManagementPage />} />
        <Route path="RoomManagement" element={<RoomManagement/>}/>
        <Route path="EventTypeManagement" element={<EventTypeManagement/>}/>
        <Route path="AdminManagement" element={<AdminManagementPage />} />
        <Route path="FacultyManagement" element={<FacultyManagementPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        {/* <Route path="other-managements" element={<AdminOtherManagementPage />} /> */}
        <Route path="AdminEventsRequests/:eventId" element={<EventDetailsPage />} />

      </Route>

      <Route path="/dashboard-hod" element={<ProtectedRoute><HodDashboardLayout /></ProtectedRoute>}>
        <Route index element={<HodDashboard />} />
        <Route path="AdminEventsRequests" element={<HodEventsListPage />} />
        <Route path="reports" element={<HodReportsPage />} />
        <Route path="AdminEventsRequests/:eventId" element={<HodEventDetailsPage />} />
        <Route path="individual-submissions/:id" element={<HodIndividualEventDetailPage />} />
      </Route>

      <Route path="/dashboard/IndividualEvents/:id" element={<ProtectedRoute><IndividualEventDetailPage /></ProtectedRoute>} />

       <Route path="/transports" element={<TransportDetailsPage />} />
      <Route path="/transports/edit/:id" element={<TransportDetailsPage />} />
      <Route path="/individual-transport/edit/:id" element={<TransportDetailsPage />} />

      <Route path="/media" element={<MediaDetailsPage />} />
      <Route path="/media/edit/:id" element={<MediaDetailsPage />} />
      <Route path="/individual-media/edit/:id" element={<MediaDetailsPage />} />

      <Route path="/IndividualFoodAndRefreshment" element={<IndividualFoodAndRefreshmentPage />} />
      <Route path="/IndividualFoodAndRefreshment/edit/:id" element={<IndividualFoodAndRefreshmentPage />} />
      <Route path="/individual-food/edit/:id" element={<IndividualFoodAndRefreshmentPage />} />

      <Route path="/purchase" element={<PurchaseDetails />} />
      <Route path="/purchase/edit/:id" element={<PurchaseDetails />} />
      <Route path="/individual-purchase/edit/:id" element={<PurchaseDetails />} />

      <Route path="/dashboard-faculty" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-faculty/events" element={<ProtectedRoute><FacultyEventsListPage /></ProtectedRoute>} />
      <Route path="/dashboard-faculty/events/detailView/:eventId" element={<ProtectedRoute><FacultyEventsDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-faculty/individual-requests/:id" element={<ProtectedRoute><FacultyIndividualRequestDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-faculty/venues" element={<ProtectedRoute><FacultyVenueListPage /></ProtectedRoute>} />
      <Route path="/dashboard-faculty/feedback/:eventId" element={<ProtectedRoute><FacultyfeedbackPage /></ProtectedRoute>} />
      <Route path="/dashboard-faculty/individual-feedback/:requestId" element={<ProtectedRoute><FacultyIndividualFeedbackPage /></ProtectedRoute>} />

      <Route path="/dashboard-faculty/reports" element={<ProtectedRoute><FacultyReportsPage /></ProtectedRoute>} />


      <Route path="/dashboard-accommodation" element={<ProtectedRoute><AccommodationDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-accommodation/requests" element={<ProtectedRoute><AccommodationRequestListPage /></ProtectedRoute>} />
      <Route path="/dashboard-accommodation/events/detailView/:eventId" element={<ProtectedRoute><AccommodationEventsDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-accommodation/reports" element={<ProtectedRoute><AccommodationReportsPage /></ProtectedRoute>} />

      <Route path="/dashboard-venue" element={<ProtectedRoute><VenueDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-venue/requests" element={<ProtectedRoute><VenueRequestListPage /></ProtectedRoute>} />
      <Route path="/dashboard-venue/events/detailView/:eventId" element={<ProtectedRoute><VenueEventsDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-venue/reports" element={<ProtectedRoute><VenueReportsPage /></ProtectedRoute>} />

      <Route path="/dashboard-food" element={<ProtectedRoute><FoodDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-food/events" element={<ProtectedRoute><FoodEventsListPage /></ProtectedRoute>} />
      <Route path="/dashboard-food/events/detailView/:eventId" element={<ProtectedRoute><FoodEventsDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-food/events/individualDetailView/:id" element={<ProtectedRoute><FoodIndividualDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-food/reports" element={<ProtectedRoute><FoodReportsPage /></ProtectedRoute>} />

      <Route path="/dashboard-purchase" element={<ProtectedRoute><PurchaseDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-purchase/events" element={<ProtectedRoute><PurchaseEventsListPage /></ProtectedRoute>} />
      <Route path="/dashboard-purchase/events/detailView/:eventId" element={<ProtectedRoute><PurchaseEventsDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-purchase/reports" element={<ProtectedRoute><PurchaseReportsPage /></ProtectedRoute>} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/dashboard-purchase/events/individualDetailView/:id" element={<ProtectedRoute><PurchaseIndividualDetailViewPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {

  return (
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={1500} />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;