---
sidebar_position: 8
title: Shader Pipeline Integration
description: Planned support for integrating GPU shader compilation (HLSL, GLSL, MSL) into the GPBT CMake build graph.
tags:
  - shaders
  - hlsl
  - glsl
  - planned
---

:::note Planned Feature
Shader pipeline integration is planned for a future release. This page documents the intended design.
:::

## Motivation

GPU shaders are a first-class part of a game engine's codebase, but they are often compiled outside the main build system, through ad-hoc scripts or separate tooling. That creates real problems: stale shader artefacts, no dependency tracking between shaders and the C++ code that loads them, and inconsistent optimisation settings across build configurations.

GPBT's shader pipeline integration aims to bring shaders into the CMake build graph with the same dependency tracking, platform awareness, and per-configuration control as regular C++ targets.

## Planned design

Shader source files will be registered against a module the same way as regular sources:

```cmake
gpStartModule("rhi/d3d12")
  gpAddSourceDirectory(private)
  gpAddShaderFile(shaders/Fullscreen.hlsl STAGE vertex)
  gpAddShaderFile(shaders/Fullscreen.hlsl STAGE pixel)
gpEndModule()
```

GPBT will invoke the correct shader compiler for the target platform, DXC for HLSL on Windows, glslangValidator for GLSL, the Xcode Metal toolchain for MSL, and embed or install the compiled artefacts alongside the module binary.

## Planned shader compiler support

| Language | Compiler | Platforms |
| --- | --- | --- |
| HLSL | DXC | Windows, Vulkan (cross-platform) |
| GLSL | glslangValidator | Vulkan (all platforms) |
| MSL | Xcode Metal toolchain | macOS, iOS |

## Planned per-configuration behaviour

Shaders will respect the same four build configurations as C++ code. In `Debug` and `Development` they will be compiled with debug symbols and optimisations off. In `Profile` and `Shipping`, full optimisation will be applied.
