import React, { useState } from 'react'
import { exportParties, exportTransactions, exportInvoices, exportInventory, exportOutstandingReport } from '../utils/exportUtils'
import { useApp } from '../context/AppContext'
import { Package, AlertTriangle, Plus, TrendingUp, TrendingDown, ArrowLeft, BarChart2, Edit2, Trash2 } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

// ── Inventory Screen ──────────────────────────────────────────────────────────
export function InventoryScreen() {
  const { products, stockMovements, stockIn, stockOut, addProduct, updateProduct, deleteProduct, language } = useApp()
  const hi = language === 'hi'
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showEditModal, setShowEditModal] = useState(null)
  const [menuProductId, setMenuProductId] = useState(null)
  const [search, setSearch] = useState('')

  if (selectedProduct) return <ProductDetailScreen product={selectedProduct} onBack={() => setSelectedProduct(null)} />

  const lowStock = products.filter(p => p.stock <= p.lowStockAlert)
  const totalValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0)
  const categories = ['all', ...new Set(products.map(p => p.category))]

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.category === filter || (filter === 'low' && p.stock <= p.lowStockAlert)
    return matchSearch && matchFilter
  })

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', padding: '24px 16px 20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white' }}>
            {hi ? 'स्टॉक प्रबंधन' : 'Inventory'}
          </h2>
          <button onClick={() => setShowAddProduct(true)} style={{ background: 'var(--saffron)', border: 'none', borderRadius: 12, padding: '9px 14px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={15} /> {hi ? 'प्रोडक्ट' : 'Product'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
          {[
            { label: hi ? 'कुल प्रोडक्ट' : 'Products', value: products.length, color: 'white' },
            { label: hi ? 'स्टॉक मूल्य' : 'Stock Value', value: totalValue >= 100000 ? `₹${(totalValue/100000).toFixed(1)}L` : fmtFull(totalValue), color: '#4ADE80' },
            { label: hi ? 'कम स्टॉक' : 'Low Stock', value: lowStock.length, color: lowStock.length > 0 ? '#F87171' : '#4ADE80' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <input className="input-field" style={{ background: 'white' }}
          placeholder={hi ? 'प्रोडक्ट खोजें...' : 'Search products...'}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 14 }}>
          {[{ id: 'low', label: `⚠️ Low Stock`, labelHi: '⚠️ कम स्टॉक' }, ...categories.map(c => ({ id: c, label: c === 'all' ? 'All' : c, labelHi: c === 'all' ? 'सभी' : c }))].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              border: filter === f.id ? 'none' : '1px solid var(--border)',
              background: filter === f.id ? (f.id === 'low' ? 'var(--red)' : 'var(--saffron)') : 'white',
              color: filter === f.id ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s',
            }}>{hi ? f.labelHi : f.label}</button>
          ))}
        </div>

        {lowStock.length > 0 && filter !== 'low' && (
          <div onClick={() => setFilter('low')} style={{ background: 'var(--red-light)', border: '1px solid #FCA5A5', borderRadius: 14, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <AlertTriangle size={16} color="var(--red)" />
            <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>{lowStock.length} items below reorder level — Tap to view</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(p => {
            const isLow = p.stock <= p.lowStockAlert
            const margin = p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100) : 0
            return (
              <div key={p.id} className="card"
                style={{ padding: '14px 16px', border: isLow ? '1px solid #FCA5A5' : '1px solid var(--border)', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setSelectedProduct(p)}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{p.name}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, background: 'var(--indigo-light)', color: 'var(--indigo)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>{p.category}</span>
                      {p.sellingPrice > 0 && <span style={{ fontSize: 11, background: 'var(--green-light)', color: 'var(--green)', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>Margin: {margin}%</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ textAlign: 'right', cursor: 'pointer' }} onClick={() => setSelectedProduct(p)}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: isLow ? 'var(--red)' : 'var(--indigo)' }}>{p.stock}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.unit}s</div>
                      {isLow && <span style={{ fontSize: 10, background: 'var(--red-light)', color: 'var(--red)', padding: '2px 6px', borderRadius: 99, fontWeight: 700 }}>LOW</span>}
                    </div>
                    {/* 3-dot menu */}
                    <div style={{ position: 'relative' }}>
                      <button onClick={e => { e.stopPropagation(); setMenuProductId(menuProductId === p.id ? null : p.id) }}
                        style={{ background: 'var(--bg)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--text-muted)' }}>⋮</button>
                      {menuProductId === p.id && (
                        <div style={{ position: 'absolute', right: 0, top: 32, background: 'white', borderRadius: 12, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', zIndex: 50, minWidth: 130, overflow: 'hidden' }}
                          onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setShowEditModal(p); setMenuProductId(null) }}
                            style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--indigo)', fontWeight: 600 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            <Edit2 size={13} /> Edit Product
                          </button>
                          <button onClick={() => { if(window.confirm('Delete this product?')) { deleteProduct(p.id); setMenuProductId(null) } }}
                            style={{ width: '100%', padding: '11px 14px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--red)', fontWeight: 600 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--red-light)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { l: hi ? 'खरीद' : 'Purchase', v: fmtFull(p.purchasePrice) },
                    { l: hi ? 'बिक्री' : 'Selling', v: fmtFull(p.sellingPrice), green: true },
                    { l: hi ? 'स्टॉक मूल्य' : 'Stock Value', v: fmtFull(p.stock * p.purchasePrice) },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg)', borderRadius: 9, padding: '7px 9px' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{s.l}</div>
                      <div style={{ fontWeight: 700, fontSize: 12, color: s.green ? 'var(--green)' : 'var(--text-primary)' }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <button onClick={() => setShowAddProduct(true)} style={{
        position: 'fixed', bottom: 88, right: 20, width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--saffron), #FF8C42)', border: 'none', cursor: 'pointer', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-saffron)', zIndex: 50,
      }}><Plus size={24} /></button>

      {showAddProduct && <AddProductModal onClose={() => setShowAddProduct(false)} />}
      {showEditModal && <AddProductModal product={showEditModal} onClose={() => setShowEditModal(null)} />}
    </div>
  )
}

// ── Product Detail + Stock IN/OUT ─────────────────────────────────────────────
function ProductDetailScreen({ product, onBack }) {
  const { stockMovements, stockIn, stockOut, updateProduct, language } = useApp()
  const hi = language === 'hi'
  const [showStockModal, setShowStockModal] = useState(null) // 'in' | 'out' | null
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [rate, setRate] = useState('')
  const [error, setError] = useState('')

  const prodMovements = stockMovements.filter(m => m.productId === product.id).slice(0, 20)
  const currentProduct = { ...product }

  const handleStock = () => {
    if (!qty || Number(qty) <= 0) { setError('Enter valid quantity'); return }
    if (showStockModal === 'in') stockIn(product.id, qty, note || `Stock in`, rate || currentProduct.purchasePrice)
    else stockOut(product.id, qty, note || `Stock out`, rate || currentProduct.sellingPrice)
    setShowStockModal(null); setQty(''); setNote(''); setRate(''); setError('')
    onBack()
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', padding: '20px 16px 24px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white' }}>{product.name}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{product.category}</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: product.stock <= product.lowStockAlert ? '#F87171' : '#4ADE80' }}>{product.stock}</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>{product.unit}s in stock</div>
            {product.stock <= product.lowStockAlert && <div style={{ color: '#F87171', fontSize: 11, marginTop: 4, fontWeight: 700 }}>⚠️ Below reorder level</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{hi ? 'खरीद भाव' : 'Purchase Rate'}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'white' }}>{fmtFull(product.purchasePrice)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{hi ? 'बेचने का भाव' : 'Selling Rate'}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#4ADE80' }}>{fmtFull(product.sellingPrice)}</div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowStockModal('in')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#16A34A', color: 'white', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <TrendingUp size={16} /> {hi ? 'स्टॉक आया' : 'Stock IN'}
          </button>
          <button onClick={() => setShowStockModal('out')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#DC2626', color: 'white', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <TrendingDown size={16} /> {hi ? 'स्टॉक गया' : 'Stock OUT'}
          </button>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          {hi ? 'स्टॉक इतिहास' : 'Stock Movement History'}
        </h3>
        {prodMovements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <Package size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
            <p>No movements yet</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            {prodMovements.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < prodMovements.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: m.type === 'in' ? 'var(--green-light)' : 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {m.type === 'in' ? <TrendingUp size={16} color="var(--green)" /> : <TrendingDown size={16} color="var(--red)" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{m.note}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.date} · Rate: {fmtFull(m.rate)}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: m.type === 'in' ? 'var(--green)' : 'var(--red)' }}>
                  {m.type === 'in' ? '+' : '-'}{m.qty}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock IN/OUT Modal */}
      {showStockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowStockModal(null)}>
          <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: showStockModal === 'in' ? 'var(--green)' : 'var(--red)' }}>
                {showStockModal === 'in' ? (hi ? '📦 स्टॉक आया' : '📦 Stock IN') : (hi ? '📤 स्टॉक गया' : '📤 Stock OUT')}
              </h3>
              <button onClick={() => setShowStockModal(null)} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{product.name} · Current: {product.stock} {product.unit}s</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? 'मात्रा *' : 'Quantity *'}</label>
                <input className="input-field" type="number" placeholder="0" style={{ fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700 }}
                  value={qty} onChange={e => { setQty(e.target.value); setError('') }} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? 'दर ₹ (वैकल्पिक)' : 'Rate ₹ (optional)'}</label>
                <input className="input-field" type="number" placeholder={showStockModal === 'in' ? String(product.purchasePrice) : String(product.sellingPrice)}
                  value={rate} onChange={e => setRate(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? 'नोट' : 'Note'}</label>
                <input className="input-field" placeholder={showStockModal === 'in' ? 'e.g. Purchase from supplier' : 'e.g. Sale to customer'}
                  value={note} onChange={e => setNote(e.target.value)} />
              </div>
              {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
              <button onClick={handleStock} style={{
                width: '100%', padding: 14, borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'white',
                background: showStockModal === 'in' ? 'var(--green)' : 'var(--red)',
              }}>
                {showStockModal === 'in' ? (hi ? 'स्टॉक जोड़ें ✓' : 'Add Stock ✓') : (hi ? 'स्टॉक कम करें ✓' : 'Reduce Stock ✓')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Add Product Modal ─────────────────────────────────────────────────────────
function AddProductModal({ product, onClose }) {
  const { addProduct, updateProduct, language } = useApp()
  const hi = language === 'hi'
  const isEdit = !!product
  const [form, setForm] = useState(product ? { ...product, purchasePrice: String(product.purchasePrice), sellingPrice: String(product.sellingPrice || ''), stock: String(product.stock), lowStockAlert: String(product.lowStockAlert) } : { name: '', category: '', unit: 'bag', purchasePrice: '', sellingPrice: '', stock: '', lowStockAlert: '10' })
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!form.name.trim()) { setError('Product name required'); return }
    if (!form.purchasePrice) { setError('Purchase price required'); return }
    if (isEdit) {
      updateProduct(product.id, { ...form, purchasePrice: Number(form.purchasePrice), sellingPrice: Number(form.sellingPrice) || 0, stock: Number(form.stock) || 0, lowStockAlert: Number(form.lowStockAlert) || 10 })
    } else {
      addProduct({ ...form, purchasePrice: Number(form.purchasePrice), sellingPrice: Number(form.sellingPrice) || 0, stock: Number(form.stock) || 0, lowStockAlert: Number(form.lowStockAlert) || 10 })
    }
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)' }}>
            {isEdit ? 'Edit Product' : (hi ? 'नया प्रोडक्ट जोड़ें' : 'Add New Product')}
          </h3>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'name', label: 'Product Name *', labelHi: 'प्रोडक्ट का नाम *', placeholder: 'e.g. Basmati Rice 25kg' },
            { key: 'category', label: 'Category', labelHi: 'श्रेणी', placeholder: 'e.g. Rice, Pulses, Oil' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? f.labelHi : f.label}</label>
              <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? 'इकाई' : 'Unit'}</label>
            <select className="input-field" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
              {['bag', 'kg', 'tin', 'box', 'piece', 'litre', 'quintal'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { key: 'purchasePrice', label: 'Purchase Price ₹', labelHi: 'खरीद भाव ₹' },
              { key: 'sellingPrice', label: 'Selling Price ₹ (optional)', labelHi: 'बेचने का भाव ₹ (वैकल्पिक)' },
              { key: 'stock', label: 'Opening Stock', labelHi: 'शुरुआती स्टॉक' },
              { key: 'lowStockAlert', label: 'Low Stock Alert', labelHi: 'कम स्टॉक अलर्ट' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? f.labelHi : f.label}</label>
                <input className="input-field" type="number" placeholder="0" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
          <button className="btn-primary" style={{ width: '100%' }} onClick={handleSave}>
            {isEdit ? 'Save Changes ✓' : (hi ? 'प्रोडक्ट जोड़ें ✓' : 'Add Product ✓')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reports Screen ────────────────────────────────────────────────────────────
export function ReportsScreen() {
  const { stats, transactions, parties, products, invoices, language } = useApp()
  // invoices may be undefined on first render
  const safeInvoices = invoices || []
  const hi = language === 'hi'

  const totalSales = transactions.filter(t => t.type === 'sale').reduce((s, t) => s + t.amount, 0)
  const totalPurchases = transactions.filter(t => t.type === 'purchase').reduce((s, t) => s + t.amount, 0)
  const totalReceipts = transactions.filter(t => t.type === 'receipt').reduce((s, t) => s + t.amount, 0)
  const grossProfit = totalSales - totalPurchases
  const profitMargin = totalSales > 0 ? Math.round((grossProfit / totalSales) * 100) : 0

  const topCustomers = (parties || [])
    .filter(p => p.type === 'customer' && p.balance > 0)
    .sort((a, b) => b.balance - a.balance).slice(0, 5)

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', padding: '24px 16px 28px', borderRadius: '0 0 24px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>
          {hi ? 'बिज़नेस रिपोर्ट' : 'Business Reports'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{hi ? 'सभी डेटा का सारांश' : 'Complete business overview'}</p>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* P&L Summary */}
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--indigo)' }}>
            📈 {hi ? 'मुनाफा-नुकसान' : 'Profit & Loss'}
          </h3>
          {[
            { l: hi ? 'कुल बिक्री' : 'Total Sales', v: fmtFull(totalSales), color: 'var(--green)' },
            { l: hi ? 'कुल खरीद' : 'Total Purchases', v: fmtFull(totalPurchases), color: 'var(--red)' },
            { l: hi ? 'भुगतान मिला' : 'Cash Received', v: fmtFull(totalReceipts), color: 'var(--indigo)' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border-light)', fontSize: 14 }}>
              <span style={{ color: 'var(--text-secondary)' }}>{r.l}</span>
              <span style={{ fontWeight: 700, color: r.color }}>{r.v}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, background: grossProfit >= 0 ? 'var(--green-light)' : 'var(--red-light)', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: grossProfit >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 15 }}>{hi ? 'कुल मुनाफा' : 'Gross Profit'}</span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: grossProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmtFull(Math.abs(grossProfit))}</div>
              <div style={{ fontSize: 12, color: grossProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>Margin: {profitMargin}%</div>
            </div>
          </div>
        </div>

        {/* Outstanding Summary */}
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'var(--indigo)' }}>
            ⏳ {hi ? 'बकाया सारांश' : 'Outstanding Summary'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { l: hi ? 'पाना है' : 'To Receive', v: fmtFull(stats.totalReceivable), color: 'var(--green)', bg: 'var(--green-light)' },
              { l: hi ? 'देना है' : 'To Pay', v: fmtFull(stats.totalPayable), color: 'var(--red)', bg: 'var(--red-light)' },
              { l: hi ? 'बकाया इनवॉइस' : 'Unpaid Invoices', v: String(stats.unpaidInvoices), color: 'var(--amber)', bg: 'var(--amber-light)' },
              { l: hi ? 'स्टॉक मूल्य' : 'Stock Value', v: fmtFull(stats.stockValue), color: 'var(--indigo)', bg: 'var(--indigo-light)' },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: s.color, opacity: 0.8, marginBottom: 4 }}>{s.l}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: s.color }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Outstanding Customers */}
        {topCustomers.length > 0 && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--indigo)' }}>
                🏆 {hi ? 'टॉप बकायेदार ग्राहक' : 'Top Outstanding Customers'}
              </h3>
            </div>
            {topCustomers.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: i < topCustomers.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: 'var(--indigo)' }}>{i + 1}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.city}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--green)' }}>{fmtFull(p.balance)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Export Buttons */}
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--indigo)' }}>
            📥 {hi ? 'डेटा एक्सपोर्ट करें' : 'Export Data (CSV/Excel)'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: hi ? 'पार्टी लिस्ट' : 'Parties List', labelHi: 'पार्टी लिस्ट', emoji: '👥', action: () => exportParties(parties) },
              { label: hi ? 'सभी लेन-देन' : 'All Transactions', emoji: '💰', action: () => exportTransactions(transactions, parties) },
              { label: hi ? 'इनवॉइस रिपोर्ट' : 'Invoices Report', emoji: '🧾', action: () => exportInvoices(safeInvoices, parties) },
              { label: hi ? 'इन्वेंटरी रिपोर्ट' : 'Inventory Report', emoji: '📦', action: () => exportInventory(products) },
              { label: hi ? 'बकाया रिपोर्ट' : 'Outstanding Report', emoji: '⏳', action: () => exportOutstandingReport(parties, transactions) },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', fontSize: 14, padding: '12px 14px' }}>
                <span style={{ fontSize: 18 }}>{btn.emoji}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{btn.label}</span>
                <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>↓ CSV</span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
            CSV files open in Excel, Google Sheets — free!
          </p>
        </div>

        {/* Premium upsell */}
        <div className="card" style={{ padding: 20, textAlign: 'center', background: 'linear-gradient(135deg, var(--saffron-light), var(--indigo-light))', border: 'none' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👑</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--indigo)', marginBottom: 6 }}>
            {hi ? 'PDF रिपोर्ट डाउनलोड करें' : 'Download PDF Reports'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 14 }}>
            {hi ? 'GST रिपोर्ट, P&L, कैश फ्लो — Premium में' : 'GST report, P&L, Cash flow — in Premium'}
          </p>
          <button className="btn-primary" style={{ margin: '0 auto' }}>Upgrade to Premium — ₹299/mo</button>
        </div>
      </div>
    </div>
  )
}
// This file extended — exports added above
