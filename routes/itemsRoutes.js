import express from "express";
import {
  getData,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  seedItems,
} from "../controllers/controllers.js";

const router = express.Router();

// Seed sample data
router.post("/seed", seedItems);

// List / filter
router.get("/data", getData);

// Create
router.post("/", createItem);

// Read / Update / Delete by id
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
