import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { resetPassword } from '../utils/supabase.js'
import { Building2, Globe, Shield, Bell, HelpCircle, LogOut, ChevronRight, Crown, Users } from 'lucide-react'

export default function SettingsScreen({ onNavigate }) {
  const { currentUser, logout, business, setBusiness, language, setLanguage } = useApp()
  const hi = language === 'hi'
  const [showBusinessModal, setShowBusinessModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showNotifModal, setShowNotifModal] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showPwdModal, setShowPwdModal] = useState(false)

  const sections = [
    {
      title: hi ? 'बिज़नेस' : 'Business',
      items: [
        { icon: <Building2 size={18} color="var(--indigo)" />, label: hi ? 'बिज़नेस प्रोफाइल' : 'Business Profile', sub: business?.name, action: () => setShowBusinessModal(true) },
        { icon: <Users size={18} color="var(--indigo)" />, label: hi ? 'स्टाफ प्रबंधन' : 'Staff Management', sub: hi ? 'स्टाफ जोड़ें, भूमिकाएं सेट करें' : 'Add staff, set roles & permissions', action: () => onNavigate('staff') },
        { icon: <Crown size={18} color="var(--amber)" />, label: hi ? 'Recovery Center — ₹999/yr' : 'Unlock Recovery Center — ₹999/yr', sub: hi ? 'Free: Record keeping · Paid: Payment Recovery' : 'Free: All record keeping · Paid: AI Recovery + UPI', action: () => setShowPlanModal(true), highlight: true },
      ]
    },
    {
      title: hi ? 'प्राथमिकताएं' : 'Preferences',
      items: [
        { icon: <Globe size={18} color="var(--indigo-mid)" />, label: hi ? 'भाषा' : 'Language', sub: language === 'hi' ? 'हिंदी' : 'English', action: () => setLanguage(language === 'hi' ? 'en' : 'hi') },
        { icon: <Bell size={18} color="var(--brand)" />, label: hi ? 'नोटिफिकेशन' : 'Notifications', sub: hi ? 'चालू' : 'Enabled', action: () => setShowNotifModal(true) },
        { icon: <Shield size={18} color="var(--brand)" />, label: hi ? 'सुरक्षा और PIN' : 'Security & PIN', sub: hi ? 'PIN सेट करें' : 'Set app PIN lock', action: () => setShowPinModal(true) },
      ]
    },
    {
      title: hi ? 'सहायता' : 'Support',
      items: [
        { icon: <HelpCircle size={18} color="var(--brand)" />, label: hi ? 'मदद और सहायता' : 'Help & Support', sub: hi ? 'FAQ, हमसे संपर्क करें' : 'FAQ, contact us', action: () => setShowHelpModal(true) },
      ]
    }
  ]

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'var(--brand)', padding: '28px 20px 32px', borderRadius: '0 0 28px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'white' }}>
            {currentUser?.name?.[0] || 'U'}
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'white' }}>{currentUser?.name}</h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>+91 {currentUser?.phone}</p>
            <div style={{ marginTop: 6 }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 99, padding: '3px 12px', fontSize: 12, color: 'white', fontWeight: 600 }}>
                {currentUser?.role || 'Owner'} · Free Plan
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sections.map(section => (
          <div key={section.title}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>{section.title}</p>
            <div className="card" style={{ overflow: 'hidden' }}>
              {section.items.map((item, i) => (
                <div key={i} onClick={item.action}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: i < section.items.length - 1 ? '1px solid var(--border-light)' : 'none', cursor: 'pointer', transition: 'background 0.15s', background: item.highlight ? 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' : 'white' }}
                  onMouseEnter={e => !item.highlight && (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={e => !item.highlight && (e.currentTarget.style.background = 'white')}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: item.highlight ? 'var(--amber-light)' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: item.highlight ? 'var(--amber)' : 'var(--text-primary)' }}>{item.label}</div>
                    {item.sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{item.sub}</div>}
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={logout} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', color: 'var(--red)', border: '1px solid var(--red-light)', background: 'var(--red-light)' }}>
          <LogOut size={16} /> {hi ? 'लॉगआउट' : 'Logout'}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', paddingBottom: 8 }}>HisaabPro v3.0 · Made with ❤️ in India</p>
      </div>

      {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
      {showNotifModal && <SimpleModal title="Notifications" onClose={() => setShowNotifModal(false)}>
        <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.7}}>
          Push notifications are enabled by default.<br/><br/>
          • Overdue invoice alerts<br/>
          • Low stock warnings<br/>
          • Payment reminders<br/><br/>
          To manage notifications, go to your phone Settings → HisaabPro → Notifications.
        </p>
      </SimpleModal>}
      {showPinModal && <SimpleModal title="Security & PIN" onClose={() => setShowPinModal(false)}>
        <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.7}}>
          PIN lock feature is coming soon!<br/><br/>
          This will allow you to:<br/>
          • Set a 4-digit PIN to open the app<br/>
          • Protect your business data<br/>
          • Enable biometric unlock<br/><br/>
          For now, your account is secured by your email password.
        </p>
      </SimpleModal>}
      {showHelpModal && <SimpleModal title="Help & Support" onClose={() => setShowHelpModal(false)}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {[
            {q:'How to add a customer?', a:'Hisaab → Parties → tap + button'},
            {q:'How to create an invoice?', a:'Hisaab → Invoices → tap + button'},
            {q:'How does Recovery Score work?', a:'Based on unpaid invoices, outstanding amount, and overdue days.'},
            {q:'How to send WhatsApp reminder?', a:'Recovery tab → Priority Follow-Ups → WhatsApp button'},
            {q:'How to export data?', a:'Hisaab → Reports → Export section → Excel or PDF'},
          ].map((item,i) => (
            <div key={i} style={{background:'var(--bg)',borderRadius:10,padding:'12px 14px'}}>
              <div style={{fontWeight:700,fontSize:13,color:'var(--brand)',marginBottom:4}}>Q: {item.q}</div>
              <div style={{fontSize:13,color:'var(--text-secondary)'}}>{item.a}</div>
            </div>
          ))}
          <div style={{background:'var(--recovery-light)',borderRadius:10,padding:'12px 14px',border:'1px solid var(--green-light)'}}>
            <div style={{fontWeight:700,fontSize:13,color:'var(--recovery)',marginBottom:3}}>Contact Support</div>
            <div style={{fontSize:13,color:'var(--text-secondary)'}}>WhatsApp: +91 98765 43210<br/>Email: support@hisaabpro.app</div>
          </div>
        </div>
      </SimpleModal>}
      {showPwdModal && <PasswordResetModal onClose={() => setShowPwdModal(false)} />}
      {showBusinessModal && <BusinessModal onClose={() => setShowBusinessModal(false)} />}
    </div>
  )
}

