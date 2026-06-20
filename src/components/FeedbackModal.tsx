/**
 * @file FeedbackModal.tsx
 * @description Modal de feedback / bug-report joueur (ajoutée suite au playtest).
 *
 * Type (bug / idée / avis) + message + contact optionnel + diagnostic technique
 * joint par défaut. Envoi via services/feedback.ts (Supabase → fallback local).
 * En cas de fallback local ou d'échec, propose copier / envoyer par mail.
 */

import type { FC } from 'react';
import { useState } from 'react';
import { Bug, Lightbulb, MessageSquare, Send, Copy, Mail, ChevronDown, XIcon, Check, AlertTriangle } from './IconSystem';
import { playClick } from '../engine/juice';
import {
  buildPayload,
  submitFeedback,
  collectDiagnostics,
  getMailtoFallback,
  getPlainText,
  type FeedbackKind,
  type FeedbackPayload,
} from '../services/feedback';

interface FeedbackModalProps {
  onClose: () => void;
}

const KINDS: { value: FeedbackKind; label: string; icon: typeof Bug; color: string }[] = [
  { value: 'bug', label: 'Bug', icon: Bug, color: '#fb7185' },
  { value: 'idea', label: 'Idée', icon: Lightbulb, color: '#fbbf24' },
  { value: 'praise', label: 'Avis', icon: MessageSquare, color: '#86efac' },
];

const MAX_LEN = 1000;

