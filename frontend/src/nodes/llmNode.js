// llmNode.js — Refactored using BaseNode abstraction

import { BaseNode, ACCENTS } from './BaseNode';

export const LLMNode = ({ id, data }) => (
  <BaseNode id={id} data={data} config={{
    title:  'LLM',
    accent: ACCENTS.ai,
    icon:   '✦',
    fields: [
      {
        type: 'static',
        text: 'Connects a system prompt and user prompt to a language model.',
      },
    ],
    handles: [
      { type: 'target', position: 'left', idSuffix: 'system',  style: { top: '33%' } },
      { type: 'target', position: 'left', idSuffix: 'prompt',  style: { top: '67%' } },
      { type: 'source', position: 'right', idSuffix: 'response' },
    ],
  }} />
);
