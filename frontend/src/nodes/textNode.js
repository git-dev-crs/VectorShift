// textNode.js
//
// This node is intentionally NOT built on BaseNode because it has two
// behaviours that require direct DOM and state access:
//
//   FEATURE 1 — Auto-resize
//     The textarea grows in both width and height as the user types.
//     Technique: a hidden "mirror" <div> with identical font/padding lives
//     off-screen (position:fixed, left:-9999px). On every text change we
//     set its content and read back scrollWidth + scrollHeight to get the
//     natural size, then apply those pixel values to the real <textarea>.
//     We use position:fixed (not absolute) so the mirror is removed from
//     the node's layout flow and never affects the card's own dimensions
//     while it measures.
//
//   FEATURE 2 — Dynamic variable handles
//     The regex  /\{\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}\}/g  scans the live
//     text on every keystroke. Each unique match becomes a <Handle> on the
//     left side. Handles are keyed by variable name so React only mounts /
//     unmounts the ones that actually changed. Position is evenly spaced:
//     handle i of N sits at  ((i+1)/(N+1))*100%  from the top.
//     A small label tag beside each handle shows the variable name.

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import { shallow } from 'zustand/shallow';
import { ACCENTS } from './BaseNode';

// ─── Design constants (mirror TOKENS in BaseNode for visual consistency) ──────

const ACCENT    = ACCENTS.transform;   // amber — same category as before
const FONT      = '400 11px/1.4 "Inter","Segoe UI",system-ui,sans-serif';
const PADDING_X = 7;    // textarea horizontal padding (each side, px)
const PADDING_Y = 4;    // textarea vertical padding (each side, px)
const MIN_W     = 196;  // minimum textarea width  (node body = 220 - 24px side padding)
const MAX_W     = 456;  // maximum textarea width  (node max = 480 - 24px side padding)
const MIN_H     = 52;   // minimum textarea height (px)

// ─── Regex: valid JS identifiers inside {{ }} ─────────────────────────────────

const VAR_RE = /\{\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}\}/g;

function extractVariables(text) {
  const seen = new Set();
  // Re-create regex each call — RegExp with /g flag is stateful
  const re = new RegExp(VAR_RE.source, 'g');
  let m;
  while ((m = re.exec(text)) !== null) seen.add(m[1]);
  // Sort alphabetically so handle order is stable as text changes
  return Array.from(seen).sort();
}

// ─── Component ───────────────────────────────────────────────────────────────

