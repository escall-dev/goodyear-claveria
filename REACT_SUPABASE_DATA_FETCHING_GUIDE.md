# 🚀 React + Supabase Data Fetching Best Practices

## ✅ FIXED: Infinite Loading Loop Issue

### 🔴 The Problem
Your app was experiencing endless loading because:
1. **Aggressive event listeners** - `visibilitychange` and `focus` events triggered on every click
2. **Multiple rapid refetches** - Clicking between nav items caused repeated API calls
3. **No debouncing** - Each event immediately triggered a new fetch
4. **Window focus fired on navigation** - Every sidebar click refetched ALL data

---

## ✅ The Solution

### **BEFORE (❌ WRONG):**
```jsx
useEffect(() => {
  fetchData()

  // ❌ TOO AGGRESSIVE - fires on every click!
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      fetchData() // Refetch unnecessarily
    }
  }

  const handleFocus = () => {
    fetchData() // Refetch on every window click!
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleFocus)

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleFocus)
  }
}, []) // Problem: Dependencies not properly managed
```

### **AFTER (✅ CORRECT):**

#### **1. Simple Data Fetch with Route Navigation**
```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLocation } from 'react-router-dom'

export default function Products() {
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [location.pathname]) // ✅ Refetch when navigating to this route

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Refetch manually after CRUD operations
  const handleCreate = async (newProduct) => {
    await supabase.from('products').insert([newProduct])
    fetchProducts() // Manual refetch after action
  }

  const handleDelete = async (id) => {
    await supabase.from('products').delete().eq('id', id)
    fetchProducts() // Manual refetch after action
  }

  return (/* Your JSX */)
}
```

#### **2. With Filters (useCallback Pattern)**
```jsx
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function Sales() {
  const [sales, setSales] = useState([])
  const [dateFilter, setDateFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // ✅ Memoize fetch function with dependencies
  const fetchSales = useCallback(async () => {
    try {
      let query = supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        query = query.gte('created_at', today)
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        query = query.gte('created_at', weekAgo)
      } else if (dateFilter === 'custom' && startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate + 'T23:59:59')
      }

      const { data, error } = await query
      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }, [dateFilter, startDate, endDate]) // ✅ Only recreate when filters change

  useEffect(() => {
    fetchSales()
  }, [fetchSales]) // ✅ Refetch when fetchSales changes (i.e., when filters change)

  return (/* Your JSX */)
}
```

#### **3. Multiple Related Fetches**
```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function BackOrders() {
  const [backOrders, setBackOrders] = useState([])
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, []) // ✅ Fetch all related data once

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // ✅ Parallel fetching with Promise.all
      const [ordersResult, productsResult, suppliersResult] = await Promise.all([
        supabase.from('back_orders').select('*, products(name), suppliers(name)').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('name'),
        supabase.from('suppliers').select('*').order('name')
      ])

      if (ordersResult.error) throw ordersResult.error
      if (productsResult.error) throw productsResult.error
      if (suppliersResult.error) throw suppliersResult.error

      setBackOrders(ordersResult.data || [])
      setProducts(productsResult.data || [])
      setSuppliers(suppliersResult.data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (/* Your JSX */)
}
```

---

## 📋 Rules to Avoid Infinite Loops

### ✅ DO:
1. **Use empty dependency array `[]` for one-time fetch on mount**
   ```jsx
   useEffect(() => {
     fetchData()
   }, []) // Runs once
   ```

2. **Use `useCallback` when fetch depends on variables**
   ```jsx
   const fetchData = useCallback(async () => {
     // fetch logic
   }, [filter, searchTerm]) // Only recreate when these change
   ```

3. **Manually refetch after CRUD operations**
   ```jsx
   const handleCreate = async () => {
     await supabase.from('table').insert([data])
     fetchData() // Explicit refetch
   }
   ```

4. **Use React Router's `useLocation` for navigation-based refetch (if needed)**
   ```jsx
   const location = useLocation()
   
   useEffect(() => {
     fetchData()
   }, [location.pathname]) // Refetch when route changes
   ```

### ❌ DON'T:
1. **Don't use window event listeners for data fetching**
   ```jsx
   // ❌ BAD - fires too often
   window.addEventListener('focus', fetchData)
   ```

2. **Don't add fetch function to dependencies without useCallback**
   ```jsx
   // ❌ BAD - creates infinite loop
   useEffect(() => {
     fetchData()
   }, [fetchData]) // fetchData recreated every render
   ```

3. **Don't put state variables that change during fetch in dependencies**
   ```jsx
   // ❌ BAD - loading changes during fetch, causing loop
   useEffect(() => {
     setLoading(true)
     fetchData()
   }, [loading]) // WRONG!
   ```

4. **Don't fetch on every render**
   ```jsx
   // ❌ BAD - no dependency array
   useEffect(() => {
     fetchData()
   }) // Runs on EVERY render
   ```

---

## 🎯 Common Patterns

### Pattern 1: Fetch on Mount AND Navigation
```jsx
import { useLocation } from 'react-router-dom'

const location = useLocation()

useEffect(() => {
  fetchData()
}, [location.pathname]) // Refetch when route changes
```
**Use when:** Using React Router and need fresh data when navigating between pages

### Pattern 2: Fetch When Filter Changes
```jsx
const fetchData = useCallback(async () => {
  // fetch with filter
}, [filter])

useEffect(() => {
  fetchData()
}, [fetchData])
```
**Use when:** Data depends on user-controlled filters (search, date range, etc.)

### Pattern 3: Fetch on Route Change
```jsx
const location = useLocation()

useEffect(() => {
  fetchData()
}, [location.pathname])
```
**Use when:** Different routes need fresh data (less common, usually mount is enough)

### Pattern 4: Manual Refetch After Action
```jsx
const handleSubmit = async () => {
  await supabase.from('table').insert([data])
  fetchData() // Explicit refetch
}
```
**Use when:** After create/update/delete operations

---

## 🔥 Your App's Updated Pattern

All your pages now use this clean pattern:

```jsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useLocation } from 'react-router-dom'

export default function YourPage() {
  const location = useLocation()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // ✅ Fetch when component mounts or when navigating to this route
  useEffect(() => {
    fetchData()
  }, [location.pathname]) // Refetch when route changes

  const fetchData = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('your_table')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setData(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Refetch after actions
  const handleCreate = async (newItem) => {
    await supabase.from('your_table').insert([newItem])
    fetchData()
  }

  return (/* Your JSX */)
}
```

---

## 📊 Performance Tips

1. **Use Supabase's `.select()` wisely**
   ```jsx
   // ✅ Good - select only what you need
   .select('id, name, email')
   
   // ❌ Bad - fetches everything
   .select('*')
   ```

2. **Add pagination for large datasets**
   ```jsx
   .select('*')
   .range(0, 49) // First 50 rows
   ```

3. **Use `.single()` when fetching one record**
   ```jsx
   .select('*')
   .eq('id', userId)
   .single() // Expects one result
   ```

4. **Optimize joins**
   ```jsx
   // ✅ Good - select specific fields from joined table
   .select('*, products(name, price)')
   ```

---

## ✅ Result

- ✅ Data fetches **ONLY ONCE** when you open a page
- ✅ **No infinite loops** when switching navigation
- ✅ **Manual refetch** after create/update/delete
- ✅ **Smooth navigation** with no unnecessary API calls
- ✅ **Better performance** and user experience

---

## 🎓 Key Takeaway

**The golden rule:** 
> Fetch data on mount (`useEffect` with `[]`), and manually refetch after user actions (create/update/delete). Avoid aggressive event listeners that trigger on every interaction.

Your app is now optimized! 🚀
