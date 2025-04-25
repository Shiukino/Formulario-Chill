import { useState } from "react";
import axios from "axios";
import "../styles/ListadoEntregas.css";

export default function ListadoEntregas() {
  const [username, setUsername] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const backendURL = import.meta.env.VITE_API_URL;

  const handleInputChange = (e) => {
    setUsername(e.target.value);
  };

  const buscarUsuario = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/usuarios/${username}`);
      setItems(res.data);
      setError("");
    } catch (err) {
      setItems([]);
      setError("Usuario no encontrado");
    }
  };

  const marcarEntregado = async (item) => {
    try {
      await axios.patch(`${backendURL}/api/usuarios`, {
        username,
        item,
      });
      buscarUsuario();
    } catch (err) {
      console.error("Error al marcar entregado", err);
    }
  };

  return (
    <div className="lista-entregas">
      <h2>Buscar Usuario</h2>
      <input
        type="text"
        placeholder="Nombre de usuario"
        value={username}
        onChange={handleInputChange}
      />
      <button onClick={buscarUsuario}>Buscar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {items.length > 0 && (
        <div>
          <h3>Ítems de {username}</h3>
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                <strong>{item.slot}:</strong> {item.item}{" "}
                {item.entregado ? (
                  <span style={{ color: "green" }}>✓ Entregado</span>
                ) : (
                  <button onClick={() => marcarEntregado(item.item)}>
                    Marcar como entregado
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
