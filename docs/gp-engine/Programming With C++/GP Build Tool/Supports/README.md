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

GPBT supports a fixed set of platforms, compilers, and linkers. The correct flags are picked up automatically from what CMake detects at configure time — nothing to configure manually.

## Quick reference

| Area | Supported |
| --- | --- |
| [Platforms](./Platform%20Support.md) | Windows, Linux, macOS, iOS, Android, FreeBSD |
| [Compilers](./Compiler%20Support.md) | MSVC, Clang / AppleClang, GCC |
| [Linkers](./Linker%20Support.md) | MSVC Link, LLD, LD64 (Apple), LD (GNU) |

## How detection works

GPBT runs detection on the first CMake configure and loads the policy file that matches the active compiler and platform. Each policy file only needs to cover the differences from the `default` baseline, so adding a new toolchain means writing a fairly small file.

The active tokens are available as CMake variables:

| Variable | Example values |
| --- | --- |
| `GPBT_CURRENT_PLATFORM` | `Windows`, `Linux`, `macOS`, `iOS`, `Android`, `FreeBSD` |
| `GPBT_CURRENT_COMPILER` | `MSVC`, `Clang`, `GCC` |

Both variables are set during the configure step and are readable from any `CMakeLists.txt` that includes `gp-build-tool`.
