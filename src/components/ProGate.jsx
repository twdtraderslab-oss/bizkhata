import React, { useState } from 'react'
import { useApp } from '../context/AppContext'

const fmtFull = n => `₹${Number(n).toLocaleString('en-IN')}`

// HOC - wraps any screen to show trial/upgrade if not Pro
export default function ProGate({ feature, children, trialDays = 2 }) {
  const { business, currentUser } = useApp()
  const [dismissed, setDismissed] = useState(false)

  const plan = business?.plan || 'free'
  const isPro = plan === 'pro'

  // Calculate days since signup
  const signupDate = currentUser?.created_at ? new Date(currentUser.created_at) : null
  const daysSinceSignup = signupDate
    ? Math.floor((new Date() - signupDate) / 86400000) : 0
  const inTrial = daysSinceSignup <= trialDays

  // If Pro or still in trial window, show feature
  if (isPro || inTrial) {
    return (
      <>
        {children}
        {/* Trial banner — show after day 1 */}
        {!isPro && daysSinceSignup >= 1 && !dismissed && (
          <div style={{ position: 'fixed', bottom: 80, left: 12, right: 12, background: 'var(--recovery)', borderRadius: 12, padding: '12px 14px', zIndex: 150, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>
                {trialDays - daysSinceSignup} day{trialDays - daysSinceSignup !== 1 ? 's' : ''} left in trial
              </div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>Upgrade to keep Recovery features</div>
            </div>
            <button onClick={() => window.dispatchEvent(new CustomEvent('show-upgrade'))} style={{ background: 'var(--accent)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              Upgrade ₹999
            </button>
            <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        )}
      </>
    )
  }

  // Trial expired — show upgrade wall
  return <UpgradeWall feature={feature} />
}

function UpgradeWall({ feature }) {
  const features = {
    recovery: {
      title: 'Payment Recovery Center',
      desc: 'Recover outstanding payments with AI-powered follow-ups, WhatsApp automation, and UPI collect links.',
      bullets: ['Auto WhatsApp Day 0→30', 'Recovery Score & Analytics', 'UPI Collect Links', 'Customer Risk Scoring'],
    },
    'auto-reminders': {
      title: 'AI Recovery Agent',
      desc: 'Automated escalation engine that follows up on every unpaid invoice — so you don\'t have to.',
      bullets: ['Day 0, 3, 7, 15, 30 automation', 'Smart message templates', 'Bulk send in one tap', 'Recovery funnel tracking'],
    },
    'recovery-dashboard': {
      title: 'Recovery Dashboard',
      desc: 'See exactly how much you\'ve recovered, who owes you, and your collection success rate.',
      bullets: ['Recovery Rate %', 'Risk breakdown (High/Medium/Low)', 'UPI Payment Links', '6-month trend chart'],
    },
  }

  const f = features[feature] || features.recovery

  return (
    <div style={{ padding: '24px 16px', paddingBottom: 80 }}>
      <div style={{ background: 'var(--recovery)', borderRadius: 18, padding: '28px 20px', textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 8 }}>
          {f.title}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
      </div>

      <div style={{ background: 'white', borderRadius: 14, padding: 16, border: '1px solid var(--border)', marginBottom: 16 }}>
        {f.bullets.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < f.bullets.length-1 ? '1px solid var(--border-light)' : 'none' }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: 'var(--green)', fontSize: 12, fontWeight: 700 }}>✓</span>
            </div>
            <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>{b}</span>
          </div>
        ))}
      </div>

      <RazorpayButton />
    </div>
  )
}

export function RazorpayButton({ style = {} }) {
  const { currentUser, business } = useApp()
  const [loading, setLoading] = useState(false)

  const handlePayment = () => {
    setLoading(true)
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      const options = {
        key: 'rzp_test_PLACEHOLDER', // Replace with your Razorpay key
        amount: 99900, // ₹999 in paise
        currency: 'INR',
        name: 'HisaabPro',
        description: 'Recovery Center — Annual Plan',
        image: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="%231E3A5F"/><text x="32" y="44" font-size="32" text-anchor="middle" font-family="Arial" font-weight="bold" fill="%23E8520A">H</text></svg>',
        prefill: {
          name: currentUser?.name || '',
          email: currentUser?.email || '',
          contact: business?.phone || '',
        },
        notes: {
          business_name: business?.name || '',
          plan: 'pro_annual',
        },
        theme: { color: '#1E3A5F' },
        handler: function(response) {
          // Payment success - show confirmation
          alert(`Payment successful! Your Recovery Center is now unlocked.\n\nPayment ID: ${response.razorpay_payment_id}\n\nWe will activate your Pro account within 24 hours.`)
          setLoading(false)
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    }
    document.head.appendChild(script)
  }

  return (
    <button onClick={handlePayment} disabled={loading} style={{
      width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer',
      background: 'var(--recovery)', color: 'white',
      fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17,
      boxShadow: '0 4px 14px rgba(6,95,70,0.3)',
      opacity: loading ? 0.7 : 1,
      ...style
    }}>
      {loading ? 'Opening payment...' : 'Upgrade to Recovery Pro — ₹999/year'}
    </button>
  )
}
