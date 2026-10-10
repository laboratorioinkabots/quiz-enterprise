import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  supabase,
} from '../services/supabase'

import {
  useAuth,
} from '../context/AuthContext'
import PlatformHeader
  from '../components/platform/PlatformHeader'
export default function AttemptHistory() {
  const {
    courseId,
  } = useParams()

  const navigate =
    useNavigate()

  const {
    user,
    profile,
    signOut,
  } = useAuth()

  const [course, setCourse] =
    useState(null)

  const [attempts, setAttempts] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    loadHistory()
  }, [courseId])

  async function loadHistory() {
    try {
      setLoading(true)
      setError('')

      const {
        data,
        error,
      } = await supabase.rpc(
        'get_attempt_history',
        {
          p_course_id: courseId,
        }
      )

      if (error) {
        throw error
      }

      setCourse(
        data?.course ?? null
      )

      setAttempts(
        data?.attempts ?? []
      )

    } catch (err) {
      console.error(
        'Error cargando historial:',
        err
      )

      setError(
        err.message ||
        'No se pudo cargar el historial.'
      )

    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await signOut()

    navigate(
      '/',
      {
        replace: true,
      }
    )
  }

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-loading">
          Cargando historial...
        </div>
      </div>
    )
  }

  return (
    <div className="history-page">
      <PlatformHeader
        showBack
        backTo="/courses"
      />

      <main className="history-main">

        <div className="history-container">

          <button
            type="button"
            className="history-back"
            onClick={() =>
              navigate('/courses')
            }
          >
            ← Volver a cursos
          </button>


          <section className="history-heading">

            <div>
              <span className="history-eyebrow">
                Historial
              </span>

              <h1>
                {course?.title ||
                  'Historial de intentos'}
              </h1>

              <p>
                Revisa tus evaluaciones anteriores
                y compara tu evolución.
              </p>
            </div>

            <div className="history-heading-stat">

              <strong>
                {attempts.length}
              </strong>

              <span>
                intentos
              </span>

            </div>

          </section>


          {error && (
            <div className="history-error">
              {error}
            </div>
          )}


          {attempts.length === 0 ? (

            <div className="history-empty">

              <div className="history-empty-icon">
                ◷
              </div>

              <h2>
                Aún no tienes intentos
              </h2>

              <p>
                Realiza tu primera evaluación
                para comenzar a registrar resultados.
              </p>

            </div>

          ) : (

            <section className="history-list">

              {attempts.map(
                (
                  attempt,
                  index
                ) => {

                  const score =
                    attempt.score != null
                      ? Number(
                          attempt.score
                        )
                      : null

                  const passingScore =
                    Number(
                      course?.passing_score ?? 0
                    )

                  const passed =
                    attempt.status === 'COMPLETED' &&
                    score != null &&
                    score >= passingScore

                  return (
                    <article
                      key={attempt.id}
                      className="history-card"
                    >

                      <div className="history-card-index">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          '0'
                        )}
                      </div>


                      <div className="history-card-main">

                        <div className="history-card-top">

                          <div>

                            <span>
                              Intento
                            </span>

                            <strong>
                              {formatDate(
                                attempt.started_at
                              )}
                            </strong>

                          </div>

                          <span
                            className={
                              passed
                                ? 'history-result-badge passed'
                                : attempt.status === 'COMPLETED'
                                  ? 'history-result-badge failed'
                                  : 'history-result-badge progress'
                            }
                          >
                            {attempt.status === 'COMPLETED'
                              ? passed
                                ? 'APROBADO'
                                : 'DESAPROBADO'
                              : 'EN PROGRESO'}
                          </span>

                        </div>


                        <div className="history-card-metrics">

                          <HistoryMetric
                            label="Puntaje"
                            value={
                              score != null
                                ? `${score.toFixed(0)}%`
                                : '-'
                            }
                          />

                          <HistoryMetric
                            label="Correctas"
                            value={
                              attempt.correct_answers ??
                              '-'
                            }
                          />

                          <HistoryMetric
                            label="Incorrectas"
                            value={
                              attempt.incorrect_answers ??
                              '-'
                            }
                          />

                          <HistoryMetric
                            label="Preguntas"
                            value={
                              attempt.total_questions ??
                              '-'
                            }
                          />

                        </div>


                        <div className="history-card-actions">

                          {attempt.status === 'COMPLETED' ? (

                            <button
                              type="button"
                              className="history-primary-action"
                              onClick={() =>
                                navigate(
                                  `/results/${attempt.id}`
                                )
                              }
                            >
                              Ver resultado
                              <span>→</span>
                            </button>

                          ) : (

                            <button
                              type="button"
                              className="history-primary-action"
                              onClick={() =>
                                navigate(
                                  `/exam/${attempt.id}`
                                )
                              }
                            >
                              Continuar intento
                              <span>→</span>
                            </button>

                          )}

                        </div>

                      </div>

                    </article>
                  )
                }
              )}

            </section>

          )}

        </div>

      </main>

    </div>
  )
}


function HistoryMetric({
  label,
  value,
}) {
  return (
    <div className="history-metric">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
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


function getInitials(
  fullName,
  email
) {
  if (fullName?.trim()) {
    const parts =
      fullName
        .trim()
        .split(/\s+/)

    if (parts.length > 1) {
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