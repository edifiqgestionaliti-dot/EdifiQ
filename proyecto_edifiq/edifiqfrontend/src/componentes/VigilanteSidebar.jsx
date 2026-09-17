import { NavLink, useNavigate } from "react-router-dom";
import inicioIcon from "../assets/inicio.png";
import visitaIcon from "../assets/visita.png";
import paqueteIcon from "../assets/caja.png";
import reciboIcon from "../assets/factura.png";
import usuarioIcon from "../assets/usuario.png";
import salidaIcon from "../assets/salida.png";

const links = [
  {
    to: "/vigilante",
    label: "Inicio",
    icon: inicioIcon
  },
  {
    to: "/vigilante/visitas",
    label: "Visitas",
    icon: visitaIcon
  },
  {
    to: "/vigilante/paquetes",
    label: "Paquetes",
    icon: paqueteIcon
  },
  {
    to: "/vigilante/recibos",
    label: "Recibos",
    icon: reciboIcon
  },
  {
    to: "/vigilante/perfil",
    label: "Mi perfil",
    icon: usuarioIcon
  }
];


export default function VigilanteSidebar() {

  const navigate = useNavigate();


  const cerrarSesion = () => {

    localStorage.removeItem("authUser");

    navigate("/login");

  };


  return (

    <aside className="admin-sidebar">

      <div className="admin-sidebar-brand">

        <span>
          EdifiQ
        </span>

        <small>
          Control de vigilancia
        </small>

      </div>


      <nav className="admin-sidebar-nav">

        {links.map((link) => (

          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/vigilante"}
            className={({ isActive }) =>
              "admin-sidebar-link" +
              (isActive ? " active" : "")
            }
          >

            <span className="admin-sidebar-icon" aria-hidden="true">
              <img src={link.icon} alt="" />
            </span>

            {link.label}

          </NavLink>

        ))}

      </nav>


      <button
        className="logout-btn"
        onClick={cerrarSesion}
      >
        <span className="admin-sidebar-icon" aria-hidden="true">
          <img src={salidaIcon} alt="" />
        </span>
        <span>Cerrar sesión</span>
      </button>

    </aside>

  );
}