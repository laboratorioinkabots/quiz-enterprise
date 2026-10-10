import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  supabase,
} from '../../services/supabase'

import {
  useAuth,
} from '../../context/AuthContext'


export default function PublicCourses() {
  const {
    user,
    profile,
  } = useAuth()

  const [courses, setCourses] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')


  /*
   * =========================================
   * CARGAR CURSOS
   * =========================================
   */

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
          passing_score,
          questions_per_attempt,
          status,
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
        .limit(6)

      if (error) {
        throw error
      }

      setCourses(
        data ?? []
      )

    } catch (err) {
      console.error(
        'Error cargando cursos públicos:',
        err
      )

      setError(
        'No se pudieron cargar los cursos disponibles.'
      )

    } finally {
      setLoading(false)
    }
  }


  /*
   * =========================================
   * DESTINO SEGÚN SESIÓN
   * =========================================
   */

  const isAuthenticated =
    Boolean(
      user &&
      profile?.status === 'ACTIVE'
    )

  const courseLink =
    isAuthenticated
      ? profile?.role === 'ADMIN'
        ? '/admin'
        : '/courses'
      : '/login'


  /*
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <section
      id="cursos"
      className="public-section public-courses-section"
    >

      <div className="public-container">

        {/* =================================
            ENCABEZADO
        ================================= */}

        <div className="public-section-heading public-heading-row">

          <div>

            <span className="public-eyebrow">
              Cursos
            </span>

            <h2>
              Continúa desarrollando
              tus conocimientos
            </h2>

            <p>
              Explora algunos de los cursos
              disponibles en la plataforma.
            </p>

          </div>

          <Link
            to={courseLink}
            className="public-secondary-button"
          >
            Ver todos los cursos
          </Link>

        </div>


        {/* =================================
            LOADING
        ================================= */}

        {loading && (

          <div className="public-loading">
            Cargando cursos...
          </div>

        )}


        {/* =================================
            ERROR
        ================================= */}

        {!loading && error && (

          <div className="public-empty">

            <strong>
              No pudimos cargar los cursos
            </strong>

            <p>
              {error}
            </p>

          </div>

        )}


        {/* =================================
            SIN CURSOS
        ================================= */}

        {!loading &&
          !error &&
          courses.length === 0 && (

            <div className="public-empty">

              Próximamente tendremos nuevos
              cursos disponibles.

            </div>

          )}


        {/* =================================
            CURSOS
        ================================= */}

        {!loading &&
          !error &&
          courses.length > 0 && (

            <div className="public-courses-grid">

              {courses.map(
                (
                  course,
                  index
                ) => (

                  <article
                    key={course.id}
                    className="public-course-card"
                  >

                    {/* COVER */}

                    <div className="public-course-cover">

                      <div className="public-course-cover-top">

                        <span>
                          Curso
                        </span>

                        <span>
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            '0'
                          )}
                        </span>

                      </div>


                      <div className="public-course-cover-icon">

                        {course.title
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          'C'}

                      </div>

                    </div>


                    {/* CONTENT */}

                    <div className="public-course-content">

                      <span className="public-course-label">
                        Curso disponible
                      </span>

                      <h3>
                        {course.title}
                      </h3>

                      <p>
                        {
                          course.description ||
                          'Curso disponible para evaluación en la plataforma.'
                        }
                      </p>


                      {/* METADATA */}

                      <div className="public-course-meta">

                        <div>

                          <span>
                            Preguntas
                          </span>

                          <strong>
                            {
                              course.questions_per_attempt ??
                              '-'
                            }
                          </strong>

                        </div>


                        <div>

                          <span>
                            Nota mínima
                          </span>

                          <strong>

                            {
                              course.passing_score !==
                                null &&
                              course.passing_score !==
                                undefined
                                ? `${Number(
                                    course.passing_score
                                  ).toFixed(0)}%`
                                : '-'
                            }

                          </strong>

                        </div>

                      </div>


                      {/* ACTION */}

                      <Link
                        to={courseLink}
                        className="public-course-action"
                      >

                        <span>

                          {isAuthenticated
                            ? profile?.role === 'ADMIN'
                              ? 'Ir al Dashboard'
                              : 'Acceder al curso'
                            : 'Iniciar sesión para acceder'}

                        </span>

                        <strong>
                          →
                        </strong>

                      </Link>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

      </div>

    </section>
  )
}