export const TextNode = ({ id, data: dataProp }) => {
  // Bug 2 fix: useMemo stabilises the selector reference so shallow equality
  // works correctly. Calling makeSelector(id) inline creates a new function on
  // every render, defeating shallow and causing unnecessary store re-runs.
  const selector = useMemo(
    () => (state) => ({
      updateNodeField: state.updateNodeField,
      data: state.nodes.find((n) => n.id === id)?.data,
    }),
    [id]
  );
  const { updateNodeField, data: storeData } = useStore(selector, shallow);
  const data = storeData ?? dataProp ?? {};
  const text = data.text ?? '{{input}}';

  // Refs for the real textarea and the off-screen mirror div
  const textareaRef = useRef(null);
  const mirrorRef   = useRef(null);

  const onChange = useCallback(
    (e) => updateNodeField(id, 'text', e.target.value),
    [id, updateNodeField]
  );

  // ── FEATURE 1: Auto-resize ─────────────────────────────────────────────────
  //
  // Every time `text` changes:
  //   1. Copy the new content into the hidden mirror div
  //   2. Read mirror.scrollWidth / scrollHeight  (natural unconstrained dims)
  //   3. Clamp width to [MIN_W, MAX_W], enforce MIN_H floor
  //   4. Write computed px values back onto the real textarea
  //
  // The mirror uses position:fixed + left:-9999px so it is completely outside
  // the node card's layout flow while we measure — no side effects on the DOM.

  useEffect(() => {
    const mirror   = mirrorRef.current;
    const textarea = textareaRef.current;
    if (!mirror || !textarea) return;

    // Zero-width space ensures an empty string still measures one line height
    mirror.textContent = text + '\u200b';

    const rawW = mirror.scrollWidth  + PADDING_X * 2;
    const rawH = mirror.scrollHeight + PADDING_Y * 2;

    textarea.style.width  = `${Math.min(MAX_W, Math.max(MIN_W, rawW))}px`;
    textarea.style.height = `${Math.max(MIN_H, rawH)}px`;
  }, [text]);

  // ── FEATURE 2: Dynamic variable handles ────────────────────────────────────
  //
  // extractVariables() returns a sorted, deduped list of {{varName}} tokens.
  // We render one <Handle> per variable, evenly distributed down the left edge.

  const variables = extractVariables(text);
  const handleTop = (i) => `${((i + 1) / (variables.length + 1)) * 100}%`;

  // ── Shared textarea / mirror style ─────────────────────────────────────────

  const sharedStyle = {
    font:         FONT,
    color:        '#1e293b',
    background:   '#f1f5f9',
    border:       '1px solid transparent',
    borderRadius: '5px',
    padding:      `${PADDING_Y}px ${PADDING_X}px`,
    whiteSpace:   'pre-wrap',
    wordBreak:    'break-word',
    boxSizing:    'border-box',
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    // overflow:visible is critical — lets handles render outside the card boundary
    <div style={{
      background:   '#ffffff',
      border:       '1px solid #e2e8f0',
      borderLeft:   `4px solid ${ACCENT}`,
      borderRadius: '10px',
      boxShadow:    '0 2px 8px rgba(0,0,0,0.08)',
      fontFamily:   '"Inter","Segoe UI",system-ui,sans-serif',
      overflow:     'visible',
      display:      'inline-block',  // shrink-wrap horizontally with the textarea
      minWidth:     MIN_W + 24,      // 24 = body padding (12px each side)
    }}>

      {/* ── Static output handle (right side, always present) ────────── */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        style={{
          width:     10,
          height:    10,
          background: ACCENT,
          border:    '2px solid #fff',
          boxShadow: `0 0 0 1px ${ACCENT}`,
        }}
      />

      {/* ── Dynamic variable handles (left side, one per {{var}}) ─────── */}
      {variables.map((varName, i) => (
        <Handle
          key={varName}
          type="target"
          position={Position.Left}
          id={`${id}-${varName}`}
          style={{
            width:     10,
            height:    10,
            top:       handleTop(i),
            background: ACCENT,
            border:    '2px solid #fff',
            boxShadow: `0 0 0 1px ${ACCENT}`,
          }}
        >
          {/* Variable label floats to the right of the handle dot */}
          <span style={{
            position:      'absolute',
            left:          14,
            top:           '50%',
            transform:     'translateY(-50%)',
            fontSize:      9,
            fontWeight:    600,
            color:         ACCENT,
            background:    `${ACCENT}15`,
            border:        `1px solid ${ACCENT}30`,
            borderRadius:  3,
            padding:       '1px 4px',
            whiteSpace:    'nowrap',
            pointerEvents: 'none',
            userSelect:    'none',
          }}>
            {varName}
          </span>
        </Handle>
      ))}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          6,
        padding:      '8px 12px 6px',
        background:   '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        borderRadius: '6px 6px 0 0',
      }}>
        <span style={{ fontSize: 14, color: ACCENT }}>T</span>
        <span style={{ font: '600 12px/1 "Inter","Segoe UI",system-ui,sans-serif', color: '#0f172a' }}>
          Text
        </span>
        {/* Badge: how many variables are currently detected */}
        {variables.length > 0 && (
          <span style={{
            marginLeft:   'auto',
            fontSize:     9,
            fontWeight:   600,
            color:        ACCENT,
            background:   `${ACCENT}15`,
            border:       `1px solid ${ACCENT}30`,
            borderRadius: 4,
            padding:      '1px 5px',
          }}>
            {variables.length} var{variables.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '8px 12px 10px' }}>

        <div style={{
          font:         '500 10px/1.2 "Inter","Segoe UI",system-ui,sans-serif',
          color:        '#64748b',
          marginBottom: 3,
        }}>
          Content
        </div>

        {/*
          MIRROR DIV — off-screen, position:fixed so it is completely removed
          from the node card's layout. We measure its scrollWidth/scrollHeight
          to compute the textarea's natural dimensions.
          Must NOT be display:none — display:none removes it from layout and
          scrollWidth/scrollHeight would return 0.
        */}
        <div
          ref={mirrorRef}
          aria-hidden="true"
          style={{
            ...sharedStyle,
            position:      'fixed',
            left:          '-9999px',
            top:           '-9999px',
            width:         `${MAX_W}px`,   // unconstrained — wrap at max width only
            height:        'auto',
            visibility:    'hidden',
            pointerEvents: 'none',
          }}
        />

        {/*
          REAL TEXTAREA — starts at MIN_W × MIN_H.
          useEffect writes computed px values into style.width + style.height
          after every text change, causing smooth animated resize.
        */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={onChange}
          placeholder="Use {{variable}} for dynamic values"
          style={{
            ...sharedStyle,
            display:    'block',
            outline:    'none',
            resize:     'none',       // prevent user drag-resize
            overflow:   'hidden',     // hide scrollbar during transition
            width:      `${MIN_W}px`,
            height:     `${MIN_H}px`,
            transition: 'width 0.08s ease, height 0.08s ease',
          }}
        />

        {/* Variable pill list under the textarea — visual confirmation */}
        {variables.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {variables.map((v) => (
              <span key={v} style={{
                fontSize:     9,
                fontWeight:   500,
                color:        '#475569',
                background:   '#f1f5f9',
                border:       '1px solid #e2e8f0',
                borderRadius: 3,
                padding:      '1px 5px',
              }}>
                {`{{${v}}}`}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
