import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await signIn(formData.email, formData.password)
    
    if (result.success) {
      navigate('/dashboard')
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-[2rem] shadow-2xl p-10" style={{ backgroundColor: '#172169' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/images/goodyear-logo-nobg.png" 
            alt="Goodyear Logo" 
            className="h-32 w-auto object-contain mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-white">POS System</h1>
          <p className="text-gray-300 mt-2">Tires & Inventory Management</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input bg-white"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input bg-white"
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-lg font-semibold text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{ backgroundColor: '#F9A825' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20">
          <p className="text-xs text-white text-center">
            <strong>Account:</strong> escall.dev027.com / goodyear
          </p>
        </div>
      </div>
    </div>
  )
}
