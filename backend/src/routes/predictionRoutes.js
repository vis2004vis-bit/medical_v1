import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { handleUpload, uploadMiddleware, getDashboard } from '../controllers/predictionController.js'

const router = Router()
router.post('/upload', authMiddleware, uploadMiddleware, handleUpload)
router.get('/dashboard', authMiddleware, getDashboard)
export default router

