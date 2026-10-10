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
  exportCourseReportExcel,
  exportCourseReportPdf,
} from '../../utils/reportExport'
import {
  supabase,
} from '../../services/supabase'

export default function AdminCourseReport() {
  const { courseId } =
    useParams()

  const navigate =
    useNavigate()

  const [data, setData] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [dateFrom, setDateFrom] =
    useState('')

  const [dateTo, setDateTo] =
    useState('')

  useEffect(() => {
    loadReport()
  }, [courseId])

  async function loadReport(
    customFrom = dateFrom,
    customTo = dateTo
  ) {
    try {
      setLoading(true)
      setError('')

      const {
        data,
        error,
      } = await supabase.rpc(
        'admin_get_course_report',
        {
          p_course_id:
            courseId,

          p_date_from:
            customFrom
              ? `${customFrom}T00:00:00`
              : null,

          p_date_to:
            customTo
              ? `${customTo}T23:59:59`
              : null,
        }
      )

      if (error) {
        throw error
      }

      setData(data)

    } catch (err) {
      console.error(
        'Error reporte curso:',
        err
      )

      setError(
        err.message ||
        'No se pudo cargar el reporte.'
      )

    } finally {
      setLoading(false)
    }
  }

  function clearFilters() {
    setDateFrom('')
    setDateTo('')

    loadReport('', '')
  }

  const course =
    data?.course ?? null

  const summary =
    data?.summary ?? {}

  const distribution =
    data?.distribution ?? {}

  const timeline =
    data?.timeline ?? []

  const questions =
    data?.difficult_questions ?? []

  const users =
    data?.users ?? []

  const recentAttempts =
    data?.recent_attempts ?? []

  const topUsers =
    useMemo(
      () =>
        [...users]
          .sort(
            (a, b) =>
              Number(
                b.average_score ?? -1
              ) -
              Number(
                a.average_score ?? -1
              )
          )
          .slice(0, 10),
      [users]
    )

  const maxDistribution =
    useMemo(() => {
      return Math.max(
        Number(
          distribution.range_0_49 ?? 0
        ),
        Number(
          distribution.range_50_69 ?? 0
        ),
        Number(
          distribution.range_70_84 ?? 0
        ),
        Number(
          distribution.range_85_100 ?? 0
        ),
        1
      )
    }, [distribution])

  if (loading) {
    return (
      <div className="admin-loading">
        Cargando reporte del curso...
      </div>
    )
  }

  if (error) {
    return (
      <div>

        <div className="admin-error-message">
          {error}
        </div>

        <button
          className="admin-outline-button"
          onClick={() =>
            navigate(
              '/admin/reports'
            )
          }
        >
          Volver
        </button>

      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div>

      {/* HEADER */}

      <section className="admin-page-heading">

        <div>

          <button
            className="admin-user-detail-back"
            onClick={() =>
              navigate(
                '/admin/reports'
              )
            }
          >
            ← Volver a reportes
          </button>

          <span className="admin-eyebrow">
            Analítica por curso
          </span>

          <h1>
            {course.title}
          </h1>

          <p>
            Analiza el rendimiento,
            comportamiento de los usuarios
            y dificultad de las preguntas.
          </p>

        </div>

        <div className="admin-page-actions">

  <button
    className="admin-outline-button"
    onClick={() =>
      navigate(
        `/admin/courses/${course.id}/questions`
      )
    }
  >
    Ver preguntas
  </button>

  <button
    className="admin-outline-button"
    onClick={() =>
      exportCourseReportExcel({
        data,
        dateFrom,
        dateTo,
      })
    }
  >
    ↓ Excel
  </button>

  <button
    className="admin-outline-button"
    onClick={() =>
      exportCourseReportPdf({
        data,
        dateFrom,
        dateTo,
      })
    }
  >
    ↓ PDF
  </button>

</div>

      </section>


      {/* FILTERS */}

      <section className="admin-report-filters">

        <div className="admin-field">

          <label>
            Desde
          </label>

          <input
            type="date"
            value={dateFrom}
            onChange={
              event =>
                setDateFrom(
                  event.target.value
                )
            }
          />

        </div>

        <div className="admin-field">

          <label>
            Hasta
          </label>

          <input
            type="date"
            value={dateTo}
            onChange={
              event =>
                setDateTo(
                  event.target.value
                )
            }
          />

        </div>

        <button
          className="admin-primary-button"
          onClick={() =>
            loadReport()
          }
        >
          Aplicar
        </button>

        <button
          className="admin-outline-button"
          onClick={
            clearFilters
          }
        >
          Limpiar
        </button>

      </section>


      {/* STATS */}

      <section className="admin-course-report-stats">

        <CourseReportStat
          label="Intentos"
          value={
            Number(
              summary.attempts ?? 0
            )
          }
        />

        <CourseReportStat
          label="Usuarios"
          value={
            Number(
              summary.users ?? 0
            )
          }
        />

        <CourseReportStat
          label="Promedio"
          value={
            summary.average_score != null
              ? `${Number(
                  summary.average_score
                ).toFixed(1)}%`
              : '-'
          }
          type="score"
        />

        <CourseReportStat
          label="Aprobación"
          value={
            `${Number(
              summary.approval_rate ?? 0
            ).toFixed(1)}%`
          }
          type="success"
        />

        <CourseReportStat
          label="Mejor nota"
          value={
            summary.best_score != null
              ? `${Number(
                  summary.best_score
                ).toFixed(0)}%`
              : '-'
          }
        />

        <CourseReportStat
          label="Menor nota"
          value={
            summary.worst_score != null
              ? `${Number(
                  summary.worst_score
                ).toFixed(0)}%`
              : '-'
          }
          type="danger"
        />

      </section>


      {/* DISTRIBUTION + TIMELINE */}

      <section className="admin-course-report-grid">

        <article className="admin-panel">

          <div className="admin-panel-heading">

            <div>
              <h2>
                Distribución de puntajes
              </h2>

              <p>
                Cantidad de evaluaciones
                según rango de nota.
              </p>
            </div>

          </div>

          <div className="admin-score-distribution">

            <DistributionRow
              label="0 - 49%"
              value={
                Number(
                  distribution.range_0_49 ?? 0
                )
              }
              max={
                maxDistribution
              }
            />

            <DistributionRow
              label="50 - 69%"
              value={
                Number(
                  distribution.range_50_69 ?? 0
                )
              }
              max={
                maxDistribution
              }
            />

            <DistributionRow
              label="70 - 84%"
              value={
                Number(
                  distribution.range_70_84 ?? 0
                )
              }
              max={
                maxDistribution
              }
            />

            <DistributionRow
              label="85 - 100%"
              value={
                Number(
                  distribution.range_85_100 ?? 0
                )
              }
              max={
                maxDistribution
              }
            />

          </div>

        </article>


        <article className="admin-panel">

          <div className="admin-panel-heading">

            <div>

              <h2>
                Evolución de resultados
              </h2>

              <p>
                Promedio por día.
              </p>

            </div>

          </div>

          {timeline.length === 0 ? (

            <div className="admin-empty-state">
              Sin datos suficientes.
            </div>

          ) : (

            <div className="admin-timeline-list">

              {timeline
                .slice(-12)
                .map(
                  item => (

                    <div
                      key={
                        item.date
                      }
                      className="admin-timeline-item"
                    >

                      <span>
                        {formatSimpleDate(
                          item.date
                        )}
                      </span>

                      <div className="admin-timeline-track">

                        <div
                          className="admin-timeline-value"
                          style={{
                            width:
                              `${Math.min(
                                Number(
                                  item.average_score ?? 0
                                ),
                                100
                              )}%`,
                          }}
                        />

                      </div>

                      <strong>
                        {
                          Number(
                            item.average_score ?? 0
                          ).toFixed(1)
                        }
                        %
                      </strong>

                      <small>
                        {
                          item.attempts
                        }
                        {' int.'}
                      </small>

                    </div>

                  )
                )}

            </div>

          )}

        </article>

      </section>


      {/* QUESTIONS */}

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Preguntas con mayor dificultad
            </h2>

            <p>
              Ordenadas por porcentaje
              de respuestas incorrectas.
            </p>

          </div>

        </div>

        {questions.length === 0 ? (

          <div className="admin-empty-state">
            No existen suficientes respuestas
            para calcular dificultad.
          </div>

        ) : (

          <div className="admin-course-question-report-list">

            {questions.map(
              (
                question,
                index
              ) => (

                <div
                  key={
                    question.question_id
                  }
                  className="admin-course-question-report"
                >

                  <div className="admin-difficult-rank">
                    {index + 1}
                  </div>

                  <div className="admin-course-question-report-content">

                    <strong>
                      {
                        question.question_text
                      }
                    </strong>

                    <span>
                      {
                        question.incorrect
                      }
                      {' incorrectas de '}
                      {
                        question.answers
                      }
                      {' respuestas'}
                    </span>

                  </div>

                  <div className="admin-course-question-error">

                    <strong>
                      {
                        Number(
                          question.error_rate ?? 0
                        ).toFixed(1)
                      }
                      %
                    </strong>

                    <span>
                      error
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* USERS */}

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Rendimiento de usuarios
            </h2>

            <p>
              Usuarios ordenados por
              promedio de evaluación.
            </p>

          </div>

        </div>

        {topUsers.length === 0 ? (

          <div className="admin-empty-state">
            No existen usuarios con
            actividad en este curso.
          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-report-table">

              <thead>

                <tr>
                  <th>Usuario</th>
                  <th>Intentos</th>
                  <th>Completados</th>
                  <th>Promedio</th>
                  <th>Mejor</th>
                  <th>Último</th>
                  <th>Acción</th>
                </tr>

              </thead>

              <tbody>

                {topUsers.map(
                  user => (

                    <tr
                      key={
                        user.user_id
                      }
                    >

                      <td>

                        <strong>
                          {
                            user.full_name ||
                            user.email
                          }
                        </strong>

                        <div className="admin-report-secondary">
                          {user.email}
                        </div>

                      </td>

                      <td>
                        {user.attempts}
                      </td>

                      <td>
                        {user.completed}
                      </td>

                      <td>
                        {formatScore(
                          user.average_score
                        )}
                      </td>

                      <td>
                        {formatScore(
                          user.best_score
                        )}
                      </td>

                      <td>
                        {formatScore(
                          user.last_score
                        )}
                      </td>

                      <td>

                        <button
                          className="admin-small-button"
                          onClick={() =>
                            navigate(
                              `/admin/users/${user.user_id}`
                            )
                          }
                        >
                          Ver usuario
                        </button>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* RECENT ATTEMPTS */}

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Actividad reciente
            </h2>

            <p>
              Últimos intentos registrados
              en este curso.
            </p>

          </div>

        </div>

        {recentAttempts.length === 0 ? (

          <div className="admin-empty-state">
            Sin intentos registrados.
          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-report-table">

              <thead>

                <tr>
                  <th>Fecha</th>
                  <th>Usuario</th>
                  <th>Estado</th>
                  <th>Puntaje</th>
                  <th>Acción</th>
                </tr>

              </thead>

              <tbody>

                {recentAttempts.map(
                  attempt => (

                    <tr
                      key={
                        attempt.attempt_id
                      }
                    >

                      <td>
                        {formatDate(
                          attempt.started_at
                        )}
                      </td>

                      <td>

                        <strong>
                          {
                            attempt.full_name ||
                            attempt.email
                          }
                        </strong>

                      </td>

                      <td>

                        <span
                          className={
                            attempt.status === 'COMPLETED'
                              ? 'admin-attempt-status completed'
                              : 'admin-attempt-status progress'
                          }
                        >
                          {
                            attempt.status === 'COMPLETED'
                              ? 'COMPLETADO'
                              : 'EN PROGRESO'
                          }
                        </span>

                      </td>

                      <td>
                        {formatScore(
                          attempt.score
                        )}
                      </td>

                      <td>

                        <button
                          className="admin-small-button"
                          onClick={() =>
                            navigate(
                              `/admin/attempts/${attempt.attempt_id}`
                            )
                          }
                        >
                          Ver intento
                        </button>

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


function CourseReportStat({
  label,
  value,
  type = '',
}) {
  return (
    <div
      className={
        `admin-course-report-stat ${type}`
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


function DistributionRow({
  label,
  value,
  max,
}) {
  const width =
    max > 0
      ? (value / max) * 100
      : 0

  return (
    <div className="admin-distribution-row">

      <span>
        {label}
      </span>

      <div className="admin-distribution-track">

        <div
          className="admin-distribution-value"
          style={{
            width:
              `${width}%`,
          }}
        />

      </div>

      <strong>
        {value}
      </strong>

    </div>
  )
}


function formatScore(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return '-'
  }

  return `${Number(value).toFixed(1)}%`
}


function formatSimpleDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat(
    'es-PE',
    {
      day: '2-digit',
      month: 'short',
    }
  ).format(
    new Date(
      `${value}T00:00:00`
    )
  )
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