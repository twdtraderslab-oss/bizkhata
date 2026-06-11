import React from 'react'
import { useApp } from '../context/AppContext'
import { Send, AlertTriangle, TrendingUp, Zap, Target, Bell } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function RecoveryScreen({ onNavigate }) {
  const { parties, invoices, transactions, stats, language } = useApp()
  const hi = language === 'hi'

  const safeInvoices = invoices || []
  const today = new Date()
  const thisMonth = today.getMonth()

  const overdueParties = parties.filter(p => p.balance > 0 && p.balanceType === 'to_receive')
  const overdueAmt = safeInvoices.filter(i => i.status !== 'paid' && new Date(i.dueDate) < today).reduce((s,i) => s+i.totalAmount, 0)
  const recoveredThisMonth = transactions.filter(t => { const d = new Date(t.date); return t.type === 'receipt' && d.getMonth() === thisMonth }).reduce((s,t) => s+t.amount, 0)
  const recoveryRate = (stats.totalReceivable + recoveredThisMonth) > 0 ? Math.round((recoveredThisMonth / (stats.totalReceivable + recoveredThisMonth)) * 100) : 0

  // Risk breakdown
  const getRisk = (party) => {
    const payments = transactions.filter(t => t.partyId === party.id && t.type === 'receipt')
    const last = payments.sort((a,b) => new Date(b.date)-new Date(a.date))[0]
    const days = last ? Math.floor((today - new Date(last.date)) / (1000*60*60*24)) : 999
    if (party.balance > 100000 || days > 30) return 'High'
    if (party.balance > 30000 || days > 14) return 'Medium'
    return 'Low'
  }

  const topPending = overdueParties.sort((a,b) => b.balance - a.balance).slice(0, 3).map(p => ({...p, risk: getRisk(p)}))

  const scoreExplanation = []
  if (safeInvoices.filter(i => i.status !== 'paid').length > 0) scoreExplanation.push(`${safeInvoices.filter(i=>i.status!=='paid').length} invoices pending`)
  if (stats.totalReceivable > 0) scoreExplanation.push(`${fmtFull(stats.totalReceivable)} outstanding`)
  if (overdueAmt > 0) scoreExplanation.push(`${fmtFull(overdueAmt)} overdue`)

  const modules = [
    { id: 'reminders', emoji: '🚀', title: 'Recovery Center', subtitle: 'Bulk WhatsApp + Pipeline', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
    { id: 'auto-reminders', emoji: '🤖', title: 'AI Recovery Agent', subtitle: 'Day 0, 3, 7, 15, 30 automation', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { id: 'recovery-dashboard', emoji: '📈', title: 'Recovery Dashboard', subtitle: 'Analytics, UPI collect, risk scores', color: '#1E3A5F', bg: '#EFF6FF', border: '#BFDBFE' },
  ]

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Clean green header - different from accounting screens */}
      <div style={{ background: 'var(--recovery)', padding: '18px 16px 16px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 3 }}>
          💰 {hi ? 'पेमेंट रिकवरी' : 'Payment Recovery'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
          {hi ? 'अपना बकाया पैसा वापस पाएं' : 'Recover what you\'re owed · Faster'}
        </p>
      </div>

      {/* Recovery Score with explanation */}
      <div style={{ background: 'var(--recovery-mid)', padding: '16px' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>Recovery Score</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: recoveryRate >= 70 ? '#4ADE80' : recoveryRate >= 40 ? '#FCD34D' : '#F87171' }}>
                {Math.min(100, recoveryRate + 20)}/100
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 4 }}>Recoverable Today</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, color: 'white' }}>{fmtFull(stats.totalReceivable)}</div>
            </div>
          </div>
          {/* Score explanation */}
          {scoreExplanation.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '8px 12px', marginBottom: 12 }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 5 }}>Why this score:</div>
              {scoreExplanation.map((e, i) => (
                <div key={i} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 2 }}>• {e}</div>
              ))}
            </div>
          )}
          <button onClick={() => onNavigate('reminders')} style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#059669', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Send size={18} /> Recover Now — {overdueParties.length} Customers
          </button>
        </div>

        {/* Key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 10 }}>
          {[
            { l: 'Recovered', v: fmtFull(recoveredThisMonth), c: '#4ADE80' },
            { l: 'Success Rate', v: `${recoveryRate}%`, c: '#FCD34D' },
            { l: 'Overdue', v: fmtFull(overdueAmt), c: '#F87171' },
          ].map((s,i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, color: s.c }}>{s.v}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Priority Follow-Ups */}
        {topPending.length > 0 && (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#1E3A5F' }}>Priority Follow-Ups</span>
              <button onClick={() => onNavigate('reminders')} style={{ background: 'none', border: 'none', color: '#059669', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Send All →</button>
            </div>
            {topPending.map((p, i) => {
              const riskColor = p.risk === 'High' ? '#DC2626' : p.risk === 'Medium' ? '#D97706' : '#059669'
              const riskBg = p.risk === 'High' ? '#FEF2F2' : p.risk === 'Medium' ? '#FFFBEB' : '#F0FDF4'
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < topPending.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: riskBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: riskColor, flexShrink: 0 }}>{p.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: riskColor, background: riskBg, padding: '2px 7px', borderRadius: 6 }}>{p.risk} Risk</span>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#059669' }}>{fmtFull(p.balance)}</div>
                    {p.phone && (
                      <button onClick={() => window.open(`https://wa.me/91${p.phone}?text=${encodeURIComponent(`Dear ${p.name}, your outstanding balance is ${fmtFull(p.balance)}. Please arrange payment. Thanks.`)}`, '_blank')} style={{ background: '#25D366', border: 'none', borderRadius: 7, padding: '3px 8px', color: 'white', fontSize: 10, fontWeight: 700, cursor: 'pointer', marginTop: 3 }}>WhatsApp</button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Recovery Modules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {modules.map(mod => (
            <div key={mod.id} onClick={() => onNavigate(mod.id)}
              style={{ background: 'white', borderRadius: 14, border: `1px solid ${mod.border}`, padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: mod.bg, border: `1px solid ${mod.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{mod.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: mod.color, marginBottom: 2 }}>{mod.title}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{mod.subtitle}</div>
              </div>
              <div style={{ color: '#94A3B8', fontSize: 18 }}>›</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
