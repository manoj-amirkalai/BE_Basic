const express = require("express");
const cors = require("cors");
const { default: connectDB } = require("./DB/connectDB");
const { default: router } = require("./routes/itemsRoutes");
const authRouter = require("./routes/authRoutes");
const verifyToken = require("./middleware/authMiddleware");

const app = express();

connectDB();
app.use(express.json());
app.use(cors());

app.get("/api", (req, res) => {
  res.send("Hello, World!");
});

// Auth routes (public)
app.use("/api/auth", authRouter);

// Protected routes (requires token)
app.use("/api/items", verifyToken, router);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
