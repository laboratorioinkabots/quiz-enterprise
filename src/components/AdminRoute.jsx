import {
  Navigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

export default function AdminRoute({
  children,
}) {
  const {
    user,
    profile,
    loading,
  } = useAuth()

  console.log(
    'ADMIN ROUTE DEBUG:',
    {
      loading,
      userId:
        user?.id,

      profileId:
        profile?.id,

      role:
        profile?.role,

      status:
        profile?.status,
    }
  )

  if (loading) {
    return (
      <div className="screen-center">
        <div>
          <strong>
            Validando permisos...
          </strong>
        </div>
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

  if (!profile) {
    return (
      <div className="screen-center">
        <div>
          <h2>
            Perfil no disponible
          </h2>

          <p>
            Usuario:
            {' '}
            {user.email}
          </p>

          <p>
            user.id:
            {' '}
            {user.id}
          </p>
        </div>
      </div>
    )
  }

  if (
    profile.status !== 'ACTIVE'
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  if (
    profile.role !== 'ADMIN'
  ) {
    return (
      <Navigate
        to="/courses"
        replace
      />
    )
  }

  return children
}