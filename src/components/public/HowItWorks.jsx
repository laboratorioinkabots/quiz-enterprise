export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Crea tu cuenta',
      description:
        'Regístrate y accede a tu espacio personal de aprendizaje.',
    },
    {
      number: '02',
      title: 'Selecciona un curso',
      description:
        'Explora los cursos disponibles y elige el que deseas realizar.',
    },
    {
      number: '03',
      title: 'Realiza la evaluación',
      description:
        'Responde preguntas de selección simple o múltiple.',
    },
    {
      number: '04',
      title: 'Consulta tus resultados',
      description:
        'Conoce tu puntaje y revisa las preguntas que necesitas reforzar.',
    },
  ]

  return (
    <section
      id="como-funciona"
      className="public-section public-how-section"
    >
      <div className="public-container">

        <div className="public-section-heading">
          <span className="public-eyebrow">
            Cómo funciona
          </span>

          <h2>
            Aprender y evaluar tus
            conocimientos es sencillo
          </h2>

          <p>
            Todo el proceso está diseñado para
            que puedas concentrarte en aprender.
          </p>
        </div>

        <div className="public-steps-grid">

          {steps.map((step, index) => (
            <article
              key={step.number}
              className="public-step-card"
            >
              <div className="public-step-top">

                <span className="public-step-number">
                  {step.number}
                </span>

                <span className="public-step-icon">
                  {getStepIcon(index)}
                </span>

              </div>

              <h3>
                {step.title}
              </h3>

              <p>
                {step.description}
              </p>

              <div className="public-step-footer">
                Paso {step.number}
              </div>

            </article>
          ))}

        </div>

      </div>
    </section>
  )
}

function getStepIcon(index) {
  const icons = [
    '＋',
    '▤',
    '✓',
    '↗',
  ]

  return icons[index]
}