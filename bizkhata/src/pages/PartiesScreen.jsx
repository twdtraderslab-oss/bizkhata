import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Search, Plus, ChevronRight, TrendingUp, TrendingDown, Filter } from 'lucide-react'

const fmtFull = n => `₹${n.toLocaleString('en-IN')}`

export default function PartiesScreen({ onNavigate }) {
  const { parties, language } = useApp()
  const hi = language === 'hi'
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | customer | supplier
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = parties.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search) || p.city.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.type === filter || (filter === 'customer' && p.type === 'both') || (filter === 'supplier' && p.type === 'both')
    return matchSearch && matchFilter
  })

  const totalReceivable = parties.filter(p => p.balanceType === 'to_receive').reduce((s, p) => s + p.balance, 0)
  const totalPayable = parties.filter(p => p.balanceType === 'to_pay').reduce((s, p) => s + p.balance, 0)

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))',
        padding: '24px 16px 20px',
        borderRadius: '0 0 24px 24px',
      }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 16 }}>
          {hi ? 'पार्टी खाते' : 'Party Accounts'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: hi ? 'पाना है' : 'Total Receivable', amount: totalReceivable, color: '#4ADE80' },
            { label: hi ? 'देना है' : 'Total Payable', amount: totalPayable, color: '#F87171' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: s.color }}>{fmtFull(s.amount)}</div>
            </div>
          ))}
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input-field"
            style={{ paddingLeft: 38, background: 'white' }}
            placeholder={hi ? 'नाम, फ़ोन या शहर खोजें...' : 'Search by name, phone, city...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { id: 'all', label: `All (${parties.length})`, labelHi: `सभी (${parties.length})` },
            { id: 'customer', label: `Customers`, labelHi: 'ग्राहक' },
            { id: 'supplier', label: `Suppliers`, labelHi: 'सप्लायर' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: filter === f.id ? 'none' : '1px solid var(--border)',
              background: filter === f.id ? 'var(--saffron)' : 'white',
              color: filter === f.id ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}>
              {hi ? f.labelHi : f.label}
            </button>
          ))}
        </div>

        {/* Party List */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 600 }}>No parties found</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Try a different search</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(party => (
              <div key={party.id} className="card" onClick={() => onNavigate('party-detail', party)}
                style={{ padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 14 }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: party.type === 'supplier' ? 'var(--saffron-light)' : 'var(--indigo-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
                  color: party.type === 'supplier' ? 'var(--saffron)' : 'var(--indigo)',
                }}>
                  {party.name[0]}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {party.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{party.city}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                      background: party.type === 'supplier' ? 'var(--saffron-light)' : party.type === 'both' ? 'var(--indigo-light)' : 'var(--green-light)',
                      color: party.type === 'supplier' ? 'var(--saffron)' : party.type === 'both' ? 'var(--indigo)' : 'var(--green)',
                    }}>
                      {party.type === 'both' ? 'Both' : party.type === 'supplier' ? hi ? 'सप्लायर' : 'Supplier' : hi ? 'ग्राहक' : 'Customer'}
                    </span>
                  </div>
                </div>

                {/* Balance */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {party.balance > 0 ? (
                    <>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                        color: party.balanceType === 'to_receive' ? 'var(--green)' : 'var(--red)',
                      }}>
                        {fmtFull(party.balance)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                        {party.balanceType === 'to_receive'
                          ? <><TrendingUp size={10} color="var(--green)" /> {hi ? 'पाना' : 'to get'}</>
                          : <><TrendingDown size={10} color="var(--red)" /> {hi ? 'देना' : 'to pay'}</>
                        }
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, background: 'var(--green-light)', padding: '3px 8px', borderRadius: 99 }}>
                      ✓ Clear
                    </span>
                  )}
                  <ChevronRight size={14} color="var(--text-muted)" style={{ marginTop: 4 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        style={{
          position: 'fixed', bottom: 88, right: 20,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--saffron), #FF8C42)',
          border: 'none', cursor: 'pointer', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-saffron)', zIndex: 50,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <Plus size={24} />
      </button>

      {/* Add Party Modal */}
      {showAddModal && <AddPartyModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}

// ── Add Party Modal ───────────────────────────────────────────────────────────
function AddPartyModal({ onClose }) {
  const { addParty, language } = useApp()
  const hi = language === 'hi'
  const [form, setForm] = useState({ name: '', phone: '', type: 'customer', city: '', gstin: '', balance: '', balanceType: 'to_receive' })
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!form.name.trim()) { setError('Party name is required'); return }
    if (form.phone && form.phone.length !== 10) { setError('Enter valid 10-digit phone'); return }
    addParty({ ...form, balance: Number(form.balance) || 0 })
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{
        width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px',
        maxHeight: '85vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)' }}>
            {hi ? 'नई पार्टी जोड़ें' : 'Add New Party'}
          </h3>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              {hi ? 'पार्टी का नाम *' : 'Party Name *'}
            </label>
            <input className="input-field" placeholder="e.g. Mehta Wholesale" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              {hi ? 'मोबाइल नंबर' : 'Mobile Number'}
            </label>
            <input className="input-field" placeholder="10-digit WhatsApp number" type="tel" maxLength={10} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              {hi ? 'प्रकार' : 'Type'}
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['customer', 'supplier', 'both'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  border: form.type === t ? 'none' : '1.5px solid var(--border)',
                  background: form.type === t ? 'var(--saffron)' : 'white',
                  color: form.type === t ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}>
                  {t === 'customer' ? (hi ? 'ग्राहक' : 'Customer') : t === 'supplier' ? (hi ? 'सप्लायर' : 'Supplier') : 'Both'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              {hi ? 'शहर' : 'City'}
            </label>
            <input className="input-field" placeholder="e.g. Surat" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              {hi ? 'शुरुआती बैलेंस (वैकल्पिक)' : 'Opening Balance (optional)'}
            </label>
            <input className="input-field" placeholder="₹ 0" type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} />
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {[{ v: 'to_receive', l: 'To Receive (Udhaar)', lhi: 'पाना है' }, { v: 'to_pay', l: 'To Pay', lhi: 'देना है' }].map(o => (
                <button key={o.v} onClick={() => setForm(f => ({ ...f, balanceType: o.v }))} style={{
                  flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: form.balanceType === o.v ? 'none' : '1.5px solid var(--border)',
                  background: form.balanceType === o.v ? (o.v === 'to_receive' ? 'var(--green-light)' : 'var(--red-light)') : 'white',
                  color: form.balanceType === o.v ? (o.v === 'to_receive' ? 'var(--green)' : 'var(--red)') : 'var(--text-secondary)',
                }}>
                  {hi ? o.lhi : o.l}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}

          <button className="btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={handleSave}>
            {hi ? 'पार्टी जोड़ें ✓' : 'Add Party ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
