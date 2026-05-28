---
sidebar_position: 3
title: Testing
description: Per-target test infrastructure, supported test frameworks, and CTest integration.
tags:
  - testing
  - cmake
  - ci
---

## Overview

GPBT provides first-class test support via `gpEnableTests()`. When called inside a target definition, GPBT automatically:

1. Discovers C++ source files under `tests/` in the target's directory.
2. Compiles them into a dedicated test executable (`gp-<name>-tests`).
3. Links the executable against the module under test and the selected test framework.
4. Registers it with CTest so `ctest` can run it out of the box.

Test executables are built alongside the rest of the project, no separate CMake invocation is needed.

---

## Selecting a test framework

### Project-wide default

The active framework is controlled by the `GPBT_TEST_FRAMEWORK` cache variable.

| Value | Behaviour |
| --- | --- |
| `NONE` | `gpEnableTests()` is a no-op; no framework is fetched. This is the default for projects that do not call `gpApplyGraphicalPlaygroundDefaultPolicy()`. |
| `GOOGLETEST` | GoogleTest 1.17.0 is fetched and built from source. Test executables link `GTest::gtest_main`. |
| `CATCH2` | Catch2 3.15.0 is fetched and built from source. Test executables link `Catch2::Catch2WithMain`. |
| `CUSTOM` | Link against a target you provide. Set `GPBT_TEST_FRAMEWORK_CUSTOM_TARGET` to its name. |

Both built-in frameworks use the `*WithMain` / `*_main` variant, so test files do not need to define `main()`.

### Using gpApplyGraphicalPlaygroundDefaultPolicy

Calling `gpApplyGraphicalPlaygroundDefaultPolicy()` automatically promotes the framework to `GOOGLETEST` when the project has not provided an explicit override:

```cmake
gpApplyGraphicalPlaygroundDefaultPolicy()  # sets GPBT_TEST_FRAMEWORK=GOOGLETEST if not already set

gpStartBuildTool()
  gpBuildToolAutoScan(thirdparty source)
gpEndBuildTool()
```

An explicit `-DGPBT_TEST_FRAMEWORK=CATCH2` on the CMake command line always wins over the policy default.

### Setting it manually

```cmake
set(GPBT_TEST_FRAMEWORK "GOOGLETEST" CACHE STRING "")

gpStartBuildTool()
  gpBuildToolAutoScan(thirdparty source)
gpEndBuildTool()
```

### Setting it on the command line

```bash
cmake -S . -B build -DGPBT_TEST_FRAMEWORK=CATCH2
```

---

## Enabling tests for a target

### Using the global default

Call `gpEnableTests()` inside any `gpStartModule` / `gpStartExecutable` / `gpStartPlugin` block to opt in using whichever framework `GPBT_TEST_FRAMEWORK` is set to:

```cmake
gpStartModule("runtime/core")
  gpEnableTests()
gpEndModule()
```

### Per-target framework override

Pass `FRAMEWORK <name>` to override the global setting for a specific target. This is useful when different modules in the same project use different testing styles:

```cmake
gpStartModule("runtime/core")
  gpEnableTests(FRAMEWORK GOOGLETEST)
gpEndModule()

gpStartModule("runtime/physics")
  gpEnableTests(FRAMEWORK CATCH2)
gpEndModule()
```

When targets use different frameworks, GPBT registers and builds both. The resolution is:

```text
per-target FRAMEWORK argument  →  global GPBT_TEST_FRAMEWORK
```

### Test source directory layout

Place test source files in a `tests/` subdirectory next to the target's `CMakeLists.txt`:

```text
source/
  runtime/
    core/
      CMakeLists.txt       ← gpEnableTests() lives here
      public/
        MathUtils.hpp
      private/
        MathUtils.cpp
      tests/
        MathUtils.test.cpp ← auto-discovered
        EdgeCases.test.cpp ← all .cpp/.cxx/.cc/.c files are included
```

---

## Test executable naming

For a module named `"runtime/core"`:

| Property | Value |
| --- | --- |
| CMake export name | `gp_runtime_core_tests` |
| Output binary | `gp-runtime-core-tests` |
| IDE folder | `tests/modules` |
| CTest test name | `gp_runtime_core_tests` |

---

## Writing tests

### GoogleTest

