---
sidebar_position: 7
title: ISPC Integration
description: Planned support for compiling Intel SPMD Program Compiler (ISPC) kernels as part of the GPBT build pipeline.
tags:
  - ispc
  - spmd
  - planned
  - shaders
---

:::note Planned Feature
ISPC integration is planned for a future release. The design is in progress. This page documents the intended behaviour.
:::

## What is ISPC?

The Intel SPMD Program Compiler (ISPC) is a compiler for a C-like language designed for SIMD-parallel CPU code. It is commonly used in AAA game engines for skinning, physics broadphase, animation blending, and ray tracing BVH traversal.

ISPC source files (`.ispc`) compile to object files containing vectorised machine code targeting one or more SIMD ISA widths (SSE4, AVX2, AVX-512, NEON, and so on).

## Planned integration

When implemented, GPBT will allow `.ispc` source files to be registered alongside regular `.cpp` files in any module definition:

```cmake
gpStartModule("animation/skinning")
  gpAddSourceDirectory(private)     # .cpp files
  gpAddSourceFile(private/Skinning.ispc)
gpEndModule()
```

GPBT will invoke the ISPC compiler with the correct target architecture flags for the active platform and configuration, and link the resulting object files into the module.

## Planned target support

| Platform | ISPC target |
| --- | --- |
| Windows (x64) | `avx2-i32x8`, `avx512skx-i32x16` |
| Linux (x64) | `avx2-i32x8`, `avx512skx-i32x16` |
| macOS (x64) | `avx2-i32x8` |
| macOS (ARM64) | `neon-i32x4`, `neon-i32x8` |
| Android (ARM64) | `neon-i32x4` |
