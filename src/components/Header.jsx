import { useLocation } from 'react-router-dom'
import { useThemeStore } from '../stores/themeStore'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/pos': 'Point of Sale',
  '/products': 'Products Management',
  '/suppliers': 'Suppliers Management',
  '/back-orders': 'Back Orders',
  '/sales': 'Sales History',
  '/reports': 'Reports & Analytics',
  '/users': 'User Management',
  '/profile': 'My Profile',
}

// Moon icon for dark mode
const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

// Sun icon for light mode
const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

export default function Header() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Goodyear POS'
  const { isDarkMode, toggleDarkMode } = useThemeStore()

  return (
    <header className={`shadow-sm border-b ${isDarkMode ? 'bg-[#172169] border-[#1a2570]' : 'bg-white border-gray-200'}`}>
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isDarkMode 
              ? 'bg-[#1a2570] hover:bg-[#1e2980] text-yellow-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  )
}
