---
sidebar_position: 9
title: Unit Tests
description: Per-target unit test infrastructure in GPBT, automatic test executable generation, CTest integration, and support for GoogleTest, Catch2, and custom frameworks.
tags:
  - testing
  - unit tests
  - ctest
---

Call `gpEnableTests()` inside a target block. GPBT finds your test sources, compiles them into a test executable, links against your module and the chosen framework, and registers the result with CTest.

For the full reference (framework selection, test naming, writing tests, CI setup, and advanced overrides), see [Testing](../Testing.md).

## Quick start

```cmake
gpStartModule("runtime/core")
  gpEnableTests()
gpEndModule()
```

Put test sources in a `tests/` subdirectory next to the target's `CMakeLists.txt`:

```text
source/
  runtime/
    core/
      CMakeLists.txt
      public/
        MathUtils.hpp
      private/
        MathUtils.cpp
      tests/
        MathUtils.test.cpp
```

GPBT picks up every `.cpp`, `.cxx`, `.cc`, and `.c` file under `tests/`, compiles them into `gp-runtime-core-tests`, and registers it with CTest.

## Framework selection

`GPBT_TEST_FRAMEWORK` selects the framework (`GOOGLETEST`, `CATCH2`, `CUSTOM`, or `NONE`; the default is `NONE`). Projects that call `gpApplyGraphicalPlaygroundDefaultPolicy()` get GoogleTest automatically.

To override the framework for a single target without touching the project-wide setting, pass `FRAMEWORK`:

```cmake
gpStartModule("runtime/core")
  gpEnableTests(FRAMEWORK GOOGLETEST)
gpEndModule()

gpStartModule("runtime/physics")
  gpEnableTests(FRAMEWORK CATCH2)
gpEndModule()
```

If different targets request different frameworks, GPBT registers and builds all of them.

## What GPBT generates

For `gpStartModule("runtime/core")` with `gpEnableTests()`:

| Property | Value |
| --- | --- |
| CMake export name | `gp_runtime_core_tests` |
| Output binary | `gp-runtime-core-tests` |
| IDE folder | `tests/modules` |
| CTest test name | `gp_runtime_core_tests` |

The test binary links against the module's public interface, inherits the active build-type compile definitions, and runs from its own output directory under CTest.

## Running tests

```bash
cmake -S . -B build -DGPBT_TEST_FRAMEWORK=GOOGLETEST
cmake --build build
ctest --test-dir build --output-on-failure
```

## Relationship to the build tool's own tests

GPBT ships its own CMake-level test suite that validates the property scoping system, topological sort, and string utilities. That suite is controlled by `GPBT_TESTS_ENABLED` and is entirely separate from per-target unit tests. See [Testing](../Testing.md#build-tool-internal-tests).
