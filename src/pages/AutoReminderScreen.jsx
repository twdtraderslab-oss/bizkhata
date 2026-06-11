import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { Clock, Bell, CheckCircle, Play, Pause, Plus, Trash2, Send } from 'lucide-react'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

const DEFAULT_SCHEDULE = [
  { day: 0,  label: 'Same Day',  labelHi: 'उसी दिन',   active: true,  msg: 'Dear {name}, invoice {invoice} for {amount} has been raised. Due date: {due}.' },
  { day: 3,  label: 'Day 3',    labelHi: 'तीसरे दिन', active: true,  msg: 'Dear {name}, friendly reminder: {amount} is due on {due}. Invoice: {invoice}.' },
  { day: 7,  label: 'Day 7',    labelHi: 'सातवें दिन', active: true,  msg: 'Dear {name}, payment of {amount} is due today ({due}). Please arrange payment. Invoice: {invoice}.' },
  { day: 15, label: 'Day 15',   labelHi: '15वें दिन', active: false, msg: 'Dear {name}, your payment of {amount} is 8 days overdue. Please pay immediately.' },
  { day: 30, label: 'Day 30',   labelHi: '30वें दिन', active: false, msg: 'Dear {name}, URGENT: {amount} is 23 days overdue. Please contact us immediately.' },
]

