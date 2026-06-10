import React from 'react'
import { useApp } from '../context/AppContext'
import { BookOpen, ShoppingCart, Bell, BarChart2, Settings, Users, TrendingUp } from 'lucide-react'

export default function MoreScreen({ onNavigate }) {
  const { language, stats, invoices, parties } = useApp()
  const hi = language === 'hi'

  const overdueCount = (invoices || []).filter(i => i.status !== 'paid' && new Date(i.dueDate) < new Date()).length
  const outstandingParties = parties.filter(p => p.balance > 0 && p.balanceType === 'to_receive').length

  const menuItems = [
    {
      title: hi ? 'कैश बुक' : 'Cash Book',
      subtitle: hi ? 'रोज़ाना नकद हिसाब' : 'Daily cash in & out',
      emoji: '💰', color: '#16A34A', bg: '#DCFCE7',
      screen: 'cashbook',
    },
    {
      title: hi ? 'खरीद ऑर्डर' : 'Purchase Orders',
      subtitle: hi ? 'सप्लायर को ऑर्डर करें' : 'Order from suppliers',
      emoji: '📋', color: '#7C3AED', bg: '#F3E8FF',
      screen: 'purchase-orders',
    },
    {
      title: hi ? 'रिमाइंडर & अलर्ट' : 'Reminders & Alerts',
      subtitle: hi ? 'बकाया वसूली तेज़ करें' : 'Collect payments faster',
      emoji: '📱', color: '#0369A1', bg: '#E0F2FE',
      screen: 'reminders',
      badge: overdueCount > 0 ? overdueCount : null,
      badgeColor: 'var(--red)',
    },
    {
      title: hi ? 'रिपोर्ट' : 'Reports',
      subtitle: hi ? 'GST, P&L, Monthly, Yearly PDF' : 'GST, P&L, Monthly, Yearly PDF',
      emoji: '📊', color: 'var(--saffron)', bg: 'var(--saffron-light)',
      screen: 'reports',
    },
    {
      title: hi ? 'स्टाफ प्रबंधन' : 'Staff Management',
      subtitle: hi ? 'स्टाफ जोड़ें, भूमिकाएं सेट करें' : 'Add staff, set permissions',
      emoji: '👥', color: 'var(--indigo)', bg: 'var(--indigo-light)',
      screen: 'staff',
    },
    {
      title: hi ? 'बैकअप & रिस्टोर' : 'Backup & Restore',
      subtitle: hi ? 'डेटा सुरक्षित रखें, restore करें' : 'Keep data safe, restore anytime',
      emoji: '💾', color: '#0369A1', bg: '#E0F2FE',
      screen: 'backup',
    },
    {
      title: hi ? 'सेटिंग' : 'Settings',
      subtitle: hi ? 'बिज़नेस प्रोफाइल, भाषा' : 'Business profile, language',
      emoji: '⚙️', color: 'var(--text-secondary)', bg: 'var(--bg)',
      screen: 'settings',
    },
  ]

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--indigo), var(--indigo-mid))', padding: '24px 16px 28px', borderRadius: '0 0 24px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>
          {hi ? 'सभी फीचर' : 'All Features'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
          {hi ? 'अपने बिज़नेस के सभी टूल्स' : 'Complete business toolkit'}
        </p>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { label: hi ? 'बकायेदार ग्राहक' : 'Outstanding Customers', value: outstandingParties, color: 'var(--green)', bg: 'var(--green-light)', emoji: '👥' },
            { label: hi ? 'अतिदेय इनवॉइस' : 'Overdue Invoices', value: overdueCount, color: overdueCount > 0 ? 'var(--red)' : 'var(--green)', bg: overdueCount > 0 ? 'var(--red-light)' : 'var(--green-light)', emoji: overdueCount > 0 ? '⚠️' : '✅' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 14, background: s.bg, border: 'none' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.emoji}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {menuItems.map((item, i) => (
            <div key={i} className="card" onClick={() => onNavigate(item.screen)}
              style={{ padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
            >
              <div style={{ width: 52, height: 52, borderRadius: 14, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                {item.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: item.color, marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.subtitle}</div>
              </div>
              {item.badge && (
                <div style={{ background: item.badgeColor, color: 'white', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {item.badge}
                </div>
              )}
              <div style={{ color: 'var(--text-muted)', flexShrink: 0 }}>›</div>
            </div>
          ))}
        </div>

        {/* Version */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '20px 0 0' }}>
          HisaabPro v4.0 · Made with ❤️ in India
        </p>
      </div>
    </div>
  )
}
