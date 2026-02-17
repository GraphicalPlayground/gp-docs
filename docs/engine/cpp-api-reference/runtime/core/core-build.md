---
sidebar_position: 0
title: Core Build
description: Core build configuration, platform detection, and primitive type definitions for the C++ API.
tags:
    - c++
    - core
    - platform
    - build
---

# Core Build

`CoreBuild.hpp` is the foundational header of the Graphical Playground engine. Every C++ file in the engine ultimately includes this header, making it the single source of truth for platform detection, type definitions, and feature configuration.

This header serves several critical purposes:
- **Platform Detection** - Identifies the target operating system, architecture, and compiler at compile time.
- **Type Standardization** - Defines canonical type aliases (`Int32`, `Float32`, `Real`, etc.) to ensure consistent, portable code across platforms.
- **Feature Configuration** - Exposes compile-time flags that enable or disable engine subsystems based on build configuration.
- **Optimization Utilities** - Provides portable macros for inlining, branch prediction, and alignment.

Because this header is included by virtually every other engine file, it must remain dependency-free and compile quickly. Understanding `CoreBuild.hpp` is essential for anyone working with the engine's C++ codebase.

:::warning
This header requires **C++20 or later**. Attempting to compile with an older standard will produce a hard compiler error unless `GP_ALLOW_OLDER_STANDARDS` is explicitly defined. Older standards are not officially supported, and using them may result in undefined behavior.
:::

---

## Platform Detection

The engine automatically detects which platform you are compiling for by examining standard preprocessor macros defined by your compiler and build system. This detection happens at compile time, allowing you to write platform-specific code without manual configuration.

Each platform defines exactly one primary macro set to `1`; all others are set to `0`. This ensures that conditionals like `#if GP_PLATFORM_WINDOWS` work reliably without accidentally matching multiple platforms.

| Macro | Value | Description |
|---|---|---|
| `GP_PLATFORM_WINDOWS` | `0` or `1` | Microsoft Windows (32 or 64-bit) |
| `GP_PLATFORM_LINUX` | `0` or `1` | Linux |
| `GP_PLATFORM_MACOS` | `0` or `1` | Apple macOS |
| `GP_PLATFORM_IOS` | `0` or `1` | Apple iOS / iOS Simulator |
| `GP_PLATFORM_ANDROID` | `0` or `1` | Android |
| `GP_PLATFORM_WEB` | `0` or `1` | WebAssembly via Emscripten |

### Platform Family Macros

When writing cross-platform code, you often need to handle groups of similar platforms together. For example, desktop platforms (Windows, Linux, macOS) typically share windowing and input handling logic, while mobile platforms (iOS, Android) share touch input and sensor APIs.

To make this easier, we provide family macros that evaluate to `1` when compiling for any platform in that family:

| Macro | Composition |
|---|---|
| `GP_PLATFORM_DESKTOP` | Windows \|\| Linux \|\| macOS |
| `GP_PLATFORM_MOBILE` | iOS \|\| Android |
| `GP_PLATFORM_APPLE` | macOS \|\| iOS |
| `GP_PLATFORM_UNIX` | Linux \|\| macOS \|\| iOS \|\| Android |

### Windows-Specific Macros

Anyone who has worked with Windows development knows that including `<windows.h>` can cause serious problems. The header defines thousands of macros that can conflict with your code, and the `min`/`max` macros in particular are notorious for breaking C++ standard library code.

To protect you from these issues, we automatically define the following macros when targeting Windows:

- `WIN32_LEAN_AND_MEAN` - Excludes rarely-used APIs from `<windows.h>`, dramatically reducing compile times and namespace pollution.
- `NOMINMAX` - Prevents the `min`/`max` macro definitions that conflict with `std::min`/`std::max` and other standard library functions.

You don't need to define these yourself; they're set automatically by `CoreBuild.hpp`.

---

## Architecture Detection

Knowing the target architecture is critical for writing efficient code, especially when working with SIMD instructions or optimizing memory layout. The engine detects the target architecture automatically and provides macros for conditional compilation.

| Macro | Description |
|---|---|
| `GP_ARCHITECTURE_X86` | 32-bit x86 |
| `GP_ARCHITECTURE_X64` | 64-bit x86-64 |
| `GP_ARCHITECTURE_ARM32` | 32-bit ARM |
| `GP_ARCHITECTURE_ARM64` | 64-bit ARM (AArch64) |
| `GP_ARCHITECTURE_WASM` | WebAssembly |

