---
sidebar_position: 9
title: Unit Tests
description: Per-target unit test infrastructure in GPBT (reserved for a future release).
tags:
  - testing
  - unit tests
  - planned
---

GPBT reserves per-target unit test infrastructure for a future release. The `gpEnableTests()` macro is available today and records intent without generating test targets.

## Current behaviour

```cmake
gpStartModule("math")
  gpEnableTests()
gpEndModule()
```

Calling `gpEnableTests()` records that the `math` module has a test suite. This has no visible effect on the generated build system at this time.

## Planned behaviour

When fully implemented, `gpEnableTests()` will configure a companion test target that compiles sources from a `tests/` subdirectory alongside the module under test. The test target will be linked against the module and against a registered test framework.

The `GPBT_TESTS_FILTER_SECTION` variable will apply to per-target tests in the same way it applies to the build tool's own internal tests: only sections whose name contains the filter string will execute.

## Relationship to the build tool's own tests

The build tool ships with its own internal test suite activated by `GPBT_TESTS_ENABLED`. This is a separate facility from per-target unit tests and is primarily useful when contributing to the build tool itself. See [Testing](../Testing.md) for details.

:::note
Code that calls `gpEnableTests()` today will automatically gain test target generation when the feature ships, without any modification.
:::
