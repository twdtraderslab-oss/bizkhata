import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Plus, Trash2, Search, FileText, CheckCircle, Clock, AlertCircle, Printer } from 'lucide-react'
import { printInvoice } from '../utils/pdfGenerator'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

// ── Invoice List ──────────────────────────────────────────────────────────────
export default function InvoicesScreen({ onNavigate }) {
  const { invoices, parties, language } = useApp()
  const hi = language === 'hi'
  const [filter, setFilter] = useState('all')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  if (selectedInvoice) return <InvoiceDetailScreen invoice={selectedInvoice} onBack={() => setSelectedInvoice(null)} />
  if (showCreate) return <CreateInvoiceScreen onBack={() => setShowCreate(false)} onDone={() => setShowCreate(false)} />

  const safeInvoices = invoices || []
  const filtered = safeInvoices.filter(inv => filter === 'all' || inv.status === filter)
  const totalUnpaid = safeInvoices.filter(i => i.status === 'unpaid').reduce((s, i) => s + i.totalAmount, 0)
  const totalPartial = safeInvoices.filter(i => i.status === 'partial').reduce((s, i) => s + i.totalAmount, 0)

  const statusConfig = {
    unpaid:  { label: 'Unpaid',  labelHi: 'बकाया',  color: 'var(--red)',   bg: 'var(--red-light)',   icon: <AlertCircle size={12}/> },
    partial: { label: 'Partial', labelHi: 'आंशिक',  color: 'var(--amber)', bg: 'var(--amber-light)', icon: <Clock size={12}/> },
    paid:    { label: 'Paid',    labelHi: 'चुकाया',  color: 'var(--green)', bg: 'var(--green-light)', icon: <CheckCircle size={12}/> },
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', padding: '24px 16px 20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white' }}>
            {hi ? 'इनवॉइस' : 'Invoices'}
          </h2>
          <button onClick={() => setShowCreate(true)} style={{ background: 'var(--saffron)', border: 'none', borderRadius: 12, padding: '9px 16px', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> {hi ? 'नई' : 'New'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginBottom: 4 }}>{hi ? 'बकाया' : 'Unpaid'}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#F87171' }}>{fmtFull(totalUnpaid)}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{safeInvoices.filter(i => i.status === 'unpaid').length} invoices</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginBottom: 4 }}>{hi ? 'आंशिक' : 'Partial'}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: '#FCD34D' }}>{fmtFull(totalPartial)}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>{safeInvoices.filter(i => i.status === 'partial').length} invoices</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'all', label: `All (${safeInvoices.length})` },
            { id: 'unpaid', label: 'Unpaid' },
            { id: 'partial', label: 'Partial' },
            { id: 'paid', label: 'Paid' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', border: filter === f.id ? 'none' : '1px solid var(--border)', background: filter === f.id ? 'var(--saffron)' : 'white', color: filter === f.id ? 'white' : 'var(--text-secondary)' }}>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
            <p style={{ fontWeight: 600 }}>No invoices</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ margin: '16px auto 0' }}>
              <Plus size={16} /> Create Invoice
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(inv => {
              const party = parties.find(p => p.id === inv.partyId)
              const sc = statusConfig[inv.status] || statusConfig.unpaid
              const overdue = inv.status !== 'paid' && new Date(inv.dueDate) < new Date()
              return (
                <div key={inv.id} className="card" onClick={() => setSelectedInvoice(inv)}
                  style={{ padding: '14px 16px', cursor: 'pointer', border: overdue ? '1px solid #FCA5A5' : '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--indigo)' }}>{inv.invoiceNo}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 2 }}>{party?.name || '—'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>{fmtFull(inv.totalAmount)}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: sc.bg, color: sc.color, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                        {sc.icon} {hi ? (sc.labelHi || sc.label) : sc.label}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                    <span>{inv.date}</span>
                    <span style={{ color: overdue ? 'var(--red)' : 'var(--text-muted)', fontWeight: overdue ? 700 : 400 }}>
                      {overdue ? '⚠️ Overdue: ' : 'Due: '}{inv.dueDate}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <button onClick={() => setShowCreate(true)} style={{ position: 'fixed', bottom: 88, right: 20, width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--saffron), #FF8C42)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-saffron)', zIndex: 50 }}>
        <Plus size={24} />
      </button>
    </div>
  )
}

// ── Invoice Detail ────────────────────────────────────────────────────────────
function InvoiceDetailScreen({ invoice, onBack }) {
  const { parties, business, updateInvoiceStatus, addTransaction, language, deleteInvoice, editInvoice } = useApp()
  const hi = language === 'hi'
  const party = parties.find(p => p.id === invoice.partyId)
  const [showEdit, setShowEdit] = useState(false)

  const handleMarkPaid = () => {
    updateInvoiceStatus(invoice.id, 'paid')
    addTransaction({ partyId: invoice.partyId, type: 'receipt', amount: invoice.totalAmount, balanceAfter: 0, note: `Payment for ${invoice.invoiceNo}`, billNo: invoice.invoiceNo, date: new Date().toISOString().split('T')[0] })
    onBack()
  }

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Dear ${party?.name},\n\n*Invoice: ${invoice.invoiceNo}*\nDate: ${invoice.date}\nDue: ${invoice.dueDate}\n\n*Amount Due: ${fmtFull(invoice.totalAmount)}*\n\nPlease make payment at your earliest.\n\n${business?.name}\n${business?.phone || ''}`)
    window.open(`https://wa.me/91${party?.phone}?text=${msg}`, '_blank')
  }

  const handlePrint = () => printInvoice(invoice, party, business)

  const statusColors = {
    unpaid:  { c: 'var(--red)',   bg: 'var(--red-light)' },
    partial: { c: 'var(--amber)', bg: 'var(--amber-light)' },
    paid:    { c: 'var(--green)', bg: 'var(--green-light)' },
  }
  const sc = statusColors[invoice.status] || statusColors.unpaid

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', padding: '20px 16px 24px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white' }}>{invoice.invoiceNo}</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{party?.name}</p>
          </div>
          {/* Edit button */}
          <button onClick={() => setShowEdit(true)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 18 }}>
            ✏️
          </button>
          {/* Delete button */}
          <button onClick={() => { if (window.confirm('Delete this invoice?')) { deleteInvoice(invoice.id); onBack() } }} style={{ background: 'rgba(220,38,38,0.3)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 18 }}>
            🗑️
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <button onClick={handlePrint} style={{ padding: '11px 6px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', background: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            🖨️ Print PDF
          </button>
          {party?.phone && (
            <button onClick={handleWhatsApp} style={{ padding: '11px 6px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#25D366', color: 'white', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              📱 WhatsApp
            </button>
          )}
          {invoice.status !== 'paid' && (
            <button onClick={handleMarkPaid} style={{ padding: '11px 6px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'var(--green)', color: 'white', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <CheckCircle size={14} /> Paid
            </button>
          )}
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Customer</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{party?.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{party?.city}</div>
            </div>
            <div style={{ background: sc.bg, color: sc.c, padding: '4px 12px', borderRadius: 99, fontSize: 13, fontWeight: 700, height: 'fit-content' }}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { l: 'Invoice Date', v: invoice.date },
              { l: 'Due Date', v: invoice.dueDate },
              { l: 'Invoice No', v: invoice.invoiceNo },
              { l: 'Items', v: `${(invoice.items || []).length} item(s)` },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg)', borderRadius: 10, padding: '8px 10px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{f.l}</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{f.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border-light)', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            <span>Item</span><span>Qty</span><span>Rate</span><span>Amt</span>
          </div>
          {(invoice.items || []).map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--border-light)', fontSize: 13, alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{item.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>{item.qty}</span>
              <span style={{ color: 'var(--text-muted)' }}>{fmtFull(item.rate)}</span>
              <span style={{ fontWeight: 700 }}>{fmtFull(item.amount)}</span>
            </div>
          ))}
          <div style={{ padding: '12px 16px', background: 'var(--bg)' }}>
            {[
              { l: 'Subtotal', v: fmtFull(invoice.subtotal || 0) },
              { l: 'GST', v: fmtFull(invoice.taxAmount || 0) },
              { l: 'Discount', v: `-${fmtFull(invoice.discount || 0)}` },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span>{r.l}</span><span>{r.v}</span>
              </div>
            ))}
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--indigo)' }}>
              <span>Total</span>
              <span style={{ color: 'var(--saffron)' }}>{fmtFull(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ────────────────────────────── */}
      {showEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)' }}>Edit Invoice</h3>
              <button onClick={() => setShowEdit(false)} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{invoice.invoiceNo} · {party?.name}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Update Payment Status</label>
              {[
                { status: 'unpaid',  label: 'Unpaid',          color: 'var(--red)',   bg: 'var(--red-light)' },
                { status: 'partial', label: 'Partial Payment',  color: 'var(--amber)', bg: 'var(--amber-light)' },
                { status: 'paid',    label: 'Fully Paid',       color: 'var(--green)', bg: 'var(--green-light)' },
              ].map(opt => (
                <button key={opt.status}
                  onClick={() => {
                    updateInvoiceStatus(invoice.id, opt.status)
                    if (opt.status === 'paid') addTransaction({ partyId: invoice.partyId, type: 'receipt', amount: invoice.totalAmount, balanceAfter: 0, note: 'Payment: ' + invoice.invoiceNo, billNo: invoice.invoiceNo, date: new Date().toISOString().split('T')[0] })
                    setShowEdit(false)
                    onBack()
                  }}
                  style={{ padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: invoice.status === opt.status ? '2px solid ' + opt.color : '1.5px solid var(--border)', background: invoice.status === opt.status ? opt.bg : 'white', color: opt.color, fontWeight: 700, fontSize: 15 }}>
                  {opt.label}
                  {invoice.status === opt.status && <span style={{ fontSize: 11, background: opt.color, color: 'white', padding: '2px 10px', borderRadius: 99 }}>Current</span>}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Update Due Date</label>
              <input className="input-field" type="date" defaultValue={invoice.dueDate} onChange={e => editInvoice && editInvoice(invoice.id, { dueDate: e.target.value })} />
              <button className="btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={() => setShowEdit(false)}>Done ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Create Invoice ────────────────────────────────────────────────────────────
function CreateInvoiceScreen({ onBack, onDone }) {
  const { parties, products, addInvoice, language, business } = useApp()
  const hi = language === 'hi'
  const customers = parties.filter(p => p.type === 'customer' || p.type === 'both')
  const gstEnabled = business?.gstEnabled !== false
  const gstRate = business?.gstRate ?? 5

  const [selectedParty, setSelectedParty] = useState(null)
  const [partySearch, setPartySearch] = useState('')
  const [showPartyList, setShowPartyList] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0] })
  const [items, setItems] = useState([{ productId: '', name: '', qty: 1, rate: 0, amount: 0 }])
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const filteredCustomers = customers.filter(p => p.name.toLowerCase().includes(partySearch.toLowerCase()))

  const updateItem = (i, field, value) => {
    const newItems = [...items]
    newItems[i] = { ...newItems[i], [field]: value }
    if (field === 'productId') {
      const prod = products.find(p => p.id === value)
      if (prod) { newItems[i].name = prod.name; newItems[i].rate = prod.sellingPrice }
    }
    if (field === 'qty' || field === 'rate' || field === 'productId') {
      newItems[i].amount = (Number(newItems[i].qty) || 0) * (Number(newItems[i].rate) || 0)
    }
    setItems(newItems)
  }

  const addItem = () => setItems(prev => [...prev, { productId: '', name: '', qty: 1, rate: 0, amount: 0 }])
  const removeItem = i => setItems(prev => prev.filter((_, idx) => idx !== i))

  const subtotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0)
  const discountAmt = Number(discount) || 0
  const taxAmount = gstEnabled ? Math.round((subtotal - discountAmt) * (gstRate / 100)) : 0
  const total = subtotal - discountAmt + taxAmount

  const handleSave = () => {
    if (!selectedParty) { setError('Please select a customer'); return }
    if (items.every(i => !i.name && !i.productId)) { setError('Add at least one item'); return }
    if (total <= 0) { setError('Invoice total must be greater than 0'); return }
    addInvoice({ partyId: selectedParty.id, date, dueDate, status: 'unpaid', items: items.filter(i => i.name || i.productId), subtotal, discount: discountAmt, taxAmount, totalAmount: total, notes })
    onDone()
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', padding: '20px 16px 24px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <ArrowLeft size={18} />
          </button>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white' }}>
            {hi ? 'नई इनवॉइस' : 'Create Invoice'}
          </h2>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Customer Select */}
        <div className="card" style={{ padding: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer *</label>
          {selectedParty ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--indigo-light)', borderRadius: 12, padding: '12px 14px' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--indigo)' }}>{selectedParty.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedParty.city}</div>
              </div>
              <button onClick={() => setSelectedParty(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input className="input-field" style={{ paddingLeft: 36 }} placeholder="Search customer..."
                value={partySearch} onChange={e => { setPartySearch(e.target.value); setShowPartyList(true) }} onFocus={() => setShowPartyList(true)} />
              {showPartyList && partySearch && (
                <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'white', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', zIndex: 100, maxHeight: 200, overflowY: 'auto' }}>
                  {filteredCustomers.slice(0, 6).map(p => (
                    <div key={p.id} onClick={() => { setSelectedParty(p); setPartySearch(''); setShowPartyList(false) }}
                      style={{ padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', fontSize: 14 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.city}</div>
                    </div>
                  ))}
                  {filteredCustomers.length === 0 && <div style={{ padding: 12, color: 'var(--text-muted)', fontSize: 13 }}>No customer found</div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Invoice Date</label>
              <input className="input-field" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Due Date</label>
              <input className="input-field" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</label>
            <button onClick={addItem} style={{ background: 'var(--saffron-light)', border: 'none', borderRadius: 8, padding: '5px 10px', color: 'var(--saffron)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={13} /> Add
            </button>
          </div>
          {items.map((item, i) => (
            <div key={i} style={{ background: 'var(--bg)', borderRadius: 12, padding: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Item {i + 1}</span>
                {items.length > 1 && <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 18 }}>×</button>}
              </div>
              <select className="input-field" style={{ marginBottom: 8, fontSize: 13 }} value={item.productId || ''} onChange={e => updateItem(i, 'productId', e.target.value)}>
                <option value="">-- Select product --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {!item.productId && <input className="input-field" placeholder="Or type item name" style={{ marginBottom: 8, fontSize: 13 }} value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Qty</label>
                  <input className="input-field" type="number" placeholder="1" style={{ fontSize: 14, fontWeight: 700 }} value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Rate ₹</label>
                  <input className="input-field" type="number" placeholder="0" style={{ fontSize: 14, fontWeight: 700 }} value={item.rate} onChange={e => updateItem(i, 'rate', e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 3 }}>Amount</label>
                  <div style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px 10px', background: 'var(--indigo-light)', fontSize: 13, fontWeight: 800, color: 'var(--indigo)' }}>{fmtFull(item.amount)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
              <span>Subtotal</span><span>{fmtFull(subtotal)}</span>
            </div>
            {gstEnabled && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)' }}>
                <span>GST ({gstRate}%)</span><span>{fmtFull(taxAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-secondary)', alignItems: 'center' }}>
              <span>Discount</span>
              <input type="number" placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} style={{ width: 80, border: '1.5px solid var(--border)', borderRadius: 8, padding: '4px 8px', textAlign: 'right', fontSize: 14 }} />
            </div>
            <div style={{ height: 1, background: 'var(--border)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--indigo)' }}>
              <span>Total</span><span style={{ color: 'var(--saffron)' }}>{fmtFull(total)}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Notes (optional)</label>
          <textarea className="input-field" rows={2} style={{ resize: 'none' }} placeholder="Payment terms, delivery notes..." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {error && <p style={{ color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>⚠️ {error}</p>}

        <button className="btn-primary" style={{ width: '100%' }} onClick={handleSave}>
          <FileText size={16} /> {hi ? 'इनवॉइस बनाएं ✓' : 'Create Invoice ✓'}
        </button>
      </div>
    </div>
  )
}
