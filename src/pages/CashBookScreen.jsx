import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`
const today = () => new Date().toISOString().split('T')[0]

const SEED_CASHBOOK = [
  { id: 'CB001', type: 'in',  amount: 45000, note: 'Payment from Mehta Wholesale', category: 'Receipt',  date: '2026-06-08', createdBy: 'Ramesh Sharma' },
  { id: 'CB002', type: 'out', amount: 12000, note: 'Paid to National Agro Supplies', category: 'Payment', date: '2026-06-08', createdBy: 'Ramesh Sharma' },
  { id: 'CB003', type: 'in',  amount: 8000,  note: 'Patel & Sons partial payment', category: 'Receipt',  date: '2026-06-09', createdBy: 'Ramesh Sharma' },
  { id: 'CB004', type: 'out', amount: 2500,  note: 'Office rent', category: 'Expense', date: '2026-06-09', createdBy: 'Ramesh Sharma' },
  { id: 'CB005', type: 'out', amount: 850,   note: 'Electricity bill', category: 'Expense', date: '2026-06-07', createdBy: 'Ramesh Sharma' },
  { id: 'CB006', type: 'in',  amount: 22000, note: 'Cash sales - walk-in customer', category: 'Sale',    date: '2026-06-07', createdBy: 'Ramesh Sharma' },
  { id: 'CB007', type: 'out', amount: 5000,  note: 'Staff salary advance', category: 'Salary',  date: '2026-06-06', createdBy: 'Ramesh Sharma' },
  { id: 'CB008', type: 'in',  amount: 15000, note: 'Raj Kumar payment', category: 'Receipt',  date: '2026-06-06', createdBy: 'Ramesh Sharma' },
]

const CATEGORIES_IN  = ['Receipt', 'Sale', 'Loan Received', 'Other Income']
const CATEGORIES_OUT = ['Payment', 'Expense', 'Salary', 'Purchase', 'Loan Paid', 'Other']

export default function CashBookScreen() {
  const { language, currentUser } = useApp()
  const hi = language === 'hi'

  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem('hisaabpro_cashbook')
    return saved ? JSON.parse(saved) : SEED_CASHBOOK
  })
  const [showAddModal, setShowAddModal] = useState(null) // 'in' | 'out' | null
  const [dateFilter, setDateFilter] = useState('all') // 'today' | 'week' | 'month' | 'all'
  const [openingBalance, setOpeningBalance] = useState(() => {
    return Number(localStorage.getItem('hisaabpro_opening_balance') || 25000)
  })
  const [showOpeningModal, setShowOpeningModal] = useState(false)

  const saveEntries = (newEntries) => {
    setEntries(newEntries)
    localStorage.setItem('hisaabpro_cashbook', JSON.stringify(newEntries))
  }

  const addEntry = (entry) => {
    const newEntry = { ...entry, id: `CB${Date.now()}`, createdBy: currentUser?.name || 'Owner' }
    saveEntries([newEntry, ...entries])
    setShowAddModal(null)
  }

  // Filter entries
  const now = new Date()
  const filteredEntries = entries.filter(e => {
    if (dateFilter === 'today') return e.date === today()
    if (dateFilter === 'week') {
      const d = new Date(e.date)
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
      return d >= weekAgo
    }
    if (dateFilter === 'month') {
      const d = new Date(e.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }
    return true
  })

  const totalIn  = filteredEntries.filter(e => e.type === 'in').reduce((s, e) => s + e.amount, 0)
  const totalOut = filteredEntries.filter(e => e.type === 'out').reduce((s, e) => s + e.amount, 0)
  const closingBalance = openingBalance + totalIn - totalOut

  // Group by date
  const grouped = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.date]) acc[entry.date] = []
    acc[entry.date].push(entry)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a))

  const filterLabels = [
    { id: 'today', label: 'Today', labelHi: 'आज' },
    { id: 'week',  label: 'This Week', labelHi: 'इस हफ्ते' },
    { id: 'month', label: 'This Month', labelHi: 'इस महीने' },
    { id: 'all',   label: 'All', labelHi: 'सभी' },
  ]

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', padding: '24px 16px 20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white' }}>
              {hi ? 'कैश बुक' : 'Cash Book'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 }}>{hi ? 'रोज़ाना नकद हिसाब' : 'Daily cash tracking'}</p>
          </div>
          <button onClick={() => setShowOpeningModal(true)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '8px 12px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <Wallet size={13} style={{ marginRight: 4, display: 'inline' }} />
            Opening: {fmtFull(openingBalance)}
          </button>
        </div>

        {/* Balance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
          {[
            { label: hi ? 'नकद आया' : 'Cash In', value: fmtFull(totalIn), color: '#4ADE80' },
            { label: hi ? 'नकद गया' : 'Cash Out', value: fmtFull(totalOut), color: '#F87171' },
            { label: hi ? 'शेष' : 'Balance', value: fmtFull(closingBalance), color: closingBalance >= 0 ? '#4ADE80' : '#F87171' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button onClick={() => setShowAddModal('in')} style={{ padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.9)', color: '#16A34A', fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <TrendingUp size={18} /> {hi ? '+ पैसे आए' : '+ Cash In'}
          </button>
          <button onClick={() => setShowAddModal('out')} style={{ padding: '12px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'rgba(220,38,38,0.85)', color: 'white', fontWeight: 800, fontSize: 14, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <TrendingDown size={18} /> {hi ? '- पैसे गए' : '- Cash Out'}
          </button>
        </div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        {/* Date Filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {filterLabels.map(f => (
            <button key={f.id} onClick={() => setDateFilter(f.id)} style={{
              padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              border: dateFilter === f.id ? 'none' : '1px solid var(--border)',
              background: dateFilter === f.id ? '#16A34A' : 'white',
              color: dateFilter === f.id ? 'white' : 'var(--text-secondary)',
            }}>{hi ? f.labelHi : f.label}</button>
          ))}
        </div>

        {/* Entries grouped by date */}
        {sortedDates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
            <p style={{ fontWeight: 600 }}>No entries yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Tap Cash In or Cash Out to start</p>
          </div>
        ) : (
          sortedDates.map(date => {
            const dayEntries = grouped[date]
            const dayIn  = dayEntries.filter(e => e.type === 'in').reduce((s, e) => s + e.amount, 0)
            const dayOut = dayEntries.filter(e => e.type === 'out').reduce((s, e) => s + e.amount, 0)
            const isToday = date === today()
            return (
              <div key={date} style={{ marginBottom: 16 }}>
                {/* Date header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {isToday ? (hi ? 'आज' : 'Today') : new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>+{fmtFull(dayIn)}</span>
                    <span style={{ color: 'var(--red)', fontWeight: 700 }}>-{fmtFull(dayOut)}</span>
                  </div>
                </div>
                <div className="card" style={{ overflow: 'hidden' }}>
                  {dayEntries.map((entry, i) => (
                    <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < dayEntries.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: entry.type === 'in' ? 'var(--green-light)' : 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {entry.type === 'in' ? <TrendingUp size={16} color="var(--green)" /> : <TrendingDown size={16} color="var(--red)" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.note}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          <span style={{ background: entry.type === 'in' ? 'var(--green-light)' : 'var(--red-light)', color: entry.type === 'in' ? 'var(--green)' : 'var(--red)', padding: '1px 6px', borderRadius: 99, fontWeight: 600 }}>{entry.category}</span>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: entry.type === 'in' ? 'var(--green)' : 'var(--red)', whiteSpace: 'nowrap' }}>
                        {entry.type === 'in' ? '+' : '-'}{fmtFull(entry.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <AddCashModal type={showAddModal} onClose={() => setShowAddModal(null)} onAdd={addEntry} />
      )}

      {/* Opening Balance Modal */}
      {showOpeningModal && (
        <OpeningBalanceModal
          current={openingBalance}
          onSave={val => { setOpeningBalance(val); localStorage.setItem('hisaabpro_opening_balance', val); setShowOpeningModal(false) }}
          onClose={() => setShowOpeningModal(false)}
        />
      )}
    </div>
  )
}

function AddCashModal({ type, onClose, onAdd }) {
  const { language } = useApp()
  const hi = language === 'hi'
  const [form, setForm] = useState({ type, amount: '', note: '', category: type === 'in' ? 'Receipt' : 'Expense', date: today() })
  const [error, setError] = useState('')

  const cats = type === 'in' ? CATEGORIES_IN : CATEGORIES_OUT

  const handleSave = () => {
    if (!form.amount || Number(form.amount) <= 0) { setError('Please enter valid amount'); return }
    if (!form.note.trim()) { setError('Please enter a note'); return }
    onAdd({ ...form, amount: Number(form.amount) })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: type === 'in' ? 'var(--green)' : 'var(--red)' }}>
            {type === 'in' ? (hi ? '💚 नकद आया' : '💚 Cash In') : (hi ? '🔴 नकद गया' : '🔴 Cash Out')}
          </h3>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? 'राशि *' : 'Amount *'}</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 18 }}>₹</span>
              <input className="input-field" style={{ paddingLeft: 32, fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 800 }}
                type="number" placeholder="0" value={form.amount} onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setError('') }} autoFocus />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? 'श्रेणी' : 'Category'}</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {cats.map(cat => (
                <button key={cat} onClick={() => setForm(f => ({ ...f, category: cat }))} style={{
                  padding: '7px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: form.category === cat ? 'none' : '1px solid var(--border)',
                  background: form.category === cat ? (type === 'in' ? 'var(--green)' : 'var(--red)') : 'white',
                  color: form.category === cat ? 'white' : 'var(--text-secondary)',
                }}>{cat}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? 'विवरण *' : 'Note *'}</label>
            <input className="input-field" placeholder={type === 'in' ? 'e.g. Payment from Mehta' : 'e.g. Office rent paid'}
              value={form.note} onChange={e => { setForm(f => ({ ...f, note: e.target.value })); setError('') }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? 'तारीख' : 'Date'}</label>
            <input className="input-field" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
          <button onClick={handleSave} style={{
            width: '100%', padding: 14, borderRadius: 14, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'white',
            background: type === 'in' ? 'var(--green)' : 'var(--red)',
          }}>
            {type === 'in' ? (hi ? 'एंट्री सेव करें ✓' : 'Save Cash In ✓') : (hi ? 'एंट्री सेव करें ✓' : 'Save Cash Out ✓')}
          </button>
        </div>
      </div>
    </div>
  )
}

function OpeningBalanceModal({ current, onSave, onClose }) {
  const [val, setVal] = useState(String(current))
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)' }}>Opening Balance</h3>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>Cash available at the start of your records</p>
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-secondary)' }}>₹</span>
          <input className="input-field" style={{ paddingLeft: 32, fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700 }}
            type="number" value={val} onChange={e => setVal(e.target.value)} autoFocus />
        </div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={() => onSave(Number(val) || 0)}>Save Opening Balance ✓</button>
      </div>
    </div>
  )
}
