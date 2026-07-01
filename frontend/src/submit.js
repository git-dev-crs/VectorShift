// submit.js — Styled "Run Pipeline" button with live result badge
// ─────────────────────────────────────────────────────────────────────────────
// States:
//   idle    — gradient purple "▶ Run Pipeline" button
//   loading — spinning glyph + "Running…", button disabled
//   success — inline green/red badge (DAG result) + node/edge counts
//   error   — red "Backend unreachable" badge

import { useState } from 'react';
import { useStore }  from './store';
import { shallow }   from 'zustand/shallow';

const selector = (s) => ({ nodes: s.nodes, edges: s.edges });

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    setStatus('loading');
    setResult(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/pipelines/parse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nodes, edges }),
      });
      const data = await res.json();
      setResult(data);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setResult({ error: err.message });
    }
  };

  // ── Result badge ────────────────────────────────────────────────────────────
  let badge = null;
  if (status === 'success' && result) {
    const isDAG = result.is_dag;
    badge = (
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:         6,
        padding:    '4px 10px',
        borderRadius: 6,
        background: isDAG ? '#052e16' : '#2d1212',
        border:     `1px solid ${isDAG ? '#166534' : '#7f1d1d'}`,
        fontSize:   11,
        fontWeight: 600,
        color:      isDAG ? '#4ade80' : '#f87171',
      }}>
        <span>{isDAG ? '✓' : '✗'}</span>
        <span>{isDAG ? 'Valid DAG' : 'Not a DAG'}</span>
        <span style={{ color: '#475569', fontWeight: 400 }}>
          · {result.num_nodes ?? 0} nodes · {result.num_edges ?? 0} edges
        </span>
      </div>
    );
  }
  if (status === 'error') {
    badge = (
      <div style={{
        padding:      '4px 10px',
        borderRadius:  6,
        background:   '#2d1212',
        border:       '1px solid #7f1d1d',
        fontSize:      11,
        color:        '#f87171',
      }}>
        Backend unreachable
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {badge}
      <button
        onClick={handleRun}
        disabled={status === 'loading'}
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:             6,
          padding:        '7px 16px',
          borderRadius:    7,
          border:         'none',
          cursor:          status === 'loading' ? 'not-allowed' : 'pointer',
          background:      status === 'loading'
            ? '#312e81'
            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color:          '#fff',
          fontSize:        12,
          fontWeight:      600,
          opacity:         status === 'loading' ? 0.7 : 1,
          transition:     'opacity 0.15s',
          boxShadow:      '0 1px 3px rgba(99,102,241,0.4)',
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
