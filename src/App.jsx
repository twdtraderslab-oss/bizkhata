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

  const renderScreen = () => {
    if (partyDetail) return <PartyDetailScreen party={partyDetail} onBack={() => setPartyDetail(null)} />
    switch (activeTab) {
      case 'dashboard':       return <Dashboard onNavigate={navigate} />
      case 'parties':         return <PartiesScreen onNavigate={navigate} />
      case 'invoices':        return <InvoicesScreen onNavigate={navigate} />
      case 'inventory':       return <InventoryScreen />
      case 'reports':         return <ReportsScreen />
      case 'cashbook':        return <CashBookScreen />
      case 'purchase-orders': return <PurchaseOrderScreen />
      case 'reminders':       return <RemindersScreen />
      case 'auto-reminders':  return <AutoReminderScreen />
      case 'recovery':        return <RecoveryDashboard />
      case 'backup':          return <BackupScreen />
      case 'settings':        return <SettingsScreen onNavigate={navigate} />
      case 'staff':           return <StaffScreen />
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
