import { useEffect, useState } from "react";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import {
	paquetesApi,
	apartamentosApi,
	getEstadosPaquete,
	entregarPaquete,
} from "../../api";
import { onlyLetters } from "../../utils/validation";
import "../../styles/modules.css";

const initial = {
	descripcion: "",
	remitente: "",
	fechaRecepcion: "",
	fechaEntrega: "",
	estadoId: "1",
	apartamentoId: "",
};

const fmt = (d) => (d ? new Date(d).toLocaleString("es-CO") : "—");

export default function PaquetesPage() {
	const [items, setItems] = useState([]);
	const [apts, setApts] = useState([]);
	const [estados, setEstados] = useState([]);
	const [form, setForm] = useState(initial);
	const [editId, setEditId] = useState(null);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState({ estado: "", torre: "", desde: "", hasta: "" });

	const load = () =>
		paquetesApi.list().then(setItems).catch((e) => setError(e.message));

	useEffect(() => {
		load();
		apartamentosApi.list().then(setApts);
		getEstadosPaquete().then(setEstados);
	}, []);

	const submit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const p = {
				descripcion: form.descripcion.trim(),
				remitente: form.remitente.trim(),
				fechaRecepcion: form.fechaRecepcion,
				fechaEntrega: form.fechaEntrega || null,
				estadoPaquete: { id: Number(form.estadoId) },
				apartamento: { id: Number(form.apartamentoId) },
			};

			if (editId) {
				await paquetesApi.update(editId, p);
			} else {
				await paquetesApi.create(p);
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
			descripcion: x.descripcion,
			remitente: x.remitente,
			fechaRecepcion: x.fechaRecepcion?.slice(0, 16) ?? "",
			fechaEntrega: x.fechaEntrega?.slice(0, 16) ?? "",
			estadoId: x.estadoPaquete?.id ?? "1",
			apartamentoId: x.apartamento?.id ?? "",
		});
		setEditId(x.id);
		setOpen(true);
	};

	const deliver = async (id) => {
		try {
			await entregarPaquete(id);
			load();
		} catch (e) {
			setError(e.message);
		}
	};

	const remove = async (id) => {
		if (confirm("¿Eliminar paquete?")) {
			try {
				await paquetesApi.remove(id);
				load();
			} catch (e) {
				setError(e.message);
			}
		}
	};

	const filtered = items.filter((x) => {
		const fecha = x.fechaRecepcion?.slice(0, 10) || "";
		const texto = `${x.descripcion} ${x.remitente} ${x.apartamento?.numeroApartamento} ${x.apartamento?.torre?.nombreTorre}`.toLowerCase();
		return texto.includes(search.toLowerCase())
			&& (!filters.estado || x.estadoPaquete?.id === Number(filters.estado))
			&& (!filters.torre || String(x.apartamento?.torre?.id) === filters.torre)
			&& (!filters.desde || fecha >= filters.desde)
			&& (!filters.hasta || fecha <= filters.hasta);
	});

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Paquetes</h1>
					<p className="module-subtitle">
						Controla la recepción y entrega de paquetes.
					</p>
				</div>
				<button
					className="primary-btn"
					onClick={() => {
						setForm({
							...initial,
							fechaRecepcion: new Date().toISOString().slice(0, 16),
						});
						setEditId(null);
						setError("");
						setOpen(true);
					}}
				>
					+ Registrar paquete
				</button>
			</div>

			<div className="card-panel">
				<div className="toolbar"><strong>{filtered.length} de {items.length} paquetes</strong></div>
				<MultiCriteriaBar
					search={search}
					onSearch={setSearch}
					searchPlaceholder="Descripción, remitente, apartamento o torre..."
					filters={[
						{name: "estado", label: "Estado", type: "select", value: filters.estado, onChange: (value) => setFilters({ ...filters, estado: value }), options: estados.map((x) => ({ value: x.id, label: x.nombre }))},
						{name: "torre", label: "Torre", type: "select", value: filters.torre, onChange: (value) => setFilters({ ...filters, torre: value }), options: [...new Map(apts.map((x) => [x.torre?.id, x.torre])).values()].filter(Boolean).map((x) => ({ value: x.id, label: x.nombreTorre }))},
						{name: "desde", label: "Recibido desde", type: "date", value: filters.desde, onChange: (value) => setFilters({ ...filters, desde: value })},
						{name: "hasta", label: "Recibido hasta", type: "date", value: filters.hasta, onChange: (value) => setFilters({ ...filters, hasta: value })},
					]}
					onClear={() => { setSearch(""); setFilters({ estado: "", torre: "", desde: "", hasta: "" }); }}
				/>

				<div className="table-wrap">
					<table className="module-table">
						<thead>
							<tr>
								<th>Paquete</th>
								<th>Remitente</th>
								<th>Apartamento</th>
								<th>Recibido</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							{filtered.length ? (
								filtered.map((x) => (
									<tr key={x.id}>
										<td>{x.descripcion}</td>
										<td>{x.remitente}</td>
										<td>
											{x.apartamento?.torre?.nombreTorre} - {x.apartamento?.numeroApartamento}
										</td>
										<td>{fmt(x.fechaRecepcion)}</td>
										<td>
											<span
												className={`badge ${
													x.estadoPaquete?.nombre === "Entregado"
														? "badge-success"
														: "badge-warning"
												}`}
											>
												{x.estadoPaquete?.nombre}
											</span>
										</td>
										<td className="actions-cell">
											{x.estadoPaquete?.nombre !== "Entregado" && (
												<button
													className="small-btn"
													onClick={() => deliver(x.id)}
												>
													Entregar
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
									<td colSpan="6" className="empty-row">
										No hay paquetes.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{open && (
				<Modal
					title={editId ? "Editar paquete" : "Registrar paquete"}
					onClose={() => setOpen(false)}
				>
					<form onSubmit={submit}>
						{error && <div className="form-error">{error}</div>}
						<div className="form-grid">
							<div className="form-group full">
								<label>Descripción</label>
								<input
									required
									maxLength="200"
									value={form.descripcion}
									onChange={(e) =>
										setForm({ ...form, descripcion: e.target.value })
									}
								/>
							</div>

							<div className="form-group">
								<label>Remitente</label>
								<input
									required
									maxLength="100"
									pattern="[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]+"
									value={form.remitente}
									onChange={(e) => setForm({ ...form, remitente: onlyLetters(e.target.value) })}
								/>
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
									{apts.map((a) => (
										<option key={a.id} value={a.id}>
											{a.torre?.nombreTorre} - {a.numeroApartamento}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label>Recepción</label>
								<input
									required
									type="datetime-local"
									value={form.fechaRecepcion}
									onChange={(e) =>
										setForm({ ...form, fechaRecepcion: e.target.value })
									}
								/>
							</div>

							<div className="form-group">
								<label>Entrega</label>
								<input
									type="datetime-local"
									value={form.fechaEntrega}
									min={form.fechaRecepcion}
									onChange={(e) =>
										setForm({ ...form, fechaEntrega: e.target.value })
									}
								/>
							</div>

							<div className="form-group">
								<label>Estado</label>
								<select
									required
									value={form.estadoId}
									onChange={(e) =>
										setForm({ ...form, estadoId: e.target.value })
									}
								>
									{estados.map((s) => (
										<option key={s.id} value={s.id}>
											{s.nombre}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="form-footer">
							<button className="primary-btn">Guardar</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
}
