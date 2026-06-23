---
sidebar_position: 2
title: Third Party Management
description: How GPBT resolves thirdparty dependencies using system packages, prebuilt binaries, and source builds, with platform and compiler awareness built in.
tags:
  - thirdparty
  - packages
  - cmake
  - fetchcontent
---

Managing thirdparty dependencies in a game engine is genuinely awkward: different platforms need different libraries, prebuilt binaries have to match the active compiler's ABI, and building every dependency from source on every developer machine is slow. GPBT handles this through a structured package system with a single consistent API.

## Core concepts

Each thirdparty dependency is described in a package descriptor, a `CMakeLists.txt` placed under your project's `thirdparty/` directory. The descriptor declares where to find the package and under what conditions each source is valid. GPBT resolves it during the configuration phase and creates a `gp::thirdparty::<name>` CMake alias that any module can reference through `gpAddDependency()`.

## Resolution priority

When a package has multiple resolution strategies declared, GPBT tries them in this order:

```text
SYSTEM  ->  BINARY  ->  SOURCE
```

1. **SYSTEM**: Use a package already present on the host (via `find_package()`, an Apple framework, or the Windows SDK). This is zero-download and zero-compile.
2. **BINARY**: Download a prebuilt archive from a URL and create an INTERFACE target from its contents.
3. **SOURCE / GIT**: Download a source archive or clone a Git repository and build the package using `FetchContent_MakeAvailable()`. `gpThirdpartySource()` and `gpThirdpartyGit()` both occupy this slot; only one can be declared per package.

`GPBT_THIRDPARTY_MODE` controls which strategies are attempted (default: `AUTO`). In `AUTO` mode, GPBT uses the first strategy that succeeds.

## Defining a package

All package declarations use the `gpStartThirdparty` / `gpEndThirdparty` pair:

```cmake
gpStartThirdparty("nlohmann-json" VERSION "3.11.3")
  # ... declarations ...
gpEndThirdparty()
```

The `VERSION` argument is used for logging and cache-key disambiguation only. It does not affect resolution behaviour.

### System packages

Use `gpThirdpartySystem()` to declare that a package can be found on the host system. There are three modes.

#### find_package

```cmake
gpStartThirdparty("vulkan" VERSION "any")
  gpThirdpartySystem(
    FIND_PACKAGE Vulkan
    TARGET       Vulkan::Vulkan
  )
  gpThirdpartySource(
    URL    "https://github.com/KhronosGroup/Vulkan-Headers/archive/refs/tags/v1.3.268.tar.gz"
    HASH   "SHA256=..."
    TARGET "Vulkan-Headers::Vulkan-Headers"
  )
gpEndThirdparty()
```

GPBT calls `find_package(Vulkan QUIET)`. If the package is found, `Vulkan::Vulkan` is wrapped inside `gp::thirdparty::vulkan` and no download happens. If not found, GPBT falls through to the SOURCE strategy.

#### Apple frameworks

```cmake
gpStartThirdparty("metal" VERSION "any")
  gpThirdpartyRequiresPlatforms(macOS iOS)
  gpThirdpartySystem(
    FRAMEWORK Metal MetalKit Foundation
  )
gpEndThirdparty()
```

GPBT creates an INTERFACE target that links `-framework Metal -framework MetalKit -framework Foundation`. Apple frameworks are always present on the matching platform, so this resolution never fails.

#### Windows SDK

```cmake
gpStartThirdparty("d3d12" VERSION "sdk")
  gpThirdpartyRequiresPlatforms(Windows)
  gpThirdpartySystem(
    WINDOWS_SDK
    LIBS d3d12 dxgi dxguid d3dcompiler
  )
gpEndThirdparty()
```

GPBT creates an INTERFACE target that links `d3d12.lib`, `dxgi.lib`, and the rest. The MSVC linker always knows where to find them because the Windows SDK library directory is part of the default linker search path.

### Prebuilt binary packages

Use `gpThirdpartyBinary()` to declare a prebuilt archive for a specific platform and compiler combination. Multiple binary slots can be declared; GPBT uses the first one that matches the current configuration.

```cmake
gpStartThirdparty("sdl2" VERSION "2.30.3")
  gpThirdpartyRequiresPlatforms(Windows Linux macOS)
  gpThirdpartyBinary(
    PLATFORMS Windows
    COMPILERS MSVC Clang
    URL  "https://github.com/.../SDL2-devel-2.30.3-VC.zip"
    HASH "SHA256=..."
  )
  gpThirdpartyBinary(
    PLATFORMS Linux
    URL  "https://github.com/.../SDL2-2.30.3-linux-x64.tar.gz"
    HASH "SHA256=..."
  )
  gpThirdpartySource(
    URL    "https://github.com/libsdl-org/SDL/archive/refs/tags/release-2.30.3.tar.gz"
    HASH   "SHA256=..."
    TARGET "SDL2::SDL2"
  )
gpEndThirdparty()
```