### Architecture Family Macros

Just as with platforms, you often want to write code that applies to an entire architecture family. For example, x86 and x64 both support SSE instructions, while ARM32 and ARM64 both support NEON.

| Macro | Composition |
|---|---|
| `GP_ARCHITECTURE_X86_FAMILY` | x86 \|\| x64 |
| `GP_ARCHITECTURE_ARM_FAMILY` | ARM32 \|\| ARM64 |
| `GP_ARCHITECTURE_64BIT` | x64 \|\| ARM64 |
| `GP_ARCHITECTURE_32BIT` | x86 \|\| ARM32 |

:::tip
Prefer using `GP_ARCHITECTURE_64BIT` when checking for pointer size or integer width, rather than checking individual architectures. This makes your code more maintainable as new architectures are added.
:::

---

## Compiler Detection

Different compilers support different features and extensions, and sometimes you need to work around compiler-specific bugs. The engine detects which compiler is being used and provides macros for conditional compilation.

| Macro | Description |
|---|---|
| `GP_COMPILER_MSVC` | Microsoft Visual C++ |
| `GP_COMPILER_CLANG` | LLVM Clang |
| `GP_COMPILER_GCC` | GNU Compiler Collection |
| `GP_COMPILER_EMSCRIPTEN` | Emscripten (WebAssembly compiler) |
| `GP_COMPILER_INTEL` | Intel C++ Compiler |
| `GP_COMPILER_VERSION` | Compiler version as an integer |

Version encoding varies by compiler: MSVC uses `_MSC_VER`, GCC and Clang encode as `major * 10000 + minor * 100 + patch`.

:::warning
Avoid compiler-specific code when possible. Use the portable utility macros (like `GP_FORCEINLINE` and `GP_LIKELY`) instead of checking compiler macros directly. Only use compiler detection as a last resort for working around specific bugs or accessing unique features.
:::

---

## C++ Standard Detection

| Macro | Standard |
|---|---|
| `GP_INTERNAL_CXX11` | C++11 or later |
| `GP_INTERNAL_CXX14` | C++14 or later |
| `GP_INTERNAL_CXX17` | C++17 or later |
| `GP_INTERNAL_CXX20` | C++20 or later |
| `GP_INTERNAL_CXX23` | C++23 or later |
| `GP_INTERNAL_CXX26` | C++26 or later |

These macros evaluate to `1` if the active standard meets or exceeds the indicated version, and `0` otherwise. The detected standard is also accessible directly as `GP_CXX_STANDARD`.

---

## Build Configuration

| Macro | Description |
|---|---|
| `GP_BUILD_DEBUG` | `1` in debug builds (`DEBUG` or `_DEBUG` defined), `0` otherwise |
| `GP_BUILD_RELEASE` | `1` in release builds, `0` otherwise |

---

## Endianness Detection

Endianness determines the byte order used to store multi-byte values in memory. Most modern platforms are little-endian, but you need to account for byte order when reading binary files, working with network protocols, or interfacing with hardware.

The engine detects endianness automatically using `__BYTE_ORDER__`, platform heuristics, and architecture family fallbacks.

| Macro | Description |
|---|---|
| `GP_ENDIAN_LITTLE` | `1` on little-endian targets |
| `GP_ENDIAN_BIG` | `1` on big-endian targets |

:::note
Windows is unconditionally treated as little-endian. All x86-family architectures default to little-endian when no other detection mechanism is available. In practice, you'll rarely encounter big-endian platforms in modern game development.
:::

---

## SIMD Capabilities

SIMD (Single Instruction, Multiple Data) instructions allow you to perform the same operation on multiple values simultaneously, dramatically improving performance for math-heavy code like physics, rendering, and audio processing.

The engine automatically detects which SIMD instruction sets are available based on your target architecture and compiler flags. Use these macros to conditionally compile optimized code paths:

### x86 / x64

