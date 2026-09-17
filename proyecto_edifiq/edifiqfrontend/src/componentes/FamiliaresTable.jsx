import { useState } from "react";
import { actualizarPersona, eliminarFamiliar } from "../api";
import Modal from "./Modal";
import MultiCriteriaBar from "./MultiCriteriaBar";

export default function FamiliaresTable({
	idApartamento,
	familiares,
	tiposDocumento,
	onChanged,
}) {
	const [editando, setEditando] = useState(null);
	const [form, setForm] = useState(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [search, setSearch] = useState("");

	const abrirEdicion = (fam) => {
		setError("");
		setEditando(fam);
		setForm({
			tipoDocumentoId: fam.persona.tipoDocumento?.id || "",
			numeroDocumento: fam.persona.numeroDocumento || "",
			nombres: fam.persona.nombres || "",
			apellidos: fam.persona.apellidos || "",
			telefono: fam.persona.telefono || "",
			correo: fam.persona.correo || "",
		});
	};

	const guardarEdicion = async (e) => {
		e.preventDefault();
		setError("");
		setSaving(true);
		try {
			await actualizarPersona(editando.persona.id, {
				tipoDocumento: { id: Number(form.tipoDocumentoId) },
				numeroDocumento: form.numeroDocumento.trim(),
				nombres: form.nombres.trim(),
				apellidos: form.apellidos.trim(),
				telefono: form.telefono.trim() || null,
				correo: form.correo.trim() || null,
				activo: true,
			});
			setEditando(null);
			await onChanged();
		} catch (e) {
			setError(e.message);
		} finally {
			setSaving(false);
		}
	};

	const eliminar = async (fam) => {
		if (
			!confirm(
				`¿Quitar a ${fam.persona.nombres} ${fam.persona.apellidos} de este apartamento?`
			)
		)
			return;
		setError("");
		try {
			await eliminarFamiliar(idApartamento, fam.persona.id);
			await onChanged();
		} catch (e) {
			setError(e.message);
		}
	};

	const filtrados = familiares.filter((familiar) => `${familiar.persona.numeroDocumento} ${familiar.persona.nombres} ${familiar.persona.apellidos} ${familiar.persona.telefono || ""} ${familiar.persona.correo || ""}`.toLowerCase().includes(search.toLowerCase()));

	return (
		<>
			{error && !editando && <div className="form-error">{error}</div>}
			<MultiCriteriaBar search={search} onSearch={setSearch} searchPlaceholder="Nombre, documento, teléfono o correo..." onClear={() => setSearch("")} />
			<table className="module-table">
				<thead>
					<tr>
						<th>Documento</th>
						<th>Nombres</th>
						<th>Apellidos</th>
						<th>Teléfono</th>
						<th>Correo</th>
						<th>Ingreso</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{filtrados.length ? (
						filtrados.map((f) => (
							<tr key={f.persona.id}>
								<td>{f.persona.numeroDocumento}</td>
								<td>{f.persona.nombres}</td>
								<td>{f.persona.apellidos}</td>
								<td>{f.persona.telefono || "—"}</td>
								<td>{f.persona.correo || "—"}</td>
								<td>{f.fechaIngreso}</td>
								<td>
									<button className="small-btn" onClick={() => abrirEdicion(f)}>
										Editar
									</button>{" "}
									<button className="danger-btn" onClick={() => eliminar(f)}>
										Eliminar
									</button>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan="7" className="empty-row">
								Aún no has registrado familiares en tu apartamento.
							</td>
						</tr>
					)}
				</tbody>
			</table>

			{editando && (
				<Modal title="Editar familiar" onClose={() => setEditando(null)}>
					<form onSubmit={guardarEdicion}>
						<div className="form-grid">
							<div className="form-group">
								<label>Tipo de documento</label>
								<select
									required
									value={form.tipoDocumentoId}
									onChange={(e) =>
										setForm({ ...form, tipoDocumentoId: e.target.value })
									}
								>
									<option value="">Seleccione...</option>
									{tiposDocumento.map((d) => (
										<option key={d.id} value={d.id}>
											{d.nombre}
										</option>
									))}
								</select>
							</div>
							<div className="form-group">
								<label>Número de documento</label>
								<input
									required
									maxLength="20"
									value={form.numeroDocumento}
									onChange={(e) =>
										setForm({ ...form, numeroDocumento: e.target.value })
									}
								/>
							</div>
							<div className="form-group">
								<label>Nombres</label>
								<input
									required
									maxLength="100"
									value={form.nombres}
									onChange={(e) => setForm({ ...form, nombres: e.target.value })}
								/>
							</div>
							<div className="form-group">
								<label>Apellidos</label>
								<input
									required
									maxLength="100"
									value={form.apellidos}
									onChange={(e) =>
										setForm({ ...form, apellidos: e.target.value })
									}
								/>
							</div>
							<div className="form-group">
								<label>Teléfono</label>
								<input
									maxLength="20"
									value={form.telefono}
									onChange={(e) =>
										setForm({ ...form, telefono: e.target.value })
									}
								/>
							</div>
							<div className="form-group">
								<label>Correo</label>
								<input
									type="email"
									maxLength="100"
									value={form.correo}
									onChange={(e) => setForm({ ...form, correo: e.target.value })}
								/>
							</div>
						</div>
						{error && <div className="form-error">{error}</div>}
						<div className="form-footer">
							<button className="primary-btn" disabled={saving}>
								{saving ? "Guardando..." : "Guardar cambios"}
							</button>
						</div>
					</form>
				</Modal>
			)}
		</>
	);
}