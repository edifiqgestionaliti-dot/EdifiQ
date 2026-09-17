import CatalogoPage from "./CatalogoPage";
import { zonasApi } from "../../api";

export default function ZonasPage() {
	return (
		<CatalogoPage
			title="Zonas comunes"
			subtitle="Administra espacios disponibles para reservas."
			api={zonasApi}
			fields={[
				{ name: "nombre", label: "Nombre", type: "letters", maxLength: 50 },
				{
					name: "descripcion",
					label: "Descripción",
					type: "textarea",
					maxLength: 200,
				},
			]}
		/>
	);
}
