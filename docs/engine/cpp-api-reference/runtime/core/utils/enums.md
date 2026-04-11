---
sidebar_position: 0
title: Enumerations
description: Enumerations utilities for C++ API
tags:
    - c++
    - utilities
    - enums
---

[`enums.hpp`](https://github.com/GraphicalPlayground/gp-engine/blob/main/src/runtime/core/public/utils/enums.hpp)

# Enumerations Utilities

Modern C++ `enum class` types provide excellent type safety, but they lack the ergonomics of C-style enums when it comes to bitwise manipulation and logical ordering.
The Graphical Playground Enum Utilities provide a trait-based "opt-in" mechanism to restore these features safely using C++20/23 concepts.

## Bitwise Operators

### Overview

By default, scoped enumerations cannot be treated as bitmasks. Developers are usually forced to pepper their code with `static_cast<underlying_type>(...)` just to combine two flags.

The `gp::bitwise_enum` concept allows you to enable standard bitwise operators (`|`, `&`, `^`, `~`) and their assignment variants (`|=`, `&=`, `^=`) for specific enum types. This ensures your flags remain type-safe while behaving like the bitfields they are meant to be.

### Usage

To enable bitwise operations, use the `GP_ENABLE_ENUM_BITWISE_OPERATIONS` macro in the global namespace.

```cpp showLineNumbers
enum class visibility_flags : gp::u32
{
    none    = 0,
    static  = 1 << 0,
    dynamic = 1 << 1,
    shadow  = 1 << 2
};

// Enable the magic
GP_ENABLE_ENUM_BITWISE_OPERATIONS(visibility_flags);

// Standard usage
visibility_flags flags = visibility_flags::static | visibility_flags::shadow;
flags |= visibility_flags::dynamic;
```

## Semantic Helpers

In addition to operators, the `gp::enums` namespace provides high-level helpers for more readable logic:

| Function                            | Description                                              |
|-------------------------------------|----------------------------------------------------------|
|`has_any_flags(val)`                 | Returns true if the value is non-zero.                   |
|`has_all_flags(val, flags)`          | Returns true if all specified bits are present.          |
|`has_no_flags(val, flags)`           | Returns true if none of the specified bits are present.  |
|`set_flags(val, flags)`              | Functional equivalent to val | flags.                    |
|`clear_flags(val, flags)`            | Removes specified bits from the value.                   |
|`toggle_flags(val, flags)`           | Flips the state of the specified bits.                   |

## Comparison Operators

### Overview

While `enum class` supports basic comparison by default, it is often useful to explicitly mark an enum as __comparable__. This is particularly relevant in generic programming when using the `gp::comparable_enum` concept to constrain templates.

Enabling this explicitly signals that the underlying integer order of the enum is a meaningful representation of "scale" or "priority" (e.g., `low < high`).

### Usage

Use the `GP_ENABLE_ENUM_COMPARISON_OPERATIONS` macro to register the enum.

```cpp showLineNumbers
enum class thread_priority : gp::i8
{
    idle,
    lowest,
    normal,
    highest,
    timecritical
};

GP_ENABLE_ENUM_COMPARISON_OPERATIONS(thread_priority);

// Now valid for systems constrained by gp::comparable_enum
if (current_priority > thread_priority::normal)
{
    boost_performance();
}
```

## Concept Constraints

The primary power of these utilities lies in their integration with C++ concepts. You can write generic code that strictly only accepts your "enhanced" enums:

```cpp showLineNumbers
template <gp::bitwise_enum T>
void write_flags_to_buffer(T flags)
{
    // Guaranteed to support bitwise logic
}

template <gp::comparable_enum T>
void sort_by_priority(gp::vector<T>& values)
{
    // Guaranteed to have a meaningful sort order
}
```

:::note
These operations are implemented using `constexpr` and `GP_INLINE`, resulting in zero runtime overhead. The generated assembly is identical to performing operations on raw integers.
:::
