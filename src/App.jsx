import React, { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import AuthScreen from './pages/AuthScreen'
import Dashboard from './pages/Dashboard'
import PartiesScreen from './pages/PartiesScreen'
import PartyDetailScreen from './pages/PartyDetailScreen'
import InvoicesScreen from './pages/InvoicesScreen'
import { InventoryScreen, ReportsScreen } from './pages/OtherScreens'
import SettingsScreen from './pages/SettingsScreen'
import BottomNav from './components/BottomNav'

function AppShell() {
  const { currentUser } = useApp()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [partyDetail, setPartyDetail] = useState(null)

  if (!currentUser) return <AuthScreen />

  const navigate = (destination, data) => {
    if (destination === 'party-detail') { setPartyDetail(data); return }
    if (destination === 'parties') { setActiveTab('parties'); setPartyDetail(null); return }
    if (destination === 'inventory') { setActiveTab('inventory'); return }
    if (destination === 'invoices') { setActiveTab('invoices'); return }
    setActiveTab(destination)
  }

  const handleTabChange = (tab) => { setActiveTab(tab); setPartyDetail(null) }

  const renderScreen = () => {
    if (partyDetail) return <PartyDetailScreen party={partyDetail} onBack={() => setPartyDetail(null)} />
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={navigate} />
      case 'parties':   return <PartiesScreen onNavigate={navigate} />
      case 'invoices':  return <InvoicesScreen onNavigate={navigate} />
      case 'inventory': return <InventoryScreen />
      case 'reports':   return <ReportsScreen />
      case 'settings':  return <SettingsScreen />
      default:          return <Dashboard onNavigate={navigate} />
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ paddingBottom: 72, minHeight: '100vh', overflowY: 'auto' }}>
        {renderScreen()}
      </div>
      <BottomNav activeTab={partyDetail ? 'parties' : activeTab} onTabChange={handleTabChange} />
    </div>
  )
}

export default function App() {
  return <AppProvider><AppShell /></AppProvider>
}
