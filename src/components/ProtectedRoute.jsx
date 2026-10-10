import {
  Navigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

export default function ProtectedRoute({
  children,
}) {
  const {
    user,
    profile,
    loading,
  } = useAuth()

  if (loading) {
    return (
      <div className="screen-center">
        Cargando...
      </div>
    )
  }

  if (
    !user ||
    !profile ||
    profile.status !== 'ACTIVE'
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return children
}