---
sidebar_position: 8
title: Compile Options
description: How to add compiler flags to a target with controlled visibility, on top of the flags GPBT applies automatically.
tags:
  - compile options
  - compiler flags
  - cmake
---

GPBT applies a standard set of compiler flags to every target automatically based on the active compiler, platform, and build configuration. `gpAddCompileOption()` lets you add flags on top of that baseline, scoped to a specific target with the usual visibility semantics.

## Syntax

```cmake
gpAddCompileOption(visibility flag [flag2 ...])
```

`visibility` is one of `PUBLIC`, `PRIVATE`, or `INTERNAL`.

## When to use this API

Most of the time you won't need `gpAddCompileOption()`. GPBT's compiler files already handle optimisation flags, warning levels, and debug information for every configuration and compiler combination.

Reach for this API when you need flags specific to one module: architecture intrinsics, profile-guided optimisation feedback, or relaxed aliasing rules for a particular source group.

## Basic usage

```cmake
gpStartModule("math/simd")
  # Enable AVX-512 for this module only, guarded so other compilers are not affected
  if(CMAKE_CXX_COMPILER_ID MATCHES "Clang" OR CMAKE_CXX_COMPILER_ID STREQUAL "GNU")
    gpAddCompileOption(PRIVATE -mavx512f -mavx512bw)
  elseif(MSVC)
    gpAddCompileOption(PRIVATE /arch:AVX512)
  endif()
gpEndModule()
```

## Configuration-specific flags

Use CMake generator expressions to restrict a flag to specific build configurations:

```cmake
gpStartModule("renderer/core")
  gpAddCompileOption(PRIVATE "$<$<CONFIG:Profile>:-fno-omit-frame-pointer>")
gpEndModule()
```

This adds `-fno-omit-frame-pointer` only in `Profile` builds, preserving frame pointers for profiler callstack reconstruction without touching `Shipping` performance.

## Visibility reference

| Visibility | Effect |
| --- | --- |
| `PUBLIC` | Applied to this target and propagated to all dependents |
| `PRIVATE` | Applied to this target only |
| `INTERNAL` | Applied to this target and modules connected via INTERNAL dependency edges |

:::warning
Avoid adding warning flags manually. GPBT manages warning levels through `gpDisableStrictWarnings()` and the per-compiler policy files. Adding `-Wall` or `/W4` directly may interact unexpectedly with GPBT's own settings.
:::
