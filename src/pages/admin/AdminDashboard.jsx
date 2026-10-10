import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import { supabase } from '../../services/supabase'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    courses: 0,
    questions: 0,
    users: 0,
    attempts: 0,
  })

  const [recentAttempts, setRecentAttempts] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')

      const [
        coursesResult,
        questionsResult,
        usersResult,
        attemptsResult,
        recentResult,
      ] = await Promise.all([

        supabase
          .from('courses')
          .select(
            '*',
            {
              count: 'exact',
              head: true,
            }
          ),

        supabase
          .from('questions')
          .select(
            '*',
            {
              count: 'exact',
              head: true,
            }
          ),

        supabase
          .from('profiles')
          .select(
            '*',
            {
              count: 'exact',
              head: true,
            }
          ),

        supabase
          .from('attempts')
          .select(
            '*',
            {
              count: 'exact',
              head: true,
            }
          ),

        supabase
          .from('attempts')
          .select(`
            id,
            status,
            score,
            started_at,
            completed_at,
            user_id,
            course_id
          `)
          .order(
            'started_at',
            {
              ascending: false,
            }
          )
          .limit(5),
      ])

      const results = [
        coursesResult,
        questionsResult,
        usersResult,
        attemptsResult,
        recentResult,
      ]

      const failed =
        results.find(
          result => result.error
        )

      if (failed?.error) {
        throw failed.error
      }

      setStats({
        courses:
          coursesResult.count ?? 0,

        questions:
          questionsResult.count ?? 0,

        users:
          usersResult.count ?? 0,

        attempts:
          attemptsResult.count ?? 0,
      })

      setRecentAttempts(
        recentResult.data ?? []
      )
    } catch (err) {
      console.error(
        'Error dashboard:',
        err
      )

      setError(
        err.message ||
          'No se pudo cargar el dashboard.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        Cargando dashboard...
      </div>
    )
  }

  return (
    <div>

      <section className="admin-page-heading">

        <div>

          <span className="admin-eyebrow">
            Resumen general
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Supervisa la actividad principal
            de la plataforma de evaluaciones.
          </p>

        </div>

        <button
          className="admin-primary-button"
          onClick={() =>
            navigate('/admin/courses')
          }
        >
          Administrar cursos
        </button>

      </section>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      <section className="admin-dashboard-stats">

        <DashboardStat
          label="Cursos"
          value={stats.courses}
          description="Cursos registrados"
          icon="▣"
          onClick={() =>
            navigate('/admin/courses')
          }
        />

        <DashboardStat
          label="Preguntas"
          value={stats.questions}
          description="Banco de preguntas"
          icon="?"
          onClick={() =>
            navigate('/admin/questions')
          }
        />

        <DashboardStat
          label="Usuarios"
          value={stats.users}
          description="Usuarios registrados"
          icon="◎"
          onClick={() =>
            navigate('/admin/users')
          }
        />

        <DashboardStat
          label="Intentos"
          value={stats.attempts}
          description="Evaluaciones iniciadas"
          icon="✓"
        />

      </section>

      <section className="admin-dashboard-grid">

        <article className="admin-dashboard-panel">

          <div className="admin-dashboard-panel-header">

            <div>
              <h2>
                Acciones rápidas
              </h2>

              <p>
                Accesos frecuentes de
                administración.
              </p>
            </div>

          </div>

          <div className="admin-quick-actions">

            <QuickAction
              title="Crear curso"
              description={
                'Registra un nuevo curso y configura su evaluación.'
              }
              icon="+"
              onClick={() =>
                navigate(
                  '/admin/courses/new'
                )
              }
            />

            <QuickAction
              title="Crear pregunta"
              description={
                'Agrega una nueva pregunta manualmente.'
              }
              icon="?"
              onClick={() =>
                navigate(
                  '/admin/questions/new'
                )
              }
            />

            <QuickAction
              title="Importar preguntas"
              description={
                'Carga un conjunto de preguntas desde Excel.'
              }
              icon="↑"
              onClick={() =>
                navigate('/admin/import')
              }
            />

            <QuickAction
              title="Administrar usuarios"
              description={
                'Gestiona roles y estado de los usuarios.'
              }
              icon="◎"
              onClick={() =>
                navigate('/admin/users')
              }
            />

          </div>

        </article>

        <article className="admin-dashboard-panel">

          <div className="admin-dashboard-panel-header">

            <div>
              <h2>
                Actividad reciente
              </h2>

              <p>
                Últimos intentos registrados.
              </p>
            </div>

          </div>

          {recentAttempts.length === 0 ? (

            <div className="admin-empty-panel">
              No existen intentos todavía.
            </div>

          ) : (

            <div className="admin-recent-list">

              {recentAttempts.map(
                attempt => (

                  <div
                    key={attempt.id}
                    className="admin-recent-item"
                  >

                    <div
                      className="admin-recent-indicator"
                    />

                    <div className="admin-recent-content">

                      <strong>
                        Evaluación
                      </strong>

                      <span>
                        {formatDate(
                          attempt.started_at
                        )}
                      </span>

                    </div>

                    <div>

                      {attempt.status ===
                      'COMPLETED' ? (

                        <span className="admin-score-chip">
                          {Number(
                            attempt.score ?? 0
                          ).toFixed(0)}
                          %
                        </span>

                      ) : (

                        <span className="admin-progress-chip">
                          En progreso
                        </span>

                      )}

                    </div>

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

function DashboardStat({
  label,
  value,
  description,
  icon,
  onClick,
}) {
  return (
    <button
      className="admin-dashboard-stat"
      onClick={onClick}
    >

      <div className="admin-dashboard-stat-top">

        <div className="admin-dashboard-stat-icon">
          {icon}
        </div>

        <span>
          {label}
        </span>

      </div>

      <strong>
        {value}
      </strong>

      <p>
        {description}
      </p>

    </button>
  )
}

function QuickAction({
  title,
  description,
  icon,
  onClick,
}) {
  return (
    <button
      className="admin-quick-action"
      onClick={onClick}
    >

      <div className="admin-quick-icon">
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

      <span className="admin-quick-arrow">
        →
      </span>

    </button>
  )
}

function formatDate(value) {
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