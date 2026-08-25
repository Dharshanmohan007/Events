import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

// Pages
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
import SignUp from './Pages/SignUp'
import ForgetPassword from './Components/ForgetPassword'

// Auth Context
import { AuthProvider, useAuth } from "./Components/AuthContext";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import EventDetailsPage from "./Pages/Dashboards/Admin-Dashboard/EventDetailsPage";
import FacultyDashboard from "./Pages/Dashboards/Faculty-Dashboard/FacultyDashboard";
import FacultyVenueListPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyVenueListPage";
import FacultyfeedbackPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyfeedbackPage";
import FacultyEventsListPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyEventsListPage";
import FacultyEventsDetailViewPage from "./Pages/Dashboards/Faculty-Dashboard/FacultyEventsDetailViewPage";



// ─── Route Wrapper for Login Redirect ────────────────────────────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  // Wait for auth check before deciding
  if (loading) return null;
  return user ? <Navigate to="/forms" replace /> : children;
}

// ─── App Routes ─────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/forms' element={<EventsForm />} />
      <Route path='/dashboard-ictcs' element={<ICTCSDashboard />} />
      <Route path='/dashboard-ictcs/events' element={<Events />} />
      <Route path='/dashboard-ictcs/events/:eventId' element={<IctcEventDetailsPage />} />
      <Route path='/dashboard-ictcs/reports' element={<Reports />} />
      <Route path='/dashboard-audio' element={<AUDIODashboard />} />
      <Route path='/dashboard-audio/reports' element={<AudioReportsPage />} />
      <Route path='/dashboard-transports' element={<TransportsDashboard />} />
      <Route path='/dashboard-transports/reports' element={<TransportsReportsPage />} />
      <Route path='/dashboard-media' element={<MediaDashboard />} />
      <Route path='/dashboard-poster' element={<PosterDashboard />} />
      <Route path='/dashboard-poster/requests' element={<PosterRequestListPage />} />
      <Route path='/dashboard-poster/reports' element={<PosterReportsPage />} />
      <Route path='/dashboard-poster/feedback' element={<PosterFeedbackPage />} />
      <Route path='/dashboard-poster/detailView/:posterId' element={<PosterDetailView />} />
      <Route path='/dashboard-video' element={<VideoDashboard />} />
      {/* Admin routes  */}
      <Route path='/dashboard-admin' element={<AdminDashboardLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path='AdminEventsRequests' element={<AdminEventsListPage />} />
        <Route path='VenueManagement' element={<VenueManagementPage />} />
        <Route path='AdminManagement' element={<AdminManagementPage />} />
        <Route path='FacultyManagement' element={<FacultyManagementPage />} />
        <Route path='reports' element={<AdminReportsPage />} />
        <Route path='AdminEventsRequests/:eventId' element={<EventDetailsPage />} />
      </Route>

      <Route path="/dashboard-faculty" element={<FacultyDashboard />} />
      <Route path="/dashboard-faculty/events" element={<FacultyEventsListPage />} />
      <Route path="/dashboard-faculty/events/detailView/:eventId" element={<FacultyEventsDetailViewPage />} />
      <Route path="/dashboard-faculty/venues" element={<FacultyVenueListPage />} />
      <Route path="/dashboard-faculty/feedback/:eventId" element={<FacultyfeedbackPage />} />
      <Route path='/dashboard-accommodation' element={<AccommodationDashboard />} />
      <Route path='/dashboard-accommodation/reports' element={<AccommodationReportsPage />} />
      <Route path='/dashboard-venue' element={<VenueDashboard />} />
      <Route path='/dashboard-venue/reports' element={<VenueReportsPage />} />
      <Route path='/dashboard-food' element={<FoodDashboard />} />
      <Route path='/dashboard-food/reports' element={<FoodReportsPage />} />
      <Route path='/dashboard-purchase' element={<PurchaseDashboard />} />
      <Route path='/dashboard-admin' element={<AdminDashboard />} />
      {/* Login Route */}
      <Route
        path="/forget-password"
        element={
          <PublicRoute>
            <ForgetPassword />
          </PublicRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Main App Wrapper ───────────────────────────────────────────────────────
function App() {

  return (
    <AuthProvider>

      <ToastContainer position="top-right" autoClose={1500} />

      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
