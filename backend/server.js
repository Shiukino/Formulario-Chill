require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === ADMIN_PASSWORD) {
    res.json({ role: "admin", message: "Bienvenido, admin!" });
  } else {
    res.json({ role: "guest", message: "Bienvenido, visitante!" });
  }
});

const slots = [
  "arma1",
  "arma2",
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

const db = new sqlite3.Database("chillparty.db", (err) => {
  if (err) {
    console.error("Error al abrir la base de datos:", err);
  } else {
    console.log("Conectado a SQLite");

    const columns = slots.map((slot) => `${slot} TEXT`).join(",\n");
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        ${columns}
      )
    `;
    db.run(createTableQuery, (err) => {
      if (err) {
        console.error("Error al crear la tabla:", err);
      }
    });
  }
});

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

app.post("/api/usuarios", (req, res) => {
  const { username } = req.body;
  const values = slots.map((slot) => req.body[slot] || null);

  if (!username) {
    return res.status(400).json({ error: "Falta el nombre de usuario" });
  }

  const placeholders = slots.map(() => "?").join(", ");
  const query = `
    INSERT INTO users (username, ${slots.join(", ")})
    VALUES (?, ${placeholders})
  `;

  db.run(query, [username, ...values], (err) => {
    if (err) {
      res.status(500).json({ error: "Error al guardar el usuario" });
    } else {
      res.status(201).json({ message: "Usuario guardado con éxito" });
    }
  });
});

app.get("/api/usuarios", (req, res) => {
  const item = req.query.item;
  if (!item) return res.status(400).json({ error: "Falta el ítem a buscar" });

  console.log("Buscando usuarios con el objeto:", item);

  const conditions = slots.map((slot) => `${slot} = ?`).join(" OR ");
  const values = Array(slots.length).fill(item);

  db.all(
    `SELECT username FROM users WHERE ${conditions}`,
    values,
    (err, rows) => {
      if (err) {
        console.error("Error en la consulta SQL:", err);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log("Usuarios encontrados:", rows);
      res.json(rows);
    }
  );
});

app.delete("/api/usuarios", (req, res) => {
  const { username, item } = req.query;

  if (!username || !item) {
    return res
      .status(400)
      .json({ error: "Faltan parámetros 'username' o 'item'" });
  }

  const updates = slots
    .map((slot) => `${slot} = CASE WHEN ${slot} = ? THEN NULL ELSE ${slot} END`)
    .join(", ");

  const values = Array(slots.length).fill(item);
  values.push(username);

  const query = `
    UPDATE users 
    SET ${updates}
    WHERE username = ?;
  `;

  db.run(query, values, (err) => {
    if (err) {
      console.error("Error al eliminar el ítem del usuario:", err);
      res.status(500).json({ error: "Error al eliminar el ítem del usuario" });
    } else {
      res.status(200).json({ message: "Ítem eliminado exitosamente" });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
