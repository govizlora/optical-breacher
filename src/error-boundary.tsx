import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { error: undefined }

  constructor(props: {}) {
    super(props)
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  componentDidCatch() {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      // You can render any custom fallback UI
      return <h1>{this.state.error}</h1>;
    }

    return this.props.children;
  }
}