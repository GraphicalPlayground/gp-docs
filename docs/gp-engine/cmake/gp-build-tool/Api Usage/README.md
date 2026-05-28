---
sidebar_position: 0
title: API Reference
description: Overview of the public gp*() macro API, the naming conventions, and how to include the build tool in a project.
tags:
  - api
  - cmake
  - macros
---

The GP Build Tool public API consists entirely of CMake macros with the `gp` prefix. Each macro is a thin wrapper that delegates to an internal `gpbt_` function. This separation ensures that internal behaviour can change without breaking project code.

## Including the build tool

Every `CMakeLists.txt` that uses the API must include the build tool module:

```cmake
include(gp-build-tool)
```

Because the module uses `include_guard(GLOBAL)`, it is safe to include it multiple times across the source tree. Subsequent includes are no-ops.

## API surface

The public API is grouped by function. Each group is documented on its own page.

| Group | What it covers |
| --- | --- |
| [Build Tool Lifecycle](./CMake%20Target.md) | `gpStartBuildTool`, `gpEndBuildTool`, `gpApplyGraphicalPlaygroundDefaultPolicy` |
| [Scanning](./Scanning.md) | `gpBuildToolAutoScan` |
| [Targets](./Targets.md) | `gpStartModule`, `gpStartExecutable`, `gpStartPlugin`, `gpEndTarget` |
| [Sources](./Sources.md) | `gpAddSourceFile`, `gpAddSourceDirectory`, `gpExcludeSourceFile`, and more |
| [Dependencies](./Dependencies.md) | `gpAddDependency` with PUBLIC, PRIVATE, INTERNAL, and DYNAMIC visibility |
| [Include Directories](./Include%20Directories.md) | Automatic include path management from the directory layout |
| [Compile Definitions](./Compile%20Definitions.md) | `gpAddCompileDefinition` |
| [Compile Options](./Compile%20Options.md) | `gpAddCompileOption` |
| [Link Options](./Link%20Options.md) | `gpAddLinkOption` |
| [Miscellaneous Options](./Miscs%20Options.md) | `gpSetHeaderOnly`, `gpDisableStrictWarnings`, `gpSetStatic`, `gpAddPrecompiledHeader`, and more |
| [Executable Specific](./Executable%20Specific.md) | `gpSetGuiExecutable`, `gpSetEntryPoint`, `gpAddResourceFile` |
| [IDE Integration](./IDE%20Integration.md) | `gpSetFolder`, `gpAddAlias` |

## Naming conventions

| Pattern | Meaning |
| --- | --- |
| `gp<PascalCase>()` | Public macro, safe to call from project code |
| `gpbt_<camelCase>()` | Internal function, do not call directly |
| `GPBT_<UPPER_SNAKE>` | Build tool cache variable or global flag |
| `gp::<name>` | CMake alias for a GP module target |
| `gp::thirdparty::<name>` | CMake alias for a resolved thirdparty package |

:::warning
Never call `gpbt_*` functions directly from project code. These functions are internal to the build tool and their signatures may change without notice between versions.
:::
