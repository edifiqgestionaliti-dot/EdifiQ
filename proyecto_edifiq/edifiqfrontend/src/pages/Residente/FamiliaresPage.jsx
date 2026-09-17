import { useEffect, useState } from "react";
import {
	getApartamentoDePersona,
	getPersonasDeApartamento,
	getTiposDocumento,
	getTiposResidente,
	registrarFamiliar,
} from "../../api";
import Modal from "../../componentes/Modal";
import FamiliaresTable from "../../componentes/FamiliaresTable";
import {
	isValidDocumentNumber,
	isValidEmail,
	isValidName,
	isValidPhone,
	normalizeText,
} from "../../utils/validation";
import "../../styles/modules.css";

const FORM_INICIAL = {
	tipoDocumentoId: "",
	numeroDocumento: "",
	nombres: "",
	apellidos: "",
	telefono: "",
	correo: "",
};

export default function FamiliaresPage() {
	const [apt, setApt] = useState(null);
	const [familiares, setFamiliares] = useState([]);
	const [documentos, setDocumentos] = useState([]);
	const [tipoFamiliarId, setTipoFamiliarId] = useState(null);
	const [loading, setLoading] = useState(true);
	const [open, setOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [form, setForm] = useState(FORM_INICIAL);

	const user = JSON.parse(localStorage.getItem("authUser") || "null");

	const cargarFamiliares = async (idApartamento) => {
		const personas = await getPersonasDeApartamento(idApartamento);
		setFamiliares(
			personas.filter((p) =>
				p.tipoResidente?.nombre?.toLowerCase().includes("familiar")
			)
		);
	};

	useEffect(() => {
		const cargarDatos = async () => {
			const idPersona = user?.persona?.id;
			if (!idPersona) {
				setError("No se encontró la persona asociada a la sesión.");
				setLoading(false);
				return;
			}

			try {
				const [apartamentoPersona, tiposDoc, tiposResidente] = await Promise.all([
					getApartamentoDePersona(idPersona),
					getTiposDocumento(),
					getTiposResidente(),
				]);
				setApt(apartamentoPersona);
				setDocumentos(tiposDoc);

				const familiar = tiposResidente.find((t) =>
					t.nombre?.toLowerCase().includes("familiar")
				);
				setTipoFamiliarId(familiar?.id || null);

				if (apartamentoPersona) {
					await cargarFamiliares(apartamentoPersona.apartamento.id);
				}
			} catch (e) {
				setError(e.message);
			} finally {
				setLoading(false);
			}
		};

		cargarDatos();
	}, [user?.persona?.id]);

	const abrirModal = () => {
		setError("");
		setForm(FORM_INICIAL);
		setOpen(true);
	};

	const guardar = async (e) => {
		e.preventDefault();
		setError("");

		if (!tipoFamiliarId) {
			setError(
				"No existe el tipo de residente 'Familiar' en el catálogo. Pide al administrador que lo cree."
			);
			return;
		}

		const tipoDocumentoId = Number(form.tipoDocumentoId);
		const numeroDocumento = normalizeText(form.numeroDocumento);
		const nombres = normalizeText(form.nombres);
		const apellidos = normalizeText(form.apellidos);
		const telefono = normalizeText(form.telefono);
		const correo = normalizeText(form.correo);

		if (!tipoDocumentoId || !isValidDocumentNumber(numeroDocumento)) {
			setError("El documento es obligatorio y debe tener entre 6 y 20 dígitos.");
			return;
		}
		if (!isValidName(nombres) || !isValidName(apellidos)) {
			setError("Nombres y apellidos deben contener solo letras y no pueden estar vacíos.");
			return;
		}
		if (!isValidPhone(telefono)) {
			setError("El teléfono debe contener solo números y tener entre 7 y 20 dígitos.");
			return;
		}
		if (correo && !isValidEmail(correo)) {
			setError("El correo electrónico no tiene un formato válido.");
			return;
		}

		setSaving(true);
		try {
			await registrarFamiliar({
				persona: {
					tipoDocumento: { id: tipoDocumentoId },
					numeroDocumento,
					nombres,
					apellidos,
					telefono: telefono || null,
					correo: correo || null,
				},
				idApartamento: apt.apartamento.id,
				idTipoResidente: tipoFamiliarId,
			});

			await cargarFamiliares(apt.apartamento.id);
			setOpen(false);
		} catch (e) {
			setError(e.message);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="module-page">
				<div className="card-panel">Cargando información...</div>
			</div>
		);
	}

	if (!apt) {
		return (
			<div className="module-page">
				<div className="card-panel">
					<h2>Mis familiares</h2>
					<p>{error || "Tu usuario aún no tiene un apartamento asignado."}</p>
				</div>
			</div>
		);
	}

	const a = apt.apartamento;

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Mis familiares</h1>
					<p className="module-subtitle">
						Registra a las personas que viven contigo en tu apartamento.
					</p>
				</div>
				<div className="module-actions">
					<button className="primary-btn" onClick={abrirModal}>
						+ Registrar familiar
					</button>
					<span className="badge badge-info">
						{a.torre?.nombreTorre} · {a.numeroApartamento}
					</span>
				</div>
			</div>

			<div className="card-panel">
				{error && !open && <div className="form-error">{error}</div>}
				<FamiliaresTable
					idApartamento={a.id}
					familiares={familiares}
					tiposDocumento={documentos}
					onChanged={() => cargarFamiliares(a.id)}
				/>
			</div>

			{open && (
				<Modal title="Registrar familiar" onClose={() => setOpen(false)}>
					<form onSubmit={guardar}>
						<div className="form-grid">
							<div className="form-group">
								<label htmlFor="familiar-tipo-documento">Tipo de documento</label>
								<select
									id="familiar-tipo-documento"
									required
									value={form.tipoDocumentoId}
									onChange={(e) =>
										setForm({ ...form, tipoDocumentoId: e.target.value })
									}
								>
									<option value="">Seleccione...</option>
									{documentos.map((d) => (
										<option key={d.id} value={d.id}>
											{d.nombre}
										</option>
									))}
								</select>
							</div>
							<div className="form-group">
								<label htmlFor="familiar-numero-documento">Número de documento</label>
								<input
									id="familiar-numero-documento"
									required
									maxLength="20"
									value={form.numeroDocumento}
									onChange={(e) =>
										setForm({ ...form, numeroDocumento: e.target.value })
									}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="familiar-nombres">Nombres</label>
								<input
									id="familiar-nombres"
									required
									maxLength="100"
									value={form.nombres}
									onChange={(e) =>
										setForm({ ...form, nombres: e.target.value })
									}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="familiar-apellidos">Apellidos</label>
								<input
									id="familiar-apellidos"
									required
									maxLength="100"
									value={form.apellidos}
									onChange={(e) =>
										setForm({ ...form, apellidos: e.target.value })
									}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="familiar-telefono">Teléfono</label>
								<input
									id="familiar-telefono"
									maxLength="20"
									value={form.telefono}
									onChange={(e) =>
										setForm({ ...form, telefono: e.target.value })
									}
								/>
							</div>
							<div className="form-group">
								<label htmlFor="familiar-correo">Correo</label>
								<input
									id="familiar-correo"
									type="email"
									maxLength="100"
									value={form.correo}
									onChange={(e) =>
										setForm({ ...form, correo: e.target.value })
									}
								/>
							</div>
						</div>
						{error && <div className="form-error">{error}</div>}
						<div className="form-footer">
							<button type="submit" className="primary-btn" disabled={saving}>
								{saving ? "Guardando..." : "Guardar"}
							</button>
						</div>
					</form>
				</Modal>
			)}
		</div>
	);
}