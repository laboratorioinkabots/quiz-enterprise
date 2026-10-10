import {
  Link,
} from 'react-router-dom'

import {
  useAuth,
} from '../../context/AuthContext'

export default function PublicHeader() {
  const {
    user,
    profile,
  } = useAuth()

  const isAuthenticated =
    Boolean(
      user &&
      profile?.status === 'ACTIVE'
    )

  const destination =
    isAuthenticated
      ? profile?.role === 'ADMIN'
        ? '/admin'
        : '/courses'
      : '/login'

  const destinationLabel =
    isAuthenticated
      ? profile?.role === 'ADMIN'
        ? 'Ir al Dashboard'
        : 'Ir a mis cursos'
      : 'Iniciar sesión'

  return (
    <header className="public-header">

      <div className="public-container public-header-inner">

        {/* BRAND */}

        <Link
          to="/"
          className="public-logo"
        >

          <div className="public-logo-mark">

            <span>
              Q
            </span>

            <span>
              E
            </span>

          </div>

          <div className="public-logo-content">

            <strong>
              Quiz Enterprise
            </strong>

            <span>
              Learning Platform
            </span>

          </div>

        </Link>


        {/* NAVIGATION */}

        <nav className="public-nav">

          <a href="#inicio">
            Inicio
          </a>

          <a href="#como-funciona">
            Cómo funciona
          </a>

          <a href="#cursos">
            Cursos
          </a>

          <a href="#empresa">
            Empresa
          </a>

          <a href="#faq">
            Preguntas frecuentes
          </a>

        </nav>


        {/* ACTIONS */}

        <div className="public-header-actions">

          {isAuthenticated ? (

            <Link
              to={destination}
              className="public-header-login"
            >
              {destinationLabel}
            </Link>

          ) : (

            <>
              <Link
                to="/login"
                className="public-header-login"
              >
                Iniciar sesión
              </Link>

              <Link
                to="/register"
                className="public-header-register"
              >
                Crear cuenta
              </Link>
            </>

          )}

        </div>

      </div>

    </header>
  )
}