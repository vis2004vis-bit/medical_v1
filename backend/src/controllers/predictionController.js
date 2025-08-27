import axios from 'axios'
import multer from 'multer'
import FormData from 'form-data'
import path from 'path'
import fs from 'fs'
import Prediction from '../models/Prediction.js'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'src', 'uploads'))
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, unique + path.extname(file.originalname))
  }
})

export const uploadMiddleware = multer({ storage }).single('image')

export async function handleUpload(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const modelUrl = process.env.MODEL_API_URL
    if (!modelUrl) return res.status(500).json({ message: 'MODEL_API_URL not set' })

    const form = new FormData()
    const fileStream = fs.createReadStream(req.file.path)
    form.append('file', fileStream, req.file.originalname)

    const modelRes = await axios.post(modelUrl + '/predict', form, {
      headers: form.getHeaders()
    })

    const { prediction, confidence, segmentationMapUrl } = modelRes.data || {}
    const imageUrl = `/public/${req.file.filename}`

    // persist result under username
    const username = req.user.username
    let doc = await Prediction.findOne({ username })
    if (!doc) doc = await Prediction.create({ username, images: [] })
    doc.images.unshift({ imageUrl, prediction, confidence, segmentationMapUrl })
    await doc.save()

    return res.json({ imageUrl, prediction, confidence, segmentationMapUrl })
  } catch (e) {
    return res.status(500).json({ message: 'Upload error' })
  }
}

export async function getDashboard(req, res) {
  try {
    const username = req.user.username
    const doc = await Prediction.findOne({ username })
    return res.json({ images: doc?.images || [] })
  } catch (e) { return res.status(500).json({ message: 'Dashboard error' }) }
}

