import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export default function Profile() {
  const { profile, updateProfile } = useAuthStore()
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateProfile({
      id: profile.id,
      ...formData,
    })

    if (result.success) {
      toast.success('Profile updated successfully')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card">
        <h3 className="text-xl font-bold mb-6">Profile Information</h3>

        <div className="flex items-center gap-6 mb-6 pb-6 border-b">
          <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-3xl font-bold">
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h4 className="text-lg font-semibold">{profile?.full_name}</h4>
            <p className="text-gray-600">{profile?.email}</p>
            <span className={`badge ${
              profile?.role === 'admin' ? 'badge-danger' : 'badge-info'
            } mt-2`}>
              {profile?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Role</label>
            <input
              type="text"
              value={profile?.role || ''}
              disabled
              className="input bg-gray-100"
            />
          </div>

          <div>
            <label className="label">Member Since</label>
            <input
              type="text"
              value={new Date(profile?.created_at).toLocaleDateString()}
              disabled
              className="input bg-gray-100"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3 className="text-xl font-bold mb-4">Account Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Account Status</span>
            <span className="badge badge-success">Active</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Account Type</span>
            <span className="font-medium">{profile?.role}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">User ID</span>
            <span className="font-mono text-xs">{profile?.id}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
