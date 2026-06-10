import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

// ── Splash Screen ─────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(145deg, #1A1F5E 0%, #2D3491 50%, #FF6B1A 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <div style={{ animation: 'slideUp 0.6s ease forwards' }}>
        <div style={{
          width: 90, height: 90, borderRadius: 24,
          background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, marginBottom: 20,
        }}>📒</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'white',
          textAlign: 'center', letterSpacing: '-0.5px',
        }}>BizKhata</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: 16, marginTop: 6 }}>
          Smart Business Ledger
        </p>
      </div>
      <div style={{ position: 'absolute', bottom: 48, display: 'flex', gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            width: i === 0 ? 24 : 8, height: 8, borderRadius: 99,
            background: i === 0 ? 'white' : 'rgba(255,255,255,0.4)',
            transition: 'all 0.3s',
          }} />
        ))}
      </div>
    </div>
  )
}

// ── Onboarding ────────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '📒', title: 'Udhaar Track Karo', titleHi: 'उधार ट्रैक करो', sub: 'Know exactly who owes you — and who you owe', subHi: 'जानें कौन आपका उधारी है और आप किसके' },
  { emoji: '📦', title: 'Stock Management', titleHi: 'स्टॉक प्रबंधन', sub: 'Never run out of stock unexpectedly', subHi: 'स्टॉक खत्म होने से पहले ही अलर्ट पाएं' },
  { emoji: '📊', title: 'Business Reports', titleHi: 'बिज़नेस रिपोर्ट', sub: 'Profit, cash flow, outstanding — at a glance', subHi: 'मुनाफा, नकदी प्रवाह — एक नज़र में' },
]

function OnboardingScreen({ onDone }) {
  const [slide, setSlide] = useState(0)
  const { language } = useApp()
  const hi = language === 'hi'
  const s = SLIDES[slide]

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      padding: '60px 32px 48px',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, textAlign: 'center' }}>
        <div style={{
          width: 140, height: 140, borderRadius: 36,
          background: 'linear-gradient(135deg, var(--saffron-light), var(--indigo-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64,
          boxShadow: '0 8px 32px rgba(255,107,26,0.15)',
          animation: 'fadeIn 0.4s ease',
          key: slide,
        }}>{s.emoji}</div>
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--indigo)', marginBottom: 12 }}>
            {hi ? s.titleHi : s.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.6, maxWidth: 280 }}>
            {hi ? s.subHi : s.sub}
          </p>
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => setSlide(i)} style={{
              width: i === slide ? 28 : 8, height: 8, borderRadius: 99,
              background: i === slide ? 'var(--saffron)' : 'var(--border)',
              transition: 'all 0.3s', cursor: 'pointer',
            }} />
          ))}
        </div>
        {slide < 2 ? (
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => setSlide(s => s + 1)}>
            Next →
          </button>
        ) : (
          <button className="btn-primary" style={{ width: '100%' }} onClick={onDone}>
            Get Started — It's Free! 🚀
          </button>
        )}
        <button onClick={onDone} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>
          Skip
        </button>
      </div>
    </div>
  )
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen() {
  const { login } = useApp()
  const [step, setStep] = useState('phone') // phone | otp | name
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timer, setTimer] = useState(30)

  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const t = setTimeout(() => setTimer(t => t - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [step, timer])

  const handlePhoneSubmit = () => {
    if (phone.length !== 10) { setError('Please enter a valid 10-digit number'); return }
    setError('')
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep('otp'); setTimer(30) }, 1200)
  }

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]
    next[i] = val
    setOtp(next)
    if (val && i < 3) document.getElementById(`otp-${i + 1}`)?.focus()
    if (next.join('').length === 4) {
      setLoading(true)
      // Simulate OTP verification — accept any 4-digit code
      setTimeout(() => { setLoading(false); setStep('name') }, 1000)
    }
  }

  const handleNameSubmit = () => {
    if (name.trim().length < 2) { setError('Please enter your name'); return }
    login({ id: 'U001', name: name.trim(), phone, role: 'Owner' })
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, var(--indigo) 0%, var(--indigo-mid) 35%, var(--bg) 35%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px 40px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48, animation: 'slideUp 0.5s ease' }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>📒</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'white' }}>BizKhata</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 4 }}>Smart Business Ledger</p>
      </div>

      {/* Card */}
      <div className="card fade-in" style={{ width: '100%', maxWidth: 400, padding: 32 }}>

        {/* STEP: Phone */}
        {step === 'phone' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6, color: 'var(--indigo)' }}>
              Login / Sign Up
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Enter your mobile number to continue
            </p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <div style={{
                border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)',
                padding: '12px 14px', background: 'var(--bg)', fontWeight: 600, color: 'var(--text-secondary)',
                fontSize: 15, whiteSpace: 'nowrap',
              }}>🇮🇳 +91</div>
              <input
                className="input-field"
                type="tel" maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
                autoFocus
              />
            </div>
            {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <button className="btn-primary" style={{ width: '100%', marginTop: 8 }}
              onClick={handlePhoneSubmit} disabled={loading || phone.length !== 10}>
              {loading ? 'Sending OTP...' : 'Send OTP →'}
            </button>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 16 }}>
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </>
        )}

        {/* STEP: OTP */}
        {step === 'otp' && (
          <>
            <button onClick={() => setStep('phone')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>
              ← Back
            </button>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6, color: 'var(--indigo)' }}>
              Enter OTP
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              Sent to +91 {phone} — <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>(demo: any 4 digits work)</span>
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
              {otp.map((d, i) => (
                <input key={i} id={`otp-${i}`}
                  style={{
                    width: 58, height: 58, textAlign: 'center', fontSize: 24, fontWeight: 700,
                    border: `2px solid ${d ? 'var(--saffron)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)', outline: 'none', color: 'var(--indigo)',
                    transition: 'border-color 0.2s',
                  }}
                  type="text" maxLength={1} value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`otp-${i - 1}`)?.focus() }}
                />
              ))}
            </div>
            {loading && (
              <div style={{ textAlign: 'center', color: 'var(--saffron)', fontSize: 14, marginBottom: 16 }}>
                Verifying OTP...
              </div>
            )}
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              {timer > 0 ? `Resend OTP in ${timer}s` : (
                <button onClick={() => { setTimer(30); setStep('phone') }}
                  style={{ background: 'none', border: 'none', color: 'var(--saffron)', cursor: 'pointer', fontWeight: 600 }}>
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}

        {/* STEP: Name */}
        {step === 'name' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 6, color: 'var(--indigo)' }}>
              Welcome! 🎉
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
              What should we call you?
            </p>
            <input
              className="input-field"
              placeholder="Your name (e.g. Ramesh Sharma)"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
              autoFocus
              style={{ marginBottom: 8 }}
            />
            {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 8 }}>{error}</p>}
            <button className="btn-primary" style={{ width: '100%', marginTop: 8 }}
              onClick={handleNameSubmit} disabled={name.trim().length < 2}>
              Enter BizKhata →
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Auth Shell — manages splash → onboarding → login flow ────────────────────
export default function AuthScreen() {
  const [authStep, setAuthStep] = useState('splash')
  const hasSeenOnboarding = localStorage.getItem('bizkhata_onboarded')

  return authStep === 'splash'
    ? <SplashScreen onDone={() => setAuthStep(hasSeenOnboarding ? 'login' : 'onboarding')} />
    : authStep === 'onboarding'
    ? <OnboardingScreen onDone={() => { localStorage.setItem('bizkhata_onboarded', '1'); setAuthStep('login') }} />
    : <LoginScreen />
}
