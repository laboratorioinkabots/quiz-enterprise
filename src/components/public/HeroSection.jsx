import {
  useRef,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  useAuth,
} from '../../context/AuthContext'


export default function HeroSection() {
  const {
    user,
    profile,
  } = useAuth()

  const heroRef =
    useRef(null)


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


  const primaryLabel =
    authenticated
      ? profile?.role === 'ADMIN'
        ? 'Ir al Dashboard'
        : 'Ir a mis cursos'
      : 'Comenzar ahora'


  function handleMouseMove(event) {
    const element =
      heroRef.current

    if (!element) {
      return
    }

    const bounds =
      element.getBoundingClientRect()

    const x =
      event.clientX -
      bounds.left

    const y =
      event.clientY -
      bounds.top

    const percentX =
      x /
      bounds.width

    const percentY =
      y /
      bounds.height

    element.style.setProperty(
      '--mouse-x',
      `${percentX * 100}%`
    )

    element.style.setProperty(
      '--mouse-y',
      `${percentY * 100}%`
    )

    element.style.setProperty(
      '--move-x',
      `${(percentX - .5) * -18}px`
    )

    element.style.setProperty(
      '--move-y',
      `${(percentY - .5) * -12}px`
    )
  }


  return (
    <section
      id="inicio"
      ref={heroRef}
      className="public-hero"
      onMouseMove={handleMouseMove}
    >

      {/* INTERACTIVE GLOW */}

      <div className="public-hero-pointer-glow" />


      <div className="public-container public-hero-grid">

        <div className="public-hero-content">

          <span className="public-hero-eyebrow">
            Plataforma de aprendizaje y evaluación
          </span>


          <h1>

            <span>
              Aprende.
            </span>

            <span className="public-hero-accent">
              Evalúa.
            </span>

            <span>
              Mejora.
            </span>

          </h1>


          <p>
            Una plataforma diseñada para
            fortalecer tus conocimientos mediante
            cursos, evaluaciones interactivas y
            resultados inmediatos.
          </p>


          <div className="public-hero-actions">

            <Link
              to={destination}
              className="public-hero-primary"
            >
              <span>
                {primaryLabel}
              </span>

              <strong>
                →
              </strong>
            </Link>


            <a
              href="#como-funciona"
              className="public-hero-secondary"
            >
              Cómo funciona
            </a>

          </div>


          <div className="public-hero-features">

            <HeroFeature
              icon="▤"
              title="Cursos"
              text="Contenido actualizado"
            />

            <HeroFeature
              icon="▥"
              title="Resultados"
              text="Feedback inmediato"
            />

            <HeroFeature
              icon="◎"
              title="Aprendizaje continuo"
              text="A tu propio ritmo"
            />

          </div>

        </div>

      </div>

    </section>
  )
}


function HeroFeature({
  icon,
  title,
  text,
}) {
  return (
    <div className="public-hero-feature">

      <div className="public-hero-feature-icon">
        {icon}
      </div>

      <div>

        <strong>
          {title}
        </strong>

        <span>
          {text}
        </span>

      </div>

    </div>
  )
}