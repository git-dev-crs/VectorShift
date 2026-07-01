// ui.js — Styled ReactFlow canvas
// ─────────────────────────────────────────────────────────────────────────────
// Dark dot-grid canvas with styled Controls, MiniMap, and colored edges.
// All node type registration stays here — styles are in BaseNode.js.

import { useState, useRef, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
} from 'reactflow';
import { useStore } from './store';
import { shallow }  from 'zustand/shallow';

import { InputNode }          from './nodes/inputNode';
import { LLMNode }            from './nodes/llmNode';
import { OutputNode }         from './nodes/outputNode';
import { TextNode }           from './nodes/textNode';
import { MathNode }           from './nodes/mathNode';
import { FilterNode }         from './nodes/filterNode';
import { ApiRequestNode }     from './nodes/apiRequestNode';
import { PromptTemplateNode } from './nodes/promptTemplateNode';
import { NoteNode }           from './nodes/noteNode';

import 'reactflow/dist/style.css';

const gridSize   = 20;
const proOptions = { hideAttribution: true };

const nodeTypes = {
  customInput:    InputNode,
  llm:            LLMNode,
  customOutput:   OutputNode,
  text:           TextNode,
  math:           MathNode,
  filter:         FilterNode,
  apiRequest:     ApiRequestNode,
  promptTemplate: PromptTemplateNode,
  note:           NoteNode,
};

// MiniMap node colors match ACCENTS in BaseNode.js
const miniMapColor = (node) => ({
  customInput:    '#6366f1',
  customOutput:   '#10b981',
  llm:            '#ec4899',
  promptTemplate: '#ec4899',
  text:           '#f59e0b',
  math:           '#f59e0b',
  filter:         '#f59e0b',
  apiRequest:     '#0ea5e9',
  note:           '#8b5cf6',
}[node.type] || '#6366f1');

const selector = (state) => ({
  nodes:         state.nodes,
  edges:         state.edges,
  getNodeID:     state.getNodeID,
  addNode:       state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect:     state.onConnect,
});

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const {
    nodes, edges,
    getNodeID, addNode,
    onNodesChange, onEdgesChange, onConnect,
  } = useStore(selector, shallow);

  const getInitNodeData = (nodeID, type) => ({ id: nodeID, nodeType: type });

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      if (event?.dataTransfer?.getData('application/reactflow')) {
        const { nodeType: type } = JSON.parse(event.dataTransfer.getData('application/reactflow'));
        if (!type) return;
        const position = reactFlowInstance.project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
        const nodeID = getNodeID(type);
        addNode({ id: nodeID, type, position, data: getInitNodeData(nodeID, type) });
      }
    },
    [reactFlowInstance]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div
      ref={reactFlowWrapper}
      style={{ flex: 1, height: '100%', background: '#0f1117' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        snapToGrid
        connectionLineType='smoothstep'
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
        defaultEdgeOptions={{
          type:      'smoothstep',
          animated:   true,
          style:     { stroke: '#6366f1', strokeWidth: 2 },
        }}
        fitView
      >
        {/* Dark dot-grid background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={gridSize}
          size={1}
          color='#1e293b'
        />

        {/* Zoom controls — bottom left */}
        <Controls />

        {/* MiniMap — bottom right, node blobs match accent colors */}
        <MiniMap
          nodeColor={miniMapColor}
          maskColor='rgba(15,17,23,0.75)'
          style={{
            background:   '#0d1117',
            border:       '1px solid #1e293b',
            borderRadius:  8,
          }}
        />
      </ReactFlow>
    </div>
  );
};
