import { Router } from "express";
import {
  handleUpload,
  uploadMiddleware,
  getDashboard,
} from "../controllers/predictionController.js";
import { authCognitoMiddleware } from "../middleware/authCognito.js";

const router = Router();

router.post("/upload", authCognitoMiddleware, uploadMiddleware, handleUpload);
router.get("/dashboard", authCognitoMiddleware, getDashboard);

export default router;
