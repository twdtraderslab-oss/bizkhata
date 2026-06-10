import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase, saveBusinessData, loadBusinessData } from '../utils/supabase'

const AppContext = createContext()

const SEED_BUSINESS = {
  id: 'B001', name: 'Sharma Traders', ownerName: 'Ramesh Sharma',
  phone: '9876543210', address: 'Shop No. 14, Galla Mandi, Surat, Gujarat',
  gstin: '24AAXPS1234F1Z5', language: 'en', plan: 'free', gstEnabled: true, gstRate: 5,
}

const SEED_PARTIES_DEMO = [
  { id: 'P001', name: 'Mehta Wholesale Pvt Ltd', phone: '9898001122', type: 'customer', city: 'Ahmedabad', balance: 45000, balanceType: 'to_receive', lastTxn: '2026-06-08', gstin: '24BBBPM5678G1Z3' },
  { id: 'P002', name: 'Patel & Sons Traders', phone: '9712233445', type: 'customer', city: 'Vadodara', balance: 32000, balanceType: 'to_receive', lastTxn: '2026-06-07', gstin: '24CCCPT9012H1Z1' },
  { id: 'P003', name: 'Raj Kumar & Co.', phone: '9988776655', type: 'customer', city: 'Surat', balance: 18500, balanceType: 'to_receive', lastTxn: '2026-06-09', gstin: '' },
  { id: 'P004', name: 'Gupta Brothers', phone: '9876123456', type: 'customer', city: 'Surat', balance: 0, balanceType: 'to_receive', lastTxn: '2026-06-01', gstin: '' },
  { id: 'P005', name: 'National Agro Supplies', phone: '9123456789', type: 'supplier', city: 'Mumbai', balance: 55000, balanceType: 'to_pay', lastTxn: '2026-06-05', gstin: '27DDDNA3456I1Z7' },
  { id: 'P006', name: 'Krishna Rice Mills', phone: '9234567890', type: 'supplier', city: 'Raipur', balance: 22000, balanceType: 'to_pay', lastTxn: '2026-06-03', gstin: '22EEEKR7890J1Z5' },
  { id: 'P007', name: 'Sathe Distributors', phone: '9345678901', type: 'both', city: 'Pune', balance: 8000, balanceType: 'to_receive', lastTxn: '2026-06-06', gstin: '27FFFSD2345K1Z2' },
]

const SEED_TRANSACTIONS_DEMO = [
  { id: 'T001', partyId: 'P001', type: 'sale', amount: 45000, balanceAfter: 45000, note: 'Basmati Rice 50 bags', billNo: 'INV-2026-047', date: '2026-06-08', createdBy: 'Ramesh Sharma' },
  { id: 'T002', partyId: 'P002', type: 'sale', amount: 40000, balanceAfter: 40000, note: 'Mixed pulses order', billNo: 'INV-2026-046', date: '2026-06-07', createdBy: 'Ramesh Sharma' },
  { id: 'T003', partyId: 'P002', type: 'receipt', amount: 8000, balanceAfter: 32000, note: 'Partial payment NEFT', billNo: '', date: '2026-06-09', createdBy: 'Ramesh Sharma' },
  { id: 'T004', partyId: 'P003', type: 'sale', amount: 18500, balanceAfter: 18500, note: 'Wheat flour 100 bags', billNo: 'INV-2026-045', date: '2026-06-09', createdBy: 'Ramesh Sharma' },
  { id: 'T005', partyId: 'P005', type: 'purchase', amount: 55000, balanceAfter: 55000, note: 'Monthly rice stock', billNo: 'PUR-2026-021', date: '2026-06-05', createdBy: 'Ramesh Sharma' },
  { id: 'T006', partyId: 'P006', type: 'purchase', amount: 30000, balanceAfter: 30000, note: 'Premium basmati lot', billNo: 'PUR-2026-020', date: '2026-06-03', createdBy: 'Ramesh Sharma' },
  { id: 'T007', partyId: 'P006', type: 'payment', amount: 8000, balanceAfter: 22000, note: 'Advance payment', billNo: '', date: '2026-06-06', createdBy: 'Ramesh Sharma' },
]

