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

GPBT selects and configures the linker automatically based on the active compiler and platform. You can override the selection if needed.

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
3. If the compiler is Clang on any other platform, use LLD. The `-fuse-ld=lld` flag is added to force LLD over any system-default GNU ld.
4. If the compiler is GCC, use LD (GNU ld).

This policy is applied automatically. You do not need to configure it.

## Overriding the linker

To use a different linker, set `GPBT_LINKER` on the CMake command line:

```bash
cmake -S . -B build -DGPBT_LINKER=lld
```

Valid values are `lld`, `ld`, `ld64`, `msvc-link`, and `default` (no-op, uses the compiler's default linker without any explicit flags).

## Flags applied per linker

GPBT applies linker-specific flags for each configuration. These complement the compiler-level LTO flags.

### LLD

| Configuration | Key flags |
| --- | --- |
| All | `-fuse-ld=lld` |
| Profile, Shipping | `-flto=thin` (mirrors the compiler LTO flag) |

### LD (GNU)

| Configuration | Key flags |
| --- | --- |
| Profile, Shipping | `-flto` (mirrors the compiler LTO flag) |

### MSVC Link

| Configuration | Key flags |
| --- | --- |
| Profile, Shipping | `/LTCG` (whole-program optimisation) |

### LD64

LD64 is controlled entirely through Clang's frontend flags. No separate linker flags are added beyond what the Clang compiler policy already provides.

## Why LLD on Clang?

LLD is significantly faster than GNU ld on large codebases, particularly for debug builds where large amounts of DWARF debug information must be processed. Forcing LLD when using Clang on Linux and Windows gives consistent, fast link times without requiring any per-project configuration.

On macOS and iOS, LD64 is the correct choice because it handles Apple-specific binary formats (`Mach-O`, code signing, fat binaries) that LLD does not fully support in all cases.
