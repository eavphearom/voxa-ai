import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated } from '../services/authApi'

function PublicRoute() {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default PublicRoute
