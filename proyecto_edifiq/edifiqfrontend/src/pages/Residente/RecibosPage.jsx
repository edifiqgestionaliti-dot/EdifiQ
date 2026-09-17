import { useEffect, useState } from "react";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import {
	getApartamentoDePersona,
	recibosApi,
	subirComprobanteRecibo,
	comprobanteUrl,
} from "../../api";
import "../../styles/modules.css";

const badgeClase = (nombreEstado) => {
	if (nombreEstado === "Pagado") return "badge-success";
	if (nombreEstado === "Pendiente por revisar") return "badge-info";
	return "badge-warning";
};

export default function RecibosPage() {
	const [apt, setApt] = useState(null);
	const [items, setItems] = useState([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [seleccionado, setSeleccionado] = useState(null);
	const [archivo, setArchivo] = useState(null);
	const [subiendo, setSubiendo] = useState(false);
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState({ estado: "", desde: "", hasta: "" });

	const user = JSON.parse(localStorage.getItem("authUser") || "null");
	const idPersona = user?.persona?.id;

	const cargar = async () => {
		try {
			if (!idPersona) {
				setError("No se encontró la persona asociada a la sesión.");
				return;
			}
			const apartamentoPersona = await getApartamentoDePersona(idPersona);
			setApt(apartamentoPersona);
			if (!apartamentoPersona) {
				setItems([]);
				return;
			}
			const data = await recibosApi.list();
			setItems(
				data.filter((x) => x.apartamento?.id === apartamentoPersona.apartamento?.id),
			);
		} catch (e) {
			setError(e.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const timeoutId = setTimeout(cargar, 0);
		return () => clearTimeout(timeoutId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [idPersona]);

	const abrirSubida = (recibo) => {
		setSeleccionado(recibo);
		setArchivo(null);
		setError("");
		setOpen(true);
	};

	const enviarComprobante = async (e) => {
		e.preventDefault();
		if (!archivo) {
			setError("Selecciona una foto del comprobante de pago.");
			return;
		}
		setError("");
		setSubiendo(true);
		try {
			await subirComprobanteRecibo(seleccionado.id, archivo);
			setOpen(false);
			await cargar();
		} catch (e) {
			setError(e.message);
		} finally {
			setSubiendo(false);
		}
	};

	if (loading) {
		return (
			<div className="module-page">
				<div className="card-panel">Cargando información...</div>
			</div>
		);
	}

	if (!apt) {
		return (
			<div className="module-page">
				<div className="card-panel">
					<h2>Mi apartamento</h2>
					<p>{error || "Tu usuario aún no tiene un apartamento asignado."}</p>
				</div>
			</div>
		);
	}

	const a = apt.apartamento;
	const filtered = items.filter((item) => `${item.tipoServicio?.nombre} ${item.periodo}`.toLowerCase().includes(search.toLowerCase())
		&& (!filters.estado || item.estadoRecibo?.nombre === filters.estado)
		&& (!filters.desde || item.fechaVencimiento >= filters.desde)
		&& (!filters.hasta || item.fechaVencimiento <= filters.hasta));
	const estados = [...new Set(items.map((item) => item.estadoRecibo?.nombre).filter(Boolean))];

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Mis recibos</h1>
					<p className="module-subtitle">
						Consulta tus cobros y sube el comprobante cuando pagues.
					</p>
				</div>
				<span className="badge badge-info">
					{a.torre?.nombreTorre} · {a.numeroApartamento}
				</span>
			</div>

			<div className="card-panel">
				{error && <div className="form-error">{error}</div>}
				<div className="toolbar"><strong>{filtered.length} de {items.length} recibos</strong></div>
				<MultiCriteriaBar
					search={search}
					onSearch={setSearch}
					searchPlaceholder="Servicio o periodo..."
					filters={[
						{name: "estado", label: "Estado", type: "select", value: filters.estado, onChange: (value) => setFilters({ ...filters, estado: value }), options: estados.map((x) => ({ value: x, label: x }))},
						{name: "desde", label: "Vence desde", type: "date", value: filters.desde, onChange: (value) => setFilters({ ...filters, desde: value })},
						{name: "hasta", label: "Vence hasta", type: "date", value: filters.hasta, onChange: (value) => setFilters({ ...filters, hasta: value })},
					]}
					onClear={() => { setSearch(""); setFilters({ estado: "", desde: "", hasta: "" }); }}
				/>
				<table className="module-table">
					<thead>
						<tr>
							<th>Servicio</th>
							<th>Periodo</th>
							<th>Valor</th>
							<th>Vencimiento</th>
							<th>Estado</th>
							<th>Acción</th>
						</tr>
					</thead>
					<tbody>
						{filtered.length ? (
							filtered.map((x) => (
								<tr key={x.id}>
									<td>{x.tipoServicio?.nombre}</td>
									<td>{x.periodo}</td>
									<td>${Number(x.valor).toLocaleString("es-CO")}</td>
									<td>{x.fechaVencimiento}</td>
									<td>
										<span className={`badge ${badgeClase(x.estadoRecibo?.nombre)}`}>
											{x.estadoRecibo?.nombre}
										</span>
									</td>
									<td>
										{x.estadoRecibo?.nombre === "Pendiente" && (
											<button className="small-btn" onClick={() => abrirSubida(x)}>
												Subir comprobante
											</button>
										)}
										{x.estadoRecibo?.nombre === "Pendiente por revisar" && (
											<>
												En revisión
												{x.rutaComprobante && (
													<>
														{" "}
														·{" "}
														<a
															href={comprobanteUrl(x.rutaComprobante)}
															target="_blank"
															rel="noreferrer"
														>
															ver
														</a>
													</>
												)}
											</>
										)}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan="6" className="empty-row">
									No tienes recibos.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{open && (
				<Modal title="Subir comprobante de pago" onClose={() => setOpen(false)}>
					<form onSubmit={enviarComprobante}>
						{error && <div className="form-error">{error}</div>}
						<p className="module-subtitle">
							{seleccionado?.tipoServicio?.nombre} · {seleccionado?.periodo} · $
							{Number(seleccionado?.valor).toLocaleString("es-CO")}
						</p>
						<div className="form-group full">
							<label htmlFor="recibo-comprobante">Foto del comprobante</label>
							<input
								id="recibo-comprobante"
								required
								type="file"
								accept="image/*"
								onChange={(e) => setArchivo(e.target.files?.[0] || null)}
							/>
						</div>
						<div className="form-footer">
							<button type="submit" className="primary-btn" disabled={subiendo}>
								{subiendo ? "Subiendo..." : "Enviar comprobante"}
							</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
}
