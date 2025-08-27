import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="">
      <section className="min-h-[100vh] flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-6xl font-bold text-slate-900">
            Pneumonia Detection
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }} className="mt-4 text-lg text-slate-600">
            Upload chest X-rays and get AI-powered predictions with confidence and optional segmentation maps.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-8">
            <Link to={isAuthenticated ? "/upload" : "/signup"} className="inline-block rounded-lg bg-sky-600 px-6 py-3 text-white shadow hover:bg-sky-700">
              Get Started
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Registered Users', value: 0 },
            { label: 'Total Scans', value: 0 },
            { label: 'Accuracy', value: 0 },
          ].map((stat, idx) => (
            <div key={idx} className="rounded-xl border bg-gradient-to-br from-slate-50 to-white p-8 text-center shadow-sm">
              <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="text-3xl font-bold text-slate-900">
                {stat.value}
              </motion.div>
              <div className="mt-2 text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

