import { useEffect, useState } from "react";
import { getTiposDocumento, personasApi, actualizarPerfilUsuario } from "../api";
import {
	onlyLetters,
	onlyNumbers,
	isValidDocumentNumber,
	isValidEmail,
	isValidName,
	isValidPassword,
	isValidPhone,
	normalizeText,
} from "../utils/validation";
import "../styles/modules.css";

export default function PerfilPage() {
	const [user, setUser] = useState(() =>
		JSON.parse(localStorage.getItem("authUser") || "null"),
	);
	const [tiposDocumento, setTiposDocumento] = useState([]);

	const [datos, setDatos] = useState({
		tipoDocumentoId: "",
		numeroDocumento: "",
		nombres: "",
		apellidos: "",
		telefono: "",
		correo: "",
	});
	const [errorDatos, setErrorDatos] = useState("");
	const [okDatos, setOkDatos] = useState("");

	const [cuenta, setCuenta] = useState({
		username: "",
		passwordActual: "",
		passwordNueva: "",
		confirmarPassword: "",
	});
	const [errorCuenta, setErrorCuenta] = useState("");
	const [okCuenta, setOkCuenta] = useState("");

	useEffect(() => {
		getTiposDocumento().then(setTiposDocumento);
		const sincronizarUsuario = () => {
			if (user?.persona) {
				setDatos({
					tipoDocumentoId: user.persona.tipoDocumento?.id ?? "",
					numeroDocumento: user.persona.numeroDocumento ?? "",
					nombres: user.persona.nombres ?? "",
					apellidos: user.persona.apellidos ?? "",
					telefono: user.persona.telefono ?? "",
					correo: user.persona.correo ?? "",
				});
			}
			setCuenta((c) => ({ ...c, username: user?.username ?? "" }));
		};
		const timeoutId = setTimeout(sincronizarUsuario, 0);
		return () => clearTimeout(timeoutId);
	}, [user?.persona, user?.username]);

	if (!user) {
		return (
			<div className="module-page">
				<div className="card-panel">No se encontró la sesión.</div>
			</div>
		);
	}

	const guardarDatos = async (e) => {
		e.preventDefault();
		setErrorDatos("");
		setOkDatos("");

		const tipoDocumentoId = Number(datos.tipoDocumentoId);
		const numeroDocumento = normalizeText(datos.numeroDocumento);
		const nombres = normalizeText(datos.nombres);
		const apellidos = normalizeText(datos.apellidos);
		const telefono = normalizeText(datos.telefono);
		const correo = normalizeText(datos.correo);

		if (!tipoDocumentoId || !isValidDocumentNumber(numeroDocumento)) {
			setErrorDatos("Ingresa un número de documento válido.");
			return;
		}
		if (!isValidName(nombres) || !isValidName(apellidos)) {
			setErrorDatos("Nombres y apellidos son obligatorios y solo pueden contener letras.");
			return;
		}
		if (!isValidPhone(telefono)) {
			setErrorDatos("El teléfono debe tener entre 7 y 20 números.");
			return;
		}
		if (correo && !isValidEmail(correo)) {
			setErrorDatos("El correo electrónico no tiene un formato válido.");
			return;
		}

		try {
			const p = {
				tipoDocumento: { id: tipoDocumentoId },
				numeroDocumento,
				nombres,
				apellidos,
				telefono: telefono || null,
				correo: correo || null,
				activo: user.persona.activo,
			};
			const actualizada = await personasApi.update(user.persona.id, p);
			const nuevoUser = { ...user, persona: actualizada };
			localStorage.setItem("authUser", JSON.stringify(nuevoUser));
			setUser(nuevoUser);
			setOkDatos("Tus datos se actualizaron correctamente.");
		} catch (err) {
			setErrorDatos(err.message);
		}
	};

	const guardarCuenta = async (e) => {
		e.preventDefault();
		setErrorCuenta("");
		setOkCuenta("");

		const username = normalizeText(cuenta.username);
		const passwordActual = normalizeText(cuenta.passwordActual);
		const passwordNueva = normalizeText(cuenta.passwordNueva);
		const confirmarPassword = normalizeText(cuenta.confirmarPassword);

		if (!username || username.length < 4) {
			setErrorCuenta("El usuario debe tener al menos 4 caracteres.");
			return;
		}
		if (!passwordActual) {
			setErrorCuenta("Debes ingresar tu contraseña actual.");
			return;
		}
		if (passwordNueva && !isValidPassword(passwordNueva, 6)) {
			setErrorCuenta("La nueva contraseña debe tener al menos 6 caracteres.");
			return;
		}
		if (passwordNueva && passwordNueva !== confirmarPassword) {
			setErrorCuenta("Las contraseñas nuevas no coinciden.");
			return;
		}
		if (passwordNueva && !confirmarPassword) {
			setErrorCuenta("Debes confirmar la nueva contraseña.");
			return;
		}

		try {
			const actualizado = await actualizarPerfilUsuario(user.id, {
				username,
				passwordActual,
				passwordNueva: passwordNueva || null,
			});
			const nuevoUser = { ...user, username: actualizado.username };
			localStorage.setItem("authUser", JSON.stringify(nuevoUser));
			setUser(nuevoUser);
			setCuenta({
				username: actualizado.username,
				passwordActual: "",
				passwordNueva: "",
				confirmarPassword: "",
			});
			setOkCuenta("Tu usuario y/o contraseña se actualizaron correctamente.");
		} catch (err) {
			setErrorCuenta(err.message);
		}
	};

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Mi perfil</h1>
					<p className="module-subtitle">
						Actualiza tus datos personales, tu usuario y tu contraseña.
					</p>
				</div>
				<span className="badge badge-info">{user.rol?.nombre}</span>
			</div>

			<div className="card-panel">
				<h2>Datos personales</h2>
				{errorDatos && <div className="form-error">{errorDatos}</div>}
				{okDatos && <div className="form-success">{okDatos}</div>}
				<form onSubmit={guardarDatos}>
					<div className="form-grid">
						<div className="form-group">
							<label htmlFor="perfil-tipo-documento">Tipo de documento</label>
							<select
								id="perfil-tipo-documento"
								required
								value={datos.tipoDocumentoId}
								onChange={(e) =>
									setDatos({ ...datos, tipoDocumentoId: e.target.value })
								}
							>
								<option value="">Seleccione...</option>
								{tiposDocumento.map((t) => (
									<option key={t.id} value={t.id}>
										{t.nombre}
									</option>
								))}
							</select>
						</div>

						<div className="form-group">
							<label htmlFor="perfil-numero-documento">Número de documento</label>
							<input
								id="perfil-numero-documento"
								required
								maxLength="20"
								inputMode="numeric"
								value={datos.numeroDocumento}
								onChange={(e) =>
									setDatos({ ...datos, numeroDocumento: onlyNumbers(e.target.value) })
								}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="perfil-nombres">Nombres</label>
							<input
								id="perfil-nombres"
								required
								maxLength="100"
								value={datos.nombres}
								onChange={(e) => setDatos({ ...datos, nombres: onlyLetters(e.target.value) })}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="perfil-apellidos">Apellidos</label>
							<input
								id="perfil-apellidos"
								required
								maxLength="100"
								value={datos.apellidos}
								onChange={(e) =>
									setDatos({ ...datos, apellidos: onlyLetters(e.target.value) })
								}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="perfil-telefono">Teléfono</label>
							<input
								id="perfil-telefono"
								maxLength="20"
								inputMode="numeric"
								value={datos.telefono}
								onChange={(e) => setDatos({ ...datos, telefono: onlyNumbers(e.target.value) })}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="perfil-correo">Correo</label>
							<input
								id="perfil-correo"
								type="email"
								maxLength="100"
								value={datos.correo}
								onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
							/>
						</div>
					</div>

					<div className="form-footer">
						<button type="submit" className="primary-btn">Guardar datos</button>
					</div>
				</form>
			</div>

			<div className="card-panel">
				<h2>Usuario y contraseña</h2>
				{errorCuenta && <div className="form-error">{errorCuenta}</div>}
				{okCuenta && <div className="form-success">{okCuenta}</div>}
				<form onSubmit={guardarCuenta}>
					<div className="form-grid">
						<div className="form-group">
							<label htmlFor="perfil-usuario">Usuario</label>
							<input
								id="perfil-usuario"
								required
								minLength="4"
								maxLength="50"
								value={cuenta.username}
								onChange={(e) => setCuenta({ ...cuenta, username: e.target.value })}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="perfil-password-actual">Contraseña actual</label>
							<input
								id="perfil-password-actual"
								required
								type="password"
								value={cuenta.passwordActual}
								onChange={(e) => setCuenta({ ...cuenta, passwordActual: e.target.value })}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="perfil-password-nueva">Nueva contraseña (opcional)</label>
							<input
								id="perfil-password-nueva"
								type="password"
								minLength="6"
								value={cuenta.passwordNueva}
								onChange={(e) => setCuenta({ ...cuenta, passwordNueva: e.target.value })}
							/>
						</div>

						<div className="form-group">
							<label htmlFor="perfil-password-confirmar">Confirmar nueva contraseña</label>
							<input
								id="perfil-password-confirmar"
								type="password"
								minLength="6"
								value={cuenta.confirmarPassword}
								onChange={(e) =>
									setCuenta({ ...cuenta, confirmarPassword: e.target.value })
								}
							/>
						</div>
					</div>

					<p className="module-subtitle">
						Deja los campos de nueva contraseña vacíos si solo quieres cambiar el usuario.
						Siempre debes confirmar tu contraseña actual.
					</p>

					<div className="form-footer">
						<button type="submit" className="primary-btn">Guardar cambios</button>
					</div>
				</form>
			</div>
		</div>
	);
}
