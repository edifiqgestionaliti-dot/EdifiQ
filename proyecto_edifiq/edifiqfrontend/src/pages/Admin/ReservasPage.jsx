import { useEffect, useState } from "react";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import {
	reservasApi,
	apartamentosApi,
	zonasApi,
	getEstadosReserva,
	cancelarReserva,
} from "../../api";
import { onlyNumbers } from "../../utils/validation";
import "../../styles/modules.css";

const initial = {
	fechaReserva: "",
	horaInicio: "",
	horaFin: "",
	cantidadInvitados: 0,
	estadoId: "1",
	zonaId: "",
	apartamentoId: "",
};

export default function ReservasPage() {
	const [items, setItems] = useState([]);
	const [apts, setApts] = useState([]);
	const [zonas, setZonas] = useState([]);
	const [estados, setEstados] = useState([]);
	const [form, setForm] = useState(initial);
	const [editId, setEditId] = useState(null);
	const [open, setOpen] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState({ zona: "", estado: "", desde: "", hasta: "", invitados: "" });

	const load = () =>
		reservasApi.list().then(setItems).catch((e) => setError(e.message));

	useEffect(() => {
		load();
		apartamentosApi.list().then(setApts);
		zonasApi.list().then(setZonas);
		getEstadosReserva().then(setEstados);
	}, []);

	const submit = async (e) => {
		e.preventDefault();
		setError("");

		if (form.horaFin <= form.horaInicio) {
			setError("La hora final debe ser posterior a la inicial.");
			return;
		}

		try {
			const p = {
				fechaReserva: form.fechaReserva,
				horaInicio: form.horaInicio,
				horaFin: form.horaFin,
				cantidadInvitados: Number(form.cantidadInvitados),
				estadoReserva: { id: Number(form.estadoId) },
				zona: { id: Number(form.zonaId) },
				apartamento: { id: Number(form.apartamentoId) },
			};

			if (editId) {
				await reservasApi.update(editId, p);
			} else {
				await reservasApi.create(p);
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
			fechaReserva: x.fechaReserva,
			horaInicio: x.horaInicio?.slice(0, 5),
			horaFin: x.horaFin?.slice(0, 5),
			cantidadInvitados: x.cantidadInvitados ?? 0,
			estadoId: x.estadoReserva?.id ?? "1",
			zonaId: x.zona?.id ?? "",
			apartamentoId: x.apartamento?.id ?? "",
		});
		setEditId(x.id);
		setOpen(true);
	};

	const cancel = async (id) => {
		if (confirm("¿Cancelar reserva?")) {
			try {
				await cancelarReserva(id);
				load();
			} catch (e) {
				setError(e.message);
			}
		}
	};

	const remove = async (id) => {
		if (confirm("¿Eliminar reserva?")) {
			try {
				await reservasApi.remove(id);
				load();
			} catch (e) {
				setError(e.message);
			}
		}
	};

	const filtered = items.filter((x) => {
		const texto = `${x.zona?.nombre} ${x.apartamento?.numeroApartamento} ${x.apartamento?.torre?.nombreTorre} ${x.fechaReserva}`.toLowerCase();
		return texto.includes(search.toLowerCase())
			&& (!filters.zona || String(x.zona?.id) === filters.zona)
			&& (!filters.estado || String(x.estadoReserva?.id) === filters.estado)
			&& (!filters.desde || x.fechaReserva >= filters.desde)
			&& (!filters.hasta || x.fechaReserva <= filters.hasta)
			&& (!filters.invitados || Number(x.cantidadInvitados) >= Number(filters.invitados));
	});

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Reservas</h1>
					<p className="module-subtitle">
						Administra las reservas de zonas comunes.
					</p>
				</div>
				<button
					className="primary-btn"
					onClick={() => {
						setForm(initial);
						setEditId(null);
						setError("");
						setOpen(true);
					}}
				>
					+ Nueva reserva
				</button>
			</div>

			<div className="card-panel">
				<div className="toolbar"><strong>{filtered.length} de {items.length} reservas</strong></div>
				<MultiCriteriaBar
					search={search}
					onSearch={setSearch}
					searchPlaceholder="Zona, apartamento, torre o fecha..."
					filters={[
						{name: "zona", label: "Zona", type: "select", value: filters.zona, onChange: (value) => setFilters({ ...filters, zona: value }), options: zonas.map((x) => ({ value: x.id, label: x.nombre }))},
						{name: "estado", label: "Estado", type: "select", value: filters.estado, onChange: (value) => setFilters({ ...filters, estado: value }), options: estados.map((x) => ({ value: x.id, label: x.nombre }))},
						{name: "desde", label: "Desde", type: "date", value: filters.desde, onChange: (value) => setFilters({ ...filters, desde: value })},
						{name: "hasta", label: "Hasta", type: "date", value: filters.hasta, onChange: (value) => setFilters({ ...filters, hasta: value })},
						{name: "invitados", label: "Invitados min.", type: "number", min: "0", value: filters.invitados, onChange: (value) => setFilters({ ...filters, invitados: value })},
					]}
					onClear={() => { setSearch(""); setFilters({ zona: "", estado: "", desde: "", hasta: "", invitados: "" }); }}
				/>

				<div className="table-wrap">
					<table className="module-table">
						<thead>
							<tr>
								<th>Zona</th>
								<th>Apartamento</th>
								<th>Fecha</th>
								<th>Horario</th>
								<th>Invitados</th>
								<th>Estado</th>
								<th>Acciones</th>
							</tr>
						</thead>
						<tbody>
							{filtered.length ? (
								filtered.map((x) => (
									<tr key={x.id}>
										<td>{x.zona?.nombre}</td>
										<td>
											{x.apartamento?.torre?.nombreTorre} - {x.apartamento?.numeroApartamento}
										</td>
										<td>{x.fechaReserva}</td>
										<td>
											{x.horaInicio?.slice(0, 5)} - {x.horaFin?.slice(0, 5)}
										</td>
										<td>{x.cantidadInvitados}</td>
										<td>
											<span
												className={`badge ${
													x.estadoReserva?.nombre === "Aprobada"
														? "badge-success"
														: x.estadoReserva?.nombre === "Cancelada"
															? "badge-danger"
															: "badge-warning"
												}`}
											>
												{x.estadoReserva?.nombre}
											</span>
										</td>
										<td className="actions-cell">
											{x.estadoReserva?.nombre !== "Cancelada" && (
												<button
													className="small-btn"
													onClick={() => cancel(x.id)}
												>
													Cancelar
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
										No hay reservas.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{open && (
				<Modal
					title={editId ? "Editar reserva" : "Nueva reserva"}
					onClose={() => setOpen(false)}
				>
					<form onSubmit={submit}>
						{error && <div className="form-error">{error}</div>}
						<div className="form-grid">
							<div className="form-group">
								<label>Zona común</label>
								<select
									required
									value={form.zonaId}
									onChange={(e) => setForm({ ...form, zonaId: e.target.value })}
								>
									<option value="">Seleccione...</option>
									{zonas.map((x) => (
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
								<label>Fecha</label>
								<input
									required
									type="date"
									min={new Date().toISOString().slice(0, 10)}
									value={form.fechaReserva}
									onChange={(e) =>
										setForm({ ...form, fechaReserva: e.target.value })
									}
								/>
							</div>

							<div className="form-group">
								<label>Invitados</label>
								<input
									type="number"
									min="0"
									value={form.cantidadInvitados}
									onChange={(e) => setForm({ ...form, cantidadInvitados: onlyNumbers(e.target.value) })}
								/>
							</div>

							<div className="form-group">
								<label>Hora inicio</label>
								<input
									required
									type="time"
									value={form.horaInicio}
									onChange={(e) =>
										setForm({ ...form, horaInicio: e.target.value })
									}
								/>
							</div>

							<div className="form-group">
								<label>Hora fin</label>
								<input
									required
									type="time"
									value={form.horaFin}
									onChange={(e) =>
										setForm({ ...form, horaFin: e.target.value })
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
									{estados.map((x) => (
										<option key={x.id} value={x.id}>
											{x.nombre}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="form-footer">
							<button className="primary-btn">Guardar reserva</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
}
