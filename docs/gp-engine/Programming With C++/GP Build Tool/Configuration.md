---
sidebar_position: 2
title: Configuration
description: All GPBT_* cache variables and options, their defaults, and their effects on the build.
tags:
  - configuration
  - cmake
  - options
---

Every adjustable build tool behaviour is exposed as a CMake cache variable. Set them on the command line with `-D`, in a `CMakePresets.json` file, or through your IDE's CMake settings panel.

## Setting a variable

```bash
cmake -S . -B build -DGPBT_LOG_VERBOSE_ENABLED=ON -DGPBT_THIRDPARTY_MODE=SOURCE
```

All variables prefixed with `GPBT_` belong to the build tool. Do not use this prefix in your own project code — a future GPBT version may introduce a conflict.

## General options

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `GPBT_IS_MONOLITHIC` | `BOOL` | `OFF` | Build all modules into a single combined library instead of individual shared objects. |
| `GPBT_CONFIGURE_DEPENDS` | `BOOL` | `ON` | Re-run CMake configure automatically when globbed source files change on disk. Disable in CI to reduce overhead. |
| `GPBT_INSTALL_EXPORT_NAME` | `STRING` | `GPTargets` | Name of the CMake install export set. Change this to match your project's `find_package()` name. |

## Logging options

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `GPBT_LOG_BANNER_ENABLED` | `BOOL` | `ON` | Show the decorative section banners in the configure output. |
| `GPBT_LOG_PREFIX_ENABLED` | `BOOL` | `OFF` | Prepend a `[GPBT]` tag to every log line, useful when mixing with other CMake output. |
| `GPBT_LOG_VERBOSE_ENABLED` | `BOOL` | `OFF` | Print verbose-level messages, including per-target property dumps. |
| `GPBT_TREAT_WARNINGS_AS_FATAL` | `BOOL` | `OFF` | Promote any `WARNING`-level log message to a fatal error. Recommended for CI. |
| `GPBT_TREAT_ERRORS_AS_FATAL` | `BOOL` | `OFF` | Promote any `ERROR`-level log message to a fatal error. |
| `GPBT_DUMP_TARGETS_PROPERTIES` | `BOOL` | `OFF` | Print all registered properties for every target after configuration. Useful when diagnosing unexpected behaviour. |

:::tip
Enable `GPBT_TREAT_WARNINGS_AS_FATAL` in CI pipelines. This catches misconfigured packages or missing hashes before they reach production.
:::

## Dependency graph export

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `GPBT_EXPORT_DEPENDENCY_GRAPH` | `BOOL` | `OFF` | Write a Graphviz DOT file of the target dependency graph at the end of configuration. |
| `GPBT_DEPENDENCY_GRAPH_FILE` | `FILEPATH` | `<build>/gpbt_dependency_graph.dot` | Path where the DOT file is written when graph export is enabled. |

See [Graphviz Generation](./Features/Graphviz%20Generation.md) for details on rendering the output.

## Testing options

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `GPBT_TESTS_ENABLED` | `BOOL` | `OFF` | Configure the build tool's own internal test suite instead of the example targets. |
| `GPBT_TESTS_FILTER_SECTION` | `STRING` | `""` | When set, only run test sections whose name contains this substring. |
| `GPBT_RUNNING_IN_CI` | `BOOL` | `OFF` | Signal to the build tool that it is running inside a CI environment. Enables stricter checks. |

## Thirdparty options

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `GPBT_THIRDPARTY_MODE` | `STRING` | `AUTO` | Default resolution mode for all thirdparty packages. Valid values: `AUTO`, `SOURCE`, `BINARY`. |
| `GPBT_THIRDPARTY_UPDATES_DISCONNECTED` | `BOOL` | `ON` | Skip network checks for already-downloaded packages, dramatically reducing reconfigure time. |

## Compilation options

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| `GPBT_USE_LIBCXX` | `BOOL` | `OFF` | Use LLVM's libc++ instead of the system libstdc++. Recommended when using Clang on Linux. |

See [Third Party Management](./Features/Third%20Party%20Management.md) for a full explanation of these options.
