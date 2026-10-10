import {
  useState,
} from 'react'

const questions = [
  {
    question:
      '¿Necesito una cuenta para realizar las evaluaciones?',

    answer:
      'Sí. Debes crear una cuenta para acceder a los cursos, realizar evaluaciones y guardar tu historial.',
  },
  {
    question:
      '¿Cómo se calcula mi puntaje?',

    answer:
      'El puntaje se calcula según la cantidad de preguntas respondidas correctamente respecto al total de preguntas del intento.',
  },
  {
    question:
      '¿Puedo realizar nuevamente una evaluación?',

    answer:
      'Sí. Puedes realizar nuevos intentos y consultar los resultados anteriores desde el historial del curso.',
  },
  {
    question:
      '¿Dónde puedo consultar mis resultados anteriores?',

    answer:
      'Dentro de cada curso puedes acceder a tu historial de intentos y revisar los resultados obtenidos anteriormente.',
  },
  {
    question:
      '¿Qué ocurre si respondo incorrectamente una pregunta?',

    answer:
      'Al finalizar la evaluación podrás revisar las preguntas falladas y conocer cuáles eran las respuestas correctas.',
  },
]

export default function FaqSection() {
  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0)

  function toggleQuestion(index) {
    setActiveIndex(
      activeIndex === index
        ? null
        : index
    )
  }

  return (
    <section
      id="faq"
      className="public-section public-faq-section"
    >

      <div className="public-container public-faq-grid">

        {/* ================================
            INFORMACIÓN
        ================================= */}

        <div className="public-faq-intro">

          <span className="public-eyebrow">
            Preguntas frecuentes
          </span>

          <h2>
            Información que
            puede ayudarte
          </h2>

          <p>
            Encuentra respuestas rápidas
            sobre el funcionamiento de la
            plataforma.
          </p>


          <div className="public-faq-help">

            <div className="public-faq-help-icon">
              ?
            </div>

            <div>

              <strong>
                ¿Tienes otra consulta?
              </strong>

              <span>
                Puedes comunicarte con nuestro
                equipo para recibir ayuda.
              </span>

            </div>

          </div>

        </div>


        {/* ================================
            QUESTIONS
        ================================= */}

        <div className="public-faq-list">

          {questions.map(
            (
              item,
              index
            ) => {

              const isOpen =
                activeIndex === index

              return (
                <article
                  key={item.question}
                  className={
                    `public-faq-item ${
                      isOpen
                        ? 'open'
                        : ''
                    }`
                  }
                >

                  <button
                    type="button"
                    className="public-faq-question"
                    onClick={() =>
                      toggleQuestion(index)
                    }
                    aria-expanded={isOpen}
                  >

                    <span className="public-faq-question-number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        '0'
                      )}
                    </span>


                    <span className="public-faq-question-text">
                      {item.question}
                    </span>


                    <span className="public-faq-toggle">
                      {isOpen
                        ? '−'
                        : '+'}
                    </span>

                  </button>


                  <div
                    className={
                      `public-faq-answer ${
                        isOpen
                          ? 'open'
                          : ''
                      }`
                    }
                  >

                    <div className="public-faq-answer-inner">

                      <p>
                        {item.answer}
                      </p>

                    </div>

                  </div>

                </article>
              )
            }
          )}

        </div>

      </div>

    </section>
  )
}