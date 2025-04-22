require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("chillparty.db", (err) => {
  if (err) {
    console.error("Error al abrir la base de datos:", err);
  } else {
    console.log("Conectado a SQLite");
    crearTablas();
  }
});

//  Slots de items de los usuarios
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

//  Función para crear las tablas si no existen
function crearTablas() {
  const columnasUsuarios = slots.map((slot) => `${slot} TEXT`).join(",\n");

  const crearUsuarios = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      ${columnasUsuarios}
    );
  `;

  const crearAdmins = `
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    );
  `;

  db.run(crearUsuarios);
  db.run(crearAdmins);
}

//  Ruta para registrar un admin
app.post("/register-admin", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    `INSERT INTO admins (username, password, role) VALUES (?, ?, ?)`,
    [username, hashedPassword, "admin"],
    (err) => {
      if (err) {
        console.error("Error al registrar admin:", err);
        return res.status(500).json({ error: "Error al registrar admin" });
      }
      res.status(201).json({ message: "Admin registrado con éxito" });
    }
  );
});

//  Ruta para login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    `SELECT * FROM admins WHERE username = ?`,
    [username],
    async (err, user) => {
      if (err) return res.status(500).json({ error: "Error en el servidor" });
      if (!user)
        return res.status(401).json({ error: "Usuario no encontrado" });

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ error: "Contraseña incorrecta" });

      res.json({ role: user.role, message: `Bienvenido, ${user.role}!` });
    }
  );
});

//  Ping de prueba
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

//  Guardar usuario visitante
app.post("/api/usuarios", (req, res) => {
  const { username } = req.body;
  const values = slots.map((slot) => req.body[slot] || null);

  if (!username) {
    return res.status(400).json({ error: "Falta el nombre de usuario" });
  }

  const placeholders = slots.map(() => "?").join(", ");
  const query = `INSERT INTO users (username, ${slots.join(
    ", "
  )}) VALUES (?, ${placeholders})`;

  db.run(query, [username, ...values], (err) => {
    if (err)
      return res.status(500).json({ error: "Error al guardar el usuario" });
    res.status(201).json({ message: "Usuario guardado con éxito" });
  });
});

//  Buscar usuarios por ítem
app.get("/api/usuarios", (req, res) => {
  const item = req.query.item;
  if (!item) return res.status(400).json({ error: "Falta el ítem a buscar" });

  const conditions = slots.map((slot) => `${slot} = ?`).join(" OR ");
  const values = Array(slots.length).fill(item);

  db.all(
    `SELECT username FROM users WHERE ${conditions}`,
    values,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

//  Eliminar ítem de usuario
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

  const query = `UPDATE users SET ${updates} WHERE username = ?`;

  db.run(query, values, (err) => {
    if (err)
      return res.status(500).json({ error: "Error al eliminar el ítem" });
    res.status(200).json({ message: "Ítem eliminado exitosamente" });
  });
});

//  Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
);
