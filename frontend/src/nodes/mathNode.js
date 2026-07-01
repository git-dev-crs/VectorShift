// mathNode.js — New node demonstrating abstraction (arithmetic operations)

import { BaseNode, ACCENTS } from './BaseNode';

export const MathNode = ({ id, data }) => (
  <BaseNode id={id} data={data} config={{
    title:  'Math',
    accent: ACCENTS.transform,
    icon:   '±',
    fields: [
      {
        name:    'operation',
        label:   'Operation',
        type:    'select',
        options: ['Add', 'Subtract', 'Multiply', 'Divide', 'Modulo'],
      },
    ],
    handles: [
      { type: 'target', position: 'left', idSuffix: 'a', style: { top: '35%' } },
      { type: 'target', position: 'left', idSuffix: 'b', style: { top: '65%' } },
      { type: 'source', position: 'right', idSuffix: 'result' },
    ],
  }} />
);
