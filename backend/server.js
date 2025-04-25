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

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const usernameLower = username.toLowerCase();

  try {
    const result = await pool.query(
      `SELECT * FROM admins WHERE username = $1`,
      [usernameLower]
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

// Guardar personajes
app.post("/api/usuarios", async (req, res) => {
  const { username } = req.body;
  const values = slots.map((slot) => {
    const value = req.body[slot];
    if (value) {
      return JSON.stringify({ item: value, entregado: false });
    }
    return null;
  });

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

// Obtener todos los ítems de un usuario
app.get("/api/usuarios/:username", async (req, res) => {
  const username = req.params.username;

  if (!username) {
    return res.status(400).json({ error: "Falta el nombre de usuario" });
  }

  try {
    const result = await pool.query(
      `SELECT ${slots.join(", ")} FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const row = result.rows[0];

    const items = Object.entries(row)
      .map(([slot, value]) => {
        if (value === null) return null;

        return {
          slot,
          item: value.item,
          entregado: value.entregado ?? false, // por si no existe la propiedad
        };
      })
      .filter(Boolean); // elimina los null

    res.json(items);
  } catch (error) {
    console.error("Error al obtener ítems del usuario:", error);
    res.status(500).json({ error: "Error al obtener los ítems" });
  }
});

// Marcar ítem como entregado
app.patch("/api/usuarios", async (req, res) => {
  const { username, item } = req.body;

  if (!username || !item) {
    return res.status(400).json({ error: "Faltan 'username' o 'item'" });
  }

  // Armamos el query que revisa cada slot
  const updates = slots
    .map((slot, i) => {
      return `
      ${slot} = CASE
        WHEN ${slot} ->> 'item' = $${i + 1}
        THEN jsonb_set(${slot}, '{entregado}', 'true', true)
        ELSE ${slot}
      END
    `;
    })
    .join(", ");

  const values = Array(slots.length).fill(item);
  values.push(username);

  const query = `
    UPDATE users
    SET ${updates}
    WHERE username = $${slots.length + 1}
  `;

  try {
    await pool.query(query, values);
    res.status(200).json({ message: "Ítem marcado como entregado" });
  } catch (error) {
    console.error("Error al actualizar ítem:", error);
    res.status(500).json({ error: "Error al marcar el ítem" });
  }
});

// Listado.jsx
app.get("/api/usuarios", async (req, res) => {
  const item = req.query.item;
  if (!item) return res.status(400).json({ error: "Falta el ítem a buscar" });

  try {
    const conditions = slots
      .map((slot, index) => `(${slot} ->> 'item' = $1)`)
      .join(" OR ");

    const query = `SELECT username, ${slots
      .map((slot, index) => `${slot} as slot${index}`)
      .join(", ")} FROM users WHERE ${conditions}`;

    const result = await pool.query(query, [item]);

    // Array de { username, slot, entregado }
    const usuarios = [];

    result.rows.forEach((row) => {
      const { username, ...rest } = row;

      Object.values(rest).forEach((slot) => {
        if (slot?.item === item) {
          usuarios.push({
            username,
            slot: slot.item,
            entregado: slot.entregado === true ? "true" : "false",
          });
        }
      });
    });

    res.json(usuarios);
  } catch (error) {
    console.error("Error en /api/usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
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
