// import { Router } from 'express'
// import { login, signup } from '../controllers/authController.js'

// const router = Router()
// router.post('/signup', signup)
// router.post('/login', login)
// export default router

import express from "express";

const router = express.Router();

// No local authentication routes needed — handled by Cognito frontend
router.get("/", (req, res) => {
  res.send("Auth routes handled by Cognito.");
});

export default router;
