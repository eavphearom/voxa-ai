import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Communication from '../pages/Communication'
import History from '../pages/History'
import Home from '../pages/Home'
import Login from '../pages/Login'
import MeetingDetail from '../pages/MeetingDetail'
import Record from '../pages/Record'
import Register from '../pages/Register'
import Settings from '../pages/Settings'
import VoxaAI from '../pages/VoxaAI'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/voxa-ai" element={<VoxaAI />} />
          <Route path="/voxa-ai/:chatId" element={<VoxaAI />} />
          <Route path="/record" element={<Record />} />
          <Route path="/meeting/:id" element={<MeetingDetail />} />
          <Route path="/history/:id" element={<History />} />
          <Route path="/communication/:id" element={<Communication />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
