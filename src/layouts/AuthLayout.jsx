import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-700 flex items-center justify-center p-4">
      <Outlet />
    </div>
  )
}
