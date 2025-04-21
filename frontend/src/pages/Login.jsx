import { useState } from "react";
import "../styles/Login.css";

const activeSessions = {};

export default function Login() {
  const [users, setUsers] = useState({
    email: "",
    password: "",
    login: false,
  });

  const [error, setError] = useState({});

  const validate = () => {
    let error = {};

    if (!/\S+@\S+\.\S+/.test(users.email)) {
      error.email = "Correo electronico invalido";
    }

    return error;
  };

  const handleChange = (e) => {
    setUsers({
      ...users,
      [e.target.name]: e.target.value,
    });
    setError({
      ...error,
      [e.target.name]: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validateError = validate();
    if (Object.keys(validateError).length === 0) {
      if (activeSessions[users.email] === true) {
        setError({ email: "La cuenta ya está activa en otro lugar" });
      } else {
        setUsers({
          ...users,
          login: true,
        });
        activeSessions[users.email] = true;
        setUsers({
          email: "",
          password: "",
        });
      }
    } else {
      setError(validateError);
    }
  };

  const handleLogout = () => {
    if (users.email) {
      activeSessions[users.email] = false;
      setUsers({
        ...users,
        login: false,
      });
    }
  };

  return (
    <div className="contenedor-login">
      <div className="formulario">
        <form onSubmit={handleSubmit}>
          <h2>Inicio sesión</h2>

          <div className="input-contenedor">
            <i className="fa-solid fa-envelope custom-carta"></i>
            <input
              type="text"
              name="email"
              value={users.email}
              onChange={handleChange}
              required
            />
            <label htmlFor="#">Correo electronico: </label>
          </div>
          {error.email && <p className="error">{error.email}</p>}

          <div className="input-contenedor">
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              name="password"
              value={users.password}
              onChange={handleChange}
              required
            />
            <label htmlFor="#">Contraseña: </label>
          </div>
          {error.email && <p className="error">{error.email}</p>}

          <div className="olvidar">
            <label htmlFor="#">
              <input type="checkbox" /> Recordarme
            </label>
            <label htmlFor="#">
              <a to="/recuperar"> Olvidaste tu contraseña?</a>
            </label>
          </div>

          <div>
            <button className="btn" type="submit">
              Acceder
            </button>
          </div>

          {users.login && (
            <div>
              <p>Sesión activa</p>
              <button onClick={handleLogout} className="btn">
                Cerrar sesión
              </button>
            </div>
          )}

          <div className="cuenta">
            <p>
              No tengo cuenta <a to="/registrarse">Crear una cuenta</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
