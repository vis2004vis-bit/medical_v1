import { useEffect, useState } from 'react'
import axios from 'axios'
import { motion, animate } from 'framer-motion'

function Counter({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const controls = animate(0, value || 0, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: latest => setDisplay(latest)
    })
    return () => controls.stop()
  }, [value])

  const formatted = typeof value === 'number'
    ? (suffix === '%' ? Math.round(display) : Math.floor(display))
    : 0

  return <span>{formatted}{suffix}</span>
}

export default function Stats() {
  const [stats, setStats] = useState({ totalUsers: 0, totalScans: 0, averageAccuracy: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + '/stats')
        const data = res.data || {}
        setStats({
          totalUsers: Number(data.totalUsers) || 0,
          totalScans: Number(data.totalScans) || 0,
          averageAccuracy: Math.round(((Number(data.averageAccuracy) || 0) * 100))
        })
      } catch (e) { setError('Failed to load stats') }
      finally { setLoading(false) }
    }
    run()
  }, [])

  return (
    <section id="stats" className="py-20 bg-white">
      <div className="mx-auto max-w-5xl px-4">
        <h3 className="text-2xl font-semibold text-slate-900 text-center">Live Stats</h3>
        {error && <div className="mt-4 text-center text-rose-700">{error}</div>}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border bg-gradient-to-br from-slate-50 to-white p-8 text-center shadow-sm">
            <div className="text-3xl font-bold text-slate-900">
              {loading ? '-' : <Counter value={stats.totalUsers} />}
            </div>
            <div className="mt-2 text-slate-600">Total Users</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border bg-gradient-to-br from-slate-50 to-white p-8 text-center shadow-sm">
            <div className="text-3xl font-bold text-slate-900">
              {loading ? '-' : <Counter value={stats.totalScans} />}
            </div>
            <div className="mt-2 text-slate-600">Total Scans</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border bg-gradient-to-br from-slate-50 to-white p-8 text-center shadow-sm">
            <div className="text-3xl font-bold text-slate-900">
              {loading ? '-' : <Counter value={stats.averageAccuracy} suffix="%" />}
            </div>
            <div className="mt-2 text-slate-600">Accuracy Rate</div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

