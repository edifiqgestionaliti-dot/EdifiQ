import { NavLink, useNavigate } from "react-router-dom";
import inicioIcon from "../assets/inicio.png";
import personasIcon from "../assets/personas.png";
import edificioIcon from "../assets/edificio.png";
import apartamentosIcon from "../assets/apartamentos.png";
import comunidadIcon from "../assets/comunidad.png";
import paqueteIcon from "../assets/caja.png";
import reciboIcon from "../assets/factura.png";
import reservaIcon from "../assets/fecha.png";
import visitaIcon from "../assets/visita.png";
import parqueIcon from "../assets/parque.png";
import masIcon from "../assets/mas.png";
import salidaIcon from "../assets/salida.png";
import usuarioIcon from "../assets/usuario.png";

const links = [
	{ to: "/admin", label: "Inicio", icon: inicioIcon },
	{ to: "/admin/personas", label: "Personas", icon: personasIcon },
	{ to: "/admin/torres", label: "Torres", icon: edificioIcon },
	{ to: "/admin/apartamentos", label: "Apartamentos", icon: apartamentosIcon },
	{ to: "/admin/asignaciones", label: "Residentes / apartamentos", icon: comunidadIcon },
	{ to: "/admin/paquetes", label: "Paquetes", icon: paqueteIcon },
	{ to: "/admin/recibos", label: "Recibos", icon: reciboIcon },
	{ to: "/admin/reservas", label: "Reservas", icon: reservaIcon },
	{ to: "/admin/visitas", label: "Visitas", icon: visitaIcon },
	{ to: "/admin/zonas", label: "Zonas comunes", icon: parqueIcon },
	{ to: "/admin/registro", label: "Crear usuario", icon: masIcon },
	{ to: "/admin/perfil", label: "Mi perfil", icon: usuarioIcon },
];

export default function Sidebar() {
	const navigate = useNavigate();

	const logout = () => {
		localStorage.removeItem("authUser");
		navigate("/login");
	};

	return (
		<aside className="admin-sidebar">
			<div className="admin-sidebar-brand">
				<span>EdifiQ</span>
				<small>Administración residencial</small>
			</div>

			<nav className="admin-sidebar-nav">
				{links.map(({ to, label, icon }) => (
					<NavLink
						key={to}
						to={to}
						end={to === "/admin"}
						className={({ isActive }) =>
							"admin-sidebar-link" + (isActive ? " active" : "")
						}
					>
						<span className="admin-sidebar-icon" aria-hidden="true">
							<img src={icon} alt="" />
						</span>
						{label}
					</NavLink>
				))}
			</nav>

			<button className="logout-btn" onClick={logout}>
				<span className="admin-sidebar-icon" aria-hidden="true">
					<img src={salidaIcon} alt="" />
				</span>
				<span>Cerrar sesión</span>
			</button>
		</aside>
	);
}
