// filterNode.js — New node: filter/conditional branching

import { BaseNode, ACCENTS } from './BaseNode';

export const FilterNode = ({ id, data }) => (
  <BaseNode id={id} data={data} config={{
    title:  'Filter',
    accent: ACCENTS.transform,
    icon:   '⊘',
    fields: [
      {
        name:        'condition',
        label:       'Condition',
        type:        'text',
        placeholder: 'e.g. value > 10',
      },
      {
        name:    'mode',
        label:   'Match Mode',
        type:    'select',
        options: ['Pass Through', 'Block', 'Transform'],
      },
    ],
    handles: [
      { type: 'target', position: 'left',  idSuffix: 'input' },
      { type: 'source', position: 'right', idSuffix: 'pass',  style: { top: '35%' } },
      { type: 'source', position: 'right', idSuffix: 'fail',  style: { top: '65%' } },
    ],
  }} />
);
