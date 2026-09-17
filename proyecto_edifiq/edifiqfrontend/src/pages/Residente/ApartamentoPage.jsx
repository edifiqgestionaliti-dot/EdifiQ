import { useEffect, useState } from "react";
import { getApartamentoDePersona, getPersonasDeApartamento, getTiposDocumento } from "../../api";
import FamiliaresTable from "../../componentes/FamiliaresTable";
import "../../styles/modules.css";
export default function ApartamentoPage() {
	const [data, setData] = useState(null);
	const [familiares, setFamiliares] = useState([]);
	const [documentos, setDocumentos] = useState([]);
	const [error, setError] = useState("");
	const user = JSON.parse(localStorage.getItem("authUser") || "null");
	const idPersona = user?.persona?.id;

	const cargarFamiliares = async (idApartamento) => {
		const personas = await getPersonasDeApartamento(idApartamento);
		setFamiliares(
			personas.filter((p) =>
				p.tipoResidente?.nombre?.toLowerCase().includes("familiar")
			)
		);
	};

	useEffect(() => {
		Promise.all([getApartamentoDePersona(idPersona), getTiposDocumento()])
			.then(([apartamentoPersona, tiposDoc]) => {
				setData(apartamentoPersona);
				setDocumentos(tiposDoc);
				if (apartamentoPersona) {
					return cargarFamiliares(apartamentoPersona.apartamento.id);
				}
			})
			.catch((e) => setError(e.message));
	}, [idPersona]);

	if (error) {
		return (
			<div className="module-page">
				<div className="card-panel">
					<div className="form-error">{error}</div>
				</div>
			</div>
		);
	}

	if (!data) {
		return (
			<div className="module-page">
				<div className="card-panel">Cargando apartamento...</div>
			</div>
		);
	}

	const a = data.apartamento;
	const p = data.persona;

	return (
		<div className="module-page">
			<div className="module-header">
				<div>
					<h1 className="module-title">Mi apartamento</h1>
					<p className="module-subtitle">
						Información de tu unidad residencial.
					</p>
				</div>
			</div>

			<div className="card-panel">
				<div className="form-grid">
					<div>
						<strong>Torre</strong>
						<p>{a.torre?.nombreTorre}</p>
					</div>
					<div>
						<strong>Apartamento</strong>
						<p>{a.numeroApartamento}</p>
					</div>
					<div>
						<strong>Piso</strong>
						<p>{a.piso}</p>
					</div>
					<div>
						<strong>Estado</strong>
						<p>{a.activo ? "Activo" : "Inactivo"}</p>
					</div>
					<div>
						<strong>Residente</strong>
						<p>
							{p?.nombres} {p?.apellidos}
						</p>
					</div>
					<div>
						<strong>Tipo</strong>
						<p>{data.tipoResidente?.nombre}</p>
					</div>
					<div>
						<strong>Ingreso</strong>
						<p>{data.fechaIngreso}</p>
					</div>
				</div>
			</div>

			<div className="module-header" style={{ marginTop: "24px" }}>
				<div>
					<h2 className="module-title">Familiares en este apartamento</h2>
					<p className="module-subtitle">
						Consulta, edita o elimina a los familiares registrados.
					</p>
				</div>
			</div>
			<div className="card-panel">
				<FamiliaresTable
					idApartamento={a.id}
					familiares={familiares}
					tiposDocumento={documentos}
					onChanged={() => cargarFamiliares(a.id)}
				/>
			</div>
		</div>
	);
}