# VectorShift Pipeline Builder

A drag-and-drop visual pipeline builder for AI/data workflows — connect nodes, build logic, and validate it as a DAG in one click.

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white)
![ReactFlow](https://img.shields.io/badge/ReactFlow-FF0072)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)

![Demo](./demo.gif)

---

## What it does

Drag nodes onto a canvas, connect them, and build a pipeline visually — like Input → LLM → Output. Click **Run**, and the backend checks your pipeline's structure and returns whether it's valid.

## Highlights

- 🧩 **One abstraction, 9 node types** — every node is generated from a single reusable `BaseNode` component, cutting new-node code from 40+ lines to under 15
- ✍️ **Live variable handles** — type `{{variable}}` in a text node and a connection point appears instantly, no config needed
- 📏 **Auto-resizing nodes** — text nodes grow as you type
- 🔄 **DAG validation** — backend uses Kahn's Algorithm to detect cycles in O(V+E) time before running

## Tech Stack

React · ReactFlow · Zustand · FastAPI · Python

## Run it

```bash
# Frontend
cd frontend && npm install && npm start

# Backend
cd backend && pip install fastapi uvicorn && uvicorn main:app --reload
```

## How to use

1. Drag a node onto the canvas
2. Connect nodes by dragging between handles
3. Click **▶ Run Pipeline**
4. Get an instant result: `{ num_nodes, num_edges, is_dag }`

---

MIT License
