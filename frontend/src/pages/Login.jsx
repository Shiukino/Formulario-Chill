import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../data/authContext";
import "../styles/Login.css";

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username.toLowerCase(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        login();
        if (data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/listado");
        }
      } else {
        alert(data.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert("Hubo un error al conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pagina-login">
      <div className="contenedor-login">
        <div className="formulario-login">
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            <div className="input-contenedor-login">
              <i className="fa-solid fa-user custom-carta"></i>
              <input
                type="text"
                id="username"
                placeholder=" "
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <label htmlFor="username">Usuario: </label>
            </div>

            <div className="input-contenedor-login">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                id="Password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="Password">Contraseña: </label>
            </div>

            <button className="btn-login" type="submit" disabled={isLoading}>
              {isLoading ? "Cargando..." : "Acceder"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
