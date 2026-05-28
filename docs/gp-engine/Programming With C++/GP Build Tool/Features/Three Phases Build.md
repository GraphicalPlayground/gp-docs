---
sidebar_position: 1
title: Two-Phase Build Lifecycle
description: How GPBT separates target registration from target configuration to eliminate ordering bugs and ensure consistent dependency resolution.
tags:
  - architecture
  - build lifecycle
  - registration
  - configuration
---

One of the most common sources of subtle bugs in CMake projects is declaration order dependency: a target must be defined before another target can reference it. GPBT eliminates this problem entirely through a two-phase build lifecycle.

## The problem with naive CMake

In a standard CMake project, `target_link_libraries()` requires the referenced target to already exist at the point of the call. This means the order in which `CMakeLists.txt` files are included determines what is valid. As a project grows, maintaining this ordering manually becomes fragile and error-prone.

## How GPBT solves it

GPBT splits the build process into two distinct phases within the CMake configure step.

```text
cmake configure step
├── REGISTRATION phase    (all CMakeLists.txt included, targets declared)
└── CONFIGURATION phase   (thirdparty resolved, targets sorted, built in order)
```

### Registration phase

During registration, every `CMakeLists.txt` discovered by `gpBuildToolAutoScan()` is included. Each call to `gpStartModule()`, `gpStartExecutable()`, and similar macros records the target's properties (name, type, source directory, dependencies, compile flags, and so on) into a global property store.

No actual CMake targets (`add_library`, `add_executable`) are created at this point. API calls that only make sense during configuration, such as setting source file properties, are silently deferred.

### Configuration phase

Once all targets and thirdparty packages are registered, the configuration phase begins. GPBT performs the following steps in order:

1. **Resolve thirdparty packages.** Each package is resolved using the SYSTEM, BINARY, or SOURCE strategy. This creates the `gp::thirdparty::*` INTERFACE targets before any module needs them.
2. **Topological sort.** Targets are sorted so that every module is configured after all of its dependencies.
3. **Configure each target.** Each target's `CMakeLists.txt` is re-included. This time, `add_library()` or `add_executable()` is called, and all accumulated flags, include paths, and dependencies are applied.
4. **Write the install export.** All targets are registered to the CMake install export set.

## Practical implications

Because registration always precedes configuration, you can reference any target from any other target without worrying about file inclusion order. The following is valid even if `rhi/d3d12` is discovered before `rhi/base`:

```cmake
gpStartModule("rhi/base")
  gpAddDependency(DYNAMIC rhi/d3d12)  # rhi/d3d12 has not been declared yet, this is fine
gpEndModule()
```

GPBT resolves the reference during the configuration phase after all targets are known.

:::note
API functions that must only run during one phase use an internal phase guard. If you call a registration-only function during configuration, it silently returns. This is intentional and allows the same `CMakeLists.txt` to be included twice without side effects.
:::

## Relationship to CMake's generate step

The two GPBT phases both occur within CMake's own configure step. CMake's generate step (which produces Makefiles, Visual Studio projects, and so on) happens afterward as normal. GPBT does not interfere with generation.

```text
cmake configure step
├── REGISTRATION phase
└── CONFIGURATION phase
cmake generate step     <- standard CMake, unmodified
build step              <- standard CMake, unmodified
```