| Macro | Instruction Set |
|---|---|
| `GP_SIMD_SSE` | SSE |
| `GP_SIMD_SSE2` | SSE2 |
| `GP_SIMD_SSE3` | SSE3 |
| `GP_SIMD_SSSE3` | SSSE3 |
| `GP_SIMD_SSE4_1` | SSE4.1 |
| `GP_SIMD_SSE4_2` | SSE4.2 |
| `GP_SIMD_AVX` | AVX |
| `GP_SIMD_AVX2` | AVX2 |
| `GP_SIMD_AVX512` | AVX-512F |
| `GP_SIMD_FMA` | FMA (Fused Multiply-Add) |

### ARM

| Macro | Instruction Set |
|---|---|
| `GP_SIMD_NEON` | ARM NEON |
| `GP_SIMD_ARM_FMA` | ARM FMA |

### WebAssembly

| Macro | Instruction Set |
|---|---|
| `GP_SIMD_WASM128` | WASM SIMD 128-bit |

### Generic Availability

```cpp
#define GP_SIMD_AVAILABLE (GP_SIMD_SSE || GP_SIMD_NEON || GP_SIMD_WASM128)
```

`GP_SIMD_AVAILABLE` evaluates to `1` if any SIMD instruction set is available on the current target. Use this macro when you have a SIMD-optimized code path but don't care which specific instruction set is used.

:::tip
When writing SIMD code, always provide a scalar fallback for platforms without SIMD support. This ensures your code remains portable.
:::

---

## Compiler Utility Macros

Different compilers provide different extensions for controlling optimization, alignment, and code generation. Rather than using compiler-specific syntax everywhere, we provide portable macros that abstract these differences.

Always use these macros instead of compiler-specific keywords. This keeps your code portable and makes it easier to support new compilers in the future.

### Inlining

| Macro | Description |
|---|---|
| `GP_FORCEINLINE` | Forces the compiler to inline a function (`__forceinline` / `always_inline`) |
| `GP_NOINLINE` | Prevents the compiler from inlining a function (`noinline`) |

