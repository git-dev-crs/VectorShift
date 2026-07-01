// inputNode.js — Refactored using BaseNode abstraction
// Was: ~48 lines with local useState, manual Handle, raw div styling
// Now: 20 lines of pure config — zero duplicated markup

import { BaseNode, ACCENTS } from './BaseNode';

export const InputNode = ({ id, data }) => (
  <BaseNode id={id} data={data} config={{
    title:  'Input',
    accent: ACCENTS.input,
    icon:   '→',
    fields: [
      {
        name:         'inputName',
        label:        'Name',
        type:         'text',
        defaultValue: id.replace('customInput-', 'input_'),
      },
      {
        name:    'inputType',
        label:   'Type',
        type:    'select',
        options: ['Text', 'File'],
      },
    ],
    handles: [
      { type: 'source', position: 'right', idSuffix: 'value' },
    ],
  }} />
);
