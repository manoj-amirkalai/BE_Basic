// EXAMPLE: How to use authMiddleware on specific routes

const express = require("express");
const verifyToken = require("../middleware/authMiddleware");

// Example 1: Protect entire router
const router = express.Router();

router.post("/create", verifyToken, (req, res) => {
  // This route requires authentication
  const userId = req.user.userId; // Access user info from token
  res.json({ message: "Item created", userId });
});

router.get("/", verifyToken, (req, res) => {
  // This route requires authentication
  const userEmail = req.user.email;
  res.json({ message: "Items fetched", userEmail });
});

// ============================================

// Example 2: Mix of public and protected routes
const mixedRouter = express.Router();

mixedRouter.get("/public", (req, res) => {
  // This route is PUBLIC (no token required)
  res.json({ message: "This is public" });
});

mixedRouter.get("/protected", verifyToken, (req, res) => {
  // This route is PROTECTED (token required)
  res.json({ message: "This is protected", user: req.user });
});

mixedRouter.post("/create", verifyToken, (req, res) => {
  // This route is PROTECTED (token required)
  res.json({ message: "Created", creator: req.user.username });
});

mixedRouter.delete("/:id", verifyToken, (req, res) => {
  // This route is PROTECTED (token required)
  res.json({ message: "Deleted", deletedBy: req.user.email });
});

// ============================================

// Example 3: In server.js - Different approaches

const app = require("express")();

// Approach A: Protect all routes under a path
// app.use("/api/items", verifyToken, router);

// Approach B: Protect some paths, leave others public
// app.use("/api/items", mixedRouter);

// Approach C: Global middleware (protects ALL routes except those before it)
// app.use(verifyToken); // Everything after this needs token
// app.use("/api/auth", authRouter); // But auth routes are added before, so they're public

// ============================================

// Example 4: Using in actual controller with database

const Item = require("../models/modelSchema");

const getMyItems = async (req, res) => {
  try {
    const userId = req.user.userId; // From token

    // Find items created by this user
    const items = await Item.find({ createdBy: userId });

    res.status(200).json({
      success: true,
      items: items,
      requestedBy: req.user.email,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.userId;

    // Only allow deletion if user created the item
    const item = await Item.findById(itemId);

    if (item.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own items",
      });
    }

    await Item.findByIdAndDelete(itemId);

    res.status(200).json({
      success: true,
      message: "Item deleted",
      deletedBy: req.user.username,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getMyItems,
  deleteItem,
  router,
  mixedRouter,
};
