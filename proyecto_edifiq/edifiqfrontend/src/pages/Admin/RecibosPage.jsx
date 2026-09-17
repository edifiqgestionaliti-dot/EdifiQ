import { useEffect, useState } from "react";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import {
	recibosApi,
	apartamentosApi,
	getTiposServicio,
	recibosPendientesRevision,
	verificarRecibo,
	rechazarRecibo,
	comprobanteUrl,
} from "../../api";
import { onlyDecimal } from "../../utils/validation";
import "../../styles/modules.css";

const initial = {
	tipoServicioId: "",
	periodo: "",
	valor: "",
	fechaEmision: "",
	fechaVencimiento: "",
	apartamentoId: "",
};

const money = (v) =>
	new Intl.NumberFormat("es-CO", {
		style: "currency",
		currency: "COP",
		maximumFractionDigits: 0,
	}).format(Number(v || 0));

const badgeClase = (nombreEstado) => {
	if (nombreEstado === "Pagado") return "badge-success";
	if (nombreEstado === "Pendiente por revisar") return "badge-info";
	return "badge-warning";
};

export default function RecibosPage() {
	const [tab, setTab] = useState("todos"); // "todos" | "revision"
	const [items, setItems] = useState([]);
	const [revision, setRevision] = useState([]);
	const [apts, setApts] = useState([]);
	const [servicios, setServicios] = useState([]);
	const [form, setForm] = useState(initial);
	const [editId, setEditId] = useState(null);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState({ servicio: "", estado: "", torre: "", desde: "", hasta: "", valorMin: "" });

	const load = () =>
		recibosApi.list().then(setItems).catch((e) => setError(e.message));

	const loadRevision = () =>
		recibosPendientesRevision().then(setRevision).catch((e) => setError(e.message));

	useEffect(() => {
		load();
		loadRevision();
		apartamentosApi.list().then(setApts);
		getTiposServicio().then(setServicios);
	}, []);

	const refrescarTodo = () => {
		load();
		loadRevision();
	};

	const submit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const p = {
				tipoServicio: { id: Number(form.tipoServicioId) },
				periodo: form.periodo.trim(),
				valor: Number(form.valor),
				fechaEmision: form.fechaEmision,
				fechaVencimiento: form.fechaVencimiento,
				apartamento: { id: Number(form.apartamentoId) },
			};

			if (editId) {
				await recibosApi.update(editId, p);
			} else {
				await recibosApi.create(p);
			}

			setOpen(false);
			setEditId(null);
			setForm(initial);
			refrescarTodo();
		} catch (e) {
			setError(e.message);
		}
	};

	const edit = (x) => {
		setForm({
			tipoServicioId: x.tipoServicio?.id ?? "",
			periodo: x.periodo,
			valor: x.valor,
			fechaEmision: x.fechaEmision,
			fechaVencimiento: x.fechaVencimiento,
			apartamentoId: x.apartamento?.id ?? "",
		});
		setEditId(x.id);
		setOpen(true);
	};

	const remove = async (id) => {
		if (confirm("¿Eliminar recibo?")) {
			try {
				await recibosApi.remove(id);
				refrescarTodo();
			} catch (e) {
				setError(e.message);
			}
		}
	};

	const aprobar = async (id) => {
		try {
			await verificarRecibo(id);
			refrescarTodo();
		} catch (e) {
			setError(e.message);
		}
	};

	const rechazar = async (id) => {
		if (confirm("¿Rechazar este comprobante? El recibo volverá a pendiente por pagar.")) {
			try {
				await rechazarRecibo(id);
				refrescarTodo();
			} catch (e) {
				setError(e.message);
			}
		}
	};

	const filtered = items.filter((x) => {
		const texto = `${x.periodo} ${x.tipoServicio?.nombre} ${x.apartamento?.numeroApartamento} ${x.apartamento?.torre?.nombreTorre}`.toLowerCase();
		return texto.includes(search.toLowerCase())
			&& (!filters.servicio || String(x.tipoServicio?.id) === filters.servicio)
			&& (!filters.estado || String(x.estadoRecibo?.id) === filters.estado)
			&& (!filters.torre || String(x.apartamento?.torre?.id) === filters.torre)
			&& (!filters.desde || x.fechaVencimiento >= filters.desde)
			&& (!filters.hasta || x.fechaVencimiento <= filters.hasta)
			&& (!filters.valorMin || Number(x.valor) >= Number(filters.valorMin));
	});

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Recibos</h1>
					<p className="module-subtitle">
						Gestiona los cobros y revisa los comprobantes de pago.
					</p>
				</div>
				{tab === "todos" && (
					<button
						className="primary-btn"
						onClick={() => {
							setForm(initial);
							setEditId(null);
							setError("");
							setOpen(true);
						}}
					>
						+ Crear recibo
					</button>
				)}
			</div>

			<div className="toolbar" style={{ marginBottom: 12 }}>
				<button
					className={tab === "todos" ? "primary-btn" : "small-btn"}
					onClick={() => setTab("todos")}
				>
					Todos los recibos
				</button>
				<button
					className={tab === "revision" ? "primary-btn" : "small-btn"}
					onClick={() => setTab("revision")}
				>
					Pendientes por revisar
					{revision.length > 0 ? ` (${revision.length})` : ""}
				</button>
			</div>

			{error && <div className="form-error">{error}</div>}

			{tab === "todos" && (
				<div className="card-panel">
					<div className="toolbar"><strong>{filtered.length} de {items.length} recibos</strong></div>
					<MultiCriteriaBar
						search={search}
						onSearch={setSearch}
						searchPlaceholder="Periodo, servicio, apartamento o torre..."
						filters={[
							{name: "servicio", label: "Servicio", type: "select", value: filters.servicio, onChange: (value) => setFilters({ ...filters, servicio: value }), options: servicios.map((x) => ({ value: x.id, label: x.nombre }))},
							{name: "estado", label: "Estado", type: "select", value: filters.estado, onChange: (value) => setFilters({ ...filters, estado: value }), options: [...new Map(items.map((x) => [x.estadoRecibo?.id, x.estadoRecibo])).values()].filter(Boolean).map((x) => ({ value: x.id, label: x.nombre }))},
							{name: "torre", label: "Torre", type: "select", value: filters.torre, onChange: (value) => setFilters({ ...filters, torre: value }), options: [...new Map(apts.map((x) => [x.torre?.id, x.torre])).values()].filter(Boolean).map((x) => ({ value: x.id, label: x.nombreTorre }))},
							{name: "desde", label: "Vence desde", type: "date", value: filters.desde, onChange: (value) => setFilters({ ...filters, desde: value })},
							{name: "hasta", label: "Vence hasta", type: "date", value: filters.hasta, onChange: (value) => setFilters({ ...filters, hasta: value })},
							{name: "valorMin", label: "Valor mínimo", type: "number", min: "0", value: filters.valorMin, onChange: (value) => setFilters({ ...filters, valorMin: value })},
						]}
						onClear={() => { setSearch(""); setFilters({ servicio: "", estado: "", torre: "", desde: "", hasta: "", valorMin: "" }); }}
					/>

					<div className="table-wrap">
						<table className="module-table">
							<thead>
								<tr>
									<th>Servicio</th>
									<th>Periodo</th>
									<th>Valor</th>
									<th>Apartamento</th>
									<th>Vencimiento</th>
									<th>Estado</th>
									<th>Acciones</th>
								</tr>
							</thead>
							<tbody>
								{filtered.length ? (
									filtered.map((x) => (
										<tr key={x.id}>
											<td>{x.tipoServicio?.nombre}</td>
											<td>{x.periodo}</td>
											<td>{money(x.valor)}</td>
											<td>
												{x.apartamento?.torre?.nombreTorre} - {x.apartamento?.numeroApartamento}
											</td>
											<td>{x.fechaVencimiento}</td>
											<td>
												<span className={`badge ${badgeClase(x.estadoRecibo?.nombre)}`}>
													{x.estadoRecibo?.nombre}
												</span>
											</td>
											<td className="actions-cell">
												{x.estadoRecibo?.nombre === "Pendiente" && (
													<>
														<button className="small-btn" onClick={() => edit(x)}>
															Editar
														</button>{" "}
														<button
															className="danger-btn small-btn"
															onClick={() => remove(x.id)}
														>
															Eliminar
														</button>
													</>
												)}
												{x.estadoRecibo?.nombre === "Pendiente por revisar" && (
													<span className="module-subtitle">Ver en "Pendientes por revisar"</span>
												)}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan="7" className="empty-row">
											No hay recibos.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{tab === "revision" && (
				<div className="card-panel">
					<div className="toolbar">
						<strong>{revision.length} comprobantes por revisar</strong>
					</div>

					<div className="table-wrap">
						<table className="module-table">
							<thead>
								<tr>
									<th>Servicio</th>
									<th>Periodo</th>
									<th>Valor</th>
									<th>Apartamento</th>
									<th>Comprobante</th>
									<th>Acciones</th>
								</tr>
							</thead>
							<tbody>
								{revision.length ? (
									revision.map((x) => (
										<tr key={x.id}>
											<td>{x.tipoServicio?.nombre}</td>
											<td>{x.periodo}</td>
											<td>{money(x.valor)}</td>
											<td>
												{x.apartamento?.torre?.nombreTorre} - {x.apartamento?.numeroApartamento}
											</td>
											<td>
												{x.rutaComprobante ? (
													<a
														href={comprobanteUrl(x.rutaComprobante)}
														target="_blank"
														rel="noreferrer"
													>
														Ver comprobante
													</a>
												) : (
													"—"
												)}
											</td>
											<td className="actions-cell">
												<button className="small-btn" onClick={() => aprobar(x.id)}>
													Aprobar pago
												</button>{" "}
												<button
													className="danger-btn small-btn"
													onClick={() => rechazar(x.id)}
												>
													Rechazar
												</button>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan="6" className="empty-row">
											No hay comprobantes pendientes por revisar.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{open && (
				<Modal
					title={editId ? "Editar recibo" : "Crear recibo"}
					onClose={() => setOpen(false)}
				>
					<form onSubmit={submit}>
						{error && <div className="form-error">{error}</div>}
						<div className="form-grid">
							<div className="form-group">
								<label>Servicio</label>
								<select
									required
									value={form.tipoServicioId}
									onChange={(e) =>
										setForm({ ...form, tipoServicioId: e.target.value })
									}
								>
									<option value="">Seleccione...</option>
									{servicios.map((x) => (
										<option key={x.id} value={x.id}>
											{x.nombre}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label>Apartamento</label>
								<select
									required
									value={form.apartamentoId}
									onChange={(e) =>
										setForm({ ...form, apartamentoId: e.target.value })
									}
								>
									<option value="">Seleccione...</option>
									{apts.map((x) => (
										<option key={x.id} value={x.id}>
											{x.torre?.nombreTorre} - {x.numeroApartamento}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label>Periodo</label>
								<input
									required
									maxLength="20"
									placeholder="Ej. Septiembre 2026"
									value={form.periodo}
									onChange={(e) => setForm({ ...form, periodo: e.target.value })}
								/>
							</div>

							<div className="form-group">
								<label>Valor</label>
								<input
									required
									type="number"
									min="0.01"
									step="0.01"
									value={form.valor}
									onChange={(e) => setForm({ ...form, valor: onlyDecimal(e.target.value) })}
								/>
							</div>

							<div className="form-group">
								<label>Fecha emisión</label>
								<input
									required
									type="date"
									value={form.fechaEmision}
									onChange={(e) =>
										setForm({ ...form, fechaEmision: e.target.value })
									}
								/>
							</div>

							<div className="form-group">
								<label>Fecha vencimiento</label>
								<input
									required
									type="date"
									min={form.fechaEmision}
									value={form.fechaVencimiento}
									onChange={(e) =>
										setForm({ ...form, fechaVencimiento: e.target.value })
									}
								/>
							</div>
						</div>

						<p className="module-subtitle">
							El recibo se crea como "Pendiente por pagar". El estado solo
							cambia cuando el residente sube su comprobante y tú lo revisas.
						</p>

						<div className="form-footer">
							<button className="primary-btn">Guardar</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
}
