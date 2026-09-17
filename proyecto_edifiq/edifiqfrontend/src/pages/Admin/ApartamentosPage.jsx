import { useEffect, useState } from "react";
import Modal from "../../componentes/Modal";
import { apartamentosApi, torresApi } from "../../api";
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

	const filtered = items.filter((x) =>
		`${x.numeroApartamento} ${x.torre?.nombreTorre}`
			.toLowerCase()
			.includes(search.toLowerCase()),
	);

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
				<div className="toolbar">
					<strong>{items.length} apartamentos</strong>
					<input
						className="search-input"
						placeholder="Buscar apartamento o torre..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

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
									<tr key={x.id}>
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
										<td className="actions-cell">
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
