import React from 'react'
import { useApp } from '../context/AppContext'
import { Users, FileText, Package, BookOpen, BarChart2 } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function HisaabScreen({ onNavigate }) {
  const { parties, transactions, products, invoices, stats, language } = useApp()
  const hi = language === 'hi'

  const safeInvoices = invoices || []
  const unpaidAmt = safeInvoices.filter(i => i.status !== 'paid').reduce((s,i) => s+i.totalAmount, 0)
  const totalSales = transactions.filter(t => t.type === 'sale').reduce((s,t) => s+t.amount, 0)
  const totalStockValue = products.reduce((s,p) => s+p.stock*p.purchasePrice, 0)

  const modules = [
    {
      id: 'parties', emoji: '👥',
      title: hi ? 'पार्टियां' : 'Parties',
      subtitle: hi ? 'ग्राहक & सप्लायर लेजर' : 'Customer & supplier ledger',
      stat: `${parties.length} parties`,
      statColor: '#1E3A5F', statBg: '#EFF6FF',
      color: '#1E3A5F', bg: '#F8FAFC',
    },
    {
      id: 'invoices', emoji: '🧾',
      title: hi ? 'इनवॉइस' : 'Invoices',
      subtitle: hi ? 'बिलिंग & पेमेंट ट्रैक' : 'Billing & payment tracking',
      stat: fmtFull(unpaidAmt) + ' pending',
      statColor: safeInvoices.filter(i=>i.status!=='paid').length > 0 ? '#D97706' : '#059669',
      statBg: safeInvoices.filter(i=>i.status!=='paid').length > 0 ? '#FFFBEB' : '#F0FDF4',
      color: '#1E3A5F', bg: '#F8FAFC',
    },
    {
      id: 'inventory', emoji: '📦',
      title: hi ? 'इन्वेंटरी' : 'Inventory',
      subtitle: hi ? 'स्टॉक & प्रोडक्ट मैनेजमेंट' : 'Stock & product management',
      stat: fmtFull(totalStockValue) + ' value',
      statColor: '#059669', statBg: '#F0FDF4',
      color: '#1E3A5F', bg: '#F8FAFC',
    },
    {
      id: 'cashbook', emoji: '💵',
      title: hi ? 'कैश बुक' : 'Cash Book',
      subtitle: hi ? 'रोज़ाना नकद हिसाब' : 'Daily cash in & out',
      stat: 'Track daily cash',
      statColor: '#7C3AED', statBg: '#F5F3FF',
      color: '#1E3A5F', bg: '#F8FAFC',
    },
    {
      id: 'reports', emoji: '📊',
      title: hi ? 'रिपोर्ट' : 'Reports',
      subtitle: hi ? 'P&L, GST, Excel & PDF export' : 'P&L, GST, Excel & PDF export',
      stat: 'Excel + PDF',
      statColor: '#059669', statBg: '#F0FDF4',
      color: '#1E3A5F', bg: '#F8FAFC',
    },
    {
      id: 'purchase-orders', emoji: '📋',
      title: hi ? 'खरीद ऑर्डर' : 'Purchase Orders',
      subtitle: hi ? 'सप्लायर को ऑर्डर करें' : 'Order from suppliers',
      stat: 'Track orders',
      statColor: '#7C3AED', statBg: '#F5F3FF',
      color: '#1E3A5F', bg: '#F8FAFC',
    },
  ]

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Clean header - no gradient */}
      <div style={{ background: 'white', padding: '20px 16px 16px', borderBottom: '1px solid #E2E8F0' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#1E3A5F' }}>
          📒 {hi ? 'हिसाब' : 'Hisaab'}
        </h1>
        <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 3 }}>
          {hi ? 'सभी रिकॉर्ड एक जगह' : 'All your records in one place'}
        </p>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {modules.map(mod => (
          <div key={mod.id}
            onClick={() => onNavigate(mod.id)}
            style={{
              background: 'white', borderRadius: 14, border: '1px solid #E2E8F0',
              padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              transition: 'all 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
              {mod.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: mod.color, marginBottom: 3 }}>{mod.title}</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>{mod.subtitle}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ background: mod.statBg, color: mod.statColor, padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                {mod.stat}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
