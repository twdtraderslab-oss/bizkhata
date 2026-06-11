import React, { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

export default function PWAInstall() {
  const [prompt, setPrompt] = useState(null)
  const [shown, setShown] = useState(false)
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem('pwa_dismissed'))
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    // Listen for Chrome/Android install prompt
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setShown(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Show iOS guide after 30 seconds if not dismissed
    if (ios && !dismissed && !window.navigator.standalone) {
      setTimeout(() => setShown(true), 30000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (prompt) {
      prompt.prompt()
      const result = await prompt.userChoice
      if (result.outcome === 'accepted') {
        setShown(false)
        localStorage.setItem('pwa_installed', 'true')
      }
    } else if (isIOS) {
      setShowIOSGuide(true)
    }
  }

  const handleDismiss = () => {
    setShown(false)
    setDismissed(true)
    localStorage.setItem('pwa_dismissed', 'true')
  }

  if (!shown || dismissed) return null

  return (
    <>
      {/* Install Banner */}
      <div style={{
        position: 'fixed', bottom: 80, left: 12, right: 12,
        background: 'var(--brand)', borderRadius: 14,
        padding: '14px 16px', zIndex: 200,
        boxShadow: '0 4px 20px rgba(30,58,95,0.3)',
        display: 'flex', alignItems: 'center', gap: 12,
        animation: 'slideUp 0.3s ease forwards',
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 20, color: 'white' }}>H</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 2 }}>
            Add HisaabPro to Home Screen
          </div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>
            One tap to open — no browser needed
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={handleInstall} style={{ background: 'var(--accent)', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            Add
          </button>
          <button onClick={handleDismiss} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowIOSGuide(false)}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', width: '100%' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--brand)', marginBottom: 6 }}>
              Add to Home Screen
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              Install HisaabPro as an app on your iPhone:
            </p>
            {[
              { step: '1', text: 'Tap the Share button at the bottom of Safari', icon: '⬆️' },
              { step: '2', text: 'Scroll down and tap "Add to Home Screen"', icon: '＋' },
              { step: '3', text: 'Tap "Add" in the top right corner', icon: '✓' },
            ].map((s,i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{s.text}</div>
              </div>
            ))}
            <button onClick={() => { setShowIOSGuide(false); setShown(false) }} className="btn-primary" style={{ width: '100%', marginTop: 8 }}>Got it!</button>
          </div>
        </div>
      )}
    </>
  )
}
