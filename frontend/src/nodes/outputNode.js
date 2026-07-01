// outputNode.js — Refactored using BaseNode abstraction

import { BaseNode, ACCENTS } from './BaseNode';

export const OutputNode = ({ id, data }) => (
  <BaseNode id={id} data={data} config={{
    title:  'Output',
    accent: ACCENTS.output,
    icon:   '←',
    fields: [
      {
        name:         'outputName',
        label:        'Name',
        type:         'text',
        defaultValue: id.replace('customOutput-', 'output_'),
      },
      {
        name:    'outputType',
        label:   'Type',
        type:    'select',
        options: ['Text', 'File', 'Image'],
      },
    ],
    handles: [
      { type: 'target', position: 'left', idSuffix: 'value' },
    ],
  }} />
);
