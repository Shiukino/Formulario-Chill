import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../data/authContext";
import "../styles/Login.css";

const Login = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "adminpass") {
      login();
      navigate("/admin");
    }
    if (username === "chillparty" && password === "wonejos") {
      {
        login();
        navigate("/listado");
      }
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
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
            />
            <label htmlFor="#">Usuario: </label>
          </div>
          <div className="input-contenedor-login">
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              id="Password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="#">Contraseña: </label>
          </div>
          <button className="btn-login" type="submit">
            Acceder
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
