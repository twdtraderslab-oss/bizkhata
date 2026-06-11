import React from 'react'
import { ArrowLeft } from 'lucide-react'

export function AboutPage({ onBack }) {
  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#1E3A5F', padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={18}/></button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white' }}>About HisaabPro</h2>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: 80, height: 80, borderRadius: 22, background: '#1E3A5F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 900, color: '#F97316' }}>H</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#1E3A5F' }}>HisaabPro</div>
          <div style={{ color: '#64748B', fontSize: 14, marginTop: 4 }}>Your AI Recovery Agent for MSMEs</div>
        </div>
        {[
          { title: '🎯 Our Mission', text: 'HisaabPro is built for Indian MSME owners and wholesale traders who struggle with outstanding payments. We believe every business deserves a smart recovery system — not just a ledger.' },
          { title: '💡 What We Do', text: 'We go beyond bookkeeping. HisaabPro helps you track who owes you money, automatically follows up via WhatsApp, scores customer risk, and gives you actionable insights to improve cash flow.' },
          { title: '🏆 Why HisaabPro', text: 'Unlike other accounting apps, HisaabPro is focused on RECOVERY. Our AI Recovery Agent, automated follow-up engine, and UPI collect links help you recover outstanding payments 3x faster.' },
          { title: '🇮🇳 Made in India', text: 'Built specifically for Indian businesses — GST ready, Hindi & English support, UPI integration, and designed for the way Indian traders actually work.' },
          { title: '📞 Contact Us', text: 'Email: support@hisaabpro.app\nWhatsApp: +91 98765 43210\nWebsite: hisaabpro.app' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 14, padding: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#1E3A5F', marginBottom: 8 }}>{s.title}</div>
            <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PrivacyPage({ onBack }) {
  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#1E3A5F', padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={18}/></button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white' }}>Privacy Policy</h2>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 12, color: '#94A3B8' }}>Last updated: June 2026</p>
        {[
          { title: '1. Data We Collect', text: 'We collect business information you provide: party names, transaction amounts, invoice details, and product inventory. We also collect your email and phone number for authentication.' },
          { title: '2. How We Use Your Data', text: 'Your data is used solely to provide HisaabPro services. We use it to calculate recovery scores, generate reports, and power the AI Recovery Agent. We do NOT sell your data to third parties.' },
          { title: '3. Data Storage', text: 'Your business data is stored securely on Supabase servers (Mumbai region, India). Data is encrypted in transit and at rest. We maintain backups to prevent data loss.' },
          { title: '4. WhatsApp Integration', text: 'When you use our WhatsApp reminder feature, messages are sent through WhatsApp\'s own platform. We do not store message content. Your customers\' numbers are used only to send reminders you authorize.' },
          { title: '5. Data Security', text: 'We implement industry-standard security measures including SSL encryption, secure authentication, and regular security audits. Your financial data is confidential.' },
          { title: '6. Your Rights', text: 'You can export all your data anytime using the Backup feature. You can request data deletion by contacting support@hisaabpro.app. We will process deletion within 7 business days.' },
          { title: '7. Contact', text: 'For privacy concerns: privacy@hisaabpro.app' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#1E3A5F', marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TermsPage({ onBack }) {
  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#1E3A5F', padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={18}/></button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white' }}>Terms & Conditions</h2>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 12, color: '#94A3B8' }}>Last updated: June 2026 · Governing law: India</p>
        {[
          { title: '1. Acceptance', text: 'By using HisaabPro, you agree to these Terms. If you disagree, please discontinue use immediately.' },
          { title: '2. Free & Paid Plans', text: 'The Free plan includes ledger, invoicing, and inventory features at no cost. The Pro plan (₹999/year) includes AI Recovery, auto-reminders, UPI collect, and advanced reports. Pricing may change with 30 days notice.' },
          { title: '3. Acceptable Use', text: 'HisaabPro is for legitimate business use only. You may not use the platform for fraudulent transactions, spamming customers, or any illegal activity. We reserve the right to terminate accounts for misuse.' },
          { title: '4. Data Ownership', text: 'You own all data you enter into HisaabPro. We claim no ownership over your business data. You can export and delete your data at any time.' },
          { title: '5. Limitation of Liability', text: 'HisaabPro is a business tool. We are not responsible for business decisions made based on app data, WhatsApp messages sent via our platform, or recovery outcomes. Always verify critical financial information independently.' },
          { title: '6. Service Availability', text: 'We aim for 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance. We are not liable for losses due to downtime.' },
          { title: '7. Refund Policy', text: 'Pro plan subscriptions are non-refundable after 7 days of purchase. Contact support within 7 days for a full refund if the product does not meet your needs.' },
          { title: '8. Contact', text: 'Legal: legal@hisaabpro.app\nSupport: support@hisaabpro.app' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 12, padding: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#1E3A5F', marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function HelpPage({ onBack }) {
  const faqs = [
    { q: 'How do I add a new customer?', a: 'Go to Hisaab → Parties → tap the + button → fill in details.' },
    { q: 'How does the Recovery Score work?', a: 'Recovery Score is calculated based on: number of unpaid invoices, total outstanding amount, and overdue days. Higher score = better recovery.' },
    { q: 'Can I export data to Excel?', a: 'Yes! Go to Hisaab → Reports → Export section. Choose Excel (CSV) for any report.' },
    { q: 'How does Auto Reminder work?', a: 'AI Recovery Agent sends WhatsApp reminders on Day 0, 3, 7, 15, 30 after invoice creation. Open app daily to see and send pending reminders.' },
    { q: 'Is my data safe?', a: 'Yes. Data is encrypted and stored on secure servers in Mumbai. Use Backup feature regularly for extra safety.' },
    { q: 'What is UPI Collect?', a: 'Generate a UPI payment link for any invoice. Send it via WhatsApp — customer taps the link, UPI app opens with amount pre-filled.' },
    { q: 'Can multiple staff use the app?', a: 'Yes, in the free plan up to 3 staff. Go to More → Staff Management to add staff with different roles.' },
    { q: 'How do I reset my password?', a: 'On the login screen, tap "Forgot password?" and enter your email. Check your inbox for reset link.' },
  ]
  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#1E3A5F', padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={18}/></button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white' }}>Help & Support</h2>
      </div>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ background: '#064E3B', borderRadius: 14, padding: '16px', marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ fontSize: 32 }}>📞</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 3 }}>Need Help?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>WhatsApp: +91 98765 43210</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Email: support@hisaabpro.app</div>
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>Frequently Asked Questions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 12, padding: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1E3A5F', marginBottom: 6 }}>Q: {faq.q}</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function UpgradePage({ onBack }) {
  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#064E3B', padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft size={18}/></button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'white' }}>Unlock Recovery Center</h2>
      </div>
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 900, color: '#059669' }}>₹999</div>
          <div style={{ color: '#64748B', fontSize: 14 }}>per year · cancel anytime</div>
          <div style={{ color: '#059669', fontSize: 13, fontWeight: 700, marginTop: 4 }}>Save ₹2,989 vs monthly billing</div>
        </div>

        {[
          { title: '✅ FREE Forever (No credit card)', items: ['Unlimited Parties & Ledger', 'Unlimited Invoices & Billing', 'Inventory Management', 'Cash Book', 'Basic Reports'] },
          { title: '🚀 PRO — ₹999/year (Recovery Features)', items: ['AI Recovery Agent', 'Auto WhatsApp Reminders (Day 0→30)', 'UPI Collect Links in invoices', 'Recovery Dashboard & Analytics', 'Recovery Score & Explanations', 'Customer Risk Scoring', 'PDF + Excel Export', 'GST Reports', 'Priority Support'] },
        ].map((plan, i) => (
          <div key={i} style={{ background: i === 1 ? '#F0FDF4' : 'white', borderRadius: 14, padding: '16px', border: `2px solid ${i === 1 ? '#86EFAC' : '#E2E8F0'}` }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: i === 1 ? '#059669' : '#1E3A5F', marginBottom: 12 }}>{plan.title}</div>
            {plan.items.map((item, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ color: i === 1 ? '#059669' : '#94A3B8', fontWeight: 700 }}>{i === 1 ? '✓' : '✓'}</span>
                <span style={{ fontSize: 14, color: '#1E3A5F' }}>{item}</span>
              </div>
            ))}
          </div>
        ))}

        <button style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: 'pointer', background: '#059669', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>
          Start Recovery Pro — ₹999/year
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#94A3B8' }}>Powered by Razorpay · Coming Soon</p>
      </div>
    </div>
  )
}
