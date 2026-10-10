import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
} from 'react-router-dom'
import {
  exportGlobalReportExcel,
  exportGlobalReportPdf,
} from '../../utils/reportExport'
import {
  supabase,
} from '../../services/supabase'

export default function AdminReports() {
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
  const navigate = useNavigate() 
  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    try {
      setLoading(true)
      setError('')

      const {
        data,
        error,
      } = await supabase.rpc(
        'admin_get_reports',
        {
          p_date_from:
            dateFrom
              ? `${dateFrom}T00:00:00`
              : null,

          p_date_to:
            dateTo
              ? `${dateTo}T23:59:59`
              : null,
        }
      )

      if (error) {
        throw error
      }

      setData(data)

    } catch (err) {
      console.error(
        'Error cargando reportes:',
        err
      )

      setError(
        err.message ||
        'No se pudieron cargar los reportes.'
      )

    } finally {
      setLoading(false)
    }
  }

  const summary =
    data?.summary ?? {}

  const courses =
    data?.courses ?? []

  const users =
    data?.users ?? []

  const difficultQuestions =
    data?.difficult_questions ?? []

  const topUsers =
    useMemo(
      () =>
        [...users]
          .sort(
            (a, b) =>
              Number(b.attempts ?? 0) -
              Number(a.attempts ?? 0)
          )
          .slice(0, 10),
      [users]
    )

  if (loading) {
    return (
      <div className="admin-loading">
        Cargando reportes...
      </div>
    )
  }

  return (
    
    <div>
<div className="admin-page-actions">

  <button
    className="admin-outline-button"
    disabled={!data}
    onClick={() =>
      exportGlobalReportExcel({
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
    disabled={!data}
    onClick={() =>
      exportGlobalReportPdf({
        data,
        dateFrom,
        dateTo,
      })
    }
  >
    ↓ PDF
  </button>

</div>
      <section className="admin-page-heading">

        <div>

          <span className="admin-eyebrow">
            Analítica
          </span>

          <h1>
            Reportes
          </h1>

          <p>
            Analiza resultados,
            rendimiento por curso y
            comportamiento de las evaluaciones.
          </p>

        </div>

      </section>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

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
          onClick={loadReports}
        >
          Aplicar filtros
        </button>

        <button
          className="admin-outline-button"
          onClick={() => {
            setDateFrom('')
            setDateTo('')

            setTimeout(
              loadReports,
              0
            )
          }}
        >
          Limpiar
        </button>

      </section>


      {/* RESUMEN */}

      <section className="admin-report-stats">

        <ReportStat
          label="Intentos"
          value={
            Number(
              summary.attempts ?? 0
            )
          }
        />

        <ReportStat
          label="Completados"
          value={
            Number(
              summary.completed ?? 0
            )
          }
          type="success"
        />

        <ReportStat
          label="Promedio"
          value={
            summary.average_score !== null &&
            summary.average_score !== undefined
              ? `${Number(
                  summary.average_score
                ).toFixed(1)}%`
              : '-'
          }
        />

        <ReportStat
          label="Tasa de aprobación"
          value={
            `${Number(
              summary.approval_rate ?? 0
            ).toFixed(1)}%`
          }
          type="score"
        />

      </section>


      {/* CURSOS */}

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Resultados por curso
            </h2>

            <p>
              Comparativa de actividad
              y aprobación.
            </p>

          </div>

        </div>

        <div className="admin-table-wrapper">

          <table className="admin-report-table">

            <thead>

              <tr>
                <th>Curso</th>
                <th>Intentos</th>
                <th>Completados</th>
                <th>Promedio</th>
                <th>Aprobación</th>
                <th>Acción</th>
              </tr>

            </thead>

            <tbody>

              {courses.map(
                course => (

                  <tr
                    key={
                      course.course_id
                    }
                  >

                    <td>
                      <strong>
                        {course.course_title}
                      </strong>
                    </td>

                    <td>
                      {course.attempts}
                    </td>

                    <td>
                      {course.completed}
                    </td>

                    <td>
                      {course.average_score !== null
                        ? `${Number(
                            course.average_score
                          ).toFixed(1)}%`
                        : '-'}
                    </td>

                    <td>

                      <ApprovalBadge
                        value={
                          Number(
                            course.approval_rate ?? 0
                          )
                        }
                      />

                    </td>
                    <td>

                    <button
                        className="admin-small-button"
                        onClick={() =>
                        navigate(
                            `/admin/reports/courses/${course.course_id}`
                        )
                        }
                    >
                        Ver análisis
                    </button>

                    </td>
                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* GRID */}

      <section className="admin-report-grid">

        <article className="admin-panel">

          <div className="admin-panel-heading">

            <div>

              <h2>
                Preguntas con más errores
              </h2>

              <p>
                Preguntas que requieren
                mayor revisión.
              </p>

            </div>

          </div>

          {difficultQuestions.length === 0 ? (

            <div className="admin-empty-state">
              Sin datos suficientes.
            </div>

          ) : (

            <div className="admin-difficult-list">

              {difficultQuestions
                .slice(0, 10)
                .map(
                  (
                    question,
                    index
                  ) => (

                    <div
                      key={
                        question.question_id
                      }
                      className="admin-difficult-item"
                    >

                      <div className="admin-difficult-rank">
                        {index + 1}
                      </div>

                      <div className="admin-difficult-content">

                        <strong>
                          {
                            question.question_text
                          }
                        </strong>

                        <span>
                          {question.course_title}
                          {' · '}
                          {question.incorrect}
                          {' errores de '}
                          {question.answers}
                          {' respuestas'}
                        </span>

                      </div>

                      <span className="admin-error-rate">
                        {
                          Number(
                            question.error_rate ?? 0
                          ).toFixed(1)
                        }
                        %
                      </span>

                    </div>

                  )
                )}

            </div>

          )}

        </article>


        <article className="admin-panel">

          <div className="admin-panel-heading">

            <div>

              <h2>
                Usuarios con más intentos
              </h2>

              <p>
                Usuarios con mayor actividad.
              </p>

            </div>

          </div>

          {topUsers.length === 0 ? (

            <div className="admin-empty-state">
              Sin actividad registrada.
            </div>

          ) : (

            <div className="admin-report-user-list">

              {topUsers.map(
                (
                  user,
                  index
                ) => (

                  <div
                    key={user.user_id}
                    className="admin-report-user"
                  >

                    <div className="admin-difficult-rank">
                      {index + 1}
                    </div>

                    <div>

                      <strong>
                        {user.full_name ||
                          user.email}
                      </strong>

                      <span>
                        {user.completed}
                        {' completados'}
                      </span>

                    </div>

                    <strong>
                      {user.attempts}
                    </strong>

                  </div>

                )
              )}

            </div>

          )}

        </article>

      </section>

    </div>
  )
}


function ReportStat({
  label,
  value,
  type = '',
}) {
  return (
    <div
      className={
        `admin-report-stat ${type}`
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


function ApprovalBadge({
  value,
}) {
  let className =
    'admin-approval-badge'

  if (value >= 70) {
    className += ' high'
  } else if (value >= 50) {
    className += ' medium'
  } else {
    className += ' low'
  }

  return (
    <span className={className}>
      {value.toFixed(1)}%
    </span>
  )
}