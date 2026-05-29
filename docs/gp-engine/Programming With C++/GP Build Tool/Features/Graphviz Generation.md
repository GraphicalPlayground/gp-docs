---
sidebar_position: 5
title: Graphviz Generation
description: How to export the target dependency graph as a Graphviz DOT file and render it as an SVG or PNG.
tags:
  - graphviz
  - dependency graph
  - visualisation
---

Understanding the dependency graph of a large engine codebase helps identify unwanted couplings, verify that layering rules are respected, and get new engineers oriented. GPBT can export the full target dependency graph as a Graphviz DOT file at the end of the configuration phase.

## Enabling the export

Set `GPBT_EXPORT_DEPENDENCY_GRAPH=ON` at configure time:

```bash
cmake -S . -B build -DGPBT_EXPORT_DEPENDENCY_GRAPH=ON
```

After a successful configure, the DOT file is written to the path specified by `GPBT_DEPENDENCY_GRAPH_FILE`. The default is:

```text
<cmake-binary-dir>/gpbt_dependency_graph.dot
```

To write it to a custom location:

```bash
cmake -S . -B build \
  -DGPBT_EXPORT_DEPENDENCY_GRAPH=ON \
  -DGPBT_DEPENDENCY_GRAPH_FILE=/path/to/graph.dot
```

## Rendering the graph

Use the `dot` command from the [Graphviz](https://graphviz.org) package to render the DOT file:

```bash
# Render as SVG
dot -Tsvg build/gpbt_dependency_graph.dot -o dependency_graph.svg

# Render as PNG
dot -Tpng build/gpbt_dependency_graph.dot -o dependency_graph.png
```

For large graphs, the `fdp` or `sfdp` layout engines tend to produce more readable results than the default `dot` hierarchical layout:

```bash
sfdp -Tsvg -Goverlap=prism build/gpbt_dependency_graph.dot -o dependency_graph.svg
```

## Graph contents

The exported graph includes all registered GPBT targets and the dependency edges between them, labeled by visibility (`PUBLIC`, `PRIVATE`, `INTERNAL`, or `DYNAMIC`).

Thirdparty packages appear as terminal nodes, so you can see at a glance which engine modules depend on which external libraries.

:::tip
Commit the rendered graph to your repository's documentation alongside this docs site. A static SVG embedded in a wiki page is often the fastest way for a new engineer to orient themselves in a large codebase.
:::

## Exporting only, not building

The dependency graph is written during the configuration phase, before any targets are compiled. You can get the graph without running a full build:

```bash
cmake -S . -B build -DGPBT_EXPORT_DEPENDENCY_GRAPH=ON
# The DOT file is written as soon as cmake finishes, no build step needed
```
