import { useState, useRef, useEffect } from "react";
import axios from "axios";
import itemsGuild from "../data/itemsGuild";
import "../styles/Listado.css";

const bossNames = {
  Daigon: "Daigon",
  Leviathan: "Leviathan",
  PakiloNaru: "Pakilo Naru",
  ManticusBrothers: "Manticus",
  ArmaArchiBoss: "Archi Armas",
  ItemArchiBoss: "Archi Items",
};

export default function Listado() {
  const [selectedBoss, setSelectedBoss] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const menuRef = useRef(null);

  const toggleItems = (boss) => {
    if (selectedBoss === boss) {
      setSelectedBoss(null);
    } else {
      setSelectedBoss(boss);
    }
  };

  const backendURL = import.meta.env.VITE_API_URL;

  const fetchUsers = async (item) => {
    if (selectedItem === item) return;

    setSelectedItem(item);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${backendURL}/api/usuarios?item=${encodeURIComponent(item)}`
      );

      const sortedUsers = response.data.sort((a, b) =>
        a.username.localeCompare(b.username)
      );
      setUsers(sortedUsers);
    } catch (error) {
      setError("Error al obtener los usuarios. Intenta nuevamente.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedBoss(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="contenedor-lista">
      <h2>Selecciona un Boss</h2>
      <div className="munu-boss">
        {Object.keys(itemsGuild).map((boss) => (
          <div key={boss} className="boss-item">
            <div
              className="icono-boss"
              onClick={() => toggleItems(boss)}
              title={`Seleccionar ${boss}`}
            >
              <span>{bossNames[boss] || boss}</span>{" "}
            </div>

            {selectedBoss === boss && (
              <ul ref={menuRef} className="items-list">
                {[...new Set(itemsGuild[boss].map((item) => item.name))].map(
                  (uniqueItem, index) => (
                    <li key={index}>
                      <button onClick={() => fetchUsers(uniqueItem)}>
                        {uniqueItem}
                      </button>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="cuadro-usuarios">
          <h3>Objeto seleccionado: {selectedItem}</h3>
          {loading ? (
            <p>Cargando usuarios...</p>
          ) : (
            <div className="usuarios-grid">
              {users.length > 0 ? (
                users
                  .reduce((acc, user, index) => {
                    const columnIndex = Math.floor(index / 10);
                    if (!acc[columnIndex]) acc[columnIndex] = [];
                    acc[columnIndex].push(user);
                    return acc;
                  }, [])
                  .map((userGroup, colIdx) => (
                    <ul key={colIdx} className="usuarios-columna">
                      {userGroup.map((user, idx) => (
                        <li key={idx}>{user.username}</li>
                      ))}
                    </ul>
                  ))
              ) : (
                <p>No hay usuarios con este objeto</p>
              )}
            </div>
          )}
          {error && <p>{error}</p>}
        </div>
      )}
    </div>
  );
}
