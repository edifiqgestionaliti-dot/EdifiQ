import { useEffect, useState } from "react";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import {
	visitasApi,
	apartamentosApi,
	getTiposVisita,
	getTiposDocumento,
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
	apartamentoId: "",
};

const fmt = (d) => (d ? new Date(d).toLocaleString("es-CO") : "—");

const esActiva = (x) => {
	const nombre = x.estadoVisita?.nombre?.toLowerCase() ?? "";
	return nombre !== "finalizada" && nombre !== "cancelada";
};

export default function VigilanteVisitasPage() {
	const [items, setItems] = useState([]);
	const [apts, setApts] = useState([]);
	const [tipos, setTipos] = useState([]);
	const [docs, setDocs] = useState([]);
	const [form, setForm] = useState(initial);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [soloActivas, setSoloActivas] = useState(true);
	const [filters, setFilters] = useState({ tipo: "", torre: "", desde: "", hasta: "" });

	const load = () =>
		visitasApi.list().then(setItems).catch((e) => setError(e.message));

	useEffect(() => {
		load();
		apartamentosApi.list().then(setApts);
		getTiposVisita().then(setTipos);
		getTiposDocumento().then(setDocs);
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
				fechaIngreso: new Date().toISOString().slice(0, 19),
				estadoVisita: { id: 1 },
				apartamento: { id: Number(form.apartamentoId) },
			};

			await visitasApi.create(v);

			setOpen(false);
			setForm(initial);
			load();
		} catch (e) {
			setError(e.message);
		}
	};

	const registrarSalida = async (id) => {
		try {
			await finalizarVisita(id);
			load();
		} catch (e) {
			setError(e.message);
		}
	};

	const filtered = items
		.filter((x) => (soloActivas ? esActiva(x) : true))
		.filter((x) =>
			`${x.nombreVisitante} ${x.documentoVisitante} ${x.apartamento?.numeroApartamento} ${x.apartamento?.torre?.nombreTorre}`
				.toLowerCase()
				.includes(search.toLowerCase()),
		)
		.filter((x) => !filters.tipo || String(x.tipoVisita?.id) === filters.tipo)
		.filter((x) => !filters.torre || String(x.apartamento?.torre?.id) === filters.torre)
		.filter((x) => !filters.desde || x.fechaIngreso?.slice(0, 10) >= filters.desde)
		.filter((x) => !filters.hasta || x.fechaIngreso?.slice(0, 10) <= filters.hasta)
		.sort((a, b) => new Date(b.fechaIngreso) - new Date(a.fechaIngreso));

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Control de visitas</h1>
					<p className="module-subtitle">
						Registra el ingreso de visitantes y controla su salida.
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
					+ Registrar ingreso
				</button>
			</div>

			<div className="card-panel">
				<div className="toolbar">
					<strong>{filtered.length} visitas</strong>
					<label htmlFor="vigilante-solo-activas" style={{ display: "flex", alignItems: "center", gap: 6 }}>
						<input
							id="vigilante-solo-activas"
							type="checkbox"
							checked={soloActivas}
							onChange={(e) => setSoloActivas(e.target.checked)}
						/>
						<span>Solo activas</span>
					</label>
					<MultiCriteriaBar
						search={search}
						onSearch={setSearch}
						searchPlaceholder="Visitante, documento, apartamento o torre..."
						filters={[
							{name: "tipo", label: "Tipo", type: "select", value: filters.tipo, onChange: (value) => setFilters({ ...filters, tipo: value }), options: tipos.map((x) => ({ value: x.id, label: x.nombre }))},
							{name: "torre", label: "Torre", type: "select", value: filters.torre, onChange: (value) => setFilters({ ...filters, torre: value }), options: [...new Map(apts.map((x) => [x.torre?.id, x.torre])).values()].filter(Boolean).map((x) => ({ value: x.id, label: x.nombreTorre }))},
							{name: "desde", label: "Ingreso desde", type: "date", value: filters.desde, onChange: (value) => setFilters({ ...filters, desde: value })},
							{name: "hasta", label: "Ingreso hasta", type: "date", value: filters.hasta, onChange: (value) => setFilters({ ...filters, hasta: value })},
						]}
						onClear={() => { setSearch(""); setFilters({ tipo: "", torre: "", desde: "", hasta: "" }); }}
					/>
				</div>

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
												className={`badge ${
													!esActiva(x) ? "badge-success" : "badge-info"
												}`}
											>
												{x.estadoVisita?.nombre}
											</span>
										</td>
										<td className="actions-cell">
											{esActiva(x) && (
												<button
													className="small-btn"
													onClick={() => registrarSalida(x.id)}
												>
													Registrar salida
												</button>
											)}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="7" className="empty-row">
										No hay visitas para mostrar.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{open && (
				<Modal title="Registrar ingreso de visitante" onClose={() => setOpen(false)}>
					<form onSubmit={submit}>
						{error && <div className="form-error">{error}</div>}
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="vigilante-visita-tipo">Tipo de visita</label>
								<select
									id="vigilante-visita-tipo"
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
								<label htmlFor="vigilante-visita-apartamento">Apartamento a visitar</label>
								<select
									id="vigilante-visita-apartamento"
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
								<label htmlFor="vigilante-visita-documento-tipo">Tipo de documento</label>
								<select
									id="vigilante-visita-documento-tipo"
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
								<label htmlFor="vigilante-visita-documento">Documento</label>
								<input
									id="vigilante-visita-documento"
									required
									maxLength="30"
									inputMode="numeric"
									pattern="[0-9]+"
									value={form.documentoVisitante}
									onChange={(e) => setForm({ ...form, documentoVisitante: onlyNumbers(e.target.value) })}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="vigilante-visita-nombre">Nombre completo</label>
								<input
									id="vigilante-visita-nombre"
									required
									maxLength="100"
									pattern="[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]+"
									value={form.nombreVisitante}
									onChange={(e) => setForm({ ...form, nombreVisitante: onlyLetters(e.target.value) })}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="vigilante-visita-motivo">Motivo</label>
								<input
									id="vigilante-visita-motivo"
									maxLength="150"
									value={form.motivoVisita}
									onChange={(e) =>
										setForm({ ...form, motivoVisita: e.target.value })
									}
								/>
							</div>
						</div>

						<div className="form-footer">
							<button type="submit" className="primary-btn">Registrar ingreso</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
}
