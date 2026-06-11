import React from 'react'
import { Home, BookOpen, TrendingUp, Settings } from 'lucide-react'
import { useApp } from '../context/AppContext'

const TABS = [
  { id: 'home',     icon: Home,        label: 'Home',    labelHi: 'होम' },
  { id: 'hisaab',  icon: BookOpen,     label: 'Hisaab',  labelHi: 'हिसाब' },
  { id: 'recovery',icon: TrendingUp,   label: 'Recovery',labelHi: 'रिकवरी' },
  { id: 'more',    icon: Settings,     label: 'More',    labelHi: 'अधिक' },
]

export default function BottomNav({ activeTab, onTabChange }) {
  const { language, stats, invoices, parties } = useApp()
  const hi = language === 'hi'
  const overdueCount = (invoices||[]).filter(i => i.status !== 'paid' && new Date(i.dueDate) < new Date()).length
  const recoveryBadge = overdueCount + stats.lowStockCount
  const hisaabBadge = (invoices||[]).filter(i => i.status === 'unpaid').length

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480,
      background: 'white', borderTop: '1px solid #E2E8F0',
      display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.06)', zIndex: 100,
    }}>
      {TABS.map(tab => {
        const Icon = tab.icon
        const active = activeTab === tab.id
        const badge = tab.id === 'recovery' && recoveryBadge > 0 ? recoveryBadge
          : tab.id === 'hisaab' && hisaabBadge > 0 ? hisaabBadge : null
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '10px 4px 8px', background: 'none', border: 'none',
            cursor: 'pointer', position: 'relative', transition: 'all 0.15s',
          }}>
            {active && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 32, height: 3, borderRadius: '0 0 4px 4px', background: tab.id === 'recovery' ? '#059669' : '#1E3A5F' }} />}
            {badge && <div style={{ position: 'absolute', top: 6, right: '16%', minWidth: 16, height: 16, borderRadius: 99, background: '#DC2626', border: '1.5px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'white', padding: '0 3px' }}>{badge > 9 ? '9+' : badge}</div>}
            <Icon size={21}
              color={active ? (tab.id === 'recovery' ? '#059669' : '#1E3A5F') : '#94A3B8'}
              strokeWidth={active ? 2.5 : 1.8} />
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 400,
              color: active ? (tab.id === 'recovery' ? '#059669' : '#1E3A5F') : '#94A3B8',
            }}>{hi ? tab.labelHi : tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