const SEED_PRODUCTS_DEMO = [
  { id: 'PR001', name: 'Basmati Rice 25kg', category: 'Rice', unit: 'bag', purchasePrice: 1200, sellingPrice: 1450, stock: 142, lowStockAlert: 20 },
  { id: 'PR002', name: 'Toor Dal 50kg', category: 'Pulses', unit: 'bag', purchasePrice: 4800, sellingPrice: 5500, stock: 18, lowStockAlert: 20 },
  { id: 'PR003', name: 'Wheat Flour 50kg', category: 'Flour', unit: 'bag', purchasePrice: 1600, sellingPrice: 1850, stock: 67, lowStockAlert: 15 },
  { id: 'PR004', name: 'Chana Dal 50kg', category: 'Pulses', unit: 'bag', purchasePrice: 3900, sellingPrice: 4500, stock: 8, lowStockAlert: 15 },
  { id: 'PR005', name: 'Mustard Oil 15L', category: 'Oil', unit: 'tin', purchasePrice: 1750, sellingPrice: 2100, stock: 34, lowStockAlert: 10 },
  { id: 'PR006', name: 'Sona Masoori Rice 25kg', category: 'Rice', unit: 'bag', purchasePrice: 950, sellingPrice: 1150, stock: 95, lowStockAlert: 25 },
]

const SEED_INVOICES_DEMO = [
  { id: 'INV001', partyId: 'P001', invoiceNo: 'INV-2026-047', date: '2026-06-08', dueDate: '2026-06-22', status: 'unpaid', subtotal: 43500, discount: 0, taxAmount: 1500, totalAmount: 45000, items: [{ productId: 'PR001', name: 'Basmati Rice 25kg', qty: 30, rate: 1450, amount: 43500 }] },
  { id: 'INV002', partyId: 'P002', invoiceNo: 'INV-2026-046', date: '2026-06-07', dueDate: '2026-06-21', status: 'partial', subtotal: 38500, discount: 0, taxAmount: 1500, totalAmount: 40000, items: [{ productId: 'PR002', name: 'Toor Dal 50kg', qty: 7, rate: 5500, amount: 38500 }] },
  { id: 'INV003', partyId: 'P003', invoiceNo: 'INV-2026-045', date: '2026-06-09', dueDate: '2026-06-23', status: 'unpaid', subtotal: 18500, discount: 0, taxAmount: 0, totalAmount: 18500, items: [{ productId: 'PR003', name: 'Wheat Flour 50kg', qty: 10, rate: 1850, amount: 18500 }] },
]

