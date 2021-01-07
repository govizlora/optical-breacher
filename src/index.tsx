import { render } from 'react-dom'
import { App } from './app'
import { ErrorBoundary } from './error-boundary'
import './main.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
    // .then((registration) => {
    //   console.log('SW registered: ', registration)
    // })
    // .catch((registrationError) => {
    //   console.log('SW registration failed: ', registrationError)
    // })
  })
}

render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById('root')!
)
