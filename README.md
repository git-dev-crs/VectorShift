# VectorShift Pipeline Builder

A visual, drag-and-drop pipeline builder for designing AI/data workflows — built with a reusable node abstraction engine, live variable detection, and a FastAPI backend that validates pipelines as Directed Acyclic Graphs (DAGs).

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![ReactFlow](https://img.shields.io/badge/ReactFlow-11-FF0072)
![Zustand](https://img.shields.io/badge/Zustand-State-orange)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Overview

This project is a **visual pipeline builder** — users drag nodes onto a canvas, connect them with edges, and build workflows the same way tools like LangChain or Zapier let you compose logic, but visually. Every node (Input, Output, LLM, Text, Math, Filter, API Request, etc.) is generated from a **single reusable abstraction**, so adding a new node type takes minutes, not hours.

**Live features:**
- Drag-and-drop node canvas with categorized sidebar
- Auto-resizing Text node that grows as you type
- Real-time `{{variable}}` detection that generates connection handles on the fly
- One-click pipeline validation — counts nodes/edges and checks for cycles (DAG)
- Full dark-themed, unified UI

---

## 🖼️ Preview

> *(Add a screenshot or GIF of the pipeline builder here — this is the single highest-impact addition you can make to this README)*

```
[Input] → [Text: "Summarize {{doc}}"] → [LLM] → [Output]
```

---

## 🏗️ Architecture Highlights

### 1. Reusable Node Abstraction
Every node type — regardless of shape, fields, or number of handles — is generated from one `BaseNode` component driven by a config object:

```js
export const InputNode = ({ id, data }) => (
  <BaseNode id={id} data={data} config={{
    title: 'Input',
    accent: ACCENTS.input,
    fields: [{ name: 'inputName', type: 'text', label: 'Name' }],
    handles: [{ type: 'source', position: 'right', idSuffix: 'value' }],
  }} />
);
```

This cut new-node code from **40+ lines to under 15**, and two centralized objects — `TOKENS` (spacing, fonts, colors) and `ACCENTS` (category color palette) — mean the entire app's visual design can be changed from **one file**.

### 2. Live Variable Detection
The Text node scans its own content on every keystroke using:

```js
/\{\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}\}/g
```

Every valid `{{variableName}}` found automatically spawns a connection **Handle** on the left edge of the node — live, as you type, with no manual configuration.

### 3. DAG Validation via Kahn's Algorithm
The backend runs an **O(V + E)** topological sort to detect cycles in the pipeline graph before it can run:

```python
def is_dag(node_ids, edges) -> bool:
    # Build adjacency list + in-degree counts
    # Process zero-in-degree nodes first (Kahn's Algorithm)
    # If all nodes get visited → no cycle → valid DAG
    ...
```

Verified against **9 edge cases** — self-loops, two-node cycles, disconnected graphs, empty pipelines — with zero failures.

---

## 🧩 Available Nodes

| Node | Category | Description |
|---|---|---|
| **Input** | Data I/O | Entry point for external data |
| **Output** | Data I/O | Exit point for pipeline results |
| **LLM** | AI | Sends system + user prompts to a language model |
| **Prompt Template** | AI | Builds prompts from `{{variable}}` templates |
| **Text** | Transform | Auto-resizing text with live variable handles |
| **Math** | Transform | Basic arithmetic on two inputs |
| **Filter** | Transform | Routes data by a condition (matched/unmatched) |
| **API Request** | Network | Makes an outbound HTTP call |
| **Note** | Utility | Freeform annotation — no connections |

---

## 🛠️ Tech Stack

**Frontend:** React · ReactFlow · Zustand (state management) · Vanilla CSS-in-JS
**Backend:** Python · FastAPI · Pydantic
**Algorithm:** Kahn's Algorithm (topological sort / cycle detection)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- Python 3.10+

### 1. Clone the repo
```bash
git clone https://github.com/<your-username>/vectorshift-pipeline-builder.git
cd vectorshift-pipeline-builder
```

### 2. Run the frontend
```bash
cd frontend
npm install
npm start
```
Opens at `http://localhost:3000`

### 3. Run the backend
```bash
cd backend
pip install fastapi uvicorn pydantic
uvicorn main:app --reload
```
Runs at `http://localhost:8000`

---

## 📝 How to Use

1. **Drag** a node from the left sidebar onto the canvas
2. **Connect** nodes by dragging from one handle to another
3. **Fill in** each node's fields (name, type, prompt, etc.)
4. Type `{{variableName}}` in a Text node to auto-generate a connection handle
5. Click **▶ Run Pipeline** — the backend validates the graph and returns:
   ```json
   { "num_nodes": 4, "num_edges": 3, "is_dag": true }
   ```
6. An alert displays the result instantly

---

## 📂 Project Structure

```
vectorshift-pipeline-builder/
├── frontend/
│   └── src/
│       ├── nodes/
│       │   ├── BaseNode.js          # Core abstraction — all node styling & logic
│       │   ├── inputNode.js         # Config-driven node (~12 lines)
│       │   ├── outputNode.js
│       │   ├── llmNode.js
│       │   ├── textNode.js          # Auto-resize + variable handles
│       │   ├── mathNode.js
│       │   ├── filterNode.js
│       │   ├── apiRequestNode.js
│       │   ├── promptTemplateNode.js
│       │   └── noteNode.js
│       ├── App.js                   # Layout: header + sidebar + canvas
│       ├── ui.js                    # ReactFlow canvas config
│       ├── toolbar.js               # Draggable node sidebar
│       ├── draggableNode.js         # Individual sidebar chip
│       ├── submit.js                # Run button + backend integration
│       └── store.js                 # Zustand global state
└── backend/
    └── main.py                      # FastAPI + Kahn's Algorithm DAG check
```

---

## 🎯 Key Engineering Decisions

- **Config over inheritance** — nodes are pure data, not subclasses, making them trivial to test, extend, and reason about
- **Single source of visual truth** — `TOKENS` + `ACCENTS` mean restyling never touches individual node files
- **Immutable state updates** — all Zustand mutations return new object references to guarantee correct React re-renders
- **Iterative graph algorithm** — Kahn's Algorithm chosen over recursive DFS to avoid stack-depth risk on large pipelines and to get cycle detection as a simple counter comparison

---

## 📄 License

MIT
