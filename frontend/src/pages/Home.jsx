import { motion } from "framer-motion";
import { useRef } from "react";
import Stats from "../components/Stats";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const statsRef = useRef(null);
  const navigate = useNavigate();
  return (
    <div className="">
      <section className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-slate-900"
          >
            Pneumonia Detection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-4 text-lg text-slate-600"
          >
            Upload chest X-rays and get AI-powered predictions with confidence
            and optional segmentation maps.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <button
              onClick={() => navigate("/upload")}
              className="inline-block rounded-lg bg-sky-600 px-6 py-3 text-white shadow hover:bg-sky-700"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </section>
      <Stats ref={statsRef} />
    </div>
  );
}
