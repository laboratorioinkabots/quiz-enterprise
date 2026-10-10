import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import { supabase } from '../services/supabase'
import PlatformHeader
  from '../components/platform/PlatformHeader'
export default function Results() {
  const { attemptId } = useParams()
  const navigate = useNavigate()

  const [attempt, setAttempt] = useState(null)
  const [course, setCourse] = useState(null)
  const [reviewRows, setReviewRows] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadResult()
  }, [attemptId])

  async function loadResult() {
    try {
      setLoading(true)
      setError('')

      // ==========================================
      // 1. OBTENER EL INTENTO
      // ==========================================

      const {
        data: attemptData,
        error: attemptError,
      } = await supabase
        .from('attempts')
        .select(`
          id,
          user_id,
          course_id,
          status,
          score,
          total_questions,
          correct_answers,
          incorrect_answers,
          started_at,
          completed_at
        `)
        .eq('id', attemptId)
        .single()

      if (attemptError) {
        throw attemptError
      }

      if (!attemptData) {
        throw new Error(
          'No se encontró el intento.'
        )
      }

      if (attemptData.status !== 'COMPLETED') {
        throw new Error(
          'El examen todavía no ha finalizado.'
        )
      }

      setAttempt(attemptData)

      // ==========================================
      // 2. OBTENER EL CURSO
      // ==========================================

      const {
        data: courseData,
        error: courseError,
      } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          passing_score
        `)
        .eq('id', attemptData.course_id)
        .single()

      if (courseError) {
        throw courseError
      }

      setCourse(courseData)

      // ==========================================
      // 3. OBTENER REVISION DEL EXAMEN
      // ==========================================

      const {
        data: reviewData,
        error: reviewError,
      } = await supabase.rpc(
        'get_attempt_review',
        {
          p_attempt_id: attemptId,
        }
      )

      if (reviewError) {
        throw reviewError
      }

      setReviewRows(reviewData ?? [])
    } catch (err) {
      console.error(
        'Error cargando resultado:',
        err
      )

      setError(
        err.message ||
          'No se pudo cargar el resultado.'
      )
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // AGRUPAR ALTERNATIVAS POR PREGUNTA
  // ==========================================

  const questions = useMemo(() => {
    const map = new Map()

    for (const row of reviewRows) {
      const key = row.question_order

      if (!map.has(key)) {
        map.set(key, {
          questionOrder:
            row.question_order,

          questionText:
            row.question_text,

          requiredSelections:
            row.required_selections,

          isCorrect:
            row.question_is_correct,

          options: [],
        })
      }

      map.get(key).options.push({
        id: row.option_id,

        text: row.option_text,

        order: row.option_order,

        isCorrect:
          row.option_is_correct,

        wasSelected:
          row.option_was_selected,
      })
    }

    return Array
      .from(map.values())
      .sort(
        (a, b) =>
          a.questionOrder -
          b.questionOrder
      )
  }, [reviewRows])

  // ==========================================
  // PREGUNTAS FALLADAS
  // ==========================================

  const failedQuestions =
    questions.filter(
      (question) =>
        question.isCorrect === false
    )

  if (loading) {
    return (
      <div className="screen-center">
        <p>Cargando resultado...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="screen-center">
        <div className="result-error">
          <h2>
            No se pudo cargar el resultado
          </h2>

          <p>{error}</p>

          <button
            className="primary-button"
            onClick={() =>
              navigate('/courses')
            }
          >
            Volver a cursos
          </button>
        </div>
      </div>
    )
  }

  if (!attempt || !course) {
    return null
  }

  const score =
    Number(attempt.score ?? 0)

  const passingScore =
    Number(course.passing_score ?? 0)

  const passed =
    score >= passingScore

  return (
    <main className="results-page">
        <PlatformHeader
        showBack
        backTo="/courses"
      />
      <section className="results-container">

        {/* ===================================== */}
        {/* CABECERA */}
        {/* ===================================== */}

        {/* ===================================== */}
        {/* RESULTADO PRINCIPAL */}
        {/* ===================================== */}

        <section className="result-summary">

          <div
            className={`score-circle ${
              passed
                ? 'score-passed'
                : 'score-failed'
            }`}
          >
            <strong>
              {score.toFixed(0)}%
            </strong>

            <span>
              Puntaje
            </span>
          </div>

          <div className="result-details">

            <div
              className={`result-status ${
                passed
                  ? 'passed'
                  : 'failed'
              }`}
            >
              {passed
                ? 'APROBADO'
                : 'DESAPROBADO'}
            </div>

            <h2>
              {passed
                ? '¡Evaluación aprobada!'
                : 'Necesitas reforzar algunos temas'}
            </h2>

            <p>
              La nota mínima para aprobar
              este curso es de{' '}
              <strong>
                {passingScore}%
              </strong>.
            </p>

          </div>

        </section>

        {/* ===================================== */}
        {/* ESTADISTICAS */}
        {/* ===================================== */}

        <section className="result-stats">

          <div className="stat-card">
            <span>
              Preguntas
            </span>

            <strong>
              {attempt.total_questions}
            </strong>
          </div>

          <div className="stat-card success">
            <span>
              Correctas
            </span>

            <strong>
              {attempt.correct_answers}
            </strong>
          </div>

          <div className="stat-card danger">
            <span>
              Incorrectas
            </span>

            <strong>
              {attempt.incorrect_answers}
            </strong>
          </div>

          <div className="stat-card">
            <span>
              Puntaje
            </span>

            <strong>
              {score.toFixed(0)}%
            </strong>
          </div>

        </section>

        {/* ===================================== */}
        {/* PREGUNTAS FALLADAS */}
        {/* ===================================== */}

        <section className="failed-section">

          <div className="section-heading">

            <div>
              <span>
                Revisión
              </span>

              <h2>
                Preguntas falladas
              </h2>
            </div>

            <div className="failed-count">
              {failedQuestions.length}
            </div>

          </div>

          {failedQuestions.length === 0 ? (

            <div className="perfect-result">

              <div className="perfect-icon">
                ✓
              </div>

              <h3>
                ¡Excelente!
              </h3>

              <p>
                Respondiste correctamente
                todas las preguntas.
              </p>

            </div>

          ) : (

            <div className="failed-list">

              {failedQuestions.map(
                (question) => {

                  const selectedOptions =
                    question.options.filter(
                      (option) =>
                        option.wasSelected
                    )

                  const correctOptions =
                    question.options.filter(
                      (option) =>
                        option.isCorrect
                    )

                  return (
                    <article
                      key={
                        question.questionOrder
                      }
                      className="failed-question-card"
                    >

                      <div className="failed-question-header">

                        <span>
                          Pregunta{' '}
                          {
                            question.questionOrder
                          }
                        </span>

                        <span className="incorrect-badge">
                          Incorrecta
                        </span>

                      </div>

                      <h3>
                        {
                          question.questionText
                        }
                      </h3>

                      {/* TU RESPUESTA */}

                      <div className="answer-block">

                        <h4>
                          Tu respuesta
                        </h4>

                        <div className="answer-options">

                          {selectedOptions.map(
                            (option) => (

                              <div
                                key={option.id}
                                className={
                                  option.isCorrect
                                    ? 'answer-option selected-correct'
                                    : 'answer-option selected-wrong'
                                }
                              >

                                <span className="answer-icon">
                                  {option.isCorrect
                                    ? '✓'
                                    : '✕'}
                                </span>

                                <span>
                                  {option.text}
                                </span>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                      {/* RESPUESTA CORRECTA */}

                      <div className="answer-block">

                        <h4>
                          Respuesta correcta
                        </h4>

                        <div className="answer-options">

                          {correctOptions.map(
                            (option) => (

                              <div
                                key={option.id}
                                className="answer-option correct-answer"
                              >

                                <span className="answer-icon">
                                  ✓
                                </span>

                                <span>
                                  {option.text}
                                </span>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    </article>
                  )
                }
              )}

            </div>

          )}

        </section>

        {/* ===================================== */}
        {/* ACCIONES */}
        {/* ===================================== */}

        <div className="results-actions">

          <button
            className="secondary-button"
            onClick={() =>
              navigate('/courses')
            }
          >
            Volver a cursos
          </button>

        </div>

      </section>
    </main>
  )
}