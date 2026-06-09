import { BrowserRouter, Routes, Route } from "react-router-dom"

import Dashboard from "./pages/Dashboard.jsx"
import Login from "./pages/Login.jsx"

function App() {
  return (
    <div className="min-h-screen bg-[#070B1A] text-white relative overflow-hidden">

      {/* 🌌 Background Glow Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e3a8a_0%,transparent_55%)] opacity-40"></div>

      {/* 💎 Main App Content */}
      <div className="relative z-10">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </div>

    </div>
  )
}

export default App