export const FeedbackModal: FC<FeedbackModalProps> = ({ onClose }) => {
  const [kind, setKind] = useState<FeedbackKind>('bug');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [includeDiag, setIncludeDiag] = useState(true);
  const [showDiag, setShowDiag] = useState(false);
  const [diagPreview, setDiagPreview] = useState<string | null>(null);

  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [via, setVia] = useState<'supabase' | 'local' | null>(null);
  const [sentPayload, setSentPayload] = useState<FeedbackPayload | null>(null);
  const [copied, setCopied] = useState(false);

  const canSubmit = message.trim().length > 0 && status === 'idle';

  const toggleDiagPreview = async () => {
    playClick();
    const next = !showDiag;
    setShowDiag(next);
    if (next && diagPreview === null) {
      try {
        const d = await collectDiagnostics();
        setDiagPreview(JSON.stringify(d, null, 2));
      } catch {
        setDiagPreview('(diagnostic indisponible)');
      }
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    playClick();
    setStatus('sending');
    const payload = await buildPayload(kind, message, contact, includeDiag);
    setSentPayload(payload);
    const res = await submitFeedback(payload);
    setVia(res.via);
    setStatus('done');
  };

  const handleCopy = async () => {
    if (!sentPayload) return;
    const text = getPlainText(sentPayload);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ── Écran de confirmation ──────────────────────────────────────────────────
  if (status === 'done') {
    const sentRemote = via === 'supabase';
    return (
      <div className="confirm-dialog" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="confirm-dialog-content" style={{ maxWidth: 320 }}>
          <Check size={32} strokeWidth={1.5} style={{ color: 'var(--success)', opacity: 0.9 }} />
          <div className="confirm-dialog-title" style={{ color: 'var(--success)' }}>
            MERCI POUR TON RETOUR
          </div>
          <div className="confirm-dialog-text" style={{ marginBottom: 16 }}>
            {sentRemote
              ? 'Ton message a bien été envoyé à l\'équipe.'
              : 'Ton message est enregistré sur ton appareil et sera envoyé automatiquement à la prochaine connexion. Tu peux aussi nous l\'envoyer tout de suite :'}
          </div>

          {!sentRemote && sentPayload && (
            <div className="btn-row" style={{ marginBottom: 12 }}>
              <button className="btn-secondary" onClick={handleCopy}>
                <Copy size={13} strokeWidth={1.8} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {copied ? 'COPIÉ' : 'COPIER'}
              </button>
              <a className="btn-secondary" href={getMailtoFallback(sentPayload)} style={{ textDecoration: 'none', textAlign: 'center' }}>
                <Mail size={13} strokeWidth={1.8} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                MAIL
              </a>
            </div>
          )}

          <button className="btn-primary" onClick={() => { playClick(); onClose(); }}>
            FERMER
          </button>
        </div>
      </div>
    );
  }

  // ── Formulaire ─────────────────────────────────────────────────────────────
  return (
    <div className="confirm-dialog" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="confirm-dialog-content"
        style={{ maxWidth: 360, textAlign: 'left', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="confirm-dialog-title" style={{ margin: 0, color: 'var(--accent-gold-light)' }}>
            TON RETOUR
          </div>
          <button onClick={onClose} className="menu-close-btn" aria-label="Fermer">
            <XIcon size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Type segmenté */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {KINDS.map(({ value, label, icon: Icon, color }) => {
            const active = kind === value;
            return (
              <button
                key={value}
                onClick={() => { playClick(); setKind(value); }}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '10px 4px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: active ? `${color}1f` : 'transparent',
                  border: `1px solid ${active ? `${color}80` : 'var(--border-subtle)'}`,
                  color: active ? color : 'var(--text-muted)',
                  fontSize: 11,
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} strokeWidth={1.8} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Message */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_LEN))}
          placeholder={
            kind === 'bug'
              ? 'Décris le bug : qu\'as-tu fait, qu\'est-il arrivé ?'
              : kind === 'idea'
                ? 'Quelle idée veux-tu proposer ?'
                : 'Dis-nous ce que tu penses du jeu...'
          }
          rows={4}
          autoFocus
          style={{
            width: '100%',
            resize: 'vertical',
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '10px 12px',
            color: 'var(--text-primary)',
            fontSize: 13,
            fontFamily: 'var(--font-body)',
            lineHeight: 1.5,
            boxSizing: 'border-box',
          }}
        />
        <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
          {message.length}/{MAX_LEN}
        </div>

        {/* Contact optionnel */}
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Email ou Discord (optionnel, pour te répondre)"
          style={{
            width: '100%',
            background: 'rgba(0,0,0,0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '9px 12px',
            color: 'var(--text-primary)',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            marginTop: 8,
            boxSizing: 'border-box',
          }}
        />

        {/* Diagnostic */}
        <div style={{ marginTop: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)' }}>
            <input
              type="checkbox"
              checked={includeDiag}
              onChange={(e) => setIncludeDiag(e.target.checked)}
              style={{ accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
            />
            Joindre les infos techniques (aide à corriger les bugs)
          </label>
          {includeDiag && (
            <button
              onClick={toggleDiagPreview}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, marginTop: 6,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 11, padding: 0,
                fontFamily: 'var(--font-body)',
              }}
            >
              <ChevronDown
                size={13}
                strokeWidth={2}
                style={{ transform: showDiag ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
              />
              {showDiag ? 'Masquer' : 'Voir'} les infos techniques
            </button>
          )}
          {includeDiag && showDiag && (
            <pre
              style={{
                marginTop: 8,
                maxHeight: 160,
                overflow: 'auto',
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: 10,
                fontSize: 10,
                lineHeight: 1.4,
                color: 'var(--text-muted)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {diagPreview ?? 'Chargement...'}
            </pre>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 10, color: 'var(--text-muted)' }}>
          <AlertTriangle size={11} strokeWidth={1.8} />
          Aucune donnée personnelle n'est collectée.
        </div>

        {/* Actions */}
        <div className="btn-row" style={{ marginTop: 16 }}>
          <button className="btn-cancel" onClick={() => { playClick(); onClose(); }}>
            ANNULER
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
          >
            {status === 'sending' ? (
              'ENVOI…'
            ) : (
              <>
                ENVOYER
                <Send size={13} strokeWidth={1.8} style={{ marginLeft: 6, verticalAlign: 'middle' }} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
