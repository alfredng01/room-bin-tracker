import express from "express";
import cors from "cors";
import "./db.js";
import { containersRouter } from "./routes/containers.js";
import { itemsRouter } from "./routes/items.js";
import { searchRouter } from "./routes/search.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use("/api/containers", containersRouter);
app.use("/api/items", itemsRouter);
app.use("/api/search", searchRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
