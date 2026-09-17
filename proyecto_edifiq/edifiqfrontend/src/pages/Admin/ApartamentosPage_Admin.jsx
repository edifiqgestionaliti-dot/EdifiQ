import { useEffect, useState } from "react";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import { apartamentosApi, torresApi, getPersonasDeApartamento } from "../../api";
import "../../styles/modules.css";

const initial = {
	numeroApartamento: "",
	piso: "",
	torreId: "",
	activo: true,
};

export default function ApartamentosPage() {
	const [items, setItems] = useState([]);
	const [torres, setTorres] = useState([]);
	const [form, setForm] = useState(initial);
	const [editId, setEditId] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [torreFiltro, setTorreFiltro] = useState("");
	const [filtros, setFiltros] = useState({ estado: "", pisoMin: "", pisoMax: "" });

	const [detalle, setDetalle] = useState(null);
	const [ocupantes, setOcupantes] = useState([]);
	const [cargandoDetalle, setCargandoDetalle] = useState(false);
	const [errorDetalle, setErrorDetalle] = useState("");

	const load = () =>
		apartamentosApi.list().then(setItems).catch((e) => setError(e.message));

	useEffect(() => {
		load();
		torresApi.list().then(setTorres).catch((e) => setError(e.message));
	}, []);

	const submit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const p = {
				numeroApartamento: form.numeroApartamento.trim(),
				piso: Number(form.piso),
				torre: { id: Number(form.torreId) },
				activo: form.activo,
			};

			if (editId) {
				await apartamentosApi.update(editId, p);
			} else {
				await apartamentosApi.create(p);
			}

			setForm(initial);
			setEditId(null);
			setShowModal(false);
			load();
		} catch (e) {
			setError(e.message);
		}
	};

	const edit = (x) => {
		setForm({
			numeroApartamento: x.numeroApartamento,
			piso: x.piso,
			torreId: x.torre?.id ?? "",
			activo: x.activo,
		});
		setEditId(x.id);
		setShowModal(true);
	};

	const remove = async (id) => {
		if (!confirm("¿Eliminar este apartamento?")) return;

		try {
			await apartamentosApi.remove(id);
			load();
		} catch (e) {
			setError(e.message);
		}
	};

	const verDetalle = async (apto) => {
		setDetalle(apto);
		setOcupantes([]);
		setErrorDetalle("");
		setCargandoDetalle(true);
		try {
			const data = await getPersonasDeApartamento(apto.id);
			setOcupantes(data);
		} catch (e) {
			setErrorDetalle(e.message);
		} finally {
			setCargandoDetalle(false);
		}
	};

	const filtered = items.filter((x) => {
		const coincideBusqueda = `${x.numeroApartamento} ${x.torre?.nombreTorre}`
			.toLowerCase()
			.includes(search.toLowerCase());
		const coincideTorre = !torreFiltro || String(x.torre?.id) === torreFiltro;
		const coincideEstado = !filtros.estado || String(Boolean(x.activo)) === filtros.estado;
		const coincidePisoMin = !filtros.pisoMin || Number(x.piso) >= Number(filtros.pisoMin);
		const coincidePisoMax = !filtros.pisoMax || Number(x.piso) <= Number(filtros.pisoMax);
		return coincideBusqueda && coincideTorre && coincideEstado && coincidePisoMin && coincidePisoMax;
	});

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Apartamentos</h1>
					<p className="module-subtitle">
						Administra las unidades residenciales y sus torres.
					</p>
				</div>
				<button
					className="primary-btn"
					onClick={() => {
						setForm(initial);
						setEditId(null);
						setShowModal(true);
						setError("");
					}}
				>
					+ Nuevo apartamento
				</button>
			</div>

			<div className="card-panel">
				<div className="toolbar"><strong>{filtered.length} apartamentos</strong></div>
				<MultiCriteriaBar
					search={search}
					onSearch={setSearch}
					searchPlaceholder="Buscar apartamento o torre..."
					filters={[
						{name: "torre", label: "Torre", type: "select", value: torreFiltro, onChange: setTorreFiltro, options: torres.map((x) => ({ value: x.id, label: x.nombreTorre }))},
						{name: "estado", label: "Estado", type: "select", value: filtros.estado, onChange: (value) => setFiltros({ ...filtros, estado: value }), options: [{ value: "true", label: "Activos" }, { value: "false", label: "Inactivos" }]},
						{name: "pisoMin", label: "Piso mínimo", type: "number", value: filtros.pisoMin, onChange: (value) => setFiltros({ ...filtros, pisoMin: value })},
						{name: "pisoMax", label: "Piso máximo", type: "number", value: filtros.pisoMax, onChange: (value) => setFiltros({ ...filtros, pisoMax: value })},
					]}
					onClear={() => { setSearch(""); setTorreFiltro(""); setFiltros({ estado: "", pisoMin: "", pisoMax: "" }); }}
				/>

				<div className="table-wrap">
					<table className="module-table">
						<thead>
							<tr>
								<th>ID</th>
								<th>Apartamento</th>
								<th>Torre</th>
								<th>Piso</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							{filtered.length ? (
								filtered.map((x) => (
									<tr key={x.id} className="clickable-row" onClick={() => verDetalle(x)}>
										<td>{x.id}</td>
										<td>{x.numeroApartamento}</td>
										<td>{x.torre?.nombreTorre}</td>
										<td>{x.piso}</td>
										<td>
											<span
												className={`badge ${
													x.activo ? "badge-success" : "badge-danger"
												}`}
											>
												{x.activo ? "Activo" : "Inactivo"}
											</span>
										</td>
										<td className="actions-cell" onClick={(e) => e.stopPropagation()}>
											<button className="small-btn" onClick={() => verDetalle(x)}>
												Ver
											</button>{" "}
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
									<td colSpan="6" className="empty-row">
										No hay apartamentos.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{showModal && (
				<Modal
					title={editId ? "Editar apartamento" : "Nuevo apartamento"}
					onClose={() => {
						setShowModal(false);
						setEditId(null);
					}}
				>
					<ApartmentForm
						form={form}
						setForm={setForm}
						submit={submit}
						torres={torres}
						error={error}
						edit={editId !== null}
					/>
				</Modal>
			)}

			{detalle && (
				<Modal
					title={`Apartamento ${detalle.numeroApartamento} · ${detalle.torre?.nombreTorre}`}
					onClose={() => setDetalle(null)}
				>
					<div className="form-grid">
						<div>
							<strong>Torre</strong>
							<p>{detalle.torre?.nombreTorre}</p>
						</div>
						<div>
							<strong>Piso</strong>
							<p>{detalle.piso}</p>
						</div>
						<div>
							<strong>Estado</strong>
							<p>{detalle.activo ? "Activo" : "Inactivo"}</p>
						</div>
					</div>

					{cargandoDetalle && <p>Cargando ocupantes...</p>}
					{errorDetalle && <div className="form-error">{errorDetalle}</div>}

					{!cargandoDetalle && !errorDetalle && (
						<>
							<h3 style={{ marginTop: "18px" }}>Residente(s)</h3>
							<table className="module-table">
								<thead>
									<tr>
										<th>Nombre</th>
										<th>Documento</th>
										<th>Teléfono</th>
										<th>Tipo</th>
										<th>Ingreso</th>
									</tr>
								</thead>
								<tbody>
									{ocupantes.filter(
										(o) => !o.tipoResidente?.nombre?.toLowerCase().includes("familiar")
									).length ? (
										ocupantes
											.filter(
												(o) =>
													!o.tipoResidente?.nombre?.toLowerCase().includes("familiar")
											)
											.map((o) => (
												<tr key={o.persona.id}>
													<td>
														{o.persona.nombres} {o.persona.apellidos}
													</td>
													<td>{o.persona.numeroDocumento}</td>
													<td>{o.persona.telefono || "—"}</td>
													<td>{o.tipoResidente?.nombre}</td>
													<td>{o.fechaIngreso}</td>
												</tr>
											))
									) : (
										<tr>
											<td colSpan="5" className="empty-row">
												Este apartamento no tiene residente asignado.
											</td>
										</tr>
									)}
								</tbody>
							</table>

							<h3 style={{ marginTop: "18px" }}>Familiares</h3>
							<table className="module-table">
								<thead>
									<tr>
										<th>Nombre</th>
										<th>Documento</th>
										<th>Teléfono</th>
										<th>Correo</th>
										<th>Ingreso</th>
									</tr>
								</thead>
								<tbody>
									{ocupantes.filter((o) =>
										o.tipoResidente?.nombre?.toLowerCase().includes("familiar")
									).length ? (
										ocupantes
											.filter((o) =>
												o.tipoResidente?.nombre?.toLowerCase().includes("familiar")
											)
											.map((o) => (
												<tr key={o.persona.id}>
													<td>
														{o.persona.nombres} {o.persona.apellidos}
													</td>
													<td>{o.persona.numeroDocumento}</td>
													<td>{o.persona.telefono || "—"}</td>
													<td>{o.persona.correo || "—"}</td>
													<td>{o.fechaIngreso}</td>
												</tr>
											))
									) : (
										<tr>
											<td colSpan="5" className="empty-row">
												No hay familiares registrados en este apartamento.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</>
					)}
				</Modal>
			)}

		</div>
	);
}

function ApartmentForm({ form, setForm, submit, torres, error, edit }) {
	return (
		<form onSubmit={submit}>
			{error && <div className="form-error">{error}</div>}
			<div className="form-grid">
				<div className="form-group">
					<label>Número</label>
					<input
						required
						maxLength="10"
						value={form.numeroApartamento}
						onChange={(e) =>
							setForm({ ...form, numeroApartamento: e.target.value })
						}
					/>
				</div>
				<div className="form-group">
					<label>Piso</label>
					<input
						required
						type="number"
						min="0"
						value={form.piso}
						onChange={(e) => setForm({ ...form, piso: e.target.value })}
					/>
				</div>
				<div className="form-group">
					<label>Torre</label>
					<select
						required
						value={form.torreId}
						onChange={(e) => setForm({ ...form, torreId: e.target.value })}
					>
						<option value="">Seleccione...</option>
						{torres.map((t) => (
							<option key={t.id} value={t.id}>
								{t.nombreTorre}
							</option>
						))}
					</select>
				</div>
				<div className="form-group">
					<label>Estado</label>
					<select
						value={form.activo}
						onChange={(e) =>
							setForm({ ...form, activo: e.target.value === "true" })
						}
					>
						<option value="true">Activo</option>
						<option value="false">Inactivo</option>
					</select>
				</div>
			</div>
			<div className="form-footer">
				<button type="submit" className="primary-btn">
					{edit ? "Guardar cambios" : "Crear apartamento"}
				</button>
			</div>
		</form>
	);
}