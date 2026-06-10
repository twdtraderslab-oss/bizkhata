import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Users, Plus, Trash2, Shield, Crown, User, Phone, ChevronRight, X, Check } from 'lucide-react'

const ROLE_CONFIG = {
  owner:   { label: 'Owner',   labelHi: 'मालिक',    color: 'var(--saffron)', bg: '#FFF7ED', icon: <Crown size={14} />,  perms: ['all'] },
  manager: { label: 'Manager', labelHi: 'मैनेजर',   color: 'var(--indigo)', bg: '#EEF2FF', icon: <Shield size={14} />, perms: ['view_reports', 'add_txn', 'add_party', 'add_invoice'] },
  staff:   { label: 'Staff',   labelHi: 'स्टाफ',    color: 'var(--green)',  bg: '#F0FDF4', icon: <User size={14} />,   perms: ['add_txn'] },
}

const PERMISSIONS = [
  { key: 'add_txn',      label: 'Add Transactions',    labelHi: 'लेनदेन जोड़ें' },
  { key: 'add_party',    label: 'Add/Edit Parties',     labelHi: 'पार्टी जोड़ें/संपादित करें' },
  { key: 'add_invoice',  label: 'Create Invoices',      labelHi: 'इनवॉइस बनाएं' },
  { key: 'view_reports', label: 'View Reports',         labelHi: 'रिपोर्ट देखें' },
  { key: 'manage_stock', label: 'Manage Inventory',     labelHi: 'इन्वेंटरी प्रबंधन' },
  { key: 'edit_delete',  label: 'Edit/Delete Entries',  labelHi: 'एंट्री संपादित/हटाएं' },
  { key: 'view_balance', label: 'View Balances',        labelHi: 'बैलेंस देखें' },
]

