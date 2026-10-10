export default function CompanySection() {
  const values = [
    {
      number: '01',
      title: 'Nuestra misión',
      description:
        'Facilitar el aprendizaje mediante evaluaciones claras y resultados útiles para cada usuario.',
    },
    {
      number: '02',
      title: 'Nuestra visión',
      description:
        'Crear una plataforma escalable capaz de centralizar múltiples cursos y procesos de evaluación.',
    },
    {
      number: '03',
      title: 'Nuestro enfoque',
      description:
        'Simplicidad, seguimiento de resultados y mejora continua del aprendizaje.',
    },
  ]

  return (
    <section
      id="empresa"
      className="public-section public-company-section"
    >
      <div className="public-container public-company-grid">

        <div className="public-company-intro">

          <span className="public-eyebrow">
            Sobre nosotros
          </span>

          <h2>
            Aprendizaje y evaluación
            en un entorno centralizado
          </h2>

          <p>
            Nuestra plataforma facilita la gestión
            de cursos y evaluaciones, permitiendo
            que los usuarios validen sus conocimientos
            y conozcan su evolución.
          </p>

          <p>
            El objetivo es ofrecer una experiencia
            clara, organizada y accesible para
            aprendizaje y evaluación continua.
          </p>

          <div className="public-company-highlight">

            <div>
              <strong>
                Una sola plataforma
              </strong>

              <span>
                Cursos, evaluaciones, resultados
                e historial en un mismo espacio.
              </span>
            </div>

          </div>

        </div>


        <div className="public-company-values">

          {values.map(item => (

            <article
              key={item.number}
              className="public-company-value-card"
            >

              <div className="public-company-value-number">
                {item.number}
              </div>

              <div className="public-company-value-content">

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.description}
                </p>

              </div>

              <div className="public-company-value-arrow">
                →
              </div>

            </article>

          ))}

        </div>

      </div>
    </section>
  )
}