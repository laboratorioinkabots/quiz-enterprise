import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  supabase,
} from '../../services/supabase'

export default function AdminUserDetail() {
  const { userId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    loadUserDetail()
  }, [userId])

  async function loadUserDetail() {
    try {
      setLoading(true)
      setError('')

      const {
        data,
        error,
      } = await supabase.rpc(
        'admin_get_user_detail',
        {
          p_user_id: userId,
        }
      )

      if (error) {
        throw error
      }

      setData(data)

    } catch (err) {
      console.error(
        'Error cargando detalle usuario:',
        err
      )

      setError(
        err.message ||
        'No se pudo cargar la información del usuario.'
      )

    } finally {
      setLoading(false)
    }
  }

  const user =
    data?.user ?? null

  const summary =
    data?.summary ?? {}

  const courses =
    data?.courses ?? []

  const attempts =
    data?.attempts ?? []

  const completedAttempts =
    useMemo(
      () =>
        attempts.filter(
          item =>
            item.status === 'COMPLETED'
        ),
      [attempts]
    )

  if (loading) {
    return (
      <div className="admin-loading">
        Cargando usuario...
      </div>
    )
  }

  if (error) {
    return (
      <div>

        <section className="admin-page-heading">

          <div>
            <span className="admin-eyebrow">
              Usuarios
            </span>

            <h1>
              Detalle de usuario
            </h1>
          </div>

        </section>

        <div className="admin-error-message">
          {error}
        </div>

        <button
          className="admin-outline-button"
          onClick={() =>
            navigate('/admin/users')
          }
        >
          Volver a usuarios
        </button>

      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div>

      {/* ====================================
          HEADER
      ===================================== */}

      <section className="admin-user-detail-header">

        <div className="admin-user-detail-profile">

          <div className="admin-user-detail-avatar">
            {getInitials(
              user.full_name,
              user.email
            )}
          </div>

          <div>

            <button
              className="admin-user-detail-back"
              onClick={() =>
                navigate('/admin/users')
              }
            >
              ← Volver a usuarios
            </button>

            <h1>
              {user.full_name ||
                'Usuario sin nombre'}
            </h1>

            <span className="admin-user-detail-email">
              {user.email}
            </span>

            <div className="admin-user-detail-badges">

              <span
                className={
                  user.role === 'ADMIN'
                    ? 'admin-user-role-badge admin-user-role-admin'
                    : 'admin-user-role-badge'
                }
              >
                {user.role}
              </span>

              <span
                className={
                  user.status === 'ACTIVE'
                    ? 'admin-user-status-badge active'
                    : 'admin-user-status-badge inactive'
                }
              >
                {user.status}
              </span>

            </div>

          </div>

        </div>

        <div className="admin-user-detail-meta">

          <span>
            Registrado
          </span>

          <strong>
            {formatDate(
              user.created_at
            )}
          </strong>

        </div>

      </section>


      {/* ====================================
          RESUMEN
      ===================================== */}

      <section className="admin-user-detail-stats">

        <DetailStat
          label="Cursos realizados"
          value={
            Number(
              summary.courses ?? 0
            )
          }
        />

        <DetailStat
          label="Intentos"
          value={
            Number(
              summary.attempts ?? 0
            )
          }
        />

        <DetailStat
          label="Completados"
          value={
            Number(
              summary.completed ?? 0
            )
          }
          type="success"
        />

        <DetailStat
          label="Mejor puntaje"
          value={
            summary.best_score !== null &&
            summary.best_score !== undefined
              ? `${Number(
                  summary.best_score
                ).toFixed(0)}%`
              : '-'
          }
          type="score"
        />

      </section>


      {/* ====================================
          RENDIMIENTO POR CURSO
      ===================================== */}

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Rendimiento por curso
            </h2>

            <p>
              Resumen de actividad y
              resultados del usuario.
            </p>

          </div>

        </div>

        {courses.length === 0 ? (

          <div className="admin-empty-state">

            <h3>
              Sin actividad académica
            </h3>

            <p>
              El usuario todavía no ha
              realizado evaluaciones.
            </p>

          </div>

        ) : (

          <div className="admin-user-course-grid">

            {courses.map(course => {

              const bestScore =
                course.best_score !== null
                  ? Number(
                      course.best_score
                    )
                  : null

              const lastScore =
                course.last_score !== null
                  ? Number(
                      course.last_score
                    )
                  : null

              const passingScore =
                Number(
                  course.passing_score ?? 0
                )

              return (
                <article
                  key={course.course_id}
                  className="admin-user-course-card"
                >

                  <div className="admin-user-course-heading">

                    <div>

                      <span>
                        Curso
                      </span>

                      <h3>
                        {course.course_title}
                      </h3>

                    </div>

                    {lastScore !== null && (

                      <span
                        className={
                          lastScore >=
                          passingScore
                            ? 'admin-course-result passed'
                            : 'admin-course-result failed'
                        }
                      >
                        {lastScore >=
                        passingScore
                          ? 'APROBADO'
                          : 'DESAPROBADO'}
                      </span>

                    )}

                  </div>

                  <div className="admin-user-course-metrics">

                    <CourseMetric
                      label="Intentos"
                      value={
                        course.attempts
                      }
                    />

                    <CourseMetric
                      label="Completados"
                      value={
                        course.completed
                      }
                    />

                    <CourseMetric
                      label="Mejor nota"
                      value={
                        bestScore !== null
                          ? `${bestScore.toFixed(0)}%`
                          : '-'
                      }
                    />

                    <CourseMetric
                      label="Última nota"
                      value={
                        lastScore !== null
                          ? `${lastScore.toFixed(0)}%`
                          : '-'
                      }
                    />

                  </div>

                  <div className="admin-user-course-footer">

                    <span>
                      Nota mínima:
                    </span>

                    <strong>
                      {passingScore.toFixed(0)}%
                    </strong>

                  </div>

                </article>
              )
            })}

          </div>

        )}

      </section>


      {/* ====================================
          HISTORIAL
      ===================================== */}

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Historial de evaluaciones
            </h2>

            <p>
              Todos los intentos realizados
              por este usuario.
            </p>

          </div>

          <span className="admin-history-count">
            {attempts.length}
            {' intentos'}
          </span>

        </div>

        {attempts.length === 0 ? (

          <div className="admin-empty-state">
            No existen evaluaciones registradas.
          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-user-history-table">

              <thead>

                <tr>
                  <th>
                    Fecha
                  </th>

                  <th>
                    Curso
                  </th>

                  <th>
                    Estado
                  </th>

                  <th>
                    Correctas
                  </th>

                  <th>
                    Incorrectas
                  </th>

                  <th>
                    Puntaje
                  </th>

                  <th>
                    Resultado
                  </th>

                  <th>
                    Acción
                  </th>
                </tr>

              </thead>

              <tbody>

                {attempts.map(attempt => {

                  const score =
                    attempt.score !== null
                      ? Number(
                          attempt.score
                        )
                      : null

                  const passingScore =
                    Number(
                      attempt.passing_score ?? 0
                    )

                  const completed =
                    attempt.status ===
                    'COMPLETED'

                  const passed =
                    completed &&
                    score !== null &&
                    score >=
                    passingScore

                  return (
                    <tr key={attempt.id}>

                      <td>
                        {formatDate(
                          attempt.started_at
                        )}
                      </td>

                      <td>

                        <strong>
                          {attempt.course_title}
                        </strong>

                      </td>

                      <td>

                        {completed ? (

                          <span className="admin-attempt-status completed">
                            COMPLETADO
                          </span>

                        ) : (

                          <span className="admin-attempt-status progress">
                            EN PROGRESO
                          </span>

                        )}

                      </td>

                      <td>
                        {
                          attempt.correct_answers
                        }
                      </td>

                      <td>
                        {
                          attempt.incorrect_answers
                        }
                      </td>

                      <td>

                        {score !== null
                          ? `${score.toFixed(0)}%`
                          : '-'}

                      </td>

                      <td>

                        {!completed ? (

                          <span className="admin-empty-value">
                            -
                          </span>

                        ) : (

                          <span
                            className={
                              passed
                                ? 'admin-history-result passed'
                                : 'admin-history-result failed'
                            }
                          >
                            {passed
                              ? 'APROBADO'
                              : 'DESAPROBADO'}
                          </span>

                        )}

                      </td>

                      <td>

                        {completed ? (

                          <button
                            className="admin-small-button"
                            onClick={() =>
                            navigate(
                                `/admin/attempts/${attempt.id}`
                            )
                            }
                          >
                            Ver resultado
                          </button>

                        ) : (

                          <span className="admin-empty-value">
                            -
                          </span>

                        )}

                      </td>

                    </tr>
                  )
                })}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  )
}


function DetailStat({
  label,
  value,
  type = '',
}) {
  return (
    <div
      className={
        `admin-user-detail-stat ${type}`
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


function CourseMetric({
  label,
  value,
}) {
  return (
    <div className="admin-user-course-metric">

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


function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'es-PE',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  ).format(
    new Date(value)
  )
}