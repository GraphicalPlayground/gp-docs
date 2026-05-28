---
sidebar_position: 0
title: Support Matrix
description: An overview of the platforms, compilers, and linkers supported by GPBT.
tags:
  - support
  - platforms
  - compilers
  - linkers
---

GPBT supports a range of platforms, compilers, and linkers out of the box. The correct flags and settings are applied automatically based on what CMake detects at configure time.

## Quick reference

| Area | Supported |
| --- | --- |
| [Platforms](./Platform%20Support.md) | Windows, Linux, macOS, iOS, Android, FreeBSD |
| [Compilers](./Compiler%20Support.md) | MSVC, Clang / AppleClang, GCC |
| [Linkers](./Linker%20Support.md) | MSVC Link, LLD, LD64 (Apple), LD (GNU) |

## How detection works

GPBT performs detection during the first CMake configure and applies the appropriate policy file for the active combination. Each policy file overrides the base set of flags defined in the `default` file, so only the differences need to be written per toolchain.

The active tokens are accessible from project code as CMake variables:

| Variable | Example values |
| --- | --- |
| `GPBT_CURRENT_PLATFORM` | `Windows`, `Linux`, `macOS`, `iOS`, `Android`, `FreeBSD` |
| `GPBT_CURRENT_COMPILER` | `MSVC`, `Clang`, `GCC` |

These variables are set during the configure step and can be read by any `CMakeLists.txt` file that includes `gp-build-tool`.
