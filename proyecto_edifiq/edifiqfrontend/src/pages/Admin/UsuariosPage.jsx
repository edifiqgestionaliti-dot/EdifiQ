import { useEffect, useState } from "react";
import {
	cambiarEstadoUsuario,
	generarPasswordTemporal,
	getPersonas,
	getRoles,
	registrarUsuario,
} from "../../api";
import Modal from "../../componentes/Modal";
import MultiCriteriaBar from "../../componentes/MultiCriteriaBar";
import "../../styles/modules.css";

const usuarioEstaActivo = (usuario) =>
	usuario.estadoUsuario?.nombre?.toLowerCase() === "activo";

const textoEstado = (usuario, guardando) => {
	if (guardando) return "Guardando...";
	return usuarioEstaActivo(usuario) ? "Desactivar" : "Activar";
};

export default function UsuariosPage() {
	const [personas, setPersonas] = useState([]);
	const [roles, setRoles] = useState([]);
	const [users, setUsers] = useState([]);
	const [form, setForm] = useState({
		username: "",
		password: "",
		personaId: "",
		rolId: "",
	});
	const [error, setError] = useState("");
	const [ok, setOk] = useState("");
	const [temporal, setTemporal] = useState(null);
	const [generandoId, setGenerandoId] = useState(null);
	const [cambiandoEstadoId, setCambiandoEstadoId] = useState(null);
	const [search, setSearch] = useState("");
	const [filtros, setFiltros] = useState({ rol: "", estado: "" });
	const [open, setOpen] = useState(false);

	const load = () =>
		fetch("http://localhost:8080/api/usuarios")
			.then((r) => r.json())
			.then(setUsers);

	useEffect(() => {
		getPersonas().then(setPersonas);
		getRoles().then(setRoles);
		load();
	}, []);

	const submit = async (e) => {
		e.preventDefault();
		setError("");
		setOk("");

		try {
			await registrarUsuario({
				username: form.username.trim(),
				password: form.password,
				persona: { id: Number(form.personaId) },
				rol: { id: Number(form.rolId) },
			});
			setOk("Usuario creado correctamente.");
			setForm({ username: "", password: "", personaId: "", rolId: "" });
			setOpen(false);
			load();
		} catch (e) {
			setError(e.message);
		}
	};

	const generarTemporal = async (usuario) => {
		setError("");
		setOk("");
		setTemporal(null);
		setGenerandoId(usuario.id);

		try {
			const resultado = await generarPasswordTemporal(usuario.id);
			setTemporal(resultado);
		} catch (e) {
			setError(e.message || "No se pudo generar la contraseña temporal.");
		} finally {
			setGenerandoId(null);
		}
	};

	const cambiarEstado = async (usuario) => {
		setError("");
		setOk("");
		setCambiandoEstadoId(usuario.id);

		try {
			const activo = usuario.estadoUsuario?.nombre?.toLowerCase() !== "activo";
			const resultado = await cambiarEstadoUsuario(usuario.id, activo);
			setUsers((actuales) => actuales.map((actual) => (
				actual.id === usuario.id
					? { ...actual, estadoUsuario: { ...actual.estadoUsuario, nombre: resultado.estado } }
					: actual
			)));
			setOk(`Usuario ${activo ? "activado" : "desactivado"} correctamente.`);
		} catch (e) {
			setError(e.message || "No se pudo cambiar el estado del usuario.");
		} finally {
			setCambiandoEstadoId(null);
		}
	};

	const usuariosFiltrados = users.filter((usuario) => {
		const texto = `${usuario.username} ${usuario.persona?.nombres} ${usuario.persona?.apellidos} ${usuario.persona?.numeroDocumento}`.toLowerCase();
		return texto.includes(search.toLowerCase())
			&& (!filtros.rol || String(usuario.rol?.id) === filtros.rol)
			&& (!filtros.estado || (filtros.estado === "activo" ? usuarioEstaActivo(usuario) : !usuarioEstaActivo(usuario)));
	});

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Usuarios</h1>
					<p className="module-subtitle">
						Crea cuentas para administradores, vigilantes y residentes.
					</p>
				</div>
				<button
					type="button"
					className="primary-btn"
					onClick={() => {
						setError("");
						setOk("");
						setForm({ username: "", password: "", personaId: "", rolId: "" });
						setOpen(true);
					}}
				>
					+ Crear usuario
				</button>
			</div>

			{ok && <div className="form-success">{ok}</div>}
			{error && !open && <div className="form-error">{error}</div>}

			{temporal && <Modal title="Contraseña temporal generada" onClose={() => setTemporal(null)}>
				<p>
					Entrega esta contraseña al usuario <strong>{temporal.username}</strong>.
				</p>
				<div className="temporary-password">{temporal.passwordTemporal}</div>
				<p className="module-subtitle">
					Válida durante 24 horas. Expira el {new Date(temporal.expiraEn).toLocaleString()}.
				</p>
				<div className="form-footer">
					<button type="button" className="primary-btn" onClick={() => navigator.clipboard?.writeText(temporal.passwordTemporal)}>
						Copiar contraseña
					</button>
				</div>
			</Modal>}

			{open && <Modal title="Crear usuario" onClose={() => setOpen(false)}>
				<form onSubmit={submit}>
					<div className="form-grid">
						<div className="form-group">
							<label htmlFor="usuario-persona">Persona</label>
							<select
								id="usuario-persona"
								required
								value={form.personaId}
								onChange={(e) => setForm({ ...form, personaId: e.target.value })}
							>
								<option value="">Seleccione...</option>
								{personas.map((p) => (
									<option key={p.id} value={p.id}>
										{p.nombres} {p.apellidos}
									</option>
								))}
							</select>
						</div>

						<div className="form-group">
							<label htmlFor="usuario-rol">Rol</label>
							<select
								id="usuario-rol"
								required
								value={form.rolId}
								onChange={(e) => setForm({ ...form, rolId: e.target.value })}
							>
								<option value="">Seleccione...</option>
								{roles.map((r) => (
									<option key={r.id} value={r.id}>
										{r.nombre}
									</option>
								))}
							</select>
						</div>

						<div className="form-group">
							<label htmlFor="usuario-username">Usuario</label>
							<input
								id="usuario-username"
								required
								minLength="4"
								maxLength="50"
								value={form.username}
								onChange={(e) => setForm({ ...form, username: e.target.value })}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="usuario-password">Contraseña</label>
							<input
								id="usuario-password"
								required
								minLength="6"
								type="password"
								value={form.password}
								onChange={(e) => setForm({ ...form, password: e.target.value })}
							/>
						</div>
					</div>

					{error && <div className="form-error">{error}</div>}
					<div className="form-footer">
						<button type="button" className="secondary-btn" onClick={() => setOpen(false)}>
							Cancelar
						</button>
						<button type="submit" className="primary-btn">Crear usuario</button>
					</div>
				</form>
			</Modal>}

			<div className="card-panel" style={{ marginTop: 20 }}>
				<div className="toolbar"><strong>{usuariosFiltrados.length} de {users.length} usuarios</strong></div>
				<MultiCriteriaBar
					search={search}
					onSearch={setSearch}
					searchPlaceholder="Usuario, nombre o documento..."
					filters={[
						{name: "rol", label: "Rol", type: "select", value: filtros.rol, onChange: (value) => setFiltros({ ...filtros, rol: value }), options: roles.map((x) => ({ value: x.id, label: x.nombre }))},
						{name: "estado", label: "Estado", type: "select", value: filtros.estado, onChange: (value) => setFiltros({ ...filtros, estado: value }), options: [{ value: "activo", label: "Activos" }, { value: "inactivo", label: "Inactivos" }]},
					]}
					onClear={() => { setSearch(""); setFiltros({ rol: "", estado: "" }); }}
				/>
				<div className="table-wrap">
					<table className="module-table">
						<thead>
							<tr>
								<th>Usuario</th>
								<th>Persona</th>
								<th>Rol</th>
								<th>Estado</th>
								<th>Acción</th>
							</tr>
						</thead>
						<tbody>
							{usuariosFiltrados.map((u) => (
								<tr key={u.id}>
									<td>{u.username}</td>
									<td>
										{u.persona?.nombres} {u.persona?.apellidos}
									</td>
									<td>{u.rol?.nombre}</td>
									<td>
										<span className={`badge ${usuarioEstaActivo(u) ? "badge-success" : "badge-danger"}`}>
											{u.estadoUsuario?.nombre}
										</span>
									</td>
									<td>
										<div className="module-actions">
											<button
												type="button"
													className={usuarioEstaActivo(u) ? "danger-btn" : "secondary-btn"}
												disabled={cambiandoEstadoId === u.id}
												onClick={() => cambiarEstado(u)}
											>
													{textoEstado(u, cambiandoEstadoId === u.id)}
											</button>
											<button
												type="button"
												className="secondary-btn"
												disabled={generandoId === u.id}
												onClick={() => generarTemporal(u)}
											>
													{generandoId === u.id ? "Generando..." : "Generar contraseña"}
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
