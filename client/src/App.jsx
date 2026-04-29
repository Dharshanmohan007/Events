import './App.css'
import {Routes, Route} from 'react-router-dom'
import EventsForm from './Pages/EventsForm'
import Login from './Pages/Login'


function App() {

  return (
    
    <Routes>
      <Route path='/login' element={<Login/>}/>
      <Route path='/' element={<EventsForm/>}/>
      
    </Routes>
    
  )
}

export default App
