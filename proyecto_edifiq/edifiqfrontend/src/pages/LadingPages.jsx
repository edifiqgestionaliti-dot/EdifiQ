import { Link } from "react-router-dom";
import residenteIcon from "../assets/comunidad.png";
import paqueteIcon from "../assets/paquete.png";
import visitaIcon from "../assets/visita.png";
import reservaIcon from "../assets/reserva.png";
import reciboIcon from "../assets/recibo.png";
import seguridadIcon from "../assets/seguridad.png";
import "../App.css";

function LandingPage() {
  return (
    <div className="landing-page">

      {/* NAVBAR */}
      <header className="landing-header">
        <div className="landing-navbar">

          <Link to="/" className="landing-logo">
            Edifi<span>Q</span>
          </Link>

          <nav className="landing-nav">
            <a href="#inicio">Inicio</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#beneficios">Beneficios</a>
          </nav>

          <Link to="/login" className="navbar-button">
            Iniciar sesión
          </Link>

        </div>
      </header>

      <main>

        {/* HERO */}
        <section className="hero-section" id="inicio">
          <div className="hero-container">

            <div className="hero-text">

              <span className="hero-label">GESTIÓN RESIDENCIAL</span>

              <h1>
                Gestiona tu conjunto
                <span> de forma sencilla.</span>
              </h1>

              <p>
                EdifiQ es una plataforma diseñada para facilitar la
                administración de conjuntos residenciales, centralizando
                residentes, visitas, paquetería, reservas y servicios
                en un solo lugar.
              </p>

              <div className="hero-actions">
                <Link to="/login" className="primary-button">
                  Iniciar sesión <span></span>
                </Link>
                <a href="#funcionalidades" className="secondary-button">
                  Ver funcionalidades
                </a>
              </div>

            </div>

            <div className="hero-dashboard">
              <div className="dashboard-window">

                <div className="dashboard-top">
                  <div className="dashboard-brand">
                    <div className="dashboard-logo">Q</div>
                    <div>
                      <strong>EdifiQ</strong>
                      <small>Panel de administración</small>
                    </div>
                  </div>
                  <span className="dashboard-user">Admin</span>
                </div>

                <div className="dashboard-body">

                  <div className="dashboard-stat-row">
                    <span className="dashboard-stat-icon"></span>
                    <div>
                      <strong>Residentes</strong>
                      <small>Apartamentos registrados</small>
                    </div>
                  </div>

                  <div className="dashboard-stat-row">
                        <span className="dashboard-stat-icon"></span>
                    <div>
                      <strong>Paquetes</strong>
                      <small>Gestion de paquetería</small>
                    </div>
                  </div>

                  <div className="dashboard-stat-row">
                    <span className="dashboard-stat-icon"></span>
                    <div>
                      <strong>Reservas</strong>
                      <small>Salón social y mas</small>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </section>


        {/* FUNCIONALIDADES */}
        <section className="features-section" id="funcionalidades">

          <div className="section-container">

            <div className="section-heading">

              <div>
                <span>FUNCIONALIDADES</span>

                <h2>
                  Todo lo que necesitas
                  <br />
                </h2>
              </div>

              <p>
                Herramientas pensadas para administradores, vigilantes
                y residentes, todo desde una sola plataforma.
              </p>

            </div>


            <div className="features-grid">

              <div className="feature-card">
                <img src={residenteIcon} alt="Residentes" />
                <div>
                  <h3>Residentes</h3>
                  <p>
                    Administra la información de residentes,
                    apartamentos y usuarios del conjunto.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <img src={paqueteIcon} alt="Paquetería" />
                <div>
                  <h3>Paquetería</h3>
                  <p>
                    Registra los paquetes recibidos y facilita
                    su entrega a los residentes.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <img src={visitaIcon} alt="Visitas" />
                <div>
                  <h3>Visitas</h3>
                  <p>
                    Controla el registro, ingreso y salida
                    de visitantes del conjunto.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <img src={reservaIcon} alt="Reservas" />
                <div>
                  <h3>Reservas</h3>
                  <p>
                    Gestiona las reservas de salones y zonas
                    comunes de manera organizada.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <img src={reciboIcon} alt="Recibos" />
                <div>
                  <h3>Recibos</h3>
                  <p>
                    Consulta y administra los recibos relacionados
                    con los servicios del conjunto.
                  </p>
                </div>
              </div>

              <div className="feature-card">
                <img src={seguridadIcon} alt="Seguridad" />
                <div>
                  <h3>Seguridad</h3>
                  <p>
                    Mejora el control de accesos y la seguridad
                    de la información residencial.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* BENEFICIOS */}
        <section className="benefits-section" id="beneficios">

          <div className="benefits-container">

            <div className="benefits-text">

              <span>¿POR QUÉ EDIFIQ?</span>

              <h2>
                Una administración
                <br />
                más organizada.
              </h2>

              <p>
                Centraliza la información y las operaciones de tu
                conjunto residencial en una sola plataforma,
                facilitando el trabajo de administradores,
                vigilantes y residentes.
              </p>

              <div className="benefits-list">

                <div className="benefit">
                  <span>✓</span>
                  <p>Información centralizada</p>
                </div>

                <div className="benefit">
                  <span>✓</span>
                  <p>Procesos más rápidos y organizados</p>
                </div>

                <div className="benefit">
                  <span>✓</span>
                  <p>Mayor control de las actividades</p>
                </div>

                <div className="benefit">
                  <span>✓</span>
                  <p>Acceso según el rol del usuario</p>
                </div>

              </div>

            </div>

            <div className="benefits-visual">

              <div className="benefits-main-card">

                <div className="benefits-card-header">
                  <div className="big-q">Q</div>
                  <div>
                    <strong>EdifiQ</strong>
                  </div>
                </div>

                <div className="benefits-card-body">
                  <div className="mini-line"></div>
                  <div className="mini-line medium"></div>
                  <div className="mini-line short"></div>
                </div>

                <div className="benefits-card-footer">
                  <span>● </span>
                </div>

              </div>

              <div className="floating-card floating-card-one">
                <div>
                  <strong>Paquete entregado</strong>
                </div>
              </div>

              <div className="floating-card floating-card-two">
                <div>
                  <strong>Visita registrada</strong>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* CTA FINAL */}
        <section className="final-section">
          <div className="final-content">


            <h2>¿Listo para empezar?</h2>
            <Link to="/login" className="final-button">
              Iniciar sesión 
            </Link>

          </div>
        </section>

      </main>


      {/* FOOTER */}
      <footer className="landing-footer">

        <div className="footer-container">

          <div className="footer-brand">
            <Link to="/">
              Edifi<span>Q</span>
            </Link>

            <p>
              Sistema de gestión para conjuntos residenciales.
            </p>
          </div>

          <div className="footer-links">

            <a href="#inicio">Inicio</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#beneficios">Beneficios</a>
            <Link to="/login">Iniciar sesión</Link>

          </div>

        </div>


        <div className="footer-bottom">
          <span>© 2026 EdifiQ. Todos los derechos reservados.</span>
        </div>

      </footer>

    </div>
  );
}

export default LandingPage;
