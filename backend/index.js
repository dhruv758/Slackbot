require("dotenv").config();
const connectDB = require("./db/dbcon.js");
const express = require("express");
const pollRoutes = require("./routes/pollroutes.js");
const cors = require("cors");

const PORT = process.env.PORT || 5001;

if (typeof connectDB === "function") {
  connectDB();
} else {
  console.error("❌ connectDB is NOT a function. Fix the import!");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", pollRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