```cpp
#include <gtest/gtest.h>
#include "MathUtils.hpp"

TEST(MathUtilsTest, ClampReturnsMin) {
    EXPECT_EQ(Clamp(5, 10, 20), 10);
}

TEST(MathUtilsTest, ClampReturnsMax) {
    EXPECT_EQ(Clamp(25, 10, 20), 20);
}

TEST(MathUtilsTest, ClampReturnsValueWithinRange) {
    EXPECT_EQ(Clamp(15, 10, 20), 15);
}
```

### Catch2

```cpp
#include <catch2/catch_test_macros.hpp>
#include "MathUtils.hpp"

TEST_CASE("Clamp returns boundary values", "[math]") {
    REQUIRE(Clamp(5,  10, 20) == 10);
    REQUIRE(Clamp(25, 10, 20) == 20);
}

TEST_CASE("Clamp returns value within range", "[math]") {
    REQUIRE(Clamp(15, 10, 20) == 15);
}
```

---

## Running tests

```bash
cmake -S . -B build -DGPBT_TEST_FRAMEWORK=GOOGLETEST
cmake --build build
ctest --test-dir build --output-on-failure
```

To run only tests matching a name pattern:

```bash
ctest --test-dir build -R "runtime_core" --output-on-failure
```

---

## Using a custom test framework

Set `GPBT_TEST_FRAMEWORK=CUSTOM` globally, or pass `FRAMEWORK CUSTOM` per-target, and provide the target name:

```cmake
# Bring your own framework target (e.g., via find_package or gpStartThirdparty)
find_package(doctest REQUIRED)

set(GPBT_TEST_FRAMEWORK "CUSTOM" CACHE STRING "")
set(GPBT_TEST_FRAMEWORK_CUSTOM_TARGET "doctest::doctest" CACHE STRING "")

gpStartBuildTool()
  gpBuildToolAutoScan(thirdparty source)
gpEndBuildTool()
```

The custom target must be a valid CMake target before CONFIGURATION phase starts (i.e., resolved before `gpEndBuildTool()` runs).

---

## Overriding the built-in framework version

If you need a different version of GoogleTest or Catch2, declare the package yourself before `gpEndBuildTool()`. GPBT detects the name and skips its built-in registration, using your version instead.

```cmake
# engine/thirdparty/googletest/CMakeLists.txt
gpStartThirdparty("googletest" VERSION "1.15.2")
    gpThirdpartySource(
        URL    "https://github.com/google/googletest/archive/refs/tags/v1.15.2.tar.gz"
        HASH   "SHA256=<your-hash>"
        TARGET "GTest::gtest_main"
    )
    gpThirdpartySetCMakeArgs(
        gtest_force_shared_crt=ON
        INSTALL_GTEST=OFF
    )
gpEndThirdparty()
```

Then in the root `CMakeLists.txt`:

```cmake
set(GPBT_TEST_FRAMEWORK "GOOGLETEST" CACHE STRING "")

gpStartBuildTool()
  gpBuildToolAutoScan(thirdparty source)   # picks up your googletest declaration
gpEndBuildTool()
```

The same pattern works for Catch2, declare `gpStartThirdparty("catch2" ...)` and GPBT will use your version.

---

## Build tool internal tests

GPBT ships its own CMake-level test suite that validates the property scoping system, topological sorting, and string utilities. These are separate from your project's tests and are primarily useful when contributing to the build tool itself.

```bash
cmake -S . -B build -DGPBT_TESTS_ENABLED=ON
cmake --build build
```

Filter to a specific section:

```bash
cmake -S . -B build -DGPBT_TESTS_ENABLED=ON -DGPBT_TESTS_FILTER_SECTION="sort"
```

---

## CI considerations

```bash
cmake -S . -B build \
  -DGPBT_TEST_FRAMEWORK=GOOGLETEST \
  -DGPBT_RUNNING_IN_CI=ON \
  -DGPBT_TREAT_WARNINGS_AS_FATAL=ON \
  -DGPBT_CONFIGURE_DEPENDS=OFF

cmake --build build
ctest --test-dir build --output-on-failure --parallel 4
```

`GPBT_CONFIGURE_DEPENDS=OFF` disables filesystem polling for source file changes, which reduces overhead on CI agents where the source tree does not change between configure and build.
