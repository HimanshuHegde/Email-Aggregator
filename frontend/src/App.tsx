import {Routes, Route} from "react-router-dom"
import Dashboard from "./pages/dashboard"
import AuthPage from "./pages/authentication"
import ProtectedRoute from "./pages/ProtectedRoute"
import { useState } from "react"
import { UserContext } from "../lib/context";
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function App() {
  
  const [createAccounts, setCreateAccounts] = useState<any[]>([]);
  return (
    <Routes>
      <Route path="/" element={<AuthPage/>} />
      
      <Route path="/Dashboard" element={<ProtectedRoute>
        <UserContext.Provider value={{createAccounts,setCreateAccounts}}>
        <Dashboard />
        </UserContext.Provider> 
        </ProtectedRoute>} />
    </Routes>
  )
  
}