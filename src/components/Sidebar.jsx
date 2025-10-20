import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { useSidebarStore } from '../stores/sidebarStore'
import { useThemeStore } from '../stores/themeStore'

// Plain SVG Icons
const Icons = {
  Dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  POS: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Products: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Suppliers: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  BackOrders: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Sales: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Reports: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Profile: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
}

const menuItems = [
  { path: '/dashboard', icon: 'Dashboard', label: 'Dashboard' },
  { path: '/pos', icon: 'POS', label: 'Point of Sale' },
  { path: '/products', icon: 'Products', label: 'Products' },
  { path: '/suppliers', icon: 'Suppliers', label: 'Suppliers' },
  { path: '/back-orders', icon: 'BackOrders', label: 'Back Orders' },
  { path: '/sales', icon: 'Sales', label: 'Sales History' },
  { path: '/reports', icon: 'Reports', label: 'Reports' },
  { path: '/users', icon: 'Users', label: 'Users', adminOnly: true },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuthStore()
  const { isCollapsed, toggleSidebar } = useSidebarStore()
  const { isDarkMode } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || profile?.role === 'admin'
  )

  const IconComponent = ({ name }) => {
    const Icon = Icons[name]
    return Icon ? <Icon /> : null
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md shadow-md ${
          isDarkMode ? 'bg-[#172169] text-white' : 'bg-white text-gray-800'
        }`}
      >
        {isOpen ? <Icons.Close /> : <Icons.Menu />}
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
          fixed top-0 left-0 z-40 h-screen transition-all duration-300
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isDarkMode ? 'bg-[#172169]' : 'bg-secondary-900'}
          text-white
        `}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo & Toggle */}
          <div className={`p-6 border-b flex items-center justify-between ${
            isDarkMode ? 'border-[#1a2570]' : 'border-secondary-800'
          }`}>
            {!isCollapsed && (
              <img 
                src="/images/goodyear-logo-nobg.png" 
                alt="Goodyear Logo" 
                className="h-12 w-auto object-contain"
              />
            )}
            {isCollapsed && (
              <img 
                src="/images/goodyear-logo-nobg.png" 
                alt="Goodyear Logo" 
                className="h-10 w-10 object-contain mx-auto"
              />
            )}
            <button
              onClick={toggleSidebar}
              className={`hidden lg:block p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-[#1a2570]' : 'hover:bg-secondary-800'
              }`}
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto overflow-x-visible p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`
                        relative group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-primary-500 text-white' 
                          : isDarkMode 
                            ? 'text-gray-300 hover:bg-[#1a2570]'
                            : 'text-gray-300 hover:bg-secondary-800'
                        }
                        ${isCollapsed ? 'justify-center' : ''}
                      `}
                      title={isCollapsed ? item.label : ''}
                    >
                      <IconComponent name={item.icon} />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                      
                      {/* Custom Tooltip for Collapsed State */}
                      {isCollapsed && (
                        <span className={`
                          fixed ml-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible
                          transition-all duration-200 pointer-events-none z-[9999]
                          ${isDarkMode 
                            ? 'bg-[#1a2570] text-white shadow-xl border border-[#2a3580]' 
                            : 'bg-gray-900 text-white shadow-xl'
                          }
                        `}
                        style={{
                          left: '5.5rem', // Position right after the collapsed sidebar (80px + 8px margin)
                        }}>
                          {item.label}
                          <span className={`
                            absolute right-full top-1/2 -translate-y-1/2 -mr-px
                            border-[6px] border-transparent
                            ${isDarkMode ? 'border-r-[#1a2570]' : 'border-r-gray-900'}
                          `} />
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Profile & Logout */}
          <div className={`p-4 border-t ${
            isDarkMode ? 'border-[#1a2570]' : 'border-secondary-800'
          }`}>
            <div className="mb-3">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={`
                  relative group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isDarkMode ? 'hover:bg-[#1a2570]' : 'hover:bg-secondary-800'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? 'Profile' : ''}
              >
                <Icons.Profile />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">{profile?.role || 'Staff'}</p>
                  </div>
                )}
                
                {/* Custom Tooltip for Collapsed State */}
                {isCollapsed && (
                  <span className={`
                    fixed ml-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 pointer-events-none z-[9999]
                    ${isDarkMode 
                      ? 'bg-[#1a2570] text-white shadow-xl border border-[#2a3580]' 
                      : 'bg-gray-900 text-white shadow-xl'
                    }
                  `}
                  style={{
                    left: '5.5rem',
                  }}>
                    Profile
                    <span className={`
                      absolute right-full top-1/2 -translate-y-1/2 -mr-px
                      border-[6px] border-transparent
                      ${isDarkMode ? 'border-r-[#1a2570]' : 'border-r-gray-900'}
                    `} />
                  </span>
                )}
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className={`
                relative group w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition-colors
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Logout' : ''}
            >
              <Icons.Logout />
              {!isCollapsed && <span className="font-medium">Logout</span>}
              
              {/* Custom Tooltip for Collapsed State */}
              {isCollapsed && (
                <span className="
                  fixed ml-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200 pointer-events-none z-[9999]
                  bg-red-600 text-white shadow-xl
                "
                style={{
                  left: '5.5rem',
                }}>
                  Logout
                  <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-px border-[6px] border-transparent border-r-red-600" />
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
