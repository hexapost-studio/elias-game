/**
 * Panneau développeur caché — accessible via ?dev dans l'URL.
 * Permet d'activer/désactiver l'IA OpenRouter à la volée (clé en localStorage).
 * Invisible pour les joueurs normaux.
 */
import { useState, useEffect } from 'react';
import {
  getAiRuntimeStatus,
  activateAiRuntime,
  deactivateAiRuntime,
} from '../services/aiNarrator';

const FREE_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'deepseek/deepseek-r1-distill-qwen-32b:free',
];

function isDevMode(): boolean {
  try {
    return (
      new URLSearchParams(window.location.search).has('dev') ||
      localStorage.getItem('elias-dev-mode') === '1'
    );
  } catch {
    return false;
  }
}

export default function DevPanel() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState(getAiRuntimeStatus());
  const [inputKey, setInputKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(FREE_MODELS[0]);
  const [tapCount, setTapCount] = useState(0);

  // Réactivation via ?dev ou tapotement x7 sur le titre caché
  useEffect(() => {
    setVisible(isDevMode());
  }, []);

  useEffect(() => {
    if (tapCount >= 7) {
      localStorage.setItem('elias-dev-mode', '1');
      setVisible(true);
      setTapCount(0);
    }
    const t = setTimeout(() => setTapCount(0), 2000);
    return () => clearTimeout(t);
  }, [tapCount]);

  const refresh = () => setStatus(getAiRuntimeStatus());

  const handleActivate = () => {
    const key = inputKey.trim() || localStorage.getItem('elias-or-key') || '';
    if (!key) return;
    activateAiRuntime(key, selectedModel);
    setInputKey('');
    refresh();
  };

  const handleDeactivate = () => {
    deactivateAiRuntime();
    refresh();
  };

  const handleClose = () => {
    setVisible(false);
    localStorage.removeItem('elias-dev-mode');
  };

  if (!visible) {
    // Zone de tap invisible pour activer le dev mode (7 taps rapides)
    return (
      <div
        style={{ position: 'fixed', bottom: 0, right: 0, width: 40, height: 40, zIndex: 9999 }}
        onClick={() => setTapCount(c => c + 1)}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 12, right: 12, zIndex: 9999,
      background: '#0f172a', border: '1px solid #334155', borderRadius: 8,
      padding: '12px 16px', minWidth: 280, fontSize: 12,
      color: '#94a3b8', fontFamily: 'monospace', boxShadow: '0 4px 24px #0008',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ color: '#f1f5f9', fontWeight: 700 }}>⚙ Dev — IA Narrateur</span>
        <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ marginBottom: 10 }}>
        Statut :{' '}
        <span style={{ color: status.active ? '#4ade80' : '#f87171', fontWeight: 700 }}>
          {status.active ? '● ACTIF' : '○ INACTIF'}
        </span>
        {status.active && (
          <div style={{ marginTop: 4, color: '#64748b' }}>
            {status.model}<br />
            source : {status.source}
          </div>
        )}
      </div>

      {status.active ? (
        <button onClick={handleDeactivate} style={{
          width: '100%', padding: '6px 0', background: '#7f1d1d',
          border: '1px solid #991b1b', borderRadius: 4, color: '#fca5a5', cursor: 'pointer',
        }}>
          Désactiver l'IA
        </button>
      ) : (
        <>
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            style={{ width: '100%', marginBottom: 6, padding: '4px 6px', background: '#1e293b', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', fontSize: 11 }}
          >
            {FREE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <input
            placeholder="sk-or-v1-… (laisser vide si déjà sauvegardée)"
            value={inputKey}
            onChange={e => setInputKey(e.target.value)}
            style={{ width: '100%', marginBottom: 6, padding: '4px 6px', background: '#1e293b', border: '1px solid #334155', borderRadius: 4, color: '#e2e8f0', fontSize: 11, boxSizing: 'border-box' }}
          />
          <button onClick={handleActivate} style={{
            width: '100%', padding: '6px 0', background: '#14532d',
            border: '1px solid #166534', borderRadius: 4, color: '#86efac', cursor: 'pointer',
          }}>
            Activer OpenRouter
          </button>
        </>
      )}

      <div style={{ marginTop: 8, color: '#475569', fontSize: 10 }}>
        La clé est stockée localement (localStorage).<br />
        Pour supprimer l'accès : "Désactiver" ci-dessus.
      </div>
    </div>
  );
}
