import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Plus, Search, CheckCircle, Clock, Truck, Package, AlertCircle } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`
const today = () => new Date().toISOString().split('T')[0]

const SEED_POS = [
  { id: 'PO001', poNo: 'PO-2026-005', supplierId: 'P005', date: '2026-06-05', expectedDate: '2026-06-10', status: 'received', totalAmount: 55000, items: [{ name: 'Basmati Rice 25kg', qty: 50, rate: 1100, amount: 55000 }], notes: 'Urgent order' },
  { id: 'PO002', poNo: 'PO-2026-004', supplierId: 'P006', date: '2026-06-03', expectedDate: '2026-06-08', status: 'partial',  totalAmount: 30000, items: [{ name: 'Toor Dal 50kg', qty: 6, rate: 5000, amount: 30000 }], notes: '' },
  { id: 'PO003', poNo: 'PO-2026-006', supplierId: 'P005', date: '2026-06-09', expectedDate: '2026-06-14', status: 'pending',  totalAmount: 42000, items: [{ name: 'Sona Masoori Rice 25kg', qty: 40, rate: 950, amount: 38000 }, { name: 'Mustard Oil 15L', qty: 2, rate: 1750, amount: 3500 }], notes: 'Monthly restock' },
]

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  labelHi: 'लंबित',    color: 'var(--amber)', bg: 'var(--amber-light)', icon: <Clock size={12}/> },
  partial:  { label: 'Partial',  labelHi: 'आंशिक',   color: 'var(--indigo)', bg: 'var(--indigo-light)', icon: <Truck size={12}/> },
  received: { label: 'Received', labelHi: 'प्राप्त',  color: 'var(--green)', bg: 'var(--green-light)', icon: <CheckCircle size={12}/> },
  cancelled:{ label: 'Cancelled',labelHi: 'रद्द',    color: 'var(--red)',   bg: 'var(--red-light)',   icon: <AlertCircle size={12}/> },
}

export default function PurchaseOrderScreen() {
  const { parties, products, language, currentUser } = useApp()
  const hi = language === 'hi'

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('hisaabpro_po')
    return saved ? JSON.parse(saved) : SEED_POS
  })
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedPO, setSelectedPO] = useState(null)

  const saveOrders = (newOrders) => {
    setOrders(newOrders)
    localStorage.setItem('hisaabpro_po', JSON.stringify(newOrders))
  }

  const updateStatus = (id, status) => {
    saveOrders(orders.map(o => o.id === id ? { ...o, status } : o))
    setSelectedPO(prev => prev ? { ...prev, status } : null)
  }

  const suppliers = parties.filter(p => p.type === 'supplier' || p.type === 'both')

  const nextPONo = () => {
    const nums = orders.map(o => parseInt(o.poNo.split('-')[2] || 0)).filter(Boolean)
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 7
    return `PO-2026-${String(next).padStart(3, '0')}`
  }

  const filtered = orders.filter(o => filter === 'all' || o.status === filter)
  const pendingValue = orders.filter(o => o.status === 'pending').reduce((s, o) => s + o.totalAmount, 0)
  const pendingCount = orders.filter(o => o.status === 'pending').length

  if (selectedPO) return <PODetailScreen po={selectedPO} parties={parties} onBack={() => setSelectedPO(null)} onUpdateStatus={updateStatus} />
  if (showCreate) return <CreatePOScreen suppliers={suppliers} products={products} nextPONo={nextPONo()} onBack={() => setShowCreate(false)}
    onSave={po => { saveOrders([{ ...po, id: `PO${Date.now()}` }, ...orders]); setShowCreate(false) }} />

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', padding: '24px 16px 20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white' }}>
              {hi ? 'खरीद ऑर्डर' : 'Purchase Orders'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 }}>{hi ? 'सप्लायर को ऑर्डर' : 'Orders to suppliers'}</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 12, padding: '9px 14px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={15} /> {hi ? 'नया PO' : 'New PO'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: hi ? 'कुल ऑर्डर' : 'Total Orders', value: orders.length, color: 'white' },
            { label: hi ? 'लंबित' : 'Pending', value: pendingCount, color: '#FCD34D' },
            { label: hi ? 'लंबित राशि' : 'Pending Value', value: pendingValue >= 1000 ? `₹${(pendingValue/1000).toFixed(0)}K` : fmtFull(pendingValue), color: '#FCD34D' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
          {[{ id: 'all', l: 'All' }, { id: 'pending', l: 'Pending' }, { id: 'partial', l: 'Partial' }, { id: 'received', l: 'Received' }].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              border: filter === f.id ? 'none' : '1px solid var(--border)',
              background: filter === f.id ? '#7C3AED' : 'white',
              color: filter === f.id ? 'white' : 'var(--text-secondary)',
            }}>{f.l}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 600 }}>No purchase orders</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ margin: '16px auto 0' }}>
              <Plus size={16} /> Create First PO
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(po => {
              const supplier = parties.find(p => p.id === po.supplierId)
              const sc = STATUS_CONFIG[po.status] || STATUS_CONFIG.pending
              const isOverdue = po.status === 'pending' && new Date(po.expectedDate) < new Date()
              return (
                <div key={po.id} className="card" onClick={() => setSelectedPO(po)}
                  style={{ padding: '14px 16px', cursor: 'pointer', border: isOverdue ? '1px solid #FCA5A5' : '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#7C3AED' }}>{po.poNo}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2 }}>{supplier?.name || '—'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{fmtFull(po.totalAmount)}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: sc.bg, color: sc.color, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                        {sc.icon} {hi ? sc.labelHi : sc.label}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{po.items.length} item{po.items.length > 1 ? 's' : ''}</span>
                    <span style={{ color: isOverdue ? 'var(--red)' : 'var(--text-muted)', fontWeight: isOverdue ? 700 : 400 }}>
                      {isOverdue ? '⚠️ Overdue: ' : 'Expected: '}{po.expectedDate}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <button onClick={() => setShowCreate(true)} style={{ position: 'fixed', bottom: 88, right: 20, width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(124,58,237,0.4)', zIndex: 50 }}>
        <Plus size={24} />
      </button>
    </div>
  )
}

function PODetailScreen({ po, parties, onBack, onUpdateStatus }) {
  const { language } = useApp()
  const hi = language === 'hi'
  const supplier = parties.find(p => p.id === po.supplierId)
  const sc = STATUS_CONFIG[po.status] || STATUS_CONFIG.pending

  const handleWhatsApp = () => {
    const itemsList = po.items.map(i => `• ${i.name} × ${i.qty} @ ₹${i.rate}`).join('\n')
    const msg = encodeURIComponent(`Dear ${supplier?.name},\n\n*Purchase Order: ${po.poNo}*\nDate: ${po.date}\nExpected Delivery: ${po.expectedDate}\n\n*Items:*\n${itemsList}\n\n*Total: ₹${po.totalAmount.toLocaleString('en-IN')}*\n\nKindly confirm receipt.\n\nThank you 🙏`)
    window.open(`https://wa.me/91${supplier?.phone}?text=${msg}`, '_blank')
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', padding: '20px 16px 24px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white' }}>{po.poNo}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{supplier?.name}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {po.status === 'pending' && (
            <button onClick={() => onUpdateStatus(po.id, 'received')} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--green)', color: 'white', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <CheckCircle size={15} /> {hi ? 'प्राप्त हुआ' : 'Mark Received'}
            </button>
          )}
          {supplier?.phone && (
            <button onClick={handleWhatsApp} style={{ flex: 1, padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#25D366', color: 'white', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              📱 WhatsApp
            </button>
          )}
          {po.status !== 'cancelled' && po.status !== 'received' && (
            <button onClick={() => onUpdateStatus(po.id, 'cancelled')} style={{ padding: '11px 14px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'rgba(220,38,38,0.2)', color: 'white', fontWeight: 700, fontSize: 13 }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Supplier</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{supplier?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{supplier?.city} · {supplier?.phone}</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: sc.bg, color: sc.color, padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, height: 'fit-content' }}>
              {sc.icon} {hi ? sc.labelHi : sc.label}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[{ l: 'PO Date', v: po.date }, { l: 'Expected', v: po.expectedDate }].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg)', borderRadius: 10, padding: '8px 10px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{f.l}</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{f.v}</div>
              </div>
            ))}
          </div>
          {po.notes && <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg)', borderRadius: 10, padding: '8px 10px' }}>📝 {po.notes}</div>}
        </div>

        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <span>Item</span><span>Qty</span><span>Rate</span><span>Amount</span>
          </div>
          {po.items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, padding: '12px 16px', borderBottom: i < po.items.length - 1 ? '1px solid var(--border-light)' : 'none', fontSize: 13, alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{item.qty}</span>
              <span style={{ color: 'var(--text-muted)' }}>{fmtFull(item.rate)}</span>
              <span style={{ fontWeight: 700 }}>{fmtFull(item.amount)}</span>
            </div>
          ))}
          <div style={{ padding: '12px 16px', background: 'var(--bg)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--indigo)' }}>Total</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#7C3AED' }}>{fmtFull(po.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function CreatePOScreen({ suppliers, products, nextPONo, onBack, onSave }) {
  const { language } = useApp()
  const hi = language === 'hi'
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [supplierSearch, setSupplierSearch] = useState('')
  const [showSupplierList, setShowSupplierList] = useState(false)
  const [date, setDate] = useState(today())
  const [expectedDate, setExpectedDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().split('T')[0] })
  const [items, setItems] = useState([{ name: '', qty: 1, rate: 0, amount: 0 }])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(supplierSearch.toLowerCase()))

  const updateItem = (i, field, val) => {
    const newItems = [...items]
    newItems[i] = { ...newItems[i], [field]: val }
    if (field === 'productId') {
      const prod = products.find(p => p.id === val)
      if (prod) { newItems[i].name = prod.name; newItems[i].rate = prod.purchasePrice }
    }
    if (field === 'qty' || field === 'rate') newItems[i].amount = (Number(newItems[i].qty) || 0) * (Number(newItems[i].rate) || 0)
    setItems(newItems)
  }

  const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0)

  const handleSave = () => {
    if (!selectedSupplier) { setError('Please select a supplier'); return }
    if (items.every(i => !i.name)) { setError('Add at least one item'); return }
    onSave({ poNo: nextPONo, supplierId: selectedSupplier.id, date, expectedDate, status: 'pending', items: items.filter(i => i.name), totalAmount: total, notes })
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', padding: '20px 16px 24px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white' }}>
            {hi ? 'नया खरीद ऑर्डर' : `New Purchase Order`}
          </h2>
        </div>
        <div style={{ marginTop: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 14px', display: 'inline-block' }}>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>{nextPONo}</span>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Supplier */}
        <div className="card" style={{ padding: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Supplier *</label>
          {selectedSupplier ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F3E8FF', borderRadius: 12, padding: '12px 14px' }}>
              <div><div style={{ fontWeight: 700, color: '#7C3AED' }}>{selectedSupplier.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedSupplier.city}</div></div>
              <button onClick={() => setSelectedSupplier(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="input-field" style={{ paddingLeft: 36 }} placeholder="Search supplier..." value={supplierSearch}
                onChange={e => { setSupplierSearch(e.target.value); setShowSupplierList(true) }} onFocus={() => setShowSupplierList(true)} />
              {showSupplierList && supplierSearch && (
                <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'white', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', zIndex: 100, maxHeight: 180, overflowY: 'auto' }}>
                  {filteredSuppliers.slice(0, 5).map(s => (
                    <div key={s.id} onClick={() => { setSelectedSupplier(s); setSupplierSearch(''); setShowSupplierList(false) }}
                      style={{ padding: '12px 14px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid var(--border-light)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.city}</div>
                    </div>
                  ))}
                  {filteredSuppliers.length === 0 && <div style={{ padding: 12, color: 'var(--text-muted)', fontSize: 13 }}>No supplier found</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>PO Date</label>
              <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Expected Delivery</label>
              <input className="input-field" type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items *</label>
            <button onClick={() => setItems(p => [...p, { name: '', qty: 1, rate: 0, amount: 0 }])} style={{ background: '#F3E8FF', border: 'none', borderRadius: 8, padding: '5px 10px', color: '#7C3AED', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={13} /> Add Item
            </button>
          </div>
          {items.map((item, i) => (
            <div key={i} style={{ background: 'var(--bg)', borderRadius: 12, padding: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Item {i + 1}</span>
                {items.length > 1 && <button onClick={() => setItems(p => p.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 18 }}>×</button>}
              </div>
              <select className="input-field" style={{ marginBottom: 8, fontSize: 13 }} value={item.productId || ''} onChange={e => updateItem(i, 'productId', e.target.value)}>
                <option value="">-- Select product or type below --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {!item.productId && <input className="input-field" placeholder="Item name" style={{ marginBottom: 8, fontSize: 13 }} value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[{ f: 'qty', l: 'Qty' }, { f: 'rate', l: 'Rate ₹' }].map(({ f, l }) => (
                  <div key={f}>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>{l}</label>
                    <input className="input-field" type="number" placeholder="0" style={{ fontSize: 14, fontWeight: 700 }} value={item[f]} onChange={e => updateItem(i, f, e.target.value)} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Amount</label>
                  <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 10px', background: '#F3E8FF', fontSize: 13, fontWeight: 800, color: '#7C3AED' }}>{fmtFull(item.amount)}</div>
                </div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 4px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#7C3AED' }}>
            <span>Total</span><span>{fmtFull(total)}</span>
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Notes (optional)</label>
          <input className="input-field" placeholder="Delivery instructions, special notes..." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>⚠️ {error}</p>}
        <button onClick={handleSave} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'white', background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
          Create Purchase Order ✓
        </button>
      </div>
    </div>
  )
}
