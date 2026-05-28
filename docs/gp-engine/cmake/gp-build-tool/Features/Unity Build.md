---
sidebar_position: 3
title: Unity Build
description: How GPBT's unity build feature batches translation units to improve compilation throughput.
tags:
  - unity build
  - build performance
  - compilation
---

A unity build (also known as a jumbo or amalgamation build) speeds up compilation by combining multiple `.cpp` files into a single translation unit before handing them to the compiler. This reduces the number of compilation jobs and amortises the cost of parsing common headers across fewer processes.

## Why it matters

In a large engine codebase, each translation unit independently processes all of its included headers. A module with 40 source files that each include a common precompiled header will trigger that header's processing 40 times. With a unity build, those 40 files are batched into groups and processed as a smaller number of larger files, dramatically reducing total parse time.

## Enabling unity build for a module

Call `gpEnableUnityBuild()` inside a target definition:

```cmake
gpStartModule("renderer/core")
  gpEnableUnityBuild()
  gpAddDependency(PUBLIC rhi/base)
gpEndModule()
```

GPBT enables CMake's built-in `UNITY_BUILD` property on the target and sets a batch size of 16 translation units per group.

## Batch size

The default batch size is 16. This means that up to 16 `.cpp` files are merged into a single translation unit. If a module has 48 source files, CMake will generate three unity files, each containing 16 originals.

CMake selects which files to group automatically based on alphabetical ordering within the target's source list.

## When to use it

Unity build is most effective on modules with many small translation units that share a large set of common includes. It is less beneficial for modules with few, large source files, since the compilation time is already dominated by the file contents rather than header parsing.

:::tip
Enable unity build on stable, rarely-changing modules first. Those are the ones where you gain the most throughput without the iteration cost of recompiling a large batch when a single file changes.
:::

## Caveats

Unity builds can expose latent issues in code that was previously hidden by the implicit isolation of separate translation units:

- **Symbol collisions**: Static local variables or anonymous namespace symbols with the same name in different files will conflict when merged.
- **Macro pollution**: A macro defined in one file can affect files merged after it in the same batch.
- **Include order sensitivity**: Code that relies on a specific header being included before another may behave differently in a unified context.

If a module fails to compile with unity build enabled, check for any of the above patterns before disabling it entirely. It is often possible to fix the underlying issue rather than abandoning the optimisation.

:::warning
Do not enable unity build on thirdparty code. Thirdparty libraries rarely guarantee they are safe to merge, and the resulting compilation errors are difficult to diagnose.
:::
