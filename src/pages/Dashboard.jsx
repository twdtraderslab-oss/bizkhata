import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { AlertTriangle, ChevronRight, Bell, Send } from 'lucide-react'
import NotificationsScreen from '../components/NotificationsScreen'

const fmt     = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : n >= 1000 ? `₹${(n/1000).toFixed(0)}K` : `₹${n}`
const fmtFull = n => `₹${Number(n).toLocaleString("en-IN")}`

export default function Dashboard({ onNavigate }) {
  const { business, currentUser, parties, transactions, products, stats, language, invoices } = useApp()
  const hi = language === "hi"
  const [showNotifications, setShowNotifications] = useState(false)

  const today = new Date()
  const thisMonth = today.getMonth()
  const thisYear  = today.getFullYear()

  const safeInvoices = invoices || []
  const collectionsThisMonth = transactions.filter(t => {
    const d = new Date(t.date)
    return t.type === "receipt" && d.getMonth() === thisMonth && d.getFullYear() === thisYear
  }).reduce((s,t) => s+t.amount, 0)

  const recoveryRate = (stats.totalReceivable + collectionsThisMonth) > 0
    ? Math.round((collectionsThisMonth / (stats.totalReceivable + collectionsThisMonth)) * 100) : 0
  const recoveryScore = Math.min(100, recoveryRate + 20)

  const overdueInvoices = safeInvoices.filter(i => i.status !== "paid" && new Date(i.dueDate) < today)
  const overdueAmt = overdueInvoices.reduce((s,i) => s+i.totalAmount, 0)
  const pendingParties = parties.filter(p => p.balance > 0 && p.balanceType === "to_receive")

  // Score explanation
  const scoreExplanation = []
  if (safeInvoices.filter(i => i.status !== "paid").length > 0) scoreExplanation.push(`${safeInvoices.filter(i=>i.status!=="paid").length} invoices pending`)
  if (stats.totalReceivable > 0) scoreExplanation.push(`${fmtFull(stats.totalReceivable)} outstanding`)
  if (overdueAmt > 0) scoreExplanation.push(`${fmtFull(overdueAmt)} overdue`)

  // Action items - only what needs action
  const actionItems = []
  if (stats.lowStockCount > 0) actionItems.push({ icon: "📦", text: `${stats.lowStockCount} items low on stock`, screen: "inventory", color: "#D97706" })
  if (overdueInvoices.length > 0) actionItems.push({ icon: "🔴", text: `${overdueInvoices.length} invoices overdue — ${fmtFull(overdueAmt)}`, screen: "invoices", color: "#DC2626" })

  // Smart insights from real data
  const insights = []
  products.filter(p => p.stock <= p.lowStockAlert).forEach(p => insights.push(`📦 ${p.name} — only ${p.stock} ${p.unit}s left`))
  pendingParties.filter(p => {
    const pmts = transactions.filter(t => t.partyId === p.id && t.type === "receipt")
    const last = pmts.sort((a,b) => new Date(b.date)-new Date(a.date))[0]
    const days = last ? Math.floor((today - new Date(last.date))/(1000*60*60*24)) : 999
    return days > 10
  }).slice(0,2).forEach(p => {
    const pmts = transactions.filter(t => t.partyId === p.id && t.type === "receipt")
    const last = pmts.sort((a,b) => new Date(b.date)-new Date(a.date))[0]
    const days = last ? Math.floor((today - new Date(last.date))/(1000*60*60*24)) : 999
    insights.push(`⏳ ${p.name} — no payment for ${days} days`)
  })
  const lw = transactions.filter(t => { const d = new Date(t.date); return t.type==="receipt" && (today-d)<7*24*60*60*1000 }).reduce((s,t)=>s+t.amount,0)
  const pw = transactions.filter(t => { const d = new Date(t.date); const diff=(today-d)/86400000; return t.type==="receipt" && diff>=7 && diff<14 }).reduce((s,t)=>s+t.amount,0)
  if (pw > 0 && lw < pw * 0.8) insights.push(`📉 Collections dropped ${Math.round((1-lw/pw)*100)}% vs last week`)

  const notifCount = Math.max(0, overdueInvoices.length + stats.lowStockCount - (JSON.parse(localStorage.getItem("bizkhata_dismissed_notifs")||"[]")).length)

  return (
    <div style={{ paddingBottom: 24, background: "#F8FAFC", minHeight: "100vh" }}>

      {/* ── Top Bar ─────────────────────────────── */}
      <div style={{ background: "white", padding: "16px 16px 12px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "#1E3A5F" }}>{business?.name || "HisaabPro"}</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>Good {today.getHours() < 12 ? "morning" : today.getHours() < 17 ? "afternoon" : "evening"}, {currentUser?.name?.split(" ")[0]}</div>
        </div>
        <button onClick={() => setShowNotifications(true)} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, position: "relative" }}>
          <Bell size={16} color="#64748B" />
          {notifCount > 0 && <span style={{ background: "#DC2626", color: "white", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 800 }}>{notifCount}</span>}
        </button>
      </div>

      <div style={{ padding: "14px 14px 0" }}>

        {/* ── HERO: Recovery Score + Recoverable Today ── */}
        <div style={{ background: "#064E3B", borderRadius: 18, padding: "18px", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Today's Recovery Score</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 900, color: recoveryScore >= 70 ? "#4ADE80" : recoveryScore >= 40 ? "#FCD34D" : "#F87171", lineHeight: 1 }}>
                {recoveryScore}<span style={{ fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.5)" }}>/100</span>
              </div>
              {scoreExplanation.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  {scoreExplanation.map((e,i) => <div key={i} style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginBottom: 1 }}>• {e}</div>)}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, marginBottom: 4 }}>Recoverable Today</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 900, color: "white" }}>{fmtFull(stats.totalReceivable)}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 2 }}>{pendingParties.length} customers pending</div>
            </div>
          </div>
          <button onClick={() => onNavigate("recovery")} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", cursor: "pointer", background: "#059669", color: "white", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Send size={16}/> Recover Now
          </button>
        </div>

        {/* ── Key Metrics Row ─────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "Recovered", value: fmt(collectionsThisMonth), sub: "this month", color: "#059669", bg: "#F0FDF4", screen: "recovery" },
            { label: "Sales", value: fmt(transactions.filter(t=>t.type==="sale").reduce((s,t)=>s+t.amount,0)), sub: "total", color: "#1E3A5F", bg: "#EFF6FF", screen: "hisaab" },
            { label: "Rate", value: `${recoveryRate}%`, sub: "recovery", color: "#D97706", bg: "#FFFBEB", screen: "recovery" },
          ].map((s,i) => (
            <div key={i} onClick={() => onNavigate(s.screen)} style={{ background: s.bg, borderRadius: 12, padding: "12px 10px", cursor: "pointer", border: `1px solid ${s.bg}` }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.color, marginBottom: 1 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: s.color, opacity: 0.7 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Action Required ─────────────────── */}
        {actionItems.length > 0 && (
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #FED7AA", marginBottom: 14, overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "#FFF7ED", borderBottom: "1px solid #FED7AA", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={14} color="#F97316" fill="#F97316" />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "#F97316" }}>Action Required</span>
            </div>
            {actionItems.map((item,i) => (
              <div key={i} onClick={() => onNavigate(item.screen)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderBottom: i < actionItems.length-1 ? "1px solid #F1F5F9" : "none", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: item.color }}>{item.text}</span>
                <ChevronRight size={14} color={item.color} />
              </div>
            ))}
          </div>
        )}

        {/* ── Priority Follow-Ups ─────────────── */}
        {pendingParties.length > 0 && (
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", marginBottom: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 14px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#1E3A5F" }}>🎯 Priority Follow-Ups</span>
              <button onClick={() => onNavigate("recovery")} style={{ background: "none", border: "none", color: "#059669", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Recover All →</button>
            </div>
            {pendingParties.sort((a,b) => b.balance-a.balance).slice(0,3).map((p,i) => (
              <div key={p.id} onClick={() => onNavigate("party-detail", p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderBottom: i < 2 ? "1px solid #F1F5F9" : "none", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#DC2626", flexShrink: 0 }}>{p.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8" }}>{overdueInvoices.some(inv => inv.partyId === p.id) ? "🔴 Overdue" : "⏳ Pending"}</div>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#059669" }}>{fmtFull(p.balance)}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Insights ───────────────────────── */}
        {insights.length > 0 && (
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "12px 14px 8px", borderBottom: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#1E3A5F" }}>💡 Insights</span>
            </div>
            {insights.slice(0,3).map((item,i) => (
              <div key={i} style={{ padding: "10px 14px", fontSize: 13, color: "#475569", borderBottom: i < Math.min(insights.length,3)-1 ? "1px solid #F1F5F9" : "none", lineHeight: 1.5 }}>{item}</div>
            ))}
          </div>
        )}

      </div>

      {showNotifications && <NotificationsScreen onClose={() => setShowNotifications(false)} onNavigate={onNavigate} />}
    </div>
  )
}
