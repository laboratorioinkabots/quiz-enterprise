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
} from '../services/supabase'

import {
  useAuth,
} from '../context/AuthContext'
import PlatformHeader
  from '../components/platform/PlatformHeader'

export default function Courses() {
  const navigate = useNavigate()

  const {
    user,
    profile,
    signOut,
  } = useAuth()

  const [courses, setCourses] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [startingCourseId, setStartingCourseId] =
    useState(null)

  const [search, setSearch] =
    useState('')

  const [error, setError] =
    useState('')


  useEffect(() => {
    loadCourses()
  }, [])


  async function loadCourses() {
    try {
      setLoading(true)
      setError('')

      const {
        data,
        error,
      } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          status,
          passing_score,
          questions_per_attempt,
          created_at
        `)
        .eq(
          'status',
          'ACTIVE'
        )
        .order(
          'created_at',
          {
            ascending: false,
          }
        )

      if (error) {
        throw error
      }

      setCourses(
        data ?? []
      )

    } catch (err) {
      console.error(
        'Error cargando cursos:',
        err
      )

      setError(
        'No se pudieron cargar los cursos.'
      )

    } finally {
      setLoading(false)
    }
  }


  async function handleStartAttempt(courseId) {
    try {
      setStartingCourseId(courseId)
      setError('')

      const {
        data,
        error,
      } = await supabase.rpc(
        'start_attempt',
        {
          p_course_id: courseId,
        }
      )

      if (error) {
        throw error
      }

      /*
       * Si tu RPC devuelve directamente
       * el UUID:
       */

      const attemptId =
        typeof data === 'string'
          ? data
          : data?.attempt_id ||
            data?.id

      if (!attemptId) {
        throw new Error(
          'No se pudo obtener el intento creado.'
        )
      }

      navigate(
        `/exam/${attemptId}`
      )

    } catch (err) {
      console.error(
        'Error iniciando intento:',
        err
      )

      setError(
        err.message ||
        'No se pudo iniciar la evaluación.'
      )

    } finally {
      setStartingCourseId(null)
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


  const filteredCourses =
    useMemo(
      () => {

        const value =
          search
            .trim()
            .toLowerCase()

        if (!value) {
          return courses
        }

        return courses.filter(
          course =>
            course.title
              ?.toLowerCase()
              .includes(value) ||

            course.description
              ?.toLowerCase()
              .includes(value)
        )

      },
      [
        courses,
        search,
      ]
    )


  if (loading) {
    return (
      <div className="courses-page">

        <div className="courses-loading">
          <div className="courses-loading-spinner" />

          <span>
            Cargando cursos...
          </span>
        </div>

      </div>
    )
  }


  return (
    <div className="courses-page">

      {/* =====================================
          BACKGROUND DECORATION
      ====================================== */}

      <div className="courses-background-glow courses-glow-one" />
      <div className="courses-background-glow courses-glow-two" />


      {/* =====================================
          HEADER
      ====================================== */}

      <PlatformHeader />
      {/* =====================================
          CONTENT
      ====================================== */}

      <main className="courses-main">

        <div className="courses-container">

          {/* HEADING */}

          <section className="courses-heading">

            <div>

              <span className="courses-eyebrow">
                Mis cursos
              </span>

              <h1>
                Cursos disponibles
              </h1>

              <p>
                Selecciona un curso y continúa
                desarrollando tus conocimientos.
              </p>

            </div>


            <div className="courses-heading-counter">

              <strong>
                {courses.length}
              </strong>

              <span>
                {courses.length === 1
                  ? 'curso disponible'
                  : 'cursos disponibles'}
              </span>

            </div>

          </section>


          {/* TOOLBAR */}

          <section className="courses-toolbar">

            <div className="courses-search">

              <span>
                ⌕
              </span>

              <input
                type="search"
                value={search}
                placeholder="Buscar curso..."
                onChange={
                  event =>
                    setSearch(
                      event.target.value
                    )
                }
              />

            </div>

          </section>


          {/* ERROR */}

          {error && (

            <div className="courses-error">
              {error}
            </div>

          )}


          {/* EMPTY */}

          {filteredCourses.length === 0 ? (

            <div className="courses-empty">

              <div className="courses-empty-icon">
                ▤
              </div>

              <h2>
                No encontramos cursos
              </h2>

              <p>
                Intenta utilizar otro término
                de búsqueda.
              </p>

            </div>

          ) : (

            <section className="courses-grid">

              {filteredCourses.map(
                (
                  course,
                  index
                ) => (

                  <CourseCard
                    key={course.id}
                    course={course}
                    index={index}
                    loading={
                      startingCourseId ===
                      course.id
                    }
                    onHistory={() =>
                      navigate(
                        `/courses/${course.id}/history`
                      )
                    }
                    onStart={() =>
                      handleStartAttempt(
                        course.id
                      )
                    }
                  />

                )
              )}

            </section>

          )}

        </div>

      </main>

    </div>
  )
}


function CourseCard({
  course,
  index,
  loading,
  onHistory,
  onStart,
}) {
  const passingScore =
    Number(
      course.passing_score ?? 0
    )

  return (
    <article className="course-card">

      {/* COVER */}

      <div className="course-card-cover">

        <div className="course-card-cover-top">

          <span className="course-card-number">
            {String(
              index + 1
            ).padStart(
              2,
              '0'
            )}
          </span>

          <span className="course-status">
            Disponible
          </span>

        </div>


        <div className="course-card-symbol">

          {course.title
            ?.charAt(0)
            ?.toUpperCase() ||
            'C'}

        </div>


        <div className="course-card-cover-label">
          Curso
        </div>

      </div>


      {/* CONTENT */}

      <div className="course-card-body">

        <div className="course-card-heading">

          <h2>
            {course.title}
          </h2>

          <p>
            {course.description ||
              'Curso disponible para evaluación.'}
          </p>

        </div>


        {/* METRICS */}

        <div className="course-card-metrics">

          <CourseMetric
            label="Preguntas"
            value={
              course.questions_per_attempt ??
              '-'
            }
          />

          <CourseMetric
            label="Aprobación"
            value={
              `${passingScore.toFixed(0)}%`
            }
          />

        </div>


        {/* ACTIONS */}

        <div className="course-card-actions">

          <button
            type="button"
            className="course-history-button"
            onClick={onHistory}
          >
            Ver historial
          </button>


          <button
            type="button"
            className="course-start-button"
            disabled={loading}
            onClick={onStart}
          >
            {loading
              ? 'Iniciando...'
              : 'Nuevo intento'}

            {!loading && (
              <span>
                →
              </span>
            )}

          </button>

        </div>

      </div>

    </article>
  )
}


function CourseMetric({
  label,
  value,
}) {
  return (
    <div className="course-card-metric">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  )
}


function getInitials(
  fullName,
  email
) {
  if (
    fullName?.trim()
  ) {

    const parts =
      fullName
        .trim()
        .split(/\s+/)

    if (
      parts.length > 1
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
    email?.charAt(0) ||
    'U'
  ).toUpperCase()
}