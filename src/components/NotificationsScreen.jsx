import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Bell, AlertTriangle, CheckCircle, Clock, TrendingDown, Package, X } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function NotificationsScreen({ onClose, onNavigate }) {
  const { parties, invoices, products, transactions, language } = useApp()
  const hi = language === 'hi'
  const [dismissed, setDismissed] = useState(() => {
    const saved = localStorage.getItem('hisaabpro_dismissed_notifs')
    return saved ? JSON.parse(saved) : []
  })

  const dismiss = (id) => {
    const newDismissed = [...dismissed, id]
    setDismissed(newDismissed)
    localStorage.setItem('hisaabpro_dismissed_notifs', JSON.stringify(newDismissed))
  }

  const today = new Date()

  // Generate notifications
  const allNotifs = [
    // Overdue invoices
    ...(invoices || []).filter(inv => inv.status !== 'paid' && new Date(inv.dueDate) < today).map(inv => {
      const party = parties.find(p => p.id === inv.partyId)
      const days = Math.abs(Math.ceil((new Date(inv.dueDate) - today) / (1000*60*60*24)))
      return {
        id: `overdue-${inv.id}`,
        type: 'overdue',
        title: hi ? `${days} दिन अतिदेय` : `${days} days overdue`,
        message: `${party?.name} — ${inv.invoiceNo} — ${fmtFull(inv.totalAmount)}`,
        icon: <AlertTriangle size={18} color="var(--red)" />,
        bg: 'var(--red-light)',
        color: 'var(--red)',
        time: inv.dueDate,
        action: () => { onClose?.(); onNavigate?.('invoices') },
        actionLabel: hi ? 'देखें' : 'View',
      }
    }),

    // Low stock
    ...products.filter(p => p.stock <= p.lowStockAlert).map(p => ({
      id: `lowstock-${p.id}`,
      type: 'stock',
      title: hi ? 'कम स्टॉक' : 'Low Stock Alert',
      message: `${p.name} — ${p.stock} ${p.unit}s remaining (min: ${p.lowStockAlert})`,
      icon: <Package size={18} color="var(--amber)" />,
      bg: 'var(--amber-light)',
      color: 'var(--amber)',
      time: hi ? 'अभी' : 'Now',
      action: () => { onClose?.(); onNavigate?.('inventory') },
      actionLabel: hi ? 'देखें' : 'View',
    })),

    // High outstanding customers
    ...parties.filter(p => p.balanceType === 'to_receive' && p.balance > 50000).map(p => ({
      id: `highbal-${p.id}`,
      type: 'outstanding',
      title: hi ? 'बड़ा बकाया' : 'High Outstanding',
      message: `${p.name} owes you ${fmtFull(p.balance)}`,
      icon: <TrendingDown size={18} color="var(--indigo)" />,
      bg: 'var(--indigo-light)',
      color: 'var(--indigo)',
      time: p.lastTxn,
      action: () => { onClose?.(); onNavigate?.('parties') },
      actionLabel: hi ? 'रिमाइंडर' : 'Remind',
    })),

    // Due soon (next 3 days)
    ...(invoices || []).filter(inv => {
      const daysLeft = Math.ceil((new Date(inv.dueDate) - today) / (1000*60*60*24))
      return inv.status !== 'paid' && daysLeft >= 0 && daysLeft <= 3
    }).map(inv => {
      const party = parties.find(p => p.id === inv.partyId)
      const daysLeft = Math.ceil((new Date(inv.dueDate) - today) / (1000*60*60*24))
      return {
        id: `duesoon-${inv.id}`,
        type: 'due',
        title: hi ? `${daysLeft} दिन में देय` : `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        message: `${party?.name} — ${inv.invoiceNo} — ${fmtFull(inv.totalAmount)}`,
        icon: <Clock size={18} color="#D97706" />,
        bg: '#FEF3C7',
        color: '#D97706',
        time: inv.dueDate,
        action: () => { onClose?.(); onNavigate?.('invoices') },
        actionLabel: hi ? 'भेजें' : 'Remind',
      }
    }),
  ].filter(n => !dismissed.includes(n.id))

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="card slide-up" style={{ width: '100%', maxWidth: 480, margin: '0 auto', borderRadius: '24px 24px 0 0', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={20} color="var(--indigo)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--indigo)' }}>
              {hi ? 'नोटिफिकेशन' : 'Notifications'}
            </h3>
            {allNotifs.length > 0 && (
              <span style={{ background: 'var(--red)', color: 'white', borderRadius: 99, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{allNotifs.length}</span>
            )}
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg)', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        {/* Notifications List */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allNotifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
              <CheckCircle size={44} color="var(--green)" style={{ margin: '0 auto 14px', display: 'block' }} />
              <p style={{ fontWeight: 700, color: 'var(--green)', fontSize: 16 }}>{hi ? 'सब ठीक है!' : 'All Clear!'}</p>
              <p style={{ fontSize: 13, marginTop: 6 }}>{hi ? 'कोई अलर्ट नहीं — बढ़िया काम!' : 'No alerts — great work!'}</p>
            </div>
          ) : (
            allNotifs.map(notif => (
              <div key={notif.id} style={{ background: notif.bg, borderRadius: 14, padding: '14px', border: `1px solid ${notif.color}30`, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {notif.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: notif.color, marginBottom: 3 }}>{notif.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{notif.message}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={notif.action} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: notif.color, color: 'white', fontSize: 12, fontWeight: 700 }}>
                      {notif.actionLabel}
                    </button>
                    <button onClick={() => dismiss(notif.id)} style={{ padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.08)', color: 'var(--text-muted)', fontSize: 12 }}>
                      {hi ? 'हटाएं' : 'Dismiss'}
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: notif.color, opacity: 0.7, flexShrink: 0, marginTop: 2 }}>{notif.time}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
