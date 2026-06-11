import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Search, Plus, ChevronRight, TrendingUp, TrendingDown, Edit2, Trash2, MoreVertical } from 'lucide-react'

const fmtFull = n => `₹${n.toLocaleString('en-IN')}`

export default function PartiesScreen({ onNavigate }) {
  const { parties, language, deleteParty, transactions } = useApp()

  const getRisk = (party) => {
    const txns = transactions.filter(t => t.partyId === party.id)
    const payments = txns.filter(t => t.type === 'receipt' || t.type === 'payment')
    const lastPayment = payments.sort((a,b) => new Date(b.date)-new Date(a.date))[0]
    const daysSince = lastPayment ? Math.floor((new Date()-new Date(lastPayment.date))/(1000*60*60*24)) : 999
    if (party.balance > 100000 || daysSince > 30) return { score: 'High', color: '#DC2626', bg: '#FEF2F2', emoji: '🔴' }
    if (party.balance > 30000 || daysSince > 14) return { score: 'Medium', color: '#D97706', bg: '#FFFBEB', emoji: '🟡' }
    return { score: 'Low', color: '#059669', bg: '#F0FDF4', emoji: '🟢' }
  }
  const hi = language === 'hi'
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editPartyData, setEditPartyData] = useState(null)
  const [menuPartyId, setMenuPartyId] = useState(null)

  const filtered = parties.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone || '').includes(search) ||
      (p.city || '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || p.type === filter ||
      (filter === 'customer' && p.type === 'both') ||
      (filter === 'supplier' && p.type === 'both')
    return matchSearch && matchFilter
  })

  const totalReceivable = parties.filter(p => p.balanceType === 'to_receive').reduce((s, p) => s + p.balance, 0)
  const totalPayable = parties.filter(p => p.balanceType === 'to_pay').reduce((s, p) => s + p.balance, 0)

  const handleDelete = (party) => {
    if (window.confirm(`Delete "${party.name}"? All transactions will also be deleted.`)) {
      deleteParty(party.id)
    }
    setMenuPartyId(null)
  }

  return (
    <div style={{ paddingBottom: 80 }} onClick={() => setMenuPartyId(null)}>
      <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', padding: '24px 16px 20px', borderRadius: '0 0 24px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 16 }}>
          {hi ? 'पार्टी खाते' : 'Party Accounts'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: hi ? 'पाना है' : 'To Receive', amount: totalReceivable, color: '#4ADE80' },
            { label: hi ? 'देना है' : 'To Pay', amount: totalPayable, color: '#F87171' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: s.color }}>{fmtFull(s.amount)}</div>
            </div>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input className="input-field" style={{ paddingLeft: 38, background: 'white' }}
            placeholder={hi ? 'नाम, फ़ोन या शहर खोजें...' : 'Search name, phone, city...'}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { id: 'all', label: `All (${parties.length})` },
            { id: 'customer', label: hi ? 'ग्राहक' : 'Customers' },
            { id: 'supplier', label: hi ? 'सप्लायर' : 'Suppliers' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '7px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: filter === f.id ? 'none' : '1px solid var(--border)',
              background: filter === f.id ? 'var(--saffron)' : 'white',
              color: filter === f.id ? 'white' : 'var(--text-secondary)',
            }}>{f.label}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
            <p style={{ fontWeight: 600 }}>{hi ? 'कोई पार्टी नहीं' : 'No parties yet'}</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Tap + to add your first customer or supplier</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(party => (
              <div key={party.id} className="card"
                style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
              >
                {/* Avatar */}
                <div onClick={() => onNavigate('party-detail', party)} style={{ width: 48, height: 48, borderRadius: 14, flexShrink: 0, background: party.type === 'supplier' ? 'var(--saffron-light)' : 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: party.type === 'supplier' ? 'var(--saffron)' : 'var(--indigo)' }}>
                  {party.name[0]}
                </div>

                {/* Info + Balance in one flex column */}
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => onNavigate('party-detail', party)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 8 }}>{party.name}</div>
                    {party.balance > 0 ? (
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: party.balanceType === 'to_receive' ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>
                        {fmtFull(party.balance)}
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, background: 'var(--green-light)', padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>✓ Clear</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {party.city && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{party.city}</span>}
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, flexShrink: 0, background: party.type === 'supplier' ? 'var(--saffron-light)' : party.type === 'both' ? 'var(--indigo-light)' : 'var(--green-light)', color: party.type === 'supplier' ? 'var(--saffron)' : party.type === 'both' ? 'var(--indigo)' : 'var(--green)' }}>
                        {party.type === 'both' ? 'Both' : party.type === 'supplier' ? 'Supplier' : 'Customer'}
                      </span>
                    </div>
                    {party.balance > 0 && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {party.balanceType === 'to_receive' ? '↑ to receive' : '↓ to pay'}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3-dot Menu */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button onClick={e => { e.stopPropagation(); setMenuPartyId(menuPartyId === party.id ? null : party.id) }}
                    style={{ background: 'var(--bg)', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <MoreVertical size={16} color="var(--text-muted)" />
                  </button>
                  {menuPartyId === party.id && (
                    <div style={{ position: 'absolute', right: 0, top: 36, background: 'white', borderRadius: 12, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)', zIndex: 50, minWidth: 140, overflow: 'hidden' }}
                      onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setEditPartyData(party); setMenuPartyId(null) }}
                        style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--indigo)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(party)}
                        style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--red)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--red-light)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowAddModal(true)} style={{ position: 'fixed', bottom: 88, right: 20, width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--saffron), #FF8C42)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-saffron)', zIndex: 50 }}>
        <Plus size={24} />
      </button>

      {showAddModal && <AddEditPartyModal onClose={() => setShowAddModal(false)} />}
      {editPartyData && <AddEditPartyModal party={editPartyData} onClose={() => setEditPartyData(null)} />}
    </div>
  )
}

