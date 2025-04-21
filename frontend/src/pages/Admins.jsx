import { useState } from "react";
import axios from "axios";
import itemsGuild from "../data/itemsGuild";
import "../styles/Admins.css";

export default function Admins() {
  const [users, setUsers] = useState({
    username: "",
    arma1: "Nada",
    arma2: "Nada",
    casco: "Nada",
    pechera: "Nada",
    guantes: "Nada",
    botas: "Nada",
    pantalones: "Nada",
    capa: "Nada",
    collar: "Nada",
    brazalete: "Nada",
    anillo1: "Nada",
    anillo2: "Nada",
    cinturon: "Nada",
    archiboss: "Nada",
  });

  const groupedItems = Object.values(itemsGuild)
    .flat()
    .reduce((acc, item) => {
      if (!acc[item.type]) acc[item.type] = [];
      acc[item.type].push(item.name);
      return acc;
    }, {});

  const order = [
    "arma principal",
    "arma secundaria",
    "casco",
    "pechera",
    "guantes",
    "botas",
    "pantalones",
    "capa",
    "collar",
    "brazalete",
    "anillo1",
    "anillo2",
    "cinturon",
    "archiboss",
  ];

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "arma principal") name = "arma1";
    if (name === "arma secundaria") name = "arma2";

    setUsers((prevUsers) => ({
      ...prevUsers,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/usuarios", users);
      alert("Datos guardados con éxito");
      setUsers({
        username: "",
        arma1: "Nada",
        arma2: "Nada",
        casco: "Nada",
        pechera: "Nada",
        guantes: "Nada",
        botas: "Nada",
        pantalones: "Nada",
        capa: "Nada",
        collar: "Nada",
        brazalete: "Nada",
        anillo1: "Nada",
        anillo2: "Nada",
        cinturon: "Nada",
        archiboss: "Nada",
      });
    } catch (error) {
      console.error("Error al guardar", error);
      alert("Hubo un error al guardar los datos");
    }
  };

  return (
    <div className="formulario">
      <form onSubmit={handleSubmit}>
        <h2>Ingrese los datos del Usuario</h2>

        <div className="form-usuario">
          <label>Nombre: </label>
          <input
            type="text"
            name="username"
            value={users.username}
            onChange={handleChange}
            required
          />
        </div>
        <h2>Guild boss</h2>

        <div className="form-guildboss">
          {order.map((category) => {
            const fieldName =
              category === "arma principal"
                ? "arma1"
                : category === "arma secundaria"
                ? "arma2"
                : category;

            return (
              <div className="box-select-guild" key={category}>
                <label>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </label>
                <select
                  name={fieldName}
                  value={users[fieldName]}
                  onChange={handleChange}
                  required
                >
                  <option value="Nada">Ninguno</option>{" "}
                  {groupedItems[category]?.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
        <button className="btn" type="submit">
          Agregar
        </button>
      </form>
    </div>
  );
}
