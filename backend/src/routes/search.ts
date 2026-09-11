import { Router } from "express";
import { db } from "../db.js";

export const searchRouter = Router();

// GET /api/search?q=... - freestanding items matching by name, plus
// containers that hold at least one matching item (label only, per the
// overview's "freestanding items vs containers" split).
searchRouter.get("/", (req, res) => {
  const q = String(req.query.q ?? "").trim();

  if (!q) {
    return res.json({ freestandingItems: [], containers: [] });
  }

  const like = `%${q}%`;

  const freestandingItems = db
    .prepare(
      "SELECT * FROM items WHERE container_id IS NULL AND name LIKE ? ORDER BY id ASC"
    )
    .all(like);

  const containers = db
    .prepare(
      `SELECT c.*, COUNT(i.id) AS match_count
       FROM containers c
       JOIN items i ON i.container_id = c.id
       WHERE i.name LIKE ?
       GROUP BY c.id
       ORDER BY c.id ASC`
    )
    .all(like);

  res.json({ freestandingItems, containers });
});
