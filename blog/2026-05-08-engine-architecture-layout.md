---
slug: engine-architecture-layout
title: "Engine Architecture and Directory Layout: A Principal Engineer's Guide"
authors: mallory-scotton
tags: [research, technical, architecture, engine design, build system, cmake, c++, modularity, directory layout, gp engine]
---

# Engine Architecture and Directory Layout: A Principal Engineer's Guide

**A Comparative Survey of AAA Engine Source Trees and the Design Rationale Behind the Graphical Playground Engine**

---

> *"Architecture is not the directory tree. The directory tree is the architecture made visible. Open any AAA engine and within thirty seconds you can read its philosophy off the file system."*

---

## Abstract

Game engine architecture is most often discussed in terms of subsystems: *renderers*, *physics*, *audio*, *animation*. But long before any code is written, an engine's character is decided by a more fundamental question: **how is the source tree organized?** Where does a piece of code physically live, what is allowed to depend on it, and what does that dependency mean at compile-time, link-time, and runtime? This paper is a rigorous treatment of the directory-layout-as-architecture problem. We survey the publicly documented source trees of seven canonical engines, **Unreal Engine 5**, **Godot**, **id Tech 4 / Doom 3**, **O3DE**, **Bevy**, **Unity**, and **Cocos2d-x**, and the publicly documented architectural philosophies of five proprietary AAA engines, **Frostbite** (DICE/EA), **Decima** (Guerrilla Games), **Anvil** (Ubisoft Montreal), **Snowdrop** (Ubisoft Massive), and **RE Engine** (Capcom). We extract a taxonomy of five layout strategies, analyze the trade-offs of each, and present the **Graphical Playground (GP) Engine** layout: a hybrid that draws structural inspiration from Unreal Engine's `Public/Private/Internal` discipline while optimizing aggressively for **educational clarity**, **multi-backend pluggability**, and **build-system declarativity** through our custom CMake orchestration layer (GPBT). The paper closes with the complete GP Engine repository topology, module anatomy, and the rationale for every directory we ship.

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

The most powerful place to encode architectural rules is the **directory tree**. A folder named `private/` is a contract: nothing outside the module may include from here. A folder named `rhi/vulkan/` is an interface boundary: this is one of several swappable implementations of a stable abstraction. A `CMakeLists.txt` next to a `README.md` and a `CHANGELOG.md` is a unit-of-ownership marker: this folder is a thing that can be reasoned about, versioned, and replaced as a whole.

A well-designed engine layout makes good architecture **easy** and bad architecture **hard**. A poorly designed one inverts the polarity, every dependency violation becomes the path of least resistance, and the codebase erodes one expedient `#include "../../private/foo.hpp"` at a time.

### 1.2 The Educational Gap

The four canonical references for studying engine architecture are *Game Engine Architecture* by Jason Gregory, the Unreal Engine source tree, the Godot source tree, and id Software's open-sourced engines. Each is invaluable; none was designed primarily for **pedagogy**.

- *Game Engine Architecture* is a book; you cannot grep it.
- The Unreal Engine source tree is enormous (over 200,000 files) and assumes Epic's twenty-year tribal knowledge.
- Godot's tree is approachable but couples engine and editor tightly, and uses SCons (a system most students never meet again).
- id Tech is a museum piece by modern standards, magnificent C, but predating modern C++, RHIs, and multi-platform mobile/console concerns.

The **Graphical Playground (GP) Engine** is built with an explicit second goal alongside production-grade performance: a student who clones the repository should be able to navigate it, find any subsystem in under a minute, and understand from the layout alone *why* the file they are reading is where it is. This educational mandate shapes every layout decision in this paper.

### 1.3 Thesis

We argue that an engine's directory layout must encode four orthogonal axes of separation:

1. **Lifecycle separation**: launchers vs. runtime vs. tools vs. plug-ins vs. shaders.
2. **Visibility separation**: public API vs. internal-shared headers vs. private implementation.
3. **Backend pluralism**: a stable abstraction (`rhi/base`) coexisting with many concrete implementations (`rhi/vulkan`, `rhi/d3d12`, `rhi/metal`, `rhi/null`).
4. **Discoverability**: each unit of ownership ships with documentation, change history, benchmarks, and tests **co-located** with the code, not scattered into satellite directories.

The remainder of the paper formalizes each axis, surveys how existing engines address it, and presents the GP Engine's specific synthesis.

---

## 2. Background: A Taxonomy of Engine Layouts

