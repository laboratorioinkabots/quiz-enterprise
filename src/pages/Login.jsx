import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()

  const {
    user,
    profile,
    loading: authLoading,
    signIn,
    authMessage,
    setAuthMessage,
  } = useAuth()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [error, setError] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  /*
   * =========================================
   * REDIRECCIONAR SOLO CUANDO:
   *
   * - existe usuario
   * - existe profile
   * - el usuario está ACTIVE
   * =========================================
   */

    useEffect(() => {
      if (
        !user ||
        profile?.status !== 'ACTIVE'
      ) {
        return
      }

      if (
        profile.role === 'ADMIN'
      ) {
        navigate(
          '/admin',
          {
            replace: true,
          }
        )

        return
      }

      navigate(
        '/courses',
        {
          replace: true,
        }
      )
    }, [
      user,
      profile,
      navigate,
    ])

  /*
   * =========================================
   * LOGIN
   * =========================================
   */

  async function handleSubmit(
    event
  ) {
    event.preventDefault()

    setError('')
    setAuthMessage('')
    setLoading(true)

    try {
      const {
        error: authError,
      } = await signIn(
        email,
        password
      )

      if (authError) {
        console.error(
          'Error login:',
          authError
        )

        /*
         * EMAIL NO CONFIRMADO
         */

        if (
          authError.message ===
          'Email not confirmed'
        ) {
          setError(
            'Debes confirmar tu correo electrónico antes de iniciar sesión.'
          )

          return
        }

        /*
         * CREDENCIALES INCORRECTAS
         */

        if (
          authError.message
            ?.toLowerCase()
            .includes(
              'invalid login credentials'
            )
        ) {
          setError(
            'Correo o contraseña incorrectos.'
          )

          return
        }

        /*
         * OTRO ERROR DE SUPABASE AUTH
         */

        setError(
          authError.message ||
          'No se pudo iniciar sesión.'
        )

        return
      }

      /*
       * IMPORTANTE:
       *
       * NO hacemos:
       *
       * navigate('/courses')
       *
       * porque primero AuthContext
       * debe cargar el profile y validar:
       *
       * profile.status === ACTIVE
       *
       * Si está INACTIVE:
       *
       * AuthContext hará signOut()
       * y mostrará authMessage.
       */

    } catch (err) {
      console.error(
        'Error inesperado en login:',
        err
      )

      setError(
        'Ocurrió un error inesperado al iniciar sesión.'
      )

    } finally {
      setLoading(false)
    }
  }

  /*
   * =========================================
   * CARGA INICIAL
   * =========================================
   */

  if (authLoading) {
    return (
      <div className="screen-center">
        <p>
          Cargando...
        </p>
      </div>
    )
  }

  /*
   * =========================================
   * SI YA ESTÁ AUTENTICADO Y ACTIVE
   * =========================================
   */

  if (
      user &&
      profile?.status === 'ACTIVE'
    ) {
      return (
        <Navigate
          to={
            profile.role === 'ADMIN'
              ? '/admin'
              : '/courses'
          }
          replace
        />
      )
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
        {/* LOGO */}

        <div className="auth-brand">
          QE
        </div>


        {/* TITULO */}

        <div className="auth-heading">

          <span>
            Plataforma de aprendizaje
          </span>

          <h1>
            Iniciar sesión
          </h1>

          <p>
            Ingresa tus credenciales para
            acceder a tus cursos y evaluaciones.
          </p>

        </div>


        {/* MENSAJES */}

        {(authMessage || error) && (

          <div className="auth-error">
            {authMessage || error}
          </div>

        )}


        {/* FORMULARIO */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* EMAIL */}

          <div className="auth-field">

            <label
              htmlFor="email"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="usuario@correo.com"
              required
              onChange={
                event => {
                  setEmail(
                    event.target.value
                  )

                  /*
                   * Limpiamos mensajes
                   * al volver a escribir.
                   */

                  if (error) {
                    setError('')
                  }

                  if (authMessage) {
                    setAuthMessage('')
                  }
                }
              }
            />

          </div>


          {/* PASSWORD */}

          <div className="auth-field">

            <label
              htmlFor="password"
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              value={password}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              required
              onChange={
                event => {
                  setPassword(
                    event.target.value
                  )

                  if (error) {
                    setError('')
                  }

                  if (authMessage) {
                    setAuthMessage('')
                  }
                }
              }
            />

          </div>


          {/* BOTON */}

          <button
            type="submit"
            className="auth-primary-button"
            disabled={
              loading ||
              authLoading
            }
          >
            {loading
              ? 'Ingresando...'
              : 'Iniciar sesión'}
          </button>

        </form>


        {/* REGISTRO */}

        <div className="auth-footer">

          <span>
            ¿No tienes una cuenta?
          </span>

          <Link to="/register">
            Crear cuenta
          </Link>

        </div>

      </section>

    </main>
  )
}