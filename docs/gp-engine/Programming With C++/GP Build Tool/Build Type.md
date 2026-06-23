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

GPBT uses four named build configurations instead of CMake's default `Debug` / `Release` / `RelWithDebInfo` / `MinSizeRel` set. They are designed around daily AAA engine development, where an engineer iterating on gameplay code has different needs than a profiling session or a submission build.

## The four configurations

| Configuration | Optimisations | Debug Info | Assertions | Intended use |
| --- | --- | --- | --- | --- |
| `Debug` | Off | Full | Enabled | Investigating bugs, stepping through the debugger |
| `Development` | On | Full | Enabled | Day-to-day engineering work |
| `Profile` | On | Off | Disabled | Profiling sessions, performance analysis |
| `Shipping` | On | Off | Disabled | Final product builds, distribution |

### Debug

Full debug information, no optimisations, all assertions active. Use it when you need to attach a debugger and step through code reliably. Compilation is slower and the binary runs much slower than in other configurations, so it is not suited for general iteration.

### Development

Optimisations are on, full debug symbols are kept, assertions remain active. The binary runs at near-native speed and the debug symbols give you useful crash reports and profiler callstacks. Most engineers stay on `Development` day-to-day.

:::tip
Set your IDE's default build to `Development`, not `Debug`. You get debuggable symbols at much better runtime performance.
:::

### Profile

Fully optimised, debug symbols stripped, assertions disabled. Use it for performance analysis only. The binary uses the same code generation as `Shipping`, so profiler results reflect real-world performance. Debug symbols are stripped because inlining can produce misleading callstacks in profiler output.

### Shipping

The final product configuration: fully optimised, no debug information, no assertions, logging stripped. Only use it when preparing a build for distribution, it is not suitable for development or profiling.

:::warning
Never develop or iterate against the `Shipping` configuration. Missing assertions and stripped logging will hide bugs that would otherwise surface immediately in `Development`.
:::

## Setting the build type

Pass the configuration on the CMake command line:

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Development
```

For multi-configuration generators (Visual Studio, Xcode), the build type is selected at build time, not configure time. All four configurations are always generated.

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

Any configuration name not in this list, such as `Release`, produces a fatal error at configure time. This stops you from accidentally bypassing GPBT's flag policy.
