// promptTemplateNode.js — New node: structured prompt with variable slots

import { BaseNode, ACCENTS } from './BaseNode';

export const PromptTemplateNode = ({ id, data }) => (
  <BaseNode id={id} data={data} config={{
    title:  'Prompt Template',
    accent: ACCENTS.ai,
    icon:   '✎',
    fields: [
      {
        name:        'template',
        label:       'Template',
        type:        'textarea',
        placeholder: 'You are a {{role}}. Answer the following: {{question}}',
      },
      {
        name:    'format',
        label:   'Output Format',
        type:    'select',
        options: ['Plain Text', 'Markdown', 'JSON', 'HTML'],
      },
    ],
    handles: [
      { type: 'target', position: 'left',  idSuffix: 'vars' },
      { type: 'source', position: 'right', idSuffix: 'prompt' },
    ],
  }} />
);
