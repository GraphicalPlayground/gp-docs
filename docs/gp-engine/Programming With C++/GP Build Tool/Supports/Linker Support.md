---
sidebar_position: 3
title: Linker Support
description: Supported linkers, how GPBT selects them automatically, and the flags applied per linker.
tags:
  - linkers
  - lld
  - ld
  - ld64
  - msvc
---

GPBT selects and configures the linker automatically based on the active compiler and platform. You can override the selection if needed, but in practice most projects never need to.

## Supported linkers

| Linker | Platforms | Used with |
| --- | --- | --- |
| MSVC Link | Windows | MSVC |
| LLD | Windows (Clang), Linux, Android | Clang |
| LD64 | macOS, iOS | Clang (Apple) |
| LD | Linux, FreeBSD | GCC |

## Automatic selection

The linker is selected using the following logic:

1. If the compiler is MSVC, use MSVC Link.
2. If the compiler is Clang and the platform is macOS or iOS, use LD64 (Apple's system linker).
3. If the compiler is Clang on any other platform, use LLD. The `-fuse-ld=lld` flag forces LLD over the system-default GNU ld.
4. If the compiler is GCC, use LD (GNU ld).

This is applied automatically.

## Overriding the linker

To use a different linker, pass `GPBT_LINKER` on the CMake command line:

```bash
cmake -S . -B build -DGPBT_LINKER=lld
```

Valid values are `lld`, `ld`, `ld64`, `msvc-link`, and `default` (uses the compiler's default linker without any explicit flags).

## Flags applied per linker

GPBT applies linker-specific flags per configuration. These complement the compiler-level LTO flags.

### LLD

| Configuration | Key flags |
| --- | --- |
| All | `-fuse-ld=lld` |
| Shipping | `-Wl,--gc-sections`, `-Wl,-O3`, `-Wl,--as-needed`, `-flto=thin` |
| Non-Shipping (when ASan enabled) | `-fsanitize=address` |
| Non-Shipping (when TSan enabled) | `-fsanitize=thread` |
| Non-Shipping (when MSan enabled) | `-fsanitize=memory` (Linux only) |
| Non-Shipping (when UBSan enabled) | `-fsanitize=undefined` |

### LD (GNU)

| Configuration | Key flags |
| --- | --- |
| All | `-Wl,--gc-sections` |
| Shipping | `-Wl,-O3`, `-Wl,--as-needed`, `-flto=auto` |
| Non-Shipping (when ASan enabled) | `-fsanitize=address` |
| Non-Shipping (when TSan enabled) | `-fsanitize=thread` |
| Non-Shipping (when UBSan enabled) | `-fsanitize=undefined` |

### MSVC Link

| Configuration | Key flags |
| --- | --- |
| Shipping | `/LTCG`, `/OPT:REF`, `/OPT:ICF` |

When `/fsanitize=address` is in the compile options, the compiler links the ASan runtime automatically. No linker flag is needed.

### LD64

| Configuration | Key flags |
| --- | --- |
| Shipping | `-Wl,-dead_strip`, `-flto=thin` |
| Non-Shipping (when ASan enabled) | `-fsanitize=address` |
| Non-Shipping (when TSan enabled) | `-fsanitize=thread` |
| Non-Shipping (when UBSan enabled) | `-fsanitize=undefined` |

`-dead_strip` is Apple's equivalent of `--gc-sections` for Mach-O targets. `-flto=thin` mirrors the compile-time ThinLTO flag set by the Clang compiler policy. MSan is absent from the table because the Apple libc is not instrumented; GPBT never emits that flag on Darwin.

## Why LLD on Clang?

LLD is meaningfully faster than GNU ld on large codebases, particularly for debug builds where significant amounts of DWARF debug information must be processed. Forcing LLD when using Clang on Linux and Windows gives consistent link times without any per-project configuration.

On macOS and iOS, LD64 is the right choice because it handles Apple-specific binary formats (`Mach-O`, code signing, fat binaries) that LLD does not fully support in all cases.
