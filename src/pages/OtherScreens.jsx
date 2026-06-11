import React, { useState } from 'react'
import { exportParties, exportTransactions, exportInvoices, exportInventory, exportOutstandingReport } from '../utils/exportUtils'
import { useApp } from '../context/AppContext'
import { Package, AlertTriangle, Plus, TrendingUp, TrendingDown, ArrowLeft, BarChart2, Edit2, Trash2, FileText, Download } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

// ── Inventory Screen ──────────────────────────────────────────────────────────
export function InventoryScreen() {
  const { products, stockMovements, stockIn, stockOut, addProduct, updateProduct, deleteProduct, language, transactions } = useApp()
  const hi = language === 'hi'
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showEditModal, setShowEditModal] = useState(null)
  const [menuProductId, setMenuProductId] = useState(null)
  const [stockView, setStockView] = useState('all') // all | fast | slow | dead

  // Compute coverage days and movement category per product
  const thisMonth = new Date().getMonth()
  const thisYear  = new Date().getFullYear()
  const productStats = {}
  products.forEach(p => {
    const monthlySalesTxns = (transactions || []).filter(t => {
      const d = new Date(t.date)
      return t.type === 'sale' && d.getMonth() === thisMonth && d.getFullYear() === thisYear
    })
    const movs = (stockMovements || []).filter(m => m.productId === p.id && m.type === 'out')
    const lastSale = movs.sort((a,b) => new Date(b.date)-new Date(a.date))[0]
    const monthlyOut = movs.filter(m => { const d = new Date(m.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear }).reduce((s,m) => s+m.qty, 0)
    const avgDaily = monthlyOut / 30
    const coverage = avgDaily > 0 ? Math.round(p.stock / avgDaily) : null
    const daysSinceLastSale = lastSale ? Math.floor((new Date() - new Date(lastSale.date)) / (1000*60*60*24)) : null
    let category = 'slow'
    if (monthlyOut > 20) category = 'fast'
    else if (daysSinceLastSale === null || daysSinceLastSale > 60) category = 'dead'
    productStats[p.id] = { coverage, monthlyOut, lastSale: lastSale?.date, daysSinceLastSale, category }
  })
  const [search, setSearch] = useState('')

  if (selectedProduct) return <ProductDetailScreen product={selectedProduct} onBack={() => setSelectedProduct(null)} />

  const lowStock = products.filter(p => p.stock <= p.lowStockAlert)
  const totalValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0)
  const categories = ['all', ...new Set(products.map(p => p.category))]

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.category === filter
    const pStat = productStats[p.id] || {}
    const matchView = stockView === 'all' || (stockView === 'low' && p.stock <= p.lowStockAlert) || (stockView === 'fast' && pStat.category === 'fast') || (stockView === 'slow' && pStat.category === 'slow') || (stockView === 'dead' && pStat.category === 'dead')
    return matchSearch && matchFilter && matchView
  })

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'var(--brand)', padding: '24px 16px 20px', borderRadius: '0 0 24px 24px' }}>
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
        {/* Stock Movement Filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 10 }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'fast', label: 'Fast Moving' },
            { id: 'slow', label: 'Slow Moving' },
            { id: 'dead', label: 'Dead Stock' },
            { id: 'low', label: 'Low Stock' },
          ].map(f => (
            <button key={f.id} onClick={() => setStockView(f.id)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: stockView === f.id ? 'none' : '1px solid var(--border)', background: stockView === f.id ? (f.id === 'low' || f.id === 'dead' ? 'var(--red)' : f.id === 'slow' ? 'var(--amber)' : 'var(--saffron)') : 'white', color: stockView === f.id ? 'white' : 'var(--text-secondary)' }}>
              {f.label}
            </button>
          ))}
        </div>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 14 }}>
          {[{ id: 'all', label: 'All' }, ...categories.map(c => ({ id: c, label: c }))].filter(f => f.id !== 'all' || true).map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: filter === f.id ? 'none' : '1px solid var(--border)', background: filter === f.id ? 'var(--indigo)' : 'white', color: filter === f.id ? 'white' : 'var(--text-secondary)' }}>
              {f.label === 'all' ? 'All Categories' : f.label}
            </button>
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
                {/* Coverage days if available */}
                {(() => {
                  const pStat = productStats[p.id] || {}
                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                      {[
                        { l: 'Purchase', v: fmtFull(p.purchasePrice) },
                        { l: 'Selling', v: fmtFull(p.sellingPrice || 0), green: true },
                        { l: 'Last Sale', v: pStat.lastSale ? `${pStat.daysSinceLastSale}d ago` : 'None' },
                        { l: 'Coverage', v: pStat.coverage !== null ? `${pStat.coverage}d` : '—', warn: pStat.coverage !== null && pStat.coverage < 10 },
                      ].map((s, i) => (
                        <div key={i} style={{ background: s.warn ? 'var(--red-light)' : 'var(--bg)', borderRadius: 9, padding: '7px 6px' }}>
                          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>{s.l}</div>
                          <div style={{ fontWeight: 700, fontSize: 11, color: s.warn ? 'var(--red)' : s.green ? 'var(--green)' : 'var(--text-primary)' }}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
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
      <div style={{ background: 'var(--brand)', padding: '20px 16px 24px', borderRadius: '0 0 24px 24px' }}>
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
function generateReportPDF(title, data, business) {
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>${title}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;color:#0F172A;background:white}.page{max-width:800px;margin:0 auto;padding:32px}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #1E3A5F}.biz{font-size:22px;font-weight:800;color:#1E3A5F}.title{font-size:28px;font-weight:800;color:#F97316;text-align:right}table{width:100%;border-collapse:collapse;margin:16px 0}thead tr{background:#1E3A5F;color:white}th{padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase}td{padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:13px}tr:nth-child(even){background:#f8fafc}.total{background:#1E3A5F;color:white;font-weight:800}.btn{background:#F97316;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:700;margin-right:8px}@media print{.no-print{display:none}}</style>
</head><body><div class="page">
<div class="no-print" style="text-align:right;margin-bottom:20px">
<button class="btn" onclick="window.print()">🖨️ Print / Save PDF</button>
<button onclick="window.close()" style="background:#f1f5f9;border:none;padding:10px 16px;border-radius:8px;cursor:pointer">✕</button>
</div>
<div class="header"><div><div class="biz">${business?.name || 'Business'}</div><div style="font-size:12px;color:#64748b;margin-top:4px">${business?.address || ''} | GSTIN: ${business?.gstin || 'N/A'}</div></div><div><div class="title">${title}</div><div style="text-align:right;font-size:13px;color:#64748b;margin-top:4px">Generated: ${new Date().toLocaleDateString('en-IN')}</div></div></div>
${data}
<div style="text-align:center;margin-top:24px;font-size:11px;color:#cbd5e1">Generated by HisaabPro — Smart Business Ledger</div>
</div></body></html>`
  const win = window.open('','_blank','width=900,height=700')
  win.document.write(html)
  win.document.close()
}

export function ReportsScreen() {
  const { stats, transactions, parties, products, invoices, language, business } = useApp()
  const safeInvoices = invoices || []
  const hi = language === 'hi'
  const [period, setPeriod] = React.useState('all') // all | month | year
  const [activeReport, setActiveReport] = React.useState('pl') // pl | gst | monthly

  const now = new Date()
  const filterByPeriod = (txns) => txns.filter(t => {
    if (period === 'all') return true
    const d = new Date(t.date)
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    if (period === 'year') return d.getFullYear() === now.getFullYear()
    return true
  })

  const filteredTxns = filterByPeriod(transactions)
  const totalSales = filteredTxns.filter(t => t.type === 'sale').reduce((s, t) => s + t.amount, 0)
  const totalPurchases = filteredTxns.filter(t => t.type === 'purchase').reduce((s, t) => s + t.amount, 0)
  const totalReceipts = filteredTxns.filter(t => t.type === 'receipt').reduce((s, t) => s + t.amount, 0)
  const grossProfit = totalSales - totalPurchases
  const profitMargin = totalSales > 0 ? Math.round((grossProfit / totalSales) * 100) : 0

  // GST Data
  const gstRate = business?.gstRate || 5
  const gstOnSales = business?.gstEnabled ? Math.round(totalSales * gstRate / (100 + gstRate)) : 0
  const gstOnPurchases = business?.gstEnabled ? Math.round(totalPurchases * gstRate / (100 + gstRate)) : 0
  const netGST = gstOnSales - gstOnPurchases

  // Monthly breakdown
  const monthlyData = {}
  filteredTxns.forEach(t => {
    const key = new Date(t.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    if (!monthlyData[key]) monthlyData[key] = { sales: 0, purchases: 0, receipts: 0 }
    if (t.type === 'sale') monthlyData[key].sales += t.amount
    if (t.type === 'purchase') monthlyData[key].purchases += t.amount
    if (t.type === 'receipt') monthlyData[key].receipts += t.amount
  })

  const topCustomers = (parties || []).filter(p => p.type === 'customer' && p.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5)

  const handlePrintPL = () => {
    const rows = `<table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>
    <tr><td>Total Sales</td><td style="color:#059669;font-weight:700">₹${totalSales.toLocaleString('en-IN')}</td></tr>
    <tr><td>Total Purchases</td><td style="color:#DC2626;font-weight:700">₹${totalPurchases.toLocaleString('en-IN')}</td></tr>
    <tr><td>Cash Received</td><td style="color:#2563EB;font-weight:700">₹${totalReceipts.toLocaleString('en-IN')}</td></tr>
    <tr class="total"><td>Gross Profit</td><td>₹${Math.abs(grossProfit).toLocaleString('en-IN')} (${profitMargin}%)</td></tr>
    </tbody></table>`
    generateReportPDF('Profit & Loss Report', rows, business)
  }

  const handlePrintGST = () => {
    const rows = `<table><thead><tr><th>Description</th><th>Taxable Amount</th><th>GST @ ${gstRate}%</th></tr></thead><tbody>
    <tr><td>Sales (Output GST)</td><td>₹${(totalSales - gstOnSales).toLocaleString('en-IN')}</td><td style="color:#059669;font-weight:700">₹${gstOnSales.toLocaleString('en-IN')}</td></tr>
    <tr><td>Purchases (Input GST)</td><td>₹${(totalPurchases - gstOnPurchases).toLocaleString('en-IN')}</td><td style="color:#DC2626;font-weight:700">₹${gstOnPurchases.toLocaleString('en-IN')}</td></tr>
    <tr class="total"><td>Net GST Payable</td><td></td><td>₹${netGST.toLocaleString('en-IN')}</td></tr>
    </tbody></table>`
    generateReportPDF('GST Report', rows, business)
  }

  const handlePrintMonthly = () => {
    const rows = `<table><thead><tr><th>Month</th><th>Sales</th><th>Purchases</th><th>Received</th><th>Profit</th></tr></thead><tbody>
    ${Object.entries(monthlyData).map(([month, d]) => `<tr><td>${month}</td><td style="color:#059669">₹${d.sales.toLocaleString('en-IN')}</td><td style="color:#DC2626">₹${d.purchases.toLocaleString('en-IN')}</td><td style="color:#2563EB">₹${d.receipts.toLocaleString('en-IN')}</td><td style="font-weight:700">₹${(d.sales-d.purchases).toLocaleString('en-IN')}</td></tr>`).join('')}
    </tbody></table>`
    generateReportPDF('Monthly Report', rows, business)
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'var(--brand)', padding: '24px 16px 20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white' }}>
            {hi ? 'बिज़नेस रिपोर्ट' : 'Business Reports'}
          </h2>
        </div>
        {/* Period Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { id: 'month', label: 'This Month' },
            { id: 'year',  label: 'This Year' },
            { id: 'all',   label: 'All Time' },
          ].map(p => (
            <button key={p.id} onClick={() => setPeriod(p.id)} style={{
              padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: period === p.id ? 'none' : '1px solid rgba(255,255,255,0.3)',
              background: period === p.id ? 'var(--saffron)' : 'rgba(255,255,255,0.1)',
              color: 'white',
            }}>{p.label}</button>
          ))}
        </div>
        {/* Report Type Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 3 }}>
          {[
            { id: 'pl', label: 'P & L' },
            { id: 'gst', label: 'GST' },
            { id: 'monthly', label: 'Monthly' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveReport(tab.id)} style={{
              flex: 1, padding: '9px 4px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
              background: activeReport === tab.id ? 'white' : 'transparent',
              color: activeReport === tab.id ? 'var(--indigo)' : 'rgba(255,255,255,0.7)',
              transition: 'all 0.2s',
            }}>{tab.label}</button>
          ))}
        </div>
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

        {/* PDF Print Buttons */}
        <div className="card" style={{ padding: 16, display: 'flex', gap: 10 }}>
          <button onClick={handlePrintPL} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--indigo)', color: 'white', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FileText size={14} /> P&L PDF
          </button>
          <button onClick={handlePrintGST} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#059669', color: 'white', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Download size={14} /> GST PDF
          </button>
          <button onClick={handlePrintMonthly} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--saffron)', color: 'white', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FileText size={14} /> Monthly
          </button>
        </div>

        {/* GST Report */}
        {activeReport === 'gst' && (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--indigo)' }}>🧾 GST Summary</h3>
              <button onClick={handlePrintGST} className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}><Download size={13} /> PDF</button>
            </div>
            {business?.gstEnabled ? (
              <>
                {[
                  { l: `Output GST (on Sales @ ${gstRate}%)`, v: fmtFull(gstOnSales), color: 'var(--red)' },
                  { l: `Input GST (on Purchases @ ${gstRate}%)`, v: fmtFull(gstOnPurchases), color: 'var(--green)' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: 14 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.l}</span>
                    <span style={{ fontWeight: 700, color: r.color }}>{r.v}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, background: netGST >= 0 ? 'var(--red-light)' : 'var(--green-light)', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: netGST >= 0 ? 'var(--red)' : 'var(--green)', fontSize: 15 }}>Net GST {netGST >= 0 ? 'Payable' : 'Refund'}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: netGST >= 0 ? 'var(--red)' : 'var(--green)' }}>{fmtFull(Math.abs(netGST))}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
                  ℹ️ Share with your CA. Enable GST in Settings → Business Profile.
                </p>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🧾</div>
                <p style={{ fontWeight: 600 }}>GST not enabled</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Go to Settings → Business Profile → Enable GST</p>
              </div>
            )}
          </div>
        )}

        {/* Monthly Report */}
        {activeReport === 'monthly' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 10px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--indigo)' }}>📅 Monthly Breakdown</h3>
              <button onClick={handlePrintMonthly} className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}><Download size={13} /> PDF</button>
            </div>
            {Object.entries(monthlyData).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)' }}>No data for selected period</div>
            ) : (
              Object.entries(monthlyData).reverse().map(([month, d], i) => (
                <div key={month} style={{ padding: '12px 16px', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--text-primary)' }}>{month}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[
                      { l: 'Sales', v: fmtFull(d.sales), c: 'var(--green)' },
                      { l: 'Purchase', v: fmtFull(d.purchases), c: 'var(--red)' },
                      { l: 'Profit', v: fmtFull(d.sales - d.purchases), c: d.sales >= d.purchases ? 'var(--green)' : 'var(--red)' },
                    ].map((s, j) => (
                      <div key={j} style={{ background: 'var(--bg)', borderRadius: 10, padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{s.l}</div>
                        <div style={{ fontWeight: 700, fontSize: 12, color: s.c }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

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

        {/* Export Buttons - Excel + PDF */}
        <div className="card" style={{ padding: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--indigo)' }}>
            📥 {hi ? 'एक्सपोर्ट करें' : 'Export Reports'}
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Excel (CSV) + PDF — dono available</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Parties List',       emoji: '👥', csvFn: () => exportParties(parties),                          pdfFn: null },
              { label: 'All Transactions',   emoji: '💰', csvFn: () => exportTransactions(transactions, parties),       pdfFn: handlePrintPL },
              { label: 'Invoices Report',    emoji: '🧾', csvFn: () => exportInvoices(safeInvoices, parties),           pdfFn: null },
              { label: 'Inventory Report',   emoji: '📦', csvFn: () => exportInventory(products),                       pdfFn: null },
              { label: 'Outstanding Report', emoji: '⏳', csvFn: () => exportOutstandingReport(parties, transactions),  pdfFn: null },
              { label: 'P&L Report',         emoji: '📈', csvFn: () => exportTransactions(transactions, parties),       pdfFn: handlePrintPL },
              { label: 'GST Report',         emoji: '🧾', csvFn: null,                                                  pdfFn: handlePrintGST },
              { label: 'Monthly Report',     emoji: '📅', csvFn: null,                                                  pdfFn: handlePrintMonthly },
            ].map((btn, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', borderRadius: 12, border: '1px solid var(--border)', background: 'white' }}>
                <span style={{ fontSize: 18 }}>{btn.emoji}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{btn.label}</span>
                {btn.csvFn && (
                  <button onClick={btn.csvFn} style={{ background: 'var(--green-light)', border: 'none', borderRadius: 8, padding: '5px 10px', color: 'var(--green)', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                    📊 Excel
                  </button>
                )}
                {btn.pdfFn && (
                  <button onClick={btn.pdfFn} style={{ background: 'var(--red-light)', border: 'none', borderRadius: 8, padding: '5px 10px', color: 'var(--red)', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
                    📄 PDF
                  </button>
                )}
              </div>
            ))}
          </div>
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
