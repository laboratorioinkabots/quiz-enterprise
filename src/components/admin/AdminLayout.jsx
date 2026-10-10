import { useState } from 'react'

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const {
    user,
    profile,
    signOut,
  } = useAuth()

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  async function handleLogout() {
    await signOut()

    navigate('/login')
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <div className="admin-shell">

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside
        className={`admin-sidebar ${
          mobileMenuOpen
            ? 'admin-sidebar-open'
            : ''
        }`}
      >

        <div className="admin-brand">

          <div className="admin-brand-logo">
            QE
          </div>

          <div className="admin-brand-text">
            <strong>
              Quiz Enterprise
            </strong>

            <span>
              Administración
            </span>
          </div>

        </div>

        <nav className="admin-navigation">

          <AdminMenuItem
            to="/admin"
            label="Dashboard"
            icon="⌂"
            end
            onClick={closeMobileMenu}
          />

          <AdminMenuItem
            to="/admin/courses"
            label="Cursos"
            icon="▣"
            onClick={closeMobileMenu}
          />

          <AdminMenuItem
            to="/admin/questions"
            label="Preguntas"
            icon="?"
            onClick={closeMobileMenu}
          />

          <AdminMenuItem
            to="/admin/import"
            label="Importar preguntas"
            icon="↑"
            onClick={closeMobileMenu}
          />
          <AdminMenuItem
            to="/admin/reports"
            label="Reportes"
            icon="▤"
            onClick={closeMobileMenu}
          />
          <AdminMenuItem
            to="/admin/users"
            label="Usuarios"
            icon="◎"
            onClick={closeMobileMenu}
          />

        </nav>

        <div className="admin-sidebar-bottom">

          <button
            className="admin-back-platform"
            onClick={() =>
              navigate('/courses')
            }
          >
            <span>←</span>

            Plataforma
          </button>

          <div className="admin-user-card">

            <div className="admin-avatar">
              {user?.email
                ?.charAt(0)
                ?.toUpperCase() ?? 'A'}
            </div>

            <div className="admin-user-info">

              <strong>
                {profile?.full_name || 'Administrador'}
              </strong>

              <span>
                {user?.email}
              </span>

            </div>

            <button
              className="admin-logout-icon"
              title="Cerrar sesión"
              onClick={handleLogout}
            >
              ↪
            </button>

          </div>

        </div>

      </aside>

      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}

      {mobileMenuOpen && (
        <button
          className="admin-sidebar-overlay"
          aria-label="Cerrar menú"
          onClick={closeMobileMenu}
        />
      )}

      {/* =====================================
          CONTENT
      ===================================== */}

      <div className="admin-main">

        <header className="admin-header">

          <div className="admin-header-left">

            <button
              className="admin-mobile-menu"
              onClick={() =>
                setMobileMenuOpen(
                  current => !current
                )
              }
            >
              ☰
            </button>

            <div>

              <span className="admin-header-section">
                Administración
              </span>

              <strong>
                {getPageName(
                  location.pathname
                )}
              </strong>

            </div>

          </div>

          <div className="admin-header-right">

            <span className="admin-role-badge">
              ADMIN
            </span>

            <button
              className="admin-header-platform-button"
              onClick={() =>
                navigate('/courses')
              }
            >
              Ver plataforma
            </button>

          </div>

        </header>

        <main className="admin-main-content">
          <Outlet />
        </main>

      </div>

    </div>
  )
}

function AdminMenuItem({
  to,
  label,
  icon,
  end = false,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `admin-nav-item ${
          isActive
            ? 'admin-nav-item-active'
            : ''
        }`
      }
    >
      <span className="admin-nav-icon">
        {icon}
      </span>

      <span>
        {label}
      </span>
    </NavLink>
  )
}

function getPageName(pathname) {
  if (pathname === '/admin') {
    return 'Dashboard'
  }

  if (
      pathname.startsWith(
        '/admin/reports'
      )
    ) {
      return 'Reportes'
    }

  if (
    pathname.startsWith(
      '/admin/questions'
    )
  ) {
    return 'Preguntas'
  }

  if (
    pathname.startsWith(
      '/admin/import'
    )
  ) {
    return 'Importar preguntas'
  }

  if (
    pathname.startsWith(
      '/admin/users'
    )
  ) {
    return 'Usuarios'
  }

  return 'Administración'
}