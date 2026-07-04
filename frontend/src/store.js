// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({
          ...connection,
          type: 'smoothstep',
          animated: true,
          // Bug 3 fix: set stroke color so edges match the app's indigo theme.
          // Without style.stroke ReactFlow renders edges in its default gray.
          style: { stroke: '#6366f1', strokeWidth: 2 },
          markerEnd: {
            type:   MarkerType.Arrow,
            height: '20px',
            width:  '20px',
            color:  '#6366f1',  // arrowhead color must be set separately
          },
        }, get().edges),
      });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id !== nodeId) return node;
          // Bug 1 fix: return a brand-new object instead of mutating node.data
          // in-place. React and Zustand use reference equality to detect changes;
          // mutating the existing object keeps the reference the same, causing
          // silent re-render failures when field values change.
          return { ...node, data: { ...node.data, [fieldName]: fieldValue } };
        }),
      });
    },
  }));
