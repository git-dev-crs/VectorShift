// toolbar.js — Styled left sidebar with categorized node chips
// ─────────────────────────────────────────────────────────────────────────────
// Fixed-width dark aside. Nodes grouped by category with section labels.
// To add a node to the sidebar: add one entry to CATEGORIES below.

import { DraggableNode } from './draggableNode';

const CATEGORIES = [
  {
    label: 'Data I/O',
    nodes: [
      { type: 'customInput',  label: 'Input'  },
      { type: 'customOutput', label: 'Output' },
    ],
  },
  {
    label: 'AI',
    nodes: [
      { type: 'llm',            label: 'LLM'             },
      { type: 'promptTemplate', label: 'Prompt Template' },
    ],
  },
  {
    label: 'Transform',
    nodes: [
      { type: 'text',   label: 'Text'   },
      { type: 'math',   label: 'Math'   },
      { type: 'filter', label: 'Filter' },
    ],
  },
  {
    label: 'Network',
    nodes: [
      { type: 'apiRequest', label: 'API Request' },
    ],
  },
  {
    label: 'Utility',
    nodes: [
      { type: 'note', label: 'Note' },
    ],
  },
];

export const PipelineToolbar = () => (
  <aside style={{
    width:          200,
    minWidth:       200,
    height:         '100%',
    background:     '#0d1117',
    borderRight:    '1px solid #1e293b',
    overflowY:      'auto',
    padding:        '16px 0 24px',
    display:        'flex',
    flexDirection:  'column',
    gap:             4,
    flexShrink:      0,
  }}>
    {/* Sidebar heading */}
    <div style={{
      padding:       '0 16px 12px',
      borderBottom:  '1px solid #1e293b',
      marginBottom:   8,
    }}>
      <span style={{
        fontSize:      10,
        fontWeight:    600,
        letterSpacing: '0.08em',
        color:         '#475569',
        textTransform: 'uppercase',
      }}>Components</span>
    </div>

    {/* Categorized node chips */}
    {CATEGORIES.map((cat) => (
      <section key={cat.label} style={{ padding: '4px 0 8px' }}>
        <div style={{
          padding:       '0 16px 6px',
          fontSize:       10,
          fontWeight:     600,
          letterSpacing: '0.06em',
          color:         '#334155',
          textTransform: 'uppercase',
        }}>
          {cat.label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' }}>
          {cat.nodes.map((n) => (
            <DraggableNode key={n.type} type={n.type} label={n.label} />
          ))}
        </div>
      </section>
    ))}
  </aside>
);
