import {
  useNavigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../../context/AuthContext'

export default function PlatformHeader({
  backTo = '/courses',
  showBack = false,
}) {
  const navigate =
    useNavigate()

  const {
    user,
    profile,
    signOut,
  } = useAuth()


  async function handleLogout() {
    await signOut()

    navigate(
      '/',
      {
        replace: true,
      }
    )
  }


  return (
    <header className="platform-header">

      <div className="platform-header-container">

        {/* BRAND */}

        <div className="platform-header-left">

          <button
            type="button"
            className="platform-brand"
            onClick={() =>
              navigate('/courses')
            }
          >

            <div className="platform-brand-mark">
              <span>Q</span>
              <span>E</span>
            </div>

            <div className="platform-brand-content">

              <strong>
                Quiz Enterprise
              </strong>

              <span>
                Learning Platform
              </span>

            </div>

          </button>


          {showBack && (

            <button
              type="button"
              className="platform-back-button"
              onClick={() =>
                navigate(backTo)
              }
            >
              ← Volver
            </button>

          )}

        </div>


        {/* USER */}

        <div className="platform-header-user">

          <div className="platform-user-avatar">
            {getInitials(
              profile?.full_name,
              user?.email
            )}
          </div>


          <div className="platform-user-info">

            <strong>
              {profile?.full_name ||
                'Usuario'}
            </strong>

            <span>
              {user?.email}
            </span>

          </div>


          {profile?.role === 'ADMIN' && (

            <button
              type="button"
              className="platform-header-action"
              onClick={() =>
                navigate('/admin')
              }
            >
              Dashboard
            </button>

          )}


          <button
            type="button"
            className="platform-logout-button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>

        </div>

      </div>

    </header>
  )
}


function getInitials(
  fullName,
  email
) {
  if (fullName?.trim()) {

    const parts =
      fullName
        .trim()
        .split(/\s+/)

    if (
      parts.length > 1
    ) {
      return (
        parts[0][0] +
        parts[1][0]
      ).toUpperCase()
    }

    return parts[0][0]
      .toUpperCase()
  }

  return (
    email?.[0] ||
    'U'
  ).toUpperCase()
}