Platform tokens: `Windows`, `macOS`, `iOS`, `Android`, `Linux`, `FreeBSD`.
Compiler tokens: `MSVC`, `Clang`, `GCC`.
An empty `PLATFORMS` or `COMPILERS` list matches any value.

#### Binary archive layout convention

Archives downloaded by `gpThirdpartyBinary()` must follow this directory structure:

```text
<archive root>/
  include/          <- public headers
  lib/              <- config-agnostic libraries (.lib / .a / .so / .dylib)
  lib/debug/        <- Debug-only libraries
  lib/release/      <- Development, Profile, and Shipping libraries
  bin/              <- runtime DLLs or shared objects (for install rules only)
```

GPBT detects `lib/debug/` and `lib/release/` subdirectories automatically and uses CMake generator expressions to link the correct set per build configuration:

$$
\text{linked libs} =
\begin{cases}
\text{lib/debug/} & \text{if CONFIG = Debug} \\
\text{lib/release/} & \text{otherwise}
\end{cases}
$$

If neither subdirectory is present, all libraries found directly in `lib/` are linked unconditionally.

### Source packages

Use `gpThirdpartySource()` to declare a source archive. GPBT calls `FetchContent_MakeAvailable()`, which downloads and configures the package as a CMake subdirectory.

```cmake
gpStartThirdparty("nlohmann-json" VERSION "3.11.3")
  gpThirdpartySystem(
    FIND_PACKAGE nlohmann_json
    TARGET       nlohmann_json::nlohmann_json
  )
  gpThirdpartySource(
    URL    "https://github.com/nlohmann/json/archive/refs/tags/v3.11.3.tar.gz"
    HASH   "SHA256=..."
    TARGET "nlohmann_json::nlohmann_json"
  )
  gpThirdpartySetCMakeArgs(
    JSON_BuildTests=OFF
    JSON_Install=OFF
  )
gpEndThirdparty()
```

The `TARGET` argument tells GPBT which CMake target the subproject exports. If omitted, GPBT defaults to `<cleanName>::<cleanName>`. Use `gpThirdpartySetCMakeArgs()` to pass CMake cache variables to the subproject configure step.

:::tip
Always specify a `HASH` for production projects. The hash prevents supply-chain attacks by verifying the downloaded archive before extracting it. Run `cmake -E sha256sum <file>` to compute it.
:::

:::warning
Omitting `HASH` is allowed and will produce a warning, but the archive integrity will not be verified. Only omit it during initial development when you do not yet have a hash to use.
:::

### Git packages

Use `gpThirdpartyGit()` to fetch a package from a Git repository. GPBT clones with `FetchContent_Declare(GIT_REPOSITORY ...)` and then calls `FetchContent_MakeAvailable()` to configure it as a CMake subdirectory.

#### Pinning to a commit hash

A full commit hash gives the strongest reproducibility guarantee. The same 40-character SHA always produces the same source tree, regardless of force-pushes or tag mutations upstream.

```cmake
gpStartThirdparty("fmt" VERSION "10.2.1")
  gpThirdpartySystem(
    FIND_PACKAGE fmt
    TARGET       fmt::fmt
  )
  gpThirdpartyGit(
    REPOSITORY "https://github.com/fmtlib/fmt.git"
    TAG        "e69e5f977d458f2650bb346dadf2ad30c5320281"
    TARGET     "fmt::fmt"
  )
  gpThirdpartySetCMakeArgs(
    FMT_TEST=OFF
    FMT_DOC=OFF
    FMT_INSTALL=OFF
  )
gpEndThirdparty()
```

#### Using a tag with shallow clone

Specifying a tag name with `SHALLOW` downloads only the single commit at the tag tip, skipping all history. This is noticeably faster for large repositories.

```cmake
gpStartThirdparty("fmt" VERSION "10.2.1")
  gpThirdpartyGit(
    REPOSITORY "https://github.com/fmtlib/fmt.git"
    TAG        "v10.2.1"
    SHALLOW
    TARGET     "fmt::fmt"
  )
gpEndThirdparty()
```

:::warning
Do not combine `SHALLOW` with a raw commit hash. Git shallow clones require a named ref (branch or tag) as the starting point. Using a bare commit SHA with `SHALLOW` will fail the clone step.
:::

#### Tracking a branch

Branches are mutable, so they are not recommended for production builds. Prefer a commit hash or a release tag. If you do track a branch (for example during active upstream development), omit `SHALLOW` so CMake can resolve the branch to a specific commit:

