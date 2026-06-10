import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Building2, Globe, Shield, Bell, HelpCircle, LogOut, ChevronRight, Crown, Users } from 'lucide-react'

export default function SettingsScreen({ onNavigate }) {
  const { currentUser, logout, business, setBusiness, language, setLanguage } = useApp()
  const hi = language === 'hi'
  const [showBusinessModal, setShowBusinessModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)

  const sections = [
    {
      title: hi ? 'बिज़नेस' : 'Business',
      items: [
        { icon: <Building2 size={18} color="var(--indigo)" />, label: hi ? 'बिज़नेस प्रोफाइल' : 'Business Profile', sub: business?.name, action: () => setShowBusinessModal(true) },
        { icon: <Users size={18} color="var(--indigo)" />, label: hi ? 'स्टाफ प्रबंधन' : 'Staff Management', sub: hi ? 'स्टाफ जोड़ें, भूमिकाएं सेट करें' : 'Add staff, set roles & permissions', action: () => onNavigate('staff') },
        { icon: <Crown size={18} color="var(--amber)" />, label: hi ? 'प्लान अपग्रेड करें' : 'Upgrade to Premium', sub: hi ? 'अभी फ्री प्लान पर हैं' : 'Currently on Free plan', action: () => setShowPlanModal(true), highlight: true },
      ]
    },
    {
      title: hi ? 'प्राथमिकताएं' : 'Preferences',
      items: [
        { icon: <Globe size={18} color="var(--indigo-mid)" />, label: hi ? 'भाषा' : 'Language', sub: language === 'hi' ? 'हिंदी' : 'English', action: () => setLanguage(language === 'hi' ? 'en' : 'hi') },
        { icon: <Bell size={18} color="var(--indigo-mid)" />, label: hi ? 'नोटिफिकेशन' : 'Notifications', sub: hi ? 'चालू' : 'Enabled', action: () => {} },
        { icon: <Shield size={18} color="var(--indigo-mid)" />, label: hi ? 'सुरक्षा और PIN' : 'Security & PIN', sub: hi ? 'PIN सेट करें' : 'Set app PIN lock', action: () => {} },
      ]
    },
    {
      title: hi ? 'सहायता' : 'Support',
      items: [
        { icon: <HelpCircle size={18} color="var(--text-muted)" />, label: hi ? 'मदद और सहायता' : 'Help & Support', sub: hi ? 'FAQ, हमसे संपर्क करें' : 'FAQ, contact us', action: () => {} },
      ]
    }
  ]

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', padding: '28px 20px 32px', borderRadius: '0 0 28px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, var(--saffron), #FF8C42)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'white' }}>
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
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', paddingBottom: 8 }}>BizKhata v3.0 · Made with ❤️ in India</p>
      </div>

      {showPlanModal && <PlanModal onClose={() => setShowPlanModal(false)} />}
      {showBusinessModal && <BusinessModal onClose={() => setShowBusinessModal(false)} />}
    </div>
  )
}

function PlanModal({ onClose }) {
  const features = [
    { label: 'Parties', free: 'Up to 50', pro: 'Unlimited' },
    { label: 'Transactions/month', free: '100', pro: 'Unlimited' },
    { label: 'Staff accounts', free: '3', pro: 'Up to 10' },
    { label: 'Products', free: 'Up to 30', pro: 'Unlimited' },
    { label: 'Reports & PDF export', free: 'Basic', pro: 'All reports' },
    { label: 'WhatsApp reminders', free: '10/month', pro: 'Unlimited' },
    { label: 'Google Drive backup', free: '✗', pro: '✓' },
    { label: 'Branded invoices', free: '✗', pro: '✓' },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--indigo)' }}>Upgrade to Premium 👑</h3>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Grow your business without limits</p>
        <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', borderRadius: 16, padding: 20, marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 800, color: 'white' }}>₹299</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>per month · cancel anytime</div>
          <div style={{ color: '#4ADE80', fontSize: 13, fontWeight: 600, marginTop: 6 }}>🎉 First month FREE for early users</div>
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
  const [form, setForm] = useState({ ...business })
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="card slide-up" style={{ width: '100%', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)' }}>{hi ? 'बिज़नेस प्रोफाइल' : 'Business Profile'}</h3>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'name', label: 'Business Name', placeholder: 'Sharma Traders' },
            { key: 'ownerName', label: 'Owner Name', placeholder: 'Ramesh Sharma' },
            { key: 'phone', label: 'Phone', placeholder: '9876543210' },
            { key: 'address', label: 'Address', placeholder: 'Shop No., City, State' },
            { key: 'gstin', label: 'GSTIN (optional)', placeholder: '24AAXXX1234F1Z5' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{f.label}</label>
              <input className="input-field" placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
            </div>
          ))}
          <button className="btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={() => { setBusiness(form); onClose() }}>
            {hi ? 'सेव करें ✓' : 'Save Changes ✓'}
          </button>
        </div>
      </div>
    </div>
  )
}
