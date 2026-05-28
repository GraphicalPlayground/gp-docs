---
sidebar_position: 3
title: Targets
description: How to declare modules, executables, and plugins using the GPBT target API.
tags:
  - targets
  - modules
  - executables
  - cmake
---

A GPBT target is a named compilation unit: a library, an executable, or a plugin. Each target is declared in its own `CMakeLists.txt` file using the `gpStart*` / `gpEnd*` pair.

## Target types

| Type | CMake output | Macro |
| --- | --- | --- |
| Module | Library (shared or static) | `gpStartModule()` |
| Executable | Executable binary | `gpStartExecutable()` |
| Plugin | Runtime-loaded module | `gpStartPlugin()` |

All three types share the same inner API for declaring sources, dependencies, compile flags, and other properties.

## Declaring a module

```cmake
include(gp-build-tool)

gpStartModule("renderer/core")
  gpAddDependency(PUBLIC rhi/base)
gpEndModule()
```

`gpStartModule()` is equivalent to `gpStartTarget("module" ...)`. The `gpEndModule()` macro closes the definition.

## Declaring an executable

```cmake
include(gp-build-tool)

gpStartExecutable("editor")
  gpAddDependency(PUBLIC core)
gpEndExecutable()
```

## Declaring a plugin

Plugins are modules that are loaded at runtime via `dlopen()` or `LoadLibrary()`. They are declared with `gpStartPlugin()`:

```cmake
include(gp-build-tool)

gpStartPlugin("renderer/rhi-d3d12")
  gpAddDependency(PUBLIC rhi/base)
gpEndPlugin()
```

:::note
Plugin support is reserved for a future release. Calling `gpStartPlugin()` currently registers the target but does not yet apply any special runtime-loading behaviour beyond what a regular shared library provides.
:::

## Target naming

Target names support a `/` separator to express module hierarchy:

```cmake
gpStartModule("rhi/base")    # hierarchy: rhi layer, base interface
gpStartModule("rhi/d3d12")   # hierarchy: rhi layer, D3D12 implementation
```

The `/` is converted to an internal clean name. The resulting CMake targets and aliases use underscores:

| Declared name | CMake alias |
| --- | --- |
| `core` | `gp::core` |
| `rhi/base` | `gp::rhi_base` |
| `rhi/d3d12` | `gp::rhi_d3d12` |

The output binary name follows a kebab-case convention: `gp-rhi-d3d12`.

## Target location

Each target's `CMakeLists.txt` must be in the same directory as the target's source files. GPBT uses the location of the `CMakeLists.txt` to determine which source files belong to the target using the `public/`, `internal/`, and `private/` subdirectory convention described in [Sources](./Sources.md).

## The generic form

The `gpStartModule`, `gpStartExecutable`, and `gpStartPlugin` macros are all sugar over `gpStartTarget`:

```cmake
gpStartTarget("module" "my/module")
  # ...
gpEndTarget()
```

Use the type-specific macros in practice. `gpStartTarget` is available for completeness but the specialised forms are clearer.
