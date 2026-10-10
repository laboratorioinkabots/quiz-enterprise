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

export default function AdminCourseQuestions() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [questions, setQuestions] = useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState('ALL')

  const [updatingId, setUpdatingId] =
    useState(null)

  useEffect(() => {
    loadData()
  }, [courseId])

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
          title,
          status,
          questions_per_attempt,
          passing_score
        `)
        .eq('id', courseId)
        .single()

      if (courseError) {
        throw courseError
      }

      const {
        data: questionData,
        error: questionError,
      } = await supabase
        .from('questions')
        .select(`
          id,
          course_id,
          question_text,
          question_type,
          required_selections,
          status,
          created_at,
          updated_at,
          question_options (
            id,
            option_text,
            is_correct,
            option_order
          )
        `)
        .eq('course_id', courseId)
        .order('created_at', {
          ascending: false,
        })

      if (questionError) {
        throw questionError
      }

      setCourse(courseData)

      setQuestions(
        questionData ?? []
      )
    } catch (err) {
      console.error(err)

      setError(
        err.message ||
        'No se pudieron cargar las preguntas.'
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredQuestions =
    useMemo(() => {

      const normalizedSearch =
        search
          .trim()
          .toLowerCase()

      return questions.filter(
        question => {

          const matchesText =
            !normalizedSearch ||
            question.question_text
              .toLowerCase()
              .includes(
                normalizedSearch
              )

          const matchesStatus =
            statusFilter === 'ALL' ||
            question.status ===
              statusFilter

          return (
            matchesText &&
            matchesStatus
          )
        }
      )

    }, [
      questions,
      search,
      statusFilter,
    ])

  const stats = useMemo(() => ({
    total:
      questions.length,

    active:
      questions.filter(
        q => q.status === 'ACTIVE'
      ).length,

    draft:
      questions.filter(
        q => q.status === 'DRAFT'
      ).length,

    inactive:
      questions.filter(
        q => q.status === 'INACTIVE'
      ).length,
  }), [questions])

  async function changeStatus(
    question,
    newStatus
  ) {
    try {
      setUpdatingId(
        question.id
      )

      setError('')

      const { error } =
        await supabase
          .from('questions')
          .update({
            status: newStatus,
          })
          .eq(
            'id',
            question.id
          )

      if (error) {
        throw error
      }

      setQuestions(
        previous =>
          previous.map(
            item =>
              item.id === question.id
                ? {
                    ...item,
                    status: newStatus,
                  }
                : item
          )
      )
    } catch (err) {
      console.error(err)

      setError(
        err.message ||
        'No se pudo cambiar el estado.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  async function deleteQuestion(
    question
  ) {
    const confirmed =
      window.confirm(
        '¿Deseas eliminar esta pregunta?\n\n' +
        'Si ya fue utilizada en un examen, ' +
        'la base de datos puede impedir su eliminación.'
      )

    if (!confirmed) {
      return
    }

    try {
      setUpdatingId(
        question.id
      )

      setError('')

      const { error } =
        await supabase
          .from('questions')
          .delete()
          .eq(
            'id',
            question.id
          )

      if (error) {
        /*
         * Una pregunta histórica puede estar
         * relacionada a attempt_answers.
         * En ese caso no debemos destruirla.
         */

        if (
          error.code === '23503'
        ) {
          throw new Error(
            'Esta pregunta ya fue utilizada en una evaluación. ' +
            'No puede eliminarse; cámbiala a INACTIVE.'
          )
        }

        throw error
      }

      setQuestions(
        previous =>
          previous.filter(
            item =>
              item.id !== question.id
          )
      )
    } catch (err) {
      console.error(err)

      setError(
        err.message ||
        'No se pudo eliminar la pregunta.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        Cargando preguntas...
      </div>
    )
  }

  if (!course) {
    return null
  }

  return (
    <div>

      <section className="admin-page-heading">

        <div>

          <span className="admin-eyebrow">
            Banco de preguntas
          </span>

          <h1>
            {course.title}
          </h1>

          <p>
            Administra las preguntas
            disponibles para las
            evaluaciones de este curso.
          </p>

        </div>

        <div className="admin-page-actions">

          <button
            className="admin-outline-button"
            onClick={() =>
              navigate(
                `/admin/import?course=${courseId}`
              )
            }
          >
            ↑ Importar
          </button>

          <button
            className="admin-primary-button"
            onClick={() =>
              navigate(
                `/admin/courses/${courseId}/questions/new`
              )
            }
          >
            + Nueva pregunta
          </button>

        </div>

      </section>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      <section className="question-admin-stats">

        <QuestionStat
          label="Total"
          value={stats.total}
        />

        <QuestionStat
          label="Activas"
          value={stats.active}
          type="success"
        />

        <QuestionStat
          label="Borrador"
          value={stats.draft}
        />

        <QuestionStat
          label="Inactivas"
          value={stats.inactive}
          type="danger"
        />

      </section>

      <section className="admin-toolbar">

        <div className="admin-search-box">

          <span>⌕</span>

          <input
            type="search"
            value={search}
            placeholder="Buscar pregunta..."
            onChange={event =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={event =>
            setStatusFilter(
              event.target.value
            )
          }
        >

          <option value="ALL">
            Todos los estados
          </option>

          <option value="ACTIVE">
            Activas
          </option>

          <option value="DRAFT">
            Borrador
          </option>

          <option value="INACTIVE">
            Inactivas
          </option>

        </select>

      </section>

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Preguntas
            </h2>

            <p>
              {filteredQuestions.length}
              {' '}
              pregunta(s) encontrada(s)
            </p>

          </div>

          <div className="course-question-capacity">

            <span>
              Evaluación:
            </span>

            <strong>
              {stats.active}
              {' / '}
              {
                course.questions_per_attempt
              }
            </strong>

          </div>

        </div>

        {filteredQuestions.length === 0 ? (

          <div className="admin-empty-state">

            <h3>
              No hay preguntas
            </h3>

            <p>
              Crea una pregunta manualmente
              o importa un archivo Excel.
            </p>

          </div>

        ) : (

          <div className="admin-question-list">

            {filteredQuestions.map(
              (question, index) => (

                <QuestionCard
                  key={question.id}
                  number={index + 1}
                  question={question}
                  updating={
                    updatingId ===
                    question.id
                  }
                  onEdit={() =>
                    navigate(
                      `/admin/courses/${courseId}/questions/${question.id}/edit`
                    )
                  }
                  onStatusChange={
                    newStatus =>
                      changeStatus(
                        question,
                        newStatus
                      )
                  }
                  onDelete={() =>
                    deleteQuestion(
                      question
                    )
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

function QuestionCard({
  number,
  question,
  updating,
  onEdit,
  onStatusChange,
  onDelete,
}) {
  const correct =
    question.question_options
      ?.filter(
        option =>
          option.is_correct
      )
      .sort(
        (a, b) =>
          a.option_order -
          b.option_order
      ) ?? []

  return (
    <article className="admin-question-card">

      <div className="admin-question-index">
        {number}
      </div>

      <div className="admin-question-content">

        <div className="admin-question-header">

          <div className="admin-question-tags">

            <QuestionStatus
              status={question.status}
            />

            <span className="question-selection-badge">

              {question.required_selections === 1
                ? 'Selección simple'
                : `Seleccionar ${question.required_selections}`}

            </span>

          </div>

          <button
            className="admin-small-button"
            onClick={onEdit}
          >
            Editar
          </button>

        </div>

        <h3>
          {question.question_text}
        </h3>

        <div className="question-option-preview">

          {question.question_options
            ?.sort(
              (a, b) =>
                a.option_order -
                b.option_order
            )
            .map(option => (

              <span
                key={option.id}
                className={
                  option.is_correct
                    ? 'question-option-correct'
                    : ''
                }
              >

                <strong>
                  {option.option_order}.
                </strong>

                {' '}

                {option.option_text}

                {option.is_correct &&
                  ' ✓'}

              </span>

            ))}

        </div>

        <div className="admin-question-footer">

          <div>

            <span>
              Correctas:
            </span>

            <strong>
              {
                correct
                  .map(
                    item =>
                      item.option_order
                  )
                  .join(', ')
              }
            </strong>

          </div>

          <div className="admin-question-controls">

            <select
              value={question.status}
              disabled={updating}
              onChange={event =>
                onStatusChange(
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

            <button
              className="admin-question-delete"
              disabled={updating}
              onClick={onDelete}
            >
              Eliminar
            </button>

          </div>

        </div>

      </div>

    </article>
  )
}

function QuestionStatus({
  status,
}) {
  const text = {
    ACTIVE: 'Activa',
    DRAFT: 'Borrador',
    INACTIVE: 'Inactiva',
  }

  return (
    <span
      className={
        `admin-status-badge ` +
        `admin-status-${status.toLowerCase()}`
      }
    >
      {text[status]}
    </span>
  )
}

function QuestionStat({
  label,
  value,
  type,
}) {
  return (
    <div
      className={
        `question-admin-stat ` +
        `${type ?? ''}`
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