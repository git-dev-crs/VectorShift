// BaseNode.js
//
// THE single place that owns every node's visual appearance and field rendering.
// All styling, layout, typography, and handle placement lives here.
//
// To restyle ALL nodes at once: edit TOKENS below.
// To add a brand new node: create a file that passes a config object to <BaseNode />.
// You never need to touch this file when adding new nodes.
//
// ─── Imports ─────────────────────────────────────────────────────────────────

import { useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';

// ─── Accent palette ───────────────────────────────────────────────────────────
// Import ACCENTS in each node file to pick a category color.
// Change a color here → every node using that accent updates instantly.

export const ACCENTS = {
  input:     '#6366f1',  // indigo  — receives external data
  output:    '#10b981',  // emerald — emits results
  transform: '#f59e0b',  // amber   — processes / transforms data
  utility:   '#8b5cf6',  // violet  — helpers and annotations
  ai:        '#ec4899',  // pink    — LLM / AI operations
  io:        '#0ea5e9',  // sky     — network / API calls
};

// ─── Design tokens ────────────────────────────────────────────────────────────
// Every spacing, color, radius, and font in every node derives from this one
// object. Restyle the whole app by editing values here.

const TOKENS = {
  // Card shell
  cardBg:         '#ffffff',
  cardBorder:     '1px solid #e2e8f0',
  cardRadius:     '10px',
  cardShadow:     '0 2px 8px rgba(0,0,0,0.08)',
  cardWidth:      220,
  accentBarWidth: 4,

  // Header
  headerPadding:  '8px 12px 6px 12px',
  headerBg:       '#f8fafc',
  headerBorderB:  '1px solid #e2e8f0',
  titleFont:      '600 12px/1 "Inter","Segoe UI",system-ui,sans-serif',
  titleColor:     '#0f172a',
  iconSize:       '14px',

  // Body
  bodyPadding:    '8px 12px 10px',
  fieldGap:       6,

  // Field labels
  labelFont:      '500 10px/1.2 "Inter","Segoe UI",system-ui,sans-serif',
  labelColor:     '#64748b',
  labelMarginB:   3,

  // Field inputs (text / select / textarea)
  inputFont:      '400 11px/1.4 "Inter","Segoe UI",system-ui,sans-serif',
  inputColor:     '#1e293b',
  inputBg:        '#f1f5f9',
  inputBorder:    '1px solid transparent',
  inputRadius:    '5px',
  inputPadding:   '4px 7px',

  // Static text fields
  staticFont:     '400 10px/1.5 "Inter","Segoe UI",system-ui,sans-serif',
  staticColor:    '#94a3b8',

  // Handles
  handleSize:     10,
  handleBorder:   '2px solid #ffffff',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const positionMap = {
  left:   Position.Left,
  right:  Position.Right,
  top:    Position.Top,
  bottom: Position.Bottom,
};

// ─── BaseNode component ───────────────────────────────────────────────────────

export const BaseNode = ({ id, data: dataProp, config }) => {
  // Bug 2 fix: useMemo stabilises the selector reference across renders.
  // Calling makeSelector(id) inline during render creates a new function object
  // every time, which defeats shallow equality and causes unnecessary re-renders
  // for every node whenever any part of the store changes.
  // With useMemo the same function reference is reused on every render (unless
  // `id` changes, which effectively never happens for a mounted node).
  const selector = useMemo(
    () => (state) => ({
      updateNodeField: state.updateNodeField,
      data: state.nodes.find((n) => n.id === id)?.data,
    }),
    [id]
  );
  const { updateNodeField, data: storeData } = useStore(selector, shallow);
  // Prefer live Zustand data; fall back to the RF-injected prop on first render.
  const data = storeData ?? dataProp ?? {};

  const onChange = useCallback(
    (fieldName, value) => updateNodeField(id, fieldName, value),
    [id, updateNodeField]
  );

  const { title, accent = ACCENTS.transform, icon = '⬡', fields = [], handles = [] } = config;

  // Shared input/select/textarea style — derived entirely from TOKENS
  const inputStyle = {
    display: 'block',
    width: '100%',
    boxSizing: 'border-box',
    font: TOKENS.inputFont,
    color: TOKENS.inputColor,
    background: TOKENS.inputBg,
    border: TOKENS.inputBorder,
    borderRadius: TOKENS.inputRadius,
    padding: TOKENS.inputPadding,
    outline: 'none',
    resize: 'vertical',
  };

  const renderField = (field) => {
    const value = data[field.name] ?? field.defaultValue ?? '';
    const label = field.label ?? field.name;

    const labelEl = field.type !== 'static' && (
      <div style={{ font: TOKENS.labelFont, color: TOKENS.labelColor, marginBottom: TOKENS.labelMarginB }}>
        {label}
      </div>
    );

    let control;
    switch (field.type) {
      case 'select':
        control = (
          <select
            value={value}
            onChange={(e) => onChange(field.name, e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
        break;
      case 'textarea':
        control = (
          <textarea
            value={value}
            placeholder={field.placeholder ?? ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            style={{ ...inputStyle, minHeight: 52 }}
          />
        );
        break;
      case 'static':
        control = (
          <div style={{ font: TOKENS.staticFont, color: TOKENS.staticColor }}>
            {field.text}
          </div>
        );
        break;
      default: // 'text'
        control = (
          <input
            type="text"
            value={value}
            placeholder={field.placeholder ?? ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            style={inputStyle}
          />
        );
    }

    return (
      <div key={field.name} style={{ marginBottom: TOKENS.fieldGap }}>
        {labelEl}
        {control}
      </div>
    );
  };

  const renderHandle = (handle) => (
    <Handle
      key={handle.idSuffix}
      type={handle.type}
      position={positionMap[handle.position] || Position.Left}
      id={`${id}-${handle.idSuffix}`}
      style={{
        width:     TOKENS.handleSize,
        height:    TOKENS.handleSize,
        background: accent,
        border:    TOKENS.handleBorder,
        boxShadow: `0 0 0 1px ${accent}`,
        ...handle.style,
      }}
    />
  );

  return (
    <div style={{
      width:       TOKENS.cardWidth,
      background:  TOKENS.cardBg,
      border:      TOKENS.cardBorder,
      borderRadius: TOKENS.cardRadius,
      boxShadow:   TOKENS.cardShadow,
      borderLeft:  `${TOKENS.accentBarWidth}px solid ${accent}`,
      overflow:    'hidden',
      fontFamily:  '"Inter","Segoe UI",system-ui,sans-serif',
    }}>
      {handles.map(renderHandle)}

      {/* Header */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          6,
        padding:      TOKENS.headerPadding,
        background:   TOKENS.headerBg,
        borderBottom: TOKENS.headerBorderB,
      }}>
        <span style={{ fontSize: TOKENS.iconSize, lineHeight: 1 }}>{icon}</span>
        <span style={{ font: TOKENS.titleFont, color: TOKENS.titleColor }}>{title}</span>
      </div>

      {/* Body */}
      <div style={{ padding: TOKENS.bodyPadding }}>
        {fields.map(renderField)}
      </div>
    </div>
  );
};
