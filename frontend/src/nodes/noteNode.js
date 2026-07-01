// noteNode.js — New node: annotation/comment (zero handles — shows abstraction edge case)

import { BaseNode, ACCENTS } from './BaseNode';

export const NoteNode = ({ id, data }) => (
  <BaseNode id={id} data={data} config={{
    title:  'Note',
    accent: ACCENTS.utility,
    icon:   '✏',
    fields: [
      {
        name:        'content',
        label:       'Note',
        type:        'textarea',
        placeholder: 'Add a comment or annotation for this pipeline…',
      },
    ],
    handles: [], // No handles — pure annotation node
  }} />
);
