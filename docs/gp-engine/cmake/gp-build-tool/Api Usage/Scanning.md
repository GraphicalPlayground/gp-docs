---
sidebar_position: 2
title: Scanning
description: How gpBuildToolAutoScan discovers CMakeLists.txt files and registers targets and packages.
tags:
  - scanning
  - auto-discovery
  - cmake
---

`gpBuildToolAutoScan()` is the mechanism by which GPBT discovers all target and thirdparty package declarations in the source tree. Rather than requiring each subdirectory to be explicitly listed in the root `CMakeLists.txt`, GPBT finds them automatically.

## Syntax

```cmake
gpBuildToolAutoScan(dir1 [dir2 ...])
```

Each argument is a directory to search. Paths are relative to the calling `CMakeLists.txt`, or absolute.

## How it works

`gpBuildToolAutoScan()` performs a recursive search for `CMakeLists.txt` files under each listed directory. Every file found is `include()`d in the context of the current CMake scope. This means all `gpStart*` macros in those files execute during the registration phase and are recorded into the global property store.

The scan order within a directory is alphabetical by path. The order of the directory arguments to `gpBuildToolAutoScan()` determines the order in which directories are processed.

:::note
Scan order does not affect the final configuration order. GPBT sorts all registered targets topologically at the start of the configuration phase, so the order they are discovered during scanning is irrelevant to the build.
:::

## Standard project layout

The conventional layout for a Graphical Playground project is:

```text
my-engine/
  CMakeLists.txt          <- gpBuildToolAutoScan(thirdparty source)
  thirdparty/
    nlohmann-json/
      CMakeLists.txt      <- gpStartThirdparty("nlohmann-json" ...)
    d3d12/
      CMakeLists.txt      <- gpStartThirdparty("d3d12" ...)
  source/
    runtime/
      core/
        CMakeLists.txt    <- gpStartModule("core")
      rhi/
        base/
          CMakeLists.txt  <- gpStartModule("rhi/base")
```

Both `thirdparty` and `source` are passed to `gpBuildToolAutoScan()` so all packages and modules are discovered in a single pass.

## Excluding directories

To prevent a directory from being scanned, do not include it in the `gpBuildToolAutoScan()` argument list. There is no explicit exclusion mechanism; the recommended approach is to keep all auto-discovered content under the designated root directories and keep other content (generated code, tools, documentation) outside of them.
