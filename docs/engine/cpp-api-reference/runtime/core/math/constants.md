---
title: Constants
description: Mathematical constants for C++ API.
tags:
    - c++
    - math
    - constants
---

# Constants

The `Constants` struct provides a collection of mathematical constants and conversion factors for floating-point types. It includes values such as Pi, Euler's number, and various limits and thresholds that are commonly used in mathematical computations.

## Definition

```cpp showLineNumbers
template <Concepts::IsFloatingPoint T>
struct Constants final
```

:::warning

**Note:** The `Constants` struct is designed for floating-point types and should not be used with integer types. Attempting to use it with non-floating-point types will result in a compilation error due to the `IsFloatingPoint` concept constraint.

:::

## Public Members

### Pi

```cpp
static constexpr T Pi;
```
The mathematical constant π ≈ `3.14159265358979323846`. Sourced from `std::numbers::pi_v<T>`.

---

```cpp
static constexpr T TwoPi;
```
Two times π ≈ `6.28318530717958647692`. Represents a full rotation in radians and is commonly used in periodic functions and angular wrapping.

---

```cpp
static constexpr T HalfPi;
```
Half of π ≈ `1.57079632679489661923`. Represents a 90-degree rotation in radians. Frequently used in trigonometric identities and orientation math.

---

```cpp
static constexpr T QuarterPi;
```
One quarter of π ≈ `0.78539816339744830961`. Represents a 45-degree rotation in radians.

---

```cpp
static constexpr T InvPi;
```
The multiplicative inverse of π ≈ `0.31830988618379067153`. Sourced from `std::numbers::inv_pi_v<T>`. Useful for normalizing values that are expressed as multiples of π.

---

```cpp
static constexpr T InvTwoPi;
```
The multiplicative inverse of 2π ≈ `0.15915494309189533576`. Useful for converting radians into a normalized `[0, 1]` frequency range.

---

### Conversion

```cpp
static constexpr T DegToRad;
```
Conversion factor from degrees to radians — equivalent to `π / 180`. Multiply a degree value by this constant to obtain its radian equivalent.

---

```cpp
static constexpr T RadToDeg;
```
Conversion factor from radians to degrees — equivalent to `180 / π`. Multiply a radian value by this constant to obtain its degree equivalent.

---

### Mathematical Constants

```cpp
static constexpr T E;
```
Euler's number ≈ `2.71828182845904523536`. The base of the natural logarithm. Sourced from `std::numbers::e_v<T>`.

---

```cpp
static constexpr T Sqrt2;
```
The square root of 2 ≈ `1.41421356237309504880`. Sourced from `std::numbers::sqrt2_v<T>`. Commonly appears in diagonal distance calculations and rotation matrices.

---

```cpp
static constexpr T Sqrt3;
```
The square root of 3 ≈ `1.73205080756887729352`. Frequently used in hexagonal grid math and equilateral triangle geometry.

---

```cpp
static constexpr T InvSqrt2;
```
The multiplicative inverse of √2 ≈ `0.70710678118654752440`. Equivalent to `1 / √2` or `√2 / 2`. Commonly used to construct 45-degree unit vectors.

---

```cpp
static constexpr T Ln2;
```
The natural logarithm of 2 ≈ `0.69314718055994530941`. Sourced from `std::numbers::ln2_v<T>`. Used in exponential decay and octave-based frequency calculations.

---

```cpp
static constexpr T Ln10;
```
The natural logarithm of 10 ≈ `2.30258509299404568401`. Sourced from `std::numbers::ln10_v<T>`. Used for converting between natural and base-10 logarithms.

---

```cpp
static constexpr T Log2E;
```
The base-2 logarithm of Euler's number ≈ `1.44269504088896340735`. Sourced from `std::numbers::log2e_v<T>`. Useful for fast power-of-two exponent computations.

---

```cpp
static constexpr T Log10E;
```
The base-10 logarithm of Euler's number ≈ `0.43429448190325182765`. Sourced from `std::numbers::log10e_v<T>`.

---

```cpp
static constexpr T Phi;
```
The golden ratio φ ≈ `1.61803398874989484820`. Sourced from `std::numbers::phi_v<T>`. Appears in procedural geometry, aesthetics-driven layout systems, and Fibonacci-based sequences.

---

### Limits

```cpp
static constexpr T Epsilon;
```
The smallest representable difference between two distinct floating-point values of type `T`. Sourced from `std::numeric_limits<T>::epsilon()`. Used as a baseline for floating-point equality comparisons.

---

```cpp
static constexpr T Infinity;
```
Positive infinity for type `T`. Sourced from `std::numeric_limits<T>::infinity()`. Useful as a sentinel value in distance queries, BVH traversal, and min/max initialization.

---

### Tolerance

