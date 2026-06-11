import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { UserPlus, Shield, Crown, User, Edit2, Trash2, Check, X } from 'lucide-react'

const ROLES = {
  owner:   { label: 'Owner',   labelHi: 'मालिक',    color: 'var(--saffron)', bg: 'var(--saffron-light)', icon: <Crown size={14}/>,  desc: 'Full access to everything' },
  manager: { label: 'Manager', labelHi: 'मैनेजर',   color: 'var(--indigo)',  bg: 'var(--indigo-light)',  icon: <Shield size={14}/>, desc: 'All except settings & staff' },
  staff:   { label: 'Staff',   labelHi: 'स्टाफ',    color: 'var(--green)',   bg: 'var(--green-light)',   icon: <User size={14}/>,   desc: 'View & add transactions only' },
}

const PERMISSIONS = {
  owner:   { dashboard: true,  parties: true,  transactions: true,  invoices: true,  inventory: true,  reports: true,  settings: true,  staff: true,  export: true,  delete: true  },
  manager: { dashboard: true,  parties: true,  transactions: true,  invoices: true,  inventory: true,  reports: true,  settings: false, staff: false, export: true,  delete: false },
  staff:   { dashboard: true,  parties: true,  transactions: true,  invoices: false, inventory: false, reports: false, settings: false, staff: false, export: false, delete: false },
}

const PERM_LABELS = [
  { key: 'dashboard',    label: 'View Dashboard' },
  { key: 'parties',      label: 'Manage Parties' },
  { key: 'transactions', label: 'Add Transactions' },
  { key: 'invoices',     label: 'Create Invoices' },
  { key: 'inventory',    label: 'Manage Inventory' },
  { key: 'reports',      label: 'View Reports' },
  { key: 'export',       label: 'Export Data' },
  { key: 'settings',     label: 'Change Settings' },
  { key: 'staff',        label: 'Manage Staff' },
  { key: 'delete',       label: 'Delete Records' },
]

const SEED_STAFF = [
  { id: 'U001', name: 'Ramesh Sharma', phone: '9876543210', role: 'owner',   status: 'active', joinDate: '2026-01-01' },
  { id: 'U002', name: 'Suresh Patel',  phone: '9812345678', role: 'manager', status: 'active', joinDate: '2026-03-15' },
  { id: 'U003', name: 'Amit Kumar',    phone: '9823456789', role: 'staff',   status: 'active', joinDate: '2026-05-01' },
]

