---
sidebar_position: 4
title: Monolithic Build
description: How GPBT's monolithic build mode combines all modules into a single library for distribution or whole-program optimisation.
tags:
  - monolithic
  - build modes
  - lto
---

By default, GPBT builds each module as a separate shared library, which gives fast incremental builds and runtime loading. For certain deployment scenarios, combining everything into a single library makes more sense.

## What monolithic mode does

When `GPBT_IS_MONOLITHIC` is `ON`, all modules are built as static libraries and linked into one combined archive — a single `.a` or `.lib` file containing the entire engine, rather than dozens of individual shared objects.

## When to use it

Monolithic builds are useful in two situations.

Shipping builds with Link-Time Optimisation (LTO). LTO can only optimise across translation units the linker sees simultaneously. A monolithic build exposes the entire codebase to the linker at once, making cross-module inlining, dead-code elimination, and devirtualisation possible in ways that per-module shared libraries cannot support.

Platform constraints. Some platforms — particularly consoles and mobile targets — prefer or require statically linked binaries. Monolithic mode produces the correct output format without changing how individual modules are written.

## Enabling monolithic mode

```bash
cmake -S . -B build -DGPBT_IS_MONOLITHIC=ON -DCMAKE_BUILD_TYPE=Shipping
```

Or in a `CMakePresets.json` entry:

```json
{
  "name": "ship-monolithic",
  "displayName": "Shipping (Monolithic)",
  "cacheVariables": {
    "CMAKE_BUILD_TYPE": "Shipping",
    "GPBT_IS_MONOLITHIC": "ON"
  }
}
```

## Effect on module targets

In monolithic mode, every module that would have been a shared library is built as a static library instead. The CMake target names and aliases stay the same. Code that references `gp::renderer` or `gp::rhi_base` continues to work without changes.

:::note
Plugin targets are not affected by monolithic mode, as plugins are by definition runtime-loaded and cannot be statically linked into the host binary.
:::

## Combining with LTO

GPBT applies the correct Link-Time Optimisation flags for the active compiler when building in `Shipping` configuration. In monolithic mode, those flags interact with the combined archive to produce a fully optimised final binary.

The LTO strategy depends on the toolchain: thin LTO for Clang, full LTO for GCC and MSVC. Thin LTO trades a small amount of optimisation scope for noticeably faster link times, which is generally the better trade-off at engine scale.
