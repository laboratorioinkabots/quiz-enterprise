import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { supabase } from '../services/supabase'
import PlatformHeader
  from '../components/platform/PlatformHeader'
export default function Exam() {
  const { attemptId } = useParams()
  const navigate = useNavigate()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [attemptId])

  async function loadQuestions() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.rpc(
      'get_attempt_questions',
      {
        p_attempt_id: attemptId,
      }
    )

    if (error) {
      console.error('Error get_attempt_questions:', error)

      setError(error.message)
      setLoading(false)

      return
    }

    setRows(data ?? [])
    setLoading(false)
  }

  const questions = useMemo(() => {
    const map = new Map()

    for (const row of rows) {
      if (!map.has(row.attempt_answer_id)) {
        map.set(row.attempt_answer_id, {
          attemptAnswerId: row.attempt_answer_id,
          questionId: row.question_id,
          questionOrder: row.question_order,
          questionText: row.question_text,
          questionType: row.question_type,
          requiredSelections: row.required_selections,
          options: [],
        })
      }

      map.get(row.attempt_answer_id).options.push({
        id: row.option_id,
        text: row.option_text,
        order: row.option_order,
      })
    }

    return Array.from(map.values()).sort(
      (a, b) =>
        a.questionOrder - b.questionOrder
    )
  }, [rows])

  if (loading) {
    return (
      <div className="screen-center">
        <p>Cargando examen...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="screen-center">
        <div>
          <p>{error}</p>

          <button
            className="secondary-button"
            onClick={() => navigate('/courses')}
          >
            Volver a cursos
          </button>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="screen-center">
        <p>No existen preguntas para este intento.</p>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  const currentSelected =
    selectedOptions[currentQuestion.attemptAnswerId] ?? []

  const requiredSelections =
    currentQuestion.requiredSelections

  const isLastQuestion =
    currentIndex === questions.length - 1

  const canContinue =
    currentSelected.length === requiredSelections

  function handleOptionChange(optionId) {
    setSelectedOptions((previous) => {
      const current =
        previous[currentQuestion.attemptAnswerId] ?? []

      if (requiredSelections === 1) {
        return {
          ...previous,
          [currentQuestion.attemptAnswerId]: [optionId],
        }
      }

      const alreadySelected =
        current.includes(optionId)

      let next

      if (alreadySelected) {
        next = current.filter(
          (id) => id !== optionId
        )
      } else {
        if (current.length >= requiredSelections) {
          return previous
        }

        next = [...current, optionId]
      }

      return {
        ...previous,
        [currentQuestion.attemptAnswerId]: next,
      }
    })
  }

  async function saveCurrentAnswer() {
    if (!canContinue) {
      return false
    }

    setSaving(true)
    setError('')

    const { error } = await supabase.rpc(
      'save_answer',
      {
        p_attempt_answer_id:
          currentQuestion.attemptAnswerId,

        p_option_ids:
          currentSelected,
      }
    )

    setSaving(false)

    if (error) {
      console.error('Error save_answer:', error)

      setError(error.message)

      return false
    }

    return true
  }

  async function handleNext() {
    const saved = await saveCurrentAnswer()

    if (!saved) return

    setCurrentIndex((index) => index + 1)
  }

  async function handleSubmitExam() {
    const saved = await saveCurrentAnswer()

    if (!saved) return

    setSaving(true)
    setError('')

    const { error } = await supabase.rpc(
      'submit_attempt',
      {
        p_attempt_id: attemptId,
      }
    )

    setSaving(false)

    if (error) {
      console.error('Error submit_attempt:', error)

      setError(error.message)

      return
    }

    navigate(`/results/${attemptId}`)
  }

  return (
    <main className="exam-page">
      <PlatformHeader
          showBack
          backTo="/courses"
        />
      <section className="exam-container">
         
        <div className="progress-track">
          <div
            className="progress-value"
            style={{
              width: `${
                ((currentIndex + 1) /
                  questions.length) *
                100
              }%`,
            }}
          />
        </div>

        <article className="question-card">
          <div className="question-top">
            <span className="question-number">
              Pregunta {currentIndex + 1}
            </span>

            <span className="selection-info">
              Selecciona {requiredSelections}{' '}
              {requiredSelections === 1
                ? 'alternativa'
                : 'alternativas'}
            </span>
          </div>

          <h2>
            {currentQuestion.questionText}
          </h2>

          <div className="options-list">
            {currentQuestion.options.map(
              (option) => {
                const checked =
                  currentSelected.includes(option.id)

                const inputType =
                  requiredSelections === 1
                    ? 'radio'
                    : 'checkbox'

                return (
                  <label
                    key={option.id}
                    className={`option-card ${
                      checked ? 'selected' : ''
                    }`}
                  >
                    <input
                      type={inputType}
                      name={
                        requiredSelections === 1
                          ? currentQuestion.attemptAnswerId
                          : undefined
                      }
                      checked={checked}
                      onChange={() =>
                        handleOptionChange(option.id)
                      }
                    />

                    <span>{option.text}</span>
                  </label>
                )
              }
            )}
          </div>

          {requiredSelections > 1 && (
            <div className="selection-counter">
              Seleccionadas:{' '}
              {currentSelected.length} de{' '}
              {requiredSelections}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="exam-actions">
            <button
              className="secondary-button"
              disabled={currentIndex === 0}
              onClick={() =>
                setCurrentIndex(
                  (index) => index - 1
                )
              }
            >
              Anterior
            </button>

            {!isLastQuestion ? (
              <button
                className="primary-button"
                disabled={
                  !canContinue || saving
                }
                onClick={handleNext}
              >
                {saving
                  ? 'Guardando...'
                  : 'Siguiente'}
              </button>
            ) : (
              <button
                className="primary-button"
                disabled={
                  !canContinue || saving
                }
                onClick={handleSubmitExam}
              >
                {saving
                  ? 'Finalizando...'
                  : 'Finalizar examen'}
              </button>
            )}
          </div>
        </article>
      </section>
    </main>
  )
}