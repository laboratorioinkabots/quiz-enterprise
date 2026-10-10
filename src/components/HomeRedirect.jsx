import {
  Navigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

export default function HomeRedirect() {
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

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    profile?.status !== 'ACTIVE'
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    profile.role === 'ADMIN'
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    )
  }

  return (
    <Navigate
      to="/courses"
      replace
    />
  )
}