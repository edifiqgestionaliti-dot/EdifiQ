import { useEffect, useState } from "react";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import { recibosApi, apartamentosApi, getTiposServicio } from "../../api";
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

export default function VigilanteRecibosPage() {
	const [items, setItems] = useState([]);
	const [apts, setApts] = useState([]);
	const [servicios, setServicios] = useState([]);
	const [form, setForm] = useState(initial);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState({ servicio: "", torre: "", desde: "", hasta: "" });

	const load = () =>
		recibosApi.list().then(setItems).catch((e) => setError(e.message));

	useEffect(() => {
		load();
		apartamentosApi.list().then(setApts);
		getTiposServicio().then(setServicios);
	}, []);

	const submit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			await recibosApi.create({
				tipoServicio: { id: Number(form.tipoServicioId) },
				periodo: form.periodo.trim(),
				valor: Number(form.valor),
				fechaEmision: form.fechaEmision,
				fechaVencimiento: form.fechaVencimiento,
				apartamento: { id: Number(form.apartamentoId) },
			});

			setOpen(false);
			setForm(initial);
			load();
		} catch (e) {
			setError(e.message);
		}
	};

	const filtered = items
		.filter((x) =>
			`${x.periodo} ${x.tipoServicio?.nombre} ${x.apartamento?.numeroApartamento} ${x.apartamento?.torre?.nombreTorre}`
				.toLowerCase()
				.includes(search.toLowerCase()),
		)
		.filter((x) => !filters.servicio || String(x.tipoServicio?.id) === filters.servicio)
		.filter((x) => !filters.torre || String(x.apartamento?.torre?.id) === filters.torre)
		.filter((x) => !filters.desde || x.fechaVencimiento >= filters.desde)
		.filter((x) => !filters.hasta || x.fechaVencimiento <= filters.hasta)
		.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Recibos</h1>
					<p className="module-subtitle">
						Registra los recibos que llegan y asígnalos al apartamento.
					</p>
				</div>
				<button
					className="primary-btn"
					onClick={() => {
						setForm(initial);
						setError("");
						setOpen(true);
					}}
				>
					+ Registrar recibo
				</button>
			</div>

			<div className="card-panel">
				<div className="toolbar">
					<strong>{filtered.length} recibos</strong>
					<MultiCriteriaBar
						search={search}
						onSearch={setSearch}
						searchPlaceholder="Periodo, servicio, apartamento o torre..."
						filters={[
							{name: "servicio", label: "Servicio", type: "select", value: filters.servicio, onChange: (value) => setFilters({ ...filters, servicio: value }), options: servicios.map((x) => ({ value: x.id, label: x.nombre }))},
							{name: "torre", label: "Torre", type: "select", value: filters.torre, onChange: (value) => setFilters({ ...filters, torre: value }), options: [...new Map(apts.map((x) => [x.torre?.id, x.torre])).values()].filter(Boolean).map((x) => ({ value: x.id, label: x.nombreTorre }))},
							{name: "desde", label: "Vence desde", type: "date", value: filters.desde, onChange: (value) => setFilters({ ...filters, desde: value })},
							{name: "hasta", label: "Vence hasta", type: "date", value: filters.hasta, onChange: (value) => setFilters({ ...filters, hasta: value })},
						]}
						onClear={() => { setSearch(""); setFilters({ servicio: "", torre: "", desde: "", hasta: "" }); }}
					/>
				</div>

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
									</tr>
								))
							) : (
								<tr>
									<td colSpan="6" className="empty-row">
										No hay recibos registrados.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{open && (
				<Modal title="Registrar recibo" onClose={() => setOpen(false)}>
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
								<label>Apartamento destino</label>
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

						<div className="form-footer">
							<button className="primary-btn">Registrar recibo</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
}
