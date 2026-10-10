import {
  useEffect,
  useState,
} from 'react'

import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import { supabase } from '../../services/supabase'

const initialForm = {
  title: '',
  description: '',
  image_url: '',
  passing_score: 70,
  questions_per_attempt: 10,
  status: 'DRAFT',
}

export default function AdminCourseForm() {
  const navigate = useNavigate()
  const { courseId } = useParams()

  const isEditing = Boolean(courseId)

  const [form, setForm] =
    useState(initialForm)

  const [activeQuestions, setActiveQuestions] =
    useState(0)

  const [loading, setLoading] =
    useState(isEditing)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  useEffect(() => {
    if (courseId) {
      loadCourse()
    }
  }, [courseId])

  async function loadCourse() {
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
          image_url,
          status,
          passing_score,
          questions_per_attempt
        `)
        .eq('id', courseId)
        .single()

      if (error) {
        throw error
      }

      setForm({
        title:
          data.title ?? '',

        description:
          data.description ?? '',

        image_url:
          data.image_url ?? '',

        status:
          data.status ?? 'DRAFT',

        passing_score:
          Number(
            data.passing_score ?? 70
          ),

        questions_per_attempt:
          Number(
            data.questions_per_attempt ?? 10
          ),
      })

      const {
        count,
        error: countError,
      } = await supabase
        .from('questions')
        .select(
          '*',
          {
            count: 'exact',
            head: true,
          }
        )
        .eq(
          'course_id',
          courseId
        )
        .eq(
          'status',
          'ACTIVE'
        )

      if (countError) {
        throw countError
      }

      setActiveQuestions(
        count ?? 0
      )
    } catch (err) {
      console.error(
        'Error cargando curso:',
        err
      )

      setError(
        err.message ||
          'No se pudo cargar el curso.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    setForm((previous) => ({
      ...previous,

      [name]:
        name === 'passing_score' ||
        name === 'questions_per_attempt'
          ? Number(value)
          : value,
    }))
  }

  function validateForm() {
    if (!form.title.trim()) {
      return 'El título del curso es obligatorio.'
    }

    if (
      form.passing_score < 0 ||
      form.passing_score > 100
    ) {
      return 'La nota mínima debe estar entre 0 y 100.'
    }

    if (
      !Number.isInteger(
        form.questions_per_attempt
      ) ||
      form.questions_per_attempt < 1
    ) {
      return 'La cantidad de preguntas por intento debe ser mayor a 0.'
    }

    if (
      form.status === 'ACTIVE' &&
      activeQuestions <
        form.questions_per_attempt
    ) {
      return (
        'No se puede activar el curso. ' +
        `Necesita ${form.questions_per_attempt} preguntas activas ` +
        `y actualmente tiene ${activeQuestions}.`
      )
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validation =
      validateForm()

    if (validation) {
      setError(validation)
      return
    }

    try {
      setSaving(true)
      setError('')

      const payload = {
        title:
          form.title.trim(),

        description:
          form.description.trim() ||
          null,

        image_url:
          form.image_url.trim() ||
          null,

        status:
          form.status,

        passing_score:
          form.passing_score,

        questions_per_attempt:
          form.questions_per_attempt,
      }

      if (isEditing) {

        const { error } =
          await supabase
            .from('courses')
            .update(payload)
            .eq(
              'id',
              courseId
            )

        if (error) {
          throw error
        }

      } else {

        const { error } =
          await supabase
            .from('courses')
            .insert(payload)

        if (error) {
          throw error
        }

      }

      navigate(
        '/admin/courses'
      )
    } catch (err) {
      console.error(
        'Error guardando curso:',
        err
      )

      setError(
        err.message ||
          'No se pudo guardar el curso.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        Cargando curso...
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
            {isEditing
              ? 'Editar curso'
              : 'Nuevo curso'}
          </h1>

          <p>
            Configura la información principal
            y las reglas de evaluación del curso.
          </p>

        </div>

        <button
          className="admin-outline-button"
          onClick={() =>
            navigate('/admin/courses')
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
        className="admin-course-form-layout"
        onSubmit={handleSubmit}
      >

        <section className="admin-panel">

          <div className="admin-panel-heading">
            <div>
              <h2>
                Información general
              </h2>

              <p>
                Información visible para
                los usuarios de la plataforma.
              </p>
            </div>
          </div>

          <div className="admin-form-grid">

            <div className="admin-field admin-field-full">

              <label htmlFor="title">
                Nombre del curso
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                placeholder="Ej. Automatización Web"
                onChange={handleChange}
              />

            </div>

            <div className="admin-field admin-field-full">

              <label htmlFor="description">
                Descripción
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                rows="5"
                placeholder="Describe brevemente el contenido del curso..."
                onChange={handleChange}
              />

            </div>

            <div className="admin-field admin-field-full">

              <label htmlFor="image_url">
                URL de imagen
              </label>

              <input
                id="image_url"
                name="image_url"
                type="url"
                value={form.image_url}
                placeholder="https://..."
                onChange={handleChange}
              />

              <small>
                Opcional. Más adelante podemos
                cambiarlo a carga directa mediante
                Supabase Storage.
              </small>

            </div>

          </div>

        </section>

        <aside className="admin-course-form-side">

          <section className="admin-panel">

            <div className="admin-panel-heading">

              <div>
                <h2>
                  Evaluación
                </h2>

                <p>
                  Configuración del examen.
                </p>
              </div>

            </div>

            <div className="admin-field">

              <label htmlFor="passing_score">
                Nota mínima (%)
              </label>

              <input
                id="passing_score"
                name="passing_score"
                type="number"
                min="0"
                max="100"
                step="1"
                value={
                  form.passing_score
                }
                onChange={handleChange}
              />

            </div>

            <div className="admin-field">

              <label htmlFor="questions_per_attempt">
                Preguntas por intento
              </label>

              <input
                id="questions_per_attempt"
                name="questions_per_attempt"
                type="number"
                min="1"
                step="1"
                value={
                  form.questions_per_attempt
                }
                onChange={handleChange}
              />

            </div>

            {isEditing && (
              <div className="admin-question-capacity">

                <span>
                  Preguntas activas
                </span>

                <strong>
                  {activeQuestions}
                </strong>

              </div>
            )}

          </section>

          <section className="admin-panel">

            <div className="admin-panel-heading">

              <div>
                <h2>
                  Publicación
                </h2>

                <p>
                  Controla la disponibilidad
                  del curso.
                </p>
              </div>

            </div>

            <div className="admin-field">

              <label htmlFor="status">
                Estado
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
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

            </div>

            {form.status === 'ACTIVE' &&
              activeQuestions <
                form.questions_per_attempt && (
                <div className="admin-inline-warning">

                  Faltan{' '}
                  {
                    form.questions_per_attempt -
                    activeQuestions
                  }{' '}
                  preguntas activas.

                </div>
              )}

          </section>

          <div className="admin-form-actions">

            <button
              type="button"
              className="admin-outline-button"
              onClick={() =>
                navigate('/admin/courses')
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
                  : 'Crear curso'}
            </button>

          </div>

        </aside>

      </form>

    </div>
  )
}