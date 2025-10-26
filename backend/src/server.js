import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectToDatabase } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import predictionRoutes from "./routes/predictionRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// static files for uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(process.cwd(), "src", "uploads")));
app.use("/public", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", authRoutes);
app.use("/api", predictionRoutes);
app.use("/api", statsRoutes);

const PORT = process.env.PORT || 5000;
async function start() {
  await connectToDatabase(process.env.MONGODB_URI);
  app.listen(PORT, () => console.log(`Server running on :${PORT}`));
}

start().catch((e) => {
  console.error("Failed to start server", e);
  process.exit(1);
});
