import { Component, type ReactNode } from 'react';
import { buildPayload, submitFeedback } from '../services/feedback';

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; reported: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '', reported: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: { componentStack: string }): void {
    // Envoi automatique silencieux du rapport de crash React.
    buildPayload({
      kind: 'bug',
      message: `[AUTO] Crash React : ${error.message}\n${info.componentStack.slice(0, 600)}`,
      contact: null,
      includeDiagnostics: true,
    }).then((payload) => submitFeedback(payload)).catch(() => {});
    this.setState({ reported: true });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#120d07',
        color: '#f5e6c8',
        fontFamily: 'Inter, sans-serif',
        gap: 16,
        padding: 24,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 32 }}>⚔</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Une erreur est survenue</div>
        <div style={{ fontSize: 13, color: '#c9a97e', maxWidth: 320 }}>
          {this.state.message || 'Erreur inattendue dans le moteur du jeu.'}
        </div>
        {this.state.reported && (
          <div style={{ fontSize: 11, color: '#6b7280', maxWidth: 280 }}>
            Un rapport a été envoyé automatiquement. Merci !
          </div>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 8,
            padding: '10px 24px',
            background: '#f59e0b',
            color: '#120d07',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            letterSpacing: 1,
          }}
        >
          Recharger la page
        </button>
      </div>
    );
  }
}
