import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

import EventsForm from './Pages/EventsForm'
import ICTCSDashboard from './Pages/Dashboards/ICTC-Dashboard/ICTCSDashboard'
import AUDIODashboard from './Pages/Dashboards/AUDIO-Dashboard/AUDIODashboard'
import AudioReportsPage from './Pages/Dashboards/AUDIO-Dashboard/AudioReportsPage'
import Login from './Pages/Login'
import Events from './Pages/Dashboards/ICTC-Dashboard/Events'
import Reports from './Pages/Dashboards/ICTC-Dashboard/Reports'
import IctcEventDetailsPage from './Pages/Dashboards/ICTC-Dashboard/IctcEventDetailsPage'
import TransportsDashboard from './Pages/Dashboards/Transports-Dashboard/TransportsDashboard'
import TransportsReportsPage from './Pages/Dashboards/Transports-Dashboard/TransportsReportsPage'
import MediaDashboard from './Pages/Dashboards/Media-Dashboard/MediaDashboard'
import PosterDashboard from './Pages/Dashboards/Media-Dashboard/PosterDashboard'
import PosterRequestListPage from './Pages/Dashboards/Media-Dashboard/PosterRequestListPage'
import PosterReportsPage from './Pages/Dashboards/Media-Dashboard/PosterReportsPage'
import PosterFeedbackPage from './Pages/Dashboards/Media-Dashboard/PosterFeedbackPage'
import PosterDetailView from './Pages/Dashboards/Media-Dashboard/PosterDetailView'
import VideoDashboard from './Pages/Dashboards/Media-Dashboard/VideoDashboard'
import AdminDashboard from './Pages/Dashboards/Admin-Dashboard/AdminDashboard'
import AdminEventsListPage from './Pages/Dashboards/Admin-Dashboard/AdminEventsListPage'
import AdminDashboardLayout from './Pages/Dashboards/Admin-Dashboard/AdminDashboardLayout'
import VenueManagementPage from './Pages/Dashboards/Admin-Dashboard/VenueManagementPage'
import AdminManagementPage from './Pages/Dashboards/Admin-Dashboard/AdminManagementPage'
import FacultyManagementPage from './Pages/Dashboards/Admin-Dashboard/FacultyManagementPage'
import AdminReportsPage from './Pages/Dashboards/Admin-Dashboard/AdminReportsPage'
import AccommodationDashboard from './Pages/Dashboards/Accommodation-Dashboard/AccommodationDashboard'
import AccommodationReportsPage from './Pages/Dashboards/Accommodation-Dashboard/AccommodationReportsPage'
import FoodDashboard from './Pages/Dashboards/Food-Dashboard/FoodDashboard'
import FoodReportsPage from './Pages/Dashboards/Food-Dashboard/FoodReportsPage'
import PurchaseDashboard from './Pages/Dashboards/Purchase-Dashboard/PurchaseDashboard'
import VenueDashboard from './Pages/Dashboards/Venue-Dashboard/VenueDashboard'
import VenueReportsPage from './Pages/Dashboards/Venue-Dashboard/VenueReportsPage'
import ForgetPassword from './Components/ForgetPassword'
import EventDetailsPage from "./Pages/Dashboards/Admin-Dashboard/EventDetailsPage"
import FacultyDashboard from "./Pages/Dashboards/Faculty-Dashboard/FacultyDashboard"
import FacultyVenueListPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyVenueListPage"
import FacultyfeedbackPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyfeedbackPage"
import FacultyEventsListPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyEventsListPage"
import FacultyEventsDetailViewPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyEventsDetailViewPage"

import { AuthProvider, useAuth } from "./Components/AuthContext";
import { ProtectedRoute } from "./utils/ProtectedRoute";

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

      <Route path="/dashboard-ictcs" element={<ProtectedRoute><ICTCSDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-ictcs/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/dashboard-ictcs/events/:eventId" element={<ProtectedRoute><IctcEventDetailsPage /></ProtectedRoute>} />
      <Route path="/dashboard-ictcs/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

      <Route path="/dashboard-audio" element={<ProtectedRoute><AUDIODashboard /></ProtectedRoute>} />
      <Route path="/dashboard-audio/reports" element={<ProtectedRoute><AudioReportsPage /></ProtectedRoute>} />

      <Route path="/dashboard-transports" element={<ProtectedRoute><TransportsDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-transports/reports" element={<ProtectedRoute><TransportsReportsPage /></ProtectedRoute>} />

      <Route path="/dashboard-media" element={<ProtectedRoute><MediaDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-poster" element={<ProtectedRoute><PosterDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-poster/requests" element={<ProtectedRoute><PosterRequestListPage /></ProtectedRoute>} />
      <Route path="/dashboard-poster/reports" element={<ProtectedRoute><PosterReportsPage /></ProtectedRoute>} />
      <Route path="/dashboard-poster/feedback" element={<ProtectedRoute><PosterFeedbackPage /></ProtectedRoute>} />
      <Route path="/dashboard-poster/detailView/:posterId" element={<ProtectedRoute><PosterDetailView /></ProtectedRoute>} />
      <Route path="/dashboard-video" element={<ProtectedRoute><VideoDashboard /></ProtectedRoute>} />

      <Route path="/dashboard-admin" element={<ProtectedRoute><AdminDashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="AdminEventsRequests" element={<AdminEventsListPage />} />
        <Route path="VenueManagement" element={<VenueManagementPage />} />
        <Route path="AdminManagement" element={<AdminManagementPage />} />
        <Route path="FacultyManagement" element={<FacultyManagementPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="AdminEventsRequests/:eventId" element={<EventDetailsPage />} />
      </Route>

      <Route path="/dashboard-faculty" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-faculty/events" element={<ProtectedRoute><FacultyEventsListPage /></ProtectedRoute>} />
      <Route path="/dashboard-faculty/events/detailView/:eventId" element={<ProtectedRoute><FacultyEventsDetailViewPage /></ProtectedRoute>} />
      <Route path="/dashboard-faculty/venues" element={<ProtectedRoute><FacultyVenueListPage /></ProtectedRoute>} />
      <Route path="/dashboard-faculty/feedback/:eventId" element={<ProtectedRoute><FacultyfeedbackPage /></ProtectedRoute>} />

      <Route path="/dashboard-accommodation" element={<ProtectedRoute><AccommodationDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-accommodation/reports" element={<ProtectedRoute><AccommodationReportsPage /></ProtectedRoute>} />

      <Route path="/dashboard-venue" element={<ProtectedRoute><VenueDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-venue/reports" element={<ProtectedRoute><VenueReportsPage /></ProtectedRoute>} />

      <Route path="/dashboard-food" element={<ProtectedRoute><FoodDashboard /></ProtectedRoute>} />
      <Route path="/dashboard-food/reports" element={<ProtectedRoute><FoodReportsPage /></ProtectedRoute>} />

      <Route path="/dashboard-purchase" element={<ProtectedRoute><PurchaseDashboard /></ProtectedRoute>} />

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