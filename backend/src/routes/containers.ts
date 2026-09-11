import { Router } from "express";
import { db } from "../db.js";

export const containersRouter = Router();

interface ContainerRow {
  id: number;
  label: string;
  created_at: string;
}

interface ItemRow {
  id: number;
  name: string;
  quantity: number;
  container_id: number | null;
  created_at: string;
}

// GET /api/containers - list all containers with item counts
containersRouter.get("/", (_req, res) => {
  const containers = db
    .prepare(
      `SELECT c.*, COALESCE(SUM(i.quantity), 0) AS item_count
       FROM containers c
       LEFT JOIN items i ON i.container_id = c.id
       GROUP BY c.id
       ORDER BY c.id ASC`
    )
    .all();
  res.json(containers);
});

// POST /api/containers - create a new container, defaulting label to "Box N"
containersRouter.post("/", (req, res) => {
  const { label } = req.body as { label?: string };

  let finalLabel = label?.trim();
  if (!finalLabel) {
    const countRow = db
      .prepare("SELECT COUNT(*) as count FROM containers")
      .get() as { count: number };
    finalLabel = `Box ${countRow.count + 1}`;
  }

  const result = db
    .prepare("INSERT INTO containers (label) VALUES (?)")
    .run(finalLabel);

  const container = db
    .prepare("SELECT * FROM containers WHERE id = ?")
    .get(result.lastInsertRowid) as unknown as ContainerRow;

  res.status(201).json({ ...container, item_count: 0 });
});

// GET /api/containers/:id - get one container with its items
containersRouter.get("/:id", (req, res) => {
  const container = db
    .prepare("SELECT * FROM containers WHERE id = ?")
    .get(req.params.id) as unknown as ContainerRow | undefined;

  if (!container) {
    return res.status(404).json({ error: "Container not found" });
  }

  const items = db
    .prepare(
      "SELECT * FROM items WHERE container_id = ? ORDER BY id ASC"
    )
    .all(req.params.id) as unknown as ItemRow[];

  res.json({ ...container, items });
});

// PATCH /api/containers/:id - rename a container
containersRouter.patch("/:id", (req, res) => {
  const { label } = req.body as { label?: string };
  if (!label?.trim()) {
    return res.status(400).json({ error: "label is required" });
  }

  const result = db
    .prepare("UPDATE containers SET label = ? WHERE id = ?")
    .run(label.trim(), req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Container not found" });
  }

  const container = db
    .prepare("SELECT * FROM containers WHERE id = ?")
    .get(req.params.id);
  res.json(container);
});

// DELETE /api/containers/:id - delete a container and its items
containersRouter.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM containers WHERE id = ?")
    .run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "Container not found" });
  }

  res.status(204).send();
});
