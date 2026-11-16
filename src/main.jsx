import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/gloock/400.css'
import '@fontsource/hanken-grotesk/400.css'
import '@fontsource/hanken-grotesk/400-italic.css'
import '@fontsource/hanken-grotesk/500.css'
import '@fontsource/martian-mono/400.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/chapters.css'
import './styles/nav.css'
import './styles/exhibits.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
