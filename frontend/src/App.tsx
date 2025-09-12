import {Routes, Route} from "react-router-dom"
import Dashboard from "./pages/dashboard"
import AuthPage from "./pages/authentication"
import ProtectedRoute from "./pages/ProtectedRoute"

export default function App() {

  return (
    <Routes>
      <Route path="/" element={<AuthPage/>} />
      <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  )
  
}