import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApartamentoDePersona, paquetesApi, recibosApi, reservasApi } from "../../api";
import "../../styles/modules.css";

const cards = [
    ["01", "Mis paquetes", "Consulta tus entregas pendientes.", "/residente/paquetes"],
    ["02", "Mis visitas", "Revisa quién ha ingresado.", "/residente/visitas"],
    ["03", "Mis reservas", "Organiza tus espacios comunes.", "/residente/reservas"],
    ["04", "Mis recibos", "Consulta cobros y pagos.", "/residente/recibos"],
    ["05", "Mi apartamento", "Consulta tu información residencial.", "/residente/apartamento"],
];

export default function ResidenteHomePage() {
    const user = JSON.parse(localStorage.getItem("authUser") || "null");
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const idPersona = user?.persona?.id;
                if (!idPersona) {
                    setNotifications([
                        { type: "warning", label: "Sin sesión", value: "0", text: "No se pudo identificar tu apartamento." },
                        { type: "info", label: "Sin sesión", value: "0", text: "Inicia sesión nuevamente para ver tus alertas." },
                        { type: "success", label: "Sin sesión", value: "0", text: "Tu información se cargará cuando vuelva a iniciar." },
                    ]);
                    return;
                }

                const apartamento = await getApartamentoDePersona(idPersona);
                const apartamentoId = apartamento?.apartamento?.id;

                const [paquetes, recibos, reservas] = await Promise.all([
                    paquetesApi.list(),
                    recibosApi.list(),
                    reservasApi.list(),
                ]);

                const paquetesDelApartamento = paquetes.filter(
                    (item) => item.apartamento?.id === apartamentoId
                );
                const recibosDelApartamento = recibos.filter(
                    (item) => item.apartamento?.id === apartamentoId
                );
                const reservasDelApartamento = reservas.filter(
                    (item) => item.apartamento?.id === apartamentoId
                );

                const paquetesPendientes = paquetesDelApartamento.filter(
                    (item) => item.estadoPaquete?.nombre !== "Entregado"
                ).length;
                const comprobantesPendientes = recibosDelApartamento.filter(
                    (item) => item.estadoRecibo?.nombre === "Pendiente por revisar"
                ).length;
                const reservasConfirmadas = reservasDelApartamento.filter(
                    (item) => item.estadoReserva?.nombre === "Confirmada" || item.estadoReserva?.nombre === "Aprobada"
                ).length;

                setNotifications([
                    {
                        type: "info",
                        label: "Paquetes pendientes",
                        value: String(paquetesPendientes),
                        text: paquetesPendientes === 0 ? "No tienes paquetes pendientes en tu apartamento." : `Tienes ${paquetesPendientes} paquetes esperando por entrega.`,
                    },
                    {
                        type: "success",
                        label: "Reservas confirmadas",
                        value: String(reservasConfirmadas),
                        text: reservasConfirmadas === 0 ? "Todavía no tienes reservas confirmadas." : `Tienes ${reservasConfirmadas} reserva(s) confirmada(s).`,
                    },
                    {
                        type: "warning",
                        label: "Comprobante por revisar",
                        value: String(comprobantesPendientes),
                        text: comprobantesPendientes === 0 ? "No tienes comprobantes pendientes de revisión." : `Hay ${comprobantesPendientes} comprobante(s) pendiente(s).`,
                    },
                ]);
            } catch {
                setNotifications([
                    { type: "warning", label: "Sin datos", value: "0", text: "No se pudo cargar tu información en este momento." },
                    { type: "info", label: "Sin datos", value: "0", text: "Intenta recargar la página." },
                    { type: "success", label: "Sin datos", value: "0", text: "Las alertas se actualizarán cuando el servicio responda." },
                ]);
            }
        };

        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [user?.persona?.id]);

    return (
        <div className="module-page">
            <div className="admin-overview-head">
                <div>
                    <span className="admin-overview-kicker">MI ESPACIO / EDIFIQ</span>
                    <h1>Hola, {user?.persona?.nombres || "residente"}</h1>
                    <p>Todo lo que necesitas para consultar y organizar tu vida en el conjunto.</p>
                </div>
                <div className="admin-overview-stamp">
                    <strong>RES</strong>
                    <span>ESPACIO<br />RESIDENCIAL</span>
                </div>
            </div>

            <div className="notification-panel">
                <div className="notification-header">
                    <span className="admin-overview-kicker">NOTIFICACIONES</span>
                    <h2>Tu resumen</h2>
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
                    <span className="admin-overview-kicker">MI INFORMACIÓN</span>
                    <h2>Accesos personales</h2>
                </div>
                <span className="admin-module-count">{cards.length} espacios disponibles</span>
            </div>

            <div className="admin-module-list resident-module-list">
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