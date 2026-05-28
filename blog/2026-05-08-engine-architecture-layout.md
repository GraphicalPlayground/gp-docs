---
slug: engine-architecture-layout
title: "Engine Architecture and Directory Layout: A Principal Engineer's Guide"
authors: mallory-scotton
tags: [research, technical, architecture, engine design, build system, cmake, c++, modularity, directory layout, gp engine]
---
import FileTree from '@site/src/components/FileTree';

# Engine Architecture and Directory Layout: A Principal Engineer's Guide

**A Comparative Survey of AAA Engine Source Trees and the Design Rationale Behind the Graphical Playground Engine**

---

> *"Architecture is not the directory tree. The directory tree is the architecture made visible. Open any AAA engine and within thirty seconds you can read its philosophy off the file system."*

---

## Abstract

Game engine architecture usually gets discussed in terms of subsystems: *renderers*, *physics*, *audio*, *animation*. But before any code is written, a more concrete question shapes everything: **how is the source tree organized?** Where does a piece of code physically live, what is allowed to depend on it, and what does that dependency mean at compile-time, link-time, and runtime? This paper takes a close look at directory layout as an architectural tool. We survey the publicly documented source trees of seven canonical engines, **Unreal Engine 5**, **Godot**, **id Tech 4 / Doom 3**, **O3DE**, **Bevy**, **Unity**, and **Cocos2d-x**, and the publicly documented architectural philosophies of five proprietary AAA engines, **Frostbite** (DICE/EA), **Decima** (Guerrilla Games), **Anvil** (Ubisoft Montreal), **Snowdrop** (Ubisoft Massive), and **RE Engine** (Capcom). We pull out a taxonomy of five layout strategies, weigh the trade-offs of each, and present the **Graphical Playground (GP) Engine** layout: a hybrid that borrows Unreal Engine's `Public/Private/Internal` discipline and reshapes it for educational clarity, multi-backend pluggability, and declarative CMake builds via our custom orchestration layer (GPBT). It closes with the complete GP Engine repository topology, module anatomy, and the rationale for every directory we ship.

**Keywords:** engine architecture, directory layout, module system, build system, CMake, GPBT, public/private boundary, RHI, plug-in architecture, monorepo, dependency visibility

{/* truncate */}

---

## Table of Contents

