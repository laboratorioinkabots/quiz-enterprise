import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  supabase,
} from '../../services/supabase'


export default function AdminQuestions() {
  const navigate =
    useNavigate()

  const [questions, setQuestions] =
    useState([])

  const [courses, setCourses] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [search, setSearch] =
    useState('')

  const [courseFilter, setCourseFilter] =
    useState('ALL')

  const [typeFilter, setTypeFilter] =
    useState('ALL')

  const [statusFilter, setStatusFilter] =
    useState('ALL')


  useEffect(() => {
    loadData()
  }, [])


  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const [
        coursesResult,
        questionsResult,
        optionsResult,
      ] = await Promise.all([

        supabase
          .from('courses')
          .select(`
            id,
            title,
            status
          `)
          .order(
            'title',
            {
              ascending: true,
            }
          ),

        supabase
          .from('questions')
          .select(`
            id,
            course_id,
            question_text,
            question_type,
            required_selections,
            status,
            created_at,
            updated_at
          `)
          .order(
            'created_at',
            {
              ascending: false,
            }
          ),

        supabase
          .from('question_options')
          .select(`
            id,
            question_id,
            option_text,
            is_correct
          `),
      ])


      if (coursesResult.error) {
        throw coursesResult.error
      }

      if (questionsResult.error) {
        throw questionsResult.error
      }

      if (optionsResult.error) {
        throw optionsResult.error
      }


      const courseMap =
        Object.fromEntries(
          (coursesResult.data ?? [])
            .map(
              course => [
                course.id,
                course,
              ]
            )
        )


      const optionsByQuestion = {}

      for (
        const option
        of optionsResult.data ?? []
      ) {
        if (
          !optionsByQuestion[
            option.question_id
          ]
        ) {
          optionsByQuestion[
            option.question_id
          ] = []
        }

        optionsByQuestion[
          option.question_id
        ].push(option)
      }


      const mappedQuestions =
        (questionsResult.data ?? [])
          .map(
            question => ({
              ...question,

              course:
                courseMap[
                  question.course_id
                ] ?? null,

              options:
                optionsByQuestion[
                  question.id
                ] ?? [],
            })
          )


      setCourses(
        coursesResult.data ?? []
      )

      setQuestions(
        mappedQuestions
      )

    } catch (err) {
      console.error(
        'Error cargando banco de preguntas:',
        err
      )

      setError(
        err.message ||
        'No se pudo cargar el banco de preguntas.'
      )

    } finally {
      setLoading(false)
    }
  }


  /*
   * =========================================
   * STATS
   * =========================================
   */

  const stats =
    useMemo(
      () => {

        const total =
          questions.length

        const active =
          questions.filter(
            question =>
              question.status === 'ACTIVE'
          ).length

        const single =
          questions.filter(
            question =>
              question.question_type ===
              'SINGLE_CHOICE'
          ).length

        const multiple =
          questions.filter(
            question =>
              question.question_type ===
              'MULTIPLE_CHOICE'
          ).length


        return {
          total,
          active,
          single,
          multiple,
        }

      },
      [questions]
    )


  /*
   * =========================================
   * FILTERS
   * =========================================
   */

  const filteredQuestions =
    useMemo(
      () => {

        const searchValue =
          search
            .trim()
            .toLowerCase()


        return questions.filter(
          question => {

            const matchesSearch =
              !searchValue ||

              question.question_text
                ?.toLowerCase()
                .includes(
                  searchValue
                ) ||

              question.course?.title
                ?.toLowerCase()
                .includes(
                  searchValue
                )


            const matchesCourse =
              courseFilter === 'ALL' ||
              question.course_id ===
                courseFilter


            const matchesType =
              typeFilter === 'ALL' ||
              question.question_type ===
                typeFilter


            const matchesStatus =
              statusFilter === 'ALL' ||
              question.status ===
                statusFilter


            return (
              matchesSearch &&
              matchesCourse &&
              matchesType &&
              matchesStatus
            )
          }
        )

      },
      [
        questions,
        search,
        courseFilter,
        typeFilter,
        statusFilter,
      ]
    )


  const hasFilters =
    Boolean(
      search ||
      courseFilter !== 'ALL' ||
      typeFilter !== 'ALL' ||
      statusFilter !== 'ALL'
    )


  function clearFilters() {
    setSearch('')
    setCourseFilter('ALL')
    setTypeFilter('ALL')
    setStatusFilter('ALL')
  }


  /*
   * =========================================
   * ACTIONS
   * =========================================
   */

  function handleEdit(question) {
    navigate(
      `/admin/courses/${question.course_id}/questions`
    )
  }


  function handleCreateQuestion() {
    if (courses.length === 0) {
      setError(
        'Primero debes crear un curso.'
      )

      return
    }

    /*
     * Si solo existe un curso,
     * podemos ir directamente.
     */

    if (courses.length === 1) {
      navigate(
        `/admin/courses/${courses[0].id}/questions/new`
      )

      return
    }

    /*
     * Por ahora enviamos al administrador
     * al listado de cursos para seleccionar
     * dónde crear la pregunta.
     */

    navigate(
      '/admin/courses'
    )
  }


  if (loading) {
    return (
      <div className="admin-loading">
        Cargando banco de preguntas...
      </div>
    )
  }


  return (
    <div>

      {/* =====================================
          PAGE HEADING
      ====================================== */}

      <section className="admin-page-heading">

        <div>

          <span className="admin-eyebrow">
            Banco de preguntas
          </span>

          <h1>
            Preguntas
          </h1>

          <p>
            Administra las preguntas,
            alternativas y respuestas correctas
            de todos los cursos.
          </p>

        </div>


        <div className="admin-page-actions">

          <button
            type="button"
            className="admin-outline-button"
            onClick={() =>
              navigate('/admin/import')
            }
          >
            Importar preguntas
          </button>


          <button
            type="button"
            className="admin-primary-button"
            onClick={
              handleCreateQuestion
            }
          >
            + Nueva pregunta
          </button>

        </div>

      </section>


      {/* =====================================
          ERROR
      ====================================== */}

      {error && (

        <div className="admin-error-message">
          {error}
        </div>

      )}


      {/* =====================================
          STATS
      ====================================== */}

      <section className="question-admin-stats">

        <QuestionStat
          label="Preguntas"
          value={stats.total}
        />

        <QuestionStat
          label="Activas"
          value={stats.active}
          className="success"
        />

        <QuestionStat
          label="Selección única"
          value={stats.single}
          className="primary"
        />

        <QuestionStat
          label="Selección múltiple"
          value={stats.multiple}
          className="purple"
        />

      </section>


      {/* =====================================
          TOOLBAR
      ====================================== */}

      <section className="question-bank-toolbar">

        {/* SEARCH */}

        <div className="question-bank-search">

          <span
            className="question-bank-search-icon"
            aria-hidden="true"
          >
            ⌕
          </span>

          <input
            type="search"
            value={search}
            placeholder="Buscar pregunta o curso..."
            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
          />

          {search && (

            <button
              type="button"
              className="question-bank-search-clear"
              onClick={() =>
                setSearch('')
              }
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>

          )}

        </div>


        {/* FILTERS */}

        <div className="question-bank-filters">

          <FilterSelect
            label="Curso"
            value={courseFilter}
            onChange={
              setCourseFilter
            }
          >
            <option value="ALL">
              Todos los cursos
            </option>

            {courses.map(
              course => (

                <option
                  key={course.id}
                  value={course.id}
                >
                  {course.title}
                </option>

              )
            )}

          </FilterSelect>


          <FilterSelect
            label="Tipo"
            value={typeFilter}
            onChange={
              setTypeFilter
            }
          >

            <option value="ALL">
              Todos los tipos
            </option>

            <option value="SINGLE_CHOICE">
              Selección única
            </option>

            <option value="MULTIPLE_CHOICE">
              Selección múltiple
            </option>

          </FilterSelect>


          <FilterSelect
            label="Estado"
            value={statusFilter}
            onChange={
              setStatusFilter
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

          </FilterSelect>


          {hasFilters && (

            <button
              type="button"
              className="question-bank-clear"
              onClick={
                clearFilters
              }
            >
              Limpiar filtros
            </button>

          )}

        </div>

      </section>


      {/* =====================================
          QUESTIONS
      ====================================== */}

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>

            <h2>
              Preguntas registradas
            </h2>

            <p>
              {filteredQuestions.length}
              {' '}
              pregunta(s) encontrada(s)
            </p>

          </div>

        </div>


        {filteredQuestions.length === 0 ? (

          <div className="admin-empty-state">

            <h3>
              No se encontraron preguntas
            </h3>

            <p>
              Ajusta los filtros o crea
              una nueva pregunta.
            </p>

          </div>

        ) : (

          <div className="question-bank-list">

            {filteredQuestions.map(
              (
                question,
                index
              ) => (

                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onEdit={() =>
                    handleEdit(
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


/* =========================================================
   COMPONENTS
========================================================= */

function QuestionStat({
  label,
  value,
  className = '',
}) {
  return (
    <article
      className={
        `question-admin-stat ${className}`
      }
    >

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </article>
  )
}


function FilterSelect({
  label,
  value,
  onChange,
  children,
}) {
  return (
    <div className="question-bank-select">

      <span>
        {label}
      </span>

      <select
        value={value}
        onChange={
          event =>
            onChange(
              event.target.value
            )
        }
      >
        {children}
      </select>

    </div>
  )
}


function QuestionCard({
  question,
  index,
  onEdit,
}) {
  const correctOptions =
    question.options.filter(
      option =>
        option.is_correct
    ).length


  return (
    <article className="question-bank-card">

      <div className="question-bank-index">
        {String(
          index + 1
        ).padStart(
          2,
          '0'
        )}
      </div>


      <div className="question-bank-content">

        <div className="question-bank-card-header">

          <div className="question-bank-tags">

            <span className="question-course-badge">
              {question.course?.title ||
                'Curso'}
            </span>


            <QuestionTypeBadge
              type={
                question.question_type
              }
            />


            <QuestionStatusBadge
              status={
                question.status
              }
            />

          </div>


          <button
            type="button"
            className="question-bank-edit"
            onClick={onEdit}
          >
            Ver / Editar
          </button>

        </div>


        <h3>
          {question.question_text}
        </h3>


        <div className="question-bank-meta">

          <span>
            <strong>
              {question.options.length}
            </strong>
            {' '}
            alternativas
          </span>


          <span>
            <strong>
              {correctOptions}
            </strong>
            {' '}
            {
              correctOptions === 1
                ? 'respuesta correcta'
                : 'respuestas correctas'
            }
          </span>


          <span>
            Debe seleccionar
            {' '}
            <strong>
              {
                question.required_selections ??
                1
              }
            </strong>
          </span>

        </div>


        <div className="question-bank-options">

          {question.options
            .slice(0, 4)
            .map(
              (
                option,
                optionIndex
              ) => (

                <div
                  key={option.id}
                  className={
                    option.is_correct
                      ? 'question-bank-option correct'
                      : 'question-bank-option'
                  }
                >

                  <span>
                    {
                      String.fromCharCode(
                        65 +
                        optionIndex
                      )
                    }
                  </span>

                  <p>
                    {option.option_text}
                  </p>

                  {option.is_correct && (
                    <strong>
                      ✓
                    </strong>
                  )}

                </div>

              )
            )}

        </div>

      </div>

    </article>
  )
}


function QuestionTypeBadge({
  type,
}) {
  return (
    <span className="question-type-badge">

      {type === 'MULTIPLE_CHOICE'
        ? 'Selección múltiple'
        : 'Selección única'}

    </span>
  )
}


function QuestionStatusBadge({
  status,
}) {
  const labels = {
    ACTIVE:
      'Activa',

    DRAFT:
      'Borrador',

    INACTIVE:
      'Inactiva',
  }


  return (
    <span
      className={
        `question-status-badge ` +
        `question-status-${(
          status ||
          'DRAFT'
        ).toLowerCase()}`
      }
    >
      {labels[status] ??
        status}
    </span>
  )
}