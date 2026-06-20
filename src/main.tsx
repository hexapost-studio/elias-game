import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { buildPayload, submitFeedback } from './services/feedback'

// ── Capture globale d'erreurs JS non-React ──────────────────────────────────
// Envoie un rapport silencieux en file locale (puis Supabase/Discord au prochain
// flush) sans jamais bloquer le rendu ni afficher une UI d'erreur ici.
function autoReport(message: string): void {
  buildPayload({ kind: 'bug', message: `[AUTO] ${message}`, contact: null, includeDiagnostics: true })
    .then((p) => submitFeedback(p))
    .catch(() => {});
}

window.onerror = (_event, _source, _line, _col, error) => {
  autoReport(`window.onerror : ${error?.message ?? String(error)}`);
};

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  const msg = event.reason instanceof Error ? event.reason.message : String(event.reason);
  autoReport(`Promise non gérée : ${msg}`);
};
// ────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
