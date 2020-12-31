import { render } from "react-dom"
import { App } from "./app";
import { ErrorBoundary } from './error-boundary'
import './main.css'

const root = document.getElementById('root')!

render(<ErrorBoundary><App /></ErrorBoundary>, root)