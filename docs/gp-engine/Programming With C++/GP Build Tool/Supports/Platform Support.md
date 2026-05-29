---
sidebar_position: 1
title: Platform Support
description: Supported platforms, how GPBT detects them, and the platform token values available at configure time.
tags:
  - platforms
  - windows
  - linux
  - macos
  - ios
  - android
---

GPBT detects the target platform at configure time and sets `GPBT_CURRENT_PLATFORM` to a consistent token string. That token is used internally for thirdparty package matching and is available for platform-conditional logic in your own `CMakeLists.txt` files.

## Supported platforms

| Platform | `GPBT_CURRENT_PLATFORM` | Detection condition |
| --- | --- | --- |
| Windows | `Windows` | `WIN32` is set |
| Android | `Android` | `CMAKE_SYSTEM_NAME == "Android"` |
| iOS | `iOS` | `CMAKE_SYSTEM_NAME == "iOS"` |
| macOS | `macOS` | `APPLE` is set (and not iOS) |
| FreeBSD | `FreeBSD` | `CMAKE_SYSTEM_NAME == "FreeBSD"` |
| Linux | `Linux` | `UNIX` is set (and not Apple, Android, or FreeBSD) |

Detection follows a priority order. Android is checked before the more general UNIX check; iOS is checked before APPLE. This matters for cross-compiled targets — an Android build on a macOS host is identified as Android, not macOS.

## Platform-specific CMakeLists.txt behaviour

You can use `GPBT_CURRENT_PLATFORM` or standard CMake conditions in any `CMakeLists.txt`:

```cmake
gpStartModule("platform/window")
  if(WIN32)
    gpAddCompileDefinition(PRIVATE GP_WINDOW_WIN32)
    gpAddDependency(PRIVATE gp::thirdparty::d3d12)
  elseif(APPLE)
    gpAddCompileDefinition(PRIVATE GP_WINDOW_COCOA)
    gpAddDependency(PRIVATE gp::thirdparty::metal)
  else()
    gpAddCompileDefinition(PRIVATE GP_WINDOW_X11)
  endif()
gpEndModule()
```

## Platform policy files

Each platform has a corresponding policy file under `source/gp-build-tool/platforms/`. These files are included automatically at configure time and can add platform-specific compiler definitions, linker flags, or feature detection logic.

The platform policy files are currently stubs. Planned additions include automatic `WINVER` and `_WIN32_WINNT` definitions on Windows, and framework search path configuration on macOS and iOS.

## Thirdparty platform gating

Platform tokens are used directly in thirdparty package descriptors to restrict which packages are resolved on which platforms:

```cmake
gpThirdpartyRequiresPlatforms(Windows)   # package only resolved on Windows
gpThirdpartyRequiresPlatforms(macOS iOS) # package only resolved on Apple platforms
```

Packages that do not match the current platform are skipped silently during configuration.
