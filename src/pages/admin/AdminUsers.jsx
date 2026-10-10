import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  supabase,
} from '../../services/supabase'

import {
  useAuth,
} from '../../context/AuthContext'

export default function AdminUsers() {
  const navigate = useNavigate()

  const { user } = useAuth()

  const [users, setUsers] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [roleFilter, setRoleFilter] =
    useState('ALL')

  const [statusFilter, setStatusFilter] =
    useState('ALL')

  const [updatingId, setUpdatingId] =
    useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      setError('')

      const {
        data,
        error,
      } = await supabase.rpc(
        'admin_list_users'
      )

      if (error) {
        throw error
      }

      setUsers(
        data ?? []
      )

    } catch (err) {
      console.error(
        'Error cargando usuarios:',
        err
      )

      setError(
        err.message ||
        'No se pudieron cargar los usuarios.'
      )

    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => ({
    total:
      users.length,

    active:
      users.filter(
        item =>
          item.status === 'ACTIVE'
      ).length,

    admins:
      users.filter(
        item =>
          item.role === 'ADMIN'
      ).length,

    inactive:
      users.filter(
        item =>
          item.status === 'INACTIVE'
      ).length,

  }), [users])

  const filteredUsers =
    useMemo(() => {

      const normalizedSearch =
        search
          .trim()
          .toLowerCase()

      return users.filter(
        item => {

          const matchesSearch =
            !normalizedSearch ||

            (item.full_name ?? '')
              .toLowerCase()
              .includes(
                normalizedSearch
              )

            ||

            (item.email ?? '')
              .toLowerCase()
              .includes(
                normalizedSearch
              )

          const matchesRole =
            roleFilter === 'ALL' ||
            item.role === roleFilter

          const matchesStatus =
            statusFilter === 'ALL' ||
            item.status === statusFilter

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          )
        }
      )

    }, [
      users,
      search,
      roleFilter,
      statusFilter,
    ])

  async function updateUser(
    targetUser,
    changes
  ) {
    const newRole =
      changes.role ??
      targetUser.role

    const newStatus =
      changes.status ??
      targetUser.status

    try {
      setUpdatingId(
        targetUser.id
      )

      setError('')

      const {
        error,
      } = await supabase.rpc(
        'admin_update_user',
        {
          p_user_id:
            targetUser.id,

          p_role:
            newRole,

          p_status:
            newStatus,
        }
      )

      if (error) {
        throw error
      }

      setUsers(
        previous =>
          previous.map(
            item =>
              item.id ===
              targetUser.id
                ? {
                    ...item,
                    role:
                      newRole,
                    status:
                      newStatus,
                  }
                : item
          )
      )

    } catch (err) {
      console.error(
        'Error actualizando usuario:',
        err
      )

      setError(
        err.message ||
        'No se pudo actualizar el usuario.'
      )

    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        Cargando usuarios...
      </div>
    )
  }

  return (
    <div>

      <section className="admin-page-heading">

        <div>

          <span className="admin-eyebrow">
            Seguridad y accesos
          </span>

          <h1>
            Usuarios
          </h1>

          <p>
            Administra los usuarios,
            roles, estado de acceso
            y actividad en la plataforma.
          </p>

        </div>

      </section>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      {/* ESTADISTICAS */}

      <section className="admin-user-stats">

        <UserStat
          label="Usuarios"
          value={stats.total}
        />

        <UserStat
          label="Activos"
          value={stats.active}
          type="success"
        />

        <UserStat
          label="Administradores"
          value={stats.admins}
          type="admin"
        />

        <UserStat
          label="Inactivos"
          value={stats.inactive}
          type="danger"
        />

      </section>

      {/* FILTROS */}
{/* =========================================
    FILTROS
========================================= */}

<section className="admin-users-toolbar">

  <div className="admin-users-search">

    <span
      className="admin-users-search-icon"
      aria-hidden="true"
    >
      ⌕
    </span>

    <input
      type="search"
      value={search}
      placeholder="Buscar por nombre o email..."
      onChange={(event) =>
        setSearch(event.target.value)
      }
    />

    {search && (
      <button
        type="button"
        className="admin-users-search-clear"
        onClick={() => setSearch('')}
        aria-label="Limpiar búsqueda"
      >
        ×
      </button>
    )}

  </div>


  <div className="admin-users-filters">

    <div className="admin-users-select-wrapper">

      <span className="admin-users-filter-label">
        Rol
      </span>

      <select
        value={roleFilter}
        onChange={(event) =>
          setRoleFilter(event.target.value)
        }
      >
        <option value="ALL">
          Todos los roles
        </option>

        <option value="USER">
          Usuario
        </option>

        <option value="ADMIN">
          Administrador
        </option>
      </select>

    </div>


    <div className="admin-users-select-wrapper">

      <span className="admin-users-filter-label">
        Estado
      </span>

      <select
        value={statusFilter}
        onChange={(event) =>
          setStatusFilter(event.target.value)
        }
      >
        <option value="ALL">
          Todos los estados
        </option>

        <option value="ACTIVE">
          Activo
        </option>

        <option value="INACTIVE">
          Inactivo
        </option>
      </select>

    </div>


    {(search ||
      roleFilter !== 'ALL' ||
      statusFilter !== 'ALL') && (

      <button
        type="button"
        className="admin-users-clear-filters"
        onClick={() => {
          setSearch('')
          setRoleFilter('ALL')
          setStatusFilter('ALL')
        }}
      >
        Limpiar filtros
      </button>

    )}

  </div>

</section>

      {/* TABLA */}

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Usuarios registrados
            </h2>

            <p>
              {
                filteredUsers.length
              }
              {' usuario(s) encontrado(s)'}
            </p>

          </div>

        </div>

        {filteredUsers.length === 0 ? (

          <div className="admin-empty-state">

            <h3>
              No se encontraron usuarios
            </h3>

            <p>
              Prueba modificando
              los filtros de búsqueda.
            </p>

          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-users-table">

              <thead>

                <tr>

                  <th>
                    Usuario
                  </th>

                  <th>
                    Rol
                  </th>

                  <th>
                    Estado
                  </th>

                  <th>
                    Intentos
                  </th>

                  <th>
                    Mejor nota
                  </th>

                  <th>
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredUsers.map(
                  item => (

                    <tr key={item.id}>

                      <td>

                        <div className="admin-user-table-profile">

                          <div className="admin-user-table-avatar">

                            {
                              getInitials(
                                item.full_name,
                                item.email
                              )
                            }

                          </div>

                          <div>

                            <strong>
                              {
                                item.full_name ||
                                'Sin nombre'
                              }
                            </strong>

                            <span>
                              {item.email}
                            </span>

                          </div>

                        </div>

                      </td>

                      <td>

                        <select
                          className="admin-user-role-select"
                          value={item.role}
                          disabled={
                            updatingId ===
                            item.id
                          }
                          onChange={
                            event =>
                              updateUser(
                                item,
                                {
                                  role:
                                    event
                                      .target
                                      .value,
                                }
                              )
                          }
                        >

                          <option value="USER">
                            USER
                          </option>

                          <option value="ADMIN">
                            ADMIN
                          </option>

                        </select>

                      </td>

                      <td>

                        <select
                          className={
                            `admin-user-status-select ` +
                            `${
                              item.status === 'ACTIVE'
                                ? 'active'
                                : 'inactive'
                            }`
                          }
                          value={
                            item.status
                          }
                          disabled={
                            updatingId ===
                            item.id
                          }
                          onChange={
                            event =>
                              updateUser(
                                item,
                                {
                                  status:
                                    event
                                      .target
                                      .value,
                                }
                              )
                          }
                        >

                          <option value="ACTIVE">
                            ACTIVE
                          </option>

                          <option value="INACTIVE">
                            INACTIVE
                          </option>

                        </select>

                      </td>

                      <td>

                        <div className="admin-user-attempts">

                          <strong>
                            {
                              item.attempts_count
                            }
                          </strong>

                          <span>
                            {
                              item.completed_attempts
                            }
                            {' completados'}
                          </span>

                        </div>

                      </td>

                      <td>

                        {item.best_score !== null ? (

                          <strong className="admin-user-score">

                            {
                              Number(
                                item.best_score
                              ).toFixed(0)
                            }
                            %

                          </strong>

                        ) : (

                          <span className="admin-empty-value">
                            -
                          </span>

                        )}

                      </td>

                      <td>

                        <button
                          className="admin-small-button"
                          onClick={() =>
                            navigate(
                              `/admin/users/${item.id}`
                            )
                          }
                        >
                          Ver detalle
                        </button>

                        {item.id === user?.id && (

                          <span className="admin-current-user-label">
                            Tú
                          </span>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  )
}


function UserStat({
  label,
  value,
  type = '',
}) {
  return (
    <div
      className={
        `admin-user-stat ${type}`
      }
    >

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  )
}


function getInitials(
  name,
  email
) {
  if (
    name &&
    name.trim()
  ) {

    const parts =
      name
        .trim()
        .split(/\s+/)

    if (
      parts.length >= 2
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
    email?.[0] ??
    'U'
  ).toUpperCase()
}