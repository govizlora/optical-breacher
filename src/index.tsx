import { render } from "react-dom"
import { App } from "./app";
import { ErrorBoundary } from './error-boundary'

const root = document.getElementById('root')!

render(<ErrorBoundary><App /></ErrorBoundary>, root)