function PlanModal({ onClose }) {
  const features = [
    { label: 'Parties & Customers', free: 'Unlimited ✓', pro: 'Unlimited ✓' },
    { label: 'Transactions & Ledger', free: 'Unlimited ✓', pro: 'Unlimited ✓' },
    { label: 'Invoicing & Billing', free: 'Unlimited ✓', pro: 'Unlimited ✓' },
    { label: 'Inventory Management', free: 'Unlimited ✓', pro: 'Unlimited ✓' },
    { label: '─── RECOVERY FEATURES ───', free: '─', pro: '─' },
    { label: 'Payment Recovery Center', free: '✗', pro: '✓ Included' },
    { label: 'AI Recovery Agent', free: '✗', pro: '✓ Included' },
    { label: 'UPI Collect Links', free: '✗', pro: '✓ Included' },
    { label: 'Auto Reminder (Day 0-30)', free: '✗', pro: '✓ Included' },
    { label: 'Recovery Analytics', free: '✗', pro: '✓ Included' },
    { label: '─── REPORTS ───', free: '─', pro: '─' },
    { label: 'Basic Reports', free: '✓', pro: '✓' },
    { label: 'PDF Reports', free: '✗', pro: '✓' },
    { label: 'Excel Export', free: '✗', pro: '✓' },
    { label: 'GST Reports', free: '✗', pro: '✓' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--indigo)' }}>Upgrade to Premium 👑</h3>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Grow your business without limits</p>
        <div style={{ background: 'var(--brand)', borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 900, color: 'white' }}>₹999</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>per year · save ₹3,000 vs monthly</div>
          <div style={{ color: '#4ADE80', fontSize: 13, fontWeight: 600, marginTop: 6 }}>🎉 Basic features FREE forever · Recovery = ₹999/yr</div>
        </div>
        <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '11px 14px', borderBottom: i < features.length - 1 ? '1px solid var(--border-light)' : 'none', fontSize: 13, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{f.label}</span>
              <span style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{f.free}</span>
              <span style={{ color: 'var(--green)', fontWeight: 700, textAlign: 'center' }}>{f.pro}</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" style={{ width: '100%' }}><Crown size={16} /> Start Free Trial</button>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 10 }}>Coming soon · Powered by Razorpay</p>
      </div>
    </div>
  )
}

