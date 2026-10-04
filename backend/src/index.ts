import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./db.js";
import { containersRouter } from "./routes/containers.js";
import { itemsRouter } from "./routes/items.js";
import { searchRouter } from "./routes/search.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT ?? 3001;
const PUBLIC_DIR = process.env.PUBLIC_DIR ?? path.join(__dirname, "..", "public");

app.use(express.json());

app.use("/api/containers", containersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/search", searchRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// In the Docker image the built frontend sits next to the server; in local
// dev it doesn't, and Vite serves the UI instead.
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
