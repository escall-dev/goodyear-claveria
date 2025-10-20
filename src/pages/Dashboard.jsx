import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useDarkMode } from '../hooks/useDarkMode'
import { useLocation } from 'react-router-dom'

export default function Dashboard() {
  const location = useLocation()
  const { isDarkMode, cardClass, textClass, mutedTextClass, bgClass } = useDarkMode()
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    todaySales: 0,
    totalSales: 0,
    backOrders: 0,
    suppliers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentSales, setRecentSales] = useState([])
  const [salesData, setSalesData] = useState([])

  const fetchDashboardData = useCallback(async () => {
    // Only show loading spinner if we don't have data yet
    if (recentSales.length === 0) {
      setLoading(true)
    }
    try {
      // Fetch statistics
      const [
        { count: productsCount },
        { count: lowStockCount },
        { count: backOrdersCount },
        { count: suppliersCount },
        { data: todaySalesData },
        { data: totalSalesData },
        { data: recentSalesData },
        { data: weekSalesData }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).lt('stock', 10),
        supabase.from('back_orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }),
        supabase.from('sales').select('total').gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('sales').select('total'),
        supabase.from('sales').select('*, users(full_name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('sales').select('total, created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ])

      const todayTotal = todaySalesData?.reduce((sum, sale) => sum + parseFloat(sale.total), 0) || 0
      const allTimeTotal = totalSalesData?.reduce((sum, sale) => sum + parseFloat(sale.total), 0) || 0

      // Process weekly sales data
      const salesByDay = {}
      weekSalesData?.forEach(sale => {
        const date = new Date(sale.created_at).toLocaleDateString('en-US', { weekday: 'short' })
        salesByDay[date] = (salesByDay[date] || 0) + parseFloat(sale.total)
      })

      const chartData = Object.entries(salesByDay).map(([day, total]) => ({
        day,
        sales: total
      }))

      setStats({
        totalProducts: productsCount || 0,
        lowStock: lowStockCount || 0,
        todaySales: todayTotal,
        totalSales: allTimeTotal,
        backOrders: backOrdersCount || 0,
        suppliers: suppliersCount || 0,
      })
      setRecentSales(recentSalesData || [])
      setSalesData(chartData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [recentSales.length])

  useEffect(() => {
    // Fetch data when component mounts or when navigating to this route
    fetchDashboardData()
  }, [location.pathname, fetchDashboardData]) // Refetch when route changes

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Minimal Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Products */}
        <div className={`${cardClass} border-l-4 ${isDarkMode ? 'border-gray-400' : 'border-gray-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${mutedTextClass}`}>Total Products</p>
              <p className={`text-3xl font-bold mt-1 ${textClass}`}>{stats.totalProducts}</p>
            </div>
            <div className={`text-4xl ${mutedTextClass}`}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className={`${cardClass} border-l-4 ${stats.lowStock > 0 ? (isDarkMode ? 'border-yellow-500' : 'border-yellow-600') : (isDarkMode ? 'border-gray-400' : 'border-gray-600')}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${mutedTextClass}`}>Low Stock Items</p>
              <p className={`text-3xl font-bold mt-1 ${stats.lowStock > 0 ? 'text-yellow-600' : textClass}`}>{stats.lowStock}</p>
            </div>
            <div className={`text-4xl ${stats.lowStock > 0 ? 'text-yellow-600' : mutedTextClass}`}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Today's Sales */}
        <div className={`${cardClass} border-l-4 ${isDarkMode ? 'border-gray-400' : 'border-gray-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${mutedTextClass}`}>Today&apos;s Sales</p>
              <p className={`text-3xl font-bold mt-1 ${textClass}`}>₱{stats.todaySales.toLocaleString()}</p>
            </div>
            <div className={`text-5xl font-bold ${mutedTextClass}`}>
              ₱
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className={`${cardClass} border-l-4 ${isDarkMode ? 'border-gray-400' : 'border-gray-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${mutedTextClass}`}>Total Sales</p>
              <p className={`text-3xl font-bold mt-1 ${textClass}`}>₱{stats.totalSales.toLocaleString()}</p>
            </div>
            <div className={`text-4xl ${mutedTextClass}`}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Back Orders */}
        <div className={`${cardClass} border-l-4 ${stats.backOrders > 0 ? (isDarkMode ? 'border-orange-500' : 'border-orange-600') : (isDarkMode ? 'border-gray-400' : 'border-gray-600')}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${mutedTextClass}`}>Back Orders</p>
              <p className={`text-3xl font-bold mt-1 ${stats.backOrders > 0 ? 'text-orange-600' : textClass}`}>{stats.backOrders}</p>
            </div>
            <div className={`text-4xl ${stats.backOrders > 0 ? 'text-orange-600' : mutedTextClass}`}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Suppliers */}
        <div className={`${cardClass} border-l-4 ${isDarkMode ? 'border-gray-400' : 'border-gray-600'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${mutedTextClass}`}>Suppliers</p>
              <p className={`text-3xl font-bold mt-1 ${textClass}`}>{stats.suppliers}</p>
            </div>
            <div className={`text-4xl ${mutedTextClass}`}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>Weekly Sales Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#2a3580' : '#e5e7eb'} />
            <XAxis dataKey="day" stroke={isDarkMode ? '#9ca3af' : '#374151'} />
            <YAxis stroke={isDarkMode ? '#9ca3af' : '#374151'} />
            <Tooltip 
              formatter={(value) => `₱${value.toLocaleString()}`}
              contentStyle={{ 
                backgroundColor: isDarkMode ? '#172169' : '#fff',
                border: `1px solid ${isDarkMode ? '#2a3580' : '#e5e7eb'}`,
                color: isDarkMode ? '#fff' : '#000'
              }}
            />
            <Legend wrapperStyle={{ color: isDarkMode ? '#fff' : '#000' }} />
            <Bar dataKey="sales" fill="#f0a500" name="Sales (₱)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Sales */}
      <div className={cardClass}>
        <h3 className={`text-lg font-semibold mb-4 ${textClass}`}>Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className={`table ${isDarkMode ? 'table-dark' : ''}`}>
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Cashier</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="font-mono">#{sale.id}</td>
                    <td>{sale.users?.full_name || 'Unknown'}</td>
                    <td className="font-semibold">₱{parseFloat(sale.total).toLocaleString()}</td>
                    <td>
                      <span className="badge badge-info">{sale.payment_method}</span>
                    </td>
                    <td>{new Date(sale.created_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={`text-center ${mutedTextClass}`}>
                    No sales yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
