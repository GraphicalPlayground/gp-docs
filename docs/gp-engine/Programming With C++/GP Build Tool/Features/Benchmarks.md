---
sidebar_position: 6
title: Benchmarks
description: Per-target benchmark infrastructure in GPBT (reserved for a future release).
tags:
  - benchmarks
  - performance
  - testing
---

GPBT reserves per-target benchmark infrastructure for a future release. The `gpEnableBenchmarks()` macro is available today and can be called inside a target definition to signal intent, but it does not yet generate any benchmark targets.

## Current behaviour

```cmake
gpStartModule("math")
  gpEnableBenchmarks()
gpEndModule()
```

Calling `gpEnableBenchmarks()` records that the `math` module has benchmarks. It has no visible effect on the generated build system right now.

## Planned behaviour

When fully implemented, `gpEnableBenchmarks()` will configure a companion benchmark target that compiles sources from a `benchmarks/` subdirectory alongside the module, linked against the module under test and a registered benchmark framework.

:::note
The per-target benchmark API is designed so that calling it today will not require any changes when the feature ships. Code that calls `gpEnableBenchmarks()` now will gain benchmark targets automatically once support is added.
:::