:::warning
Be conservative with `GP_FORCEINLINE`. Overuse can actually hurt performance by bloating code size and preventing the compiler from making better optimization decisions. Use it only for small, performance-critical functions where profiling shows a benefit. See the [Coding Standard](../../programming-with-cpp/coding-standard.md#physical-dependencies) for more guidance.
:::

### Code Optimization Hints

| Macro | Description |
|---|---|
| `GP_LIKELY(x)` | Hints that `x` is likely `true`. Uses `[[likely]]` in C++20, `__builtin_expect` on GCC/Clang |
| `GP_UNLIKELY(x)` | Hints that `x` is likely `false`. Uses `[[unlikely]]` in C++20, `__builtin_expect` on GCC/Clang |
| `GP_UNREACHABLE()` | Marks a code path as unreachable. Uses `std::unreachable()` in C++23, compiler intrinsics otherwise |
| `GP_ASSUME(x)` | Informs the compiler that `x` is always `true`, enabling additional optimizations |

These hints help the compiler generate better code by providing information about control flow:
- Use `GP_LIKELY` and `GP_UNLIKELY` on error-handling branches to improve instruction cache utilization
- Use `GP_UNREACHABLE` after switch statements with exhaustive cases or after functions that never return
- Use `GP_ASSUME` carefully, as incorrect assumptions can lead to undefined behavior

### Attributes

| Macro | Description |
|---|---|
| `GP_NODISCARD` | Warns if the return value of a function is discarded (`[[nodiscard]]`) |
| `GP_MAYBE_UNUSED` | Suppresses unused variable/parameter warnings (`[[maybe_unused]]`) |
| `GP_NORETURN` | Marks a function as never returning (`[[noreturn]]`) |
| `GP_DEPRECATED(msg)` | Marks a declaration as deprecated with a custom message (`[[deprecated(msg)]]`) |
| `GP_RESTRICT` | Applies restrict/`__restrict__` semantics to a pointer parameter |

### Memory & Alignment

| Macro | Description |
|---|---|
| `GP_ALIGN(x)` | Aligns a variable or type to `x` bytes (`alignas(x)`) |
| `GP_CACHE_LINE_SIZE` | The cache line size in bytes for the current architecture (64 bytes on all supported targets) |
| `GP_CACHE_ALIGNED` | Shorthand for `GP_ALIGN(GP_CACHE_LINE_SIZE)` |

Proper alignment is critical for performance:
- SIMD instructions often require aligned data (16-byte alignment for SSE, 32-byte for AVX)
- Cache-line alignment prevents false sharing in multithreaded code
- Natural alignment improves load/store performance on all platforms

:::tip
When declaring data structures accessed by multiple threads, use `GP_CACHE_ALIGNED` to prevent false sharing. This ensures that each thread's data sits in separate cache lines, avoiding expensive cache coherency traffic.
:::

### Debugging

| Macro | Description |
|---|---|
| `GP_DEBUGBREAK()` | Triggers a hardware breakpoint at the call site |
| `GP_FUNCSIG` | Expands to the full decorated function signature as a string (`__PRETTY_FUNCTION__` / `__FUNCSIG__`) |

### Utility

| Macro | Description |
|---|---|
| `GP_BIT(x)` | Creates a 32-bit bitmask with bit `x` set |
| `GP_BIT64(x)` | Creates a 64-bit bitmask with bit `x` set |
| `GP_ARRAY_SIZE(arr)` | Returns the number of elements in a fixed-size array |
| `GP_OFFSETOF(type, member)` | Returns the byte offset of `member` within `type` |
| `GP_UNUSED(x)` | Suppresses unused variable warnings by casting to `void` |
| `GP_CONCAT(a, b)` | Concatenates two preprocessor tokens |
| `GP_STRINGIFY(x)` | Converts a preprocessor token to a string literal |
| `GP_VERSION(major, minor, patch)` | Packs a semantic version triplet into a single integer |

---

## Assertion Macros

Assertions help you catch bugs early by validating assumptions in your code. They're one of the most valuable debugging tools available, and you should use them liberally.

Assertions are active when `GP_ENABLE_ASSERTS` is `1`, which is the default in debug builds. In release builds, most assertions compile to no-ops, but the expression you pass to them will still be evaluated if it has side effects. `GP_ASSERT_FATAL` and `GP_VERIFY` retain their side effects in all configurations.

| Macro | Description |
|---|---|
| `GP_ASSERT(expr, ...)` | Asserts that `expr` is true. No-op in release. |
| `GP_ASSERT_FATAL(expr, ...)` | Asserts that `expr` is true. Calls `std::abort()` in release if the expression is false. |
| `GP_VERIFY(expr, ...)` | Alias for `GP_ASSERT`. Expression is still evaluated in release. |
| `GP_CHECK(expr, ...)` | Alias for `GP_ASSERT`. |
| `GP_ENSURE(expr, ...)` | Logs a warning if `expr` is false, but does not abort. No-op in release. |
| `GP_STATIC_ASSERT(expr, msg)` | Compile-time assertion via `static_assert`. Always active. |
| `GP_ASSERT_NOT_NULL(ptr, ...)` | Asserts that `ptr` is not `nullptr`. |
| `GP_ASSERT_ALIGNED(ptr, alignment)` | Asserts that `ptr` is aligned to the given byte boundary. |
| `GP_ASSERT_RANGE(value, min, max)` | Asserts that `value` falls within `[min, max]`. |
| `GP_ASSERT_UNREACHABLE(...)` | Triggers a fatal assertion if executed. Marks the path as unreachable to the optimizer. |
| `GP_ASSERT_NOT_IMPLEMENTED(...)` | Triggers a fatal assertion indicating unimplemented functionality. |

:::tip Best Practices
- Use `GP_ASSERT` for preconditions, postconditions, and invariants
- Use `GP_ASSERT_NOT_NULL` before dereferencing pointers
- Use `GP_VERIFY` when the expression has side effects that must occur in release builds
- Provide descriptive messages with your assertions to help diagnose failures
- Don't use assertions for error handling of expected conditions (like invalid user input)
:::

---

## Feature Flags

Feature flags are exposed as both preprocessor macros and typed `inline constexpr bool` values in the `GP::Build::Features` namespace. Flags that default to `GP_BUILD_DEBUG` are automatically disabled in release builds.

| Feature | Default | Description |
|---|---|---|
| `GP_ENABLE_PHYSICS` | `1` | Physics simulation |
| `GP_ENABLE_AUDIO` | `1` | Audio system |
| `GP_ENABLE_3D_AUDIO` | `1` | Spatial/3D audio |
| `GP_ENABLE_NETWORKING` | `1` | Networking subsystem |
| `GP_ENABLE_PROFILING` | Debug only | CPU profiling |
| `GP_ENABLE_GPU_PROFILING` | Debug only | GPU profiling |
| `GP_ENABLE_MEMORY_TRACKING` | Debug only | Memory allocation tracking |
| `GP_ENABLE_MEMORY_VALIDATION` | Debug only | Memory integrity validation |
| `GP_ENABLE_LOGGING` | `1` | Runtime logging |
| `GP_ENABLE_VERBOSE_LOGGING` | Debug only | Verbose/trace logging |
| `GP_ENABLE_ASSERTS` | Debug only | Assertion macros |
| `GP_ENABLE_HOT_RELOAD` | Debug only | Asset and code hot-reload |
| `GP_ENABLE_SCRIPT_BINDINGS` | `1` | Scripting language bindings |
| `GP_ENABLE_EDITOR` | `0` | Editor mode |
| `GP_ENABLE_DOUBLE_PRECISION` | `0` | Double-precision `Real` type |

All feature flags can be overridden by defining them before including this header.

---

## `GP::Build` Namespace

While preprocessor macros are necessary for conditional compilation, they have limitations: they can't be used in template constraints, they pollute the global namespace, and they're not subject to normal C++ scoping rules.

To address this, all detection results are mirrored as `inline constexpr bool` (or `int`) values within the `GP::Build` namespace. This enables use in C++ `if constexpr` branches, template constraints, and other contexts where preprocessor macros don't work.

```cpp showLineNumbers
// Example: branch on platform at compile time without macros
if constexpr (GP::Build::Platform::IsWindows)
{
    // Windows-only path
}

// Example: check SIMD availability
if constexpr (GP::Build::SIMD::HasAVX2)
{
    // Use AVX2-accelerated path
}
```

| Sub-namespace | Contents |
|---|---|
| `GP::Build::Platform` | `IsWindows`, `IsLinux`, `IsMacOS`, `IsIOS`, `IsAndroid`, `IsWeb`, `IsDesktop`, `IsMobile`, `IsApple`, `IsUnix` |
| `GP::Build::Architecture` | `IsX86`, `IsX64`, `IsARM32`, `IsARM64`, `IsWASM`, `IsX86Family`, `IsARMFamily`, `Is64Bit`, `Is32Bit` |
| `GP::Build::Compiler` | `IsMSVC`, `IsClang`, `IsGCC`, `IsEmscripten`, `IsIntel`, `Version` |
| `GP::Build::Language` | `Standard`, `IsCXX11` through `IsCXX26` |
| `GP::Build::Configuration` | `IsDebug`, `IsRelease` |
| `GP::Build::Endian` | `IsLittle`, `IsBig` |
| `GP::Build::SIMD` | All SIMD capability flags, `IsAvailable` |
| `GP::Build::Features` | All engine feature flags |

---

## Primitive Type Aliases

One of the challenges of writing portable C++ is that fundamental types like `int` and `long` have platform-dependent sizes. On some platforms, `int` is 16 bits; on others, it's 32 bits. This makes it nearly impossible to write code that behaves consistently across platforms.

To solve this problem, all engine code uses canonical type aliases defined in the `GP` namespace. These aliases have explicit, guaranteed sizes that are validated at compile time. Direct use of raw types such as `int` or `unsigned long` is discouraged in engine source.

:::tip
Always use the engine's type aliases (`Int32`, `Float32`, etc.) instead of raw types. This ensures your code behaves identically on all platforms and makes your intent clear to readers.
:::

### Integer Types

| Alias | Underlying Type | Size |
|---|---|---|
| `GP::Int8` | `std::int8_t` | 1 byte |
| `GP::UInt8` | `std::uint8_t` | 1 byte |
| `GP::Int16` | `std::int16_t` | 2 bytes |
| `GP::UInt16` | `std::uint16_t` | 2 bytes |
| `GP::Int32` | `std::int32_t` | 4 bytes |
| `GP::UInt32` | `std::uint32_t` | 4 bytes |
| `GP::Int64` | `std::int64_t` | 8 bytes |
| `GP::UInt64` | `std::uint64_t` | 8 bytes |

### Floating-Point Types

| Alias | Underlying Type | Size |
|---|---|---|
| `GP::Float32` | `float` | 4 bytes |
| `GP::Float64` | `double` | 8 bytes |
| `GP::Real` | `Float32` or `Float64` | Controlled by `GP_ENABLE_DOUBLE_PRECISION` |

`GP::Real` is the engine's default scalar type. It resolves to `Float32` unless `GP_ENABLE_DOUBLE_PRECISION` is set to `1`, in which case it resolves to `Float64`.

:::tip
Use `Real` for all general-purpose math to ensure consistency across precision modes. Only use `Float32` or `Float64` explicitly when you have a specific reason to force a particular precision (such as matching a file format or GPU shader).
:::

### Character Types

| Alias | Underlying Type | Notes |
|---|---|---|
| `GP::Char8` | `char` | |
| `GP::UChar8` | `char8_t` (C++20) / `unsigned char` | |
| `GP::Char16` | `char16_t` | |
| `GP::Char32` | `char32_t` | |
| `GP::WideChar` | `wchar_t` | |

### System & Memory Types

| Alias | Underlying Type | Description |
|---|---|---|
| `GP::SizeT` | `std::size_t` | Unsigned size type |
| `GP::SSizeT` | `std::ptrdiff_t` | Signed size type |
| `GP::OffsetT` | `std::ptrdiff_t` | Byte offset type |
| `GP::UIntPtr` | `std::uintptr_t` | Unsigned pointer-sized integer |
| `GP::IntPtr` | `std::intptr_t` | Signed pointer-sized integer |
| `GP::NullPtr` | `std::nullptr_t` | Null pointer type |
| `GP::Byte` | `std::byte` (C++20) / `UInt8` | Raw byte type |

All type sizes are validated at compile time via `static_assert`. On 64-bit platforms, `SizeT` is asserted to be 8 bytes; on 32-bit platforms, 4 bytes. If you're porting the engine to a new platform and types don't match expectations, you'll get clear compile-time errors.

---

## Example Usage

Here's how you use the various features of `CoreBuild.hpp` in practice:

```cpp showLineNumbers
#include "CoreBuild.hpp"

// Always use engine primitive types for clarity and portability
GP::Float32 speed = 9.8f;
GP::UInt32  entityId = 42u;
GP::Real    distance = 100.0;  // Precision controlled by GP_ENABLE_DOUBLE_PRECISION

// Compile-time platform branching without preprocessor macros
if constexpr (GP::Build::Platform::IsWindows)
{
    // Windows-specific initialization
    InitializeWindowsSubsystems();
}
else if constexpr (GP::Build::Platform::IsUnix)
{
    // Unix-like platforms (Linux, macOS, etc.)
    InitializePosixSubsystems();
}

// Compile-time SIMD dispatch for optimized code paths
if constexpr (GP::Build::SIMD::HasAVX2)
{
    // Use AVX2-optimized implementation
    ProcessDataAVX2(data, count);
}
else if constexpr (GP::Build::SIMD::HasSSE2)
{
    // Fall back to SSE2
    ProcessDataSSE2(data, count);
}
else
{
    // Scalar fallback for platforms without SIMD
    ProcessDataScalar(data, count);
}

// Use assertions to validate assumptions and catch bugs early
GP_ASSERT(speed > 0.0f, "Speed must be positive");
GP_ASSERT_NOT_NULL(pEntity, "Entity pointer must not be null");
GP_ASSERT_RANGE(index, 0, arraySize - 1);

// Force-inline performance-critical functions (use sparingly)
GP_FORCEINLINE GP::Float32 Square(GP::Float32 x) 
{ 
    return x * x; 
}

// Prevent inlining of large functions to reduce code bloat
GP_NOINLINE void ComplexInitializationRoutine()
{
    // Large initialization code...
}

// Use branch prediction hints for error paths
if (GP_UNLIKELY(pResource == nullptr))
{
    // Error path - unlikely to be taken
    HandleResourceLoadFailure();
    return false;
}

// Cache-line aligned structure to prevent false sharing in multithreaded code
struct GP_CACHE_ALIGNED TransformBuffer
{
    GP::Float32 data[16];
};

// Mark unreachable code paths for optimization
switch (type)
{
    case Type::A: HandleA(); break;
    case Type::B: HandleB(); break;
    default:
        GP_ASSERT_UNREACHABLE("Unknown type");
}
```

---

## Source

The full source for `CoreBuild` is available in the engine repository:

[`Source/Runtime/Core/Public/CoreBuild.hpp`](https://github.com/GraphicalPlayground/gp-engine/blob/main/Source/Runtime/Core/Public/CoreBuild.hpp)
