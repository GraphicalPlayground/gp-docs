---
sidebar_position: 2
title: Scanning
description: How gpBuildToolAutoScan discovers CMakeLists.txt files and registers targets and packages.
tags:
  - scanning
  - auto-discovery
  - cmake
---

`gpBuildToolAutoScan()` discovers all target and thirdparty package declarations in the source tree. Instead of requiring each subdirectory to be explicitly listed in the root `CMakeLists.txt`, GPBT finds them automatically.

## Syntax

```cmake
gpBuildToolAutoScan(dir1 [dir2 ...])
```

Each argument is a directory to search. Paths are relative to the calling `CMakeLists.txt`, or absolute.

## How it works

`gpBuildToolAutoScan()` walks each listed directory using a breadth-first queue. When it finds a subdirectory that contains a `CMakeLists.txt`, it calls `add_subdirectory()` on it. Subdirectories without a `CMakeLists.txt` are themselves queued for further traversal.

The order of the directory arguments to `gpBuildToolAutoScan()` determines the order in which root directories are processed. Within each directory, traversal order depends on the filesystem.

:::note
Scan order does not affect the final configuration order. GPBT sorts all registered targets topologically at the start of the configuration phase, so the order in which they are discovered during scanning is irrelevant to the build.
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

To prevent a directory from being scanned, leave it out of the `gpBuildToolAutoScan()` argument list. There is no explicit exclusion mechanism. The recommended approach is to keep all auto-discovered content under the designated root directories and keep other content (generated code, tools, documentation) outside of them.
