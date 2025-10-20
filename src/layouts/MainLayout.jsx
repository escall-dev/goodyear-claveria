import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { useSidebarStore } from '../stores/sidebarStore'
import { useThemeStore } from '../stores/themeStore'

export default function MainLayout() {
  const { isCollapsed } = useSidebarStore()
  const { isDarkMode } = useThemeStore()
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0f1642]' : 'bg-gray-50'}`}>
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Header />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
