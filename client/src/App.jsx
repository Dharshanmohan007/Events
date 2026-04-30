import './App.css'
import {Routes, Route} from 'react-router-dom'
import EventsForm from './Pages/EventsForm'
import ICTCSDashboard from './Pages/Dashboards/ICTCSDashboard'
import Login from './Pages/Login'

function App() {

  return (
    <Routes>
      <Route path='/login' element={<Login/>}/>
      <Route path='/' element={<EventsForm/>}/>
      <Route path='/dashboard-ictcs' element={<ICTCSDashboard/>}/>
    </Routes>
  )
}

export default App
