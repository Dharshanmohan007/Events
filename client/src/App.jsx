import './App.css'
import { Routes, Route } from 'react-router-dom'
import EventsForm from './Pages/EventsForm'
import ICTCSDashboard from './Pages/Dashboards/ICTC-Dashboard/ICTCSDashboard'
import AUDIODashboard from './Pages/Dashboards/AUDIO-Dashboard/AUDIODashboard'
import Login from './Pages/Login'
import Events from './Pages/Dashboards/ICTC-Dashboard/Events'
import Reports from './Pages/Dashboards/ICTC-Dashboard/Reports'
import TransportsDashboard from './Pages/Dashboards/Transports-Dashboard/TransportsDashboard'

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
    </Routes>
  )
}

export default App
