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

export default function AdminAttemptDetail() {
  const { attemptId } = useParams()

  const navigate = useNavigate()

  const [data, setData] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    loadAttempt()
  }, [attemptId])

  async function loadAttempt() {
    try {
      setLoading(true)
      setError('')

      const {
        data,
        error,
      } = await supabase.rpc(
        'admin_get_attempt_detail',
        {
          p_attempt_id:
            attemptId,
        }
      )

      if (error) {
        throw error
      }

      setData(data)

    } catch (err) {
      console.error(
        'Error cargando intento:',
        err
      )

      setError(
        err.message ||
        'No se pudo cargar el intento.'
      )

    } finally {
      setLoading(false)
    }
  }

  const attempt =
    data?.attempt ?? null

  const user =
    data?.user ?? null

  const course =
    data?.course ?? null

  const questions =
    data?.questions ?? []

  const duration =
    useMemo(() => {

      if (
        !attempt?.started_at ||
        !attempt?.completed_at
      ) {
        return '-'
      }

      const start =
        new Date(
          attempt.started_at
        )

      const end =
        new Date(
          attempt.completed_at
        )

      const milliseconds =
        end - start

      if (
        milliseconds < 0
      ) {
        return '-'
      }

      const totalSeconds =
        Math.floor(
          milliseconds / 1000
        )

      const minutes =
        Math.floor(
          totalSeconds / 60
        )

      const seconds =
        totalSeconds % 60

      if (
        minutes === 0
      ) {
        return `${seconds} s`
      }

      return `${minutes} min ${seconds} s`

    }, [
      attempt?.started_at,
      attempt?.completed_at,
    ])

  if (loading) {
    return (
      <div className="admin-loading">
        Cargando intento...
      </div>
    )
  }

  if (error) {
    return (
      <div>

        <section className="admin-page-heading">

          <div>

            <span className="admin-eyebrow">
              Evaluaciones
            </span>

            <h1>
              Detalle del intento
            </h1>

          </div>

        </section>

        <div className="admin-error-message">
          {error}
        </div>

      </div>
    )
  }

  if (
    !attempt ||
    !user ||
    !course
  ) {
    return null
  }

  const score =
    attempt.score !== null
      ? Number(
          attempt.score
        )
      : null

  const passingScore =
    Number(
      course.passing_score ?? 0
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
    <div>

      {/* =====================================
          HEADER
      ====================================== */}

      <section className="admin-page-heading">

        <div>

          <button
            className="admin-user-detail-back"
            onClick={() =>
              navigate(
                `/admin/users/${user.id}`
              )
            }
          >
            ← Volver al usuario
          </button>

          <span className="admin-eyebrow">
            Evaluación
          </span>

          <h1>
            Detalle del intento
          </h1>

          <p>
            Revisa el resultado,
            las respuestas seleccionadas
            y las respuestas correctas.
          </p>

        </div>

      </section>


      {/* =====================================
          INFORMACIÓN PRINCIPAL
      ====================================== */}

      <section className="admin-attempt-summary-card">

        <div className="admin-attempt-summary-main">

          <div>

            <span className="admin-attempt-label">
              Curso
            </span>

            <h2>
              {course.title}
            </h2>

          </div>

          <div className="admin-attempt-user">

            <div className="admin-attempt-avatar">
              {getInitials(
                user.full_name,
                user.email
              )}
            </div>

            <div>

              <strong>
                {user.full_name ||
                  'Sin nombre'}
              </strong>

              <span>
                {user.email}
              </span>

            </div>

          </div>

        </div>

        <div className="admin-attempt-result">

          {completed ? (

            <span
              className={
                passed
                  ? 'admin-attempt-result-badge passed'
                  : 'admin-attempt-result-badge failed'
              }
            >
              {passed
                ? 'APROBADO'
                : 'DESAPROBADO'}
            </span>

          ) : (

            <span className="admin-attempt-result-badge progress">
              EN PROGRESO
            </span>

          )}

          <strong>
            {score !== null
              ? `${score.toFixed(0)}%`
              : '-'}
          </strong>

          <small>
            Nota mínima:
            {' '}
            {passingScore.toFixed(0)}%
          </small>

        </div>

      </section>


      {/* =====================================
          MÉTRICAS
      ====================================== */}

      <section className="admin-attempt-stats">

        <AttemptStat
          label="Preguntas"
          value={
            attempt.total_questions
          }
        />

        <AttemptStat
          label="Correctas"
          value={
            attempt.correct_answers
          }
          type="success"
        />

        <AttemptStat
          label="Incorrectas"
          value={
            attempt.incorrect_answers
          }
          type="danger"
        />

        <AttemptStat
          label="Duración"
          value={
            duration
          }
        />

      </section>


      {/* =====================================
          INFORMACIÓN TEMPORAL
      ====================================== */}

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Información del intento
            </h2>

            <p>
              Datos generales de la evaluación.
            </p>

          </div>

        </div>

        <div className="admin-attempt-info-grid">

          <InfoItem
            label="Estado"
            value={
              attempt.status
            }
          />

          <InfoItem
            label="Inicio"
            value={
              formatDate(
                attempt.started_at
              )
            }
          />

          <InfoItem
            label="Finalización"
            value={
              formatDate(
                attempt.completed_at
              )
            }
          />

          <InfoItem
            label="ID del intento"
            value={
              attempt.id
            }
            mono
          />

        </div>

      </section>


      {/* =====================================
          PREGUNTAS
      ====================================== */}

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Respuestas del usuario
            </h2>

            <p>
              Revisión detallada de
              las preguntas de este intento.
            </p>

          </div>

          <span className="admin-history-count">
            {questions.length}
            {' preguntas'}
          </span>

        </div>

        {questions.length === 0 ? (

          <div className="admin-empty-state">

            No existen preguntas
            registradas para este intento.

          </div>

        ) : (

          <div className="admin-attempt-question-list">

            {questions.map(
              question => (

                <AttemptQuestion
                  key={
                    question.attempt_answer_id
                  }
                  question={
                    question
                  }
                />

              )
            )}

          </div>

        )}

      </section>

    </div>
  )
}


