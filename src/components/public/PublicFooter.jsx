import {
  Link,
} from 'react-router-dom'


export default function PublicFooter() {
  return (
    <footer className="public-footer">

      <div className="public-container">

        <div className="public-footer-main">

          <div className="public-footer-brand">

            <Link
              to="/"
              className="public-footer-logo"
            >

              <div className="public-logo-mark">

                <span>
                  Q
                </span>

                <span>
                  E
                </span>

              </div>

              <strong>
                Quiz Enterprise
              </strong>

            </Link>


            <p>
              Plataforma de aprendizaje
              y evaluación diseñada para
              ayudarte a desarrollar tus
              conocimientos.
            </p>

          </div>


          <div className="public-footer-navigation">

            <FooterColumn
              title="Plataforma"
              links={[
                {
                  label:
                    'Cómo funciona',

                  href:
                    '#como-funciona',
                },
                {
                  label:
                    'Cursos',

                  href:
                    '#cursos',
                },
                {
                  label:
                    'Preguntas frecuentes',

                  href:
                    '#faq',
                },
              ]}
            />


            <FooterColumn
              title="Acceso"
              routes={[
                {
                  label:
                    'Iniciar sesión',

                  to:
                    '/login',
                },
                {
                  label:
                    'Crear cuenta',

                  to:
                    '/register',
                },
              ]}
            />


            <FooterColumn
              title="Empresa"
              links={[
                {
                  label:
                    'Sobre nosotros',

                  href:
                    '#empresa',
                },
              ]}
            />

          </div>

        </div>


        <div className="public-footer-bottom">

          <span>
            © {new Date().getFullYear()}
            {' '}
            Quiz Enterprise.
          </span>

          <span>
            Todos los derechos reservados.
          </span>

        </div>

      </div>

    </footer>
  )
}


function FooterColumn({
  title,
  links = [],
  routes = [],
}) {
  return (
    <div className="public-footer-column">

      <strong>
        {title}
      </strong>


      {links.map(
        link => (

          <a
            key={link.label}
            href={link.href}
          >
            {link.label}
          </a>

        )
      )}


      {routes.map(
        route => (

          <Link
            key={route.label}
            to={route.to}
          >
            {route.label}
          </Link>

        )
      )}

    </div>
  )
}