import { render } from 'react-dom'
import { App } from './app'
import { ErrorBoundary } from './error-boundary'
import './main.css'
import { worker } from './image-processing/ImageProcessor'

render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById('root')!
)

worker.postMessage('baka')

console.log(worker, 222)
