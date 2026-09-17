import { useEffect, useState } from "react";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import {
	visitasApi,
	apartamentosApi,
	getTiposVisita,
	getTiposDocumento,
	getEstadosVisita,
	finalizarVisita,
} from "../../api";
import { onlyLetters, onlyNumbers } from "../../utils/validation";
import "../../styles/modules.css";

const initial = {
	tipoVisitaId: "",
	tipoDocumentoId: "",
	nombreVisitante: "",
	documentoVisitante: "",
	motivoVisita: "",
	fechaIngreso: "",
	fechaSalida: "",
	estadoId: "1",
	apartamentoId: "",
};

const fmt = (d) => (d ? new Date(d).toLocaleString("es-CO") : "—");
const estadoBadgeClass = (nombre) => {
	if (nombre === "Finalizada") return "badge-success";
	if (nombre === "Cancelada") return "badge-danger";
	return "badge-info";
};

export default function VisitasPage() {
	const [items, setItems] = useState([]);
	const [apts, setApts] = useState([]);
	const [tipos, setTipos] = useState([]);
	const [docs, setDocs] = useState([]);
	const [estados, setEstados] = useState([]);
	const [form, setForm] = useState(initial);
	const [editId, setEditId] = useState(null);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState({ tipo: "", estado: "", torre: "", desde: "", hasta: "" });

	const load = () =>
		visitasApi.list().then(setItems).catch((e) => setError(e.message));

	useEffect(() => {
		load();
		apartamentosApi.list().then(setApts);
		getTiposVisita().then(setTipos);
		getTiposDocumento().then(setDocs);
		getEstadosVisita().then(setEstados);
	}, []);

	const submit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const v = {
				tipoVisita: { id: Number(form.tipoVisitaId) },
				tipoDocumento: { id: Number(form.tipoDocumentoId) },
				nombreVisitante: form.nombreVisitante.trim(),
				documentoVisitante: form.documentoVisitante.trim(),
				motivoVisita: form.motivoVisita.trim(),
				fechaIngreso: form.fechaIngreso,
				fechaSalida: form.fechaSalida || null,
				estadoVisita: { id: Number(form.estadoId) },
				apartamento: { id: Number(form.apartamentoId) },
			};

			if (editId) {
				await visitasApi.update(editId, v);
			} else {
				await visitasApi.create(v);
			}

			setOpen(false);
			setEditId(null);
			setForm(initial);
			load();
		} catch (e) {
			setError(e.message);
		}
	};

	const edit = (x) => {
		setForm({
			tipoVisitaId: x.tipoVisita?.id ?? "",
			tipoDocumentoId: x.tipoDocumento?.id ?? "",
			nombreVisitante: x.nombreVisitante,
			documentoVisitante: x.documentoVisitante,
			motivoVisita: x.motivoVisita ?? "",
			fechaIngreso: x.fechaIngreso?.slice(0, 16) ?? "",
			fechaSalida: x.fechaSalida?.slice(0, 16) ?? "",
			estadoId: x.estadoVisita?.id ?? "1",
			apartamentoId: x.apartamento?.id ?? "",
		});
		setEditId(x.id);
		setOpen(true);
	};

	const finish = async (id) => {
		try {
			await finalizarVisita(id);
			load();
		} catch (e) {
			setError(e.message);
		}
	};

	const remove = async (id) => {
		if (confirm("¿Eliminar visita?")) {
			try {
				await visitasApi.remove(id);
				load();
			} catch (e) {
				setError(e.message);
			}
		}
	};

	const filtered = items.filter((x) => {
		const fecha = x.fechaIngreso?.slice(0, 10) || "";
		const texto = `${x.nombreVisitante} ${x.documentoVisitante} ${x.apartamento?.numeroApartamento} ${x.apartamento?.torre?.nombreTorre}`.toLowerCase();
		return texto.includes(search.toLowerCase())
			&& (!filters.tipo || String(x.tipoVisita?.id) === filters.tipo)
			&& (!filters.estado || String(x.estadoVisita?.id) === filters.estado)
			&& (!filters.torre || String(x.apartamento?.torre?.id) === filters.torre)
			&& (!filters.desde || fecha >= filters.desde)
			&& (!filters.hasta || fecha <= filters.hasta);
	});

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Visitas</h1>
					<p className="module-subtitle">
						Controla el ingreso y salida de visitantes.
					</p>
				</div>
				<button
					className="primary-btn"
					onClick={() => {
						setForm({
							...initial,
							fechaIngreso: new Date().toISOString().slice(0, 16),
						});
						setEditId(null);
						setError("");
						setOpen(true);
					}}
				>
					+ Registrar visita
				</button>
			</div>

			<div className="card-panel">
				<div className="toolbar"><strong>{filtered.length} de {items.length} visitas</strong></div>
				<MultiCriteriaBar
					search={search}
					onSearch={setSearch}
					searchPlaceholder="Visitante, documento, apartamento o torre..."
					filters={[
						{name: "tipo", label: "Tipo", type: "select", value: filters.tipo, onChange: (value) => setFilters({ ...filters, tipo: value }), options: tipos.map((x) => ({ value: x.id, label: x.nombre }))},
						{name: "estado", label: "Estado", type: "select", value: filters.estado, onChange: (value) => setFilters({ ...filters, estado: value }), options: estados.map((x) => ({ value: x.id, label: x.nombre }))},
						{name: "torre", label: "Torre", type: "select", value: filters.torre, onChange: (value) => setFilters({ ...filters, torre: value }), options: [...new Map(apts.map((x) => [x.torre?.id, x.torre])).values()].filter(Boolean).map((x) => ({ value: x.id, label: x.nombreTorre }))},
						{name: "desde", label: "Ingreso desde", type: "date", value: filters.desde, onChange: (value) => setFilters({ ...filters, desde: value })},
						{name: "hasta", label: "Ingreso hasta", type: "date", value: filters.hasta, onChange: (value) => setFilters({ ...filters, hasta: value })},
					]}
					onClear={() => { setSearch(""); setFilters({ tipo: "", estado: "", torre: "", desde: "", hasta: "" }); }}
				/>

				<div className="table-wrap">
					<table className="module-table">
						<thead>
							<tr>
								<th>Visitante</th>
								<th>Tipo</th>
								<th>Apartamento</th>
								<th>Ingreso</th>
								<th>Salida</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							{filtered.length ? (
								filtered.map((x) => (
									<tr key={x.id}>
										<td>
											<strong>{x.nombreVisitante}</strong>
											<br />
											<small>{x.documentoVisitante}</small>
										</td>
										<td>{x.tipoVisita?.nombre}</td>
										<td>
											{x.apartamento?.torre?.nombreTorre} - {x.apartamento?.numeroApartamento}
										</td>
										<td>{fmt(x.fechaIngreso)}</td>
										<td>{fmt(x.fechaSalida)}</td>
										<td>
											<span
														className={`badge ${estadoBadgeClass(x.estadoVisita?.nombre)}`}
											>
												{x.estadoVisita?.nombre}
											</span>
										</td>
										<td className="actions-cell">
											{x.estadoVisita?.nombre !== "Finalizada" && (
												<button
													className="small-btn"
													onClick={() => finish(x.id)}
												>
													Finalizar
												</button>
											)}{" "}
											<button className="small-btn" onClick={() => edit(x)}>
												Editar
											</button>{" "}
											<button
												className="danger-btn small-btn"
												onClick={() => remove(x.id)}
											>
												Eliminar
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="7" className="empty-row">
										No hay visitas.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{open && (
				<Modal
					title={editId ? "Editar visita" : "Registrar visita"}
					onClose={() => setOpen(false)}
				>
					<form onSubmit={submit}>
						{error && <div className="form-error">{error}</div>}
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="admin-visita-tipo">Tipo de visita</label>
								<select
									id="admin-visita-tipo"
									required
									value={form.tipoVisitaId}
									onChange={(e) =>
										setForm({ ...form, tipoVisitaId: e.target.value })
									}
								>
									<option value="">Seleccione...</option>
									{tipos.map((x) => (
										<option key={x.id} value={x.id}>
											{x.nombre}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="admin-visita-apartamento">Apartamento</label>
								<select
									id="admin-visita-apartamento"
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
								<label htmlFor="admin-visita-documento-tipo">Tipo de documento</label>
								<select
									id="admin-visita-documento-tipo"
									required
									value={form.tipoDocumentoId}
									onChange={(e) =>
										setForm({ ...form, tipoDocumentoId: e.target.value })
									}
								>
									<option value="">Seleccione...</option>
									{docs.map((x) => (
										<option key={x.id} value={x.id}>
											{x.nombre}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="admin-visita-documento">Documento</label>
								<input
									id="admin-visita-documento"
									required
									maxLength="30"
									inputMode="numeric"
									pattern="[0-9]+"
									value={form.documentoVisitante}
									onChange={(e) => setForm({ ...form, documentoVisitante: onlyNumbers(e.target.value) })}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="admin-visita-nombre">Nombre completo</label>
								<input
									id="admin-visita-nombre"
									required
									maxLength="100"
									pattern="[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]+"
									value={form.nombreVisitante}
									onChange={(e) => setForm({ ...form, nombreVisitante: onlyLetters(e.target.value) })}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="admin-visita-motivo">Motivo</label>
								<input
									id="admin-visita-motivo"
									maxLength="150"
									value={form.motivoVisita}
									onChange={(e) =>
										setForm({ ...form, motivoVisita: e.target.value })
									}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="admin-visita-ingreso">Ingreso</label>
								<input
									id="admin-visita-ingreso"
									required
									type="datetime-local"
									value={form.fechaIngreso}
									onChange={(e) =>
										setForm({ ...form, fechaIngreso: e.target.value })
									}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="admin-visita-salida">Salida</label>
								<input
									id="admin-visita-salida"
									type="datetime-local"
									min={form.fechaIngreso}
									value={form.fechaSalida}
									onChange={(e) =>
										setForm({ ...form, fechaSalida: e.target.value })
									}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="admin-visita-estado">Estado</label>
								<select
									id="admin-visita-estado"
									required
									value={form.estadoId}
									onChange={(e) =>
										setForm({ ...form, estadoId: e.target.value })
									}
								>
									{estados.map((x) => (
										<option key={x.id} value={x.id}>
											{x.nombre}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="form-footer">
							<button type="submit" className="primary-btn">Guardar visita</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
}
