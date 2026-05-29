---
sidebar_position: 3
title: Unity Build
description: How GPBT's unity build feature batches translation units to improve compilation throughput.
tags:
  - unity build
  - build performance
  - compilation
---

A unity build (also called a jumbo or amalgamation build) speeds up compilation by combining multiple `.cpp` files into a single translation unit before handing them to the compiler. This cuts the number of compilation jobs and spreads the cost of parsing common headers across fewer processes.

## Why it matters

In a large engine codebase, each translation unit processes all of its included headers independently. A module with 40 source files that each include a common precompiled header triggers that header's parsing 40 times. With a unity build, those 40 files get batched into groups and processed as a smaller number of larger files, cutting total parse time considerably.

## Enabling unity build for a module

Call `gpEnableUnityBuild()` inside a target definition:

```cmake
gpStartModule("renderer/core")
  gpEnableUnityBuild()
  gpAddDependency(PUBLIC rhi/base)
gpEndModule()
```

GPBT sets CMake's `UNITY_BUILD` property on the target and sets a batch size of 16 translation units per group.

## Batch size

The default batch size is 16, meaning up to 16 `.cpp` files are merged into a single translation unit. A module with 48 source files produces three unity files, each containing 16 originals.

CMake groups files automatically based on alphabetical ordering within the target's source list.

## When to use it

Unity build works best on modules with many small translation units that share a large set of common includes. It does less for modules with few, large source files, where compilation time is dominated by the file contents rather than header parsing.

:::tip
Enable unity build on stable, rarely-changing modules first. Those are the ones where you gain the most throughput without the iteration cost of recompiling a large batch when a single file changes.
:::

## Caveats

Unity builds can surface issues that were previously hidden by the implicit isolation of separate translation units. Static local variables or anonymous namespace symbols with the same name in different files will conflict when merged. A macro defined in one file can affect files merged after it in the same batch. Code that relies on a specific header being included before another may behave differently in a unified context.

If a module fails to compile with unity build enabled, check for these patterns before disabling it entirely. It is often possible to fix the underlying issue rather than giving up on the optimisation.

:::warning
Do not enable unity build on thirdparty code. Thirdparty libraries rarely guarantee they are safe to merge, and the resulting compilation errors are difficult to diagnose.
:::
