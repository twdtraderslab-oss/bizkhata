import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Phone, MessageCircle, Share2, TrendingUp, TrendingDown, Plus, FileText, Printer } from 'lucide-react'
import { generateLedgerPDF } from '../utils/pdfGenerator'

const fmtFull = n => `₹${n.toLocaleString('en-IN')}`

export default function PartyDetailScreen({ party, onBack }) {
  const { transactions, addTransaction, language, currentUser, business } = useApp()
  const hi = language === 'hi'
  const [showAddModal, setShowAddModal] = useState(false)
  const [txnType, setTxnType] = useState('sale')

  const partyTxns = transactions
    .filter(t => t.partyId === party.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Dear ${party.name},\n\nYour current balance with ${currentUser?.name || 'us'} is *${fmtFull(party.balance)}* (${party.balanceType === 'to_receive' ? 'to pay us' : 'we owe you'}).\n\nPlease contact us for any queries.\n\nThank you 🙏`
    )
    window.open(`https://wa.me/91${party.phone}?text=${msg}`, '_blank')
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))',
        padding: '20px 16px 24px', borderRadius: '0 0 24px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white',
          }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 2 }}>
              {party.name}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{party.city} · {party.phone}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {party.phone && (
              <a href={`tel:+91${party.phone}`} style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', textDecoration: 'none',
              }}>
                <Phone size={16} />
              </a>
            )}
          </div>
        </div>

        {/* Balance Card */}
        <div style={{
          background: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: '18px 20px',
          border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 8 }}>
            {party.balanceType === 'to_receive'
              ? (hi ? 'आपको मिलना है' : 'You will receive')
              : (hi ? 'आपको देना है' : 'You will pay')}
          </p>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800,
            color: party.balanceType === 'to_receive' ? '#4ADE80' : '#F87171',
          }}>
            {fmtFull(party.balance)}
          </div>
          {party.balance === 0 && (
            <div style={{ color: '#4ADE80', fontSize: 14, fontWeight: 600, marginTop: 4 }}>✓ Settled</div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          {party.phone && (
            <button onClick={handleWhatsApp} style={{
              flex: 1, padding: '11px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: '#25D366', color: 'white', fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <MessageCircle size={15} /> {hi ? 'रिमाइंडर' : 'Reminder'}
            </button>
          )}
          <button onClick={() => generateLedgerPDF(party, transactions, business)} style={{
            flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
            background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Printer size={15} /> {hi ? 'प्रिंट/PDF' : 'Print PDF'}
          </button>
          <button style={{
            flex: 1, padding: '11px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer',
            background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Share2 size={15} /> {hi ? 'शेयर' : 'Share'}
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {hi ? 'लेन-देन इतिहास' : 'Transaction History'} ({partyTxns.length})
          </h3>
        </div>

        {partyTxns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 600 }}>{hi ? 'कोई लेन-देन नहीं' : 'No transactions yet'}</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Tap + to add first entry</p>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            {partyTxns.map((t, i) => {
              const isIncoming = t.type === 'sale' || t.type === 'receipt'
              const typeLabels = { sale: 'Sale', purchase: 'Purchase', receipt: 'Payment Received', payment: 'Payment Made' }
              return (
                <div key={t.id} style={{
                  padding: '14px 16px',
                  borderBottom: i < partyTxns.length - 1 ? '1px solid var(--border-light)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: isIncoming ? 'var(--green-light)' : 'var(--red-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isIncoming ? <TrendingUp size={16} color="var(--green)" /> : <TrendingDown size={16} color="var(--red)" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                        {typeLabels[t.type]}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                        color: isIncoming ? 'var(--green)' : 'var(--red)',
                      }}>
                        {isIncoming ? '+' : '-'}{fmtFull(t.amount)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {t.note || '—'} {t.billNo && `· ${t.billNo}`}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.date}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      Balance: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fmtFull(t.balanceAfter)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowAddModal(true)} style={{
        position: 'fixed', bottom: 88, right: 20, width: 56, height: 56, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--saffron), #FF8C42)', border: 'none', cursor: 'pointer', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-saffron)', zIndex: 50,
        transition: 'transform 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Plus size={24} />
      </button>

      {showAddModal && <AddTransactionModal party={party} onClose={() => setShowAddModal(false)} />}
    </div>
  )
}

// ── Add Transaction Modal ─────────────────────────────────────────────────────
function AddTransactionModal({ party, onClose }) {
  const { addTransaction, language } = useApp()
  const hi = language === 'hi'
  const isCustomer = party.type === 'customer' || party.type === 'both'
  const [form, setForm] = useState({
    type: isCustomer ? 'sale' : 'purchase',
    amount: '',
    note: '',
    billNo: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')

  const typeOptions = isCustomer
    ? [{ v: 'sale', l: 'Sale (Credit)', lhi: 'बिक्री (उधार)' }, { v: 'receipt', l: 'Payment Received', lhi: 'भुगतान मिला' }]
    : [{ v: 'purchase', l: 'Purchase (Credit)', lhi: 'खरीद (उधार)' }, { v: 'payment', l: 'Payment Made', lhi: 'भुगतान किया' }]

  const handleSave = () => {
    if (!form.amount || Number(form.amount) <= 0) { setError('Please enter a valid amount'); return }
    const currentBalance = party.balance
    let newBalance = currentBalance
    if (form.type === 'sale') newBalance += Number(form.amount)
    if (form.type === 'receipt') newBalance = Math.max(0, currentBalance - Number(form.amount))
    if (form.type === 'purchase') newBalance += Number(form.amount)
    if (form.type === 'payment') newBalance = Math.max(0, currentBalance - Number(form.amount))

    addTransaction({
      partyId: party.id,
      type: form.type,
      amount: Number(form.amount),
      balanceAfter: newBalance,
      note: form.note,
      billNo: form.billNo,
      date: form.date,
    })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)' }}>
            {hi ? 'एंट्री जोड़ें' : 'Add Entry'}
          </h3>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>{party.name}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Type toggle */}
          <div style={{ display: 'flex', gap: 10 }}>
            {typeOptions.map(o => (
              <button key={o.v} onClick={() => setForm(f => ({ ...f, type: o.v }))} style={{
                flex: 1, padding: '12px 8px', borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                border: form.type === o.v ? 'none' : '1.5px solid var(--border)',
                background: form.type === o.v
                  ? (o.v === 'sale' || o.v === 'purchase') ? 'linear-gradient(135deg, var(--saffron), #FF8C42)' : 'var(--green)'
                  : 'white',
                color: form.type === o.v ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}>
                {hi ? o.lhi : o.l}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              {hi ? 'राशि *' : 'Amount *'}
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 18 }}>₹</span>
              <input className="input-field" style={{ paddingLeft: 32, fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 700 }}
                placeholder="0" type="number" value={form.amount} onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setError('') }}
                autoFocus />
            </div>
          </div>

          {/* Date */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              {hi ? 'तारीख' : 'Date'}
            </label>
            <input className="input-field" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              {hi ? 'विवरण (वैकल्पिक)' : 'Note (optional)'}
            </label>
            <input className="input-field" placeholder={hi ? 'जैसे: बासमती चावल 50 बैग' : 'e.g. Basmati rice 50 bags'}
              value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>

          {/* Bill No */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              {hi ? 'बिल नंबर (वैकल्पिक)' : 'Bill No. (optional)'}
            </label>
            <input className="input-field" placeholder="INV-2026-001" value={form.billNo} onChange={e => setForm(f => ({ ...f, billNo: e.target.value }))} />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}

          <button className="btn-primary" style={{ width: '100%' }} onClick={handleSave}>
            {hi ? 'एंट्री सेव करें ✓' : 'Save Entry ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
