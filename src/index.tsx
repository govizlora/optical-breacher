import { render } from "react-dom"
import { App } from "./app";

const root = document.getElementById('root')!
document.body.appendChild(root);

render(<App />, root)