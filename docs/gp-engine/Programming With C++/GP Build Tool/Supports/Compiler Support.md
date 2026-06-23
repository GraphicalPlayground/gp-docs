---
sidebar_position: 2
title: Compiler Support
description: Supported compilers, their minimum versions, and the flags GPBT applies automatically per compiler and configuration.
tags:
  - compilers
  - msvc
  - clang
  - gcc
  - flags
---

GPBT detects the active C++ compiler and applies a corresponding set of flags across all four build configurations. Detection uses `CMAKE_CXX_COMPILER_ID` and maps to a consistent token stored in `GPBT_CURRENT_COMPILER`.

## Supported compilers

| Compiler | `GPBT_CURRENT_COMPILER` | Minimum version | Notes |
| --- | --- | --- | --- |
| MSVC (Visual C++) | `MSVC` | VS 2022 17.x | Required for C++23 support |
| Clang-CL (Windows) | `Clang-CL` | 17.0 | Clang with MSVC frontend |
| Clang | `Clang` | 17.0 | Includes Apple Clang on macOS and iOS |
| GCC | `GCC` | 13.0 | Required for C++23 feature completeness |

## Compiler detection and override

GPBT detects the compiler automatically. The token is available at configure time:

```bash
cmake -S . -B build
# GPBT_CURRENT_COMPILER is now set to "MSVC", "Clang-CL", "Clang", or "GCC"
```

## Flags applied per compiler

GPBT applies different sets of flags depending on the active compiler and configuration. The tables below show the key flags. These are applied to every target automatically.

### MSVC

| Configuration | Key flags |
| --- | --- |
| All | `/W4`, `/WX`, `/permissive-`, `/Zc:__cplusplus`, `/EHsc`, `/GS`, `/Gy`, `/GF` |
| Debug | `/Od`, `/Zi`, `/RTC1`, `/sdl` |
| Development | `/O2`, `/Zi` |
| Profile | `/O2`, `/Zi`, `/Oy-` |
| Shipping | `/O2`, `/Ob3`, `/GL` (WPO), `/Gw`, `/GS-` |

### Clang-CL (Windows)

| Configuration | Key flags |
| --- | --- |
| All | `/W4`, `/WX`, `/permissive-`, `-Wextra`, `/Zc:__cplusplus`, `/EHsc`, `/GS`, `/Gy`, `/GF`, `/Oy-` |
| Debug | `/Od`, `/Zi`, `-fstack-protector-strong` |
| Development | `/O2`, `/Zi` |
| Profile | `/O2`, `/Zi` |
| Shipping | `/O2`, `/GL` (WPO), `/Gw`, `-flto=thin` |

### Clang

| Configuration | Key flags |
| --- | --- |
| All | `-Wall`, `-Wextra`, `-Werror`, `-fvisibility=hidden`, `-ffunction-sections`, `-fdata-sections` |
| Debug | `-O0`, `-g3`, `-fno-omit-frame-pointer`, `-fstack-protector-strong` |
| Development | `-O2`, `-g`, `-fno-omit-frame-pointer` |
| Profile | `-O3`, `-g`, `-fno-omit-frame-pointer`, `-fno-inline-functions` |
| Shipping | `-O3`, `-ffast-math`, `-flto=thin`, `-fwhole-program-vtables` |

### GCC

| Configuration | Key flags |
| --- | --- |
| All | `-Wall`, `-Wextra`, `-Werror`, `-fvisibility=hidden`, `-ffunction-sections`, `-fdata-sections` |
| Debug | `-O0`, `-g3`, `-fno-omit-frame-pointer`, `-fstack-protector-strong` |
| Development | `-O2`, `-g`, `-fno-omit-frame-pointer` |
| Profile | `-O3`, `-g`, `-fno-omit-frame-pointer`, `-fno-inline-functions-called-once` |
| Shipping | `-O3`, `-ffast-math`, `-flto=auto`, `-fno-semantic-interposition` |

## C++ standard

GPBT enforces C++23 globally through `gpApplyGraphicalPlaygroundDefaultPolicy()`. Compiler extensions are disabled (`CMAKE_CXX_EXTENSIONS OFF`) to ensure strictly conforming code.

## Strict warnings

All targets compile with strict warnings and warnings-as-errors enabled by default. To turn this off for a specific target (typically thirdparty code or legacy modules), use `gpDisableStrictWarnings()`. See [Miscellaneous Options](../Api%20Usage/Miscs%20Options.md) for details.

## Link-Time Optimisation

LTO is applied in the `Shipping` configuration only. The strategy depends on the compiler:

- **Clang**: Thin LTO (`-flto=thin`). Faster link times than full LTO with most of the optimisation benefit.
- **GCC**: Full LTO (`-flto=auto`). More aggressive, slower to link.
- **MSVC**: Whole Program Optimisation (`/GL` compile, `/LTCG` link).

The LTO compile flag is passed to the linker via an internal property so the linker policy file always matches the compile-time setting.

## Sanitizer support

The four sanitizer options apply to every target when enabled, in all non-Shipping configurations.

| Sanitizer | GCC (Linux) | Clang (Linux) | Clang (macOS) | MSVC | Clang-CL |
| --- | --- | --- | --- | --- | --- |
| `GPBT_SANITIZER_ADDRESS` | Yes | Yes | Yes | Yes (`/fsanitize=address`) | Yes |
| `GPBT_SANITIZER_THREAD` | Yes | Yes | Yes | No | No |
| `GPBT_SANITIZER_MEMORY` | No | Yes | No | No | No |
| `GPBT_SANITIZER_UNDEFINED_BEHAVIOR` | Yes | Yes | Yes | No | No |

ASan, TSan, and MSan are mutually exclusive. Enabling more than one produces a fatal configure error. UBSan can run alongside any of the three.

MSan requires Clang and an instrumented libc, which limits it to Linux. The Apple libc on macOS is not instrumented, so MSan is silently skipped there even with Clang. GCC does not ship an instrumented libc.

See [Sanitizers](../Features/Sanitizers.md) for usage examples and [Configuration](../Configuration.md) for the option reference.
