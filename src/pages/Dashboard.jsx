import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { AlertTriangle, ChevronRight, Bell } from 'lucide-react'
import NotificationsScreen from '../components/NotificationsScreen'

const fmt     = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`
const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function Dashboard({ onNavigate }) {
  const { business, currentUser, parties, transactions, products, stats, language, invoices } = useApp()
  const hi = language === 'hi'
  const [showNotif, setShowNotif] = useState(false)

  const today     = new Date()
  const thisMonth = today.getMonth()
  const thisYear  = today.getFullYear()
  const safeInv   = invoices || []

  const collectedMonth = transactions.filter(t => {
    const d = new Date(t.date)
    return t.type === 'receipt' && d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).reduce((s,t) => s+t.amount, 0)

  const recoveryRate  = (stats.totalReceivable + collectedMonth) > 0
    ? Math.round((collectedMonth / (stats.totalReceivable + collectedMonth)) * 100) : 0
  const recoveryScore = Math.min(100, recoveryRate + 20)
  const scoreColor    = recoveryScore >= 70 ? '#059669' : recoveryScore >= 40 ? '#B45309' : '#DC2626'

  const overdueInv    = safeInv.filter(i => i.status !== 'paid' && new Date(i.dueDate) < today)
  const overdueAmt    = overdueInv.reduce((s,i) => s+i.totalAmount, 0)
  const pendingParties = parties.filter(p => p.balance > 0 && p.balanceType === 'to_receive')

  // Why the score
  const scoreWhy = []
  if (safeInv.filter(i => i.status !== 'paid').length > 0)
    scoreWhy.push(`${safeInv.filter(i=>i.status!=='paid').length} invoices pending`)
  if (stats.totalReceivable > 0)
    scoreWhy.push(`${fmtFull(stats.totalReceivable)} outstanding`)
  if (overdueAmt > 0)
    scoreWhy.push(`${fmtFull(overdueAmt)} overdue`)

  // Alerts
  const alerts = []
  if (stats.lowStockCount > 0)
    alerts.push({ text: `${stats.lowStockCount} items low on stock`, screen: 'inventory', color: '#B45309' })
  if (overdueInv.length > 0)
    alerts.push({ text: `${overdueInv.length} invoices overdue — ${fmtFull(overdueAmt)}`, screen: 'invoices', color: '#DC2626' })

  // Insights from real data
  const insights = []
  products.filter(p => p.stock <= p.lowStockAlert)
    .forEach(p => insights.push(`${p.name} — only ${p.stock} ${p.unit}s left`))
  pendingParties.map(p => {
    const pmts = transactions.filter(t => t.partyId === p.id && t.type === 'receipt')
    const last = pmts.sort((a,b) => new Date(b.date)-new Date(a.date))[0]
    const days = last ? Math.floor((today-new Date(last.date))/86400000) : 999
    return { ...p, days }
  }).filter(p => p.days > 10).slice(0,2)
    .forEach(p => insights.push(`${p.name} — no payment for ${p.days} days`))

  const lw = transactions.filter(t => { const d = new Date(t.date); return t.type==='receipt'&&(today-d)<604800000 }).reduce((s,t)=>s+t.amount,0)
  const pw = transactions.filter(t => { const d = new Date(t.date); const diff=(today-d)/86400000; return t.type==='receipt'&&diff>=7&&diff<14 }).reduce((s,t)=>s+t.amount,0)
  if (pw > 0 && lw < pw*0.8)
    insights.push(`Collections down ${Math.round((1-lw/pw)*100)}% vs last week`)

  const notifCount = Math.max(0,
    overdueInv.length + stats.lowStockCount -
    (JSON.parse(localStorage.getItem('bizkhata_dismissed_notifs')||'[]')).length)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 24 }}>

      {/* ── Top bar ─────────────────────────── */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--brand)' }}>
            {business?.name || 'HisaabPro'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
            {today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {currentUser?.name?.split(' ')[0]}
          </div>
        </div>
        <button onClick={() => setShowNotif(true)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
          <Bell size={16} color="var(--text-secondary)" />
          {notifCount > 0 && <span style={{ background: 'var(--red)', color: 'white', borderRadius: 99, padding: '1px 5px', fontSize: 10, fontWeight: 700 }}>{notifCount}</span>}
        </button>
      </div>

      <div style={{ padding: '14px 14px 0' }}>

        {/* ── HERO: Recovery Score + Big CTA ─── */}
        <div style={{ background: 'var(--recovery)', borderRadius: 'var(--r-xl)', padding: '20px', marginBottom: 12 }}>

          {/* Score + Amount side by side */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
                Recovery Score
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 900, color: 'white', lineHeight: 1 }}>
                {recoveryScore}
                <span style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.45)' }}>/100</span>
              </div>
              {/* Score explanation */}
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {scoreWhy.slice(0,2).map((w,i) => (
                  <div key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                    {w}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 6 }}>
                Recoverable Today
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, color: 'white', lineHeight: 1 }}>
                {fmtFull(stats.totalReceivable)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                {pendingParties.length} customer{pendingParties.length !== 1 ? 's' : ''} pending
              </div>
            </div>
          </div>

          {/* BIG Recover Now CTA */}
          <button onClick={() => onNavigate('recovery')} style={{ width: '100%', padding: '15px', borderRadius: 'var(--r-lg)', border: 'none', cursor: 'pointer', background: 'var(--accent)', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '0.2px' }}>
            Recover Now
          </button>
        </div>

        {/* ── 3 metrics ───────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
          {[
            { label: 'Recovered', value: fmt(collectedMonth), sub: 'this month', color: 'var(--green)', bg: 'var(--green-light)', screen: 'recovery' },
            { label: 'Sales',     value: fmt(transactions.filter(t=>t.type==='sale').reduce((s,t)=>s+t.amount,0)), sub: 'total', color: 'var(--brand)', bg: 'var(--brand-light)', screen: 'hisaab' },
            { label: 'Rate',      value: `${recoveryRate}%`, sub: 'recovery', color: 'var(--amber)', bg: 'var(--amber-light)', screen: 'recovery' },
          ].map((s,i) => (
            <div key={i} className="metric-card" onClick={() => onNavigate(s.screen)} style={{ background: s.bg, border: 'none', cursor: 'pointer' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: s.color, marginTop: 2 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: s.color, opacity: 0.65, marginTop: 1 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Alerts ──────────────────────────── */}
        {alerts.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ padding: '9px 14px', background: '#FFF7ED', borderBottom: '1px solid #FED7AA', display: 'flex', alignItems: 'center', gap: 7 }}>
              <AlertTriangle size={13} color="var(--accent)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>Needs attention</span>
            </div>
            {alerts.map((a,i) => (
              <div key={i} className="list-row" onClick={() => onNavigate(a.screen)} style={{ padding: '10px 14px' }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: a.color }}>{a.text}</span>
                <ChevronRight size={14} color={a.color} />
              </div>
            ))}
          </div>
        )}

        {/* ── Priority follow-ups ─────────────── */}
        {pendingParties.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Priority Follow-Ups</span>
              <button onClick={() => onNavigate('recovery')} style={{ background: 'none', border: 'none', color: 'var(--recovery)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Start Recovery →</button>
            </div>
            {pendingParties.sort((a,b) => b.balance-a.balance).slice(0,3).map((p,i) => {
              const pmts = transactions.filter(t => t.partyId===p.id && t.type==='receipt')
              const last = pmts.sort((a,b) => new Date(b.date)-new Date(a.date))[0]
              const days = last ? Math.floor((today-new Date(last.date))/86400000) : null
              const isHigh = p.balance > 50000 || (days !== null && days > 20)
              return (
                <div key={p.id} className="list-row" onClick={() => onNavigate('party-detail', p)}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: isHigh ? 'var(--red-light)' : 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: isHigh ? 'var(--red)' : 'var(--brand)', flexShrink: 0 }}>
                    {p.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: isHigh ? 'var(--red)' : 'var(--text-muted)', marginTop: 1 }}>
                      {overdueInv.some(inv => inv.partyId===p.id) ? 'Overdue' : days !== null ? `${days}d since last payment` : 'No payment yet'}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--green)' }}>{fmtFull(p.balance)}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Insights ────────────────────────── */}
        {insights.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border-light)' }}>
              <span className="section-label">Insights</span>
            </div>
            {insights.slice(0,3).map((item,i) => (
              <div key={i} style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text-secondary)', borderBottom: i < Math.min(insights.length,3)-1 ? '1px solid var(--border-light)' : 'none', lineHeight: 1.5 }}>
                {item}
              </div>
            ))}
          </div>
        )}

      </div>

      {showNotif && <NotificationsScreen onClose={() => setShowNotif(false)} onNavigate={onNavigate} />}
    </div>
  )
}
