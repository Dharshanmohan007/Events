import './App.css'
import { Routes, Route } from 'react-router-dom'
import EventsForm from './Pages/EventsForm'
import ICTCSDashboard from './Pages/Dashboards/ICTCSDashboard'
import Login from './Pages/Login'
import Events from './Pages/Events'
import Reports from './Pages/Reports'

function App() {

  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/' element={<EventsForm />} />
      <Route path='/dashboard-ictcs' element={<ICTCSDashboard />} />
      <Route path='/dashboard-ictcs/events' element={<Events />} />
      <Route path='/dashboard-ictcs/reports' element={<Reports />} />
    </Routes>
  )
}

export default App
