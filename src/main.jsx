import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

document.fonts.ready.then(() => {
  document.getElementById('root')?.classList.add('loaded')
})
// Fallback in case fonts take too long
setTimeout(() => document.getElementById('root')?.classList.add('loaded'), 800)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
