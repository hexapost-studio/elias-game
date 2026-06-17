// @vitest-environment jsdom
/**
 * @file devPanel.test.tsx
 * @description DevPanel (outil dev caché). On verrouille le comportement après le refactor
 *   itér. 25 (suppression des 2 set-state-in-effect) : visibilité dérivée à l'init via
 *   ?dev / flag localStorage, et activation par 7 taps rapides — sans navigateur, en
 *   mockant le service IA pour rester hermétique.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

vi.mock('../src/services/aiNarrator', () => ({
  getAiRuntimeStatus: () => ({ active: false, model: '', source: '' }),
  activateAiRuntime: vi.fn(),
  deactivateAiRuntime: vi.fn(),
}));

import DevPanel from '../src/components/DevPanel';

// localStorage en mémoire (l'impl jsdom de ce harnais est partielle) — déterministe.
function installMemoryStorage() {
  const mem = new Map<string, string>();
  const store: Storage = {
    getItem: (k) => (mem.has(k) ? mem.get(k)! : null),
    setItem: (k, v) => void mem.set(k, String(v)),
    removeItem: (k) => void mem.delete(k),
    clear: () => mem.clear(),
    key: (i) => Array.from(mem.keys())[i] ?? null,
    get length() {
      return mem.size;
    },
  };
  Object.defineProperty(window, 'localStorage', { value: store, configurable: true });
}

beforeEach(() => {
  installMemoryStorage();
  // URL propre (pas de ?dev) par défaut.
  window.history.replaceState({}, '', '/');
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('DevPanel — visibilité initiale dérivée', () => {
  it('cachée par défaut (ni ?dev ni flag)', () => {
    render(<DevPanel />);
    expect(screen.queryByText(/Dev — IA Narrateur/)).toBeNull();
  });

  it('visible si flag localStorage présent dès le 1er rendu', () => {
    localStorage.setItem('elias-dev-mode', '1');
    render(<DevPanel />);
    expect(screen.getByText(/Dev — IA Narrateur/)).toBeTruthy();
  });
});

describe('DevPanel — activation par 7 taps', () => {
  it('7 taps sur la zone cachée révèlent le panneau et posent le flag', () => {
    const { container } = render(<DevPanel />);
    // La zone de tap est l'unique div cliquable rendu quand invisible.
    const tapZone = container.querySelector('div');
    expect(tapZone).toBeTruthy();
    for (let i = 0; i < 7; i++) fireEvent.click(tapZone!);
    expect(screen.getByText(/Dev — IA Narrateur/)).toBeTruthy();
    expect(localStorage.getItem('elias-dev-mode')).toBe('1');
  });

  it('6 taps ne suffisent pas', () => {
    const { container } = render(<DevPanel />);
    const tapZone = container.querySelector('div');
    for (let i = 0; i < 6; i++) fireEvent.click(tapZone!);
    expect(screen.queryByText(/Dev — IA Narrateur/)).toBeNull();
  });
});
