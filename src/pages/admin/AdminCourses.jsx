import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import { supabase } from '../../services/supabase'

export default function AdminCourses() {
  const navigate = useNavigate()

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState('ALL')

  const [updatingId, setUpdatingId] =
    useState(null)

  const [deletingId, setDeletingId] =
    useState(null)

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    try {
      setLoading(true)
      setError('')

      const {
        data: coursesData,
        error: coursesError,
      } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          image_url,
          status,
          passing_score,
          questions_per_attempt,
          created_at,
          updated_at
        `)
        .order('created_at', {
          ascending: false,
        })

      if (coursesError) {
        throw coursesError
      }

      const {
        data: questionsData,
        error: questionsError,
      } = await supabase
        .from('questions')
        .select(`
          id,
          course_id,
          status
        `)

      if (questionsError) {
        throw questionsError
      }

      const questionStats = {}

      for (const question of questionsData ?? []) {
        if (!questionStats[question.course_id]) {
          questionStats[question.course_id] = {
            total: 0,
            active: 0,
          }
        }

        questionStats[question.course_id].total += 1

        if (question.status === 'ACTIVE') {
          questionStats[question.course_id].active += 1
        }
      }

      const mappedCourses =
        (coursesData ?? []).map(
          (course) => ({
            ...course,
            total_questions:
              questionStats[course.id]?.total ?? 0,

            active_questions:
              questionStats[course.id]?.active ?? 0,
          })
        )

      setCourses(mappedCourses)
    } catch (err) {
      console.error(
        'Error cargando cursos:',
        err
      )

      setError(
        err.message ||
          'No se pudieron cargar los cursos.'
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title
          .toLowerCase()
          .includes(
            search
              .trim()
              .toLowerCase()
          ) ||
        (course.description ?? '')
          .toLowerCase()
          .includes(
            search
              .trim()
              .toLowerCase()
          )

      const matchesStatus =
        statusFilter === 'ALL' ||
        course.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [
    courses,
    search,
    statusFilter,
  ])

  async function handleStatusChange(
    course,
    newStatus
  ) {
    try {
      setUpdatingId(course.id)
      setError('')

      if (
        newStatus === 'ACTIVE' &&
        course.active_questions <
          course.questions_per_attempt
      ) {
        setError(
          `No puedes activar "${course.title}". ` +
          `Necesita ${course.questions_per_attempt} preguntas activas ` +
          `y actualmente tiene ${course.active_questions}.`
        )

        return
      }

      const { error } = await supabase
        .from('courses')
        .update({
          status: newStatus,
        })
        .eq('id', course.id)

      if (error) {
        throw error
      }

      setCourses((previous) =>
        previous.map((item) =>
          item.id === course.id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      )
    } catch (err) {
      console.error(
        'Error actualizando curso:',
        err
      )

      setError(
        err.message ||
          'No se pudo actualizar el curso.'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleDelete(course) {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el curso "${course.title}"?\n\n` +
      'También se eliminarán sus preguntas asociadas.'
    )

    if (!confirmed) {
      return
    }

    try {
      setDeletingId(course.id)
      setError('')

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', course.id)

      if (error) {
        throw error
      }

      setCourses((previous) =>
        previous.filter(
          (item) =>
            item.id !== course.id
        )
      )
    } catch (err) {
      console.error(
        'Error eliminando curso:',
        err
      )

      setError(
        err.message ||
          'No se pudo eliminar el curso.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        Cargando cursos...
      </div>
    )
  }

  return (
    <div>

      <section className="admin-page-heading">

        <div>
          <span className="admin-eyebrow">
            Gestión académica
          </span>

          <h1>
            Cursos
          </h1>

          <p>
            Crea y administra los cursos,
            configuración de evaluación y
            disponibilidad para los usuarios.
          </p>
        </div>

        <button
          className="admin-primary-button"
          onClick={() =>
            navigate('/admin/courses/new')
          }
        >
          + Nuevo curso
        </button>

      </section>

      {error && (
        <div className="admin-error-message">
          {error}
        </div>
      )}

      <section className="admin-toolbar">

        <div className="admin-search-box">
          <span>⌕</span>

          <input
            type="search"
            value={search}
            placeholder="Buscar curso..."
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <select
          className="admin-filter-select"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="ALL">
            Todos los estados
          </option>

          <option value="ACTIVE">
            Activos
          </option>

          <option value="DRAFT">
            Borrador
          </option>

          <option value="INACTIVE">
            Inactivos
          </option>
        </select>

      </section>

      <section className="admin-panel">

        <div className="admin-panel-heading">

          <div>
            <h2>
              Cursos registrados
            </h2>

            <p>
              {filteredCourses.length}
              {' '}
              curso(s) encontrado(s)
            </p>
          </div>

        </div>

        {filteredCourses.length === 0 ? (

          <div className="admin-empty-state">

            <h3>
              No se encontraron cursos
            </h3>

            <p>
              Ajusta los filtros o crea
              un nuevo curso.
            </p>

          </div>

        ) : (

          <div className="admin-course-list">

            {filteredCourses.map(
              (course) => {

                const hasEnoughQuestions =
                  course.active_questions >=
                  course.questions_per_attempt

                return (
                  <article
                    key={course.id}
                    className="admin-course-card"
                  >

                    <div className="admin-course-main">

                      <div className="admin-course-title-row">

                        <div>

                          <h3>
                            {course.title}
                          </h3>

                          <StatusBadge
                            status={course.status}
                          />

                        </div>

                        <div className="admin-course-menu">

                          <button
                            className="admin-small-button"
                            onClick={() =>
                              navigate(
                                `/admin/courses/${course.id}/edit`
                              )
                            }
                          >
                            Editar
                          </button>

                        </div>

                      </div>

                      <p className="admin-course-description">
                        {course.description ||
                          'Sin descripción'}
                      </p>

                      <div className="admin-course-metrics">

                        <Metric
                          label="Preguntas totales"
                          value={
                            course.total_questions
                          }
                        />

                        <Metric
                          label="Preguntas activas"
                          value={
                            course.active_questions
                          }
                        />

                        <Metric
                          label="Por intento"
                          value={
                            course.questions_per_attempt
                          }
                        />

                        <Metric
                          label="Nota mínima"
                          value={
                            `${Number(
                              course.passing_score
                            ).toFixed(0)}%`
                          }
                        />

                      </div>

                      {!hasEnoughQuestions && (
                        <div className="admin-course-warning">

                          <strong>
                            Curso incompleto
                          </strong>

                          <span>
                            Faltan{' '}
                            {
                              course.questions_per_attempt -
                              course.active_questions
                            }{' '}
                            pregunta(s) activa(s)
                            para habilitar una evaluación.
                          </span>

                        </div>
                      )}

                    </div>

                    <div className="admin-course-side">

                      <button
                        className="admin-outline-button"
                        onClick={() =>
                          navigate(
                            `/admin/courses/${course.id}/questions`
                          )
                        }
                      >
                        Administrar preguntas
                      </button>

                      <select
                        className="admin-course-status-select"
                        value={course.status}
                        disabled={
                          updatingId === course.id
                        }
                        onChange={(event) =>
                          handleStatusChange(
                            course,
                            event.target.value
                          )
                        }
                      >
                        <option value="DRAFT">
                          Borrador
                        </option>

                        <option value="ACTIVE">
                          Activo
                        </option>

                        <option value="INACTIVE">
                          Inactivo
                        </option>
                      </select>

                      <button
                        className="admin-danger-button"
                        disabled={
                          deletingId === course.id
                        }
                        onClick={() =>
                          handleDelete(course)
                        }
                      >
                        {deletingId ===
                        course.id
                          ? 'Eliminando...'
                          : 'Eliminar'}
                      </button>

                    </div>

                  </article>
                )
              }
            )}

          </div>

        )}

      </section>

    </div>
  )
}

function Metric({
  label,
  value,
}) {
  return (
    <div className="admin-course-metric">
      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>
    </div>
  )
}

function StatusBadge({ status }) {
  const labels = {
    ACTIVE: 'Activo',
    DRAFT: 'Borrador',
    INACTIVE: 'Inactivo',
  }

  return (
    <span
      className={
        `admin-status-badge ` +
        `admin-status-${status.toLowerCase()}`
      }
    >
      {labels[status] ?? status}
    </span>
  )
}