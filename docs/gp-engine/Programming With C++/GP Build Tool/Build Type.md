---
sidebar_position: 1
title: Build Types
description: The four build configurations used by GPBT and what each one is optimised for.
tags:
  - build types
  - configuration
  - debug
  - shipping
---

GPBT uses four named build configurations instead of CMake's default `Debug` / `Release` / `RelWithDebInfo` / `MinSizeRel` set. These configurations are designed around the reality of daily AAA engine development, where the needs of an engineer iterating on gameplay code differ significantly from those of a profiling session or a submission build.

## The four configurations

| Configuration | Optimisations | Debug Info | Assertions | Intended use |
| --- | --- | --- | --- | --- |
| `Debug` | Off | Full | Enabled | Investigating bugs, stepping through the debugger |
| `Development` | On | Full | Enabled | Day-to-day engineering work |
| `Profile` | On | Off | Disabled | Profiling sessions, performance analysis |
| `Shipping` | On | Off | Disabled | Final product builds, distribution |

### Debug

Full debug information, no optimisations, all assertions active. Use this configuration when you need to attach a debugger and step through code reliably. Compilation is slower and the resulting binary runs significantly slower than other configurations, so it is not recommended for general iteration.

### Development

Optimisations are enabled but full debug symbols are retained. Assertions remain active. This is the recommended configuration for day-to-day work: the binary runs at near-native speed, and the debug symbols allow meaningful crash reports and profiler callstacks. Most engineers run in `Development` by default.

:::tip
Set your IDE's default build to `Development`, not `Debug`. You get debuggable symbols at much better runtime performance.
:::

### Profile

Fully optimised, debug symbols stripped, assertions disabled. This configuration is intended exclusively for performance analysis. The binary behaves identically to `Shipping` in terms of code generation, so profiling results reflect real-world performance. Debug symbols are removed to avoid misleading profiler output introduced by inlining.

### Shipping

The final product configuration. Fully optimised, no debug information, no assertions, logging stripped. Only use this when preparing a build for distribution. It is not suitable for development or profiling work.

:::warning
Never develop or iterate against the `Shipping` configuration. Missing assertions and stripped logging will hide bugs that would otherwise surface immediately in `Development`.
:::

## Setting the build type

Pass the configuration on the CMake command line:

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Development
```

For multi-configuration generators (Visual Studio, Xcode), the build type is selected at build time rather than at configure time. All four configurations are always generated.

### Using CMake Presets

Define presets in `CMakePresets.json` to avoid specifying the build type manually on every invocation:

```json
{
  "version": 6,
  "configurePresets": [
    {
      "name": "dev-windows",
      "displayName": "Development (Windows)",
      "generator": "Visual Studio 17 2022",
      "binaryDir": "${sourceDir}/build/${presetName}"
    },
    {
      "name": "ship-linux",
      "displayName": "Shipping (Linux)",
      "generator": "Ninja",
      "binaryDir": "${sourceDir}/build/${presetName}",
      "cacheVariables": {
        "CMAKE_BUILD_TYPE": "Shipping"
      }
    }
  ]
}
```

## Allowed configurations

GPBT validates that only the four recognised configurations are used. The list is stored in `GPBT_ALLOWED_CONFIGS`:

```cmake
set(GPBT_ALLOWED_CONFIGS "Debug;Development;Profile;Shipping")
```

Using any configuration name not in this list, such as `Release`, will produce a fatal error at configure time. This prevents accidentally bypassing GPBT's flag policy.
