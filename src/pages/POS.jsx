import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'
import { useReactToPrint } from 'react-to-print'
import Barcode from 'react-barcode'
import { useLocation } from 'react-router-dom'

export default function POS() {
  const location = useLocation()
  const { user } = useAuthStore()
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [barcodeInput, setBarcodeInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [customerName, setCustomerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const receiptRef = useRef()
  const barcodeInputRef = useRef()

  const fetchProducts = useCallback(async () => {
    // Only show loading spinner if we don't have data yet
    if (products.length === 0) {
      setLoading(true)
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('name')

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

  const handleBarcodeSubmit = (e) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    const product = products.find(p => p.barcode === barcodeInput.trim())
    if (product) {
      addToCart(product)
      setBarcodeInput('')
    } else {
      toast.error('Product not found')
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error('Not enough stock available')
        return
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    toast.success(`${product.name} added to cart`)
  }

  const updateQuantity = (productId, newQuantity) => {
    const product = products.find(p => p.id === productId)
    
    if (newQuantity > product.stock) {
      toast.error('Not enough stock available')
      return
    }

    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setLoading(true)

    try {
      const total = calculateTotal()

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          user_id: user.id,
          total,
          payment_method: paymentMethod,
          customer_name: customerName || null,
        }])
        .select()
        .single()

      if (saleError) throw saleError

      // Create sale items and update stock
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(saleItems)

      if (itemsError) throw itemsError

      // Update stock for each product
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock: item.stock - item.quantity })
          .eq('id', item.id)

        if (stockError) throw stockError
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'sale',
        details: `Created sale #${sale.id} total ₱${total.toFixed(2)}`,
      })

      // Generate receipt
      setReceipt({
        ...sale,
        items: cart,
        total,
      })

      toast.success('Sale completed successfully!')
      setCart([])
      setCustomerName('')
      fetchProducts() // Refresh products with updated stock
    } catch (error) {
      console.error('Error processing sale:', error)
      toast.error('Failed to process sale')
    } finally {
      setLoading(false)
    }
  }

  const handlePrintReceipt = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => setReceipt(null)
  })

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.size?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Scan or Select Products</h3>
          
          {/* Barcode Scanner */}
          <form onSubmit={handleBarcodeSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan or enter barcode..."
                className="input flex-1"
              />
              <button type="submit" className="btn btn-primary">
                🔍 Search
              </button>
            </div>
          </form>

          {/* Product Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name, brand, or size..."
            className="input mb-4"
          />

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="card p-4 hover:shadow-lg transition-shadow text-left"
              >
                <div className="text-2xl mb-2">🛞</div>
                <h4 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h4>
                <p className="text-xs text-gray-600 mb-2">{product.size}</p>
                <p className="text-primary-600 font-bold">₱{parseFloat(product.price).toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Stock: {product.stock}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="space-y-4">
        <div className="card sticky top-6">
          <h3 className="text-lg font-bold mb-4">Cart</h3>

          {/* Cart Items */}
          <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🛒</div>
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex items-start gap-3 pb-3 border-b">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                    <p className="text-xs text-gray-600">{item.size}</p>
                    <p className="text-primary-600 font-semibold">
                      ₱{parseFloat(item.price).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Customer Info */}
          <div className="mb-4">
            <label className="label">Customer Name (Optional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input"
              placeholder="Enter customer name"
            />
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="label">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="gcash">GCash</option>
              <option value="maya">Maya</option>
            </select>
          </div>

          {/* Total */}
          <div className="bg-gray-100 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary-600">
                ₱{calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
            className="w-full btn btn-success py-3 text-lg disabled:opacity-50"
          >
            {loading ? 'Processing...' : '💳 Checkout'}
          </button>

          <button
            onClick={() => setCart([])}
            disabled={cart.length === 0}
            className="w-full btn btn-outline mt-2"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Sale Completed!</h3>
              
              <div ref={receiptRef} className="bg-white p-6">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold">Goodyear Tires</h2>
                  <p className="text-sm text-gray-600">Official Receipt</p>
                  <Barcode value={`SALE${receipt.id}`} height={50} fontSize={12} />
                </div>

                <div className="border-t border-b border-gray-300 py-3 mb-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Receipt #:</span>
                    <span className="font-mono">{receipt.id}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Date:</span>
                    <span>{new Date(receipt.created_at).toLocaleString()}</span>
                  </div>
                  {receipt.customer_name && (
                    <div className="flex justify-between mb-1">
                      <span>Customer:</span>
                      <span>{receipt.customer_name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Payment:</span>
                    <span className="uppercase">{receipt.payment_method}</span>
                  </div>
                </div>

                <div className="mb-3">
                  {receipt.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          {item.quantity} x ₱{parseFloat(item.price).toLocaleString()}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ₱{(item.quantity * item.price).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL:</span>
                    <span>₱{receipt.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-center mt-4 text-xs text-gray-600">
                  <p>Thank you for your purchase!</p>
                  <p>Visit us again soon</p>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => setReceipt(null)}
                  className="btn btn-outline"
                >
                  Close
                </button>
                <button onClick={handlePrintReceipt} className="btn btn-primary">
                  🖨️ Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
