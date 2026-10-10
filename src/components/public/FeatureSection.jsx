const features = [
  {
    icon: '▤',
    title: 'Cursos',
    description:
      'Accede a diferentes contenidos y evaluaciones desde un único espacio.',
  },
  {
    icon: '✓',
    title: 'Evaluaciones',
    description:
      'Demuestra tus conocimientos mediante preguntas interactivas.',
  },
  {
    icon: '%',
    title: 'Resultados inmediatos',
    description:
      'Conoce tu puntaje apenas finalices cada evaluación.',
  },
  {
    icon: '↻',
    title: 'Retroalimentación',
    description:
      'Identifica tus errores y refuerza los conocimientos que necesitas mejorar.',
  },
  {
    icon: '◷',
    title: 'Historial',
    description:
      'Consulta tus intentos anteriores y observa cómo evolucionan tus resultados.',
  },
  {
    icon: '↗',
    title: 'Progreso',
    description:
      'Realiza nuevos intentos y mejora progresivamente tu rendimiento.',
  },
]

export default function FeatureSection() {
  return (
    <section className="public-section public-features-section">

      <div className="public-container">

        <div className="public-section-heading public-section-heading-center">

          <span className="public-eyebrow">
            Todo en un solo lugar
          </span>

          <h2>
            Una plataforma pensada
            para tu aprendizaje
          </h2>

          <p>
            Herramientas simples y útiles para
            acompañarte durante todo el proceso
            de evaluación.
          </p>

        </div>

        <div className="public-features-grid">

          {features.map(feature => (
            <article
              key={feature.title}
              className="public-feature-card"
            >

              <div className="public-feature-icon">
                {feature.icon}
              </div>

              <div className="public-feature-content">

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {feature.description}
                </p>

              </div>

            </article>
          ))}

        </div>

      </div>

    </section>
  )
}