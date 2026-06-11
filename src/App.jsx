import React, { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import AuthScreen from './pages/AuthScreen'
import Dashboard from './pages/Dashboard'
import HisaabScreen from './pages/HisaabScreen'
import RecoveryScreen from './pages/RecoveryScreen'
import MoreMenuScreen from './pages/MoreMenuScreen'
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
import { AboutPage, PrivacyPage, TermsPage, HelpPage, UpgradePage } from './pages/StaticPages'
import BottomNav from './components/BottomNav'
// AI Agent integrated into Recovery tab

function AppShell() {
  const { currentUser } = useApp()
  const [activeTab, setActiveTab] = useState('home')
  const [screen, setScreen] = useState(null) // sub-screen
  const [partyDetail, setPartyDetail] = useState(null)

  if (!currentUser) return <AuthScreen />

  const navigate = (dest, data) => {
    if (dest === 'party-detail') { setPartyDetail(data); return }
    setPartyDetail(null)
    // Map destinations to tabs + sub-screens
    const tabMap = {
      home: 'home', hisaab: 'hisaab', recovery: 'recovery', more: 'more',
      parties: 'hisaab', invoices: 'hisaab', inventory: 'hisaab',
      cashbook: 'hisaab', reports: 'hisaab', 'purchase-orders': 'hisaab',
      reminders: 'recovery', 'auto-reminders': 'recovery', 'recovery-dashboard': 'recovery',
      settings: 'more', staff: 'more', backup: 'more',
      about: 'more', privacy: 'more', terms: 'more', help: 'more', upgrade: 'more',
    }
    if (tabMap[dest]) setActiveTab(tabMap[dest])
    setScreen(dest)
  }

  const handleTabChange = (tab) => {
    setPartyDetail(null)
    setActiveTab(tab)
    // Show hub screen for each tab
    const hubMap = { home: 'home', hisaab: 'hisaab', recovery: 'recovery', more: 'more' }
    setScreen(hubMap[tab] || tab)
  }

  const goBack = () => {
    setPartyDetail(null)
    setScreen(activeTab) // Go back to hub
  }

  const renderScreen = () => {
    if (partyDetail) return <PartyDetailScreen party={partyDetail} onBack={() => { setPartyDetail(null) }} />

    const s = screen || activeTab
    switch (s) {
      case 'home':             return <Dashboard onNavigate={navigate} />
      case 'hisaab':           return <HisaabScreen onNavigate={navigate} />
      case 'recovery':         return <RecoveryScreen onNavigate={navigate} />
      case 'more':             return <MoreMenuScreen onNavigate={navigate} />

      // Hisaab sub-screens
      case 'parties':          return <WithBack onBack={goBack}><PartiesScreen onNavigate={navigate} /></WithBack>
      case 'invoices':         return <WithBack onBack={goBack}><InvoicesScreen onNavigate={navigate} /></WithBack>
      case 'inventory':        return <WithBack onBack={goBack}><InventoryScreen /></WithBack>
      case 'cashbook':         return <WithBack onBack={goBack}><CashBookScreen /></WithBack>
      case 'reports':          return <WithBack onBack={goBack}><ReportsScreen /></WithBack>
      case 'purchase-orders':  return <WithBack onBack={goBack}><PurchaseOrderScreen /></WithBack>

      // Recovery sub-screens
      case 'reminders':        return <WithBack onBack={goBack}><RemindersScreen /></WithBack>
      case 'auto-reminders':   return <WithBack onBack={goBack}><AutoReminderScreen /></WithBack>
      case 'recovery-dashboard': return <WithBack onBack={goBack}><RecoveryDashboard /></WithBack>

      // More sub-screens
      case 'settings':         return <WithBack onBack={goBack}><SettingsScreen onNavigate={navigate} /></WithBack>
      case 'staff':            return <WithBack onBack={goBack}><StaffScreen /></WithBack>
      case 'backup':           return <WithBack onBack={goBack}><BackupScreen /></WithBack>
      case 'about':            return <AboutPage onBack={goBack} />
      case 'privacy':          return <PrivacyPage onBack={goBack} />
      case 'terms':            return <TermsPage onBack={goBack} />
      case 'help':             return <HelpPage onBack={goBack} />
      case 'upgrade':          return <UpgradePage onBack={goBack} />

      default: return <Dashboard onNavigate={navigate} />
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#F8FAFC', position: 'relative' }}>
      <div style={{ paddingBottom: 72, minHeight: '100vh', overflowY: 'auto' }}>
        {renderScreen()}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      {/* AI Agent moved to Recovery tab */}
    </div>
  )
}

// Wrapper adds back button at top
function WithBack({ children, onBack }) {
  return (
    <div>
      <div style={{ background: '#1E3A5F', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onBack}>
        <span style={{ color: 'white', fontSize: 18 }}>←</span>
        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>Back</span>
      </div>
      {children}
    </div>
  )
}

export default function App() {
  return <AppProvider><AppShell /></AppProvider>
}
