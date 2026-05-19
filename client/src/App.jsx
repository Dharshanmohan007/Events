import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "./Components/CustomToast";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

// Pages
import EventsForm from './Pages/EventsForm'
import ICTCSDashboard from './Pages/Dashboards/ICTC-Dashboard/ICTCSDashboard'
import AUDIODashboard from './Pages/Dashboards/AUDIO-Dashboard/AUDIODashboard'
import Login from './Pages/Login'
import Events from './Pages/Dashboards/ICTC-Dashboard/Events'
import Reports from './Pages/Dashboards/ICTC-Dashboard/Reports'
import IctcEventDetailsPage from './Pages/Dashboards/ICTC-Dashboard/IctcEventDetailsPage'
import TransportsDashboard from './Pages/Dashboards/Transports-Dashboard/TransportsDashboard'
import MediaDashboard from './Pages/Dashboards/Media-Dashboard/MediaDashboard'
import AdminDashboard from './Pages/Dashboards/Admin-Dashboard/AdminDashboard'
import AdminEventsListPage from './Pages/Dashboards/Admin-Dashboard/AdminEventsListPage'
import AdminDashboardLayout from './Pages/Dashboards/Admin-Dashboard/AdminDashboardLayout'
import VenueManagementPage from './Pages/Dashboards/Admin-Dashboard/VenueManagementPage'
import AdminManagementPage from './Pages/Dashboards/Admin-Dashboard/AdminManagementPage'
import FacultyManagementPage from './Pages/Dashboards/Admin-Dashboard/FacultyManagementPage'
import AccommodationDashboard from './Pages/Dashboards/Accommodation-Dashboard/AccommodationDashboard'
import FoodDashboard from './Pages/Dashboards/Food-Dashboard/FoodDashboard'
import PurchaseDashboard from './Pages/Dashboards/Purchase-Dashboard/PurchaseDashboard'
import SignUp from './Pages/SignUp'
import ForgetPassword from './Components/ForgetPassword'

// Auth Context
import { AuthProvider, useAuth } from "./Components/AuthContext";
import { ProtectedRoute } from "./utils/ProtectedRoute";
import { useEffect } from "react";
import EventDetailsPage from "./Pages/Dashboards/Admin-Dashboard/EventDetailsPage";
import FacultyDashboard from "./Pages/Dashboards/Faculty-Dashboard/FacultyDashboard";



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
      <Route path='/login' element={<Login />} />
      <Route path='/' element={<EventsForm />} />
      {/* <Route path='/login' element={<Login />} /> 
      <Route path='/' element={<EventsForm />} /> */}
      <Route path='/dashboard-ictcs' element={<ICTCSDashboard />} />
      <Route path='/dashboard-ictcs/events' element={<Events />} />
      <Route path='/dashboard-ictcs/events/:eventId' element={<IctcEventDetailsPage />} />
      <Route path='/dashboard-ictcs/reports' element={<Reports />} />
      <Route path='/dashboard-audio' element={<AUDIODashboard />} />
      <Route path='/dashboard-transports' element={<TransportsDashboard />} />
      <Route path='/dashboard-media' element={<MediaDashboard />} />
      {/* Admin routes  */}
      <Route path='/dashboard-admin' element={<AdminDashboardLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path='AdminEventsRequests' element={<AdminEventsListPage />} />
        <Route path='VenueManagement' element={<VenueManagementPage />} />
        <Route path='AdminManagement' element={<AdminManagementPage />} />
        <Route path='FacultyManagement' element={<FacultyManagementPage />} />
        <Route path='AdminEventsRequests/:eventId' element={<EventDetailsPage />} />
      </Route>

      <Route path="/dashboard-faculty" element={<FacultyDashboard />} />
      <Route path='/dashboard-accommodation' element={<AccommodationDashboard />} />
      <Route path='/dashboard-food' element={<FoodDashboard />} />
      <Route path='/dashboard-purchase' element={<PurchaseDashboard />} />
      <Route path='/dashboard-admin' element={<AdminDashboard />} />
      {/* Login Route */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      {/* Sign Up Route */}
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        }
      />
      <Route
        path="/forget-password"
        element={
          <PublicRoute>
            <ForgetPassword />
          </PublicRoute>
        }
      />

      {/* Protected Main Route */}
      <Route
        path="/forms"
        element={
          <ProtectedRoute>
            <EventsForm />
          </ProtectedRoute>
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
