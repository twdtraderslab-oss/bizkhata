import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { signUp, signIn, resetPassword, supabase } from '../utils/supabase'

// ── Splash Screen ─────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #1A1F5E 0%, #2D3491 50%, #FF6B1A 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <div style={{ animation: 'slideUp 0.6s ease forwards', textAlign: 'center' }}>
        <div style={{ width: 90, height: 90, borderRadius: 24, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, margin: '0 auto 20px' }}>📒</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>BizKhata</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16, marginTop: 6 }}>Smart Business Ledger</p>
      </div>
      <div style={{ position: 'absolute', bottom: 40, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Made with ❤️ in India</div>
    </div>
  )
}

// ── Onboarding ────────────────────────────────────────────────────────────────
const SLIDES = [
  { emoji: '📒', title: 'Udhaar Track Karo', sub: 'Know exactly who owes you — and who you owe' },
  { emoji: '📦', title: 'Stock Management', sub: 'Never run out of stock unexpectedly' },
  { emoji: '📊', title: 'Business Reports', sub: 'Profit, cash flow, outstanding — at a glance' },
]

function OnboardingScreen({ onDone }) {
  const [slide, setSlide] = useState(0)
  const s = SLIDES[slide]
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '60px 32px 48px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, textAlign: 'center' }}>
        <div style={{ width: 140, height: 140, borderRadius: 36, background: 'linear-gradient(135deg, var(--saffron-light), var(--indigo-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, boxShadow: '0 8px 32px rgba(255,107,26,0.15)', animation: 'fadeIn 0.4s ease' }}>{s.emoji}</div>
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'var(--indigo)', marginBottom: 12 }}>{s.title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 17, lineHeight: 1.6, maxWidth: 280 }}>{s.sub}</p>
        </div>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {SLIDES.map((_, i) => <div key={i} onClick={() => setSlide(i)} style={{ width: i === slide ? 28 : 8, height: 8, borderRadius: 99, background: i === slide ? 'var(--saffron)' : 'var(--border)', transition: 'all 0.3s', cursor: 'pointer' }} />)}
        </div>
        {slide < 2
          ? <button className="btn-primary" style={{ width: '100%' }} onClick={() => setSlide(s => s + 1)}>Next →</button>
          : <button className="btn-primary" style={{ width: '100%' }} onClick={onDone}>Get Started — It's Free! 🚀</button>
        }
        <button onClick={onDone} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>Skip</button>
      </div>
    </div>
  )
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginSignupScreen() {
  const { login } = useApp()
  const [mode, setMode] = useState('login') // login | signup | forgot
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  // Signup form
  const [signupData, setSignupData] = useState({ businessName: '', ownerName: '', phone: '', email: '', password: '', confirmPassword: '' })

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState('')

  const handleLogin = async () => {
    if (!loginEmail || !loginPass) { setError('Please enter email and password'); return }
    setLoading(true); setError('')
    try {
      const data = await signIn({ email: loginEmail, password: loginPass })
      const user = data.user
      const meta = user.user_metadata || {}
      login({
        id: user.id,
        name: meta.ownerName || meta.businessName || loginEmail.split('@')[0],
        email: user.email,
        businessName: meta.businessName || 'My Business',
        phone: meta.phone || '',
        role: 'Owner',
        supabaseUser: user,
      })
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Wrong email or password. Please try again.' : err.message)
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    const { businessName, ownerName, phone, email, password, confirmPassword } = signupData
    if (!businessName.trim()) { setError('Business name required'); return }
    if (!ownerName.trim()) { setError('Owner name required'); return }
    if (!email.includes('@')) { setError('Valid email required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      await signUp({ email, password, businessName, ownerName, phone })
      setSuccess('Account created! Please check your email to verify, then login.')
      setMode('login')
      setLoginEmail(email)
    } catch (err) {
      setError(err.message.includes('already registered') ? 'This email is already registered. Please login.' : err.message)
    }
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!forgotEmail.includes('@')) { setError('Enter valid email'); return }
    setLoading(true); setError('')
    try {
      await resetPassword(forgotEmail, window.location.origin)
      setSuccess('Password reset link sent! Check your email.')
      setMode('login')
    } catch (err) { setError(err.message) }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, var(--indigo) 0%, var(--indigo-mid) 35%, var(--bg) 35%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '50px 24px 40px' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40, animation: 'slideUp 0.5s ease' }}>
        <div style={{ fontSize: 38, marginBottom: 8 }}>📒</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: 'white' }}>BizKhata</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginTop: 4 }}>Smart Business Ledger</p>
      </div>

      {/* Card */}
      <div className="card fade-in" style={{ width: '100%', maxWidth: 420, padding: 28 }}>

        {/* Tab Toggle */}
        {mode !== 'forgot' && (
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {[{ id: 'login', label: 'Login' }, { id: 'signup', label: 'New Account' }].map(tab => (
              <button key={tab.id} onClick={() => { setMode(tab.id); setError(''); setSuccess('') }} style={{
                flex: 1, padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                background: mode === tab.id ? 'white' : 'transparent',
                color: mode === tab.id ? 'var(--indigo)' : 'var(--text-muted)',
                boxShadow: mode === tab.id ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s',
              }}>{tab.label}</button>
            ))}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div style={{ background: 'var(--green-light)', border: '1px solid #86EFAC', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
            ✅ {success}
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)', marginBottom: 20 }}>Welcome Back 👋</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
                <input className="input-field" type="email" placeholder="your@email.com" value={loginEmail} onChange={e => { setLoginEmail(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Password</label>
                <input className="input-field" type="password" placeholder="••••••••" value={loginPass} onChange={e => { setLoginPass(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              {error && <div style={{ background: 'var(--red-light)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>⚠️ {error}</div>}
              <button className="btn-primary" style={{ width: '100%' }} onClick={handleLogin} disabled={loading}>
                {loading ? '⏳ Logging in...' : 'Login →'}
              </button>
              <button onClick={() => { setMode('forgot'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: 'var(--saffron)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Forgot password?
              </button>
            </div>
          </>
        )}

        {/* ── SIGNUP FORM ── */}
        {mode === 'signup' && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)', marginBottom: 20 }}>Create Account 🚀</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { key: 'businessName', label: 'Business Name *', placeholder: 'e.g. Sharma Traders', type: 'text' },
                { key: 'ownerName', label: 'Owner Name *', placeholder: 'e.g. Ramesh Sharma', type: 'text' },
                { key: 'phone', label: 'Mobile Number', placeholder: '9876543210 (optional)', type: 'tel' },
                { key: 'email', label: 'Email *', placeholder: 'your@email.com', type: 'email' },
                { key: 'password', label: 'Password * (min 6 chars)', placeholder: '••••••••', type: 'password' },
                { key: 'confirmPassword', label: 'Confirm Password *', placeholder: '••••••••', type: 'password' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input className="input-field" type={f.type} placeholder={f.placeholder}
                    value={signupData[f.key]} onChange={e => { setSignupData(p => ({ ...p, [f.key]: e.target.value })); setError('') }} />
                </div>
              ))}
              {error && <div style={{ background: 'var(--red-light)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>⚠️ {error}</div>}
              <button className="btn-primary" style={{ width: '100%', marginTop: 4 }} onClick={handleSignup} disabled={loading}>
                {loading ? '⏳ Creating account...' : 'Create Account ✓'}
              </button>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 11, lineHeight: 1.5 }}>
                By signing up, you agree to our Terms & Privacy Policy
              </p>
            </div>
          </>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {mode === 'forgot' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <button onClick={() => { setMode('login'); setError('') }} style={{ background: 'var(--bg)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16 }}>←</button>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--indigo)' }}>Reset Password 🔑</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Enter your email — we'll send a reset link</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input className="input-field" type="email" placeholder="your@email.com" value={forgotEmail} onChange={e => { setForgotEmail(e.target.value); setError('') }} autoFocus />
              {error && <div style={{ background: 'var(--red-light)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>⚠️ {error}</div>}
              <button className="btn-primary" style={{ width: '100%' }} onClick={handleForgot} disabled={loading}>
                {loading ? '⏳ Sending...' : 'Send Reset Link →'}
              </button>
            </div>
          </>
        )}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 24 }}>BizKhata · Free forever for small businesses</p>
    </div>
  )
}

// ── Auth Shell ────────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const [authStep, setAuthStep] = useState('splash')
  const hasSeenOnboarding = localStorage.getItem('bizkhata_onboarded')

  return authStep === 'splash'
    ? <SplashScreen onDone={() => setAuthStep(hasSeenOnboarding ? 'login' : 'onboarding')} />
    : authStep === 'onboarding'
    ? <OnboardingScreen onDone={() => { localStorage.setItem('bizkhata_onboarded', '1'); setAuthStep('login') }} />
    : <LoginSignupScreen />
}
