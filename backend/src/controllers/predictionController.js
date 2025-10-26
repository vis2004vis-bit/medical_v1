// import axios from "axios";
// import multer from "multer";
// import FormData from "form-data";
// import path from "path";
// import fs from "fs";
// import Prediction from "../models/Prediction.js";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(process.cwd(), "public", "uploads");
//     fs.mkdirSync(uploadPath, { recursive: true }); // ensure folder exists
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, unique + path.extname(file.originalname));
//   },
// });

// export const uploadMiddleware = multer({ storage }).single("image");

// export async function handleUpload(req, res) {
//   try {
//     if (!req.file) return res.status(400).json({ message: "No file uploaded" });
//     const modelUrl = process.env.MODEL_API_URL;
//     if (!modelUrl)
//       return res.status(500).json({ message: "MODEL_API_URL not set" });

//     const form = new FormData();
//     const fileStream = fs.createReadStream(req.file.path);
//     form.append("file", fileStream, req.file.originalname);

//     const modelRes = await axios.post(modelUrl + "/predict", form, {
//       headers: form.getHeaders(),
//     });

//     const { label, confidence, timestamp } = modelRes.data || {};
//     const prediction = label; // map label → prediction
//     const segmentationMapUrl = null; // since API doesn’t send it
//     const imageUrl = `/uploads/${req.file.filename}`;

//     // persist result under username
//     const username = req.user.username;
//     let doc = await Prediction.findOne({ username });
//     if (!doc) doc = await Prediction.create({ username, images: [] });
//     doc.images.unshift({
//       imageUrl,
//       prediction,
//       confidence,
//       segmentationMapUrl,
//     });
//     await doc.save();

//     return res.json({ imageUrl, prediction, confidence, segmentationMapUrl });
//   } catch (e) {
//     return res.status(500).json({ message: e.message || "Server error" });
//   }
// }

// export async function getDashboard(req, res) {
//   try {
//     const username = req.user.username;
//     const doc = await Prediction.findOne({ username });
//     return res.json({ images: doc?.images || [] });
//   } catch (e) {
//     return res.status(500).json({ message: "Dashboard error" });
//   }
// }

import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  SageMakerRuntimeClient,
  InvokeEndpointCommand,
} from "@aws-sdk/client-sagemaker-runtime";
import Prediction from "../models/Prediction.js";

// AWS clients
const s3 = new S3Client({ region: process.env.AWS_REGION });
const sagemaker = new SageMakerRuntimeClient({
  region: process.env.AWS_REGION,
});

// Multer setup (temporary storage before uploading to S3)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "temp");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

export const uploadMiddleware = multer({ storage }).single("image");

// =============== HANDLE UPLOAD (MAIN FUNCTION) ===================
export async function handleUpload(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const username = req.user.username;

    // 1️⃣ Preprocess image like Colab
    const IMG_SIZE = 224;
    const { data, info } = await sharp(req.file.path)
      .resize(IMG_SIZE, IMG_SIZE)
      .toFormat("png")
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Convert to 3D array [224][224][3] normalized
    const floatArray = Float32Array.from(data, (v) => v / 255.0);
    const arr = [];
    for (let i = 0; i < IMG_SIZE; i++) {
      const row = [];
      for (let j = 0; j < IMG_SIZE; j++) {
        const idx = (i * IMG_SIZE + j) * 3;
        row.push([floatArray[idx], floatArray[idx + 1], floatArray[idx + 2]]);
      }
      arr.push(row);
    }

    // Wrap in batch dimension -> [1, 224, 224, 3]
    const payload = JSON.stringify({ instances: [arr] });

    // 2️⃣ Upload image to S3
    const s3Key = `uploads/${req.file.filename}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: fs.createReadStream(req.file.path),
        ContentType: req.file.mimetype,
      })
    );

    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    // 3️⃣ Invoke SageMaker endpoint
    const response = await sagemaker.send(
      new InvokeEndpointCommand({
        EndpointName: process.env.SAGEMAKER_ENDPOINT_NAME,
        ContentType: "application/json",
        Body: payload,
      })
    );

    const body = new TextDecoder("utf-8").decode(response.Body);
    const result = JSON.parse(body);

    // 4️⃣ Parse predictions array
    let label = "Unknown";
    let confidence = 0;
    const predictions = result.predictions?.[0];

    if (predictions && predictions.length === 1) {
      const prob = predictions[0]; // probability of Pneumonia
      const threshold = 0.5; // adjust if needed
      label = prob > threshold ? "Pneumonia" : "Normal";
      confidence = prob;
    }

    // 5️⃣ Save to MongoDB
    let doc = await Prediction.findOne({ username });
    if (!doc) doc = await Prediction.create({ username, images: [] });

    doc.images.unshift({
      imageUrl,
      prediction: label,
      confidence,
      segmentationMapUrl: null,
    });
    await doc.save();

    // 6️⃣ Remove temp file
    fs.unlinkSync(req.file.path);

    // 7️⃣ Send response
    return res.json({
      username,
      imageUrl,
      prediction: label,
      confidence,
      segmentationMapUrl: null,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message || "Server error" });
  }
}

// =============== DASHBOARD (SAME AS BEFORE) ===================
export async function getDashboard(req, res) {
  try {
    const username = req.user.username;
    const doc = await Prediction.findOne({ username });
    return res.json({ username, images: doc?.images || [] });
  } catch (e) {
    return res.status(500).json({ message: "Dashboard error" });
  }
}
