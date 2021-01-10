import { lazy, Suspense } from 'react'
import { render } from 'react-dom'
import { ErrorBoundary } from './error-boundary'
import './main.css'

const App = lazy(() => import('./app'))

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // navigator.serviceWorker.register('service-worker.js')
    // .then((registration) => {
    //   console.log('SW registered: ', registration)
    // })
    // .catch((registrationError) => {
    //   console.log('SW registration failed: ', registrationError)
    // })
  })
}

const fallback = (
  <div
    style={{
      height: '100%',
      fontSize: '1.2em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    INITIALIZING...
  </div>
)

render(
  <ErrorBoundary>
    <Suspense fallback={fallback}>
      <App />
    </Suspense>
  </ErrorBoundary>,
  document.getElementById('root')!
)
