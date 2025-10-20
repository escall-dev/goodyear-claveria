import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { useDarkMode } from '../hooks/useDarkMode'
import { useLocation } from 'react-router-dom'

export default function Suppliers() {
  const location = useLocation()
  const { isDarkMode, cardClass, inputClass, labelClass, textClass, mutedTextClass } = useDarkMode()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  })

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setSuppliers(data || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      toast.error('Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch data when component mounts or when navigating to this route
    fetchSuppliers()
  }, [location.pathname, fetchSuppliers]) // Refetch when route changes

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier)
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
      })
    } else {
      setEditingSupplier(null)
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (editingSupplier) {
        const { error } = await supabase
          .from('suppliers')
          .update(formData)
          .eq('id', editingSupplier.id)

        if (error) throw error
        toast.success('Supplier updated successfully')
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert([formData])

        if (error) throw error
        toast.success('Supplier added successfully')
      }

      setShowModal(false)
      fetchSuppliers()
    } catch (error) {
      console.error('Error saving supplier:', error)
      toast.error('Failed to save supplier')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Supplier deleted successfully')
      fetchSuppliers()
    } catch (error) {
      console.error('Error deleting supplier:', error)
      toast.error('Failed to delete supplier')
    }
  }

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h2 className={`text-2xl font-bold ${textClass}`}>Suppliers Management</h2>
          <p className={mutedTextClass}>Manage your supplier relationships</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          ➕ Add New Supplier
        </button>
      </div>

      {/* Search */}
      <div className={cardClass}>
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className={`${cardClass} hover:shadow-lg transition-shadow`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                {supplier.contact_person && (
                  <p className="text-sm text-gray-600 mt-1">
                    👤 {supplier.contact_person}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(supplier)}
                  className="text-blue-600 hover:text-blue-800 text-xl"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="text-red-600 hover:text-red-800 text-xl"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {supplier.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span>📧</span>
                  <a href={`mailto:${supplier.email}`} className="hover:text-primary-600">
                    {supplier.email}
                  </a>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <span>📱</span>
                  <a href={`tel:${supplier.phone}`} className="hover:text-primary-600">
                    {supplier.phone}
                  </a>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-start gap-2 text-gray-700">
                  <span>📍</span>
                  <span className="flex-1">{supplier.address}</span>
                </div>
              )}
              {supplier.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">{supplier.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Added: {new Date(supplier.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <p className="text-gray-500 text-lg">No suppliers found</p>
          <button onClick={() => openModal()} className="btn btn-primary mt-4">
            Add Your First Supplier
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Goodyear Philippines Inc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Contact Person</label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      className="input"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="contact@supplier.com"
                  />
                </div>

                <div>
                  <label className="label">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input"
                    rows="2"
                    placeholder="Full address..."
                  />
                </div>

                <div>
                  <label className="label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows="3"
                    placeholder="Additional notes about this supplier..."
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
                    {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
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
