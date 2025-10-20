import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useDarkMode } from '../hooks/useDarkMode'
import { useLocation } from 'react-router-dom'

export default function Sales() {
  const location = useLocation()
  const { isDarkMode, cardClass, inputClass, textClass, mutedTextClass } = useDarkMode()
  const [sales, setSales] = useState([])
  const [selectedSale, setSelectedSale] = useState(null)
  const [dateFilter, setDateFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchSales = useCallback(async () => {
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
    }
  }, [dateFilter, startDate, endDate])

  useEffect(() => {
    // Fetch data when component mounts, when filters change, or when navigating to this route
    fetchSales()
  }, [fetchSales, location.pathname]) // Refetch when route changes or filters change

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

  const handleDelete = async (saleId) => {
    if (!confirm('Are you sure you want to delete this sale? This action cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', saleId)

      if (error) throw error
      toast.success('Sale deleted successfully')
      fetchSales()
    } catch (error) {
      console.error('Error deleting sale:', error)
      toast.error('Failed to delete sale')
    }
  }

  const totalSales = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${textClass}`}>Sales History</h2>
        <p className={mutedTextClass}>View and manage all sales transactions</p>
      </div>

      {/* Filters */}
      <div className={cardClass}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`label ${isDarkMode ? 'label-dark' : ''}`}>Filter by Date</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={inputClass}
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
                <label className={`label ${isDarkMode ? 'label-dark' : ''}`}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`label ${isDarkMode ? 'label-dark' : ''}`}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>

        <div className={`mt-4 p-4 rounded-lg border-2 ${isDarkMode ? 'bg-yellow-500/20 border-yellow-500/40' : 'bg-yellow-400/20 border-yellow-500/40'}`}>
          <div className="flex justify-between items-center">
            <span className={`font-medium ${textClass}`}>Total Sales:</span>
            <span className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              ₱{totalSales.toLocaleString()}
            </span>
          </div>
          <p className={`text-sm mt-1 ${mutedTextClass}`}>
            {sales.length} transaction{sales.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Sales Table */}
      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className={`table ${isDarkMode ? 'table-dark' : ''}`}>
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
                  <td className={`font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    ₱{parseFloat(sale.total).toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-info uppercase">
                      {sale.payment_method}
                    </span>
                  </td>
                  <td>{new Date(sale.created_at).toLocaleString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewSaleDetails(sale.id)}
                        className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                        title="View Details"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && (
            <div className={`text-center py-8 ${mutedTextClass}`}>
              No sales found for the selected period
            </div>
          )}
        </div>
      </div>

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-[#172169]' : 'bg-white'} rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <h3 className={`text-xl font-bold mb-4 ${textClass}`}>Sale Details #{selectedSale.id}</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className={`text-sm ${mutedTextClass}`}>Cashier</p>
                  <p className={`font-medium ${textClass}`}>{selectedSale.users?.full_name}</p>
                </div>
                <div>
                  <p className={`text-sm ${mutedTextClass}`}>Customer</p>
                  <p className={`font-medium ${textClass}`}>{selectedSale.customer_name || 'Walk-in'}</p>
                </div>
                <div>
                  <p className={`text-sm ${mutedTextClass}`}>Payment Method</p>
                  <p className={`font-medium uppercase ${textClass}`}>{selectedSale.payment_method}</p>
                </div>
                <div>
                  <p className={`text-sm ${mutedTextClass}`}>Date & Time</p>
                  <p className={`font-medium ${textClass}`}>
                    {new Date(selectedSale.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <h4 className={`font-semibold mb-3 ${textClass}`}>Items Purchased</h4>
              <div className={`border ${isDarkMode ? 'border-[#2a3580]' : 'border-gray-200'} rounded-lg overflow-hidden mb-6`}>
                <table className={`table ${isDarkMode ? 'table-dark' : ''}`}>
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
                          <p className={`font-medium ${textClass}`}>{item.products?.name}</p>
                          <p className={`text-sm ${mutedTextClass}`}>
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

              <div className={`rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-[#1a2570]' : 'bg-gray-100'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-semibold ${textClass}`}>Total Amount:</span>
                  <span className={`text-2xl font-bold ${isDarkMode ? 'text-yellow-500' : 'text-primary-600'}`}>
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
