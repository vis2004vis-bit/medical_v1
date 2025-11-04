import { Router } from "express";
import User from "../models/User.js";
import Prediction from "../models/Prediction.js";

const router = Router();
router.get("/stats", async (_req, res) => {
  try {
    const totalUsers = await Prediction.countDocuments();
    const docs = await Prediction.find({});
    const totalScans = docs.reduce(
      (acc, d) => acc + (d.images?.length || 0),
      0
    );
    const accuracyValues = [];
    for (const d of docs) {
      for (const img of d.images || []) {
        if (typeof img.confidence === "number")
          accuracyValues.push(img.confidence);
      }
    }
    const avg = accuracyValues.length
      ? accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length
      : 0;
    return res.json({ totalUsers, totalScans, averageAccuracy: avg });
  } catch (e) {
    return res.status(500).json({ message: "Stats error" });
  }
});

export default router;
