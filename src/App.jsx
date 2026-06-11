import React, { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import AuthScreen from './pages/AuthScreen'
import Dashboard from './pages/Dashboard'
import PartiesScreen from './pages/PartiesScreen'
import PartyDetailScreen from './pages/PartyDetailScreen'
import InvoicesScreen from './pages/InvoicesScreen'
import { InventoryScreen, ReportsScreen } from './pages/OtherScreens'
import SettingsScreen from './pages/SettingsScreen'
import StaffScreen from './pages/StaffScreen'
import CashBookScreen from './pages/CashBookScreen'
import PurchaseOrderScreen from './pages/PurchaseOrderScreen'
import RemindersScreen from './pages/RemindersScreen'
import AutoReminderScreen from './pages/AutoReminderScreen'
import RecoveryDashboard from './pages/RecoveryDashboard'
import BackupScreen from './pages/BackupScreen'
import MoreScreen from './pages/MoreScreen'
import BottomNav from './components/BottomNav'
import AIAgent from './components/AIAgent'

function AppShell() {
  const { currentUser } = useApp()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [partyDetail, setPartyDetail] = useState(null)

  if (!currentUser) return <AuthScreen />

  const navigate = (dest, data) => {
    if (dest === 'party-detail') { setPartyDetail(data); return }
    setPartyDetail(null)
    setActiveTab(dest)
  }

  // Screens accessed from More menu need back button
  const moreScreens = ['cashbook','purchase-orders','reminders','auto-reminders','recovery','backup','staff','reports']
  const goBack = () => setActiveTab('more')

  const wrapWithBack = (screen, component) => {
    if (!moreScreens.includes(screen)) return component
    return (
      <div>
        <div style={{ background: 'var(--indigo)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={goBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', flexShrink: 0 }}>
            ←
          </button>
          <span style={{ color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>← Back to Menu</span>
        </div>
        {component}
      </div>
    )
  }

  const renderScreen = () => {
    if (partyDetail) return <PartyDetailScreen party={partyDetail} onBack={() => setPartyDetail(null)} />
    switch (activeTab) {
      case 'dashboard':       return <Dashboard onNavigate={navigate} />
      case 'parties':         return <PartiesScreen onNavigate={navigate} />
      case 'invoices':        return <InvoicesScreen onNavigate={navigate} />
      case 'inventory':       return wrapWithBack('inventory', <InventoryScreen />)
      case 'reports':         return wrapWithBack('reports', <ReportsScreen />)
      case 'cashbook':        return wrapWithBack('cashbook', <CashBookScreen />)
      case 'purchase-orders': return wrapWithBack('purchase-orders', <PurchaseOrderScreen />)
      case 'reminders':       return wrapWithBack('reminders', <RemindersScreen />)
      case 'auto-reminders':  return wrapWithBack('auto-reminders', <AutoReminderScreen />)
      case 'recovery':        return wrapWithBack('recovery', <RecoveryDashboard />)
      case 'backup':          return wrapWithBack('backup', <BackupScreen />)
      case 'settings':        return <SettingsScreen onNavigate={navigate} />
      case 'staff':           return wrapWithBack('staff', <StaffScreen />)
      case 'more':            return <MoreScreen onNavigate={navigate} />
      default:                return <Dashboard onNavigate={navigate} />
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ paddingBottom: 72, minHeight: '100vh', overflowY: 'auto' }}>
        {renderScreen()}
      </div>
      <BottomNav activeTab={partyDetail ? 'parties' : activeTab} onTabChange={(tab) => { setPartyDetail(null); setActiveTab(tab) }} />
      <AIAgent />
    </div>
  )
}

export default function App() {
  return <AppProvider><AppShell /></AppProvider>
}
