import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

const menuItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/pos', icon: '🛒', label: 'Point of Sale' },
  { path: '/products', icon: '🛞', label: 'Products' },
  { path: '/suppliers', icon: '🏢', label: 'Suppliers' },
  { path: '/back-orders', icon: '📦', label: 'Back Orders' },
  { path: '/sales', icon: '💰', label: 'Sales History' },
  { path: '/reports', icon: '📈', label: 'Reports' },
  { path: '/users', icon: '👥', label: 'Users', adminOnly: true },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || profile?.role === 'admin'
  )

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
      >
        <span className="text-2xl">{isOpen ? '✕' : '☰'}</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 w-64 h-screen transition-transform
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-secondary-900 text-white
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-secondary-800">
            <h1 className="text-2xl font-bold text-primary-400">🛞 Goodyear POS</h1>
            <p className="text-sm text-gray-400 mt-1">Tires & Inventory</p>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-primary-500 text-white' 
                          : 'text-gray-300 hover:bg-secondary-800'
                        }
                      `}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-secondary-800">
            <div className="mb-3">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary-800 transition-colors"
              >
                <span className="text-xl">👤</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{profile?.role || 'Staff'}</p>
                </div>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
