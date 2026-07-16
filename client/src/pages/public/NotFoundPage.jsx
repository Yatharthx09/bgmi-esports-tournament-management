import { Link } from 'react-router-dom'
import { Ghost } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <Ghost className="h-14 w-14 text-slate-600 mb-4" />
      <h1 className="text-4xl font-display font-bold text-white mb-2">404</h1>
      <p className="text-slate-400 mb-6">This page rotated out of the map.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  )
}
