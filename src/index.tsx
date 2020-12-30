import { render } from "react-dom"
import { App } from "./app";
import { ErrorBoundary } from './error-boundary'

const root = document.getElementById('root')!
document.body.appendChild(root);

render(<ErrorBoundary><App /></ErrorBoundary>, root)