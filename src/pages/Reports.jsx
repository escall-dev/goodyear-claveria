import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Reports() {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [salesByCategory, setSalesByCategory] = useState([])
  const [monthlySales, setMonthlySales] = useState([])
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    fetchReportsData()
  }, [])

  const fetchReportsData = async () => {
    try {
      // Overall stats
      const [
        { data: salesData },
        { data: productsData },
        { count: lowStockCount },
        { data: topProductsData }
      ] = await Promise.all([
        supabase.from('sales').select('total, created_at'),
        supabase.from('products').select('*'),
        supabase.from('products').select('*', { count: 'exact', head: true }).lt('stock', 10),
        supabase
          .from('sale_items')
          .select('product_id, quantity, products(name, brand)')
      ])

      // Calculate totals
      const totalRevenue = salesData?.reduce((sum, sale) => sum + parseFloat(sale.total), 0) || 0
      const totalProducts = productsData?.length || 0
      const totalStock = productsData?.reduce((sum, p) => sum + p.stock, 0) || 0

      setStats({
        totalRevenue,
        totalSales: salesData?.length || 0,
        totalProducts,
        totalStock,
        lowStock: lowStockCount || 0,
      })

      // Sales by category
      const categoryData = {}
      productsData?.forEach(product => {
        categoryData[product.category] = (categoryData[product.category] || 0) + 1
      })
      setSalesByCategory(
        Object.entries(categoryData).map(([name, value]) => ({ name, value }))
      )

      // Monthly sales (last 6 months)
      const monthlyData = {}
      salesData?.forEach(sale => {
        const month = new Date(sale.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        monthlyData[month] = (monthlyData[month] || 0) + parseFloat(sale.total)
      })
      setMonthlySales(
        Object.entries(monthlyData).map(([month, sales]) => ({ month, sales })).slice(-6)
      )

      // Top selling products
      const productSales = {}
      topProductsData?.forEach(item => {
        const productName = item.products?.name || 'Unknown'
        productSales[productName] = (productSales[productName] || 0) + item.quantity
      })
      setTopProducts(
        Object.entries(productSales)
          .map(([name, quantity]) => ({ name, quantity }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10)
      )
    } catch (error) {
      console.error('Error fetching reports data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#f0a500', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="text-gray-600">Comprehensive business insights and analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-green-100 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold mt-1">₱{stats.totalRevenue?.toLocaleString()}</p>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-blue-100 text-sm">Total Sales</p>
          <p className="text-3xl font-bold mt-1">{stats.totalSales}</p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-purple-100 text-sm">Products</p>
          <p className="text-3xl font-bold mt-1">{stats.totalProducts}</p>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <p className="text-yellow-100 text-sm">Total Stock</p>
          <p className="text-3xl font-bold mt-1">{stats.totalStock}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#f0a500" strokeWidth={2} name="Sales (₱)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Products by Category */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Products by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {salesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Top 10 Selling Products</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topProducts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#f0a500" name="Units Sold" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Alerts */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Inventory Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <p className="text-green-800 font-semibold">In Stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalProducts - stats.lowStock}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⚠️</div>
              <div>
                <p className="text-yellow-800 font-semibold">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📊</div>
              <div>
                <p className="text-blue-800 font-semibold">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₱{stats.totalRevenue?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