export default function StaffScreen() {
  const { language, business } = useApp()
  const hi = language === 'hi'
  const [staff, setStaff] = useState(() => {
    const saved = localStorage.getItem('hisaabpro_staff')
    return saved ? JSON.parse(saved) : SEED_STAFF
  })
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPermsModal, setShowPermsModal] = useState(null)
  const [editStaff, setEditStaff] = useState(null)

  const saveStaff = (newStaff) => {
    setStaff(newStaff)
    localStorage.setItem('hisaabpro_staff', JSON.stringify(newStaff))
  }

  const removeStaff = (id) => {
    if (window.confirm('Remove this staff member?')) {
      saveStaff(staff.filter(s => s.id !== id))
    }
  }

  const toggleStatus = (id) => {
    saveStaff(staff.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'var(--brand)', padding: '24px 16px 28px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white' }}>
              {hi ? 'स्टाफ प्रबंधन' : 'Staff Management'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 3 }}>{business?.name}</p>
          </div>
          <button onClick={() => setShowAddModal(true)} style={{
            background: 'var(--saffron)', border: 'none', borderRadius: 12, padding: '9px 14px',
            color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <UserPlus size={15} /> {hi ? 'जोड़ें' : 'Add Staff'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {Object.entries(ROLES).map(([role, config]) => (
            <div key={role} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'white' }}>
                {staff.filter(s => s.role === role && s.status === 'active').length}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 }}>{hi ? config.labelHi : config.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Free plan notice */}
        {staff.length >= 3 && (
          <div style={{ background: 'var(--amber-light)', border: '1px solid #FCD34D', borderRadius: 12, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Crown size={16} color="var(--amber)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--amber)' }}>Free Plan: Up to 3 staff</div>
              <div style={{ fontSize: 12, color: 'var(--amber)', opacity: 0.8 }}>Upgrade to Premium for up to 10 staff members</div>
            </div>
          </div>
        )}

        {/* Staff List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {staff.map(member => {
            const roleConfig = ROLES[member.role]
            return (
              <div key={member.id} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: roleConfig.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: roleConfig.color,
                  }}>
                    {member.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{member.name}</span>
                      {member.role === 'owner' && <span style={{ fontSize: 10, background: 'var(--saffron)', color: 'white', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📞 {member.phone}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {member.role !== 'owner' && (
                      <>
                        <button onClick={() => toggleStatus(member.id)} style={{
                          background: member.status === 'active' ? 'var(--green-light)' : 'var(--red-light)',
                          border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                          color: member.status === 'active' ? 'var(--green)' : 'var(--red)',
                        }}>
                          {member.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                        <button onClick={() => removeStaff(member.id)} style={{ background: 'var(--red-light)', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'var(--red)' }}>
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Role + Permissions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: roleConfig.bg, borderRadius: 99, padding: '5px 12px' }}>
                    {roleConfig.icon}
                    <span style={{ fontSize: 12, fontWeight: 700, color: roleConfig.color }}>{hi ? roleConfig.labelHi : roleConfig.label}</span>
                  </div>
                  <button onClick={() => setShowPermsModal(member)} style={{ background: 'var(--bg)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Shield size={13} /> View Permissions
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Roles Explanation */}
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--indigo)' }}>
            {hi ? 'भूमिकाओं की जानकारी' : 'Role Permissions Guide'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden', borderRadius: 10, border: '1px solid var(--border)' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3,60px)', padding: '10px 14px', background: 'var(--indigo)', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>Permission</span>
              {Object.entries(ROLES).map(([role, config]) => (
                <span key={role} style={{ fontSize: 11, fontWeight: 700, color: config.color, textAlign: 'center', textTransform: 'uppercase' }}>{config.label[0]}</span>
              ))}
            </div>
            {PERM_LABELS.map((perm, i) => (
              <div key={perm.key} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3,60px)', padding: '9px 14px', gap: 8, background: i % 2 === 0 ? 'white' : 'var(--bg)', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{perm.label}</span>
                {Object.keys(ROLES).map(role => (
                  <div key={role} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {PERMISSIONS[role][perm.key]
                      ? <Check size={14} color="var(--green)" strokeWidth={3} />
                      : <X size={14} color="var(--red)" strokeWidth={3} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>O = Owner</span><span>M = Manager</span><span>S = Staff</span>
          </div>
        </div>
      </div>

      {showAddModal && <AddStaffModal onClose={() => setShowAddModal(false)} onAdd={(s) => { saveStaff([...staff, { ...s, id: `U${Date.now()}`, status: 'active', joinDate: new Date().toISOString().split('T')[0] }]); setShowAddModal(false) }} />}
      {showPermsModal && <PermissionsModal member={showPermsModal} onClose={() => setShowPermsModal(null)} />}
    </div>
  )
}

// ── Add Staff Modal ───────────────────────────────────────────────────────────
function AddStaffModal({ onClose, onAdd }) {
  const { language } = useApp()
  const hi = language === 'hi'
  const [form, setForm] = useState({ name: '', phone: '', role: 'staff' })
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!form.name.trim()) { setError('Name required'); return }
    if (form.phone.length !== 10) { setError('Enter valid 10-digit phone'); return }
    onAdd(form)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)' }}>
            {hi ? 'नया स्टाफ जोड़ें' : 'Add New Staff'}
          </h3>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? 'नाम *' : 'Full Name *'}</label>
            <input className="input-field" placeholder="e.g. Suresh Patel" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? 'मोबाइल नंबर *' : 'Mobile Number *'}</label>
            <input className="input-field" type="tel" maxLength={10} placeholder="10-digit number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>{hi ? 'भूमिका' : 'Role'}</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {Object.entries(ROLES).filter(([r]) => r !== 'owner').map(([role, config]) => (
                <button key={role} onClick={() => setForm(f => ({ ...f, role }))} style={{
                  flex: 1, padding: '12px 8px', borderRadius: 12, cursor: 'pointer', border: form.role === role ? 'none' : '1.5px solid var(--border)',
                  background: form.role === role ? config.bg : 'white',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{config.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.role === role ? config.color : 'var(--text-secondary)' }}>{hi ? config.labelHi : config.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{config.desc}</div>
                </button>
              ))}
            </div>
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
          <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--amber)' }}>
            ℹ️ Staff will login with their phone number. They'll see only what their role allows.
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={handleSave}>
            {hi ? 'स्टाफ जोड़ें ✓' : 'Add Staff Member ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Permissions Modal ─────────────────────────────────────────────────────────
function PermissionsModal({ member, onClose }) {
  const roleConfig = ROLES[member.role]
  const perms = PERMISSIONS[member.role]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--indigo)' }}>{member.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, background: roleConfig.bg, borderRadius: 99, padding: '4px 10px', display: 'inline-flex' }}>
              {roleConfig.icon}
              <span style={{ fontSize: 12, fontWeight: 700, color: roleConfig.color }}>{roleConfig.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div className="card" style={{ overflow: 'hidden' }}>
          {PERM_LABELS.map((perm, i) => (
            <div key={perm.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: i < PERM_LABELS.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{perm.label}</span>
              {perms[perm.key]
                ? <span style={{ background: 'var(--green-light)', color: 'var(--green)', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Allowed</span>
                : <span style={{ background: 'var(--red-light)', color: 'var(--red)', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><X size={12} /> Restricted</span>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