function BusinessModal({ onClose }) {
  const { business, setBusiness, language } = useApp()
  const hi = language === 'hi'
  const [form, setForm] = useState({ gstEnabled: true, gstRate: 5, ...business })

  const GST_RATES = [0, 3, 5, 12, 18, 28]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)' }}>{hi ? 'बिज़नेस प्रोफाइल' : 'Business Profile'}</h3>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'name', label: 'Business Name', labelHi: 'बिज़नेस का नाम', placeholder: 'Sharma Traders' },
            { key: 'ownerName', label: 'Owner Name', labelHi: 'मालिक का नाम', placeholder: 'Ramesh Sharma' },
            { key: 'phone', label: 'Phone', labelHi: 'फ़ोन', placeholder: '9876543210' },
            { key: 'address', label: 'Address', labelHi: 'पता', placeholder: 'Shop No., City, State' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{hi ? f.labelHi : f.label}</label>
              <input className="input-field" placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
            </div>
          ))}

          {/* GST Toggle Section */}
          <div className="card" style={{ padding: 16, border: form.gstEnabled ? '2px solid var(--green)' : '1.5px solid var(--border)', background: form.gstEnabled ? 'var(--green-light)' : 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: form.gstEnabled ? 14 : 0 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: form.gstEnabled ? 'var(--green)' : 'var(--text-primary)' }}>
                  {form.gstEnabled ? '✅' : '⬜'} {hi ? 'GST चालू है' : 'GST Enabled'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {hi ? 'इनवॉइस पर GST जोड़ें' : 'Add GST to invoices automatically'}
                </div>
              </div>
              {/* Toggle Switch */}
              <div onClick={() => setForm(f => ({ ...f, gstEnabled: !f.gstEnabled }))}
                style={{ width: 52, height: 28, borderRadius: 99, background: form.gstEnabled ? 'var(--green)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: form.gstEnabled ? 27 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </div>
            </div>

            {form.gstEnabled && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    {hi ? 'GST दर' : 'GST Rate'}
                  </label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {GST_RATES.map(rate => (
                      <button key={rate} onClick={() => setForm(f => ({ ...f, gstRate: rate }))} style={{
                        padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        border: form.gstRate === rate ? 'none' : '1.5px solid var(--border)',
                        background: form.gstRate === rate ? 'var(--green)' : 'white',
                        color: form.gstRate === rate ? 'white' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                      }}>{rate}%</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    GSTIN {hi ? '(वैकल्पिक)' : '(optional)'}
                  </label>
                  <input className="input-field" style={{ background: 'white' }} placeholder="24AAXXX1234F1Z5"
                    value={form.gstin || ''} onChange={e => setForm(prev => ({ ...prev, gstin: e.target.value }))} />
                </div>
                <div style={{ marginTop: 10, background: 'white', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: 'var(--green)' }}>
                  ✅ {hi ? `इनवॉइस पर ${form.gstRate}% GST automatically जुड़ेगा` : `${form.gstRate}% GST will be added automatically to all invoices`}
                </div>
              </>
            )}

            {!form.gstEnabled && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                ℹ️ {hi ? 'इनवॉइस पर कोई GST नहीं जोड़ा जाएगा' : 'No GST will be added to invoices — simple billing mode'}
              </div>
            )}
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={() => { setBusiness(form); onClose() }}>
            {hi ? 'सेव करें ✓' : 'Save Changes ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}


// ── Simple Modal wrapper ─────────────────────────────────────────────────────
function SimpleModal({ title, onClose, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end', backdropFilter:'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width:'100%', borderRadius:'24px 24px 0 0', padding:'24px 20px 40px', maxHeight:'80vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--brand)' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'var(--bg)', border:'none', borderRadius:10, width:32, height:32, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Password Reset Modal ─────────────────────────────────────────────────────
function PasswordResetModal({ onClose }) {
  const { currentUser } = useApp()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async () => {
    setLoading(true)
    setError('')
    try {
      await resetPassword(currentUser?.email || '', window.location.origin)
      setSent(true)
    } catch (e) {
      setError('Failed to send reset email. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end', backdropFilter:'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width:'100%', borderRadius:'24px 24px 0 0', padding:'24px 20px 40px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:18, fontWeight:700, color:'var(--brand)' }}>Change Password</h3>
          <button onClick={onClose} style={{ background:'var(--bg)', border:'none', borderRadius:10, width:32, height:32, cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)' }}>✕</button>
        </div>
        {sent ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:18, color:'var(--green)', marginBottom:8 }}>Reset Email Sent!</div>
            <div style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>Check your inbox at <strong>{currentUser?.email}</strong>.<br/>Click the link to set a new password.</div>
            <button onClick={onClose} className="btn-primary" style={{ width:'100%', marginTop:20 }}>Done</button>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6 }}>
              A password reset link will be sent to:<br/>
              <strong style={{ color:'var(--brand)' }}>{currentUser?.email}</strong>
            </p>
            {error && <p style={{ color:'var(--red)', fontSize:13 }}>{error}</p>}
            <button className="btn-primary" style={{ width:'100%' }} onClick={handleReset} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
