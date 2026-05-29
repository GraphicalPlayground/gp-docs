---
sidebar_position: 7
title: Compile Definitions
description: How to add preprocessor definitions to a target with controlled visibility.
tags:
  - compile definitions
  - preprocessor
  - cmake
---

Preprocessor definitions (`-DFOO`, `-DFOO=1`, and so on) are added with `gpAddCompileDefinition()`. Visibility works the same way as `gpAddDependency()`: `PUBLIC` definitions propagate to dependents, `PRIVATE` ones stay local.

## Syntax

```cmake
gpAddCompileDefinition(visibility definition [definition2 ...])
```

`visibility` is one of `PUBLIC`, `PRIVATE`, or `INTERNAL`.

## Basic usage

```cmake
gpStartModule("platform/win32")
  gpAddCompileDefinition(PUBLIC  GP_PLATFORM_WINDOWS=1)
  gpAddCompileDefinition(PRIVATE WIN32_LEAN_AND_MEAN)
  gpAddCompileDefinition(PRIVATE NOMINMAX)
gpEndModule()
```

`GP_PLATFORM_WINDOWS` is visible to any module that depends on `platform/win32`. `WIN32_LEAN_AND_MEAN` and `NOMINMAX` stay private to this module.

## Configuration-specific definitions

Use CMake generator expressions to apply definitions only for certain build configurations:

```cmake
gpStartModule("core")
  gpAddCompileDefinition(PUBLIC "$<$<CONFIG:Debug>:GP_ENABLE_ASSERTS=1>")
  gpAddCompileDefinition(PUBLIC "$<$<CONFIG:Development>:GP_ENABLE_ASSERTS=1>")
  gpAddCompileDefinition(PUBLIC "$<$<CONFIG:Shipping>:GP_STRIP_LOGGING=1>")
gpEndModule()
```

## Platform-conditional definitions

Standard CMake conditions work inside a target definition. Because definitions are recorded during the registration phase (a normal CMake include), conditions like `if(WIN32)` are evaluated at configure time and are always correct.

```cmake
gpStartModule("renderer/core")
  if(WIN32)
    gpAddCompileDefinition(PRIVATE GP_RENDERER_D3D12)
  elseif(APPLE)
    gpAddCompileDefinition(PRIVATE GP_RENDERER_METAL)
  else()
    gpAddCompileDefinition(PRIVATE GP_RENDERER_VULKAN)
  endif()
gpEndModule()
```

## Visibility reference

| Visibility | Effect |
| --- | --- |
| `PUBLIC` | Applied to this target and propagated to all dependents |
| `PRIVATE` | Applied to this target only |
| `INTERNAL` | Applied to this target and propagated to modules connected via INTERNAL dependency edges |
