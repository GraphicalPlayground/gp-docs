---
sidebar_position: 4
title: Sources
description: How GPBT discovers source files automatically from the directory layout, and how to add or exclude files explicitly.
tags:
  - sources
  - cmake
  - files
---

GPBT uses a convention-based directory layout to automatically discover source files. In most cases you do not need to call any source management API at all: the build tool finds everything it needs from the structure of the target's directory.

## Directory layout convention

Each target's directory is expected to follow this structure:

```text
my-module/
  CMakeLists.txt
  public/         <- headers exposed to dependents (PUBLIC)
  internal/       <- headers shared across modules (INTERNAL)
  private/        <- implementation sources and private headers
```

GPBT automatically globs for `.cpp`, `.c`, `.cxx` files in `private/` and `internal/` and adds them as sources. Header files (`.h`, `.hpp`, `.hxx`) in `public/`, `internal/`, and `private/` are also discovered and included in the IDE's file list for navigation purposes.

See [Include Directories](./Include%20Directories.md) for how these directories affect which include paths are exposed to dependents.

## Automatic discovery behaviour

Source file discovery uses CMake's `file(GLOB_RECURSE ...)` internally. By default, `GPBT_CONFIGURE_DEPENDS=ON` is set, which instructs CMake to re-run the configure step when files are added to or removed from a globbed directory.

:::tip
Keep `GPBT_CONFIGURE_DEPENDS=ON` during development. Disable it in CI environments where the source tree does not change between the configure and build steps, as filesystem polling adds latency to the configure step.
:::

## Adding sources explicitly

When you need to include a file that is not in the standard layout, use `gpAddSourceFile()`:

```cmake
gpStartModule("platform/win32")
  gpAddSourceFile(private/Win32.cpp)
  gpAddSourceFile(${CMAKE_CURRENT_LIST_DIR}/generated/Bindings.cpp)
gpEndModule()
```

Paths are relative to the target directory (the directory containing the `CMakeLists.txt`) unless they are absolute.

## Adding a source directory

To add all sources in a directory recursively:

```cmake
gpStartModule("core")
  gpAddSourceDirectory(extra-sources)
gpEndModule()
```

## Adding sources by pattern

To add files matching a glob pattern:

```cmake
gpStartModule("audio")
  gpAddSourcePattern("private/**/*.gen.cpp")
gpEndModule()
```

## Excluding sources

To remove a file from the automatically discovered set, use the corresponding `gpExclude*` macro:

```cmake
gpStartModule("renderer")
  gpExcludeSourceFile(private/LegacyPath.cpp)
  gpExcludeSourceDirectory(private/deprecated)
  gpExcludeSourcePattern("private/**/*.old.cpp")
gpEndModule()
```

Exclusions apply after auto-discovery. They have no effect on files added explicitly with `gpAddSourceFile()`.

## API summary

| Macro | Description |
| --- | --- |
| `gpAddSourceFile(files...)` | Add specific files by path |
| `gpAddSourceDirectory(dirs...)` | Add all sources found recursively under a directory |
| `gpAddSourcePattern(patterns...)` | Add sources matching a glob pattern |
| `gpExcludeSourceFile(files...)` | Remove specific files from the discovered set |
| `gpExcludeSourceDirectory(dirs...)` | Remove all sources under a directory |
| `gpExcludeSourcePattern(patterns...)` | Remove sources matching a glob pattern |
