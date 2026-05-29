---
sidebar_position: 0
title: Features
description: An overview of all capabilities built into the GP Build Tool.
tags:
  - features
  - cmake
  - build system
---

GP Build Tool addresses several specific challenges that come up in AAA game engine development. This section covers each feature, why it works the way it does, and how to use it.

## Feature overview

| Feature | Summary |
| --- | --- |
| [Two-Phase Build](./Three%20Phases%20Build.md) | Targets are registered first and configured after sorting, eliminating declaration-order bugs |
| [Third Party Management](./Third%20Party%20Management.md) | Platform-aware package resolution with system, prebuilt binary, and source build modes |
| [Unity Build](./Unity%20Build.md) | Batch-compile multiple translation units to improve build throughput |
| [Monolithic Build](./Monolithic%20Build.md) | Combine all modules into a single library for distribution or link-time optimisation |
| [Graphviz Generation](./Graphviz%20Generation.md) | Export the target dependency graph as a Graphviz DOT file |
| [Benchmarks](./Benchmarks.md) | Per-target benchmark infrastructure (reserved) |
| [ISPC Integration](./ISPC%20Integration.md) | Compile ISPC kernels as part of the standard build pipeline (planned) |
| [Shader Pipeline Integration](./Shader%20Pipeline%20Integration.md) | Integrate shader compilation into the CMake build graph (planned) |
