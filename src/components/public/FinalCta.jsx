import {
  Link,
} from 'react-router-dom'

import {
  useAuth,
} from '../../context/AuthContext'


export default function FinalCta() {
  const {
    user,
    profile,
  } = useAuth()


  const authenticated =
    Boolean(
      user &&
      profile?.status === 'ACTIVE'
    )


  const destination =
    authenticated
      ? profile?.role === 'ADMIN'
        ? '/admin'
        : '/courses'
      : '/register'


  const label =
    authenticated
      ? profile?.role === 'ADMIN'
        ? 'Ir al Dashboard'
        : 'Ir a mis cursos'
      : 'Crear cuenta'


  return (
    <section className="public-final-cta">

      <div className="public-container">

        <div className="public-final-cta-inner">

          <span className="public-final-eyebrow">
            Comienza hoy
          </span>

          <h2>
            ¿Listo para seguir
            desarrollando tus conocimientos?
          </h2>

          <p>
            Explora los cursos disponibles,
            realiza evaluaciones y consulta
            tus resultados desde un solo lugar.
          </p>


          <div className="public-final-actions">

            <Link
              to={destination}
              className="public-final-primary"
            >
              {label}

              <strong>
                →
              </strong>
            </Link>


            {!authenticated && (

              <Link
                to="/login"
                className="public-final-secondary"
              >
                Iniciar sesión
              </Link>

            )}

          </div>

        </div>

      </div>

    </section>
  )
}