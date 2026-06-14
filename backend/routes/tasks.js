const express = require("express");
const router  = express.Router();
const pool    = require("../db");

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - add new task
router.post("/", async (req, res) => {
  const { title, category, priority, due_date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tasks (title, category, priority, due_date, done) VALUES ($1, $2, $3, $4, false) RETURNING *",
      [title, category, priority, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - update a task (edit or toggle done)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, category, priority, due_date, done } = req.body;
  try {
    const result = await pool.query(
      "UPDATE tasks SET title=$1, category=$2, priority=$3, due_date=$4, done=$5 WHERE id=$6 RETURNING *",
      [title, category, priority, due_date, done, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - remove a task
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;