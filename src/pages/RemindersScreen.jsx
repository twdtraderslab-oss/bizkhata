import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { MessageCircle, Bell, AlertTriangle, CheckCircle, Send, Users, Clock, TrendingUp } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function RemindersScreen() {
  const { parties, invoices, business, transactions, language } = useApp()
  const hi = language === 'hi'
  const [activeTab, setActiveTab] = useState('bulk')
  const [selectedParties, setSelectedParties] = useState([])
  const [sent, setSent] = useState([])
  const [responded, setResponded] = useState([])
  const [paid, setPaid] = useState([])

  const [msgTemplate, setMsgTemplate] = useState(
    `Dear {name},\n\nYour outstanding balance with *${business?.name || 'us'}* is *{amount}*.\n\nKindly arrange payment at your earliest convenience.\n\nThank you\n${business?.name}`
  )

  const today = new Date()
  const overdueParties = parties.filter(p => p.balance > 0 && p.balanceType === 'to_receive' && p.phone).sort((a, b) => b.balance - a.balance)
  const safeInvoices = invoices || []

  const overdueAmt = safeInvoices.filter(i => i.status !== 'paid' && new Date(i.dueDate) < today).reduce((s, i) => s + i.totalAmount, 0)
  const dueSoonAmt = safeInvoices.filter(i => { const d = Math.ceil((new Date(i.dueDate) - today) / (1000*60*60*24)); return i.status !== 'paid' && d >= 0 && d <= 7 }).reduce((s, i) => s + i.totalAmount, 0)
  const totalOutstanding = overdueParties.reduce((s, p) => s + p.balance, 0)
  const recoveredAmt = paid.reduce((s, id) => s + (overdueParties.find(p => p.id === id)?.balance || 0), 0)
  const recoveryRate = overdueParties.length > 0 ? Math.round((paid.length / overdueParties.length) * 100) : 0

  const overdueAlerts = safeInvoices.map(inv => {
    const party = parties.find(p => p.id === inv.partyId)
    const daysLeft = Math.ceil((new Date(inv.dueDate) - today) / (1000*60*60*24))
    return { ...inv, party, daysLeft }
  }).filter(inv => inv.status !== 'paid').sort((a, b) => a.daysLeft - b.daysLeft)

  const toggleParty = id => setSelectedParties(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])

  const sendReminder = (party) => {
    const msg = msgTemplate.replace('{name}', party.name).replace('{amount}', fmtFull(party.balance))
    window.open(`https://wa.me/91${party.phone}?text=${encodeURIComponent(msg)}`, '_blank')
    setSent(prev => [...new Set([...prev, party.id])])
  }

  const sendBulkReminders = () => {
    const toSend = overdueParties.filter(p => selectedParties.includes(p.id))
    toSend.forEach((party, i) => setTimeout(() => sendReminder(party), i * 800))
  }

  const sendInvoiceReminder = (alert) => {
    if (!alert.party?.phone) return
    const msg = `Dear ${alert.party.name},\n\n*Invoice: ${alert.invoiceNo}*\nAmount: *${fmtFull(alert.totalAmount)}*\nDue: ${alert.dueDate}\n\n${alert.daysLeft < 0 ? `This is ${Math.abs(alert.daysLeft)} days OVERDUE.` : `Due in ${alert.daysLeft} days.`}\n\nPlease arrange payment.\n\n${business?.name}`
    window.open(`https://wa.me/91${alert.party.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header — AMOUNTS not counts */}
      <div style={{ background: 'var(--recovery)', padding: '24px 16px 20px', borderRadius: '0 0 24px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 16 }}>
          {hi ? 'पेमेंट रिकवरी सेंटर' : 'Payment Recovery Center'}
        </h2>

        {/* BIG AMOUNT CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {/* Recoverable Today */}
          <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>{hi ? 'आज वसूल करें' : 'Recoverable Today'}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'white' }}>{fmtFull(totalOutstanding)}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>{overdueParties.length} customers outstanding</div>
              </div>
              <button onClick={() => { setSelectedParties(overdueParties.map(p => p.id)); setActiveTab('bulk') }} style={{ background: '#25D366', border: 'none', borderRadius: 12, padding: '12px 16px', color: 'white', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={16} /> Send All
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { label: hi ? 'अतिदेय' : 'Overdue', value: fmtFull(overdueAmt), color: '#F87171' },
              { label: hi ? 'इस हफ्ते' : 'Due This Week', value: fmtFull(dueSoonAmt), color: '#FCD34D' },
              { label: hi ? 'वसूल हुआ' : 'Recovered', value: fmtFull(recoveredAmt), color: '#4ADE80' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 10px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery Rate */}
        {sent.length > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600 }}>Recovery Funnel</span>
              <span style={{ color: '#4ADE80', fontSize: 12, fontWeight: 700 }}>Rate: {recoveryRate}%</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, fontSize: 11, textAlign: 'center' }}>
              {[
                { l: 'Sent', v: sent.length, c: '#60A5FA' },
                { l: 'Responded', v: responded.length, c: '#FCD34D' },
                { l: 'Paid', v: paid.length, c: '#4ADE80' },
                { l: 'Recovered', v: fmtFull(recoveredAmt), c: '#4ADE80' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: s.c, fontSize: 16 }}>{s.v}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 3, marginTop: 14 }}>
          {[{ id: 'bulk', label: '🚀 Recover Now' }, { id: 'alerts', label: '⚡ Alert Queue' }, { id: 'pipeline', label: '📊 Pipeline' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, padding: '9px 4px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12, background: activeTab === tab.id ? 'white' : 'transparent', color: activeTab === tab.id ? '#0369A1' : 'rgba(255,255,255,0.7)', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '14px 16px 0' }}>
        {/* BULK WHATSAPP */}
        {activeTab === 'bulk' && (
          <>
            <div className="card" style={{ padding: 14, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Message Template</label>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{'{name} {amount} auto-fill'}</span>
              </div>
              <textarea value={msgTemplate} onChange={e => setMsgTemplate(e.target.value)} rows={4} className="input-field" style={{ resize: 'none', fontSize: 13 }} />
            </div>

            {selectedParties.length > 0 && (
              <button onClick={sendBulkReminders} style={{ width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer', background: '#25D366', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 14 }}>
                <Send size={18} /> Send to {selectedParties.length} customers
              </button>
            )}

            {overdueParties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                <CheckCircle size={44} color="var(--green)" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontWeight: 700, color: 'var(--green)' }}>All payments clear!</p>
              </div>
            ) : (
              <div className="card" style={{ overflow: 'hidden' }}>
                {overdueParties.map((party, i) => {
                  const isSelected = selectedParties.includes(party.id)
                  const isSent = sent.includes(party.id)
                  const isPaid = paid.includes(party.id)
                  return (
                    <div key={party.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderBottom: i < overdueParties.length - 1 ? '1px solid var(--border-light)' : 'none', background: isSelected ? '#EFF6FF' : 'white', cursor: 'pointer' }}
                      onClick={() => toggleParty(party.id)}>
                      {/* Checkbox */}
                      <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isSelected ? '#0369A1' : 'var(--border)'}`, background: isSelected ? '#0369A1' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                        {isSelected && <CheckCircle size={14} color="white" strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{party.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{party.city} · {party.phone}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--green)' }}>{fmtFull(party.balance)}</div>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 4 }}>
                          {isSent && !isPaid && (
                            <button onClick={e => { e.stopPropagation(); setResponded(prev => [...new Set([...prev, party.id])]) }} style={{ background: 'var(--amber-light)', border: 'none', borderRadius: 6, padding: '2px 7px', color: 'var(--amber)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                              Responded?
                            </button>
                          )}
                          {isSent && (
                            <button onClick={e => { e.stopPropagation(); setPaid(prev => [...new Set([...prev, party.id])]); setSent(prev => [...new Set([...prev, party.id])]) }} style={{ background: 'var(--green-light)', border: 'none', borderRadius: 6, padding: '2px 7px', color: 'var(--green)', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                              {isPaid ? '✓ Paid' : 'Mark Paid'}
                            </button>
                          )}
                          {!isSent && (
                            <button onClick={e => { e.stopPropagation(); sendReminder(party) }} style={{ background: '#25D366', border: 'none', borderRadius: 8, padding: '4px 10px', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              Send
                            </button>
                          )}
                          {isSent && !isPaid && <span style={{ fontSize: 10, color: 'var(--recovery)', fontWeight: 700 }}>✓ Sent</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* DUE ALERTS */}
        {activeTab === 'alerts' && (
          <>
            {overdueAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                <CheckCircle size={44} color="var(--green)" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontWeight: 700, color: 'var(--green)' }}>No pending invoices!</p>
              </div>
            ) : (
              overdueAlerts.map((alert, i) => {
                const isOverdue = alert.daysLeft < 0
                const isDueSoon = alert.daysLeft >= 0 && alert.daysLeft <= 7
                const color = isOverdue ? 'var(--red)' : isDueSoon ? 'var(--amber)' : 'var(--indigo)'
                const bg = isOverdue ? 'var(--red-light)' : isDueSoon ? 'var(--amber-light)' : 'var(--indigo-light)'
                return (
                  <div key={alert.id} className="card" style={{ marginBottom: 10, padding: '14px', border: `1px solid ${isOverdue ? '#FCA5A5' : isDueSoon ? '#FCD34D' : 'var(--border)'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {isOverdue ? <AlertTriangle size={18} color={color} /> : isDueSoon ? <Clock size={18} color={color} /> : <Bell size={18} color={color} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{alert.party?.name || '—'}</div>
                        <div style={{ fontSize: 12, color, fontWeight: 700 }}>
                          {alert.invoiceNo} · {isOverdue ? `${Math.abs(alert.daysLeft)} days overdue` : `Due in ${alert.daysLeft} days`}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color }}>{fmtFull(alert.totalAmount)}</div>
                        {alert.party?.phone && (
                          <button onClick={() => sendInvoiceReminder(alert)} style={{ background: '#25D366', border: 'none', borderRadius: 8, padding: '4px 10px', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>📱 Remind</button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}

        {/* RECOVERY PIPELINE TAB */}
        {activeTab === 'pipeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--indigo)' }}>
                📊 Recovery Status Pipeline
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden', borderRadius: 10, border: '1px solid var(--border)' }}>
                {[
                  { stage: 'No Reminder Sent', color: 'var(--text-muted)', bg: 'var(--bg)',          count: overdueParties.filter(p => !sent.includes(p.id)).length,       amt: overdueParties.filter(p => !sent.includes(p.id)).reduce((s,p)=>s+p.balance,0) },
                  { stage: 'Reminder Sent',    color: '#2563EB',           bg: '#EFF6FF',            count: sent.filter(id => !responded.includes(id) && !paid.includes(id)).length, amt: overdueParties.filter(p => sent.includes(p.id) && !responded.includes(p.id) && !paid.includes(p.id)).reduce((s,p)=>s+p.balance,0) },
                  { stage: 'Responded',        color: 'var(--amber)',      bg: 'var(--amber-light)', count: responded.filter(id => !paid.includes(id)).length,              amt: overdueParties.filter(p => responded.includes(p.id) && !paid.includes(p.id)).reduce((s,p)=>s+p.balance,0) },
                  { stage: 'Paid ✓',           color: 'var(--green)',      bg: 'var(--green-light)', count: paid.length,                                                    amt: overdueParties.filter(p => paid.includes(p.id)).reduce((s,p)=>s+p.balance,0) },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: i < 3 ? '1px solid var(--border-light)' : 'none', background: s.bg }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, marginRight: 12, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: s.color }}>{s.stage}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.count} customers</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: s.color }}>{fmtFull(s.amt)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per customer timeline */}
            {overdueParties.length > 0 && (
              <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--indigo)' }}>Recovery Timeline</h3>
                </div>
                {overdueParties.slice(0, 5).map((party, i) => {
                  const isSent = sent.includes(party.id)
                  const isResponded = responded.includes(party.id)
                  const isPaid = paid.includes(party.id)
                  const steps = [
                    { label: 'Pending',   done: true,        color: 'var(--text-muted)' },
                    { label: 'Sent',      done: isSent,      color: '#2563EB' },
                    { label: 'Responded', done: isResponded, color: 'var(--amber)' },
                    { label: 'Paid',      done: isPaid,       color: 'var(--green)' },
                  ]
                  return (
                    <div key={party.id} style={{ padding: '12px 16px', borderBottom: i < overdueParties.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{party.name}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--green)' }}>{fmtFull(party.balance)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        {steps.map((step, j) => (
                          <React.Fragment key={j}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                              <div style={{ width: 20, height: 20, borderRadius: '50%', background: step.done ? step.color : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700 }}>
                                {step.done ? '✓' : '·'}
                              </div>
                              <div style={{ fontSize: 9, color: step.done ? step.color : 'var(--text-muted)', marginTop: 3, fontWeight: step.done ? 700 : 400 }}>{step.label}</div>
                            </div>
                            {j < steps.length - 1 && <div style={{ flex: 1, height: 2, background: steps[j+1].done ? steps[j+1].color : 'var(--border)', marginBottom: 14, transition: 'background 0.3s' }} />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
