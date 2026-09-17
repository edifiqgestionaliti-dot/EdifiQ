import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { paquetesApi, recibosApi, visitasApi } from "../../api";
import "../../styles/modules.css";

export default function VigilanteHomePage() {

  const usuario = JSON.parse(
    localStorage.getItem("authUser") || "null"
  );

  const nombre = usuario?.persona?.nombres || "Vigilante";
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [paquetes, recibos, visitas] = await Promise.all([
          paquetesApi.list(),
          recibosApi.list(),
          visitasApi.list(),
        ]);

        const fechaHoy = new Date().toISOString().slice(0, 10);
        const visitasHoy = visitas.filter((item) => item.fechaIngreso?.slice(0, 10) === fechaHoy).length;
        const paquetesPendientes = paquetes.filter(
          (item) => item.estadoPaquete?.nombre !== "Entregado"
        ).length;
        const recibosRevisados = recibos.filter(
          (item) => item.estadoRecibo?.nombre === "Pagado" || item.estadoRecibo?.nombre === "Verificado"
        ).length;

        setNotifications([
          {
            type: "info",
            label: "Visitas hoy",
            value: String(visitasHoy),
            text: visitasHoy === 0 ? "No hay visitas registradas para hoy." : `Hay ${visitasHoy} visita(s) programada(s) para hoy.`,
          },
          {
            type: "warning",
            label: "Paquetes por entregar",
            value: String(paquetesPendientes),
            text: paquetesPendientes === 0 ? "No hay paquetes pendientes en portería." : `Hay ${paquetesPendientes} paquete(s) por entregar.`,
          },
          {
            type: "success",
            label: "Recibos revisados",
            value: String(recibosRevisados),
            text: recibosRevisados === 0 ? "Todavía no hay recibos verificados." : `Se han revisado ${recibosRevisados} recibo(s).`,
          },
        ]);
      } catch {
        setNotifications([
          { type: "warning", label: "Sin datos", value: "0", text: "No se pudo cargar el panel de control." },
          { type: "info", label: "Sin datos", value: "0", text: "Intenta recargar la página." },
          { type: "success", label: "Sin datos", value: "0", text: "Las notificaciones se actualizarán en cuanto el servicio responda." },
        ]);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const tarjetas = [
    ["01", "Control de visitas", "Registra entradas y salidas de visitantes.", "/vigilante/visitas"],
    ["02", "Gestión de paquetes", "Registra y controla los paquetes recibidos.", "/vigilante/paquetes"],
    ["03", "Recibos", "Consulta y registra recibos del conjunto.", "/vigilante/recibos"],
    ["04", "Mi perfil", "Revisa y actualiza tus datos personales.", "/vigilante/perfil"]
  ];

  return (
    <div className="module-page">

      <div className="admin-overview-head">
        <div>
          <span className="admin-overview-kicker">CENTRO DE CONTROL / EDIFIQ</span>
          <h1>Hola, {nombre}</h1>
          <p>Supervisa los movimientos diarios del conjunto desde un único punto de control.</p>
        </div>
        <div className="admin-overview-stamp">
          <strong>VIG</strong>
          <span>CONTROL<br />DE ACCESO</span>
        </div>
      </div>

      <div className="notification-panel">
        <div className="notification-header">
          <span className="admin-overview-kicker">NOTIFICACIONES</span>
          <h2>Estado operativo</h2>
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
          <span className="admin-overview-kicker">OPERACIÓN DIARIA</span>
          <h2>Accesos rápidos</h2>
        </div>
        <span className="admin-module-count">4 módulos activos</span>
      </div>

      <div className="admin-module-list vigilante-module-list">
        {tarjetas.map(([number, title, description, route]) => (
          <Link key={route} to={route} className="admin-module-row">
            <span className="admin-module-number">{number}</span>
            <span className="admin-module-copy">
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
            <span className="admin-module-arrow">↗</span>
          </Link>
        ))}
      </div>

    </div>
  );
}