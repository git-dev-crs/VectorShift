// submit.js
// ─────────────────────────────────────────────────────────────────────────────
// "Run pipeline" button in the top header bar.
//
// Flow:
//   1. User clicks "Run pipeline"
//   2. Reads nodes + edges from the Zustand store
//   3. POSTs them to POST /pipelines/parse  (FastAPI backend at :8000)
//   4. Backend returns { num_nodes, num_edges, is_dag }
//   5. An alert dialog shows the result in plain language  ← task requirement
//   6. An inline status badge in the header also updates
//
// Button states:
//   idle     — gradient purple "▶ Run Pipeline" button
//   loading  — spinning glyph + "Running…", button disabled
//   success  — green or red badge shows DAG result + node/edge counts
//   error    — red badge "Backend unreachable"
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useStore }  from './store';
import { shallow }   from 'zustand/shallow';

const selector = (s) => ({ nodes: s.nodes, edges: s.edges });

// ── Alert helper ──────────────────────────────────────────────────────────────
// Builds a human-readable message from the backend response and shows it with
// window.alert(). The task explicitly asks for an "alert" — native browser
// alert is unambiguous and requires zero extra dependencies.

function showResultAlert({ num_nodes, num_edges, is_dag }) {
  const dagLine = is_dag
    ? '✅  Your pipeline is a valid DAG.\n    All nodes are reachable and there are no cycles.'
    : '❌  Your pipeline is NOT a valid DAG.\n    Check for cycles or disconnected loops.';

  const msg = [
    '── Pipeline Analysis ──────────────────',
    '',
    `  Nodes : ${num_nodes}`,
    `  Edges : ${num_edges}`,
    '',
    dagLine,
    '',
    '───────────────────────────────────────',
  ].join('\n');

  window.alert(msg);
}

// ─────────────────────────────────────────────────────────────────────────────

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [status, setStatus] = useState('idle');   // idle | loading | success | error
  const [result, setResult] = useState(null);

  // ── POST to backend ────────────────────────────────────────────────────────
  const handleRun = async () => {
    setStatus('loading');
    setResult(null);

    try {
      const res = await fetch('http://127.0.0.1:8000/pipelines/parse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the full ReactFlow node/edge objects.
        // The backend only reads node.id, edge.source, edge.target.
        body: JSON.stringify({ nodes, edges }),
      });

      // Throw on non-2xx so the catch block handles server errors cleanly
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setResult(data);
      setStatus('success');

      // ── Task requirement: show an alert with the result ──────────────────
      showResultAlert(data);

    } catch (err) {
      console.error('Pipeline parse error:', err);
      setStatus('error');
    }
  };

  // ── Inline status badge (shown in header next to button) ──────────────────
  let badge = null;

  if (status === 'success' && result) {
    const ok = result.is_dag;
    badge = (
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:           6,
        padding:      '4px 10px',
        borderRadius:  6,
        background:    ok ? '#052e16' : '#2d1212',
        border:        `1px solid ${ok ? '#166534' : '#7f1d1d'}`,
        fontSize:      11,
        fontWeight:    600,
        color:         ok ? '#4ade80' : '#f87171',
      }}>
        <span>{ok ? '✓' : '✗'}</span>
        <span>{ok ? 'Valid DAG' : 'Not a DAG'}</span>
        <span style={{ color: '#475569', fontWeight: 400 }}>
          &nbsp;·&nbsp;{result.num_nodes} nodes&nbsp;·&nbsp;{result.num_edges} edges
        </span>
      </div>
    );
  }

  if (status === 'error') {
    badge = (
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:           5,
        padding:      '4px 10px',
        borderRadius:  6,
        background:   '#2d1212',
        border:       '1px solid #7f1d1d',
        fontSize:      11,
        color:        '#f87171',
      }}>
        <span>✗</span>
        <span>Backend unreachable</span>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

      {/* Inline badge — appears to the left of the button after a run */}
      {badge}

      {/* The button itself */}
      <button
        onClick={handleRun}
        disabled={status === 'loading'}
        style={{
          display:     'flex',
          alignItems:  'center',
          gap:          6,
          padding:     '7px 16px',
          borderRadius: 7,
          border:      'none',
          cursor:       status === 'loading' ? 'not-allowed' : 'pointer',
          background:   status === 'loading'
            ? '#312e81'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color:       '#fff',
          fontSize:     12,
          fontWeight:   600,
          opacity:      status === 'loading' ? 0.7 : 1,
          transition:  'opacity 0.15s',
          boxShadow:   '0 1px 3px rgba(99,102,241,0.4)',
        }}
        onMouseEnter={(e) => { if (status !== 'loading') e.currentTarget.style.opacity = '0.85'; }}
        onMouseLeave={(e) => { if (status !== 'loading') e.currentTarget.style.opacity = '1'; }}
      >
        {status === 'loading' ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>⟳</span>
            Running…
          </>
        ) : '▶  Run Pipeline'}
      </button>

    </div>
  );
};
