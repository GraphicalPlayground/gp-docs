---
title: Configuration
description: Configuration settings for the Error System policy
tags:
    - c++
    - errors
    - configuration
---

[`error_config.hpp`](https://github.com/GraphicalPlayground/gp-engine/blob/main/src/runtime/core/public/errors/error_config.hpp)

# Error Configuration

The `gp::error::config` struct is the central policy hub for the **Graphical Playground** error system. It defines how the engine behaves when an error occurs-determining whether to capture a call stack,
trigger a debugger breakpoint, deduplicate recurring logs, or shut down the process.

## Configuration Categories

The configuration is divided into specialized sub-structs to manage different aspects of the error-handling pipeline.

### 1. Stacktrace Settings (`stacktrace_s`)

Controls the expensive operation of walking the call stack.
- `capture_from`: The minimum severity required to trigger a stack capture.
- `max_frames`: Limits the depth of the trace to balance detail vs. performance.
- `skip_frames`: Number of frames to ignore from the top of the stack. This is typically used to hide the internal error-reporting functions so the trace starts exactly where the error was triggered.
- `enabled`: Master toggle. Usually disabled in Shipping builds to reclaim CPU cycles.

### 2. Breakpoint Settings (`breakpoint_s`)

Manages interaction with native debuggers (Visual Studio, GDB, LLDB).
- `break_from`: Severity threshold to trigger a hardware breakpoint.
- `check_is_debugged`: If true, the engine checks if a debugger is actually attached before breaking. This prevents the "Capture Instance" from hanging or crashing in automated environments like CI/CD.

### 3. Abort Settings (`abort_s`)

Defines the "Point of No Return."
- `abort_from`: Severity threshold that forces a process exit.
- `use_terminate`: If true, calls `std::terminate()` (which can trigger cleanup) instead of the immediate `std::abort()`.
- `flush_before_abort`: Ensures all active log sinks (like files or consoles) write their remaining buffers to disk before the process dies.

### 4. Filter Settings (`filter_s`)

The first line of defense against performance degradation and log spam.
- `global_min_severity`: Any record below this level is discarded immediately.
- `de_duplicate`: If enabled, the system tracks identical errors (same message, code, and thread). If the same error occurs multiple times within the `de_duplicate_window_ms`, only the first instance is recorded.

## Environment Presets

The system provides four static factory methods to quickly initialize the engine based on the current build target.

| Preset          | Purpose          | Key Behavior                                                             |
|-----------------|------------------|--------------------------------------------------------------------------|
| development()   | Active coding    | Verbose tracing, breaks on Errors, captures everything.                  |
| qa()            | Staging/Testing  | No debug breaks, deduplication enabled, moderate filtering.              |
| shipping()      | Final Product    | Minimal overhead, stacktraces disabled, global minimum set to Warning.   |
| test()          | Unit Testing     | Silent console, captures only Fatal/Critical to avoid test spam.         |

### Usage Example

```cpp
// Initialize the error system with the Shipping policy
gp::error::config my_config = gp::error::config::shipping();

// Manually override a specific setting if needed
my_config.filter.de_duplicate = false;

gp::error::system::initialize(my_config);
```

## Key Performance Considerations

1. **Deduplication**: In a high-end engine, a failing system in a 144Hz render loop could generate thousands of logs per second. Enabling `de_duplicate` is critical to prevent the disk I/O from stalling the main thread.
2. **Stacktrace Overhead**: Capturing a stack trace is a heavy kernel-level operation. Use `stacktrace.capture_from` wisely; capturing traces for `severity::info` or `severity::trace` will significantly degrade frame rates.
3. **Global Minimum**: Use `global_min_severity` to strip out development-only "Trace" messages in release builds, ensuring the CPU doesn't waste time formatting strings that will never be seen.
