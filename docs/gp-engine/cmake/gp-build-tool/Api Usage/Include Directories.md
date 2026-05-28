---
sidebar_position: 6
title: Include Directories
description: How GPBT manages include paths automatically from the directory layout and how visibility controls which headers are exposed to dependents.
tags:
  - include directories
  - headers
  - cmake
  - visibility
---

GPBT manages include directories automatically based on the source directory layout. You do not need to call `target_include_directories()` or any equivalent macro: GPBT infers the correct include paths from the presence of `public/`, `internal/`, and `private/` subdirectories.

## How include paths are assigned

When GPBT configures a target, it inspects the target's directory for the three standard subdirectories and assigns each one to the appropriate CMake include path visibility:

| Directory | Include visibility | Who can see the headers |
| --- | --- | --- |
| `public/` | `PUBLIC` | The module itself and any module that depends on it with any visibility |
| `internal/` | `INTERFACE` (cross-graph) | The module itself and modules that depend on it with `INTERNAL` visibility |
| `private/` | `PRIVATE` | The module itself only |

## Example

Given this directory layout:

```text
core/
  CMakeLists.txt
  public/
    Math.hpp          <- visible to anyone depending on core
  internal/
    AllocatorImpl.hpp <- visible to modules using INTERNAL visibility
  private/
    MathImpl.cpp
    MathImpl.hpp      <- not visible outside this module
```

GPBT will call the equivalent of:

```cmake
target_include_directories(gp-core
  PUBLIC   ${CMAKE_CURRENT_LIST_DIR}/public
  PRIVATE  ${CMAKE_CURRENT_LIST_DIR}/private
)
```

The `internal/` directory is handled through a separate mechanism tied to the `INTERNAL` dependency visibility level.

## The internal visibility model

The `internal/` directory exists to handle a common pattern in large engines: utilities or interfaces that need to be shared across multiple modules without being part of any module's stable public API. Marking them as `PUBLIC` would expose them to all consumers; marking them as `PRIVATE` would hide them entirely.

The `INTERNAL` dependency visibility lets you express this precisely:

```cmake
# core declares internal headers
gpStartModule("core")
gpEndModule()

# renderer depends on core with INTERNAL visibility
gpStartModule("renderer")
  gpAddDependency(INTERNAL core)
gpEndModule()

# renderer's consumers can see core's internal headers
# because they are in the dependency graph
```

## No manual include directory API

GPBT does not expose a `gpAddIncludeDirectory()` macro. The directory convention is the intended and enforced mechanism. This keeps include path management consistent and prevents the gradual accumulation of hand-curated include paths that tends to drift over time.

If you need to include headers from a non-standard location (such as generated headers), use `gpAddSourceDirectory()` to add the directory as a source directory, or structure the generated output to match the `public/` convention so it is discovered automatically.
