---
sidebar_position: 6
title: Benchmarks
description: Per-target benchmark infrastructure in GPBT (reserved for a future release).
tags:
  - benchmarks
  - performance
  - testing
---

GPBT reserves per-target benchmark infrastructure for a future release. The `gpEnableBenchmarks()` macro is available today and can be called inside a target definition to signal intent, but it does not yet generate benchmark targets.

## Current behaviour

```cmake
gpStartModule("math")
  gpEnableBenchmarks()
gpEndModule()
```

Calling `gpEnableBenchmarks()` records that the `math` module has benchmarks. This has no visible effect on the generated build system at this time.

## Planned behaviour

When the feature is fully implemented, `gpEnableBenchmarks()` will configure a companion benchmark target that compiles sources from a `benchmarks/` subdirectory alongside the module. The benchmark target will be linked against the module under test and against a registered benchmark framework.

:::note
The per-target benchmark API is designed so that calling it today will not require changes when the feature ships. Code that calls `gpEnableBenchmarks()` now will automatically gain benchmark targets in the future without modification.
:::
