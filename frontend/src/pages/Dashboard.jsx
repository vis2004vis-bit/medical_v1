import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.get(import.meta.env.VITE_API_URL + '/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setItems(res.data.images || [])
      } catch (e) { setError('Failed to load dashboard') }
      finally { setLoading(false) }
    }
    run()
  }, [token])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-rose-700">{error}</div>

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-semibold">Your Scans</h2>
      {items.length === 0 && <div className="mt-4 text-slate-600">No scans yet. <a className="text-sky-700" href="/upload">Upload one</a>.</div>}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((img, idx) => (
          <div key={idx} className="rounded-xl border bg-white p-4 shadow-sm">
            {img.imageUrl && <img src={img.imageUrl} alt="X-ray" className="h-40 w-full object-cover rounded" />}
            <div className="mt-3 text-sm text-slate-700">
              <div><span className="font-medium">Prediction:</span> {img.prediction}</div>
              <div><span className="font-medium">Confidence:</span> {typeof img.confidence === 'number' ? `${(img.confidence * 100).toFixed(1)}%` : '-'}</div>
              <div><span className="font-medium">Uploaded:</span> {img.uploadedAt ? new Date(img.uploadedAt).toLocaleString() : '-'}</div>
            </div>
            {img.segmentationMapUrl && <img src={img.segmentationMapUrl} alt="Segmentation" className="mt-3 h-40 w-full object-cover rounded" />}
          </div>
        ))}
      </div>
    </div>
  )
}

