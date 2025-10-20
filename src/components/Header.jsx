import { useLocation } from 'react-router-dom'

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

export default function Header() {
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Goodyear POS'

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </header>
  )
}
