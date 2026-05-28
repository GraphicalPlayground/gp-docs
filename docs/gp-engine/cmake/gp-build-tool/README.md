---
sidebar_position: 0
title: GP Build Tool
description: The CMake meta-build system for Graphical Playground projects. Wraps CMake with a structured, platform-aware API designed for AAA game engine development.
tags:
  - build tool
  - cmake
  - build system
  - thirdparty
  - c++
---

GP Build Tool (GPBT) is the CMake meta-build system used across Graphical Playground projects. Instead of writing raw CMake commands, teams declare targets and their relationships through a structured, domain-specific API. The build tool handles all compiler flags, linker settings, include path conventions, dependency ordering, and thirdparty package resolution automatically.

## Why a custom build system?

Modern AAA game engines involve dozens of modules, several platforms, multiple toolchains, and complex dependency graphs. Writing this in raw CMake leads to inconsistency: one module uses `/W4`, another forgets it; one platform sets the right output directory, another does not.

GPBT solves this by centralising all policy in one place. Every module, regardless of who wrote it or when, gets the same flags, the same warning levels, the same install rules, and the same dependency semantics. The public API is intentionally narrow and reads like documentation.

## Key design principles

**Declarative over imperative.** You describe _what_ a module is and what it depends on. GPBT resolves the _how_ automatically.

**Phase separation.** GPBT separates target registration from target configuration. All modules are declared first, sorted by dependency order, then configured. This avoids the ordering problems that plague naive CMake projects.

**No surprises.** Every flag, every install rule, every naming convention is consistent and documented. There are no hidden globals, no `add_compile_options()` calls scattered across the source tree.

**Platform and toolchain first.** GPBT detects the platform and compiler at configuration time and applies the correct flags automatically. You never write `if(MSVC)` inside a module's `CMakeLists.txt`.

## Quick start

Include the build tool module in your root `CMakeLists.txt`:

```cmake
cmake_minimum_required(VERSION 3.28)
project(my-engine)

list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/path/to/gp-build-tool/source")
include(gp-build-tool)

gpApplyGraphicalPlaygroundDefaultPolicy()

gpStartBuildTool()
  gpBuildToolAutoScan(thirdparty source)
gpEndBuildTool()
```

Then, in each module's `CMakeLists.txt`:

```cmake
include(gp-build-tool)

gpStartModule("rhi/vulkan")
  gpAddDependency(PUBLIC rhi/base)
  gpAddDependency(PRIVATE gp::thirdparty::vulkan)
gpEndModule()
```

That is all. GPBT infers the source files from the directory layout, applies the correct compiler flags, and wires up the include paths.

## Conventions used in this documentation

| Convention | Meaning |
| --- | --- |
| `gp*()` | Public API macro, safe to call from project code |
| `gpbt_*()` | Internal function, do not call directly |
| `GPBT_*` | CMake cache variable or global flag |
| `gp::<name>` | CMake alias for a GP module target |
| `gp::thirdparty::<name>` | CMake alias for a resolved thirdparty package |

:::info Version
This documentation covers GP Build Tool **0.4.0**.
:::
