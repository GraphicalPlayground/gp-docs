---
sidebar_position: 12
title: Mermaid Generation
description: How to export the target dependency graph as a Mermaid flowchart for markdown viewers.
tags:
  - mermaid
  - dependency graph
  - visualisation
  - markdown
---

GPBT can export the full target dependency graph as a [Mermaid](https://mermaid.js.org/) flowchart. Mermaid graphs are natively rendered by many markdown viewers, including GitHub, GitLab, and Azure DevOps, making them ideal for embedding directly into project documentation.

## Enabling the export

Set `GPBT_EXPORT_MERMAID_GRAPH=ON` at configure time:

```bash
cmake -S . -B build -DGPBT_EXPORT_MERMAID_GRAPH=ON
```

:::note
If you use `gpApplyGraphicalPlaygroundDefaultPolicy()`, Mermaid export is enabled by default.
:::

After a successful configure, the Mermaid file is written to the path specified by `GPBT_MERMAID_GRAPH_FILE`. The default is:

```text
<cmake-binary-dir>/gpbt_dependency_graph.mmd
```

To write it to a custom location:

```bash
cmake -S . -B build \
  -DGPBT_EXPORT_MERMAID_GRAPH=ON \
  -DGPBT_MERMAID_GRAPH_FILE=/path/to/graph.mmd
```

## Visualizing the graph

You can visualize the exported graph in several ways:

1.  **Markdown Viewers**: Rename the file to `.md` or paste its content into a markdown file wrapped in a mermaid code block:
    ```mermaid
    [content of gpbt_dependency_graph.mmd]
    ```
2.  **Mermaid Live Editor**: Paste the content into the [Mermaid Live Editor](https://mermaid.live).
3.  **Mermaid CLI**: Use the `mmdc` command from the `@mermaid-js/mermaid-cli` package to render it as an image:
    ```bash
    mmdc -i build/gpbt_dependency_graph.mmd -o dependency_graph.svg
    ```

## Graph styling

The exported graph uses the following styling conventions to help you distinguish between target types and dependency visibilities:

### Target Shapes and Colors

| Type | Shape | Color |
| --- | --- | --- |
| **Module** | Square Box | Light Blue |
| **Executable** | Parallelogram | Light Yellow |
| **Plugin** | Hexagon | Light Coral |

### Dependency Visibilities

| Visibility | Edge Style | Color |
| --- | --- | --- |
| **PUBLIC** | Solid Arrow | Blue |
| **PRIVATE** | Solid Arrow | Gray |
| **INTERNAL** | Solid Arrow | Orange |
| **DYNAMIC** | Dashed Arrow | Red |

:::tip
Targets with tests enabled (`gpEnableTests()`) are rendered with a dashed border.
:::

## Comparison with Graphviz

While [Graphviz Generation](./Graphviz%20Generation.md) is better for extremely large graphs and offers more layout control, Mermaid is generally preferred for:
- Quick orientation in documentation.
- Native rendering in web browsers and git hosting platforms.
- Version control friendliness (the `.mmd` file is text-based and relatively readable).
