const express = require("express");
const {
  register,
  login,
  verifyTokenEndpoint,
} = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

const authRouter = express.Router();

// Public routes
authRouter.post("/register", register);
authRouter.post("/login", login);

// Protected route (requires valid token)
authRouter.get("/verify", verifyToken, verifyTokenEndpoint);

module.exports = authRouter;
