import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Sales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState(null)
  const [dateFilter, setDateFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchSales()
  }, [dateFilter, startDate, endDate])

  const fetchSales = async () => {
    try {
      let query = supabase
        .from('sales')
        .select('*, users(full_name)')
        .order('created_at', { ascending: false })

      // Apply date filters
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        query = query.gte('created_at', today)
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte('created_at', weekAgo)
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte('created_at', monthAgo)
      } else if (dateFilter === 'custom' && startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate + 'T23:59:59')
      }

      const { data, error } = await query

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
      toast.error('Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }

  const viewSaleDetails = async (saleId) => {
    try {
      const { data, error } = await supabase
        .from('sale_items')
        .select('*, products(name, brand, size, barcode)')
        .eq('sale_id', saleId)

      if (error) throw error

      const sale = sales.find(s => s.id === saleId)
      setSelectedSale({ ...sale, items: data })
    } catch (error) {
      console.error('Error fetching sale details:', error)
      toast.error('Failed to fetch sale details')
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0)

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
        <h2 className="text-2xl font-bold">Sales History</h2>
        <p className="text-gray-600">View and manage all sales transactions</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Filter by Date</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <>
              <div>
                <label className="label">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 p-4 bg-primary-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Total Sales:</span>
            <span className="text-2xl font-bold text-primary-600">
              ₱{totalSales.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {sales.length} transaction{sales.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Sale ID</th>
                <th>Cashier</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Payment Method</th>
                <th>Date & Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="font-mono">#{sale.id}</td>
                  <td>{sale.users?.full_name || 'Unknown'}</td>
                  <td>{sale.customer_name || '—'}</td>
                  <td className="font-semibold text-green-600">
                    ₱{parseFloat(sale.total).toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-info uppercase">
                      {sale.payment_method}
                    </span>
                  </td>
                  <td>{new Date(sale.created_at).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => viewSaleDetails(sale.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sales found for the selected period
            </div>
          )}
        </div>
      </div>

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Sale Details #{selectedSale.id}</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Cashier</p>
                  <p className="font-medium">{selectedSale.users?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">{selectedSale.customer_name || 'Walk-in'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium uppercase">{selectedSale.payment_method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium">
                    {new Date(selectedSale.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <h4 className="font-semibold mb-3">Items Purchased</h4>
              <div className="border rounded-lg overflow-hidden mb-6">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.items?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <p className="font-medium">{item.products?.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.products?.brand} - {item.products?.size}
                          </p>
                        </td>
                        <td>{item.quantity}</td>
                        <td>₱{parseFloat(item.price).toLocaleString()}</td>
                        <td className="font-semibold">
                          ₱{parseFloat(item.subtotal).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ₱{parseFloat(selectedSale.total).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedSale(null)}
                  className="btn btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