1. [Introduction and Motivation](#1-introduction-and-motivation)
2. [Background: A Taxonomy of Engine Layouts](#2-background-a-taxonomy-of-engine-layouts)
3. [Architectural Principles](#3-architectural-principles)
4. [Comparative Analysis of Existing Engines](#4-comparative-analysis-of-existing-engines)
5. [Proprietary AAA Engines](#5-proprietary-aaa-engines)
6. [Trade-Off Synthesis](#6-trade-off-synthesis)
7. [The GP Engine Design](#7-the-gp-engine-design)
8. [Repository Root: Why Every File Earns Its Place](#8-repository-root-why-every-file-earns-its-place)
9. [The `source/` Tree](#9-the-source-tree)
10. [Module Anatomy](#10-module-anatomy)
11. [The Multi-Backend Pattern](#11-the-multi-backend-pattern)
12. [GPBT: The Build Tool That Glues It Together](#12-gpbt-the-build-tool-that-glues-it-together)
13. [Educational Rationale](#13-educational-rationale)
14. [References](#14-references)

---

## 1. Introduction and Motivation

### 1.1 The Directory Tree Is the Architecture

Every nontrivial codebase has an *implicit* architecture, the de facto rules about who depends on whom, which symbols cross which boundaries, and what is allowed to change without notice. In a small project these rules live in the heads of a few maintainers. In an engine spanning two million lines of C++, several rendering backends, a dozen platforms, and a fifteen-year horizon, the rules **must** be made physical, otherwise they decay into chaos within a release cycle.

The directory tree is where architectural rules become hard constraints. A folder named `private/` is a contract: nothing outside the module may include from here. A folder named `rhi/vulkan/` is an interface boundary: this is one of several swappable implementations of a stable abstraction. A `CMakeLists.txt` next to a `README.md` and a `CHANGELOG.md` is a unit-of-ownership marker: this folder is a thing that can be reasoned about, versioned, and replaced as a whole.

A well-designed engine layout makes good architecture **easy** and bad architecture **hard**. A poorly designed one inverts the polarity, every dependency violation becomes the path of least resistance, and the codebase erodes one expedient `#include "../../private/foo.hpp"` at a time.

### 1.2 The Educational Gap

The four canonical references for studying engine architecture are *Game Engine Architecture* by Jason Gregory, the Unreal Engine source tree, the Godot source tree, and id Software's open-sourced engines. Each is invaluable; none was designed primarily for **pedagogy**.

- *Game Engine Architecture* is a book; you cannot grep it.
- The Unreal Engine source tree is enormous (over 200,000 files) and assumes Epic's twenty-year tribal knowledge.
- Godot's tree is approachable but couples engine and editor tightly, and uses SCons (a system most students never meet again).
- id Tech is dated by modern standards, excellent C, but predating modern C++, RHIs, and multi-platform mobile/console concerns.

The **Graphical Playground (GP) Engine** is built with an explicit second goal alongside production-grade performance: a student who clones the repository should be able to navigate it, find any subsystem in under a minute, and understand from the layout alone *why* the file they are reading is where it is. This educational mandate shapes every layout decision in this paper.

### 1.3 Thesis

We argue that an engine's directory layout must encode four orthogonal axes of separation:

1. **Lifecycle separation**: launchers vs. runtime vs. tools vs. plug-ins vs. shaders.
2. **Visibility separation**: public API vs. internal-shared headers vs. private implementation.
3. **Backend pluralism**: a stable abstraction (`rhi/base`) coexisting with many concrete implementations (`rhi/vulkan`, `rhi/d3d12`, `rhi/metal`, `rhi/null`).
4. **Discoverability**: each unit of ownership ships with documentation, change history, benchmarks, and tests **co-located** with the code, not scattered into satellite directories.

Sections 2–6 survey how existing engines handle each axis. Section 7 onward presents the GP Engine layout in full.

---

## 2. Background: A Taxonomy of Engine Layouts

Across public source trees and architecture talks, five distinct layout strategies emerge. They are not exclusive — mature engines combine elements of several — but each is *predominantly* one strategy.

### 2.1 Strategy A: Flat-with-Prefix-Conventions

**Exemplar:** Quake 1 (1996).

The original Quake source tree is essentially a single directory of `.c` files distinguished by name prefix: `cl_*` for client, `sv_*` for server, `r_*` for renderer, `snd_*` for sound, `cd_*` for CD audio. There are no subdirectories segregating subsystems, and yet anyone reading the code in an editor knows immediately which subsystem a file belongs to.

| Pro | Con |
|---|---|
| Zero ceremony to add a new file. | No mechanical enforcement of dependencies, prefixes are aspirational. |
| Trivially greppable. | Does not scale past a few hundred files. |
| Globbing build systems work out of the box. | No multi-backend story. |

This is a beautiful pattern for a small engine but cannot survive contact with cross-platform concerns or pluggable backends.

### 2.2 Strategy B: Subsystem Folders + Game-DLL Split

**Exemplars:** Quake III (1999), Doom 3 (2004), Cocos2d-x.

Doom 3's `neo/` directory is a textbook example. Each subsystem (`renderer/`, `framework/`, `idlib/`, `sound/`, `cm/` for collision model, `ui/`, `tools/`, `sys/` for platform) is a sibling subdirectory and compiles to its own static library. The crucial architectural move is the **engine-vs-game DLL boundary**: `game/` and `d3xp/` (the expansion) compile to a separate dynamic library that the engine loads at startup. Gameplay code can be rebuilt and reloaded without restarting the engine.

| Pro | Con |
|---|---|
| Subsystems are physically isolated; dependencies are visible at the project level. | The "game" abstraction does not generalize, modern engines need many runtime-loadable plugins, not just one game DLL. |
| The DLL boundary protects the engine from gameplay churn. | No public/private discipline within a subsystem. |
| Build system (Visual Studio + SCons) maps cleanly to the directory tree. | Tightly coupled tools (`q3radiant`, `q3map`) live as siblings, blurring lifecycle. |

This pattern crystallized the modern engine layout vocabulary, but the modern era required two refinements: **dependency visibility within a module** (Strategy D) and **a generalized plug-in architecture** (Strategy E).

### 2.3 Strategy C: Subsystem Folders + Servers Indirection

**Exemplar:** Godot Engine.

Godot ([source](https://github.com/godotengine/godot)) organizes its top level around a deliberate split between `scene/` (the SceneTree, gameplay-facing nodes) and `servers/` (the headless backend services those nodes talk to: `RenderingServer`, `PhysicsServer2D`, `PhysicsServer3D`, `AudioServer`, `NavigationServer`). Other top-level dirs cover the rest: `core/`, `drivers/`, `platform/`, `editor/`, `modules/` (compile-time-pluggable features like GDScript and Mono), `thirdparty/`, `tests/`, `main/`.

The signature pattern is the **scene-to-server indirection**: a `MeshInstance3D` node never talks to the rendering implementation directly. It calls `RenderingServer::mesh_create()`, which is an abstract API whose concrete implementation lives in `servers/rendering/` and whose driver lives in `drivers/vulkan/` or `drivers/gles3/`. This three-layer indirection (scene → server → driver) is Godot's principal architectural innovation.

| Pro | Con |
|---|---|
| Scene code is fully decoupled from any specific RHI or physics implementation. | Three layers of indirection adds cognitive overhead. |
| Server APIs are stable; drivers can be added without touching gameplay. | Compile-time `modules/` are not the same as runtime plug-ins, the loaded set is fixed at build time. |
| `core/` is genuinely small and reusable across non-engine tools. | SCons (`SConstruct` + per-dir `SCsub`) is unfamiliar to most C++ engineers. |

### 2.4 Strategy D: Pillar/Module Monorepo with Visibility Discipline

**Exemplar:** Unreal Engine 4 / 5.

Unreal's `Engine/Source/` ([Epic's directory documentation](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-directory-structure)) splits the source tree into five canonical buckets:

- `Runtime/` — code that ships in a packaged game.
- `Editor/` — editor-only code, stripped from shipping builds.
- `Developer/` — dev/cooked code, excluded from Shipping builds.
- `Programs/` — standalone tools (UnrealBuildTool, UnrealHeaderTool, ShaderCompileWorker).
- `ThirdParty/` — vendored externals wrapped as first-class modules.

Inside any one module, e.g. `Engine/Source/Runtime/Core/`, Epic enforces a strict three-folder visibility discipline:

- `Public/` — headers exposed to dependent modules; UnrealBuildTool auto-adds these to consumers' include paths.
- `Private/` — `.cpp` and internal headers; the compilation unit's `IMPLEMENT_MODULE` lives here.
- `Internal/` (UE5-only) — headers shared with a controlled subset of modules but not the world.

This is augmented by `*.Build.cs` rules files (one per module) and `*.Target.cs` rules files (one per executable), processed by the C# UnrealBuildTool. The crucial property is that **dependency visibility is declarative**: a module declares `PublicDependencyModuleNames` and `PrivateDependencyModuleNames`, and UBT propagates include paths and link directives accordingly. A module that did not declare a dependency cannot accidentally pick one up via transitive headers, the build system enforces it.

| Pro | Con |
|---|---|
| `Public/Private/Internal` handles visibility discipline better than any other approach in this survey. | UBT is a large C# program with its own learning curve. |
| Lifecycle buckets (`Runtime/Editor/Developer/Programs/`) cleanly separate shipping concerns. | The directory tree is enormous, students drown before they orient. |
| Plug-ins re-use the same `Source/<Module>/Public/Private` shape and are first-class. | Naming conventions (PascalCase, `F`/`U`/`A`/`I`/`S`/`T` prefixes) compound with size. |
| `*.Build.cs` is fully programmatic, an engineer can express any rule. | Programmatic flexibility cuts both ways, no two `Build.cs` look alike. |

This is the strategy GP Engine takes most directly from, with educational simplifications detailed in §7.

### 2.5 Strategy E: Foundation + Universal Module/Gem/Package

**Exemplars:** O3DE (Open 3D Engine), Unity, Bevy.

The Strategy-E philosophy: **almost everything is a module**, including subsystems traditionally considered "core." Only a small foundation library is special-cased; everything else is a uniform unit that can be added, removed, or replaced.

**O3DE** ([source](https://github.com/o3de/o3de)) splits its tree into `Code/Framework/` and `Gems/`. The framework is the foundation: `AzCore` (allocators, reflection, EBus messaging, components), `AzFramework`, `AzToolsFramework`, `AzNetworking`, `AtomCore`. Everything else, including the rendering engine (Atom), physics, audio, and terrain, is a **Gem** in `Gems/`. A Gem ships its own CMake, its own assets, its own components, and is loaded by a manifest. An "engine build" is a curated set of enabled Gems.

**Unity** does the same conceptually, in modern Unity, render pipelines (URP, HDRP), input, netcode, and even core gameplay systems ship as **UPM packages** under `Packages/`, versioned and dependency-managed by the Unity Package Manager.

**Bevy** ([source](https://github.com/bevyengine/bevy)) is the cleanest expression: its repo root is `crates/`, with ~50 sibling `bevy_*` Cargo crates (`bevy_ecs`, `bevy_render`, `bevy_pbr`, `bevy_audio`, `bevy_ui`, `bevy_input`, `bevy_winit`, ...). The umbrella `bevy` crate just re-exports them behind feature flags. Cargo's feature system is the dependency manifest.

| Pro | Con |
|---|---|
| Maximum flexibility, anything can be replaced. | The foundation/Gem boundary is itself a contentious decision (what *should* be in `AzCore`?). |
| Out-of-tree extension is trivial, write a new Gem/package/crate. | Many Gems means many `CMakeLists.txt` files to maintain. |
| Discoverability scales sub-linearly: `Gems/` lists everything available. | Loose-ish coupling can mask hidden ordering / lifecycle dependencies that bite at runtime. |

### 2.6 Summary Table

| Strategy | Exemplar | Module unit | Visibility primitive | Build system |
|---|---|---|---|---|
| A. Flat + prefix | Quake 1 | File | None (convention) | Make |
| B. Subsystem dirs + game DLL | Doom 3 | Static lib | Per-subsystem .h | SCons / VS |
| C. Servers indirection | Godot | Subsystem dir | None within module | SCons (SCsub) |
| D. Pillar monorepo | Unreal 5 | `*.Build.cs` module | `Public/Private/Internal` | UnrealBuildTool (C#) |
| E. Foundation + universal module | O3DE / Bevy | Gem / Crate | Per-Gem manifest / Cargo features | CMake / Cargo |

---

## 3. Architectural Principles

Before presenting the GP Engine layout, we crystallize the design principles every layout must address.

### 3.1 The Public/Private Boundary

Within a module $M$, source files split into two disjoint sets:

$$M = M_{public} \sqcup M_{private}$$

with the rule that **no consumer of $M$ may include from $M_{private}$**. Concretely, when building $M$, the include path looks like:

```
-I.../M/public          (PUBLIC, propagated to consumers)
-I.../M/private         (PRIVATE, this build only)
```

A third tier, `internal/`, resolves an awkward middle case: headers that need to be shared **between modules in the same engine build** but never exposed to user code. Example: a private contract between `engine` and the `editor` launcher that is not part of the SDK surface.

```
-I.../M/internal        (PRIVATE-but-friend, shared with explicit allowlist)
```

UE5 ships exactly this three-tier split. We ship it too.

### 3.2 Build-Time vs Link-Time vs Runtime Coupling

A dependency between two modules can manifest at three distinct stages:

1. **Compile-time**: $M_A$ needs $M_B$'s headers to compile. This is the include-path question.
2. **Link-time**: $M_A$ statically references symbols defined in $M_B$. This is the linker question.
3. **Runtime**: $M_A$ loads $M_B$ as a shared library at runtime via `dlopen`/`LoadLibrary`. This is the plug-in question.

These are independent. A plug-in module like `rhi/vulkan` is a runtime dependency of the engine: it must exist next to the executable, but the engine binary contains zero static references to Vulkan symbols. A precompiled-shader header like `core/public/CoreMinimal.hpp` is a compile-time dependency that creates no link or runtime artifact at all.

A naïve build system collapses all three into a single `target_link_libraries`. A grown-up build system, ours included, expresses each independently:

| GPBT Macro | Compile | Link | Runtime |
|---|---|---|---|
| `gpAddPublicDependency(B)` | Yes (propagated) | Yes (propagated) | n/a |
| `gpAddPrivateDependency(B)` | Yes | Yes | n/a |
| `gpAddInternalDependency(B)` | Yes (semantically internal) | Yes | n/a |
| `gpAddDynamicDependency(B)` | No | No | Yes (build-order edge only) |

This four-way split is one of the principal contributions of the GP Engine layout.

### 3.3 The Backend Pluralism Problem

A modern cross-platform engine cannot commit to a single graphics API, audio backend, physics library, or asset format parser. The Render Hardware Interface (RHI) abstraction must support D3D11, D3D12, Vulkan, Metal, OpenGL, and a null backend for headless servers. Audio must support OpenAL, XAudio2 (Windows), CoreAudio (macOS), and FMOD (commercial). Physics must offer Jolt and PhysX. Asset parsers must cover OBJ, FBX, glTF, JSON, INI, XML, YAML.

The clean solution decomposes each pluralistic subsystem into a **base abstraction module** and **N concrete backend modules**:

```
audio/
  base/       ← abstract API (interfaces, factory)
  openal/     ← concrete backend
  xaudio2/    ← concrete backend
  coreaudio/  ← concrete backend
  fmod/       ← concrete backend
```

This pattern is foreshadowed in Godot's `servers/rendering` + `drivers/vulkan` split and refined in Unreal's RHI module structure. We adopt it uniformly across `rhi/`, `audio/`, `physics/`, and `parser/`.

The crucial architectural property: **the base module never link-depends on the backends**. Backends register themselves at runtime via factory pattern. This keeps the dependency DAG acyclic and makes adding a new backend a purely additive change.

### 3.4 Cross-Platform Abstraction

Platform-specific code is unavoidable but should be confined. Two patterns dominate:

- **Per-platform subdirectory** (`platforms/windows/`, `platforms/linux/`, `platforms/macos/`) inside a generic module. Selected at compile time by `gpTargetExcludeDirectory(...)` calls in the module's `CMakeLists.txt`.
- **Per-backend module** when the platform-specific code is large enough to warrant its own ownership unit (e.g., `rhi/d3d12` is Windows-only and is its own module).

The two patterns are duals: small platform code lives in subfolders inside a shared module (cheap, low ceremony); large platform code becomes its own module (better isolation, longer compile times).

### 3.5 Discoverability and Co-Located Documentation

A module is not just code, it is a **unit of ownership**. The complete description of a module $M$ requires:

- Code (`public/`, `private/`, `internal/`)
- Build description (`CMakeLists.txt`)
- Documentation (`docs/`, `README.md`)
- Change history (`CHANGELOG.md`)
- Tests (`tests/`)
- Benchmarks (`benchmarks/`)

Co-locating all of these in the module folder means:

1. A reader who navigates to `source/runtime/audio/openal/` sees the README *next to* the code.
2. Refactoring or removing a module is one `git rm -r` away, no satellite cleanup.
3. Each module has a versioned changelog independent of the engine's master changelog, useful for SDK consumers tracking ABI changes.

This co-location principle is observable in O3DE's Gems and in Bevy's crates. We adopt it strictly.

---

## 4. Comparative Analysis of Existing Engines

Here is what each engine actually does with those principles.

### 4.1 Unreal Engine 5

**Source**: [`github.com/EpicGames/UnrealEngine`](https://github.com/EpicGames/UnrealEngine) (private repo, public docs at [`dev.epicgames.com/documentation/en-us/unreal-engine`](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-directory-structure)).

<FileTree data={[
  {
    name: 'UnrealEngine',
    type: 'folder',
    children: [
      {
        name: 'Engine',
        type: 'folder',
        children: [
          {
            name: 'Source',
            type: 'folder',
            icon: 'folder-src',
            children: [
              { name: 'Runtime', type: 'folder', icon: 'folder-job', chevron: false, description: 'Core, RenderCore, Renderer, RHI, Engine, ...' },
              { name: 'Editor', type: 'folder', icon: 'folder-ui', chevron: false, description: 'UnrealEd, LevelEditor, Kismet, ...' },
              { name: 'Developer', type: 'folder', icon: 'folder-controller', chevron: false, description: 'AssetTools, TargetPlatform, ...' },
              { name: 'Programs', type: 'folder', icon: 'folder-tools', chevron: false, description: 'UnrealBuildTool, ShaderCompileWorker, ...' },
              { name: 'ThirdParty', type: 'folder', icon: 'folder-lib', chevron: false }
            ]
          },
          { name: 'Plugins', type: 'folder', icon: 'folder-plugin', chevron: false, description: 'Engine-wide plugins (Niagara, Chaos, ...)' },
          { name: 'Content', type: 'folder', icon: 'folder-resource', chevron: false },
          { name: 'Shaders', type: 'folder', icon: 'folder-shader', chevron: false },
          { name: 'Binaries', type: 'folder', icon: 'folder-dist', chevron: false }
        ]
      },
      { name: 'Templates', type: 'folder', icon: 'folder-template', chevron: false },
      { name: 'Samples', type: 'folder', icon: 'folder-examples', chevron: false },
      { name: 'Setup.bat', type: 'file', icon: 'console' },
      { name: 'Setup.sh', type: 'file', icon: 'console' },
      { name: 'GenerateProjectFiles.bat', type: 'file', icon: 'console' },
      { name: 'GenerateProjectFiles.sh', type: 'file', icon: 'console' }
    ]
  }
]}/>

A typical module:

<FileTree data={[
  {
    name: 'Engine/Source/Runtime/Core',
    type: 'folder',
    icon: 'folder-core',
    children: [
      { name: 'Core.Build.cs', type: 'file', icon: 'csharp', description: 'Module rules (UnrealBuildTool)' },
      { name: 'Public', type: 'folder', icon: 'folder-public', chevron: false, description: 'Exported headers' },
      { name: 'Private', type: 'folder', icon: 'folder-private', chevron: false, description: '.cpp and internal headers' },
      { name: 'Classes', type: 'folder', icon: 'folder-class', chevron: false, description: 'Legacy UObject headers (UE4-era)' },
      { name: 'Internal', type: 'folder', icon: 'folder-private', chevron: false, description: 'UE5-only restricted-share headers' }
    ]
  }
]}/>

**Strengths.**
- The `Runtime/Editor/Developer/Programs/` lifecycle split is the clearest in this survey.
- `Public/Private/Internal` handles visibility better than any other engine here.
- `*.Build.cs` rules give per-module declarative dependencies.
- Plugins re-use the same module shape, no special case.

**Weaknesses.**
- Total scale (200,000+ files) overwhelms students.
- UnrealBuildTool is C#, foreign to the C++ workflow it manages.
- Naming convention overhead (`F`/`U`/`A`/`I`/`S`/`T` prefixes, PascalCase everywhere).
- The repo is gated behind the EULA-signed Epic GitHub program.

### 4.2 Godot Engine

**Source**: [`github.com/godotengine/godot`](https://github.com/godotengine/godot).

<FileTree data={[
  {
    name: 'godot',
    type: 'folder',
    children: [
      { name: 'core', type: 'folder', icon: 'folder-core', chevron: false },
      { name: 'scene', type: 'folder', icon: 'folder-simulations', chevron: false, description: 'SceneTree, nodes, gameplay primitives' },
      { name: 'servers', type: 'folder', icon: 'folder-server', chevron: false, description: 'RenderingServer, PhysicsServer2D/3D, ...' },
      { name: 'drivers', type: 'folder', icon: 'folder-directive', chevron: false, description: 'Vulkan, GLES3, ALSA, ...' },
      { name: 'modules', type: 'folder', icon: 'folder-plugin', chevron: false, description: 'Compile-time-pluggable features' },
      { name: 'platform', type: 'folder', icon: 'folder-base', chevron: false, description: 'Per-OS entry points' },
      { name: 'editor', type: 'folder', icon: 'folder-ui', chevron: false },
      { name: 'thirdparty', type: 'folder', icon: 'folder-lib', chevron: false },
      { name: 'tests', type: 'folder', icon: 'folder-test', chevron: false },
      { name: 'main', type: 'folder', icon: 'folder-app', chevron: false },
      { name: 'doc', type: 'folder', icon: 'folder-docs', chevron: false },
      { name: 'misc', type: 'folder', icon: 'folder-other', chevron: false }
    ]
  }
]}/>

**Strengths.**
- The scene/servers/drivers three-layer indirection is a clean separation of concerns.
- `core/` is small enough that newcomers can master it.
- Top-level layout is shallow and self-explanatory.

**Weaknesses.**
- No within-module visibility discipline (no `Public/Private/Internal` equivalent).
- SCons (`SConstruct` + `SCsub`) is not the C++ industry default.
- `modules/` are compile-time-only, no runtime plug-in story comparable to UE.

### 4.3 id Tech 4 (Doom 3)

**Source**: [`github.com/id-Software/DOOM-3`](https://github.com/id-Software/DOOM-3), reviewed by Fabien Sanglard at [`fabiensanglard.net/doom3/`](https://fabiensanglard.net/doom3/).

<FileTree data={[
  {
    name: 'Doom3',
    type: 'folder',
    children: [
      {
        name: 'neo',
        type: 'folder',
        icon: 'folder-src',
        children: [
          { name: 'idlib', type: 'folder', icon: 'folder-lib', chevron: false, description: 'Foundation: containers, math, strings' },
          { name: 'framework', type: 'folder', icon: 'folder-core', chevron: false, description: 'Engine glue, file system, console, command system' },
          { name: 'renderer', type: 'folder', icon: 'folder-review', chevron: false },
          { name: 'sound', type: 'folder', icon: 'folder-audio', chevron: false },
          { name: 'cm', type: 'folder', icon: 'folder-simulations', chevron: false, description: 'Collision model' },
          { name: 'ui', type: 'folder', icon: 'folder-ui', chevron: false },
          { name: 'tools', type: 'folder', icon: 'folder-tools', chevron: false, description: 'Radiant editor, etc.' },
          { name: 'sys', type: 'folder', icon: 'folder-base', chevron: false, description: 'Platform abstraction' },
          { name: 'game', type: 'folder', icon: 'folder-controller', chevron: false, description: 'Game DLL (Doom 3 vanilla)' },
          { name: 'd3xp', type: 'folder', icon: 'folder-plugin', chevron: false, description: 'Game DLL (expansion)' }
        ]
      },
      { name: 'base', type: 'folder', icon: 'folder-resource', chevron: false, description: 'Data: assets, defs, scripts' }
    ]
  }
]}/>

**Strengths.**
- Crisp engine/game DLL split, gameplay can be hot-reloaded.
- `sys/` is a clear platform abstraction layer.
- Subsystems are cleanly siblings with no cross-pollution.

**Weaknesses.**
- C-era code, no public/private discipline.
- Tools live as siblings of subsystems, no lifecycle separation.
- Single "game" DLL does not generalize to many runtime plug-ins.

### 4.4 O3DE (Open 3D Engine)

**Source**: [`github.com/o3de/o3de`](https://github.com/o3de/o3de).

<FileTree data={[
  {
    name: 'o3de',
    type: 'folder',
    children: [
      { name: 'Code', type: 'folder', icon: 'folder-src', children: [
        { name: 'Framework', type: 'folder', icon: 'folder-core', chevron: false, description: 'AzCore, AzFramework, AzToolsFramework, ...' }
      ]},
      { name: 'Gems', type: 'folder', icon: 'folder-plugin', chevron: false, description: 'Everything else: rendering, physics, audio, ...' },
      { name: 'Templates', type: 'folder', icon: 'folder-template', chevron: false },
      { name: 'Tools', type: 'folder', icon: 'folder-tools', chevron: false },
      { name: 'Registry', type: 'folder', icon: 'folder-config', chevron: false },
      { name: 'cmake', type: 'folder', icon: 'folder-config', chevron: false },
      { name: 'python', type: 'folder', icon: 'folder-python', chevron: false },
      { name: 'scripts', type: 'folder', icon: 'folder-scripts', chevron: false }
    ]
  }
]}/>

A Gem looks like:

<FileTree data={[
  {
    name: 'Gems/Atom',
    type: 'folder',
    icon: 'folder-plugin',
    children: [
      { name: 'CMakeLists.txt', type: 'file', icon: 'cmake' },
      { name: 'Code', type: 'folder', icon: 'folder-src', children: [
        { name: 'Source', type: 'folder', icon: 'folder-src', chevron: false },
        { name: 'Include', type: 'folder', icon: 'folder-public', chevron: false },
        { name: 'Tests', type: 'folder', icon: 'folder-test', chevron: false }
      ]},
      { name: 'Assets', type: 'folder', icon: 'folder-resource', chevron: false },
      { name: 'Tools', type: 'folder', icon: 'folder-tools', chevron: false },
      { name: 'Registry', type: 'folder', icon: 'folder-config', chevron: false },
      { name: 'gem.json', type: 'file', icon: 'json', description: 'Manifest' }
    ]
  }
]}/>

**Strengths.**
- Maximum modularity, anything is a Gem.
- CMake-based, familiar to C++ engineers.
- Out-of-tree Gems are first-class citizens.

**Weaknesses.**
- The `Code/Framework` vs `Gems` boundary is a perpetual judgment call.
- Many Gems means many CMakeLists, with characteristic duplication.
- Gem manifests (`gem.json`) introduce a second descriptor language alongside CMake.

### 4.5 Bevy

**Source**: [`github.com/bevyengine/bevy`](https://github.com/bevyengine/bevy).

<FileTree data={[
  {
    name: 'bevy',
    type: 'folder',
    children: [
      { name: 'crates', type: 'folder', icon: 'folder-rust', children: [
        { name: 'bevy_app', type: 'folder', icon: 'folder-app', chevron: false },
        { name: 'bevy_ecs', type: 'folder', icon: 'folder-element', chevron: false },
        { name: 'bevy_render', type: 'folder', icon: 'folder-review', chevron: false },
        { name: 'bevy_pbr', type: 'folder', icon: 'folder-simulations', chevron: false },
        { name: 'bevy_audio', type: 'folder', icon: 'folder-audio', chevron: false },
        { name: 'bevy_ui', type: 'folder', icon: 'folder-ui', chevron: false },
        { name: 'bevy_winit', type: 'folder', icon: 'folder-desktop', chevron: false },
        { name: '(~50 more crates)', type: 'folder', chevron: false }
      ]},
      { name: 'examples', type: 'folder', icon: 'folder-examples', chevron: false },
      { name: 'benches', type: 'folder', icon: 'folder-benchmark', chevron: false },
      { name: 'tests', type: 'folder', icon: 'folder-test', chevron: false },
      { name: 'tools', type: 'folder', icon: 'folder-tools', chevron: false },
      { name: 'Cargo.toml', type: 'file', icon: 'toml', description: 'Workspace manifest' }
    ]
  }
]}/>

**Strengths.**
- The cleanest expression of "everything is a module" in any production engine.
- Cargo features (`bevy/audio`, `bevy/render`) provide compile-time module selection without bespoke tooling.
- Each crate has its own `Cargo.toml` declaring its dependencies, no central monolith.

**Weaknesses.**
- Rust-specific, the architecture relies on Cargo's feature system; reproducing it in C++ requires bespoke work.
- ~50 crates is a lot of `Cargo.toml` to maintain.
- No public/private split *within* a crate, Rust's `pub`/`pub(crate)` is module-level, not directory-level.

### 4.6 Unity

Source closed; project layout documented at [`docs.unity3d.com/Manual/SpecialFolders.html`](https://docs.unity3d.com/Manual/SpecialFolders.html).

**Project-side layout** (the only public side):

<FileTree data={[
  {
    name: 'MyUnityProject',
    type: 'folder',
    children: [
      { name: 'Assets', type: 'folder', icon: 'folder-resource', chevron: false, description: 'User content' },
      { name: 'Packages', type: 'folder', icon: 'folder-packages', chevron: false, description: 'UPM packages (engine modules)' },
      { name: 'ProjectSettings', type: 'folder', icon: 'folder-config', chevron: false },
      { name: 'Library', type: 'folder', icon: 'folder-lib', chevron: false, description: 'Generated cache (gitignored)' },
      { name: 'Logs', type: 'folder', icon: 'folder-log', chevron: false },
      { name: 'Temp', type: 'folder', icon: 'folder-temp', chevron: false }
    ]
  }
]}/>

UPM packages under `Packages/` deliver render pipelines (URP, HDRP), input, netcode, and increasingly even core systems as versioned modules. Conceptually this maps to O3DE's Gems and Bevy's crates. The engine itself remains a closed-source native runtime.

### 4.7 Cocos2d-x

**Source**: [`github.com/cocos2d/cocos2d-x`](https://github.com/cocos2d/cocos2d-x).

<FileTree data={[
  {
    name: 'cocos2d-x',
    type: 'folder',
    children: [
      { name: 'cocos', type: 'folder', icon: 'folder-src', children: [
        { name: '2d', type: 'folder', icon: 'folder-element', chevron: false },
        { name: '3d', type: 'folder', icon: 'folder-element', chevron: false },
        { name: 'audio', type: 'folder', icon: 'folder-audio', chevron: false },
        { name: 'base', type: 'folder', icon: 'folder-core', chevron: false },
        { name: 'math', type: 'folder', icon: 'folder-base', chevron: false },
        { name: 'network', type: 'folder', icon: 'folder-connection', chevron: false },
        { name: 'physics', type: 'folder', icon: 'folder-simulations', chevron: false },
        { name: 'physics3d', type: 'folder', icon: 'folder-simulations', chevron: false },
        { name: 'navmesh', type: 'folder', icon: 'folder-base', chevron: false },
        { name: 'platform', type: 'folder', icon: 'folder-base', chevron: false },
        { name: 'renderer', type: 'folder', icon: 'folder-review', chevron: false },
        { name: 'scripting', type: 'folder', icon: 'folder-scripts', chevron: false },
        { name: 'ui', type: 'folder', icon: 'folder-ui', chevron: false },
        { name: 'editor-support', type: 'folder', icon: 'folder-tools', chevron: false }
      ]},
      { name: 'extensions', type: 'folder', icon: 'folder-plugin', chevron: false },
      { name: 'external', type: 'folder', icon: 'folder-lib', chevron: false, description: 'Third-party dependencies' },
      { name: 'templates', type: 'folder', icon: 'folder-template', chevron: false },
      { name: 'tools', type: 'folder', icon: 'folder-tools', chevron: false },
      { name: 'tests', type: 'folder', icon: 'folder-test', chevron: false },
      { name: 'cmake', type: 'folder', icon: 'folder-config', chevron: false }
    ]
  }
]}/>

A hybrid of Strategy B and Strategy C: domain-sliced subsystems like Godot, but no servers indirection, the renderer is talked to directly. CMake-based, which simplifies onboarding.

---

## 5. Proprietary AAA Engines

Closed-source engines cannot be cloned, but their architectures have been documented extensively at GDC and SIGGRAPH. The patterns matter for this paper.

### 5.1 Frostbite (DICE / EA)

The Frostbite engine pioneered modern data-oriented design in the AAA space. Two foundational talks define its philosophy:

- *Culling the Battlefield: Data Oriented Design in Practice*, GDC 2011 ([source](https://www.ea.com/frostbite/news/culling-the-battlefield-data-oriented-design-in-practice)) explains the migration away from OOP-heavy hierarchies toward flat, struct-of-array layouts driven by access-pattern analysis.
- *FrameGraph: Extensible Rendering Architecture in Frostbite*, Yuriy O'Donnell, GDC 2017 ([GDC Vault](https://www.gdcvault.com/play/1024612/FrameGraph-Extensible-Rendering-Architecture-in)) describes the **FrameGraph**, a declarative rendering pass system where each pass declares its inputs and outputs, and the framework computes resource lifetimes automatically.

The architectural lesson for layout: Frostbite treats **rendering passes as modules** with declarative inputs and outputs, an extreme form of the principle that visibility and dependency must be made declarative, not implicit.

### 5.2 Decima (Guerrilla Games)

Decima is described in the SIGGRAPH 2017 paper *Decima Engine: Visibility in Horizon Zero Dawn* ([source](https://www.guerrilla-games.com/read/decima-engine-visibility-in-horizon-zero-dawn)) and the GDC 2025 talk *Nodes and Native Code: DECIMA's Visual Programming for Every Discipline* ([GDC Vault](https://gdcvault.com/play/1035551/Tools-Summit-Nodes-and-Native), [Guerrilla mirror](https://www.guerrilla-games.com/read/Nodes-and-Native)).

The key architectural concept is the **MeshResource tree**, a unified resource description layer that all subsystems (rendering, physics, animation, audio, gameplay) consume through a common graph. This is structurally similar to Godot's `RenderingServer`/`PhysicsServer` indirection but unified across all subsystems, not per-subsystem.

### 5.3 Anvil / AnvilNext (Ubisoft Montreal)

Anvil is described in *Inside Anvil: The Technology Powering Assassin's Creed Shadows* ([Ubisoft article](https://www.ubisoft.com/en-us/game/assassins-creed/news/3aw71nNlR7kZJzoCATuNtm/inside-anvil-the-technology-powering-assassins-creed-shadows)) and the GDC 2025 talk *Rendering 'Assassin's Creed Shadows'* ([GDC Vault](https://gdcvault.com/play/1035526/Rendering-Assassin-s-Creed-Shadows)). The 2025 retrospective video *From Assassin's Creed to Rainbow Six Siege: Anvil brings iconic games to life for 20 years* ([YouTube](https://www.youtube.com/watch?v=klKqvrKYKTs)) discusses Ubisoft's monorepo consolidation strategy across multiple internal engines.

The architectural lesson: at AAA scale, even multiple internal engines (Anvil + Snowdrop) end up consolidating into a **shared monorepo**, because cross-team module reuse outweighs the autonomy of separate codebases.

### 5.4 Snowdrop (Ubisoft Massive)

Snowdrop is described in *The History of Snowdrop: From R&D Concept to AAA Engine* ([Massive blog](https://www.massive.se/blog/games-technology/snowdrop/the-history-of-snowdrop-from-rd-concept-to-aaa-engine/)) and *Advanced Graphics Techniques Tutorial: Efficient Rendering in 'The Division 2'*, GDC 2019 ([GDC Vault](https://gdcvault.com/play/1026293/Advanced-Graphics-Techniques-Tutorial-Efficient)).

Massive's architectural theme is the **node-graph editor as primary interface**, a single graph-based editor replaces dozens of bespoke tools. Architecturally this implies the engine must expose every subsystem through a common scriptable/serializable contract, which in turn imposes discipline on inter-module APIs.

### 5.5 RE Engine (Capcom)

The Capcom IR interview *Vol. 03 with Jun Takeuchi* ([source](https://www.capcom.co.jp/ir/english/interview/2016/vol03.html)) explains the philosophy behind RE Engine: native C++ subsystems with a C# scripting layer running on a custom VM (REVM). The engine famously cut iteration time by 90% versus its predecessor (MT Framework) by aggressive separation of immutable data assets from mutable logic, foreshadowing the asset-graph approach that Snowdrop and Decima would later formalize.

### 5.6 Naughty Dog Engine

Christian Gyrling's GDC 2015 talk *Parallelizing the Naughty Dog Engine Using Fibers* ([GDC Vault](https://gdcvault.com/play/1022186/Parallelizing-the-Naughty-Dog-Engine), [PDF slides](https://media.gdcvault.com/gdc2015/presentations/Gyrling_Christian_Parallelizing_The_Naughty.pdf)) is the canonical reference on fiber-based job systems. The architectural takeaway is **frame-as-a-graph**: subsystems publish jobs into a shared dependency graph, and the scheduler resolves ordering and parallelism. Layout-wise, this means subsystems must export their job-shaped APIs alongside their traditional procedural ones.

### 5.7 Source 2 (Valve)

Documented in *Source 2* ([Wikipedia](https://en.wikipedia.org/wiki/Source_2)) and the long-form analysis *The Evolution of Valve's Source Engine* ([Deus In Machina](https://www.deusinmachina.net/p/the-evolution-of-valves-source-engine)). Valve's distinguishing architectural pattern is **incremental subsystem replacement**: Rubikon physics replaced Havok, Panorama UI replaced VGUI, Vulkan replaced fixed-function GL, all without a "Source 3" rewrite. Layout-wise, this requires every subsystem to be replaceable in isolation, which in turn requires the same backend-pluralism pattern (§3.3) we adopt.

---

## 6. Trade-Off Synthesis

A few rules emerge from the survey.

### 6.1 What Every Engine Layout Must Provide

| Property | Required for | Provided by |
|---|---|---|
| Public/Private boundary | Long-term ABI stability | Per-module folder split (UE) |
| Lifecycle separation | Build-time stripping (shipping vs editor) | Top-level lifecycle dirs (UE) |
| Backend pluralism | Cross-platform / multi-vendor | Base + concrete subdirs (Godot, our `rhi/base + rhi/vulkan`) |
| Dependency declarativity | Build correctness, refactor safety | Rules files (UE `.Build.cs`, our GPBT macros) |
| Co-located docs/tests/benchmarks | Discoverability, refactor atomicity | Per-module `docs/`, `tests/`, `benchmarks/` |

### 6.2 What Every Engine Layout Must Avoid

| Anti-pattern | Symptom | Cure |
|---|---|---|
| Implicit transitive includes | Cannot remove a "leaf" module without breakage | Strict include-path discipline (UE `Public/Private`, GPBT) |
| Header-only "core" with everything in it | Unbounded compile times, circular dependency risk | Force `core` to forward-declare; concrete deps elsewhere |
| Tools and runtime interleaved | Cannot strip editor for shipping builds | Lifecycle directories at top level |
| Build description scattered across CMake/scripts | No single source of truth | Single rules-file per module |
| Documentation in `docs/` decoupled from code | Docs rot the moment code moves | Co-located README + CHANGELOG per module |

### 6.3 The Specific Choices We Make Differently

The GP Engine layout is closest to Unreal's. We diverge on three deliberate axes:

1. **CMake instead of UnrealBuildTool.** UBT is excellent but is a C# program. We commit to CMake as the *lingua franca* of C++ build systems, and build our own thin orchestration layer (GPBT) on top. A student already comfortable with CMake can read GPBT in an afternoon.

2. **Lower-case directories, no `F`/`U`/`A`/`I`/`S`/`T` prefix culture.** Unreal's prefixes are powerful for IntelliSense but a high cognitive tax for newcomers. Our directory tree is `lower-snake-case`; our class naming follows standard C++ conventions (PascalCase for types, no compulsory prefix).

3. **Pluralistic subsystems as siblings, not as plug-ins.** In Unreal, RHI backends live under `Engine/Source/Runtime/`; in O3DE they would be Gems. We place `rhi/vulkan`, `rhi/d3d12`, `rhi/metal`, `rhi/null` directly as siblings of `rhi/base`, with the dynamic-dependency mechanism (§3.2) providing the runtime decoupling. This makes the swap-out story visible from the directory tree itself: a student looking at `rhi/` immediately sees every available implementation.

---

## 7. The GP Engine Design

Here is the complete GP Engine repository topology and the rationale behind it. The repository is monorepo-style: engine, examples, build tooling, and CI configuration all live in one tree.

### 7.1 Top-Level Topology

<FileTree
  data={[
    {
      name: 'gp-engine',
      type: 'folder',
      children: [
        { name: '.github', type: 'folder', chevron: false, icon: 'folder-github', description: 'CI workflows, issue templates, funding, branding' },
        { name: '.devcontainer', type: 'folder', chevron: false, icon: 'folder-docker', description: 'Dev container configuration for reproducible onboarding' },
        { name: 'cmake', type: 'folder', chevron: false, icon: 'folder-config', description: 'GPBT, our build tool' },
        { name: 'source', type: 'folder', chevron: false, icon: 'folder-src', description: 'all engine source code' },
        { name: 'examples', type: 'folder', chevron: false, icon: 'folder-examples', description: 'SDK example projects' },
        { name: 'thirdparty', type: 'folder', chevron: false, icon: 'folder-lib', description: 'external dependencies (CMake-orchestrated)' },
        { name: 'toolchain', type: 'folder', chevron: false, icon: 'folder-config', description: 'per-platform CMakePresets and toolchain scripts' },
        { name: 'CMakeLists.txt', type: 'file', icon: 'cmake' },
        { name: 'CMakePresets.json', type: 'file', icon: 'cmake' },
        { name: 'README.md', type: 'file', icon: 'readme' },
        { name: 'CONTRIBUTING.md', type: 'file', icon: 'contributing' },
        { name: 'CODE_OF_CONDUCT.md', type: 'file', icon: 'conduct' },
        { name: 'CITATION.cff', type: 'file', icon: 'citation' },
        { name: 'SECURITY.md', type: 'file', icon: 'lock' },
        { name: 'CONTRIBUTORS.md', type: 'file', icon: 'authors' },
        { name: 'DONORS.md', type: 'file', icon: 'github-sponsors' },
        { name: 'CHANGELOG.md', type: 'file', icon: 'changelog' },
        { name: 'LICENSE.md', type: 'file', icon: 'license' },
        { name: 'LICENSE_HEADER', type: 'file', icon: 'license', description: 'Canonical comment block stamped on every source file' },
        { name: 'VERSION', type: 'file', icon: 'credits' },
        { name: '.editorconfig', type: 'file', icon: 'editorconfig' },
        { name: '.clang-format', type: 'file', icon: 'clangd' },
        { name: '.clang-format-ignore', type: 'file', icon: 'clangd' },
        { name: '.clang-tidy', type: 'file', icon: 'clangd' },
        { name: '.clangd', type: 'file', icon: 'clangd' },
        { name: '.gitignore', type: 'file', icon: 'git' },
        { name: '.gitattributes', type: 'file', icon: 'git' },
        { name: '.git-blame-ignore-revs', type: 'file', icon: 'git' },
        { name: '.mailmap', type: 'file', icon: 'email' },
        { name: '.pre-commit-config.yaml', type: 'file', icon: 'pre-commit'}
      ]
    }
  ]}
/>

Each top-level directory and root file carries deliberate intent. We unpack them in the next section.

### 7.2 The Five Top-Level Directories

<FileTree
  data={[
    {
      name: 'source',
      type: 'folder',
      icon: 'folder-src',
      description: 'All C++/C/HLSL/GLSL source',
      children: []
    },
    {
      name: 'thirdparty',
      type: 'folder',
      icon: 'folder-lib',
      description: 'Isolation barrier for external dependencies',
      children: []
    },
    {
      name: 'examples',
      type: 'folder',
      icon: 'folder-examples',
      description: 'SDK example projects',
      children: []
    },
    {
      name: 'toolchain',
      type: 'folder',
      icon: 'folder-config',
      description: 'Per-platform CMakePresets and toolchain scripts',
      children: []
    },
    {
      name: 'cmake',
      type: 'folder',
      icon: 'folder-config',
      description: 'GPBT, our build tool (everything CMake calls into)',
      children: []
    }
  ]}
/>

The reading order matters: `source/` is the engine; `thirdparty/` is what the engine depends on; `examples/` is what depends on the engine; `toolchain/` and `cmake/` are how all of it is built.

---

## 8. Repository Root: Why Every File Earns Its Place

A common smell in open-source engines is a repository root that contains either too little (a one-line README and a CMakeLists, leaving newcomers stranded) or too much (forty top-level dotfiles with no apparent organization). We argue that every root-level file should be one of three things: a community contract, a build entry point, or a tooling contract.

### 8.1 Community Contracts

| File | Purpose |
|---|---|
| `README.md` | Comprehensive (not 30-line) project overview: features, build, philosophy, quick start. |
| `CONTRIBUTING.md` | How to submit changes, what we expect in PRs. |
| `CODE_OF_CONDUCT.md` | Behavioral standards. |
| `SECURITY.md` | Vulnerability disclosure policy. |
| `CONTRIBUTORS.md` | All contributors, listed. |
| `DONORS.md` | Financial supporters, listed. |
| `CHANGELOG.md` | Engine-wide changelog (per-module changelogs live in modules). |
| `LICENSE.md` | The license itself. |
| `LICENSE_HEADER` | The exact comment block our pre-commit hook stamps on every source file. |

Most open-source engines ship a vestigial README. We ship a comprehensive one because the README is the entry point a student arrives at and bounces off if it does not deliver immediate orientation.

### 8.2 Build Entry Points

| File | Purpose |
|---|---|
| `CMakeLists.txt` | The engine's root CMake file. Loads GPBT, configures top-level options, recurses. |
| `CMakePresets.json` | Top-level preset that aggregates `toolchain/CMakePresets*.json` per OS. |
| `VERSION` | Single-line semver. Sourced by both CMake and CI. |

### 8.3 Tooling Contracts

| File | Purpose |
|---|---|
| `.editorconfig` | Cross-IDE indentation, line-ending, charset rules. |
| `.clang-format` / `.clang-format-ignore` | Formatter rules + intentional exceptions. |
| `.clang-tidy` | Static analyzer rules. |
| `.clangd` | LSP configuration (so LSP-based IDEs all see the same setup). |
| `.gitignore` / `.gitattributes` | VCS hygiene. |
| `.git-blame-ignore-revs` | Mass-formatting commits we want `git blame` to skip. |
| `.mailmap` | Canonicalize contributor identities. |
| `.pre-commit-config.yaml` | Pre-commit hooks (header stamping, format, lint). |

Every one of these files is **standardized** and **documented** in `CONTRIBUTING.md`. None is incidental.

### 8.4 The `.github/` and `.devcontainer/` Directories

<FileTree data={[
  {
    name: '.github',
    type: 'folder',
    icon: 'folder-github',
    children: [
      { name: 'CODEOWNERS', type: 'file', icon: 'codeowners', description: 'GitHub feature to auto-assign PR reviewers based on file paths' },
      { name: 'FUNDING.yml', type: 'file', icon: 'github-sponsors', description: 'GitHub feature to link to donation platforms (GitHub Sponsors, Open Collective, etc.)' },
      { name: 'ISSUE_TEMPLATE', type: 'folder', icon: 'folder-template', description: 'Predefined issue templates for bug reports, feature requests, etc.', children: [
        { name: 'bug_report.yml', type: 'file', icon: 'yaml', description: 'Template for bug report issues' },
        { name: 'config.yml', type: 'file', icon: 'yaml', description: 'Configuration for issue template behavior' }
      ]},
      { name: 'assets', type: 'folder', icon: 'folder-resource', description: 'Branding assets (SVGs for badges, etc.)' },
      { name: 'labeler.yml', type: 'file', icon: 'label', description: 'Configuration for auto-labeling PRs based on changed files' },
      { name: 'pull_request_template.md', type: 'file', icon: 'markdown', description: 'Template for pull request descriptions' },
      { name: 'workflows', type: 'folder', icon: 'folder-gh-workflows', description: 'CI/CD workflow definitions', children: [
        { name: 'build.yml', type: 'file', icon: 'yaml', description: 'Build and test the engine on every PR' },
        { name: 'formatting.yml', type: 'file', icon: 'yaml', description: 'Check code formatting on every PR' },
        { name: 'labeler.yml', type: 'file', icon: 'yaml', description: 'Run the labeler on every PR to auto-assign labels' },
        { name: 'release.yml', type: 'file', icon: 'yaml', description: 'Automate releases (tagging, changelog generation, etc.)' },
        { name: 'shader-ci.yml', type: 'file', icon: 'yaml', description: 'Specialized CI workflow for shader compilation tests' },
        { name: 'sync-docs.yml', type: 'file', icon: 'yaml', description: 'Sync documentation changes to a separate docs repo or wiki' },
        { name: 'sync-sot.yml', type: 'file', icon: 'yaml', description: 'Sync source of truth changes' },
        { name: 'welcome.yml', type: 'file', icon: 'yaml', description: 'Welcome new contributors with an automated message' }
      ]}
    ]
  }
]}
/>

<FileTree data={[
  {
    name: '.devcontainer',
    type: 'folder',
    icon: 'folder-docker',
    children: [
      { name: 'Dockerfile', type: 'file', icon: 'docker', description: 'Defines the dev container image, including OS, SDKs, and tools' },
      { name: 'devcontainer-lock.json', type: 'file', icon: 'json', description: 'Lock file for dev container dependencies' },
      { name: 'devcontainer.json', type: 'file', icon: 'json', description: 'Configuration file for dev container' }
    ]
  }
]}
/>

The `.devcontainer/` is the single most underrated file in any open-source C++ project. A new contributor goes from "git clone" to "engine builds" in one click in VS Code or GitHub Codespaces, no toolchain hunt, no dependency-version drift, no "works on my machine."

---

## 9. The `source/` Tree

Inside `source/`, we apply Strategy D (Unreal-style lifecycle buckets) with three top-level categories:

<FileTree data={[
  {
    name: 'source',
    type: 'folder',
    icon: 'folder-src',
    children: [
      { name: 'runtime', type: 'folder', icon: 'folder-job', description: 'Code that ships in a packaged game' },
      { name: 'launch', type: 'folder', icon: 'folder-simulations', description: 'Executables (editor, standalone, client, server)' },
      { name: 'developer', type: 'folder', icon: 'folder-controller', description: 'Developer-only code (asset cooking, profilers, ...)' },
      { name: 'programs', type: 'folder', icon: 'folder-tools', description: 'Standalone tools (shader compiler worker, asset baker, ...)' },
      { name: 'plugins', type: 'folder', icon: 'folder-plugin', description: 'Official engine plug-ins' },
      { name: 'shaders', type: 'folder-shader', description: 'All shader source (cross-RHI)' }
    ]
  }
]}/>

### 9.1 `runtime/` — The Heart of the Engine

<FileTree data={[
  {
    name: 'source/runtime',
    type: 'folder',
    icon: 'folder-job',
    children: [
      { name: 'core', type: 'folder', icon: 'folder-core', description: 'Foundation utilities (memory, containers, math, platform abstraction)' },
      { name: 'application', type: 'folder', icon: 'folder-app', description: 'Window management, input handling, event loop' },
      { name: 'engine', type: 'folder', icon: 'folder-bicep', description: 'The engine class, scene management, world' },
      { name: 'renderer', type: 'folder', icon: 'folder-review', description: 'High-level renderer (uses RHI)' },
      { name: 'hal', type: 'folder', icon: 'folder-element', description: 'Hardware abstraction layer (Window, Input, etc.)', children: [
        { name: 'base', type: 'folder', icon: 'folder-base', description: 'Base hardware abstraction interfaces' },
        { name: 'sdl3', type: 'folder', icon: 'folder-directive', description: 'SDL3 backend' },
      ]},
      { name: 'rhi', type: 'folder', icon: 'folder-pipe', description: 'Render hardware interface with multiple backends', children: [
        { name: 'base', type: 'folder', icon: 'folder-base', description: 'RHI-agnostic interfaces and utilities' },
        { name: 'd3d11', type: 'folder', icon: 'folder-directive', description: 'Direct3D 11 backend' },
        { name: 'd3d12', type: 'folder', icon: 'folder-directive', description: 'Direct3D 12 backend' },
        { name: 'vulkan', type: 'folder', icon: 'folder-directive', description: 'Vulkan backend' },
        { name: 'opengl', type: 'folder', icon: 'folder-directive', description: 'OpenGL backend (for compatibility)' },
        { name: 'metal', type: 'folder', icon: 'folder-directive', description: 'Metal backend (for Apple platforms)' },
        { name: 'null', type: 'folder', icon: 'folder-private', description: 'Null backend for testing and headless modes' }
      ]},
      { name: 'audio', type: 'folder', icon: 'folder-audio', description: 'Audio subsystem with multiple backends', children: [
        { name: 'base', type: 'folder', icon: 'folder-base', description: 'Audio-agnostic interfaces and utilities' },
        { name: 'openal', type: 'folder', icon: 'folder-directive', description: 'OpenAL backend' },
        { name: 'xaudio2', type: 'folder', icon: 'folder-directive', description: 'XAudio2 backend (for Windows)' },
        { name: 'coreaudio', type: 'folder', icon: 'folder-directive', description: 'CoreAudio backend (for Apple platforms)' },
        { name: 'fmod', type: 'folder', icon: 'folder-directive', description: 'FMOD backend' }
      ]},
      { name: 'physics', type: 'folder', icon: 'folder-simulations', description: 'Physics subsystem with multiple backends', children: [
        { name: 'base', type: 'folder', icon: 'folder-base', description: 'Physics-agnostic interfaces and utilities' },
        { name: 'jolt', type: 'folder', icon: 'folder-directive', description: 'Jolt Physics backend' },
        { name: 'physx', type: 'folder', icon: 'folder-directive', description: 'NVIDIA PhysX backend' }
      ]},
      { name: 'parser', type: 'folder', icon: 'folder-json', description: 'File format parsers (OBJ, FBX, glTF, JSON, INI, XML, YAML)', children: [
        { name: 'obj', type: 'folder', icon: 'folder-container', description: 'Wavefront OBJ parser' },
        { name: 'fbx', type: 'folder', icon: 'folder-container', description: 'Autodesk FBX parser' },
        { name: 'gltf', type: 'folder', icon: 'folder-container', description: 'glTF 2.0 parser' },
        { name: 'json', type: 'folder', icon: 'folder-json', description: 'Generic JSON parser' },
        { name: 'ini', type: 'folder', icon: 'folder-json', description: 'INI file parser' },
        { name: 'xml', type: 'folder', icon: 'folder-json', description: 'XML file parser' },
        { name: 'yaml', type: 'folder', icon: 'folder-json', description: 'YAML file parser' }
      ]}
    ]
  }
]}/>

The pattern is uniform. Pluralistic subsystems (`rhi`, `audio`, `physics`, `parser`) decompose into a `base/` abstraction module and N concrete backend modules. Singular subsystems (`core`, `application`, `engine`, `renderer`) live as flat sibling directories.

### 9.2 `launch/` — Executables

<FileTree data={[
  {
    name: 'source/launch',
    type: 'folder',
    icon: 'folder-simulations',
    children: [
      { name: 'editor', type: 'folder', icon: 'folder-ui', description: 'The GP Editor (full GUI)' },
      { name: 'standalone', type: 'folder', icon: 'folder-console', description: 'A packaged-game launcher' },
      { name: 'client', type: 'folder', icon: 'folder-mobile', description: '(Future) Network client launcher' },
      { name: 'server', type: 'folder', icon: 'folder-server', description: '(Future) Headless server launcher' }
    ]
  }
]}/>

Lifecycle is encoded by directory: an editor is *not* a runtime concept; it is a launcher that links runtime modules and adds editor-specific dependencies. By placing it in `launch/`, we make the lifecycle distinction visible.

### 9.3 `developer/`, `programs/`, `plugins/`, `shaders/`

- `developer/` mirrors UE's `Developer/` bucket: code used by editors and tooling but excluded from shipping builds.
- `programs/` mirrors UE's `Programs/`: standalone executables (shader compile workers, asset bakers).
- `plugins/` holds official, optional plug-ins. The dynamic-dependency mechanism applies here.
- `shaders/` holds shader source code in a cross-RHI dialect. It is not a code module in the traditional sense, and is built by a separate CMake include (`shaders/Shaders.build.cmake`).

---

## 10. Module Anatomy

Every module, regardless of whether it lives in `runtime/`, `developer/`, or `plugins/`, follows the same internal layout:

<FileTree data={[
  {
    name: 'my_module',
    type: 'folder',
    children: [
      { name: 'private', type: 'folder', icon: 'folder-private', description: 'Private implementation (not exposed to any consumer)' },
      { name: 'internal', type: 'folder', icon: 'folder-private', description: 'Restricted-share headers (PRIVATE-but-friend)' },
      { name: 'public', type: 'folder', icon: 'folder-public', description: 'Exported headers (PUBLIC include path)' },
      { name: 'tests', type: 'folder', icon: 'folder-test', description: 'Test sources, opt-in via gpTargetSetTestsEnabled' },
      { name: 'benchmarks', type: 'folder', icon: 'folder-benchmark', description: 'Benchmark sources, opt-in via gpTargetSetBenchmarksEnabled' },
      { name: 'docs', type: 'folder', icon: 'folder-docs', description: 'Longer-form documentation, design notes, ADRs' },
      { name: '.gitignore', type: 'file', icon: 'git' },
      { name: 'CHANGELOG.md', type: 'file', icon: 'changelog' },
      { name: 'CMakeLists.txt', type: 'file', icon: 'cmake' },
      { name: 'README.md', type: 'file', icon: 'readme' },
    ]
  }
]}/>

### 10.1 The Three Visibility Tiers in Practice

Take the `core` module. Its `public/` header `CoreMinimal.hpp` is included by every consumer; consumers never include from `private/`. The `internal/` directory holds, for example, the binary contract between `core` and `engine` for memory budget reporting, an interface that is part of the engine's internal architecture but not part of the public SDK.

<FileTree data={[
  {
    name: 'source/runtime/core',
    type: 'folder',
    icon: 'folder-core',
    children: [
      { name: 'CMakeLists.txt', type: 'file', icon: 'cmake' },
      { name: 'README.md', type: 'file', icon: 'readme' },
      { name: 'CHANGELOG.md', type: 'file', icon: 'changelog' },
      { name: '.gitignore', type: 'file', icon: 'git' },
      { name: 'public', type: 'folder', icon: 'folder-public', children: [
        { name: 'CoreMinimal.hpp', type: 'file', icon: 'hpp' },
        { name: 'compilers', type: 'folder', icon: 'folder-directive', children: [
          { name: 'clang', type: 'folder', icon: 'folder-directive', chevron: false, description: 'ClangCompiler.hpp' },
          { name: 'gcc', type: 'folder', icon: 'folder-directive', chevron: false, description: 'GCCCompiler.hpp' },
          { name: 'intel', type: 'folder', icon: 'folder-directive', chevron: false, description: 'IntelCompiler.hpp' },
          { name: 'msvc', type: 'folder', icon: 'folder-directive', chevron: false, description: 'MSVCCompiler.hpp' }
        ]},
        { name: 'concepts', type: 'folder', icon: 'folder-interface', chevron: false, description: 'C++20 concepts: Container, Functional, Math, ...' },
        { name: 'maths', type: 'folder', icon: 'folder-base', children: [
          { name: 'MathForward.hpp', type: 'file', icon: 'hpp' }
        ]},
        { name: 'memory', type: 'folder', icon: 'folder-base', children: [
          { name: 'MemoryBase.hpp', type: 'file', icon: 'hpp' },
          { name: 'MemoryForward.hpp', type: 'file', icon: 'hpp' },
          { name: 'backends', type: 'folder', icon: 'folder-directive', children: [
            { name: 'Malloc.hpp', type: 'file', icon: 'hpp' },
            { name: 'MallocAnsi.hpp', type: 'file', icon: 'hpp' }
          ]}
        ]},
        { name: 'miscellaneous', type: 'folder', icon: 'folder-other', children: [
          { name: 'BuildDefines.hpp', type: 'file', icon: 'hpp' },
          { name: 'PreProcessorUtilities.hpp', type: 'file', icon: 'hpp' }
        ]},
        { name: 'platforms', type: 'folder', icon: 'folder-base', children: [
          { name: 'apple', type: 'folder', icon: 'folder-macos', chevron: false },
          { name: 'base', type: 'folder', icon: 'folder-base', chevron: false },
          { name: 'generic', type: 'folder', icon: 'folder-other', chevron: false },
          { name: 'linux', type: 'folder', icon: 'folder-linux', chevron: false },
          { name: 'macos', type: 'folder', icon: 'folder-macos', chevron: false },
          { name: 'unix', type: 'folder', icon: 'folder-linux', chevron: false },
          { name: 'windows', type: 'folder', icon: 'folder-windows', chevron: false }
        ]}
      ]},
      { name: 'private', type: 'folder', icon: 'folder-private', children: [
        { name: 'Core.cpp', type: 'file', icon: 'cpp' },
        { name: 'memory', type: 'folder', icon: 'folder-base', children: [
          { name: 'backends', type: 'folder', icon: 'folder-directive', children: [
            { name: 'Malloc.cpp', type: 'file', icon: 'cpp' },
            { name: 'MallocAnsi.cpp', type: 'file', icon: 'cpp' }
          ]}
        ]}
      ]}
    ]
  }
]}/>

Notice how platform abstractions live as **subdirectories of `public/platforms/`** rather than as separate modules. The platform layer is small enough (per-platform forward declarations and inline OS calls) that bumping it to module-level would be over-engineering.

### 10.2 Per-Module Documentation

Each module ships its own `README.md` and `CHANGELOG.md`. The `README.md` answers four questions in this order:

1. **What** does this module do?
2. **Why** does it exist as a separate module rather than being merged into `core` or `engine`?
3. **What** are its dependencies?
4. **What** does it expose?

The `CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com) with a per-module version stream, independent of the engine's master changelog. SDK consumers tracking ABI changes for a single module can subscribe to that module's changelog.

### 10.3 Co-Located Tests and Benchmarks

A module's `tests/` and `benchmarks/` directories contain test and benchmark sources. They are **not** built by default; the module's `CMakeLists.txt` opts in:

```cmake
gpStartModule(audio)
  gpAddDependency(PUBLIC core)
  gpAddDependency(PRIVATE gp::thirdparty::sdl3)
  gpTargetSetTestsEnabled(TRUE)
  gpTargetSetBenchmarksEnabled(TRUE)
gpEndModule()
```

This adds `<module>_tests` and `<module>_benchmarks` executables to the build. They live in the IDE folders `tests/` and `benchmarks/` automatically. The test executable links against the module under test plus our chosen test framework; the benchmark executable links against the same plus our benchmarking harness.

---

## 11. The Multi-Backend Pattern

The most important structural pattern in the GP Engine is the **`base/` + N-backends** decomposition, applied uniformly across `rhi/`, `audio/`, `physics/`, and `parser/`. We illustrate it with `rhi/`.

### 11.1 The `rhi/base` Module

`rhi/base` is a regular module. It exports an abstract interface (`IRHIDevice`, `IRHITexture`, `IRHIBuffer`, `IRHICommandBuffer`, ...) plus a factory entry point. It is shipped in every build, on every platform.

Every consumer (e.g., the `renderer` module) link-depends on `rhi/base` and *only* `rhi/base`. No consumer ever depends on a concrete backend.

### 11.2 The Concrete Backend Modules

`rhi/d3d11`, `rhi/d3d12`, `rhi/vulkan`, `rhi/opengl`, `rhi/metal`, `rhi/null` are all sibling modules to `rhi/base`. Each link-depends on `rhi/base` (so it can implement the interface) and on its native API (D3D, Vulkan SDK, etc.).

Crucially, **the backend modules are not link-dependencies of the engine**. They are **runtime** dependencies: the engine loads them via `dlopen`/`LoadLibrary` and queries the factory.

### 11.3 The GPBT Expression

The entire pattern is expressible in our build tool in fifteen lines:

```cmake showLineNumbers
include(gp-build-tool)

gpStartModule(rhi)
  gpAddDependency(PUBLIC core)

  # The null RHI is always present as a safe fallback
  gpAddDependency(DYNAMIC rhi/null)

  # Platform-conditional dynamic dependencies, no if/endif clutter
  if(WIN32)
    gpAddDependency(DYNAMIC rhi/d3d11)
    gpAddDependency(DYNAMIC rhi/d3d12)
  endif()
  if(UNIX)
    gpAddDependency(DYNAMIC rhi/vulkan UNIX)
    gpAddDependency(DYNAMIC rhi/opengl UNIX)
  endif()
  if(APPLE)
    gpAddDependency(DYNAMIC rhi/metal MAC)
  endif()
gpEndModule()
```

`gpAddDependency(DYNAMIC ...)` creates a build-order edge (the backend is built before the engine) but does **not** create a link-time dependency. The backend ships as a shared library next to the engine binary, and the engine's RHI factory loads it at startup.

### 11.4 Adding a New Backend

The directory tree makes the addition story self-evident. To add a hypothetical WebGPU backend:

<FileTree data={[
  {
    name: 'source/runtime/rhi',
    type: 'folder',
    icon: 'folder-pipe',
    children: [
      { name: 'base', type: 'folder', icon: 'folder-base' },
      { name: 'd3d11', type: 'folder', icon: 'folder-directive' },
      { name: 'd3d12', type: 'folder', icon: 'folder-directive' },
      { name: 'vulkan', type: 'folder', icon: 'folder-directive' },
      { name: 'opengl', type: 'folder', icon: 'folder-directive' },
      { name: 'metal', type: 'folder', icon: 'folder-directive' },
      { name: 'null', type: 'folder', icon: 'folder-private' },
      {
        name: 'webgpu',
        type: 'folder',
        icon: 'folder-directive',
        description: 'New sibling to existing backends',
        children: [
          { name: 'public', type: 'folder', icon: 'folder-public' },
          { name: 'private', type: 'folder', icon: 'folder-private' },
          { name: 'CMakeLists.txt', type: 'file', icon: 'cmake' },
          { name: 'README.md', type: 'file', icon: 'readme' },
          { name: 'CHANGELOG.md', type: 'file', icon: 'changelog' }
        ]
      }
    ]
  }
]}/>

In `rhi/base/CMakeLists.txt`, add one line:

```cmake
gpAddDependency(DYNAMIC rhi/webgpu)
```

Done. No engine code changes. No editor changes. The new backend ships alongside the existing ones and is discoverable at runtime.

This is what we mean when we say the **layout encodes the architecture**: the directory tree alone tells a student "RHI is pluralistic; add a sibling, register a dynamic dependency."

---

## 12. GPBT: The Build Tool That Glues It Together

The directory layout is only half the story. The other half is the build system that gives directories their meaning. We built **GPBT** (Graphical Playground Build Tool), a CMake orchestration layer, to do this declaratively. The full reference lives in [GP Build Tool](/docs/gp-engine/Programming%20With%20C++/GP%20Build%20Tool/), but the highlights matter for layout.

:::warning
The GPBT has been moved to it's own repository at [GraphicalPlayground/gp-build-tool](https://github.com/GraphicalPlayground/gp-build-tool) and is no longer part of the GP Engine monorepo. The design and rationale remain the same, but the implementation is now independently versioned and released. The GP Engine's `cmake/` directory contains a pinned version of GPBT as a Git submodule, ensuring reproducible builds while allowing GPBT to evolve on its own schedule.
:::

### 12.1 The Three Phases

Standard CMake processes `CMakeLists.txt` files in discovery order. This means that if module B depends on module A but is discovered first, the build fails.

GPBT solves this with a **two-pass system**:

1. **Phase 1: REGISTRATION.** GPBT recursively scans the source tree, executing each `CMakeLists.txt` in a lightweight registration mode. Each target records its name, type, and dependency list. No real CMake targets are created.

2. **Phase 2: CONFIGURATION.** GPBT performs a topological sort over the registered targets and re-processes each `CMakeLists.txt` in dependency order, this time creating the real CMake targets.

3. **Phase 3: GENERATION.** Standard CMake generation (Ninja, Makefile, MSBuild).

This is the same problem UnrealBuildTool solves with its Rules assembly compilation. We solve it in pure CMake, no out-of-band C# program needed.

### 12.2 Declarative Visibility, Mapped to the Filesystem

GPBT macros map one-to-one to the directory layout primitives:

| GPBT macro | Filesystem analogue |
|---|---|
| `gpStartModule(name) ... gpEndModule()` | A module folder with a `CMakeLists.txt` |
| auto-glob `private/*.cpp` | The `private/` folder |
| auto-add `public/` to PUBLIC include path | The `public/` folder |
| auto-add `internal/` to PRIVATE include path | The `internal/` folder |
| `gpAddDependency(PUBLIC B)` | "this module's `public/` exposes B's headers" |
| `gpAddDependency(PRIVATE B)` | "this module's `private/` uses B; consumers don't see it" |
| `gpAddDependency(INTERNAL B)` | semantically internal, link-private |
| `gpAddDependency(DYNAMIC B)` | runtime plug-in coupling, no link-time edge |
| `gpStartPlugin(name) ... gpEndPlugin()` | A plug-in module under `plugins/` |
| `gpStartExecutable(name) ... gpEndExecutable()` | A launcher under `launch/` or a tool under `programs/` |

A new contributor reading any module's `CMakeLists.txt` learns the entire dependency story of that module in fewer than 30 lines.

### 12.3 The `cmake/` Directory

<FileTree data={[
  {
    name: 'cmake',
    type: 'folder',
    icon: 'folder-config',
    children: [
      { name: 'gp-build-tool.cmake', type: 'file', icon: 'cmake', description: 'The single-include entry point for GPBT' },
      { name: 'gp-build-tool', type: 'folder', icon: 'folder-config', description: 'The implementation of GPBT', children: [
        { name: 'gp-tests.cmake', type: 'file', icon: 'cmake', description: 'GPBT unit tests' },
        { name: 'gp-thirdparty.cmake', type: 'file', icon: 'cmake', description: 'GPBT integration with third-party dependencies' },
        { name: 'internals', type: 'folder', icon: 'folder-private', description: 'Internal implementation files for GPBT', children: [
          { name: 'gp-api.internal.cmake', type: 'file', icon: 'cmake' },
          { name: 'gp-logger.internal.cmake', type: 'file', icon: 'cmake' },
          { name: 'gp-scan.internal.cmake', type: 'file', icon: 'cmake' },
          { name: 'gp-scope.internal.cmake', type: 'file', icon: 'cmake' },
          { name: 'gp-stringify.internal.cmake', type: 'file', icon: 'cmake' },
          { name: 'gp-targets.internal.cmake', type: 'file', icon: 'cmake' },
          { name: 'gp-utils.internal.cmake', type: 'file', icon: 'cmake' }
        ]},
        { name: 'tests', type: 'folder', icon: 'folder-test', description: "Unit tests for GPBT's own implementation", children:[
          { name:'gp-all.tests.cmake', type:'file', icon:'cmake' },
          { name:'gp-scope.internal.tests.cmake', type:'file', icon:'cmake' },
          { name:'gp-stringify.tests.cmake', type:'file', icon:'cmake' }
        ]}
      ]}
    ]
  }
]}/>

The same `public/internal/` discipline we apply to engine modules, we apply to GPBT itself. The single-include surface is `gp-build-tool.cmake`. Internal helpers live under `internals/`. Tests for the build tool live alongside it. The principle is recursive.

---

## 13. Educational Rationale

Performance and clarity are usually presented as a trade-off. We argue they are not, in the layout dimension. A clearly-laid-out engine has better performance characteristics than a tangled one, because:

- **Clear module boundaries enable better incremental compilation.** A change to `rhi/vulkan` recompiles `rhi/vulkan` and any module that link-depends on it; it does not recompile `core`.
- **Strict `public/private` discipline reduces header churn.** A non-public change to `audio/openal` cannot trigger recompilation outside the module.
- **Dynamic dependency edges (no link-time coupling) shrink the engine binary.** A shipping build that uses only Vulkan does not link D3D12.
- **Co-located tests and benchmarks make profiling-driven development cheap.** A benchmark for `core/memory/backends/Malloc` lives next to the source; running it is one CMake target away.

The layout we have presented optimizes for the slowest path of the developer experience: the time from "I cloned the repo" to "I understand where to add my code." A student who has read this paper and clones the repository should:

1. In **30 seconds**, know that the engine source is in `source/runtime/`, examples are in `examples/`, and the build tool is in `cmake/`.
2. In **2 minutes**, know that adding a new RHI backend means creating a sibling under `source/runtime/rhi/` and registering a dynamic dependency.
3. In **5 minutes**, know that any module's API is in `public/`, its implementation is in `private/`, its tests are in `tests/`, and its history is in `CHANGELOG.md`.

These are not goals. They are the design specification, and every directory in this layout was checked against them.

### 13.1 What Comes Next

This paper has covered the static structure of the engine. Future installments in the GP SDK Engineering Reference Series will cover the dynamic story: the boot sequence, the module loader, the plug-in lifecycle, the GPU command-graph layer that lives between `renderer/` and `rhi/`, the asset pipeline that traverses `parser/`, and the editor's reflection system that connects launch-time C++ to design-time GUI.

The directory tree alone cannot teach an engine. But it can ensure that, when the rest of the documentation arrives, the reader already knows where each piece belongs.

---

## 14. References

### Open-Source Engine Repositories and Documentation

1. **Epic Games.** *Unreal Engine Directory Structure (UE 5.7).* dev.epicgames.com. Available: [https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-directory-structure](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-directory-structure)
2. **Epic Games.** *Developers Folder in Unreal Engine.* Available: [https://dev.epicgames.com/documentation/en-us/unreal-engine/developers-folder-in-unreal-engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/developers-folder-in-unreal-engine)
3. **Epic Games.** *Unreal Engine Build Tool Target Reference.* Available: [https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-build-tool-target-reference](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-build-tool-target-reference)
4. **Yuewu, P.** *In-depth Understanding of Unreal Engine Build System: Unreal Build Tool.* Available: [https://www.yuewu.dev/en/posts/understanding-unreal-build-tool](https://www.yuewu.dev/en/posts/understanding-unreal-build-tool)
5. **Lemes, E.** (2018). *Understanding Unreal Build Tool.* Available: [https://ericlemes.com/2018/11/23/understanding-unreal-build-tool/](https://ericlemes.com/2018/11/23/understanding-unreal-build-tool/)
6. **Yanovsky, D.** *UE4 Build File Demystified.* Available: [https://ikrima.dev/ue4guide/archived_content/unreal-engine-4-build-file-demystified-dmitry-yanovsky/](https://ikrima.dev/ue4guide/archived_content/unreal-engine-4-build-file-demystified-dmitry-yanovsky/)
7. **Unreal Community Wiki.** *An Introduction to UE4 Plugins.* Available: [https://unrealcommunity.wiki/an-introduction-to-ue4-plugins-v1v672wq](https://unrealcommunity.wiki/an-introduction-to-ue4-plugins-v1v672wq)
8. **Unreal Community Wiki.** *Build.cs & Target.cs.* Available: [https://unrealcommunity.wiki/build.cs-hv582z08](https://unrealcommunity.wiki/build.cs-hv582z08)
9. **Godot Engine.** *Source Repository.* Available: [https://github.com/godotengine/godot](https://github.com/godotengine/godot)
10. **Godot Engine.** *Documentation (stable).* Available: [https://docs.godotengine.org/en/stable/](https://docs.godotengine.org/en/stable/)
11. **id Software.** *DOOM 3 Source Repository.* Available: [https://github.com/id-Software/DOOM-3](https://github.com/id-Software/DOOM-3)
12. **id Software.** *DOOM 3 BFG Source Repository.* Available: [https://github.com/id-Software/DOOM-3-BFG](https://github.com/id-Software/DOOM-3-BFG)
13. **id Software.** *Quake III Arena Source.* Available: [https://github.com/id-Software/Quake-III-Arena](https://github.com/id-Software/Quake-III-Arena)
14. **id Software.** *Quake Source.* Available: [https://github.com/id-Software/Quake](https://github.com/id-Software/Quake)
15. **Sanglard, F.** *Doom 3 Source Code Review.* Available: [https://fabiensanglard.net/doom3/](https://fabiensanglard.net/doom3/)
16. **Sanglard, F.** *Quake 3 Source Code Review.* Available: [https://fabiensanglard.net/quake3/index.php](https://fabiensanglard.net/quake3/index.php)
17. **Sanglard, F.** *Quake Source.* Available: [https://fabiensanglard.net/quakeSource/](https://fabiensanglard.net/quakeSource/)
18. **O3DE Foundation.** *O3DE Source Repository.* Available: [https://github.com/o3de/o3de](https://github.com/o3de/o3de)
19. **O3DE Foundation.** *Programming Guide.* Available: [https://docs.o3de.org/docs/user-guide/programming/](https://docs.o3de.org/docs/user-guide/programming/)
20. **O3DE Foundation.** *Gems.* Available: [https://www.o3de.org/docs/user-guide/gems/](https://www.o3de.org/docs/user-guide/gems/)
21. **Bevy Engine.** *Source Repository.* Available: [https://github.com/bevyengine/bevy](https://github.com/bevyengine/bevy)
22. **Bevy Engine.** *Quick Start.* Available: [https://bevyengine.org/learn/quick-start/getting-started/](https://bevyengine.org/learn/quick-start/getting-started/)
23. **Bevy Engine.** *Cargo Features Documentation.* Available: [https://github.com/bevyengine/bevy/blob/main/docs/cargo_features.md](https://github.com/bevyengine/bevy/blob/main/docs/cargo_features.md)
24. **Cocos2d-x.** *Source Repository.* Available: [https://github.com/cocos2d/cocos2d-x](https://github.com/cocos2d/cocos2d-x)
25. **Unity Technologies.** *Unity Manual.* Available: [https://docs.unity3d.com/Manual/index.html](https://docs.unity3d.com/Manual/index.html)
26. **Unity Technologies.** *Special Folders.* Available: [https://docs.unity3d.com/Manual/SpecialFolders.html](https://docs.unity3d.com/Manual/SpecialFolders.html)
27. **Unity Technologies.** *Package Manager Concepts.* Available: [https://docs.unity3d.com/Manual/upm-concepts.html](https://docs.unity3d.com/Manual/upm-concepts.html)

### Proprietary AAA Engine Architecture Talks and Articles

28. **O'Donnell, Y.** (2017). *FrameGraph: Extensible Rendering Architecture in Frostbite.* GDC 2017. Available: [https://www.gdcvault.com/play/1024612/FrameGraph-Extensible-Rendering-Architecture-in](https://www.gdcvault.com/play/1024612/FrameGraph-Extensible-Rendering-Architecture-in)
29. **DICE / Frostbite Team.** *Culling the Battlefield: Data Oriented Design in Practice.* GDC 2011. Available: [https://www.ea.com/frostbite/news/culling-the-battlefield-data-oriented-design-in-practice](https://www.ea.com/frostbite/news/culling-the-battlefield-data-oriented-design-in-practice)
30. **DICE / Frostbite Team.** *Introduction to Data Oriented Design.* Available: [https://www.ea.com/frostbite/news/introduction-to-data-oriented-design](https://www.ea.com/frostbite/news/introduction-to-data-oriented-design)
31. **Guerrilla Games.** *Decima Engine: Visibility in Horizon Zero Dawn.* SIGGRAPH 2017 Advances. Available: [https://www.guerrilla-games.com/read/decima-engine-visibility-in-horizon-zero-dawn](https://www.guerrilla-games.com/read/decima-engine-visibility-in-horizon-zero-dawn)
32. **Guerrilla Games.** *Decima Engine: Advances in Lighting and AA.* SIGGRAPH 2017. Available: [https://www.guerrilla-games.com/read/decima-engine-advances-in-lighting-and-aa](https://www.guerrilla-games.com/read/decima-engine-advances-in-lighting-and-aa)
33. **Keiren, B.** (2025). *Tools Summit: Nodes and Native Code: DECIMA's Visual Programming for Every Discipline.* GDC 2025. Available: [https://gdcvault.com/play/1035551/Tools-Summit-Nodes-and-Native](https://gdcvault.com/play/1035551/Tools-Summit-Nodes-and-Native). Mirror: [https://www.guerrilla-games.com/read/Nodes-and-Native](https://www.guerrilla-games.com/read/Nodes-and-Native)
34. **Guerrilla Games.** *Publications Index.* Available: [https://www.guerrilla-games.com/read/publications](https://www.guerrilla-games.com/read/publications)
35. **Ubisoft.** (2025). *From Assassin's Creed to Rainbow Six Siege: Anvil brings iconic games to life for 20 years.* YouTube. Available: [https://www.youtube.com/watch?v=klKqvrKYKTs](https://www.youtube.com/watch?v=klKqvrKYKTs)
36. **Lopez, N.** (2025). *Rendering 'Assassin's Creed Shadows'.* GDC 2025. Available: [https://gdcvault.com/play/1035526/Rendering-Assassin-s-Creed-Shadows](https://gdcvault.com/play/1035526/Rendering-Assassin-s-Creed-Shadows)
37. **GDC Conference.** *How Ubisoft Brought Feudal Japan to Life.* Available: [https://gdconf.com/article/how-ubisoft-brought-feudal-japan-to-life-rendering-assassin-s-creed-shadows-with-nicolas-lopez/](https://gdconf.com/article/how-ubisoft-brought-feudal-japan-to-life-rendering-assassin-s-creed-shadows-with-nicolas-lopez/)
38. **Ubisoft.** *Inside Anvil: The Technology Powering Assassin's Creed Shadows.* Available: [https://www.ubisoft.com/en-us/game/assassins-creed/news/3aw71nNlR7kZJzoCATuNtm/inside-anvil-the-technology-powering-assassins-creed-shadows](https://www.ubisoft.com/en-us/game/assassins-creed/news/3aw71nNlR7kZJzoCATuNtm/inside-anvil-the-technology-powering-assassins-creed-shadows)
39. **Drakeus, E.** *The History of Snowdrop: From R&D Concept to AAA Engine.* Massive Entertainment. Available: [https://www.massive.se/blog/games-technology/snowdrop/the-history-of-snowdrop-from-rd-concept-to-aaa-engine/](https://www.massive.se/blog/games-technology/snowdrop/the-history-of-snowdrop-from-rd-concept-to-aaa-engine/)
40. **Aguaviva, R., & Lejdfors, C.** (2019). *Advanced Graphics Techniques Tutorial: Efficient Rendering in 'The Division 2'.* GDC 2019. Available: [https://gdcvault.com/play/1026293/Advanced-Graphics-Techniques-Tutorial-Efficient](https://gdcvault.com/play/1026293/Advanced-Graphics-Techniques-Tutorial-Efficient)
41. **Capcom IR.** (2016). *Jun Takeuchi Developer Interview, Vol. 03 (RE Engine).* Available: [https://www.capcom.co.jp/ir/english/interview/2016/vol03.html](https://www.capcom.co.jp/ir/english/interview/2016/vol03.html)
42. **Edsö, E.** *Pragmata Interview: How Capcom Delivered a Stunning New Sci-Fi IP with RE Engine.* 80.lv. Available: [https://80.lv/articles/pragmata-interview-how-capcom-delivered-a-stunning-new-sci-fi-ip-with-re-engine](https://80.lv/articles/pragmata-interview-how-capcom-delivered-a-stunning-new-sci-fi-ip-with-re-engine)
43. **Gyrling, C.** (2015). *Parallelizing the Naughty Dog Engine Using Fibers.* GDC 2015. Available: [https://gdcvault.com/play/1022186/Parallelizing-the-Naughty-Dog-Engine](https://gdcvault.com/play/1022186/Parallelizing-the-Naughty-Dog-Engine). Slides: [https://media.gdcvault.com/gdc2015/presentations/Gyrling_Christian_Parallelizing_The_Naughty.pdf](https://media.gdcvault.com/gdc2015/presentations/Gyrling_Christian_Parallelizing_The_Naughty.pdf)
44. **Wikipedia.** *Source 2.* Available: [https://en.wikipedia.org/wiki/Source_2](https://en.wikipedia.org/wiki/Source_2)
45. **Wikipedia.** *Source (game engine).* Available: [https://en.wikipedia.org/wiki/Source_(game_engine)](https://en.wikipedia.org/wiki/Source_(game_engine))
46. **Crespo, D.** *The Evolution of Valve's Source Engine.* Deus In Machina. Available: [https://www.deusinmachina.net/p/the-evolution-of-valves-source-engine](https://www.deusinmachina.net/p/the-evolution-of-valves-source-engine)

### Books and Foundational References

47. **Gregory, J.** (2018). *Game Engine Architecture, 3rd Ed.* CRC Press.
48. **Acton, M.** (2014). *Data-Oriented Design and C++.* CppCon 2014.

### GP Engine Internal Documentation

49. **Graphical Playground Team.** *GP Build Tool (GPBT).* GP SDK Documentation. Available: [/docs/gp-engine/Programming With C++/GP Build Tool/](/docs/gp-engine/Programming%20With%20C++/GP%20Build%20Tool/)

---

*Document prepared as part of the GP SDK Engineering Reference Series.*
*Version 1.0, Principal Systems Engineer, Graphical Playground SDK.*
