---
title: Severity
description: Error severity for C++ API
tags:
    - c++
    - errors
---

[`error_severity.hpp`](https://github.com/GraphicalPlayground/gp-engine/blob/main/src/runtime/core/public/errors/error_severity.hpp)

# Error Severity

The `gp::error::severity` system defines a standardized hierarchy for categorizing diagnostics, logs, and failure states across the Graphical Playground engine.
It provides the metadata necessary to drive log coloring, automated debugger attachment, and process lifecycle management.

## The Severity Hierarchy

The engine uses a tiered approach to severity. Because `gp::error::severity` has [**Comparison Operations**](../utils/enums.md#comparison-operators) enabled, you can easily filter logic based on thresholds (e.g., `if (level >= severity::error)`).

| Level              | Identifier                           | Description                                                                                               |
|--------------------|--------------------------------------|-----------------------------------------------------------------------------------------------------------|
| Trace              | `severity::trace`                    | Extremely verbose internal tracing. Automatically stripped from non-debug builds for performance.         |
| Debug              | `severity::debug`                    | General developer diagnostics used during active feature development.                                     |
| Info               | `severity::info`                     | High-level milestones, such as "Renderer Initialized" or "Level Loaded."                                  |
| Warning            | `severity::warning`                  | Recoverable anomalies. Execution continues, but performance or behavior might be sub-optimal.             |
| Error              | `severity::error`                    | Non-fatal failure. A subsystem (like Audio) may have failed, but the engine remains alive.                |
| Fatal              | `severity::fatal`                    | Unrecoverable subsystem failure. Triggers a controlled shutdown sequence.                                 |
| Critical           | `severity::critical`                 | Immediate abort. Used for hardware faults or memory corruption where a graceful shutdown is impossible.   |

## API Usage

### Convenience Aliases

While the enum is scoped as `gp::error::severity`, the namespace provides direct aliases for cleaner call sites:

```cpp showLineNumbers
using namespace gp::error;

void log(severity level, gp::string_view message);

log(severity::info, "Starting engine..."); 
log(info, "Starting engine..."); // Equivalent via alias
```

### Metadata Retrieval

The system provides a set of `constexpr` functions to retrieve UI and behavior metadata based on the severity level.

```cpp
severity level = severity::error;

// Get "ERR"
gp::string_view shortName = get_severity_name(level);

// Get "ERROR"
gp::string_view displayName = get_severity_display(level);

// Get ANSI escape code for terminal colors
gp::string_view color = get_severity_ansi_color(level);
```

## Behavioral Logic

The severity level does more than just label a message; it dictates how the engine reacts to the event.

### Debugger Interruption

The function `does_severity_breaks_debugger(level)` returns true for **Error**, **Fatal**, and **Critical**.

When these levels are triggered, the engine will attempt to fire a `__debugbreak()` or `SIGTRAP` if a debugger is attached, allowing the developer to inspect the call stack immediately at the point of failure.

### Process Abort

The function `does_severity_aborts_process(level)` returns true for **Fatal** and **Critical**.

- **Fatal**: Suggests the engine should stop current execution and exit cleanly.
- **Critical**: Suggests an immediate `std::abort()` to prevent further data corruption.

## Implementation Details

### Metadata Table

Internally, all metadata is stored in a `constexpr` lookup table, ensuring $O(1)$ access with no heap allocations.

```cpp showLineNumbers
struct severity_meta
{
    gp::string_view name;               // "TRC", "INF", etc.
    gp::string_view display;            // "TRACE", "INFO", etc.
    gp::string_view ansi_color;         // Terminal color codes
    bool breaks_debugger;
    bool aborts_process;
};
```

### Concept Integration

`gp::error::severity` is registered with the engine's [comparison traits](../utils/enums.md#comparison-operators):

```cpp
GP_ENABLE_ENUM_COMPARISON_OPERATIONS(gp::error::severity);
```

This allows you to use the full suite of comparison operators (`<`, `<=`, `>`, `>=`) to create log filters or early-exit gates based on a minimum required severity.
