const express = require("express");
const cors    = require("cors");
require("dotenv").config();

const taskRoutes = require("./routes/tasks");

const app  = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());           // allows frontend (Vite on 5173) to talk to this backend
app.use(express.json());   // lets us read req.body as JSON

// routes
app.use("/api/tasks", taskRoutes);

// health check - visit http://localhost:5000 to confirm server is running
app.get("/", (req, res) => {
  res.send("Todo backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});