function AttemptQuestion({
  question,
}) {
  const options =
    question.options ?? []

  const selected =
    options.filter(
      option =>
        option.was_selected
    )

  const correct =
    options.filter(
      option =>
        option.is_correct
    )

  return (
    <article
      className={
        question.is_correct
          ? 'admin-attempt-question correct'
          : 'admin-attempt-question incorrect'
      }
    >

      <div className="admin-attempt-question-header">

        <div>

          <span>
            Pregunta {
              question.question_order
            }
          </span>

          <h3>
            {question.question_text}
          </h3>

        </div>

        <span
          className={
            question.is_correct
              ? 'admin-question-result correct'
              : 'admin-question-result incorrect'
          }
        >
          {question.is_correct
            ? 'CORRECTA'
            : 'INCORRECTA'}
        </span>

      </div>

      <div className="admin-attempt-question-meta">

        <span>
          {question.required_selections === 1
            ? 'Selección simple'
            : `Selección múltiple · ${question.required_selections} respuestas`}
        </span>

        <span>
          Respondida:
          {' '}
          {formatDate(
            question.answered_at
          )}
        </span>

      </div>


      {/* TODAS LAS OPCIONES */}

      <div className="admin-attempt-options">

        {options.map(
          option => {

            const classes = [
              'admin-attempt-option',
            ]

            if (
              option.is_correct
            ) {
              classes.push(
                'correct-option'
              )
            }

            if (
              option.was_selected
            ) {
              classes.push(
                'selected-option'
              )
            }

            if (
              option.was_selected &&
              !option.is_correct
            ) {
              classes.push(
                'wrong-selected'
              )
            }

            return (
              <div
                key={
                  option.id
                }
                className={
                  classes.join(' ')
                }
              >

                <div className="admin-attempt-option-index">
                  {
                    String.fromCharCode(
                      64 +
                      Number(
                        option.option_order
                      )
                    )
                  }
                </div>

                <span>
                  {option.option_text}
                </span>

                <div className="admin-attempt-option-flags">

                  {option.was_selected && (
                    <span className="selected-flag">
                      Seleccionada
                    </span>
                  )}

                  {option.is_correct && (
                    <span className="correct-flag">
                      Correcta
                    </span>
                  )}

                </div>

              </div>
            )
          }
        )}

      </div>


      {/* RESUMEN */}

      {!question.is_correct && (

        <div className="admin-attempt-answer-summary">

          <div>

            <span>
              Respondió
            </span>

            <strong>
              {
                selected.length > 0
                  ? selected
                      .map(
                        option =>
                          option.option_text
                      )
                      .join(', ')
                  : 'Sin respuesta'
              }
            </strong>

          </div>

          <div>

            <span>
              Respuesta correcta
            </span>

            <strong>
              {
                correct
                  .map(
                    option =>
                      option.option_text
                  )
                  .join(', ')
              }
            </strong>

          </div>

        </div>

      )}

    </article>
  )
}


function AttemptStat({
  label,
  value,
  type = '',
}) {
  return (
    <div
      className={
        `admin-attempt-stat ${type}`
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


function InfoItem({
  label,
  value,
  mono = false,
}) {
  return (
    <div className="admin-attempt-info-item">

      <span>
        {label}
      </span>

      <strong
        className={
          mono
            ? 'mono'
            : ''
        }
      >
        {value ?? '-'}
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