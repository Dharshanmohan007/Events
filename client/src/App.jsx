// import './App.css'
// import {Routes, Route} from 'react-router-dom'
// import EventsForm from './Pages/EventsForm'
// import Login from './Pages/Login'

// function App() {

//   return (
//     <Routes>
//       <Route path='/login' element={<Login/>}/>
//       <Route path='/' element={<EventsForm/>}/>
//     </Routes>
//   )
// }


// export default App



import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'

// Pages
import EventsForm from './Pages/EventsForm'
import ICTCSDashboard from './Pages/Dashboards/ICTC-Dashboard/ICTCSDashboard'
import AUDIODashboard from './Pages/Dashboards/AUDIO-Dashboard/AUDIODashboard'
import Login from './Pages/Login'

// Auth Context
import { AuthProvider, useAuth } from './Components/AuthContext'
import { ProtectedRoute } from './utils/ProtectedRoute'

// ─── Dashboard (optional wrapper, you can replace with EventsForm directly) ───
function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f0d1a] text-white p-6">
      <h1 className="text-2xl font-bold">
        Welcome, {user?.name} 👋
      </h1>

      {/* Your actual main page */}
      <div className="mt-6">
        <EventsForm />
      </div>
    </div>
  );
}

// ─── Route Wrapper for Login Redirect ────────────────────────────────────────
function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

// ─── App Routes ─────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>

      {/* Login Route */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Main Route */}
      <Route
        path="/forms"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}

// ─── Main App Wrapper ───────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;