import React from 'react'
import { useApp } from '../context/AppContext'
import { Users, Settings, Shield, HelpCircle, FileText, Info, Star, Bell } from 'lucide-react'

export default function MoreMenuScreen({ onNavigate }) {
  const { currentUser, business, language, logout, transactions } = useApp()
  const hi = language === 'hi'

  const sections = [
    {
      title: 'Business',
      items: [
        { id: 'settings', emoji: '⚙️', label: 'Settings', sub: 'Business profile, GST, language' },
        { id: 'staff', emoji: '👥', label: 'Staff Management', sub: 'Add staff, set roles' },
        { id: 'backup', emoji: '💾', label: 'Backup & Restore', sub: 'Download or restore data' },
      ]
    },
    {
      title: 'Company',
      items: [
        { id: 'about', emoji: 'ℹ️', label: 'About HisaabPro', sub: 'Our story & mission' },
        { id: 'privacy', emoji: '🔒', label: 'Privacy Policy', sub: 'How we protect your data' },
        { id: 'terms', emoji: '📄', label: 'Terms & Conditions', sub: 'Usage terms' },
        { id: 'help', emoji: '❓', label: 'Help & Support', sub: 'FAQ, contact us' },
      ]
    },
  ]

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Clean white header */}
      <div style={{ background: 'var(--surface)', padding: '16px 16px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--accent)', flexShrink: 0 }}>
            {currentUser?.name?.[0] || 'H'}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--brand)' }}>{currentUser?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{business?.name}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Current Plan', value: 'Free', color: 'var(--accent)', bg: 'var(--accent-light)' },
            { label: 'Recovered', value: (() => { const m = new Date().getMonth(); const amt = transactions.filter(t=>{const d=new Date(t.date);return t.type==='receipt'&&d.getMonth()===m}).reduce((s,t)=>s+t.amount,0); return amt >= 1000 ? `₹${(amt/1000).toFixed(0)}K` : `₹${amt}` })(), color: 'var(--green)', bg: 'var(--green-light)' },
            { label: 'Upgrade', value: '₹999/yr', color: 'var(--recovery)', bg: 'var(--recovery-light)', action: () => onNavigate('upgrade') },
          ].map((s,i) => (
            <div key={i} onClick={s.action} style={{ background: s.bg, borderRadius: 10, padding: '8px 10px', cursor: s.action ? 'pointer' : 'default' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: s.color, opacity: 0.75, marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Banner */}
      <div onClick={() => onNavigate('upgrade')} style={{ margin: '14px 16px 0', background: 'var(--recovery)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#4ADE80', fontSize: 11, fontWeight: 700, marginBottom: 3, letterSpacing: '0.4px' }}>RECOVER MORE PAYMENTS FASTER</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'white' }}>₹999/year</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 }}>AI Recovery · Auto WhatsApp · UPI Collect</div>
        </div>
        <div style={{ background: '#059669', borderRadius: 10, padding: '8px 14px', color: 'white', fontWeight: 800, fontSize: 13 }}>Upgrade →</div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        {sections.map(section => (
          <div key={section.title} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>{section.title}</div>
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              {section.items.map((item, i) => (
                <div key={item.id} onClick={() => onNavigate(item.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < section.items.length - 1 ? '1px solid #F1F5F9' : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1E3A5F' }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{item.sub}</div>
                  </div>
                  <div style={{ color: '#CBD5E1', fontSize: 16 }}>›</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button onClick={logout} style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1px solid #FEE2E2', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Logout
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#CBD5E1', marginTop: 14 }}>HisaabPro v1.0 · Made with ❤️ in India</p>
      </div>
    </div>
  )
}
