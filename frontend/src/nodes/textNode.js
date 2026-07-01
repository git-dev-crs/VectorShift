// textNode.js — Refactored using BaseNode abstraction

import { BaseNode, ACCENTS } from './BaseNode';

export const TextNode = ({ id, data }) => (
  <BaseNode id={id} data={data} config={{
    title:  'Text',
    accent: ACCENTS.transform,
    icon:   'T',
    fields: [
      {
        name:        'text',
        label:       'Content',
        type:        'textarea',
        placeholder: 'Enter text or use {{variable}} syntax…',
      },
    ],
    handles: [
      { type: 'source', position: 'right', idSuffix: 'output' },
    ],
  }} />
);
