---
sidebar_position: 5
title: Sanitizers
description: Per-build sanitizer support for AddressSanitizer, ThreadSanitizer, MemorySanitizer, and UndefinedBehaviorSanitizer.
tags:
  - sanitizers
  - asan
  - tsan
  - msan
  - ubsan
  - debugging
---

GPBT has four sanitizer options that apply to every target in Debug, Development, and Profile builds when enabled.

## Enabling sanitizers

Pass the options on the CMake command line or in a `CMakePresets.json` preset:

```bash
# Enable AddressSanitizer
cmake -S . -B build -DGPBT_SANITIZER_ADDRESS=ON

# Enable UndefinedBehaviorSanitizer
cmake -S . -B build -DGPBT_SANITIZER_UNDEFINED_BEHAVIOR=ON

# ASan and UBSan can be combined
cmake -S . -B build -DGPBT_SANITIZER_ADDRESS=ON -DGPBT_SANITIZER_UNDEFINED_BEHAVIOR=ON
```

Sanitizers apply to all targets with no per-target opt-out. An uninstrumented library can hide violations from the sanitizer runtime, which makes partial coverage useless.

## Available sanitizers

### AddressSanitizer (ASan)

```bash
-DGPBT_SANITIZER_ADDRESS=ON
```

Detects buffer overflows (heap, stack, global), use-after-free, use-after-return, and use-after-scope. Runtime overhead is roughly 2x memory and 1.5–2x CPU.

GPBT also adds `-fno-omit-frame-pointer` so stack traces are accurate.

### ThreadSanitizer (TSan)

```bash
-DGPBT_SANITIZER_THREAD=ON
```

Detects data races and lock-order inversions at runtime. Overhead is roughly 5–15x CPU and 5–10x memory. Mutually exclusive with ASan and MSan.

### MemorySanitizer (MSan)

```bash
-DGPBT_SANITIZER_MEMORY=ON
```

Detects reads from uninitialized memory. Requires Clang and an instrumented libc, which limits it to Linux. Not supported with GCC, on macOS, or on Windows. Mutually exclusive with ASan and TSan.

GPBT also adds `-fno-omit-frame-pointer` alongside `-fsanitize=memory`.

### UndefinedBehaviorSanitizer (UBSan)

```bash
-DGPBT_SANITIZER_UNDEFINED_BEHAVIOR=ON
```

Detects signed integer overflow, null pointer dereferences, misaligned accesses, out-of-bounds array indexing, invalid casts, and other C++ undefined behavior. Can run alongside ASan or TSan.

## Mutual exclusion

ASan, TSan, and MSan share a runtime interception layer and cannot run together. Enabling more than one produces a fatal configure error:

```
CMake Error: GPBT_SANITIZER_ADDRESS and GPBT_SANITIZER_THREAD are mutually exclusive.
```

UBSan does not share the interception layer and can be combined with any of the three.

## Configuration scope

Sanitizers run in `Debug`, `Development`, and `Profile` builds. `Shipping` always excludes them. Three things in `Shipping` break sanitizers:

- LTO (`-flto=thin`, `-flto=auto`) is incompatible with ASan/TSan/MSan runtimes.
- `-ffast-math` produces false positives for UBSan on intentional floating-point patterns.
- `-fomit-frame-pointer` breaks stack trace symbolication.

## Platform support

| Sanitizer | Linux (GCC) | Linux (Clang) | macOS (Clang) | Windows (MSVC) | Windows (Clang-CL) |
| --- | --- | --- | --- | --- | --- |
| ASan | Yes | Yes | Yes | Yes | Yes |
| TSan | Yes | Yes | Yes | No | No |
| MSan | No | Yes | No | No | No |
| UBSan | Yes | Yes | Yes | No | No |

On Windows, only ASan works, via `/fsanitize=address`. The compiler links the ASan runtime automatically; no linker flag is needed. GPBT skips TSan, MSan, and UBSan with a configure-time warning.

MSan is also skipped on macOS with a configure-time warning. The Apple libc is not instrumented, so the MSan runtime cannot observe memory through system calls.

## See also

- [Configuration](../Configuration.md): full option reference
- [Compiler Support](../Supports/Compiler%20Support.md): per-compiler flag details
- [Linker Support](../Supports/Linker%20Support.md): sanitizer runtime linking
