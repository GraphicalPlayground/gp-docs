---
sidebar_position: 5
title: Dependencies
description: How to express dependencies between modules and thirdparty packages using GPBT's four-level visibility system.
tags:
  - dependencies
  - visibility
  - cmake
  - linking
---

Dependencies in GPBT are declared with `gpAddDependency()`. Unlike raw `target_link_libraries()`, GPBT uses four visibility levels that encode not just linking behaviour but also how include paths propagate through the module graph.

## Syntax

```cmake
gpAddDependency(visibility target [target2 ...])
```

The `visibility` argument is one of `PUBLIC`, `PRIVATE`, `INTERNAL`, or `DYNAMIC`.

## Visibility levels

| Visibility | Linked | Headers propagated to dependents | Notes |
| --- | --- | --- | --- |
| `PUBLIC` | Yes | Yes | Standard transitive dependency |
| `PRIVATE` | Yes | No | Implementation detail, hidden from consumers |
| `INTERNAL` | Yes (privately) | Yes (within the graph) | Cross-module visibility without public exposure |
| `DYNAMIC` | No | No | Build-order only; loaded at runtime |

### PUBLIC

Use `PUBLIC` when the dependency is part of the module's public contract. Consumers of the module get both the link dependency and the public include paths.

```cmake
gpStartModule("rhi/base")
  gpAddDependency(PUBLIC core)
gpEndModule()
```

Any module that depends on `rhi/base` will also be linked against `core` and will see `core`'s public headers.

### PRIVATE

Use `PRIVATE` when the dependency is an implementation detail that consumers do not need. The include paths are not propagated.

```cmake
gpStartModule("renderer/core")
  gpAddDependency(PRIVATE gp::thirdparty::nlohmann_json)
gpEndModule()
```

### INTERNAL

`INTERNAL` is a GPBT-specific visibility level. It links the dependency privately (the same as `PRIVATE` at the CMake level) but propagates the include paths to all modules in the same dependency graph. This is useful for cross-cutting infrastructure — logging, assertion facilities, and the like — that needs to be visible throughout the engine without being part of any module's public API.

```cmake
gpStartModule("core/logging")
gpEndModule()

gpStartModule("renderer/core")
  gpAddDependency(INTERNAL core/logging)
gpEndModule()

# renderer/core's consumers can see core/logging's internal headers
# without renderer/core explicitly re-exporting them
```

### DYNAMIC

`DYNAMIC` records a build-order dependency without generating any link flags. Use this for modules loaded at runtime via `dlopen()` or `LoadLibrary()`. The module is built before the dependent and the relationship is explicit in the dependency graph, but nothing is added to the link line.

```cmake
gpStartModule("rhi/base")
  gpAddDependency(DYNAMIC rhi/d3d12)   # loaded at runtime, not linked
gpEndModule()
```

## Depending on thirdparty packages

Thirdparty packages resolved by GPBT are available as `gp::thirdparty::<name>`. Use them like any other dependency:

```cmake
gpStartModule("editor/config")
  gpAddDependency(PRIVATE gp::thirdparty::nlohmann_json)
gpEndModule()
```

## Dependency graph and topological sort

GPBT uses the registered dependency graph to sort all targets before configuration. A target is always configured after all of its dependencies, regardless of the order in which `CMakeLists.txt` files were discovered during scanning.

If a circular dependency is detected, GPBT reports a fatal error at configuration time and lists the cycle.

## Duplicate detection

Adding the same target twice to a module's dependency list produces a warning and the duplicate is ignored. This can happen when a dependency is added conditionally and the condition evaluates to true more than once.
