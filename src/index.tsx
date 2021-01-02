import { render } from 'react-dom'
import { App } from './app'
import { ErrorBoundary } from './error-boundary'
import './main.css'

render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById('root')!
)