const SEED_STOCK_MOVEMENTS_DEMO = [
  { id: 'SM001', productId: 'PR001', type: 'in', qty: 50, note: 'Purchase from National Agro', date: '2026-06-05', rate: 1200 },
  { id: 'SM002', productId: 'PR001', type: 'out', qty: 30, note: 'Sale INV-2026-047', date: '2026-06-08', rate: 1450 },
  { id: 'SM003', productId: 'PR002', type: 'in', qty: 25, note: 'Purchase from Krishna Rice', date: '2026-06-03', rate: 4800 },
  { id: 'SM004', productId: 'PR002', type: 'out', qty: 7, note: 'Sale INV-2026-046', date: '2026-06-07', rate: 5500 },
  { id: 'SM005', productId: 'PR004', type: 'out', qty: 12, note: 'Sale to Gupta Brothers', date: '2026-06-01', rate: 4500 },
]

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [business, setBusiness] = useState(null)
  const [parties, setParties] = useState([])
  const [transactions, setTransactions] = useState([])
  const [products, setProducts] = useState([])
  const [invoices, setInvoices] = useState([])
  const [stockMovements, setStockMovements] = useState([])
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const saved = localStorage.getItem('hisaabpro_data_v2')
    if (saved) {
      const data = JSON.parse(saved)
      setBusiness(data.business || SEED_BUSINESS)
      setParties(data.parties || SEED_PARTIES)
      setTransactions(data.transactions || SEED_TRANSACTIONS)
      setProducts(data.products || SEED_PRODUCTS)
      setInvoices(data.invoices || SEED_INVOICES)
      setStockMovements(data.stockMovements || SEED_STOCK_MOVEMENTS)
    } else {
      setBusiness(SEED_BUSINESS)
      setParties(SEED_PARTIES)
      setTransactions(SEED_TRANSACTIONS)
      setProducts(SEED_PRODUCTS)
      setInvoices(SEED_INVOICES)
      setStockMovements(SEED_STOCK_MOVEMENTS)
    }
    const savedUser = localStorage.getItem('hisaabpro_user')
    if (savedUser) setCurrentUser(JSON.parse(savedUser))
  }, [])

  useEffect(() => {
    if (business) {
      const data = { business, parties, transactions, products, invoices, stockMovements }
      localStorage.setItem('hisaabpro_data_v2', JSON.stringify(data))
      // Sync to cloud if user is logged in
      if (currentUser?.id) {
        const timer = setTimeout(() => saveBusinessData(currentUser.id, data), 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [business, parties, transactions, products, invoices, stockMovements])

  const login = async (userData) => {
    setCurrentUser(userData)
    localStorage.setItem('hisaabpro_user', JSON.stringify(userData))
    // Load cloud data if exists
    if (userData.id) {
      try {
        const cloudData = await loadBusinessData(userData.id)
        if (cloudData) {
          setBusiness(cloudData.business || SEED_BUSINESS)
          setParties(cloudData.parties || SEED_PARTIES)
          setTransactions(cloudData.transactions || SEED_TRANSACTIONS)
          setProducts(cloudData.products || SEED_PRODUCTS)
          setInvoices(cloudData.invoices || SEED_INVOICES)
          setStockMovements(cloudData.stockMovements || SEED_STOCK_MOVEMENTS)
        } else {
          // First time user — use seed data, save to cloud
          const initData = { business: SEED_BUSINESS, parties: SEED_PARTIES, transactions: SEED_TRANSACTIONS, products: SEED_PRODUCTS, invoices: SEED_INVOICES, stockMovements: SEED_STOCK_MOVEMENTS }
          await saveBusinessData(userData.id, initData)
        }
      } catch (e) { console.log('Cloud sync error:', e) }
    }
  }

  const logout = async () => {
    setCurrentUser(null)
    localStorage.removeItem('hisaabpro_user')
    try { await supabase.auth.signOut() } catch(e) {}
  }

  const addParty = (party) => {
    const newParty = { ...party, id: `P${Date.now()}`, lastTxn: new Date().toISOString().split('T')[0] }
    setParties(prev => [newParty, ...prev]); return newParty
  }

  const updatePartyBalance = (partyId, amount, txnType) => {
    setParties(prev => prev.map(p => {
      if (p.id !== partyId) return p
      let newBalance = p.balance
      if (txnType === 'sale') newBalance += amount
      if (txnType === 'receipt') newBalance -= amount
      if (txnType === 'purchase') newBalance += amount
      if (txnType === 'payment') newBalance -= amount
      return { ...p, balance: Math.max(0, newBalance), lastTxn: new Date().toISOString().split('T')[0] }
    }))
  }

  const addTransaction = (txn) => {
    const newTxn = { ...txn, id: `T${Date.now()}`, createdBy: currentUser?.name || 'Owner' }
    setTransactions(prev => [newTxn, ...prev])
    updatePartyBalance(txn.partyId, txn.amount, txn.type)
    return newTxn
  }

  const addProduct = (product) => {
    const newProduct = { ...product, id: `PR${Date.now()}` }
    setProducts(prev => [newProduct, ...prev]); return newProduct
  }

  const updateProduct = (id, updates) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id))

  // ── Edit/Delete helpers ──────────────────────────────────────────────────
  const editParty = (id, updates) => setParties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  const deleteParty = (id) => {
    setParties(prev => prev.filter(p => p.id !== id))
    setTransactions(prev => prev.filter(t => t.partyId !== id))
    setInvoices(prev => prev.filter(i => i.partyId !== id))
  }
  const deleteTransaction = (id) => setTransactions(prev => prev.filter(t => t.id !== id))
  const editInvoice = (id, updates) => setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i))
  const deleteInvoice = (id) => setInvoices(prev => prev.filter(i => i.id !== id))
  const deleteStockMovement = (id) => setStockMovements(prev => prev.filter(m => m.id !== id))

  // ── Invoice helpers ──────────────────────────────────────────────────────
  const nextInvoiceNo = () => {
    const nums = invoices.map(inv => parseInt(inv.invoiceNo.split('-')[2] || 0)).filter(Boolean)
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 48
    return `INV-2026-${String(next).padStart(3, '0')}`
  }

  const addInvoice = (invoice) => {
    const newInv = { ...invoice, id: `INV${Date.now()}`, invoiceNo: nextInvoiceNo() }
    setInvoices(prev => [newInv, ...prev])
    // Auto-deduct stock for each item
    invoice.items.forEach(item => {
      if (item.productId) {
        addStockMovement({ productId: item.productId, type: 'out', qty: item.qty, note: `Sale ${newInv.invoiceNo}`, date: invoice.date, rate: item.rate })
        updateProduct(item.productId, { stock: Math.max(0, (products.find(p => p.id === item.productId)?.stock || 0) - item.qty) })
      }
    })
    addTransaction({ partyId: invoice.partyId, type: 'sale', amount: invoice.totalAmount, balanceAfter: 0, note: `Invoice ${newInv.invoiceNo}`, billNo: newInv.invoiceNo, date: invoice.date })
    return newInv
  }

  const updateInvoiceStatus = (id, status) => setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv))

  // ── Stock Movement helpers ───────────────────────────────────────────────
  const addStockMovement = (movement) => {
    const newMov = { ...movement, id: `SM${Date.now()}` }
    setStockMovements(prev => [newMov, ...prev]); return newMov
  }

  const stockIn = (productId, qty, note, rate) => {
    addStockMovement({ productId, type: 'in', qty: Number(qty), note, date: new Date().toISOString().split('T')[0], rate: Number(rate) })
    updateProduct(productId, { stock: (products.find(p => p.id === productId)?.stock || 0) + Number(qty) })
  }

  const stockOut = (productId, qty, note, rate) => {
    addStockMovement({ productId, type: 'out', qty: Number(qty), note, date: new Date().toISOString().split('T')[0], rate: Number(rate) })
    updateProduct(productId, { stock: Math.max(0, (products.find(p => p.id === productId)?.stock || 0) - Number(qty)) })
  }

  const stats = {
    totalReceivable: parties.filter(p => p.balanceType === 'to_receive').reduce((s, p) => s + p.balance, 0),
    totalPayable: parties.filter(p => p.balanceType === 'to_pay').reduce((s, p) => s + p.balance, 0),
    lowStockCount: products.filter(p => p.stock <= p.lowStockAlert).length,
    todayTxns: transactions.filter(t => t.date === new Date().toISOString().split('T')[0]).length,
    totalCustomers: parties.filter(p => p.type === 'customer' || p.type === 'both').length,
    totalSuppliers: parties.filter(p => p.type === 'supplier' || p.type === 'both').length,
    totalSales: transactions.filter(t => t.type === 'sale').reduce((s, t) => s + t.amount, 0),
    totalPurchases: transactions.filter(t => t.type === 'purchase').reduce((s, t) => s + t.amount, 0),
    unpaidInvoices: invoices.filter(i => i.status !== 'paid').length,
    stockValue: products.reduce((s, p) => s + p.stock * p.purchasePrice, 0),
  }

  const t = (en, hi) => language === 'hi' ? hi : en

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      business, setBusiness,
      parties, addParty, editParty, deleteParty,
      transactions, addTransaction, deleteTransaction,
      products, addProduct, updateProduct, deleteProduct,
      invoices, addInvoice, updateInvoiceStatus, editInvoice, deleteInvoice,
      stockMovements, addStockMovement, stockIn, stockOut, deleteStockMovement,
      stats, language, setLanguage, t,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
