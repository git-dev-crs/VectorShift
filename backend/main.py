# main.py
# ─────────────────────────────────────────────────────────────────────────────
# FastAPI backend for the VectorShift pipeline builder.
#
# Endpoint:  POST /pipelines/parse
# Body:      { nodes: [...], edges: [...] }   (ReactFlow node/edge objects)
# Response:  { num_nodes: int, num_edges: int, is_dag: bool }
#
# DAG check algorithm — Kahn's Algorithm (iterative topological sort):
#   1. Build an adjacency list from the edges (source → target)
#   2. Count in-degrees (how many incoming edges each node has)
#   3. Seed a queue with every node whose in-degree is 0 (no dependencies)
#   4. While the queue is non-empty:
#        - Pop a node
#        - Increment a "visited" counter
#        - For each neighbour, decrement its in-degree
#        - If a neighbour's in-degree drops to 0, add it to the queue
#   5. If visited == total nodes → no cycle existed → it IS a DAG
#      If visited  < total nodes → some nodes were never reachable (cycle) → NOT a DAG
#
# Why Kahn's and not DFS?
#   Kahn's is iterative (no recursion limit risk) and naturally counts
#   processed nodes, making the cycle check a single integer comparison.
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from collections import deque

app = FastAPI()

# ── CORS ──────────────────────────────────────────────────────────────────────
# The React dev server runs on localhost:3000; the API on localhost:8000.
# Without CORS headers the browser will block every fetch() call.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request schema ─────────────────────────────────────────────────────────────
# ReactFlow passes full node/edge objects; we only care about their ids and
# the source/target fields on edges.
# extra = "allow" lets Pydantic accept the full ReactFlow objects without
# needing to mirror every field (position, data, type, selected…).

class Node(BaseModel):
    id: str
    # Accept but ignore all other ReactFlow node fields (position, data, type…)
    class Config:
        extra = "allow"

class Edge(BaseModel):
    id: str
    source: str   # id of the source node
    target: str   # id of the target node
    class Config:
        extra = "allow"

class PipelineRequest(BaseModel):
    nodes: list[Node]
    edges: list[Edge]

# ── Health check ───────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"Ping": "Pong"}

# ── DAG check helper ───────────────────────────────────────────────────────────

def is_dag(node_ids: list[str], edges: list[Edge]) -> bool:
    """
    Kahn's Algorithm — returns True if the directed graph is acyclic.

    Works on node ids + edge (source, target) pairs.
    Self-loops (source == target) are immediately detected as cycles.
    Isolated nodes (no edges at all) are valid and always processed.
    Phantom edges (referencing unknown node ids) are silently skipped.
    """
    # Build adjacency list and in-degree map initialised for every node
    adj: dict[str, list[str]] = {nid: [] for nid in node_ids}
    in_degree: dict[str, int] = {nid: 0 for nid in node_ids}

    for edge in edges:
        src, tgt = edge.source, edge.target

        # Self-loop → instant cycle
        if src == tgt:
            return False

        # Guard against edges referencing nodes not in our node list
        if src not in adj or tgt not in adj:
            continue

        adj[src].append(tgt)
        in_degree[tgt] += 1

    # Seed queue with all zero-in-degree nodes (no incoming edges)
    queue = deque(nid for nid in node_ids if in_degree[nid] == 0)
    visited = 0

    while queue:
        node = queue.popleft()
        visited += 1
        for neighbour in adj[node]:
            in_degree[neighbour] -= 1
            if in_degree[neighbour] == 0:
                queue.append(neighbour)

    # All nodes processed → no cycle; fewer → at least one cycle exists
    return visited == len(node_ids)

# ── Main endpoint ──────────────────────────────────────────────────────────────

@app.post("/pipelines/parse")
def parse_pipeline(pipeline: PipelineRequest):
    """
    Accepts a ReactFlow pipeline (nodes + edges), returns:
      - num_nodes: total node count
      - num_edges: total edge count
      - is_dag:    True if the graph has no directed cycles
    """
    node_ids = [node.id for node in pipeline.nodes]

    return {
        "num_nodes": len(pipeline.nodes),
        "num_edges": len(pipeline.edges),
        "is_dag":    is_dag(node_ids, pipeline.edges),
    }