export default function AutoReminderScreen() {
  const { invoices, parties, business, language } = useApp()
  const hi = language === 'hi'
  const safeInvoices = invoices || []

  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('hisaabpro_schedule')
    return saved ? JSON.parse(saved) : DEFAULT_SCHEDULE
  })
  const [engineActive, setEngineActive] = useState(() => localStorage.getItem('hisaabpro_engine') === 'true')
  const [sentLog, setSentLog] = useState(() => {
    const saved = localStorage.getItem('hisaabpro_sent_log')
    return saved ? JSON.parse(saved) : []
  })
  const [editIdx, setEditIdx] = useState(null)

  const saveSchedule = (s) => { setSchedule(s); localStorage.setItem('hisaabpro_schedule', JSON.stringify(s)) }
  const toggleEngine = () => { const v = !engineActive; setEngineActive(v); localStorage.setItem('hisaabpro_engine', String(v)) }
  const toggleDay = (i) => { const s = [...schedule]; s[i].active = !s[i].active; saveSchedule(s) }

  // Pending reminders — what needs to go today
  const today = new Date()
  const pendingReminders = []
  safeInvoices.filter(inv => inv.status !== 'paid').forEach(inv => {
    const party = parties.find(p => p.id === inv.partyId)
    if (!party?.phone) return
    const invDate = new Date(inv.date)
    schedule.filter(s => s.active).forEach(s => {
      const targetDate = new Date(invDate)
      targetDate.setDate(targetDate.getDate() + s.day)
      const diffDays = Math.floor((today - targetDate) / (1000*60*60*24))
      if (diffDays >= 0 && diffDays <= 1) {
        const logKey = `${inv.id}-${s.day}`
        if (!sentLog.includes(logKey)) {
          pendingReminders.push({ inv, party, schedule: s, logKey })
        }
      }
    })
  })

  const sendPending = (item) => {
    const msg = item.schedule.msg
      .replace('{name}', item.party.name)
      .replace('{amount}', fmtFull(item.inv.totalAmount))
      .replace('{invoice}', item.inv.invoiceNo)
      .replace('{due}', item.inv.dueDate)
    window.open(`https://wa.me/91${item.party.phone}?text=${encodeURIComponent(msg)}`, '_blank')
    const newLog = [...sentLog, item.logKey]
    setSentLog(newLog)
    localStorage.setItem('hisaabpro_sent_log', JSON.stringify(newLog))
  }

  const sendAllPending = () => pendingReminders.forEach((item, i) => setTimeout(() => sendPending(item), i * 600))

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', padding: '24px 16px 28px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              {hi ? 'AI रिकवरी एजेंट' : 'AI Recovery Agent'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>
              {hi ? 'Day 0, 3, 7, 15, 30 — Automated Escalation' : '✓ Day 0 Reminder  ✓ Day 3 Follow-up  ✓ Day 7 Escalation'}
            </p>
          </div>
          {/* Engine Toggle */}
          <div style={{ textAlign: 'center' }}>
            <div onClick={toggleEngine} style={{ width: 60, height: 32, borderRadius: 99, background: engineActive ? '#4ADE80' : 'rgba(255,255,255,0.2)', cursor: 'pointer', position: 'relative', transition: 'background 0.3s', border: '2px solid rgba(255,255,255,0.3)' }}>
              <div style={{ position: 'absolute', top: 3, left: engineActive ? 30 : 3, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 4 }}>{engineActive ? 'ON' : 'OFF'}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { l: hi ? 'लंबित आज' : 'Pending Today', v: pendingReminders.length, c: pendingReminders.length > 0 ? '#FCD34D' : '#4ADE80' },
            { l: hi ? 'भेजे गए' : 'Sent Total', v: sentLog.length, c: 'white' },
            { l: hi ? 'सक्रिय इनवॉइस' : 'Active Invoices', v: safeInvoices.filter(i => i.status !== 'paid').length, c: 'white' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Pending Today */}
        {pendingReminders.length > 0 && (
          <div className="card" style={{ overflow: 'hidden', border: '1px solid #FCD34D' }}>
            <div style={{ background: 'var(--amber-light)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #FCD34D' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bell size={16} color="var(--amber)" />
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--amber)' }}>{pendingReminders.length} reminders due today!</span>
              </div>
              <button onClick={sendAllPending} style={{ background: '#25D366', border: 'none', borderRadius: 10, padding: '8px 14px', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Send size={13} /> Send All
              </button>
            </div>
            {pendingReminders.map((item, i) => (
              <div key={item.logKey} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: i < pendingReminders.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.party.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.inv.invoiceNo} · {fmtFull(item.inv.totalAmount)} · Day {item.schedule.day}</div>
                </div>
                <button onClick={() => sendPending(item)} style={{ background: '#25D366', border: 'none', borderRadius: 8, padding: '5px 12px', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Send</button>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Configuration */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--indigo)' }}>
              {hi ? 'Escalation Schedule' : 'AI Recovery Escalation Schedule'}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{hi ? 'Invoice बनने के बाद automatic follow-up' : 'Automated WhatsApp escalation sequence'}</p>
          </div>
          {schedule.map((s, i) => (
            <div key={i} style={{ padding: '14px 16px', borderBottom: i < schedule.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: editIdx === i ? 10 : 0 }}>
                {/* Toggle */}
                <div onClick={() => toggleDay(i)} style={{ width: 42, height: 24, borderRadius: 99, background: s.active ? '#7C3AED' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 2, left: s.active ? 20 : 2, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: s.active ? 'var(--indigo)' : 'var(--text-muted)' }}>
                    {hi ? s.labelHi : s.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.msg.slice(0, 50)}...</div>
                </div>
                <button onClick={() => setEditIdx(editIdx === i ? null : i)} style={{ background: 'var(--bg)', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
                  {editIdx === i ? 'Done' : 'Edit'}
                </button>
              </div>
              {editIdx === i && (
                <textarea className="input-field" rows={3} value={s.msg} style={{ resize: 'none', fontSize: 12 }}
                  onChange={e => { const ns = [...schedule]; ns[i].msg = e.target.value; saveSchedule(ns) }} />
              )}
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ background: 'var(--indigo-light)', borderRadius: 14, padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, color: 'var(--indigo)', fontSize: 14, marginBottom: 8 }}>💡 {hi ? 'कैसे काम करता है' : 'How it works'}</div>
          {[
            hi ? 'इनवॉइस बनाओ → schedule automatically set हो जाता है' : 'Create invoice → schedule is automatically set',
            hi ? 'हर दिन app खोलो → pending reminders दिखेंगे' : 'Open app daily → see pending reminders',
            hi ? '"Send All" dabao → WhatsApp pe messages jayenge' : 'Tap "Send All" → messages sent via WhatsApp',
            hi ? 'Variables: {name} {amount} {invoice} {due}' : 'Variables: {name} {amount} {invoice} {due}',
          ].map((tip, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--indigo)', marginBottom: 4, display: 'flex', gap: 6 }}>
              <span style={{ opacity: 0.5 }}>•</span><span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