After studying public source trees and architecture talks across two decades of shipping engines, we identify five distinct layout strategies. They are not exclusive, mature engines combine elements of several, but each is *predominantly* one strategy.

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
| `Public/Private/Internal` is the gold standard for visibility discipline. | UBT is a large C# program with its own learning curve. |
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

We now examine each engine in turn through the lens of the principles above.

### 4.1 Unreal Engine 5

**Source**: [`github.com/EpicGames/UnrealEngine`](https://github.com/EpicGames/UnrealEngine) (private repo, public docs at [`dev.epicgames.com/documentation/en-us/unreal-engine`](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-directory-structure)).

```
UnrealEngine/
├── Engine/
│   ├── Source/
│   │   ├── Runtime/        Core, RenderCore, Renderer, RHI, Engine, ...
│   │   ├── Editor/         UnrealEd, LevelEditor, Kismet, ...
│   │   ├── Developer/      AssetTools, TargetPlatform, ...
│   │   ├── Programs/       UnrealBuildTool, ShaderCompileWorker, ...
│   │   └── ThirdParty/
│   ├── Plugins/            engine-wide plugins (Niagara, Chaos, ...)
│   ├── Content/
│   ├── Shaders/
│   └── Binaries/
├── Templates/
├── Samples/
├── Setup.bat / Setup.sh
└── GenerateProjectFiles.bat / .sh
```

A typical module:

```
Engine/Source/Runtime/Core/
├── Core.Build.cs
├── Public/                 exported headers
├── Private/                .cpp + internal headers
├── Classes/                legacy UObject headers (UE4-era)
└── Internal/               (UE5-only) restricted-share headers
```

**Strengths.**
- The `Runtime/Editor/Developer/Programs/` lifecycle split is unmatched.
- `Public/Private/Internal` is the gold standard.
- `*.Build.cs` rules give per-module declarative dependencies.
- Plugins re-use the same module shape, no special case.

**Weaknesses.**
- Total scale (200,000+ files) overwhelms students.
- UnrealBuildTool is C#, foreign to the C++ workflow it manages.
- Naming convention overhead (`F`/`U`/`A`/`I`/`S`/`T` prefixes, PascalCase everywhere).
- The repo is gated behind the EULA-signed Epic GitHub program.

### 4.2 Godot Engine

**Source**: [`github.com/godotengine/godot`](https://github.com/godotengine/godot).

```
godot/
├── core/
├── scene/                  SceneTree, nodes, gameplay primitives
├── servers/                RenderingServer, PhysicsServer2D/3D, ...
├── drivers/                Vulkan, GLES3, ALSA, ...
├── modules/                compile-time-pluggable features
├── platform/               per-OS entry points
├── editor/
├── thirdparty/
├── tests/
├── main/
├── doc/
└── misc/
```

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

```
Doom3/
├── neo/
│   ├── idlib/              foundation: containers, math, strings
│   ├── framework/          engine glue, file system, console, command system
│   ├── renderer/
│   ├── sound/
│   ├── cm/                 collision model
│   ├── ui/
│   ├── tools/              radiant editor, etc.
│   ├── sys/                platform abstraction
│   ├── game/               game DLL (Doom 3 vanilla)
│   └── d3xp/               game DLL (expansion)
└── base/                   data: assets, defs, scripts
```

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

```
o3de/
├── Code/
│   └── Framework/          AzCore, AzFramework, AzToolsFramework, ...
├── Gems/                   everything else (rendering, physics, audio, ...)
├── Templates/
├── Tools/
├── Registry/
├── cmake/
├── python/
└── scripts/
```

A Gem looks like:

```
Gems/Atom/
├── CMakeLists.txt
├── Code/
│   ├── Source/
│   ├── Include/
│   └── Tests/
├── Assets/
├── Tools/
├── Registry/
└── gem.json                manifest
```

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

```
bevy/
├── crates/
│   ├── bevy_app/
│   ├── bevy_ecs/
│   ├── bevy_render/
│   ├── bevy_pbr/
│   ├── bevy_audio/
│   ├── bevy_ui/
│   ├── bevy_winit/
│   └── ... (~50 crates)
├── examples/
├── benches/
├── tests/
├── tools/
└── Cargo.toml              workspace manifest
```

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

```
MyUnityProject/
├── Assets/                 user content
├── Packages/               UPM packages (engine modules)
├── ProjectSettings/
├── Library/                generated cache (gitignored)
├── Logs/
└── Temp/
```

UPM packages under `Packages/` deliver render pipelines (URP, HDRP), input, netcode, and increasingly even core systems as versioned modules. Conceptually this maps to O3DE's Gems and Bevy's crates. The engine itself remains a closed-source native runtime.

### 4.7 Cocos2d-x

**Source**: [`github.com/cocos2d/cocos2d-x`](https://github.com/cocos2d/cocos2d-x).

```
cocos2d-x/
├── cocos/
│   ├── 2d/  3d/  audio/  base/  math/  network/
│   ├── physics/  physics3d/  navmesh/  platform/
│   ├── renderer/  scripting/  ui/  editor-support/
├── extensions/
├── external/               third-party
├── templates/
├── tools/
├── tests/
└── cmake/
```

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

Synthesizing the survey, we extract the following design rules.

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

We now present the complete GP Engine repository topology and rationale. The repository is monorepo-style: engine, examples, build tooling, and CI configuration all live in one tree.

### 7.1 Top-Level Topology

```
gp-engine/
├── source/          all engine source code
├── thirdparty/      external dependencies (CMake-orchestrated)
├── examples/        SDK example projects
├── toolchain/       per-platform CMakePresets and toolchain scripts
├── cmake/           GPBT itself (the build tool)
├── .devcontainer/   reproducible dev container
├── .github/         CI workflows, issue templates, funding, branding
├── CMakeLists.txt   the engine's root CMake entry point
├── CMakePresets.json
├── README.md        comprehensive (not vestigial)
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CONTRIBUTORS.md
├── DONORS.md
├── CHANGELOG.md
├── LICENSE.md
├── LICENSE_HEADER       canonical comment block stamped on every source file
├── VERSION
├── .editorconfig
├── .clang-format
├── .clang-format-ignore
├── .clang-tidy
├── .clangd
├── .gitignore
├── .gitattributes
├── .git-blame-ignore-revs
├── .mailmap
└── .pre-commit-config.yaml
```

Each top-level directory and root file carries deliberate intent. We unpack them in the next section.

### 7.2 The Five Top-Level Directories

```
source/        ← all C++/C/HLSL/GLSL source
thirdparty/    ← isolation barrier for external deps
examples/      ← consumers of the public SDK
toolchain/     ← cross-platform toolchain configuration
cmake/         ← GPBT, our build tool (everything CMake calls into)
```

The reading order matters: `source/` is the engine; `thirdparty/` is what the engine depends on; `examples/` is what depends on the engine; `toolchain/` and `cmake/` are how all of it is built.

---

## 8. Repository Root: Why Every File Earns Its Place

A common smell in open-source engines is a repository root that contains either too little (a one-line README and a CMakeLists, leaving newcomers stranded) or too much (forty top-level dotfiles with no apparent organization). We argue that every root-level file should be one of three things: **a community contract**, **a build entry point**, or **a tooling contract**.

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

```
.github/
├── CODEOWNERS
├── FUNDING.yml
├── ISSUE_TEMPLATE/
│   ├── bug_report.yml
│   └── config.yml
├── actions/
│   └── setup-deps/         reusable composite action
├── assets/                 SVG branding for README badges
├── labeler.yml
├── pull_request_template.md
└── workflows/
    ├── build.yml
    ├── formatting.yml
    ├── labeler.yml
    ├── release.yml
    ├── shader-ci.yml
    ├── sync-docs.yml
    └── welcome.yml
```

```
.devcontainer/
├── Dockerfile              reproducible build environment
├── devcontainer-lock.json
└── devcontainer.json
```

The `.devcontainer/` is the single most underrated file in any open-source C++ project. A new contributor goes from "git clone" to "engine builds" in one click in VS Code or GitHub Codespaces, no toolchain hunt, no dependency-version drift, no "works on my machine."

---

## 9. The `source/` Tree

Inside `source/`, we apply Strategy D (Unreal-style lifecycle buckets) with three top-level categories:

```
source/
├── runtime/         code that ships in a packaged game
├── launch/          executables (editor, standalone, client, server)
├── developer/       developer-only code (asset cooking, profilers, ...)
├── programs/        standalone tools (shader compiler worker, asset baker, ...)
├── plugins/         official engine plug-ins
├── shaders/         all shader source (cross-RHI)
└── CMakeLists.txt   recurses into all subdirs
```

### 9.1 `runtime/` — The Heart of the Engine

```
source/runtime/
├── core/            foundation: memory, containers, math, platform abstraction
├── application/     window, input, event loop
├── engine/          the engine class, scene management, world
├── renderer/        high-level renderer (uses RHI)
├── rhi/             render hardware interface
│   ├── base/
│   ├── d3d11/
│   ├── d3d12/
│   ├── vulkan/
│   ├── opengl/
│   ├── metal/
│   └── null/
├── audio/
│   ├── base/
│   ├── openal/
│   ├── xaudio2/
│   ├── coreaudio/
│   └── fmod/
├── physics/
│   ├── base/
│   ├── jolt/
│   └── physx/
└── parser/
    ├── obj/
    ├── fbx/
    ├── gltf/
    ├── json/
    ├── ini/
    ├── xml/
    └── yaml/
```

The pattern is uniform. Pluralistic subsystems (`rhi`, `audio`, `physics`, `parser`) decompose into a `base/` abstraction module and N concrete backend modules. Singular subsystems (`core`, `application`, `engine`, `renderer`) live as flat sibling directories.

### 9.2 `launch/` — Executables

```
source/launch/
├── editor/          the GP Editor (full GUI)
├── standalone/      a packaged-game launcher
├── client/          (future) network client launcher
└── server/          (future) headless server launcher
```

Lifecycle is encoded by directory: an editor is *not* a runtime concept; it is a launcher that links runtime modules and adds editor-specific dependencies. By placing it in `launch/`, we make the lifecycle distinction visible.

### 9.3 `developer/`, `programs/`, `plugins/`, `shaders/`

- `developer/` mirrors UE's `Developer/` bucket: code used by editors and tooling but excluded from shipping builds.
- `programs/` mirrors UE's `Programs/`: standalone executables (shader compile workers, asset bakers).
- `plugins/` holds official, optional plug-ins. The dynamic-dependency mechanism applies here.
- `shaders/` holds shader source code in a cross-RHI dialect. It is not a code module in the traditional sense, and is built by a separate CMake include (`shaders/Shaders.build.cmake`).

---

## 10. Module Anatomy

Every module, regardless of whether it lives in `runtime/`, `developer/`, or `plugins/`, follows the same internal layout:

```
my_module/
├── CMakeLists.txt   (or my_module.build.cmake)
├── README.md        what this module is, why it exists, what it depends on
├── CHANGELOG.md     ABI-affecting changes per release
├── .gitignore       module-local ignores (output dirs, IDE cruft)
├── public/          exported headers (PUBLIC include path)
├── internal/        restricted-share headers (PRIVATE-but-friend)
├── private/         .cpp + private headers (PRIVATE)
├── docs/            longer-form documentation, design notes, ADRs
├── benchmarks/      benchmark sources, opt-in via gpTargetSetBenchmarksEnabled
└── tests/           test sources, opt-in via gpTargetSetTestsEnabled
```

### 10.1 The Three Visibility Tiers in Practice

Take the `core` module. Its `public/` header `CoreMinimal.hpp` is included by every consumer; consumers never include from `private/`. The `internal/` directory holds, for example, the binary contract between `core` and `engine` for memory budget reporting, an interface that is part of the engine's internal architecture but not part of the public SDK.

```
source/runtime/core/
├── CMakeLists.txt
├── README.md
├── CHANGELOG.md
├── .gitignore
├── public/
│   ├── CoreMinimal.hpp
│   ├── compilers/
│   │   ├── clang/ClangCompiler.hpp
│   │   ├── gcc/GCCCompiler.hpp
│   │   ├── intel/IntelCompiler.hpp
│   │   └── msvc/MSVCCompiler.hpp
│   ├── concepts/             (C++20 concepts: Container, Functional, Math, ...)
│   ├── maths/MathForward.hpp
│   ├── memory/
│   │   ├── MemoryBase.hpp
│   │   ├── MemoryForward.hpp
│   │   └── backends/
│   │       ├── Malloc.hpp
│   │       └── MallocAnsi.hpp
│   ├── miscellaneous/
│   │   ├── BuildDefines.hpp
│   │   └── PreProcessorUtilities.hpp
│   └── platforms/
│       ├── apple/
│       ├── base/
│       ├── generic/
│       ├── linux/
│       ├── macos/
│       ├── unix/
│       └── windows/
└── private/
    ├── Core.cpp
    └── memory/backends/
        ├── Malloc.cpp
        └── MallocAnsi.cpp
```

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
  gpAddPublicDependency(core)
  gpAddPrivateDependency(SDL3::SDL3-static)
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
  gpAddPublicDependency(core)

  # The null RHI is always present as a safe fallback
  gpAddDynamicDependency(rhi/null)

  # Platform-conditional dynamic dependencies, no if/endif clutter
  gpAddDynamicDependencyOnPlatform(rhi/d3d11 WINDOWS)
  gpAddDynamicDependencyOnPlatform(rhi/d3d12 WINDOWS)
  gpAddDynamicDependencyOnPlatform(rhi/vulkan UNIX)
  gpAddDynamicDependencyOnPlatform(rhi/opengl UNIX)
  gpAddDynamicDependencyOnPlatform(rhi/metal MAC)
gpEndModule()
```

`gpAddDynamicDependency` creates a build-order edge (the backend is built before the engine) but does **not** create a link-time dependency. The backend ships as a shared library next to the engine binary, and the engine's RHI factory loads it at startup.

### 11.4 Adding a New Backend

The directory tree makes the addition story self-evident. To add a hypothetical WebGPU backend:

```
source/runtime/rhi/
├── base/
├── d3d11/
├── d3d12/
├── vulkan/
├── opengl/
├── metal/
├── null/
└── webgpu/         ← new sibling
    ├── CMakeLists.txt
    ├── README.md
    ├── CHANGELOG.md
    ├── public/
    └── private/
```

In `rhi/CMakeLists.txt`, add one line:

```cmake
gpAddDynamicDependencyOnPlatform(rhi/webgpu ALL)
```

Done. No engine code changes. No editor changes. The new backend ships alongside the existing ones and is discoverable at runtime.

This is what we mean when we say the **layout encodes the architecture**: the directory tree alone tells a student "RHI is pluralistic; add a sibling, register a dynamic dependency."

---

## 12. GPBT: The Build Tool That Glues It Together

The directory layout is only half the story. The other half is the build system that gives directories their meaning. We built **GPBT** (Graphical Playground Build Tool), a CMake orchestration layer, to do this declaratively. The full reference lives in [GP Build Tool](/docs/gp-engine/Programming%20With%20C++/GP%20Build%20Tool/), but the highlights matter for layout.

### 12.1 The Three Phases

Standard CMake processes `CMakeLists.txt` files in discovery order. This means that if module B depends on module A but is discovered first, the build fails.

GPBT solves this with a **two-pass system**:

1. **Phase 1 — REGISTRATION.** GPBT recursively scans the source tree, executing each `CMakeLists.txt` in a lightweight registration mode. Each target records its name, type, and dependency list. No real CMake targets are created.

2. **Phase 2 — CONFIGURATION.** GPBT performs a topological sort over the registered targets and re-processes each `CMakeLists.txt` in dependency order, this time creating the real CMake targets.

3. **Phase 3 — GENERATION.** Standard CMake generation (Ninja, Makefile, MSBuild).

This is the same problem UnrealBuildTool solves with its Rules assembly compilation. We solve it in pure CMake, no out-of-band C# program needed.

### 12.2 Declarative Visibility, Mapped to the Filesystem

GPBT macros map one-to-one to the directory layout primitives:

| GPBT macro | Filesystem analogue |
|---|---|
| `gpStartModule(name) ... gpEndModule()` | A module folder with a `CMakeLists.txt` |
| auto-glob `private/*.cpp` | The `private/` folder |
| auto-add `public/` to PUBLIC include path | The `public/` folder |
| auto-add `internal/` to PRIVATE include path | The `internal/` folder |
| `gpAddPublicDependency(B)` | "this module's `public/` exposes B's headers" |
| `gpAddPrivateDependency(B)` | "this module's `private/` uses B; consumers don't see it" |
| `gpAddInternalDependency(B)` | semantically internal, link-private |
| `gpAddDynamicDependency(B)` | runtime plug-in coupling, no link-time edge |
| `gpAddDynamicDependencyOnPlatform(B, P)` | conditional on platform |
| `gpStartPlugin(name) ... gpEndPlugin()` | A plug-in module under `plugins/` |
| `gpStartExecutable(name) ... gpEndExecutable()` | A launcher under `launch/` or a tool under `programs/` |

A new contributor reading any module's `CMakeLists.txt` learns the entire dependency story of that module in fewer than 30 lines.

### 12.3 The `cmake/` Directory

```
cmake/
├── gp-build-tool.cmake        ← single-include entry point
└── gp-build-tool/
    ├── gp-tests.cmake
    ├── gp-thirdparty.cmake
    ├── internals/             ← registration, scope, scan, stringify, target, utils
    │   ├── gp-api.internal.cmake
    │   ├── gp-logger.internal.cmake
    │   ├── gp-scan.internal.cmake
    │   ├── gp-scope.internal.cmake
    │   ├── gp-stringify.internal.cmake
    │   ├── gp-targets.internal.cmake
    │   └── gp-utils.internal.cmake
    └── tests/                 ← yes, GPBT itself is unit-tested
        ├── gp-all.tests.cmake
        ├── gp-scope.internal.tests.cmake
        └── gp-stringify.tests.cmake
```

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

These targets are not aspirational. They are the design specification of the layout. Every directory we ship was justified against them.

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
