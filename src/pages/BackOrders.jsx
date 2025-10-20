import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function BackOrders() {
  const [backOrders, setBackOrders] = useState([])
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const [formData, setFormData] = useState({
    product_id: '',
    supplier_id: '',
    quantity: '',
    expected_date: '',
    notes: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [
        { data: ordersData },
        { data: productsData },
        { data: suppliersData }
      ] = await Promise.all([
        supabase
          .from('back_orders')
          .select('*, products(name, barcode, size), suppliers(name)')
          .order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('name'),
        supabase.from('suppliers').select('*').order('name')
      ])

      setBackOrders(ordersData || [])
      setProducts(productsData || [])
      setSuppliers(suppliersData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (order = null) => {
    if (order) {
      setEditingOrder(order)
      setFormData({
        product_id: order.product_id,
        supplier_id: order.supplier_id,
        quantity: order.quantity,
        expected_date: order.expected_date?.split('T')[0] || '',
        notes: order.notes || '',
      })
    } else {
      setEditingOrder(null)
      setFormData({
        product_id: '',
        supplier_id: '',
        quantity: '',
        expected_date: '',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const orderData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        status: editingOrder?.status || 'pending',
      }

      if (editingOrder) {
        const { error } = await supabase
          .from('back_orders')
          .update(orderData)
          .eq('id', editingOrder.id)

        if (error) throw error
        toast.success('Back order updated successfully')
      } else {
        const { error } = await supabase
          .from('back_orders')
          .insert([orderData])

        if (error) throw error
        toast.success('Back order created successfully')
      }

      setShowModal(false)
      fetchData()
    } catch (error) {
      console.error('Error saving back order:', error)
      toast.error('Failed to save back order')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('back_orders')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      // If status is 'received', update product stock
      if (status === 'received') {
        const order = backOrders.find(o => o.id === id)
        if (order) {
          const { error: stockError } = await supabase.rpc('increment_stock', {
            product_id: order.product_id,
            quantity: order.quantity
          })
          
          if (stockError) {
            // Fallback: manually update stock
            const { data: product } = await supabase
              .from('products')
              .select('stock')
              .eq('id', order.product_id)
              .single()

            await supabase
              .from('products')
              .update({ stock: product.stock + order.quantity })
              .eq('id', order.product_id)
          }
        }
      }

      toast.success('Status updated successfully')
      fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this back order?')) return

    try {
      const { error } = await supabase
        .from('back_orders')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Back order deleted successfully')
      fetchData()
    } catch (error) {
      console.error('Error deleting back order:', error)
      toast.error('Failed to delete back order')
    }
  }

  const filteredOrders = backOrders.filter(order =>
    filterStatus === 'all' || order.status === filterStatus
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning'
      case 'ordered': return 'badge-info'
      case 'received': return 'badge-success'
      case 'cancelled': return 'badge-danger'
      default: return 'badge-info'
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Back Orders Management</h2>
          <p className="text-gray-600">Track and manage product back orders</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          ➕ Create Back Order
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'ordered', 'received', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Back Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Supplier</th>
                <th>Quantity</th>
                <th>Expected Date</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-mono">#{order.id}</td>
                  <td>
                    <div>
                      <p className="font-medium">{order.products?.name}</p>
                      <p className="text-sm text-gray-500">{order.products?.size}</p>
                    </div>
                  </td>
                  <td>{order.suppliers?.name}</td>
                  <td className="font-semibold">{order.quantity} pcs</td>
                  <td>
                    {order.expected_date
                      ? new Date(order.expected_date).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateStatus(order.id, 'ordered')}
                          className="text-blue-600 hover:text-blue-800"
                          title="Mark as Ordered"
                        >
                          📋
                        </button>
                      )}
                      {order.status === 'ordered' && (
                        <button
                          onClick={() => updateStatus(order.id, 'received')}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as Received"
                        >
                          ✅
                        </button>
                      )}
                      <button
                        onClick={() => openModal(order)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No back orders found
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingOrder ? 'Edit Back Order' : 'Create Back Order'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Product *</label>
                  <select
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.size} (Stock: {product.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Supplier *</label>
                  <select
                    required
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Quantity *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Expected Date</label>
                    <input
                      type="date"
                      value={formData.expected_date}
                      onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows="3"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingOrder ? 'Update Order' : 'Create Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
