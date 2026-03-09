const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* CREATE */
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  const newUser = await pool.query(
    "INSERT INTO users (name,email) VALUES ($1,$2) RETURNING *",
    [name, email]
  );
  res.json(newUser.rows[0]);
});

/* READ */
app.get("/users", async (req, res) => {
  const users = await pool.query("SELECT * FROM users");
  res.json(users.rows);
});

/* UPDATE */
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  await pool.query(
    "UPDATE users SET name=$1,email=$2 WHERE id=$3",
    [name, email, id]
  );

  res.json("User Updated");
});

/* DELETE */
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM users WHERE id=$1", [id]);

  res.json("User Deleted");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});