import { Component, ErrorInfo } from 'react'

interface State {
  error: Error | null;
  componentStack: string;
}

const defaultState: State = { error: null, componentStack: '' }

export class ErrorBoundary extends Component {
  state = defaultState;

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ componentStack: errorInfo.componentStack })
  }

  render() {
    const { error, componentStack } = this.state;
    if (error && componentStack) {
      return (
        <div
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 16,
            boxSizing: 'border-box',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            textTransform: 'uppercase',
            fontSize: '0.5em',
            alignItems: 'start'
          }}
        >
          <div style={{ fontSize: '3rem' }}>ERROR</div>
          <div style={{ fontSize: '1rem', marginBottom: 32, }}>Reload required</div>
          <div>{`${error}`}</div>
          <div style={{ marginTop: 8 }}>ERROR STACK &gt;&gt;&gt;</div>
          <div>{error.stack}</div>
          <div style={{ marginTop: 8 }}>COMPONENT STACK &gt;&gt;&gt;</div>
          <div>{componentStack.split('\n').slice(1).join('\n')}</div>
          <button
            style={{
              color: '#FF6060',
              marginTop: 32,
              fontSize: '1rem',
              padding: '8px 16px',
              flexShrink: 0,
            }}
            onClick={() => { this.setState(defaultState) }}
          >
            RELOAD
          </button>
        </div>
      )
    }

    return this.props.children;
  }
}