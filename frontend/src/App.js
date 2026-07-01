// App.js — Root layout
// ─────────────────────────────────────────────────────────────────────────────
// Full-screen flex column:
//
//   ┌─────────────────────────────────────────────┐
//   │  <Header>   (top bar: logo + Run button)    │  48px
//   ├────────────┬────────────────────────────────┤
//   │            │                                │
//   │ <Toolbar>  │     <PipelineUI>               │  fills rest
//   │ (sidebar)  │     (ReactFlow canvas)         │
//   │            │                                │
//   └────────────┴────────────────────────────────┘

import { PipelineToolbar } from './toolbar';
import { PipelineUI }      from './ui';
import { SubmitButton }    from './submit';

function App() {
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      height:         '100vh',
      width:          '100vw',
      background:     '#0f1117',
      overflow:       'hidden',
    }}>
      {/* ── Top header bar ── */}
      <header style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        height:          48,
        minHeight:       48,
        padding:        '0 20px',
        background:     '#0d1117',
        borderBottom:   '1px solid #1e293b',
        zIndex:          10,
        flexShrink:      0,
      }}>
        {/* Logo + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width:           28,
            height:          28,
            background:      'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius:    7,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            fontSize:        14,
            fontWeight:      700,
            color:           '#fff',
          }}>V</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>
            VectorShift
          </span>
          <span style={{
            fontSize:    11,
            color:       '#475569',
            paddingLeft: 10,
            marginLeft:  2,
            borderLeft:  '1px solid #1e293b',
          }}>
            Pipeline Builder
          </span>
        </div>

        {/* Run button */}
        <SubmitButton />
      </header>

      {/* ── Main area: sidebar + canvas ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <PipelineToolbar />
        <PipelineUI />
      </div>
    </div>
  );
}

export default App;
