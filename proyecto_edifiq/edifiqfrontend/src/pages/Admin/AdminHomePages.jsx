import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { paquetesApi, recibosApi, reservasApi } from "../../api";
import "../../styles/modules.css";

const cards = [
	["01", "Personas", "Directorio y datos de contacto", "/admin/personas"],
	["02", "Apartamentos", "Unidades y estado de ocupación", "/admin/apartamentos"],
	["03", "Paquetes", "Recepción y entregas", "/admin/paquetes"],
	["04", "Recibos", "Cobros y vencimientos", "/admin/recibos"],
	["05", "Reservas", "Agenda de zonas comunes", "/admin/reservas"],
	["06", "Visitas", "Control de accesos", "/admin/visitas"],
	["07", "Zonas comunes", "Espacios disponibles", "/admin/zonas"],
	["08", "Torres", "Estructura del conjunto", "/admin/torres"],
];

export default function AdminHomePage() {
	const [notifications, setNotifications] = useState([]);

	useEffect(() => {
		const loadNotifications = async () => {
			try {
				const [paquetes, recibos, reservas] = await Promise.all([
					paquetesApi.list(),
					recibosApi.list(),
					reservasApi.list(),
				]);

				const pendientesEntrega = paquetes.filter(
					(item) => item.estadoPaquete?.nombre !== "Entregado"
				).length;
				const recibosPorValidar = recibos.filter(
					(item) => item.estadoRecibo?.nombre === "Pendiente por revisar"
				).length;
				const reservasHoy = reservas.filter((item) => {
					const fecha = item.fechaReserva;
					return fecha === new Date().toISOString().slice(0, 10);
				}).length;

				setNotifications([
					{
						type: "warning",
						label: "Recibos por validar",
						value: String(recibosPorValidar),
						text: recibosPorValidar === 1 ? "Hay un comprobante pendiente de revisión." : `Faltan ${recibosPorValidar} comprobantes por revisar.`,
					},
					{
						type: "info",
						label: "Paquetes por entregar",
						value: String(pendientesEntrega),
						text: pendientesEntrega === 0 ? "No hay paquetes pendientes en este momento." : `Hay ${pendientesEntrega} paquetes pendientes de entrega.`,
					},
					{
						type: "success",
						label: "Reservas del día",
						value: String(reservasHoy),
						text: reservasHoy === 0 ? "No hay reservas programadas para hoy." : `Hay ${reservasHoy} reservas programadas para hoy.`,
					},
				]);
			} catch {
				setNotifications([
					{ type: "warning", label: "Sin datos", value: "0", text: "No se pudieron cargar las notificaciones." },
					{ type: "info", label: "Sin datos", value: "0", text: "Intenta recargar la página más tarde." },
					{ type: "success", label: "Sin datos", value: "0", text: "La información se actualizará cuando la API esté disponible." },
				]);
			}
		};

		loadNotifications();
		const interval = setInterval(loadNotifications, 30000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="module-page">
			<div className="admin-overview-head">
				<div>
					<span className="admin-overview-kicker">CENTRO DE OPERACIONES / EDIFIQ</span>
					<h1>Panel de administrador</h1>
					<p>Una vista general para moverte entre las áreas que mantienen funcionando el conjunto.</p>
				</div>
				<div className="admin-overview-stamp">
					<strong>EDQ</strong>
					<span>CONTROL<br />RESIDENCIAL</span>
				</div>
			</div>

			<div className="notification-panel">
				<div className="notification-header">
					<span className="admin-overview-kicker">NOTIFICACIONES</span>
					<h2>Resumen del día</h2>
				</div>
				<div className="notification-grid">
					{notifications.map((item) => (
						<div key={item.label} className={`notification-card notification-${item.type}`}>
							<span className="notification-label">{item.label}</span>
							<strong>{item.value}</strong>
							<p>{item.text}</p>
						</div>
					))}
				</div>
			</div>

			<div className="admin-module-heading">
				<div>
					<span className="admin-overview-kicker">MÓDULOS</span>
					<h2>Áreas de gestión</h2>
				</div>
				<span className="admin-module-count">{cards.length} accesos disponibles</span>
			</div>

			<div className="admin-module-list">
				{cards.map(([number, name, description, to]) => (
					<Link key={to} to={to} className="admin-module-row">
						<span className="admin-module-number">{number}</span>
						<span className="admin-module-copy">
							<strong>{name}</strong>
							<small>{description}</small>
						</span>
						<span className="admin-module-arrow">↗</span>
					</Link>
				))}
			</div>
		</div>
	);
}
