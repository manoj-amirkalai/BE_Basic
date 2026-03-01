const express = require("express");
const cors = require("cors");
const { default: connectDB } = require("./DB/connectDB");
const { default: router } = require("./routes/itemsRoutes");

const app = express();

connectDB();
app.use(express.json());
app.use(cors());

app.get("/api", (req, res) => {
  res.send("Hello, World!");
});

app.use("/api/items", router);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
