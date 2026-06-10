import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MessageCircle, Bell, AlertTriangle, CheckCircle, Send, Users, Clock } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function RemindersScreen() {
  const { parties, invoices, business, language } = useApp()
  const hi = language === 'hi'
  const [activeTab, setActiveTab] = useState('bulk') // bulk | alerts
  const [selectedParties, setSelectedParties] = useState([])
  const [msgTemplate, setMsgTemplate] = useState(
    `Dear {name},\n\nYour outstanding balance with *${business?.name || 'us'}* is *{amount}*.\n\nKindly arrange payment at your earliest convenience.\n\nThank you 🙏\n${business?.name}`
  )
  const [sent, setSent] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Parties with balance
  const overdueParties = parties
    .filter(p => p.balance > 0 && p.balanceType === 'to_receive' && p.phone)
    .sort((a, b) => b.balance - a.balance)

  // Due date alerts from invoices
  const today = new Date()
  const alerts = (invoices || []).map(inv => {
    const party = parties.find(p => p.id === inv.partyId)
    const dueDate = new Date(inv.dueDate)
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
    return { ...inv, party, daysLeft }
  }).filter(inv => inv.status !== 'paid').sort((a, b) => a.daysLeft - b.daysLeft)

  const overdueAlerts   = alerts.filter(a => a.daysLeft < 0)
  const dueSoonAlerts   = alerts.filter(a => a.daysLeft >= 0 && a.daysLeft <= 7)
  const upcomingAlerts  = alerts.filter(a => a.daysLeft > 7)

  const toggleParty = (id) => {
    setSelectedParties(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const handleSelectAll = () => {
    if (selectAll) { setSelectedParties([]); setSelectAll(false) }
    else { setSelectedParties(overdueParties.map(p => p.id)); setSelectAll(true) }
  }

  const sendReminder = (party) => {
    const msg = msgTemplate.replace('{name}', party.name).replace('{amount}', fmtFull(party.balance))
    window.open(`https://wa.me/91${party.phone}?text=${encodeURIComponent(msg)}`, '_blank')
    setSent(prev => [...prev, party.id])
  }

  const sendBulkReminders = () => {
    const toSend = overdueParties.filter(p => selectedParties.includes(p.id))
    if (toSend.length === 0) return
    // Open first one immediately, rest in sequence
    toSend.forEach((party, i) => {
      setTimeout(() => {
        const msg = msgTemplate.replace('{name}', party.name).replace('{amount}', fmtFull(party.balance))
        window.open(`https://wa.me/91${party.phone}?text=${encodeURIComponent(msg)}`, '_blank')
        setSent(prev => [...prev, party.id])
      }, i * 800)
    })
  }

  const sendInvoiceReminder = (alert) => {
    if (!alert.party?.phone) return
    const msg = `Dear ${alert.party.name},\n\n*Invoice: ${alert.invoiceNo}*\nAmount Due: *${fmtFull(alert.totalAmount)}*\nDue Date: ${alert.dueDate}\n\n${alert.daysLeft < 0 ? `⚠️ This invoice is *${Math.abs(alert.daysLeft)} days overdue*!` : `Due in ${alert.daysLeft} days.`}\n\nPlease arrange payment.\n\n${business?.name}`
    window.open(`https://wa.me/91${alert.party.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0369A1, #0284C7)', padding: '24px 16px 20px', borderRadius: '0 0 24px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>
          {hi ? 'रिमाइंडर & अलर्ट' : 'Reminders & Alerts'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginBottom: 16 }}>
          {hi ? 'बकाया भुगतान याद दिलाएं' : 'Collect payments faster'}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: hi ? 'बकायेदार' : 'Outstanding', value: overdueParties.length, color: 'white' },
            { label: hi ? 'अतिदेय' : 'Overdue', value: overdueAlerts.length, color: '#F87171' },
            { label: hi ? 'जल्द देय' : 'Due Soon', value: dueSoonAlerts.length, color: '#FCD34D' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 14, padding: 4, marginBottom: 16 }}>
          {[
            { id: 'bulk', label: hi ? '📱 Bulk WhatsApp' : '📱 Bulk WhatsApp' },
            { id: 'alerts', label: hi ? '🔔 Due Alerts' : '🔔 Due Alerts' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? '#0369A1' : 'var(--text-muted)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s',
            }}>{tab.label}</button>
          ))}
        </div>

        {/* BULK WHATSAPP TAB */}
        {activeTab === 'bulk' && (
          <>
            {/* Message Template */}
            <div className="card" style={{ padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message Template</label>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{`{name} {amount} = auto-fill`}</span>
              </div>
              <textarea value={msgTemplate} onChange={e => setMsgTemplate(e.target.value)}
                rows={5} className="input-field" style={{ resize: 'none', fontSize: 13, lineHeight: 1.6 }} />
            </div>

            {/* Select All + Send Button */}
            {overdueParties.length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <button onClick={handleSelectAll} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                  <Users size={14} /> {selectAll ? 'Deselect All' : `Select All (${overdueParties.length})`}
                </button>
                {selectedParties.length > 0 && (
                  <button onClick={sendBulkReminders} style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#25D366', color: 'white', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Send size={14} /> Send to {selectedParties.length}
                  </button>
                )}
              </div>
            )}

            {/* Party List */}
            {overdueParties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                <CheckCircle size={40} color="var(--green)" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontWeight: 700, color: 'var(--green)' }}>All payments are clear!</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>No outstanding balances to collect</p>
              </div>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                {overdueParties.map((party, i) => {
                  const isSelected = selectedParties.includes(party.id)
                  const isSent = sent.includes(party.id)
                  return (
                    <div key={party.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < overdueParties.length - 1 ? '1px solid var(--border-light)' : 'none', background: isSelected ? '#EFF6FF' : 'white', cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => toggleParty(party.id)}>
                      {/* Checkbox */}
                      <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? '#0369A1' : 'var(--border)'}`, background: isSelected ? '#0369A1' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                        {isSelected && <CheckCircle size={14} color="white" strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{party.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📞 {party.phone} · {party.city}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--green)' }}>{fmtFull(party.balance)}</div>
                        {isSent ? (
                          <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>✓ Sent</span>
                        ) : (
                          <button onClick={e => { e.stopPropagation(); sendReminder(party) }} style={{ background: '#25D366', border: 'none', borderRadius: 8, padding: '4px 10px', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
                            WhatsApp
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* DUE ALERTS TAB */}
        {activeTab === 'alerts' && (
          <>
            {/* Overdue */}
            {overdueAlerts.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <AlertTriangle size={16} color="var(--red)" />
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--red)' }}>{hi ? 'अतिदेय' : 'Overdue'} ({overdueAlerts.length})</span>
                </div>
                <div className="card" style={{ overflow: 'hidden', border: '1px solid #FCA5A5' }}>
                  {overdueAlerts.map((alert, i) => (
                    <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < overdueAlerts.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--red-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <AlertTriangle size={16} color="var(--red)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.party?.name || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>{alert.invoiceNo} · {Math.abs(alert.daysLeft)} days overdue</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--red)' }}>{fmtFull(alert.totalAmount)}</div>
                        {alert.party?.phone && (
                          <button onClick={() => sendInvoiceReminder(alert)} style={{ background: '#25D366', border: 'none', borderRadius: 8, padding: '3px 8px', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>📱</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Due Soon */}
            {dueSoonAlerts.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Clock size={16} color="var(--amber)" />
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--amber)' }}>{hi ? 'जल्द देय' : 'Due in 7 Days'} ({dueSoonAlerts.length})</span>
                </div>
                <div className="card" style={{ overflow: 'hidden', border: '1px solid #FCD34D' }}>
                  {dueSoonAlerts.map((alert, i) => (
                    <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < dueSoonAlerts.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Clock size={16} color="var(--amber)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.party?.name || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 700 }}>{alert.invoiceNo} · Due in {alert.daysLeft} days</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--amber)' }}>{fmtFull(alert.totalAmount)}</div>
                        {alert.party?.phone && (
                          <button onClick={() => sendInvoiceReminder(alert)} style={{ background: '#25D366', border: 'none', borderRadius: 8, padding: '3px 8px', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>📱</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcomingAlerts.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Bell size={16} color="var(--indigo)" />
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--indigo)' }}>{hi ? 'आगामी' : 'Upcoming'} ({upcomingAlerts.length})</span>
                </div>
                <div className="card" style={{ overflow: 'hidden' }}>
                  {upcomingAlerts.map((alert, i) => (
                    <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: i < upcomingAlerts.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Bell size={16} color="var(--indigo)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.party?.name || '—'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{alert.invoiceNo} · Due: {alert.dueDate}</div>
                      </div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--indigo)' }}>{fmtFull(alert.totalAmount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {alerts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                <CheckCircle size={40} color="var(--green)" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontWeight: 700, color: 'var(--green)' }}>No pending invoices!</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>All invoices are paid or no invoices created yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
