import React from 'react'
import { LayoutDashboard, Users, FileText, Package, MoreHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'

const TABS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Home',    labelHi: 'होम' },
  { id: 'parties',   icon: Users,          label: 'Parties',  labelHi: 'पार्टी' },
  { id: 'invoices',  icon: FileText,       label: 'Invoice',  labelHi: 'बिल' },
  { id: 'inventory', icon: Package,        label: 'Stock',    labelHi: 'स्टॉक' },
  { id: 'more',      icon: MoreHorizontal, label: 'More',     labelHi: 'और' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  const { language, stats, invoices } = useApp()
  const hi = language === 'hi'
  const unpaidCount = (invoices || []).filter(i => i.status !== 'paid').length
  const moreActive = ['reports', 'cashbook', 'purchase-orders', 'reminders', 'settings', 'staff'].includes(activeTab)

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 480, margin: '0 auto',
      background: 'white', borderTop: '1px solid var(--border)',
      display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)', zIndex: 100,
    }}>
      {TABS.map(tab => {
        const Icon = tab.icon
        const active = tab.id === 'more' ? moreActive : activeTab === tab.id
        const badge = tab.id === 'inventory' && stats.lowStockCount > 0 ? stats.lowStockCount
          : tab.id === 'invoices' && unpaidCount > 0 ? unpaidCount : null
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '10px 4px 8px', background: 'none', border: 'none', cursor: 'pointer', position: 'relative',
          }}>
            {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 3, borderRadius: '0 0 4px 4px', background: 'linear-gradient(90deg, var(--saffron), #FF8C42)' }} />}
            {badge && <div style={{ position: 'absolute', top: 6, right: '18%', minWidth: 16, height: 16, borderRadius: 99, background: 'var(--red)', border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'white', padding: '0 3px' }}>{badge > 9 ? '9+' : badge}</div>}
            <Icon size={21} color={active ? 'var(--saffron)' : 'var(--text-muted)'} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? 'var(--saffron)' : 'var(--text-muted)', fontFamily: active ? 'var(--font-display)' : 'var(--font-body)' }}>
              {hi ? tab.labelHi : tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
