// apiRequestNode.js — New node: HTTP API call

import { BaseNode, ACCENTS } from './BaseNode';

export const ApiRequestNode = ({ id, data }) => (
  <BaseNode id={id} data={data} config={{
    title:  'API Request',
    accent: ACCENTS.io,
    icon:   '⇄',
    fields: [
      {
        name:    'method',
        label:   'Method',
        type:    'select',
        options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      },
      {
        name:        'url',
        label:       'Endpoint URL',
        type:        'text',
        placeholder: 'https://api.example.com/endpoint',
      },
      {
        name:        'headers',
        label:       'Headers (JSON)',
        type:        'textarea',
        placeholder: '{"Authorization": "Bearer {{token}}"}',
      },
    ],
    handles: [
      { type: 'target', position: 'left',  idSuffix: 'body' },
      { type: 'source', position: 'right', idSuffix: 'response', style: { top: '35%' } },
      { type: 'source', position: 'right', idSuffix: 'error',    style: { top: '65%' } },
    ],
  }} />
);
