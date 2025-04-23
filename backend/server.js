require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const app = express();
app.use(
  cors({
    origin: "https://shiukino.github.io",
  })
);
app.use(express.json());

// Conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // importante para Neon
  },
});

// Slots
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

// Crear tablas
async function crearTablas() {
  const columnasUsuarios = slots.map((slot) => `${slot} TEXT`).join(",\n");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      ${columnasUsuarios}
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);
}

crearTablas();

// Rutas
app.post("/register-admin", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      `INSERT INTO admins (username, password, role) VALUES ($1, $2, $3)`,
      [username, hashedPassword, "admin"]
    );
    res.status(201).json({ message: "Admin registrado con éxito" });
  } catch (error) {
    console.error("Error al registrar admin:", error);
    res.status(500).json({ error: "Error al registrar admin" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM admins WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

    res.json({ role: user.role, message: `Bienvenido, ${user.role}!` });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Guardar visitante
app.post("/api/usuarios", async (req, res) => {
  const { username } = req.body;
  const values = slots.map((slot) => req.body[slot] || null);

  if (!username) {
    return res.status(400).json({ error: "Falta el nombre de usuario" });
  }

  try {
    const placeholders = slots.map((_, i) => `$${i + 2}`).join(", ");
    const query = `INSERT INTO users (username, ${slots.join(
      ", "
    )}) VALUES ($1, ${placeholders})`;
    await pool.query(query, [username, ...values]);
    res.status(201).json({ message: "Usuario guardado con éxito" });
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    res.status(500).json({ error: "Error al guardar el usuario" });
  }
});

// Buscar por ítem
app.get("/api/usuarios", async (req, res) => {
  const item = req.query.item;
  if (!item) return res.status(400).json({ error: "Falta el ítem a buscar" });

  const conditions = slots.map((slot) => `${slot} = $1`).join(" OR ");

  try {
    const result = await pool.query(
      `SELECT username FROM users WHERE ${conditions}`,
      [item]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar ítem de usuario
app.delete("/api/usuarios", async (req, res) => {
  const { username, item } = req.query;

  if (!username || !item) {
    return res
      .status(400)
      .json({ error: "Faltan parámetros 'username' o 'item'" });
  }

  const updates = slots
    .map(
      (slot, i) =>
        `${slot} = CASE WHEN ${slot} = $${i + 1} THEN NULL ELSE ${slot} END`
    )
    .join(", ");
  const values = Array(slots.length).fill(item);
  values.push(username);

  const query = `UPDATE users SET ${updates} WHERE username = $${
    slots.length + 1
  }`;

  try {
    await pool.query(query, values);
    res.status(200).json({ message: "Ítem eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el ítem" });
  }
});

// Prueba
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Servidor escuchando en http://localhost:${PORT}`)
);
