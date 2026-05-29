---
sidebar_position: 10
title: Miscellaneous Options
description: Additional per-target options including header-only targets, precompiled headers, strict warning control, static and shared linking, and test infrastructure.
tags:
  - options
  - header-only
  - precompiled headers
  - cmake
---

This page covers the remaining per-target options that don't belong to a specific API group.

## Header-only modules

```cmake
gpSetHeaderOnly()
```

Marks the current module as header-only. GPBT creates a CMake `INTERFACE` library rather than a compiled library. No source files are compiled; only the `public/` and `internal/` headers are part of the target.

```cmake
gpStartModule("math/types")
  gpSetHeaderOnly()
gpEndModule()
```

## Precompiled headers

```cmake
gpAddPrecompiledHeader(headerFile)
```

Adds a precompiled header to the current target. The path is relative to the target directory unless it is absolute.

```cmake
gpStartModule("renderer/core")
  gpAddPrecompiledHeader(private/RendererPCH.hpp)
gpEndModule()
```

CMake's `target_precompile_headers()` is used internally. Precompiled headers work best when the header pulls in a large set of stable system or engine headers that most translation units in the module already include.

## Strict warning control

GPBT applies strict warnings (`-Wall -Wextra -Werror` on Clang and GCC, `/W4 /WX` on MSVC) to all targets by default. For thirdparty code or legacy modules that can't currently compile warning-free, use:

```cmake
gpDisableStrictWarnings()
```

This removes the strict warning flags for the current target only. It has no effect on any other target.

```cmake
gpStartModule("thirdparty/legacy-physics")
  gpDisableStrictWarnings()
gpEndModule()
```

:::tip
Use `gpDisableStrictWarnings()` only as a short-term measure. The long-term goal should be to fix the warnings and re-enable strict mode.
:::

## Static and shared linking

By default, the linking mode of each module follows the `GPBT_IS_MONOLITHIC` setting. You can override this per-target:

```cmake
gpSetStatic()   # Force this module to link as a static library
gpSetShared()   # Force this module to link as a shared library
```

Use `gpSetStatic()` for modules that are intentionally always-static, such as those containing only template instantiations or constexpr tables. Use `gpSetShared()` for plugin interfaces that must always be a shared library regardless of the global linking mode.

## Unity build

```cmake
gpEnableUnityBuild()
```

See [Unity Build](../Features/Unity%20Build.md) for a full explanation.

## Unit tests

```cmake
gpEnableTests()
gpEnableTests(FRAMEWORK <GOOGLETEST|CATCH2|CUSTOM>)
```

Enables unit tests for the current target. GPBT discovers `.cpp`, `.cxx`, `.cc`, and `.c` files under the target's `tests/` subdirectory, compiles them into a test executable, links it against the module and the active framework, and registers it with CTest.

```cmake
gpStartModule("runtime/core")
  gpEnableTests()
gpEndModule()
```

Pass `FRAMEWORK` to override `GPBT_TEST_FRAMEWORK` for this target only. Different modules in the same project can mix frameworks:

```cmake
gpStartModule("runtime/core")
  gpEnableTests(FRAMEWORK GOOGLETEST)
gpEndModule()

gpStartModule("runtime/physics")
  gpEnableTests(FRAMEWORK CATCH2)
gpEndModule()
```

See [Unit Tests](../Features/Unit%20Tests.md) for a quick start and [Testing](../Testing.md) for the full reference.

## Benchmark and example infrastructure

Not yet implemented. These macros record intent but don't generate targets:

```cmake
gpEnableBenchmarks()  # Module has a benchmarks/ subdirectory
gpEnableExamples()    # Module has an examples/ subdirectory
```

See [Benchmarks](../Features/Benchmarks.md) for the planned behaviour.