```cpp
static constexpr T SmallNumber;
```
A very small number (`1e-8`). Suitable for high-precision near-zero comparisons where `Epsilon` may be too strict.

---

```cpp
static constexpr T KindaSmallNumber;
```
A moderately small number (`1e-4`). Used when a looser near-zero threshold is acceptable, such as in physics simulations or animation blending.

---

```cpp
static constexpr T BigNumber;
```
A large finite number (`3.4e+38`). Useful as a practical stand-in for infinity in systems where IEEE infinity is undesirable, such as certain physics solvers or serialized data ranges.

---

```cpp
static constexpr T Delta;
```
A general-purpose small delta value (`0.00001`). Commonly used as a nudge factor or a safe margin in geometric intersection tests.

---

### Thresholds

Thresholds are used to determine when two floating-point numbers are considered equal or when a number is close enough to zero. All threshold values are defined within the nested `Thresholds` struct.

```cpp showLineNumbers
struct Thresholds final
```

---

```cpp
static constexpr T Normal;
```
Minimum acceptable length for a vector to be considered normalized (`0.0001`). Set to half the maximum meaningful value to prevent dot product overflow when operating on normalized vectors.

---

```cpp
static constexpr T PointOnPlane;
```
Half-thickness of a plane used in front/back/inside classification tests (`0.10`). Points within this distance of a plane are considered coplanar.

---

```cpp
static constexpr T PointOnSide;
```
Half-thickness of a polygon edge's side-plane used in point-inside/outside/on-side tests (`0.20`).

---

```cpp
static constexpr T PointsAreSame;
```
Maximum distance between two points for them to be considered identical (`0.00002`). Used in mesh welding, deduplication, and CSG operations.

---

```cpp
static constexpr T PointsAreNear;
```
Maximum distance between two points for them to be considered near-enough to merge when imprecise math is acceptable (`0.015`).

---

```cpp
static constexpr T NormalsAreSame;
```
Maximum angular deviation between two normals for them to be considered identical (`0.00002`). Used in normal averaging and smoothing group classification.

---

```cpp
static constexpr T UVsAreSame;
```
Maximum difference between two UV coordinates for them to be considered the same (`0.0009765625`, equivalent to `1 / 1024`). 

:::caution
Setting this value too large will cause incorrect CSG classification and UV seam artifacts.
:::

---

```cpp
static constexpr T VectorsAreNear;
```
Maximum distance between two vectors for them to be considered near-enough to merge when imprecise math is acceptable (`0.0004`). 

:::caution
Setting this value too large can introduce lighting artifacts caused by inaccurate texture coordinate interpolation.
:::

---

```cpp
static constexpr T SplitPolygonWithPlane;
```
Distance threshold at which a plane is considered to split a polygon in half (`0.25`). Used in BSP tree construction and convex decomposition.

---

```cpp
static constexpr T SplitPolygonPrecisely;
```
A tighter distance threshold for precise polygon splitting (`0.01`). Used when high-fidelity BSP splits are required.

---

```cpp
static constexpr T ZeroNormSquared;
```
The squared magnitude threshold below which a unit normal is considered degenerate (zero-length) (`0.0001`).

---

```cpp
static constexpr T NormalsAreParallel;
```
Minimum absolute dot product between two unit vectors for them to be considered parallel (`0.999845`). Approximately equivalent to `cos(1.0°)`.

---

```cpp
static constexpr T NormalsAreOrthogonal;
```
Maximum absolute dot product between two unit vectors for them to be considered orthogonal (perpendicular) (`0.017455`). Approximately equivalent to `cos(89.0°)`.

---

```cpp
static constexpr T VectorNormalized;
```
Maximum allowed deviation of a vector's squared magnitude from `1.0` for it to be considered normalized (`0.01`).

---

```cpp
static constexpr T QuaternionNormalized;
```
Maximum allowed deviation of a quaternion's squared magnitude from `1.0` for it to be considered normalized (`0.01`).

---

## Example Usage

```cpp showLineNumbers
#include "Math/Constants.hpp"

using FloatConstants = GP::Math::Constants<float>;
using DoubleConstants = GP::Math::Constants<double>;

// Convert 90 degrees to radians
float radians = 90.0f * FloatConstants::DegToRad;

// Check if a vector length is degenerate
bool isDegenerate = squaredLength < FloatConstants::Thresholds::ZeroNormSquared;

// Use infinity as a sentinel for BVH traversal
float tMin = FloatConstants::Infinity;
```

---

## Source

The full source for `Constants` is available in the engine repository:

[`Source/Runtime/Core/Public/Math/Utils/Constants.hpp`](https://github.com/GraphicalPlayground/gp-engine/blob/main/Source/Runtime/Core/Public/Math/Utils/Constants.hpp)
