---
sidebar_position: 1
title: Build Tool Lifecycle
description: How to set up the root CMakeLists.txt, apply default policies, and start and end the build tool session.
tags:
  - cmake
  - lifecycle
  - setup
---

Every project that uses GPBT must perform three setup steps in its root `CMakeLists.txt`: apply the default policy, open a build tool session, and scan the source tree.

## Apply the default policy

```cmake
gpApplyGraphicalPlaygroundDefaultPolicy()
```

This macro applies the standard Graphical Playground project settings:

- Enforces C++23 with no compiler extensions (`CMAKE_CXX_EXTENSIONS OFF`)
- Sets output directories to `binaries/bin` and `binaries/lib` under the source root
- Creates per-configuration subdirectories (`binaries/bin/Debug`, `binaries/bin/Shipping`, and so on)
- Enables Position-Independent Code (PIC) for static libraries

Call this macro once, before `gpStartBuildTool()`, from the root `CMakeLists.txt`.

:::tip
`gpApplyGraphicalPlaygroundDefaultPolicy()` is intentionally not called automatically. This gives you the flexibility to apply your own settings first, or to override specific variables after calling it.
:::

## Open a build tool session

```cmake
gpStartBuildTool()
```

Calling `gpStartBuildTool()` initialises the build tool state and enters the registration phase. All target and thirdparty declarations that follow are accumulated into the global property store rather than creating CMake targets immediately.

:::warning
`gpStartBuildTool()` may only be called once per CMake configure run. Calling it a second time produces a fatal error.
:::

## Scan and end

```cmake
gpBuildToolAutoScan(thirdparty source)
gpEndBuildTool()
```

`gpBuildToolAutoScan()` recursively discovers all `CMakeLists.txt` files under the listed directories and includes them, populating the target registry. See [Scanning](./Scanning.md) for details.

`gpEndBuildTool()` closes the session and triggers the configuration phase:

1. Thirdparty packages are resolved (SYSTEM, BINARY, or SOURCE).
2. Targets are sorted topologically by dependency order.
3. Each target's `CMakeLists.txt` is re-included to create the actual CMake targets.
4. The CMake install export set is written.

## Minimal root CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.28)
project(my-engine)

list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/vendor/gp-build-tool/source")
include(gp-build-tool)

gpApplyGraphicalPlaygroundDefaultPolicy()

gpStartBuildTool()
  gpBuildToolAutoScan(thirdparty source)
gpEndBuildTool()
```

## What gets installed

At the end of `gpEndBuildTool()`, all configured targets are registered to the CMake install export set named by `GPBT_INSTALL_EXPORT_NAME` (default: `GPTargets`). This allows downstream projects to consume your engine via `find_package()`.

The export file is installed to `lib/cmake/${GPBT_INSTALL_EXPORT_NAME}/` relative to the install prefix.
