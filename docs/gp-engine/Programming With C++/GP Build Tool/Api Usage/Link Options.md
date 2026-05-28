---
sidebar_position: 9
title: Link Options
description: How to add linker flags to a target with controlled visibility.
tags:
  - link options
  - linker flags
  - cmake
---

`gpAddLinkOption()` adds linker flags to a target. As with other GPBT APIs, GPBT already applies the correct per-linker and per-configuration flags automatically. Use this API for module-specific linker requirements.

## Syntax

```cmake
gpAddLinkOption(visibility flag [flag2 ...])
```

`visibility` is one of `PUBLIC`, `PRIVATE`, or `INTERNAL`.

## Common use cases

### Version scripts and symbol visibility

On Linux, you may want to restrict which symbols a shared library exports:

```cmake
gpStartModule("renderer/core")
  if(UNIX AND NOT APPLE)
    gpAddLinkOption(PRIVATE "-Wl,--version-script=${CMAKE_CURRENT_LIST_DIR}/renderer_core.map")
  endif()
gpEndModule()
```

### Subsystem selection on Windows

```cmake
gpStartExecutable("launcher")
  if(WIN32)
    gpAddLinkOption(PRIVATE /SUBSYSTEM:WINDOWS)
  endif()
gpEndExecutable()
```

:::tip
For GUI executables on Windows, prefer `gpSetGuiExecutable()` rather than adding `/SUBSYSTEM:WINDOWS` manually. See [Executable Specific](./Executable%20Specific.md) for details.
:::

### Forcing library inclusion

```cmake
gpStartModule("platform")
  if(UNIX AND NOT APPLE)
    gpAddLinkOption(PRIVATE -ldl -lpthread)
  endif()
gpEndModule()
```

## Configuration-specific link options

Generator expressions work the same way as for compile options:

```cmake
gpStartModule("core")
  gpAddLinkOption(PRIVATE "$<$<CONFIG:Shipping>:-Wl,--gc-sections>")
gpEndModule()
```

## Visibility reference

| Visibility | Effect |
| --- | --- |
| `PUBLIC` | Applied to this target and propagated to all dependents |
| `PRIVATE` | Applied to this target only |
| `INTERNAL` | Applied to this target and modules connected via INTERNAL dependency edges |
