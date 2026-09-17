import { NavLink, useNavigate } from "react-router-dom";
import inicioIcon from "../../assets/inicio.png";
import apartamentosIcon from "../../assets/apartamentos.png";
import familiaresIcon from "../../assets/personas.png";
import paqueteIcon from "../../assets/caja.png";
import reciboIcon from "../../assets/factura.png";
import reservaIcon from "../../assets/fecha.png";
import visitaIcon from "../../assets/visita.png";
import salidaIcon from "../../assets/salida.png";
import usuarioIcon from "../../assets/usuario.png";

const links = [
	{ to: "/residente", label: "Inicio", icon: inicioIcon },
	{ to: "/residente/apartamento", label: "Mi apartamento", icon: apartamentosIcon },
	{ to: "/residente/familiares", label: "Mis familiares", icon: familiaresIcon },
	{ to: "/residente/paquetes", label: "Mis paquetes", icon: paqueteIcon },
	{ to: "/residente/recibos", label: "Mis recibos", icon: reciboIcon },
	{ to: "/residente/reservas", label: "Mis reservas", icon: reservaIcon },
	{ to: "/residente/visitas", label: "Mis visitas", icon: visitaIcon },
	{ to: "/residente/perfil", label: "Mi perfil", icon: usuarioIcon },
];

export default function SidebarResidente() {
	const navigate = useNavigate();

	const logout = () => {
		localStorage.removeItem("authUser");
		navigate("/login");
	};

	return (
		<aside className="resident-sidebar">
			<div className="resident-sidebar-brand">
				<span>EdifiQ</span>
				<small>Panel del residente</small>
			</div>

			<nav className="resident-sidebar-nav" aria-label="Navegación del residente">
				{links.map(({ to, label, icon }) => (
					<NavLink
						key={to}
						to={to}
						end={to === "/residente"}
						className={({ isActive }) =>
							"resident-sidebar-link" + (isActive ? " active" : "")
						}
					>
						<span className="resident-sidebar-icon" aria-hidden="true">
							<img src={icon} alt="" />
						</span>
						<span>{label}</span>
					</NavLink>
				))}
			</nav>

			<button className="resident-logout-btn" onClick={logout}>
				<span className="resident-sidebar-icon" aria-hidden="true">
					<img src={salidaIcon} alt="" />
				</span>
				<span>Cerrar sesión</span>
			</button>
		</aside>
	);
}