export default function StaffScreen() {
  const { staffMembers, setStaffMembers, currentUser, language, business } = useApp()
  const hi = language === 'hi'
  const [showAdd, setShowAdd] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState(null)

  const allStaff = staffMembers || []
  const isPremium = business?.plan === 'premium'

  if (selectedStaff) return <StaffDetailScreen
    staff={selectedStaff}
    onBack={() => setSelectedStaff(null)}
    onUpdate={(updated) => {
      setStaffMembers(prev => prev.map(s => s.id === updated.id ? updated : s))
      setSelectedStaff(null)
    }}
    onDelete={(id) => {
      setStaffMembers(prev => prev.filter(s => s.id !== id))
      setSelectedStaff(null)
    }}
  />

  if (showAdd) return <AddStaffScreen
    onBack={() => setShowAdd(false)}
    onAdd={(s) => { setStaffMembers(prev => [...prev, s]); setShowAdd(false) }}
  />

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))',
        padding: '28px 16px 24px', borderRadius: '0 0 24px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white' }}>
              {hi ? 'स्टाफ प्रबंधन' : 'Staff Management'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>
              {allStaff.length + 1} {hi ? 'सदस्य' : 'members'}
            </p>
          </div>
          {isPremium ? (
            <button onClick={() => setShowAdd(true)} style={{
              background: 'var(--saffron)', border: 'none', borderRadius: 12, padding: '9px 16px',
              color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Plus size={16} /> {hi ? 'जोड़ें' : 'Add Staff'}
            </button>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '6px 12px',
              color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600,
            }}>
              👑 Premium
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
            const count = role === 'owner' ? 1 : allStaff.filter(s => s.role === role).length
            return (
              <div key={role} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginBottom: 4 }}>
                  {hi ? cfg.labelHi : cfg.label}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'white' }}>{count}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Owner Card (current user) */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            {hi ? 'मालिक' : 'Owner'}
          </p>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14,
                background: 'linear-gradient(135deg, var(--saffron), #FF8C42)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'white', flexShrink: 0,
              }}>
                {currentUser?.name?.[0] || 'O'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{currentUser?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>+91 {currentUser?.phone}</div>
              </div>
              <span style={{
                background: ROLE_CONFIG.owner.bg, color: ROLE_CONFIG.owner.color,
                borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Crown size={12} /> {hi ? 'मालिक' : 'Owner'}
              </span>
            </div>
          </div>
        </div>

        {/* Staff List */}
        {allStaff.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
              {hi ? 'टीम के सदस्य' : 'Team Members'}
            </p>
            <div className="card" style={{ overflow: 'hidden' }}>
              {allStaff.map((member, i) => {
                const cfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.staff
                return (
                  <div key={member.id} onClick={() => setSelectedStaff(member)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', cursor: 'pointer',
                    borderBottom: i < allStaff.length - 1 ? '1px solid var(--border-light)' : 'none',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <div style={{
                      width: 42, height: 42, borderRadius: 12, background: cfg.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: cfg.color, flexShrink: 0,
                    }}>
                      {member.name?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{member.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>+91 {member.phone}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                        {cfg.icon} {hi ? cfg.labelHi : cfg.label}
                      </span>
                      <ChevronRight size={14} color="var(--text-muted)" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Roles & Permissions Reference */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
            {hi ? 'भूमिका अनुमतियां' : 'Role Permissions'}
          </p>
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3,56px)', padding: '10px 14px', background: 'var(--bg)', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>Permission</div>
              {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                <div key={role} style={{ fontSize: 11, fontWeight: 700, color: cfg.color, textAlign: 'center' }}>
                  {hi ? cfg.labelHi : cfg.label}
                </div>
              ))}
            </div>
            {PERMISSIONS.map((perm, i) => (
              <div key={perm.key} style={{
                display: 'grid', gridTemplateColumns: '1fr repeat(3,56px)', padding: '10px 14px',
                borderBottom: i < PERMISSIONS.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{hi ? perm.labelHi : perm.label}</div>
                {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
                  const has = cfg.perms.includes('all') || cfg.perms.includes(perm.key)
                  return (
                    <div key={role} style={{ textAlign: 'center' }}>
                      {has
                        ? <span style={{ color: 'var(--green)', fontSize: 14 }}>✓</span>
                        : <span style={{ color: 'var(--border)', fontSize: 14 }}>✗</span>
                      }
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Premium Upsell if not premium */}
        {!isPremium && (
          <div style={{
            background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', borderRadius: 16,
            padding: '20px', border: '1px solid #C7D2FE', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👑</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--indigo)', marginBottom: 6 }}>
              {hi ? 'मल्टी-स्टाफ के लिए अपग्रेड करें' : 'Upgrade for Multi-Staff'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
              {hi ? 'अपने स्टाफ को जोड़ें और उनकी भूमिका सेट करें' : 'Add team members and control what they can access'}
            </div>
            <button className="btn-primary" style={{ margin: '0 auto' }}>
              <Crown size={14} /> Upgrade to Premium · ₹299/mo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Add Staff Screen ──────────────────────────────────────────────────────────
function AddStaffScreen({ onBack, onAdd }) {
  const { language } = useApp()
  const hi = language === 'hi'
  const [form, setForm] = useState({ name: '', phone: '', role: 'staff', pin: '' })

  const handleAdd = () => {
    if (!form.name || !form.phone) return
    onAdd({ ...form, id: `STAFF${Date.now()}`, joinedAt: new Date().toISOString().split('T')[0], active: true })
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', padding: '20px 16px 20px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color="white" />
          </button>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white' }}>
            {hi ? 'नया स्टाफ जोड़ें' : 'Add Staff Member'}
          </h2>
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { key: 'name',  label: 'Staff Name', labelHi: 'नाम',  placeholder: 'Suresh Kumar', type: 'text' },
            { key: 'phone', label: 'Phone',       labelHi: 'फ़ोन', placeholder: '9876543210',  type: 'tel' },
            { key: 'pin',   label: 'Login PIN (4 digits)', labelHi: 'पिन', placeholder: '****', type: 'password' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                {hi ? f.labelHi : f.label}
              </label>
              <input className="input-field" type={f.type} placeholder={f.placeholder} maxLength={f.key === 'pin' ? 4 : undefined}
                value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}

          {/* Role selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              {hi ? 'भूमिका' : 'Role'}
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(ROLE_CONFIG).filter(([r]) => r !== 'owner').map(([role, cfg]) => (
                <button key={role} onClick={() => setForm(p => ({ ...p, role }))} style={{
                  flex: 1, padding: '12px 8px', borderRadius: 12, cursor: 'pointer',
                  border: `2px solid ${form.role === role ? cfg.color : 'var(--border-light)'}`,
                  background: form.role === role ? cfg.bg : 'white',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transition: 'all 0.15s',
                }}>
                  <span style={{ color: cfg.color }}>{cfg.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: form.role === role ? cfg.color : 'var(--text-secondary)' }}>
                    {hi ? cfg.labelHi : cfg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions preview */}
          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>
              {hi ? 'इस भूमिका की अनुमतियां:' : 'Permissions for this role:'}
            </div>
            {PERMISSIONS.map(p => {
              const cfg = ROLE_CONFIG[form.role]
              const has = cfg.perms.includes('all') || cfg.perms.includes(p.key)
              return (
                <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: has ? 'var(--green)' : 'var(--border)', fontSize: 14, width: 16 }}>{has ? '✓' : '✗'}</span>
                  <span style={{ fontSize: 12, color: has ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {hi ? p.labelHi : p.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <button className="btn-primary" style={{ width: '100%' }} onClick={handleAdd}
          disabled={!form.name || !form.phone}>
          <Check size={16} /> {hi ? 'स्टाफ जोड़ें' : 'Add Staff Member'}
        </button>
      </div>
    </div>
  )
}

// ── Staff Detail Screen ───────────────────────────────────────────────────────
function StaffDetailScreen({ staff, onBack, onUpdate, onDelete }) {
  const { language } = useApp()
  const hi = language === 'hi'
  const [form, setForm] = useState({ ...staff })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const cfg = ROLE_CONFIG[form.role] || ROLE_CONFIG.staff

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', padding: '20px 16px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color="white" />
          </button>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white' }}>
            {staff.name}
          </h2>
        </div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="card" style={{ padding: 20 }}>
          {[
            { key: 'name',  label: 'Name',  labelHi: 'नाम',  type: 'text' },
            { key: 'phone', label: 'Phone', labelHi: 'फ़ोन', type: 'tel' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                {hi ? f.labelHi : f.label}
              </label>
              <input className="input-field" type={f.type} value={form[f.key] || ''}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
              {hi ? 'भूमिका' : 'Role'}
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(ROLE_CONFIG).filter(([r]) => r !== 'owner').map(([role, rc]) => (
                <button key={role} onClick={() => setForm(p => ({ ...p, role }))} style={{
                  flex: 1, padding: '10px 6px', borderRadius: 12, cursor: 'pointer',
                  border: `2px solid ${form.role === role ? rc.color : 'var(--border-light)'}`,
                  background: form.role === role ? rc.bg : 'white',
                  fontSize: 12, fontWeight: 700, color: form.role === role ? rc.color : 'var(--text-secondary)',
                }}>
                  {hi ? rc.labelHi : rc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="btn-primary" style={{ width: '100%' }} onClick={() => onUpdate(form)}>
          <Check size={16} /> {hi ? 'बदलाव सेव करें' : 'Save Changes'}
        </button>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'var(--red)', border: '1px solid var(--red-light)', background: 'var(--red-light)' }}>
            <Trash2 size={16} /> {hi ? 'स्टाफ हटाएं' : 'Remove Staff'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setConfirmDelete(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button onClick={() => onDelete(staff.id)} style={{ flex: 1, background: 'var(--red)', color: 'white', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 700, cursor: 'pointer' }}>
              Confirm Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
