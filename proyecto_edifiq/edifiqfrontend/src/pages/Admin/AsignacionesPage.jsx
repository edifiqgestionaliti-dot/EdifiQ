import { useEffect, useState } from "react";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import {
	asignacionesApi,
	apartamentosApi,
	getPersonas,
	getTiposResidente,
} from "../../api";
import "../../styles/modules.css";
const initial = {
	apartamentoId: "",
	personaId: "",
	tipoResidenteId: "",
	fechaIngreso: new Date().toISOString().slice(0, 10),
	fechaSalida: "",
};

export default function AsignacionesPage() {
	const [items, setItems] = useState([]);
	const [apts, setApts] = useState([]);
	const [personas, setPersonas] = useState([]);
	const [tipos, setTipos] = useState([]);
	const [form, setForm] = useState(initial);
	const [error, setError] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState({ tipo: "", estado: "" });

	const load = () =>
		asignacionesApi.list().then(setItems).catch((e) => setError(e.message));

	useEffect(() => {
		load();
		apartamentosApi.list().then(setApts);
		getPersonas().then(setPersonas);
		getTiposResidente().then(setTipos);
	}, []);

	const submit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			await asignacionesApi.create({
				apartamento: { id: Number(form.apartamentoId) },
				persona: { id: Number(form.personaId) },
				tipoResidente: { id: Number(form.tipoResidenteId) },
				fechaIngreso: form.fechaIngreso,
				fechaSalida: form.fechaSalida || null,
			});
			setForm(initial);
			setShowModal(false);
			load();
		} catch (e) {
			setError(e.message);
		}
	};

	const abrirModal = () => {
		setForm({ ...initial, fechaIngreso: new Date().toISOString().slice(0, 10) });
		setError("");
		setShowModal(true);
	};

	const cerrarModal = () => {
		setShowModal(false);
		setForm(initial);
		setError("");
	};

	const remove = async (x) => {
		if (confirm("¿Quitar esta asignación?")) {
			try {
				await asignacionesApi.remove(
					`${x.apartamento?.id}/${x.persona?.id}`,
				);
				load();
			} catch (e) {
				setError(e.message);
			}
		}
	};

	const filtered = items.filter((x) => {
		const texto = `${x.apartamento?.torre?.nombreTorre} ${x.apartamento?.numeroApartamento} ${x.persona?.nombres} ${x.persona?.apellidos} ${x.persona?.numeroDocumento}`.toLowerCase();
		const vigente = !x.fechaSalida;
		return texto.includes(search.toLowerCase())
			&& (!filters.tipo || String(x.tipoResidente?.id) === filters.tipo)
			&& (!filters.estado || (filters.estado === "vigente" ? vigente : !vigente));
	});

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Asignación de residentes</h1>
					<p className="module-subtitle">
						Relaciona personas con su apartamento y tipo de residencia.
					</p>
				</div>
				<button className="primary-btn" onClick={abrirModal}>
					+ Nueva asignación
				</button>
			</div>

			{showModal && (
				<Modal title="Nueva asignación" onClose={cerrarModal}>
					<form onSubmit={submit}>
						{error && <div className="form-error">{error}</div>}
					<div className="form-grid">
						<div className="form-group">
							<label htmlFor="asignacion-apartamento">Apartamento</label>
							<select
								id="asignacion-apartamento"
								required
								value={form.apartamentoId}
								onChange={(e) =>
									setForm({ ...form, apartamentoId: e.target.value })
								}
							>
								<option value="">Seleccione...</option>
								{apts.map((a) => (
									<option key={a.id} value={a.id}>
										{a.torre?.nombreTorre} - {a.numeroApartamento}
									</option>
								))}
							</select>
						</div>

						<div className="form-group">
							<label htmlFor="asignacion-persona">Persona</label>
							<select
								id="asignacion-persona"
								required
								value={form.personaId}
								onChange={(e) => setForm({ ...form, personaId: e.target.value })}
							>
								<option value="">Seleccione...</option>
								{personas.map((p) => (
									<option key={p.id} value={p.id}>
										{p.nombres} {p.apellidos} · {p.numeroDocumento}
									</option>
								))}
							</select>
						</div>

						<div className="form-group">
							<label htmlFor="asignacion-tipo">Tipo de residente</label>
							<select
								id="asignacion-tipo"
								required
								value={form.tipoResidenteId}
								onChange={(e) =>
									setForm({ ...form, tipoResidenteId: e.target.value })
								}
							>
								<option value="">Seleccione...</option>
								{tipos.map((t) => (
									<option key={t.id} value={t.id}>
										{t.nombre}
									</option>
								))}
							</select>
						</div>

						<div className="form-group">
							<label htmlFor="asignacion-ingreso">Fecha de ingreso</label>
							<input
								id="asignacion-ingreso"
								required
								type="date"
								value={form.fechaIngreso}
								onChange={(e) =>
									setForm({ ...form, fechaIngreso: e.target.value })
								}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="asignacion-salida">Fecha de salida (opcional)</label>
							<input
								id="asignacion-salida"
								type="date"
								min={form.fechaIngreso}
								value={form.fechaSalida}
								onChange={(e) => setForm({ ...form, fechaSalida: e.target.value })}
							/>
						</div>
					</div>

					<div className="form-footer">
						<button type="button" className="secondary-btn" onClick={cerrarModal}>
							Cancelar
						</button>
						<button type="submit" className="primary-btn">Asignar residente</button>
					</div>
					</form>
				</Modal>
			)}

			<div className="card-panel" style={{ marginTop: 20 }}>
				<div className="toolbar"><strong>{filtered.length} de {items.length} asignaciones</strong></div>
				<MultiCriteriaBar
					search={search}
					onSearch={setSearch}
					searchPlaceholder="Torre, apartamento, persona o documento..."
					filters={[
						{name: "tipo", label: "Tipo", type: "select", value: filters.tipo, onChange: (value) => setFilters({ ...filters, tipo: value }), options: tipos.map((x) => ({ value: x.id, label: x.nombre }))},
						{name: "estado", label: "Vigencia", type: "select", value: filters.estado, onChange: (value) => setFilters({ ...filters, estado: value }), options: [{ value: "vigente", label: "Vigentes" }, { value: "finalizada", label: "Finalizadas" }]},
					]}
					onClear={() => { setSearch(""); setFilters({ tipo: "", estado: "" }); }}
				/>
				<div className="table-wrap">
					<table className="module-table">
						<thead>
							<tr>
								<th>Apartamento</th>
								<th>Persona</th>
								<th>Tipo</th>
								<th>Ingreso</th>
								<th>Salida</th>
								<th>Acción</th>
							</tr>
						</thead>
						<tbody>
							{filtered.length ? (
								filtered.map((x, i) => (
									<tr key={`${x.apartamento?.id}-${x.persona?.id}-${i}`}>
										<td>
											{x.apartamento?.torre?.nombreTorre} - {x.apartamento?.numeroApartamento}
										</td>
										<td>
											{x.persona?.nombres} {x.persona?.apellidos}
										</td>
										<td>{x.tipoResidente?.nombre}</td>
										<td>{x.fechaIngreso}</td>
										<td>{x.fechaSalida || "Activo"}</td>
										<td>
											<button
												className="danger-btn small-btn"
												onClick={() => remove(x)}
											>
												Quitar
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan="6" className="empty-row">
										No hay asignaciones.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
