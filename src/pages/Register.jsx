import {
  useState,
} from 'react'

import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import {
  supabase,
} from '../services/supabase'

import {
  useAuth,
} from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()

  const {
    user,
    loading: authLoading,
  } = useAuth()

  const [fullName, setFullName] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  if (authLoading) {
    return (
      <div className="screen-center">
        Cargando...
      </div>
    )
  }

  if (user) {
    return (
      <Navigate
        to="/courses"
        replace
      />
    )
  }

  function validate() {
    if (!fullName.trim()) {
      return 'Ingresa tu nombre completo.'
    }

    if (!email.trim()) {
      return 'Ingresa tu correo electrónico.'
    }

    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.'
    }

    if (
      password !==
      confirmPassword
    ) {
      return 'Las contraseñas no coinciden.'
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
      setLoading(true)
      setError('')
      setSuccess('')

      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email:
          email
            .trim()
            .toLowerCase(),

        password,

        options: {
          data: {
            full_name:
              fullName.trim(),
          },
        },
      })

      if (error) {
        throw error
      }

      /*
       * Si Confirm email está desactivado,
       * Supabase normalmente devuelve una sesión.
       */

      if (data.session) {
        navigate(
          '/courses',
          {
            replace: true,
          }
        )

        return
      }

      /*
       * Si Confirm email está activado,
       * el usuario debe verificar el correo.
       */

      setSuccess(
        'Cuenta creada correctamente. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.'
      )

      setPassword('')
      setConfirmPassword('')

    } catch (err) {
      console.error(
        'Error registro:',
        err
      )

      if (
        err.message
          ?.toLowerCase()
          .includes(
            'already registered'
          )
      ) {
        setError(
          'Ya existe una cuenta registrada con este correo.'
        )
      } else {
        setError(
          err.message ||
          'No se pudo crear la cuenta.'
        )
      }

    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">

      <section className="auth-card">
        <Link
          to="/"
          className="auth-back-home"
        >
          ← Volver al inicio
        </Link>
        <div className="auth-brand">
          QE
        </div>

        <div className="auth-heading">

          <span>
            Plataforma de aprendizaje
          </span>

          <h1>
            Crear cuenta
          </h1>

          <p>
            Regístrate para acceder a
            los cursos y evaluaciones.
          </p>

        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-field">

            <label
              htmlFor="fullName"
            >
              Nombre completo
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              autoComplete="name"
              placeholder="Ej. Juan Pérez"
              onChange={
                event =>
                  setFullName(
                    event.target.value
                  )
              }
            />

          </div>

          <div className="auth-field">

            <label
              htmlFor="registerEmail"
            >
              Correo electrónico
            </label>

            <input
              id="registerEmail"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="usuario@correo.com"
              onChange={
                event =>
                  setEmail(
                    event.target.value
                  )
              }
            />

          </div>

          <div className="auth-field">

            <label
              htmlFor="registerPassword"
            >
              Contraseña
            </label>

            <input
              id="registerPassword"
              type="password"
              value={password}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              onChange={
                event =>
                  setPassword(
                    event.target.value
                  )
              }
            />

            <small>
              Utiliza al menos 8 caracteres.
            </small>

          </div>

          <div className="auth-field">

            <label
              htmlFor="confirmPassword"
            >
              Confirmar contraseña
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              autoComplete="new-password"
              placeholder="Repite tu contraseña"
              onChange={
                event =>
                  setConfirmPassword(
                    event.target.value
                  )
              }
            />

          </div>

          <button
            type="submit"
            className="auth-primary-button"
            disabled={loading}
          >
            {loading
              ? 'Creando cuenta...'
              : 'Crear cuenta'}
          </button>

        </form>

        <div className="auth-footer">

          <span>
            ¿Ya tienes una cuenta?
          </span>

          <Link to="/login">
            Iniciar sesión
          </Link>

        </div>

      </section>

    </main>
  )
}