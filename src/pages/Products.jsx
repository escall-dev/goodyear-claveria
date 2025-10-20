import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import Barcode from 'react-barcode'
import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'
import { useLocation } from 'react-router-dom'

export default function Products() {
  const location = useLocation()
  const { isDarkMode, cardClass, inputClass, labelClass, textClass, mutedTextClass } = useDarkMode()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBarcode, setSelectedBarcode] = useState(null)
  const [barcodeQuantity, setBarcodeQuantity] = useState(1)
  const barcodeRef = useRef()

  const [formData, setFormData] = useState({
    name: '',
    brand: 'Goodyear',
    category: 'Passenger',
    size: '',
    price: '',
    stock: '',
    reorder_level: 5,
    supplier_id: '',
  })

  const fetchProducts = useCallback(async () => {
    // Only show loading spinner if we don't have data yet
    if (products.length === 0) {
      setLoading(true)
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, suppliers(name)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [products.length])

  useEffect(() => {
    // Fetch data when component mounts or when navigating to this route
    fetchProducts()
  }, [location.pathname, fetchProducts]) // Refetch when route changes

  const handlePrint = useReactToPrint({
    content: () => barcodeRef.current,
  })

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        brand: product.brand || 'Goodyear',
        category: product.category,
        size: product.size || '',
        price: product.price,
        stock: product.stock,
        reorder_level: product.reorder_level || 5,
        supplier_id: product.supplier_id || '',
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        brand: 'Goodyear',
        category: 'Passenger',
        size: '',
        price: '',
        stock: '',
        reorder_level: 5,
        supplier_id: '',
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Generate barcode (using timestamp + random for uniqueness)
      const barcode = editingProduct?.barcode || `GY${Date.now()}${Math.floor(Math.random() * 1000)}`

      const productData = {
        ...formData,
        barcode,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        reorder_level: parseInt(formData.reorder_level),
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
        toast.success('Product updated successfully')
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error
        toast.success('Product added successfully')
      }

      setShowModal(false)
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.size?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h2 className={`text-2xl font-bold ${textClass}`}>Products Inventory</h2>
          <p className={mutedTextClass}>Manage your tire products and inventory</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          ➕ Add New Product
        </button>
      </div>

      {/* Search */}
      <div className={cardClass}>
        <input
          type="text"
          placeholder="Search by name, barcode, or size..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Products Table */}
      <div className={`${cardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className={`table ${isDarkMode ? 'table-dark' : ''}`}>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Size</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <button
                      onClick={() => setSelectedBarcode(product)}
                      className="font-mono text-primary-600 hover:underline"
                    >
                      {product.barcode}
                    </button>
                  </td>
                  <td className="font-medium">{product.name}</td>
                  <td>{product.brand}</td>
                  <td>{product.category}</td>
                  <td>{product.size}</td>
                  <td className="font-semibold">₱{parseFloat(product.price).toLocaleString()}</td>
                  <td>{product.stock}</td>
                  <td>
                    {product.stock === 0 ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : product.stock <= product.reorder_level ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className={`text-center py-8 ${mutedTextClass}`}>
              No products found
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-[#172169]' : 'bg-white'} rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="p-6">
              <h3 className={`text-xl font-bold mb-4 ${textClass}`}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Product Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClass}
                      placeholder="e.g., Eagle F1 Asymmetric"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Brand</label>
                    <select
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Goodyear">Goodyear</option>
                      <option value="Dunlop">Dunlop</option>
                      <option value="Kelly">Kelly</option>
                      <option value="Fulda">Fulda</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={inputClass}
                    >
                      <option value="Passenger">Passenger</option>
                      <option value="SUV">SUV</option>
                      <option value="Truck">Truck</option>
                      <option value="Performance">Performance</option>
                      <option value="All-Season">All-Season</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Tire Size</label>
                    <input
                      type="text"
                      required
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className={inputClass}
                      placeholder="e.g., 225/45R17"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Price (₱)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Reorder Level</label>
                    <input
                      type="number"
                      required
                      value={formData.reorder_level}
                      onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                      className={inputClass}
                    />
                  </div>
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
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Modal */}
      {selectedBarcode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8">
            <h3 className="text-xl font-bold mb-4">Print Barcode Labels</h3>
            
            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Labels to Print
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={barcodeQuantity}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || value === '0') {
                      setBarcodeQuantity('')
                    } else {
                      const num = parseInt(value)
                      if (!isNaN(num)) {
                        setBarcodeQuantity(Math.min(100, Math.max(1, num)))
                      }
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '' || e.target.value === '0') {
                      setBarcodeQuantity(1)
                    }
                  }}
                  className="input w-32"
                  placeholder="1-100"
                />
                <span className="text-sm text-gray-600">
                  (Max: 100 labels)
                </span>
              </div>
            </div>

            {/* Print Preview */}
            <div className="border border-gray-300 rounded-lg p-4 mb-4 max-h-96 overflow-y-auto bg-gray-50">
              <p className="text-sm text-gray-600 mb-4">Print Preview:</p>
              <div ref={barcodeRef} className="bg-white">
                {/* Print Styles */}
                <style>
                  {`
                    @media print {
                      @page {
                        size: letter;
                        margin: 0.5cm;
                      }
                      body {
                        margin: 0;
                        padding: 0;
                      }
                      .barcode-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 0.5cm;
                        width: 100%;
                      }
                      .barcode-label {
                        page-break-inside: avoid;
                        border: 1px solid #e5e7eb;
                        padding: 0.3cm;
                        text-align: center;
                        background: white;
                      }
                      .barcode-label h4 {
                        font-size: 11pt;
                        font-weight: bold;
                        margin: 0 0 0.2cm 0;
                        color: #000;
                      }
                      .barcode-label p {
                        font-size: 9pt;
                        margin: 0.1cm 0;
                        color: #374151;
                      }
                      .barcode-label .price {
                        font-size: 12pt;
                        font-weight: bold;
                        margin-top: 0.2cm;
                        color: #000;
                      }
                    }
                  `}
                </style>

                {/* Barcode Grid */}
                <div className="barcode-grid grid grid-cols-3 gap-4">
                  {Array.from({ length: barcodeQuantity }).map((_, index) => (
                    <div key={index} className="barcode-label border border-gray-200 p-4 bg-white rounded">
                      <h4 className="font-bold text-xs mb-1 truncate">{selectedBarcode.name}</h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {selectedBarcode.brand} - {selectedBarcode.size}
                      </p>
                      <div className="flex justify-center">
                        <Barcode 
                          value={selectedBarcode.barcode}
                          width={1.5}
                          height={40}
                          fontSize={10}
                          margin={0}
                        />
                      </div>
                      <p className="price text-sm font-bold mt-2">
                        ₱{parseFloat(selectedBarcode.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="text-sm text-gray-600">
                <p>📋 Total labels: <strong>{barcodeQuantity}</strong></p>
                <p className="text-xs mt-1">Labels will be printed 3 per row</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedBarcode(null)
                    setBarcodeQuantity(1)
                  }}
                  className="btn btn-outline"
                >
                  Close
                </button>
                <button onClick={handlePrint} className="btn btn-primary">
                  🖨️ Print {barcodeQuantity} Label{barcodeQuantity > 1 ? 's' : ''}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
