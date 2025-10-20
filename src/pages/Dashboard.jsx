import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
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

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
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
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Products</p>
              <p className="text-3xl font-bold mt-1">{stats.totalProducts}</p>
            </div>
            <div className="text-5xl opacity-80">🛞</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Low Stock Items</p>
              <p className="text-3xl font-bold mt-1">{stats.lowStock}</p>
            </div>
            <div className="text-5xl opacity-80">⚠️</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today&apos;s Sales</p>
              <p className="text-3xl font-bold mt-1">₱{stats.todaySales.toLocaleString()}</p>
            </div>
            <div className="text-5xl opacity-80">💰</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Sales</p>
              <p className="text-3xl font-bold mt-1">₱{stats.totalSales.toLocaleString()}</p>
            </div>
            <div className="text-5xl opacity-80">📊</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Back Orders</p>
              <p className="text-3xl font-bold mt-1">{stats.backOrders}</p>
            </div>
            <div className="text-5xl opacity-80">📦</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Suppliers</p>
              <p className="text-3xl font-bold mt-1">{stats.suppliers}</p>
            </div>
            <div className="text-5xl opacity-80">🏢</div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Weekly Sales Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="sales" fill="#f0a500" name="Sales (₱)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Sales */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="table">
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
                  <td colSpan="5" className="text-center text-gray-500">
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
