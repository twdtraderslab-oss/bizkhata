import React from 'react'
import { useApp } from '../context/AppContext'
import { Users, Settings, Shield, HelpCircle, FileText, Info, Star, Bell } from 'lucide-react'

export default function MoreMenuScreen({ onNavigate }) {
  const { currentUser, business, language, logout } = useApp()
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
      <div style={{ background: 'var(--surface)', padding: '18px 16px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#F97316' }}>
            {currentUser?.name?.[0] || 'H'}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: '#1E3A5F' }}>{currentUser?.name}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>{business?.name}</div>
            <div style={{ marginTop: 4, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 6, padding: '2px 8px', display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#F97316' }}>Free Plan</div>
          </div>
        </div>
      </div>

      {/* Upgrade Banner */}
      <div onClick={() => onNavigate('upgrade')} style={{ margin: '14px 16px 0', background: 'var(--recovery)', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#4ADE80', fontSize: 11, fontWeight: 700, marginBottom: 3 }}>🚀 UNLOCK RECOVERY FEATURES</div>
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
