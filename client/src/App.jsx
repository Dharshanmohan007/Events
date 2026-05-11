import './App.css'
import { Routes, Route } from 'react-router-dom'
import EventsForm from './Pages/EventsForm'
import ICTCSDashboard from './Pages/Dashboards/ICTC-Dashboard/ICTCSDashboard'
import AUDIODashboard from './Pages/Dashboards/AUDIO-Dashboard/AUDIODashboard'
import Login from './Pages/Login'
import Events from './Pages/Dashboards/ICTC-Dashboard/Events'
import Reports from './Pages/Dashboards/ICTC-Dashboard/Reports'
import TransportsDashboard from './Pages/Dashboards/Transports-Dashboard/TransportsDashboard'
import MediaDashboard from './Pages/Dashboards/Media-Dashboard/MediaDashboard'
import AdminDashboard from './Pages/Dashboards/Admin-Dashboard/AdminDashboard'
import AdminEventsListPage from './Pages/Dashboards/Admin-Dashboard/AdminEventsListPage'
import AdminDashboardLayout from './Pages/Dashboards/Admin-Dashboard/AdminDashboardLayout'
import VenueManagementPage from './Pages/Dashboards/Admin-Dashboard/VenueManagementPage'
import AdminManagementPage from './Pages/Dashboards/Admin-Dashboard/AdminManagementPage'
import FacultyManagementPage from './Pages/Dashboards/Admin-Dashboard/FacultyManagementPage'

function App() {

  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/' element={<EventsForm />} />
      <Route path='/dashboard-ictcs' element={<ICTCSDashboard />} />
      <Route path='/dashboard-ictcs/events' element={<Events />} />
      <Route path='/dashboard-ictcs/reports' element={<Reports />} />
      <Route path='/dashboard-audio' element={<AUDIODashboard />} />
      <Route path='/dashboard-transports' element={<TransportsDashboard />} />
      <Route path='/dashboard-media' element={<MediaDashboard />} />
      <Route path='/dashboard-admin' element={<AdminDashboardLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path='AdminEventsRequests' element={<AdminEventsListPage />} />
        <Route path='VenueManagement' element={<VenueManagementPage />} />
        <Route path='AdminManagement' element={<AdminManagementPage />} />
        <Route path='FacultyManagement' element={<FacultyManagementPage />} />
      </Route>
    </Routes>
  )
}

export default App
