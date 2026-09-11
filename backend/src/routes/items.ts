import { Router } from "express";
import { db } from "../db.js";

export const itemsRouter = Router();

// GET /api/items - freestanding items (no container)
itemsRouter.get("/", (_req, res) => {
  const items = db
    .prepare(
      "SELECT * FROM items WHERE container_id IS NULL ORDER BY id ASC"
    )
    .all();
  res.json(items);
});

// POST /api/items - create an item, optionally inside a container
itemsRouter.post("/", (req, res) => {
  const { name, quantity, container_id } = req.body as {
    name?: string;
    quantity?: number;
    container_id?: number | null;
  };

  if (!name?.trim()) {
    return res.status(400).json({ error: "name is required" });
  }

  const finalQuantity =
    quantity === undefined || quantity === null ? 1 : Number(quantity);

  const result = db
    .prepare(
      "INSERT INTO items (name, quantity, container_id) VALUES (?, ?, ?)"
    )
    .run(name.trim(), finalQuantity, container_id ?? null);

  const item = db
    .prepare("SELECT * FROM items WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(item);
});

// PATCH /api/items/:id - update name/quantity/container
itemsRouter.patch("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM items WHERE id = ?")
    .get(req.params.id) as
    | { id: number; name: string; quantity: number; container_id: number | null }
    | undefined;

  if (!existing) {
    return res.status(404).json({ error: "Item not found" });
  }

  const { name, quantity, container_id } = req.body as {
    name?: string;
    quantity?: number;
    container_id?: number | null;
  };

  const finalName = name?.trim() || existing.name;
  const finalQuantity =
    quantity === undefined || quantity === null
      ? existing.quantity
      : Number(quantity);
  const finalContainerId =
    container_id === undefined ? existing.container_id : container_id;

  db.prepare(
    "UPDATE items SET name = ?, quantity = ?, container_id = ? WHERE id = ?"
  ).run(finalName, finalQuantity, finalContainerId, req.params.id);

  const item = db
    .prepare("SELECT * FROM items WHERE id = ?")
    .get(req.params.id);
  res.json(item);
});

// DELETE /api/items/:id
itemsRouter.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM items WHERE id = ?").run(
    req.params.id
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: "Item not found" });
  }

  res.status(204).send();
});
