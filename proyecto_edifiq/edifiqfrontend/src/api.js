const ROOT_URL = import.meta.env.VITE_API_URL || "";
const BASE_URL = `${ROOT_URL}/api`;

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifica que el backend esté activo, que VITE_API_URL sea correcto y que CORS permita este frontend.",
        { cause: error },
      );
    }
    throw error;
  }

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    let message = data || "No se pudo completar la operación";
    if (typeof data === "object") {
      message = data?.error || Object.values(data || {})[0] || message;
    }
    const requestError = new Error(message);
    requestError.status = response.status;
    throw requestError;
  }
  return data;
}

const crud = (name) => {
  const url = `${BASE_URL}/${name}`;
  return {
    list: () => request(url),
    get: (id) => request(`${url}/${id}`),
    create: (data) => request(url, { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`${url}/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id) => request(`${url}/${id}`, { method: "DELETE" }),
  };
};

export const personasApi = crud("personas");
export const apartamentosApi = crud("apartamentos");
export const paquetesApi = crud("paquetes");
export const recibosApi = crud("recibos");
export const reservasApi = crud("reservas");
export const visitasApi = crud("visitas");
export const torresApi = crud("torres");
export const zonasApi = crud("zonas");
export const asignacionesApi = crud("apartamentos-personas");

export const getPersonas = () => personasApi.list();
export const getTiposDocumento = () => request(`${BASE_URL}/tipos-documento`);
export const getTiposResidente = () => request(`${BASE_URL}/tipos-residente`);
export const getTiposVisita = () => request(`${BASE_URL}/tipos-visita`);
export const getEstadosVisita = () => request(`${BASE_URL}/estados-visita`);
export const getEstadosPaquete = () => request(`${BASE_URL}/estados-paquete`);
export const getTiposServicio = () => request(`${BASE_URL}/tipos-servicio`);
export const getEstadosRecibo = () => request(`${BASE_URL}/estados-recibo`);
export const getEstadosReserva = () => request(`${BASE_URL}/estados-reserva`);
export const getRoles = () => request(`${BASE_URL}/roles`);

export const getPersonaPorDocumento = (numeroDocumento) =>
  request(`${BASE_URL}/personas/documento/${encodeURIComponent(numeroDocumento)}`);

export const crearPersona = (p) => personasApi.create(p);
export const actualizarPersona = (id, p) => personasApi.update(id, p);
export const eliminarPersona = (id) => personasApi.remove(id);

export const registrarUsuario = (u) =>
  request(`${BASE_URL}/usuarios`, { method: "POST", body: JSON.stringify(u) });

// Autoservicio: el propio usuario actualiza su username/contraseña (nunca el rol)
export const actualizarPerfilUsuario = (id, dto) =>
  request(`${BASE_URL}/usuarios/${id}/perfil`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });

export const registrarUsuarioResidente = (datos) =>
  request(`${BASE_URL}/usuarios/registro-residente`, { method: "POST", body: JSON.stringify(datos) });

export const loginUsuario = (credenciales) =>
  request(`${BASE_URL}/usuarios/login`, { method: "POST", body: JSON.stringify(credenciales) });

export const generarPasswordTemporal = (id) =>
  request(`${BASE_URL}/usuarios/${id}/password-temporal`, { method: "POST" });

export const cambiarEstadoUsuario = (id, activo) =>
  request(`${BASE_URL}/usuarios/${id}/estado`, {
    method: "PUT",
    body: JSON.stringify({ activo }),
  });

export const entregarPaquete = (id) =>
  request(`${BASE_URL}/paquetes/${id}/entregar`, { method: "PATCH" });

// Recibos pendientes de que el admin revise el comprobante subido por el residente
export const recibosPendientesRevision = () =>
  request(`${BASE_URL}/recibos/pendientes-revision`);

// El residente sube la foto del comprobante de pago (multipart, sin JSON)
export const subirComprobanteRecibo = async (id, archivo) => {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const response = await fetch(`${BASE_URL}/recibos/${id}/comprobante`, {
    method: "POST",
    body: formData,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      typeof data === "object"
        ? data?.error || Object.values(data || {})[0] || "No se pudo subir el comprobante"
        : data || "No se pudo subir el comprobante";
    throw new Error(message);
  }
  return data;
};

// Solo admin: aprueba el comprobante -> el recibo queda "Pagado"
export const verificarRecibo = (id) =>
  request(`${BASE_URL}/recibos/${id}/verificar`, { method: "PATCH" });

// Solo admin: rechaza el comprobante -> el recibo vuelve a "Pendiente"
export const rechazarRecibo = (id) =>
  request(`${BASE_URL}/recibos/${id}/rechazar`, { method: "PATCH" });

// Construye la url pública de la imagen del comprobante guardado
export const comprobanteUrl = (rutaComprobante) =>
  `${ROOT_URL}/uploads/comprobantes/${rutaComprobante}`;

export const cancelarReserva = (id) =>
  request(`${BASE_URL}/reservas/${id}/cancelar`, { method: "PATCH" });

export const finalizarVisita = (id) =>
  request(`${BASE_URL}/visitas/${id}/finalizar`, { method: "PATCH" });

export const getApartamentoDePersona = async (idPersona) => {
  const data = await request(`${BASE_URL}/apartamentos-personas/persona/${idPersona}`);
  return data.find((a) => !a.fechaSalida) || data[0] || null;
};

export const getPersonasDeApartamento = (idApartamento) =>
  request(`${BASE_URL}/apartamentos-personas/apartamento/${idApartamento}`);

export const eliminarFamiliar = (idApartamento, idPersona) =>
  request(`${BASE_URL}/apartamentos-personas/${idApartamento}/${idPersona}`, {
    method: "DELETE",
  });

export const registrarFamiliar = async ({ persona, idApartamento, idTipoResidente }) => {
  let personaCreada;
  try {
    personaCreada = await crearPersona(persona);
  } catch (e) {
    // Si el documento ya existe, reutilizamos la persona existente en vez de fallar
    if (String(e.message).toLowerCase().includes("ya está registrado")) {
      personaCreada = await getPersonaPorDocumento(persona.numeroDocumento);
    } else {
      throw e;
    }
  }

  return asignacionesApi.create({
    apartamento: { id: idApartamento },
    persona: { id: personaCreada.id },
    tipoResidente: { id: idTipoResidente },
    fechaIngreso: new Date().toISOString().slice(0, 10),
  });
};