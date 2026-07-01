// draggableNode.js — Styled draggable chip for the sidebar
// Accent color mirrors the node it will create (uses same hex as ACCENTS in BaseNode.js)

import { useState } from 'react';

const TYPE_COLORS = {
  customInput:    '#6366f1',
  customOutput:   '#10b981',
  llm:            '#ec4899',
  promptTemplate: '#ec4899',
  text:           '#f59e0b',
  math:           '#f59e0b',
  filter:         '#f59e0b',
  apiRequest:     '#0ea5e9',
  note:           '#8b5cf6',
};

const TYPE_ICONS = {
  customInput:    '→',
  customOutput:   '←',
  llm:            '✦',
  promptTemplate: '✎',
  text:           'T',
  math:           '±',
  filter:         '⊘',
  apiRequest:     '⇄',
  note:           '✏',
};

export const DraggableNode = ({ type, label }) => {
  const [hovered, setHovered] = useState(false);
  const accent = TYPE_COLORS[type] || '#6366f1';
  const icon   = TYPE_ICONS[type]  || '⬡';

  const onDragStart = (event) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ nodeType: type })
    );
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:         8,
        padding:    '7px 10px',
        borderRadius: 7,
        cursor:     'grab',
        background: hovered ? '#1e293b' : 'transparent',
        border:     `1px solid ${hovered ? '#334155' : 'transparent'}`,
        transition: 'background 0.12s, border-color 0.12s',
        userSelect: 'none',
      }}
    >
      {/* Accent icon box */}
      <div style={{
        width:          26,
        height:         26,
        borderRadius:   6,
        background:     `${accent}22`,
        border:         `1px solid ${accent}44`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       11,
        color:          accent,
        flexShrink:     0,
      }}>
        {icon}
      </div>

      {/* Label */}
      <span style={{
        fontSize:   12,
        fontWeight: 500,
        color:      hovered ? '#e2e8f0' : '#94a3b8',
        transition: 'color 0.12s',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </div>
  );
};