function AddEditPartyModal({ party, onClose }) {
  const { addParty, editParty, language } = useApp()
  const hi = language === 'hi'
  const isEdit = !!party
  const [form, setForm] = useState(party ? { ...party } : { name: '', phone: '', type: 'customer', city: '', gstin: '', balance: '', balanceType: 'to_receive' })
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!form.name.trim()) { setError('Party name is required'); return }
    if (form.phone && form.phone.length !== 10) { setError('Enter valid 10-digit phone'); return }
    if (isEdit) {
      editParty(party.id, { ...form, balance: Number(form.balance) || party.balance })
    } else {
      addParty({ ...form, balance: Number(form.balance) || 0 })
    }
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)' }}>
            {isEdit ? (hi ? 'पार्टी एडिट करें' : 'Edit Party') : (hi ? 'नई पार्टी जोड़ें' : 'Add New Party')}
          </h3>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Party Name *</label>
            <input className="input-field" placeholder="e.g. Mehta Wholesale" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Mobile Number</label>
            <input className="input-field" placeholder="10-digit number" type="tel" maxLength={10} value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Type</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['customer', 'supplier', 'both'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{ flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: form.type === t ? 'none' : '1.5px solid var(--border)', background: form.type === t ? 'var(--saffron)' : 'white', color: form.type === t ? 'white' : 'var(--text-secondary)' }}>
                  {t === 'customer' ? 'Customer' : t === 'supplier' ? 'Supplier' : 'Both'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>City</label>
            <input className="input-field" placeholder="e.g. Surat" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>GSTIN (optional)</label>
            <input className="input-field" placeholder="24AAXXX1234F1Z5" value={form.gstin || ''} onChange={e => setForm(f => ({ ...f, gstin: e.target.value }))} />
          </div>
          {!isEdit && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Opening Balance (optional)</label>
              <input className="input-field" placeholder="₹ 0" type="number" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} />
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {[{ v: 'to_receive', l: 'To Receive' }, { v: 'to_pay', l: 'To Pay' }].map(o => (
                  <button key={o.v} onClick={() => setForm(f => ({ ...f, balanceType: o.v }))} style={{ flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: form.balanceType === o.v ? 'none' : '1.5px solid var(--border)', background: form.balanceType === o.v ? (o.v === 'to_receive' ? 'var(--green-light)' : 'var(--red-light)') : 'white', color: form.balanceType === o.v ? (o.v === 'to_receive' ? 'var(--green)' : 'var(--red)') : 'var(--text-secondary)' }}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
          <button className="btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={handleSave}>
            {isEdit ? 'Save Changes ✓' : 'Add Party ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
