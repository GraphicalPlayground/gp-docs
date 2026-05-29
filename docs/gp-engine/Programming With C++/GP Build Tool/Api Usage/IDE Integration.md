---
sidebar_position: 12
title: IDE Integration
description: How to organise targets into IDE folders and create additional CMake aliases for a target.
tags:
  - ide
  - folders
  - aliases
  - visual studio
  - xcode
---

GPBT provides two macros for controlling how targets appear in IDEs and how they can be referenced in CMake.

## Organising targets into IDE folders

```cmake
gpSetFolder(folderPath)
```

Sets the `FOLDER` property on the current target. Most IDEs (Visual Studio, Xcode, CLion) use this to organise targets into a tree in the solution or project navigator.

```cmake
gpStartModule("rhi/d3d12")
  gpSetFolder("Engine/RHI")
  gpAddDependency(PUBLIC rhi/base)
gpEndModule()
```

The path uses `/` as a separator and creates nested folders automatically:

```text
Engine/
  RHI/
    gp-rhi-d3d12    <- appears here in Visual Studio
    gp-rhi-base
  Runtime/
    gp-core
```

If `gpSetFolder()` is not called, the target appears at the root of the solution tree.

:::tip
Group thirdparty and build-tool targets under a `_Build` or `External` folder to keep them out of the way when navigating source targets. This is a common convention that makes large solution files much easier to work in.
:::

## Adding CMake aliases

```cmake
gpAddAlias(aliasName)
```

Creates an additional CMake alias for the current target. GPBT always creates a default alias following the `gp::<name>` pattern. Use `gpAddAlias()` when you need an extra alias for a `find_package()` consumer or a specific naming convention.

```cmake
gpStartModule("math/linear-algebra")
  gpAddAlias("gp::math")         # short alias for common use
  gpAddAlias("MyEngine::Math")   # consumer-facing alias for downstream projects
gpEndModule()
```

All aliases point to the same underlying CMake target, so there's no overhead to having multiple.
