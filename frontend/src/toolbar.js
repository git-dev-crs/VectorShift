// toolbar.js
// Updated to include all 9 node types (4 original + 5 new)

import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => {
  return (
    <div style={{ padding: '10px' }}>
      <span>Drag-and-drop nodes</span>
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {/* Original 4 nodes */}
        <DraggableNode type='customInput'  label='Input'  />
        <DraggableNode type='customOutput' label='Output' />
        <DraggableNode type='llm'          label='LLM'    />
        <DraggableNode type='text'         label='Text'   />
        {/* 5 new nodes demonstrating the abstraction */}
        <DraggableNode type='math'           label='Math'            />
        <DraggableNode type='filter'         label='Filter'          />
        <DraggableNode type='apiRequest'     label='API Request'     />
        <DraggableNode type='promptTemplate' label='Prompt Template' />
        <DraggableNode type='note'           label='Note'            />
      </div>
    </div>
  );
};
