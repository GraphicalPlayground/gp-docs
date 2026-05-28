---
sidebar_position: 11
title: Executable Specific
description: Options that apply only to executable targets, including GUI mode, custom entry points, and resource files.
tags:
  - executable
  - windows
  - entry point
  - cmake
---

The following macros apply only to targets declared with `gpStartExecutable()`. Calling them inside a module or plugin definition has no effect.

## GUI executables on Windows

```cmake
gpSetGuiExecutable()
```

On Windows, marks the executable as a GUI application. This sets the `/SUBSYSTEM:WINDOWS` linker flag and causes the linker to expect `WinMain` as the entry point rather than `main`. The console window is suppressed when the executable is launched.

```cmake
gpStartExecutable("editor")
  gpSetGuiExecutable()
  gpAddDependency(PUBLIC core)
gpEndExecutable()
```

On platforms other than Windows, this call has no effect.

:::note
If you use a compatibility shim that provides a standard `main()` entry point, you will still need `gpSetGuiExecutable()` to suppress the console window.
:::

## Custom entry point

```cmake
gpSetEntryPoint(file)
```

Designates a specific source file as the entry point for the executable. This is useful when the entry point is not auto-discovered by the standard directory layout, or when you want to make the entry point explicit and separate from the rest of the module's sources.

```cmake
gpStartExecutable("launcher")
  gpSetEntryPoint(private/LauncherMain.cpp)
gpEndExecutable()
```

The path is relative to the target directory unless it is absolute.

## Resource files

```cmake
gpAddResourceFile(file)
```

Adds a platform resource file to the executable. On Windows, this is typically a `.rc` file that embeds the application icon, version information, and manifest.

```cmake
gpStartExecutable("editor")
  gpAddResourceFile(resources/Editor.rc)
gpEndExecutable()
```

On platforms that do not use resource files, this call has no effect.

```cmake
gpStartExecutable("editor")
  gpSetGuiExecutable()
  gpSetEntryPoint(private/EditorMain.cpp)
  gpAddResourceFile(resources/Editor.rc)
  gpAddDependency(PUBLIC core)
  gpAddDependency(PRIVATE gp::thirdparty::nlohmann_json)
gpEndExecutable()
```
