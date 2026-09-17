import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Login.css";
import { loginUsuario } from "../api";
import { isValidPassword, isValidUsername, normalizeText } from "../utils/validation";

function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const username = normalizeText(form.username);
    const password = normalizeText(form.password);

    if (!isValidUsername(username, 3) || !isValidPassword(password, 6)) {
      setError("Ingresa un usuario y una contraseña válidos.");
      return;
    }

    try {
      const usuario = await loginUsuario({ username, password });

      localStorage.setItem("authUser", JSON.stringify(usuario));

      const rol = usuario.rol?.nombre?.toLowerCase();

      if (rol === "residente") {
        navigate("/residente");
      } else if (rol === "administrador") {
        navigate("/admin");
      } else if (rol === "vigilante") {
        navigate("/vigilante");
      } else {
        setError("El usuario no tiene un rol válido");
      }

    } catch (requestError) {
      setError(requestError.status === 404
        ? "Usuario no encontrado"
        : "Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT — BRAND PANEL */}
      <div className="auth-brand-panel">

        <Link to="/" className="auth-brand-logo">
          Edifi<span>Q</span>
        </Link>

        <div className="auth-brand-copy">
          <h2>Toda la gestión de tu conjunto, en un solo lugar.</h2>
          <p>
            Residentes, visitas, paquetería, reservas y recibos,
            organizados y accesibles desde cualquier rol.
          </p>
        </div>
        <div className="auth-brand-stats">
        </div>

      </div>

      {/* RIGHT — FORM PANEL */}
      <div className="auth-page-right">

        <Link to="/" className="auth-back">
          ← Volver al inicio
        </Link>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Iniciar sesión</h2>

          <input
            name="username"
            autoComplete="username"
            placeholder="Usuario"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            name="password"
            autoComplete="current-password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit">Ingresar</button>

          <Link to="/registro">
            ¿No tienes una cuenta? Regístrate
          </Link>
        </form>

      </div>

    </div>
  );
}

export default LoginPage;
