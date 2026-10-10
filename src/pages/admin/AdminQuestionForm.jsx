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
} from '../../services/supabase'

const emptyOptions = [
  {
    text: '',
    isCorrect: true,
  },
  {
    text: '',
    isCorrect: false,
  },
  {
    text: '',
    isCorrect: false,
  },
  {
    text: '',
    isCorrect: false,
  },
]

export default function AdminQuestionForm() {
  const {
    courseId,
    questionId,
  } = useParams()

  const navigate = useNavigate()

  const isEditing =
    Boolean(questionId)

  const [course, setCourse] =
    useState(null)

  const [
    questionText,
    setQuestionText,
  ] = useState('')

  const [
    requiredSelections,
    setRequiredSelections,
  ] = useState(1)

  const [status, setStatus] =
    useState('DRAFT')

  const [options, setOptions] =
    useState(emptyOptions)

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  useEffect(() => {
    loadData()
  }, [
    courseId,
    questionId,
  ])

  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const {
        data: courseData,
        error: courseError,
      } = await supabase
        .from('courses')
        .select(`
          id,
          title
        `)
        .eq('id', courseId)
        .single()

      if (courseError) {
        throw courseError
      }

      setCourse(courseData)


      if (questionId) {

        const {
          data,
          error,
        } = await supabase
          .from('questions')
          .select(`
            id,
            question_text,
            required_selections,
            status,
            question_options (
              id,
              option_text,
              is_correct,
              option_order
            )
          `)
          .eq(
            'id',
            questionId
          )
          .eq(
            'course_id',
            courseId
          )
          .single()

        if (error) {
          throw error
        }

        setQuestionText(
          data.question_text
        )

        setRequiredSelections(
          data.required_selections
        )

        setStatus(
          data.status
        )

        const ordered =
          [...data.question_options]
            .sort(
              (a, b) =>
                a.option_order -
                b.option_order
            )
            .map(
              option => ({
                text:
                  option.option_text,

                isCorrect:
                  option.is_correct,
              })
            )

        setOptions(ordered)

      }

    } catch (err) {
      console.error(err)

      setError(
        err.message ||
        'No se pudo cargar la pregunta.'
      )
    } finally {
      setLoading(false)
    }
  }

  function updateOptionText(
    index,
    value
  ) {
    setOptions(
      previous =>
        previous.map(
          (option, currentIndex) =>
            currentIndex === index
              ? {
                  ...option,
                  text: value,
                }
              : option
        )
    )
  }

  function toggleCorrect(
    index
  ) {
    setOptions(previous => {

      const selectedCount =
        previous.filter(
          option =>
            option.isCorrect
        ).length

      const target =
        previous[index]

      if (
        !target.isCorrect &&
        selectedCount >=
          requiredSelections
      ) {
        return previous
      }

      return previous.map(
        (option, currentIndex) =>
          currentIndex === index
            ? {
                ...option,

                isCorrect:
                  !option.isCorrect,
              }
            : option
      )
    })
  }

  function changeRequiredSelections(
    value
  ) {
    const number =
      Number(value)

    setRequiredSelections(
      number
    )

    /*
     * Ajustamos automáticamente
     * las correctas para mantener
     * coherencia visual.
     */

    setOptions(
      previous =>
        previous.map(
          (option, index) => ({
            ...option,

            isCorrect:
              index < number,
          })
        )
    )
  }

  function validate() {
    if (!questionText.trim()) {
      return 'Escribe el texto de la pregunta.'
    }

    for (
      let index = 0;
      index < options.length;
      index += 1
    ) {
      if (
        !options[index]
          .text
          .trim()
      ) {
        return (
          `La alternativa ${index + 1} ` +
          'es obligatoria.'
        )
      }
    }

    const correctCount =
      options.filter(
        option =>
          option.isCorrect
      ).length

    if (
      correctCount !==
      requiredSelections
    ) {
      return (
        `Debes marcar exactamente ` +
        `${requiredSelections} ` +
        `respuesta(s) correcta(s).`
      )
    }

    return ''
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault()

    const validation =
      validate()

    if (validation) {
      setError(validation)
      return
    }

    try {
      setSaving(true)
      setError('')

      const {
        data,
        error,
      } = await supabase.rpc(
        'admin_save_question',
        {
          p_course_id:
            courseId,

          p_question_id:
            questionId ?? null,

          p_question_text:
            questionText.trim(),

          p_required_selections:
            requiredSelections,

          p_status:
            status,

          p_options:
            options.map(
              option => ({
                text:
                  option.text.trim(),

                is_correct:
                  option.isCorrect,
              })
            ),
        }
      )

      if (error) {
        throw error
      }

      console.log(
        'Pregunta guardada:',
        data
      )

      navigate(
        `/admin/courses/${courseId}/questions`
      )

    } catch (err) {
      console.error(err)

      setError(
        err.message ||
        'No se pudo guardar la pregunta.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        Cargando...
      </div>
    )
  }

  return (
    <div>

      <section className="admin-page-heading">

        <div>

          <span className="admin-eyebrow">
            {course?.title}
          </span>

          <h1>
            {isEditing
              ? 'Editar pregunta'
              : 'Nueva pregunta'}
          </h1>

          <p>
            Configura la pregunta,
            sus cuatro alternativas
            y las respuestas correctas.
          </p>

        </div>

        <button
          className="admin-outline-button"
          onClick={() =>
            navigate(
              `/admin/courses/${courseId}/questions`
            )
          }
        >
          Volver
        </button>

      </section>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      <form
        className="question-form-layout"
        onSubmit={handleSubmit}
      >

        <div className="question-form-main">

          <section className="admin-panel">

            <div className="admin-panel-heading">

              <div>

                <h2>
                  Pregunta
                </h2>

                <p>
                  Escribe el enunciado que
                  verá el usuario.
                </p>

              </div>

            </div>

            <div className="admin-field">

              <label>
                Enunciado
              </label>

              <textarea
                rows="5"
                value={questionText}
                placeholder="Escribe la pregunta..."
                onChange={event =>
                  setQuestionText(
                    event.target.value
                  )
                }
              />

            </div>

          </section>

          <section className="admin-panel">

            <div className="admin-panel-heading">

              <div>

                <h2>
                  Alternativas
                </h2>

                <p>
                  La pregunta debe contener
                  exactamente cuatro opciones.
                </p>

              </div>

              <span className="question-correct-counter">

                {
                  options.filter(
                    option =>
                      option.isCorrect
                  ).length
                }
                {' / '}
                {requiredSelections}
                {' correctas'}

              </span>

            </div>

            <div className="question-option-editor-list">

              {options.map(
                (option, index) => (

                  <div
                    key={index}
                    className={
                      `question-option-editor ` +
                      `${option.isCorrect
                        ? 'correct'
                        : ''}`
                    }
                  >

                    <div className="question-option-letter">
                      {
                        String.fromCharCode(
                          65 + index
                        )
                      }
                    </div>

                    <input
                      type="text"
                      value={option.text}
                      placeholder={
                        `Alternativa ${index + 1}`
                      }
                      onChange={event =>
                        updateOptionText(
                          index,
                          event.target.value
                        )
                      }
                    />

                    <label className="question-correct-toggle">

                      <input
                        type="checkbox"
                        checked={
                          option.isCorrect
                        }
                        onChange={() =>
                          toggleCorrect(
                            index
                          )
                        }
                      />

                      <span>
                        Correcta
                      </span>

                    </label>

                  </div>

                )
              )}

            </div>

          </section>

        </div>

        <aside className="question-form-side">

          <section className="admin-panel">

            <div className="admin-panel-heading">

              <div>

                <h2>
                  Tipo de respuesta
                </h2>

                <p>
                  Define cuántas opciones
                  debe seleccionar el usuario.
                </p>

              </div>

            </div>

            <div className="question-selection-buttons">

              {[1, 2, 3].map(
                value => (

                  <button
                    key={value}
                    type="button"
                    className={
                      requiredSelections === value
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      changeRequiredSelections(
                        value
                      )
                    }
                  >
                    <strong>
                      {value}
                    </strong>

                    <span>
                      {value === 1
                        ? 'respuesta'
                        : 'respuestas'}
                    </span>
                  </button>

                )
              )}

            </div>

            <div className="question-type-preview">

              <span>
                Tipo generado
              </span>

              <strong>
                {
                  requiredSelections === 1
                    ? 'Selección simple'
                    : 'Selección múltiple'
                }
              </strong>

            </div>

          </section>

          <section className="admin-panel">

            <div className="admin-panel-heading">

              <div>

                <h2>
                  Estado
                </h2>

                <p>
                  Controla la disponibilidad
                  de la pregunta.
                </p>

              </div>

            </div>

            <div className="admin-field">

              <select
                value={status}
                onChange={event =>
                  setStatus(
                    event.target.value
                  )
                }
              >

                <option value="DRAFT">
                  Borrador
                </option>

                <option value="ACTIVE">
                  Activa
                </option>

                <option value="INACTIVE">
                  Inactiva
                </option>

              </select>

            </div>

          </section>

          <div className="admin-form-actions">

            <button
              type="button"
              className="admin-outline-button"
              onClick={() =>
                navigate(
                  `/admin/courses/${courseId}/questions`
                )
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="admin-primary-button"
              disabled={saving}
            >
              {saving
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Crear pregunta'}
            </button>

          </div>

        </aside>

      </form>

    </div>
  )
}