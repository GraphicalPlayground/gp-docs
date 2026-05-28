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

GPBT detects the active C++ compiler and applies a corresponding set of flags across all four build configurations. The detection is based on `CMAKE_CXX_COMPILER_ID` and maps to a consistent token stored in `GPBT_CURRENT_COMPILER`.

## Supported compilers

| Compiler | `GPBT_CURRENT_COMPILER` | Minimum version | Notes |
| --- | --- | --- | --- |
| MSVC (Visual C++) | `MSVC` | VS 2022 17.x | Required for C++23 support |
| Clang-CL (Windows) | `Clang-CL` | 17.0 | Clang with MSVC frontend |
| Clang | `Clang` | 17.0 | Includes Apple Clang on macOS and iOS |
| GCC | `GCC` | 13.0 | Required for C++23 feature completeness |

## Compiler detection and override

GPBT detects the compiler automatically. You do not need to set anything. The token is available at configure time:

```bash
cmake -S . -B build
# GPBT_CURRENT_COMPILER is now set to "MSVC", "Clang-CL", "Clang", or "GCC"
```

## Flags applied per compiler

GPBT applies different sets of flags depending on the active compiler and configuration. The following tables summarise the key flags. These are applied to every target automatically; you do not need to set them manually.

### MSVC

| Configuration | Key flags |
| --- | --- |
| All | `/std:c++23`, `/W4`, `/WX`, `/permissive-`, `/Zc:__cplusplus` |
| Debug | `/Od`, `/Zi`, `/RTC1` |
| Development | `/O2`, `/Zi` |
| Profile | `/O2`, `/GL` (LTO) |
| Shipping | `/O2`, `/GL` (LTO) |

### Clang-CL (Windows)

| Configuration | Key flags |
| --- | --- |
| All | `/std:c++23`, `/W4`, `/WX`, `/permissive-`, `-Wextra`, `/Zc:__cplusplus` |
| Debug | `/Od`, `/Zi`, `-fstack-protector-strong` |
| Development | `/O2`, `/Zi` |
| Profile | `/O2`, `/Zi`, `/Oy-` |
| Shipping | `/O2`, `/GL` (LTO), `/Gw`, `-flto=thin` |

### Clang

| Configuration | Key flags |
| --- | --- |
| All | `-std=c++23`, `-Wall`, `-Wextra`, `-Werror`, `-fvisibility=hidden` |
| Debug | `-O0`, `-g` |
| Development | `-O2`, `-g` |
| Profile | `-O3`, `-flto=thin` |
| Shipping | `-O3`, `-flto=thin` |

### GCC

| Configuration | Key flags |
| --- | --- |
| All | `-std=c++23`, `-Wall`, `-Wextra`, `-Werror`, `-fvisibility=hidden` |
| Debug | `-O0`, `-g` |
| Development | `-O2`, `-g` |
| Profile | `-O3`, `-flto` |
| Shipping | `-O3`, `-flto` |

## C++ standard

GPBT enforces C++23 globally through `gpApplyGraphicalPlaygroundDefaultPolicy()`. Compiler extensions are disabled (`CMAKE_CXX_EXTENSIONS OFF`) to ensure strictly conforming code.

## Strict warnings

All targets are compiled with strict warnings and warnings-as-errors enabled by default. To disable this for a specific target (typically thirdparty code or legacy modules), use `gpDisableStrictWarnings()`. See [Miscellaneous Options](../Api%20Usage/Miscs%20Options.md) for details.

## Link-Time Optimisation

LTO is applied automatically in `Profile` and `Shipping` configurations. The strategy depends on the compiler:

- **Clang**: Thin LTO (`-flto=thin`). Faster link times than full LTO with most of the optimisation benefit.
- **GCC**: Full LTO (`-flto`). More aggressive, slower to link.
- **MSVC**: Whole Program Optimisation (`/GL` compile, `/LTCG` link).

The LTO compile flag is communicated to the linker via an internal mechanism so the linker policy file always matches the compile-time setting.