```cmake
gpStartThirdparty("my-lib" VERSION "dev")
  gpThirdpartyGit(
    REPOSITORY "https://github.com/example/my-lib.git"
    TAG        "main"
    TARGET     "mylib::mylib"
  )
gpEndThirdparty()
```

### Applying a patch

Both `gpThirdpartyGit()` and `gpThirdpartySource()` accept an optional `PATCH_COMMAND` argument. The command runs once in the source directory, immediately after the initial checkout or extraction. Subsequent reconfigures reuse the cached source tree and do not reapply the patch.

```cmake
gpStartThirdparty("zlib" VERSION "1.3.1")
  gpThirdpartyGit(
    REPOSITORY   "https://github.com/madler/zlib.git"
    TAG          "v1.3.1"
    SHALLOW
    TARGET       "zlib"
    PATCH_COMMAND git apply ${CMAKE_CURRENT_LIST_DIR}/zlib-cmake-fix.patch
  )
gpEndThirdparty()
```

The same syntax works for `gpThirdpartySource()`:

```cmake
gpStartThirdparty("somelib" VERSION "1.0.0")
  gpThirdpartySource(
    URL          "https://example.com/somelib-1.0.0.tar.gz"
    HASH         "SHA256=..."
    PATCH_COMMAND git apply ${CMAKE_CURRENT_LIST_DIR}/somelib-fix.patch
  )
gpEndThirdparty()
```

`PATCH_COMMAND` accepts any sequence of command tokens, not just `git apply`. Any executable available in the build environment works:

```cmake
PATCH_COMMAND python ${CMAKE_CURRENT_LIST_DIR}/fix_cmakelists.py
```

:::tip
To force reapplication of a patch after modifying it, delete the FetchContent stamp directory at `<build>/_deps/<package-name>-subbuild/` and reconfigure.
:::

## Platform and compiler gating

Use `gpThirdpartyRequiresPlatforms()` and `gpThirdpartyRequiresCompilers()` to restrict a package to specific environments. Packages that do not match are silently skipped.

```cmake
gpStartThirdparty("d3d12" VERSION "sdk")
  gpThirdpartyRequiresPlatforms(Windows)          # skip on Linux, macOS, etc.
  gpThirdpartyRequiresCompilers(MSVC Clang)        # skip on GCC
  gpThirdpartySystem(WINDOWS_SDK LIBS d3d12 dxgi)
gpEndThirdparty()
```

This means it is safe to reference `gp::thirdparty::d3d12` unconditionally in a module's Windows dependency list, knowing the target simply will not exist on other platforms.

:::note
If a target named `gp::thirdparty::d3d12` does not exist on a given platform because the package was skipped, any `gpAddDependency()` reference to it in a module that does get configured on that platform will cause a CMake error. Use `if(WIN32)` guards in your module's `CMakeLists.txt` when a dependency is strictly platform-specific.
:::

## Consuming a thirdparty package

Once resolved, a package is available as `gp::thirdparty::<name>`, where `<name>` is the snake_case form of the package name (`nlohmann-json` becomes `nlohmann_json`, for example):

```cmake
gpStartModule("editor/config")
  gpAddDependency(PRIVATE gp::thirdparty::nlohmann_json)
gpEndModule()
```

## Fast reconfiguration

`GPBT_THIRDPARTY_UPDATES_DISCONNECTED` defaults to `ON`. This sets `FETCHCONTENT_UPDATES_DISCONNECTED`, which tells CMake to skip network checks for packages already downloaded. Subsequent configure runs finish in seconds instead of making HTTP requests for every registered package.

Disable it only when you want to explicitly check for updates:

```bash
cmake -S . -B build -DGPBT_THIRDPARTY_UPDATES_DISCONNECTED=OFF
```

## Overriding the resolution mode

The global mode can be overridden on the command line or on a per-package basis:

```bash
# Force all packages to build from source
cmake -S . -B build -DGPBT_THIRDPARTY_MODE=SOURCE
```

```cmake
# Force one specific package to build from source
gpStartThirdparty("physx" VERSION "5.3")
  gpSetThirdpartyMode(SOURCE)
  gpThirdpartySource(
    URL    "https://github.com/NVIDIA-Omniverse/PhysX/archive/refs/tags/106.1-physx-5.3.tar.gz"
    HASH   "SHA256=..."
    TARGET "PhysX::PhysX"
  )
gpEndThirdparty()
```

| Mode | Behaviour |
| --- | --- |
| `AUTO` | SYSTEM first, then BINARY, then SOURCE. Uses the first that succeeds. |
| `BINARY` | Only BINARY. Fatal error if no binary matches the current platform and compiler. SYSTEM declarations are still attempted first. |
| `SOURCE` | Only SOURCE. Skips SYSTEM and BINARY entirely. |
