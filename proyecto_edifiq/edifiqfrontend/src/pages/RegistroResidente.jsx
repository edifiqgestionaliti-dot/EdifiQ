import "../Registro.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import {
  crearPersona,
  getPersonaPorDocumento,
  registrarUsuarioResidente,
  getTiposDocumento
} from "../api";

export default function RegistroResidente() {
  const [step, setStep] = useState(1);
  const [idPersona, setIdPersona] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tiposDocumento, setTiposDocumento] = useState([]);

  const [persona, setPersona] = useState({
    idTipoDocumento: "",
    numeroDocumento: "",
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: ""
  });

  const [credenciales, setCredenciales] = useState({
    username: "",
    password: "",
    confirmar: ""
  });

  useEffect(() => {
    getTiposDocumento()
      .then((data) => setTiposDocumento(data))
      .catch(() =>
        setError("No se pudieron cargar los tipos de documento")
      );
  }, []);

  const handlePersonaChange = (e) => {
    const { name, value } = e.target;
    let cleanValue = value;
    if (name === "nombres" || name === "apellidos") {
      cleanValue = onlyLetters(value);
    } else if (name === "numeroDocumento" || name === "telefono") {
      cleanValue = onlyNumbers(value);
    }
    setPersona({ ...persona, [name]: cleanValue });
  };

  const handlePasoUno = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    const idTipoDocumento = Number(persona.idTipoDocumento);
    const numeroDocumento = normalizeText(persona.numeroDocumento);
    const nombres = normalizeText(persona.nombres);
    const apellidos = normalizeText(persona.apellidos);
    const telefono = normalizeText(persona.telefono);
    const correo = normalizeText(persona.correo);

    if (!idTipoDocumento || !isValidDocumentNumber(numeroDocumento)) {
      setError("El número de documento es obligatorio y debe tener entre 6 y 20 dígitos.");
      return;
    }
    if (!isValidName(nombres) || !isValidName(apellidos)) {
      setError("Nombres y apellidos son obligatorios y solo pueden contener letras.");
      return;
    }
    if (!isValidPhone(telefono)) {
      setError("El teléfono debe tener entre 7 y 20 números.");
      return;
    }
    if (correo && !isValidEmail(correo)) {
      setError("El correo no tiene un formato válido.");
      return;
    }

    try {
      const personaExistente = await getPersonaPorDocumento(numeroDocumento);

      setIdPersona(personaExistente.id);
      setStep(2);
      return;
    } catch {
      // Si no existe, se crea
    }

    try {
      const nuevaPersona = await crearPersona({
        tipoDocumento: {
          id: idTipoDocumento
        },
        numeroDocumento,
        nombres,
        apellidos,
        telefono: telefono || null,
        correo: correo || null,
        activo: true
      });

      setIdPersona(nuevaPersona.id);
      setStep(2);
    } catch {
      setError("No se pudo registrar la persona. Verifica los datos.");
    }
  };

  const handlePasoDos = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    const username = normalizeText(credenciales.username);
    const password = normalizeText(credenciales.password);
    const confirmar = normalizeText(credenciales.confirmar);

    if (!username || username.length < 4) {
      setError("El usuario debe tener al menos 4 caracteres.");
      return;
    }
    if (!isValidPassword(password, 6)) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await registrarUsuarioResidente({
        idPersona,
        username,
        password
      });

      setMensaje("Registro completado. Ya puedes iniciar sesión.");
    } catch (err) {
      setError(
        err.message || "No se pudo registrar el usuario"
      );
    }
  };

  return (
    <div className="wizard-page">

      {/* LEFT — panel de marca */}
      <div className="wizard-brand-panel">

        <Link to="/" className="wizard-brand-logo">
          Edifi<span>Q</span>
        </Link>

        <div className="wizard-brand-copy">
          <h2>Crea tu cuenta de residente en un par de pasos.</h2>
          <p>
            Primero confirmamos tus datos personales y luego
            creas tus credenciales de acceso.
          </p>
        </div>

        <div className="wizard-brand-steps">
          <div className={`wizard-brand-step ${step === 1 ? "is-active" : ""}`}>
            <span>1</span> Datos personales
          </div>
          <div className={`wizard-brand-step ${step === 2 ? "is-active" : ""}`}>
            <span>2</span> Crear cuenta
          </div>
        </div>

      </div>

      {/* RIGHT — formulario */}
      <div className="wizard-page-right">

        <Link to="/login" className="wizard-back">
          ← Volver al inicio de sesión
        </Link>

        {error && <p className="wizard-error" role="alert">{error}</p>}
        {mensaje && <output className="wizard-success">{mensaje}</output>}

        {step === 1 && (
          <form onSubmit={handlePasoUno} className="wizard-form" data-step={step}>
            <h3>Paso 1: Datos personales</h3>

            <label htmlFor="registro-tipo-documento">Tipo de documento</label>
            <select
              id="registro-tipo-documento"
              name="idTipoDocumento"
              value={persona.idTipoDocumento}
              onChange={handlePersonaChange}
              required
            >
              <option value="">
                Seleccione tipo de documento
              </option>

              {tiposDocumento.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
            
                <label htmlFor="registro-numero-documento">Número de documento</label>
            <input
                  id="registro-numero-documento"
              name="numeroDocumento"
              inputMode="numeric"
              pattern="[0-9]+"
              value={persona.numeroDocumento}
              onChange={handlePersonaChange}
              required
            />

            <label htmlFor="registro-nombres">Nombres</label>
            <input
              id="registro-nombres"
              name="nombres"
              pattern="[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]+"
              value={persona.nombres}
              onChange={handlePersonaChange}
              required
            />

            <label htmlFor="registro-apellidos">Apellidos</label>
            <input
              id="registro-apellidos"
              name="apellidos"
              pattern="[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s'-]+"
              value={persona.apellidos}
              onChange={handlePersonaChange}
              required
            />

            <label htmlFor="registro-telefono">Teléfono</label>
            <input
              id="registro-telefono"
              name="telefono"
              inputMode="numeric"
              pattern="[0-9]+"
              value={persona.telefono}
              onChange={handlePersonaChange}
            />

            <label htmlFor="registro-correo">Correo electrónico</label>
            <input
              id="registro-correo"
              name="correo"
              type="email"
              value={persona.correo}
              onChange={handlePersonaChange}
              required
            />

            <button type="submit">
              Siguiente
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePasoDos} className="wizard-form" data-step={step}>
            <h3>Paso 2: Crear cuenta</h3>

            <label htmlFor="registro-usuario">Usuario</label>
            <input
              id="registro-usuario"
              name="username"
              autoComplete="username"
              placeholder="Usuario"
              value={credenciales.username}
              onChange={(e) =>
                setCredenciales({
                  ...credenciales,
                  username: e.target.value
                })
              }
              required
            />

            <label htmlFor="registro-password">Contraseña</label>
            <input
              id="registro-password"
              name="password"
              autoComplete="new-password"
              type="password"
              minLength={6}
              placeholder="Contraseña"
              value={credenciales.password}
              onChange={(e) =>
                setCredenciales({
                  ...credenciales,
                  password: e.target.value
                })
              }
              required
            />

            <label htmlFor="registro-confirmar-password">Confirmar contraseña</label>
            <input
              id="registro-confirmar-password"
              name="confirmar"
              autoComplete="new-password"
              type="password"
              minLength={6}
              placeholder="Confirmar contraseña"
              value={credenciales.confirmar}
              onChange={(e) =>
                setCredenciales({
                  ...credenciales,
                  confirmar: e.target.value
                })
              }
              required
            />

            <button type="submit">
              Registrarme
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
