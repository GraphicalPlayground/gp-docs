---
slug: basic-mathematical-knowledge
title: "Basic Mathematical Knowledge for Graphical Engineering"
authors: mallory-scotton
tags: [research, technical, mathematics, linear algebra, quaternions, geometry, rendering equation, signal processing, monte carlo, brdf, color theory, gp engine]
---

# Basic Mathematical Knowledge for Graphical Engineering

**A Principal Engineer's Foundational Guide to the Mathematics Underpinning Real-Time Rendering**

---

> *"You cannot reason about a renderer you cannot derive. Every rendering technique, from a single rasterized triangle to a full path-traced reservoir resampling pipeline, is the application of three centuries of mathematics to the problem of moving photons from a virtual world into a human eye. Learn the math, and the engine becomes obvious."*

---

## Abstract

Real-time computer graphics is, at its core, **applied mathematics with a deadline**. Every frame, the GPU executes billions of arithmetic operations whose correctness rests on a small set of foundational mathematical structures: linear algebra, projective geometry, calculus, probability, and signal processing. Yet the modern engine engineer is rarely taught these subjects in a unified, graphics-oriented form. Textbooks treat them in isolation; tutorials skip the derivations; production codebases hide them behind opaque utility functions. This paper attempts to close the gap. We present a comprehensive, self-contained survey of the mathematical knowledge required to build, debug, and reason about a modern AAA renderer, from the first vector dot product up to the rendering equation, Monte Carlo importance sampling, quaternion blending, and the numerical stability concerns that haunt every shader. We motivate each topic with its concrete graphical application, derive the formulas from first principles where it aids understanding, and provide reference C++23 implementations consistent with the conventions of the **Graphical Playground (GP) Engine**'s in-house mathematics library. This document is intended both as a study reference for engineers entering the field and as the foundational curriculum on which all subsequent GP educational material will build.

**Keywords:** linear algebra, quaternions, projective geometry, rendering equation, BRDF, Monte Carlo integration, signal processing, color spaces, numerical stability, SIMD, real-time rendering, GP Engine

{/* truncate */}

---

## Table of Contents

1. [Introduction and Motivation](#1-introduction-and-motivation)
2. [Number Systems and Floating-Point Reality](#2-number-systems-and-floating-point-reality)
3. [Linear Algebra: The Lingua Franca of Graphics](#3-linear-algebra-the-lingua-franca-of-graphics)
4. [Coordinate Systems and the Transformation Pipeline](#4-coordinate-systems-and-the-transformation-pipeline)
5. [Affine and Projective Transformations](#5-affine-and-projective-transformations)
6. [Rotations: From Euler Angles to Quaternions](#6-rotations-from-euler-angles-to-quaternions)
7. [Trigonometry and Analytic Geometry](#7-trigonometry-and-analytic-geometry)
8. [Calculus for Graphics Engineers](#8-calculus-for-graphics-engineers)
9. [Probability, Statistics, and Monte Carlo Methods](#9-probability-statistics-and-monte-carlo-methods)
10. [The Rendering Equation and Light Transport](#10-the-rendering-equation-and-light-transport)
11. [Color Theory and Color Spaces](#11-color-theory-and-color-spaces)
12. [Signal Processing and Anti-Aliasing](#12-signal-processing-and-anti-aliasing)
13. [Numerical Methods and Stability](#13-numerical-methods-and-stability)
14. [Spatial Data Structures and Computational Geometry](#14-spatial-data-structures-and-computational-geometry)
15. [Physics and Animation Mathematics](#15-physics-and-animation-mathematics)
16. [The GP Math Library: Design Rationale](#16-the-gp-math-library-design-rationale)
17. [Curriculum Roadmap and Further Study](#17-curriculum-roadmap-and-further-study)
18. [References](#18-references)

---

## 1. Introduction and Motivation

### 1.1 Why a Graphics Engineer Cannot Outsource the Math

Modern engines bundle mathematical utilities into libraries: GLM for OpenGL-style C++, DirectXMath for D3D, Eigen for the academic crowd, Unreal's `FMath` and `FVector`/`FMatrix`, Unity's `Vector3` and `Quaternion`, and so on. A casual reader of these libraries might conclude that the math is *solved*, that one need only call `glm::lookAt()` and the framework will produce the correct view matrix.

This is dangerously incomplete. The libraries are correct, but they are also **opinionated**. Each one bakes in conventions, row-major versus column-major, right-handed versus left-handed, depth in $[0, 1]$ versus $[-1, 1]$, pre-multiplication versus post-multiplication, that are invisible to the caller but catastrophic when crossed. A `glm::lookAt` matrix multiplied with a DirectX-convention projection matrix produces a scene that renders inside-out, with depth test inverted, and where culling is upside down. The error is a one-character convention mismatch; finding it without understanding the underlying math takes days.

More fundamentally, every nontrivial rendering technique requires the engineer to derive new math, not just apply old. Implementing screen-space reflections requires deriving the reflection vector from the partial derivatives of the depth buffer. Implementing physically based shading requires deriving the half-vector formulation of microfacet BRDFs and choosing between Smith and V-cavity shadowing. Implementing temporal anti-aliasing requires deriving sub-pixel jitter sequences from low-discrepancy number theory. None of these are library calls. All of them rest on the foundations this paper covers.

### 1.2 Why GP Writes Its Own Math Library

The Graphical Playground engine ships its own mathematics module, `source/runtime/core/public/maths/` (referenced in the [Engine Architecture](/blog/engine-architecture-layout) post). We did not adopt GLM, Eigen, or DirectXMath. The reasons are pedagogical first and engineering second:

1. **Transparency.** Every formula in GP's math library is derivable by a student reading the source. There is no hidden SIMD intrinsic that obscures the mathematical operation; the SIMD specialization sits *next to* the scalar reference implementation.
2. **Convention discipline.** GP standardizes on right-handed, column-major, $z$-up world space, $y$-up tangent space, $[0, 1]$ depth, pre-multiplication: $\mathbf{v}' = M \mathbf{v}$. These conventions are documented in the public headers and enforced by the type system, no implicit conversions across handedness.
3. **Educational value.** A student reading our `quaternion.hpp` learns *how* slerp works, not just that it exists. Comments cite the original papers; tests prove the algebraic identities.
4. **Performance autonomy.** When the time comes to vectorize for AVX-512 or NEON, we are not blocked on a third-party release cadence.

This paper is written from inside that library: every formula presented can be cross-referenced to a function in `core/public/maths/`, and every function in `core/public/maths/` derives from a formula presented here.

### 1.3 Reading Order

The paper is organized in dependency order: section $n$ requires only sections $1$ through $n-1$. A reader new to graphics should read linearly. A reader with prior background can skip §2-§3 and jump to §6 (quaternions), §10 (rendering equation), or §12 (signal processing) as needed. Every section closes with a short list of canonical references (collated in §18) for deeper study.

---

## 2. Number Systems and Floating-Point Reality

### 2.1 IEEE 754 in Three Sentences

A 32-bit single-precision float (`float` / `f32`) stores a number as

$$x = (-1)^s \cdot (1.m_{22}m_{21}\ldots m_0)_2 \cdot 2^{e - 127}$$

where $s$ is the sign bit, $m$ is a 23-bit mantissa, and $e$ is an 8-bit biased exponent. This buys roughly **7 decimal digits of precision** spanning $\pm 3.4 \times 10^{38}$, with a smallest normal value of $\approx 1.18 \times 10^{-38}$.

A 64-bit double (`double` / `f64`) extends mantissa to 52 bits and exponent to 11 bits, yielding roughly **15-16 decimal digits** spanning $\pm 1.8 \times 10^{308}$.

Half precision (`f16`, used in HDR textures and tensor cores) has 10 mantissa bits and 5 exponent bits, yielding $\approx 3$ decimal digits and a max value of $\approx 65504$.

### 2.2 Why This Matters: The Open World Origin Problem

A position vector stored in `f32` has different precision at different magnitudes. The gap between consecutive representable floats near $|x| = 1$ is $\approx 1.19 \times 10^{-7}$ (one ULP, *unit in the last place*). At $|x| = 10^4$ (10 km from the world origin) it is $\approx 9.77 \times 10^{-4}$, almost a millimeter. At $|x| = 10^6$ (1000 km) it is $\approx 0.12$ meters.

This is why open-world games like *Star Citizen* and *No Man's Sky* implement **camera-relative rendering** (also called *origin shifting* or *floating origin*): they translate the world so that the camera is always at $\mathbf{0}$, performing the subtraction in `f64` on the CPU before feeding `f32` positions to the GPU. The math:

$$\mathbf{p}_{rel} = \mathbf{p}_{world}^{f64} - \mathbf{c}_{camera}^{f64}, \quad \text{cast to } f32$$

without this trick, vertices wobble visibly past a few kilometers from origin.

### 2.3 The Cancellation Trap

Subtraction of nearly equal floats catastrophically loses precision:

$$1.0000001_{f32} - 1.0_{f32} = 1.19 \times 10^{-7}$$

with **only 1 significant bit remaining**. This drives a number of graphics-specific reformulations:

- **Quadratic formula:** the textbook $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ catastrophically cancels when $b^2 \gg 4ac$. The numerically stable form selects the sign:

$$x_1 = \frac{-b - \text{sgn}(b)\sqrt{b^2 - 4ac}}{2a}, \quad x_2 = \frac{c}{a x_1}$$

This appears in every ray-sphere intersection routine.

- **Depth comparison:** comparing two `f32` depths is unreliable when both are near 1.0. Reverse-Z (storing depth as $1 - z$) shifts precision back to the far plane where it is needed; it is now standard in AAA engines [Reed 2015].

### 2.4 Fixed-Point and Integer Math

Not everything is a float. Texture coordinates in GPU samplers use **8.8 fixed-point** for sub-texel addressing. Color buffers use **8-bit unsigned normalized** (`unorm8`): the byte $b$ represents the value $b / 255$. Mip-level computation uses fixed-point in hardware. The `unorm` decode is exactly:

$$x_{decoded} = \frac{b}{2^n - 1}, \quad b \in [0, 2^n - 1]$$

Note the divisor is $255$, not $256$, a subtlety that catches students implementing custom decoders.

### 2.5 Practical Rules

- Use `f32` for vertex positions, UVs, normals; `f64` only on the CPU for world-scale arithmetic.
- Never compare floats with `==`. Use `|a - b| < ε` with $\varepsilon$ chosen relative to the magnitude (relative tolerance) or as a fixed *ulp count*.
- Beware `NaN` propagation: a single uninitialized normal turns the entire shader output to black. Initialize.
- Denormals (`subnormals`) are slow on many CPUs; flush-to-zero is set by default in shader compilers and recommended on the CPU side too.

---

## 3. Linear Algebra: The Lingua Franca of Graphics

Every graphical operation, rotating a model, projecting it onto a screen, lighting it, transforming a normal, blending two animation poses, is expressible as **linear algebra over real-valued vectors**. We cover the operations that appear most frequently in rendering code.

### 3.1 Vectors

A vector $\mathbf{v} \in \mathbb{R}^n$ is an ordered $n$-tuple of real numbers. In graphics, $n \in \{2, 3, 4\}$ almost without exception. We write column vectors:

$$\mathbf{v} = \begin{pmatrix} v_x \\ v_y \\ v_z \end{pmatrix}$$

**Magnitude (length):**

$$\|\mathbf{v}\| = \sqrt{v_x^2 + v_y^2 + v_z^2}$$

**Normalization** (producing a unit vector $\hat{\mathbf{v}}$):

$$\hat{\mathbf{v}} = \frac{\mathbf{v}}{\|\mathbf{v}\|}$$

If $\|\mathbf{v}\| = 0$, normalization is undefined; production code checks for this with a small epsilon to avoid `NaN`.

### 3.2 The Dot Product

Given $\mathbf{a}, \mathbf{b} \in \mathbb{R}^3$:

$$\mathbf{a} \cdot \mathbf{b} = a_x b_x + a_y b_y + a_z b_z = \|\mathbf{a}\| \|\mathbf{b}\| \cos\theta$$

The dot product is the most-used scalar in all of rendering. It answers four questions simultaneously:

| Question | Formula | Used In |
|---|---|---|
| Are these vectors aligned? | $\hat{\mathbf{a}} \cdot \hat{\mathbf{b}}$ | Lambertian shading, backface culling |
| What is the projection of $\mathbf{a}$ onto $\mathbf{b}$? | $\frac{\mathbf{a} \cdot \mathbf{b}}{\|\mathbf{b}\|^2} \mathbf{b}$ | Reflection, shadow projection |
| What angle separates them? | $\arccos(\hat{\mathbf{a}} \cdot \hat{\mathbf{b}})$ | Cone tests, anisotropic lighting |
| Are they perpendicular? | $\mathbf{a} \cdot \mathbf{b} = 0$ | Plane equations, basis construction |

The single most common pattern in shading: $\max(\mathbf{N} \cdot \mathbf{L}, 0)$, the *Lambertian cosine term*, where $\mathbf{N}$ is the surface normal and $\mathbf{L}$ is the direction to the light. The clamp to zero discards back-facing light.

```cpp
// GP-style scalar reference implementation
constexpr f32 dot(const Vec3f& a, const Vec3f& b) noexcept {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}
```

### 3.3 The Cross Product

For $\mathbf{a}, \mathbf{b} \in \mathbb{R}^3$:

$$\mathbf{a} \times \mathbf{b} = \begin{pmatrix} a_y b_z - a_z b_y \\ a_z b_x - a_x b_z \\ a_x b_y - a_y b_x \end{pmatrix}$$

The result is a vector **perpendicular to both inputs**, with magnitude $\|\mathbf{a}\| \|\mathbf{b}\| \sin\theta$ (the area of the parallelogram they span). The direction follows the right-hand rule.

Used for:
- Computing **face normals** from triangle edges: $\mathbf{N} = (\mathbf{v}_1 - \mathbf{v}_0) \times (\mathbf{v}_2 - \mathbf{v}_0)$.
- Building **orthonormal bases**: given a normal $\mathbf{N}$ and a tangent $\mathbf{T}$, the bitangent is $\mathbf{B} = \mathbf{N} \times \mathbf{T}$.
- **Triangle area**: $A = \frac{1}{2} \|(\mathbf{v}_1 - \mathbf{v}_0) \times (\mathbf{v}_2 - \mathbf{v}_0)\|$.
- **Front/back face determination**: the sign of $(\mathbf{v}_1 - \mathbf{v}_0) \times (\mathbf{v}_2 - \mathbf{v}_0) \cdot \mathbf{V}$ where $\mathbf{V}$ is the view direction.

### 3.4 Vector Operations Summary

| Operation | Formula | Result | Cost |
|---|---|---|---|
| Add | $\mathbf{a} + \mathbf{b}$ | Vec3 | 3 add |
| Scale | $s \mathbf{a}$ | Vec3 | 3 mul |
| Dot | $\mathbf{a} \cdot \mathbf{b}$ | scalar | 3 mul + 2 add |
| Cross | $\mathbf{a} \times \mathbf{b}$ | Vec3 | 6 mul + 3 sub |
| Length squared | $\mathbf{a} \cdot \mathbf{a}$ | scalar | 3 mul + 2 add |
| Length | $\sqrt{\mathbf{a} \cdot \mathbf{a}}$ | scalar | + 1 sqrt |
| Normalize | $\mathbf{a} / \|\mathbf{a}\|$ | Vec3 | + 1 rsqrt + 3 mul |
| Linear interp | $(1-t)\mathbf{a} + t\mathbf{b}$ | Vec3 | 6 mul + 3 add |

**Lerp** is so central that it deserves its own line:

$$\text{lerp}(\mathbf{a}, \mathbf{b}, t) = \mathbf{a} + t(\mathbf{b} - \mathbf{a}) = (1-t)\mathbf{a} + t\mathbf{b}$$

The first form (single $t$ multiply) is preferred when $\mathbf{a}$ should be exactly returned at $t=0$; the second form is symmetric in $\mathbf{a}$ and $\mathbf{b}$ but multiplies twice. Both forms exist in production code; choose deliberately.

### 3.5 Matrices

A matrix $M \in \mathbb{R}^{m \times n}$ is a rectangular array. In graphics we use $2 \times 2$, $3 \times 3$, and $4 \times 4$. The fundamental operation is **matrix-vector multiplication**:

$$(M \mathbf{v})_i = \sum_{j=1}^{n} M_{ij} v_j$$

For a $3 \times 3$ matrix:

$$M \mathbf{v} = \begin{pmatrix} m_{00} & m_{01} & m_{02} \\ m_{10} & m_{11} & m_{12} \\ m_{20} & m_{21} & m_{22} \end{pmatrix} \begin{pmatrix} v_x \\ v_y \\ v_z \end{pmatrix} = \begin{pmatrix} m_{00} v_x + m_{01} v_y + m_{02} v_z \\ m_{10} v_x + m_{11} v_y + m_{12} v_z \\ m_{20} v_x + m_{21} v_y + m_{22} v_z \end{pmatrix}$$

**Matrix-matrix multiplication** $(AB)_{ij} = \sum_k A_{ik} B_{kj}$. For $4 \times 4$ matrices this is 64 multiplies and 48 adds, the unit operation of all transformation pipelines.

### 3.6 Memory Layout: Row-Major vs Column-Major

The same matrix can be stored two ways in memory:

**Row-major** (C, C++, DirectX convention):
```
[ m00 m01 m02 m03 | m10 m11 m12 m13 | m20 m21 m22 m23 | m30 m31 m32 m33 ]
```

**Column-major** (Fortran, OpenGL, Metal, GLSL convention):
```
[ m00 m10 m20 m30 | m01 m11 m21 m31 | m02 m12 m22 m32 | m03 m13 m23 m33 ]
```

The mathematics is unaffected; the memory layout is a **storage decision**. The peril is mismatch: passing a row-major matrix to a column-major shader transposes it implicitly, and a transposed transformation is its inverse for orthonormal matrices, exactly the wrong answer.

GP standardizes on **column-major storage** (matching the GLSL / SPIR-V default) and **column vectors** with **pre-multiplication**: $\mathbf{v}' = M\mathbf{v}$. Composing transforms reads right-to-left:

$$\mathbf{v}_{clip} = M_{proj} \cdot M_{view} \cdot M_{model} \cdot \mathbf{v}_{local}$$

### 3.7 Special Matrices

**Identity matrix** $I$: ones on diagonal, zeros elsewhere. $IM = MI = M$ and $I\mathbf{v} = \mathbf{v}$.

**Transpose** $M^T$: swap rows and columns: $(M^T)_{ij} = M_{ji}$. For a product: $(AB)^T = B^T A^T$.

**Inverse** $M^{-1}$: the matrix such that $MM^{-1} = M^{-1}M = I$. Exists if and only if $\det M \neq 0$. For a $2 \times 2$ matrix $\begin{pmatrix}a & b \\ c & d\end{pmatrix}$:

$$M^{-1} = \frac{1}{ad - bc}\begin{pmatrix}d & -b \\ -c & a\end{pmatrix}$$

For larger matrices, the closed-form via cofactor expansion is impractical; LU decomposition or specialized inverse formulas are used. **Crucial graphics fact**: for an orthonormal matrix (pure rotation), the inverse is the transpose:

$$R^{-1} = R^T \quad \text{when } R^T R = I$$

This is why view matrices are cheap to invert: they are translation + rotation, and we invert each piece separately.

**Determinant** measures signed volume change. For a $3 \times 3$ matrix:

$$\det M = m_{00}(m_{11}m_{22} - m_{12}m_{21}) - m_{01}(m_{10}m_{22} - m_{12}m_{20}) + m_{02}(m_{10}m_{21} - m_{11}m_{20})$$

A negative determinant indicates a **handedness flip**, and for normals this means winding order inversion. Engines use this to detect mirrored skeletons.

### 3.8 The Normal Matrix

A subtle but critical distinction: when transforming a vertex position by matrix $M$, the corresponding normal is **not** transformed by $M$ but by:

$$M_{normal} = (M^{-1})^T$$

This is because normals are *covectors* (one-forms): they transform inversely so that the dot-product with tangent vectors stays invariant. If $M$ contains only rotation and uniform scale, $(M^{-1})^T = M$ up to the scale factor and we can use $M$ directly. Under non-uniform scale, using $M$ for normals warps lighting visibly; the inverse-transpose is mandatory.

Reference: [PBR Book §3.10 (Applying Transformations: Normals)](https://pbr-book.org/4ed/Geometry_and_Transformations/Applying_Transformations)

### 3.9 Useful Reading

- Strang, *Introduction to Linear Algebra*, 5th ed. The canonical undergraduate reference.
- 3Blue1Brown, *Essence of Linear Algebra* video series. Visual intuition. ([youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab))
- Lengyel, *Foundations of Game Engine Development, Volume 1: Mathematics*.

---

## 4. Coordinate Systems and the Transformation Pipeline

### 4.1 The Cardinal Spaces

A vertex moves through five canonical coordinate spaces between the artist's modeling tool and the user's monitor:

```
LOCAL (object) ──[M_model]──> WORLD ──[M_view]──> VIEW (camera) ──[M_proj]──> CLIP ──[/w]──> NDC ──[viewport]──> SCREEN
```

| Space | Origin | Used For |
|---|---|---|
| Local / Object | Mesh authoring origin | Storing vertex data |
| World | Game world origin | Physics, gameplay queries |
| View / Camera / Eye | The camera | Lighting (sometimes), screen-space effects |
| Clip | Origin shifted by projection | Frustum clipping (hardware) |
| NDC (Normalized Device Coordinates) | Center of cube $[-1,1]^2 \times [0,1]$ | Hardware-internal rasterization |
| Screen / Window | Pixel grid | Final output |

Each transition is a matrix multiply (or, in the clip→NDC step, a *perspective divide*: $\mathbf{p}_{NDC} = \mathbf{p}_{clip}.xyz / \mathbf{p}_{clip}.w$).

### 4.2 Handedness

A coordinate system is **right-handed** if the cross product $\mathbf{x} \times \mathbf{y} = \mathbf{z}$ when measured with the right hand. It is **left-handed** if measured with the left.

The major conventions in industry:

| System | Forward | Up | Right | Notes |
|---|---|---|---|---|
| OpenGL / Vulkan world | $-Z$ | $+Y$ | $+X$ | Right-handed |
| OpenGL clip | $-Z$ | $+Y$ | $+X$ | Right-handed, $z \in [-1,1]$ |
| Vulkan clip | $+Z$ | $-Y$ | $+X$ | Right-handed, $z \in [0,1]$ |
| DirectX | $+Z$ | $+Y$ | $+X$ | Left-handed, $z \in [0,1]$ |
| Unreal Engine | $+X$ | $+Z$ | $+Y$ | Left-handed, $z$-up |
| Unity | $+Z$ | $+Y$ | $+X$ | Left-handed |
| Blender / GP world | $-Y$ or $+Y$ | $+Z$ | $+X$ | Right-handed, $z$-up |

GP follows Blender / scientific convention: **right-handed, $z$-up world space**. We acknowledge this is the minority among game engines; the choice is motivated by physical intuition (gravity along $-z$) and interoperability with engineering and CAD pipelines.

### 4.3 The View Matrix

The view matrix transforms world-space coordinates into camera-space coordinates: it is the inverse of the camera's world transform.

Given a camera at world position $\mathbf{c}$, looking at target $\mathbf{t}$, with up reference $\mathbf{u}_{ref}$ (typically world up):

$$\mathbf{f} = \frac{\mathbf{t} - \mathbf{c}}{\|\mathbf{t} - \mathbf{c}\|} \quad (\text{forward})$$

$$\mathbf{r} = \frac{\mathbf{f} \times \mathbf{u}_{ref}}{\|\mathbf{f} \times \mathbf{u}_{ref}\|} \quad (\text{right})$$

$$\mathbf{u} = \mathbf{r} \times \mathbf{f} \quad (\text{actual up})$$

For a right-handed system with camera looking down $-z_{cam}$:

$$M_{view} = \begin{pmatrix} r_x & r_y & r_z & -\mathbf{r} \cdot \mathbf{c} \\ u_x & u_y & u_z & -\mathbf{u} \cdot \mathbf{c} \\ -f_x & -f_y & -f_z & \mathbf{f} \cdot \mathbf{c} \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

The top-left $3 \times 3$ is the rotation (an orthonormal basis); the top-right column is the camera's negated position projected onto each basis vector; the bottom row is homogeneous.

### 4.4 The Projection Matrix

There are two common projections.

**Perspective projection** (the eye sees a frustum):

$$M_{proj}^{persp} = \begin{pmatrix} \frac{1}{a \tan(\theta/2)} & 0 & 0 & 0 \\ 0 & \frac{1}{\tan(\theta/2)} & 0 & 0 \\ 0 & 0 & \frac{f}{f-n} & -\frac{nf}{f-n} \\ 0 & 0 & 1 & 0 \end{pmatrix}$$

(left-handed, $z \in [0, 1]$ convention; Vulkan / DirectX style)

where $\theta$ is the vertical field of view, $a = W/H$ is the aspect ratio, $n$ is the near plane and $f$ is the far plane.

The bottom row is $(0, 0, 1, 0)$, meaning $w_{clip} = z_{view}$. The subsequent perspective divide $\mathbf{p}_{NDC} = \mathbf{p}_{clip} / w_{clip}$ scales $x$ and $y$ inversely with depth, producing the foreshortening that defines a perspective image.

**Orthographic projection** (parallel rays, used for shadow maps and 2D):

$$M_{proj}^{ortho} = \begin{pmatrix} \frac{2}{r-l} & 0 & 0 & -\frac{r+l}{r-l} \\ 0 & \frac{2}{t-b} & 0 & -\frac{t+b}{t-b} \\ 0 & 0 & \frac{1}{f-n} & -\frac{n}{f-n} \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

where $l, r, t, b, n, f$ are the extents of the view volume. The bottom row is $(0,0,0,1)$, so $w_{clip} = 1$; no perspective divide effect.

### 4.5 Reverse-Z Depth

The standard $z \in [0, 1]$ projection wastes precision: with `f32` depth and far/near ratios common in games (1000:1), 99% of the depth buffer's distinguishable values fall within the first 10% of the view distance, leaving the far field with severe z-fighting.

Reverse-Z swaps the mapping: the near plane maps to $z = 1$ and the far plane to $z = 0$. This is a one-line change in the projection matrix and an inverted depth comparison (`GREATER` instead of `LESS`). The win comes from the multiplicative interaction of `f32`'s exponent representation with the projection's hyperbolic depth, which now concentrates precision near the far plane where it is needed [Reed 2015]. GP enables Reverse-Z by default.

Reference: [NVIDIA Developer Blog: Visualizing the Z-Buffer's Depth Distribution](https://developer.nvidia.com/content/depth-precision-visualized)

---

## 5. Affine and Projective Transformations

### 5.1 The Homogeneous Coordinate Trick

A pure $3 \times 3$ matrix can rotate and scale, but it cannot translate, $M\mathbf{0} = \mathbf{0}$ for any linear $M$. To unify translation with rotation/scale, we extend $\mathbb{R}^3$ to $\mathbb{R}^4$ with a fourth coordinate $w$:

$$\mathbf{v} \mapsto (v_x, v_y, v_z, 1)^T \quad \text{(point)}$$
$$\mathbf{v} \mapsto (v_x, v_y, v_z, 0)^T \quad \text{(direction)}$$

A direction has $w = 0$ so translation doesn't affect it; a point has $w = 1$ so translation does. The translation matrix is:

$$T(\mathbf{t}) = \begin{pmatrix} 1 & 0 & 0 & t_x \\ 0 & 1 & 0 & t_y \\ 0 & 0 & 1 & t_z \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

Multiplying gives $T(\mathbf{t}) \mathbf{p} = (\mathbf{p} + \mathbf{t}, 1)$ for points, and $T(\mathbf{t}) \mathbf{d} = (\mathbf{d}, 0)$ for directions, exactly the desired behavior.

### 5.2 The Five Affine Building Blocks

Every affine transformation is a composition of these:

**Translation $T(\mathbf{t})$:**

$$\begin{pmatrix} 1 & 0 & 0 & t_x \\ 0 & 1 & 0 & t_y \\ 0 & 0 & 1 & t_z \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

**Uniform scale $S(s)$ and non-uniform scale $S(s_x, s_y, s_z)$:**

$$S = \begin{pmatrix} s_x & 0 & 0 & 0 \\ 0 & s_y & 0 & 0 \\ 0 & 0 & s_z & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

**Rotation about axis $\mathbf{a}$ by angle $\theta$** (Rodrigues' formula, derived in §6).

**Shear** (rare in games, common in 2D UI):

$$H_{xy} = \begin{pmatrix} 1 & h & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

**Reflection** about a plane (a sign flip in scale combined with a rotation).

### 5.3 TRS Composition

The conventional model matrix is the composition $M = T \cdot R \cdot S$:

$$M_{model} = T(\mathbf{t}) \cdot R(\mathbf{q}) \cdot S(\mathbf{s})$$

Reading right-to-left: first scale the local mesh, then rotate, then translate to its world position. The composed matrix has the structure:

$$M_{model} = \begin{pmatrix} s_x R_{00} & s_y R_{01} & s_z R_{02} & t_x \\ s_x R_{10} & s_y R_{11} & s_z R_{12} & t_y \\ s_x R_{20} & s_y R_{21} & s_z R_{22} & t_z \\ 0 & 0 & 0 & 1 \end{pmatrix}$$

The decomposition (extracting $T, R, S$ from a given $M$) is non-trivial in general, especially under non-uniform scale and shear. Engines that store transforms as $(T, R, S)$ tuples avoid this problem entirely.

### 5.4 Why GP Stores Transforms as TRS Tuples

A 4×4 matrix has 16 floats and embeds rotation, scale, and translation in a non-orthogonal way; reconstructing rotation from a scaled matrix is lossy under non-uniform scale. GP's `Transform` struct is:

```cpp
struct alignas(16) Transform {
    Vec3f       position;       // 12B
    f32         _pad0;          //  4B  (alignment)
    Quaternion  rotation;       // 16B  (unit quaternion)
    Vec3f       scale;          // 12B
    f32         _pad1;          //  4B
};                              // 48B = 3 cache-line-friendly halves
```

This is 48 bytes versus 64 for a 4×4 matrix, decomposes cleanly, blends correctly (slerp on the quaternion, lerp on $T$ and $S$), and allows the matrix to be derived only when needed. The matrix is then reconstructed:

```cpp
Mat4f Transform::ToMatrix() const noexcept {
    Mat3f R = rotation.ToMat3();
    Mat4f M;
    M.Col(0) = Vec4f(R.Col(0) * scale.x, 0.0f);
    M.Col(1) = Vec4f(R.Col(1) * scale.y, 0.0f);
    M.Col(2) = Vec4f(R.Col(2) * scale.z, 0.0f);
    M.Col(3) = Vec4f(position,            1.0f);
    return M;
}
```

This pattern is mirrored in Unreal's `FTransform` and Unity's `Transform`.

---

## 6. Rotations: From Euler Angles to Quaternions

Rotations deserve their own section because they are the single most error-prone topic in 3D graphics. A small rotation bug compounds across animation frames into visible jitter; a mistuned interpolation causes visible "snapping" at angle boundaries; a misapplied basis change inverts the world. Every senior engineer has a story about gimbal lock.

### 6.1 Euler Angles

Euler angles parameterize rotation by three sequential angles about three axes, typically named **pitch, yaw, roll** (or *roll, pitch, yaw* depending on the field). The rotation is the product of three elementary axis rotations:

$$R_{XYZ}(\alpha, \beta, \gamma) = R_X(\alpha) \cdot R_Y(\beta) \cdot R_Z(\gamma)$$

**Pros**: human-readable, three intuitive numbers, used by artists and animators in tools.

**Cons** (numerous):
- **Gimbal lock**: when two rotation axes align (e.g., $\beta = \pm\pi/2$), one degree of freedom is lost. The system becomes singular; inversion fails.
- **Order matters**: $R_X(\alpha)R_Y(\beta) \neq R_Y(\beta)R_X(\alpha)$ in general. The convention (XYZ, ZYX, ZYZ, ...) must be specified.
- **Interpolating Euler angles linearly produces non-uniform angular velocity** and visible jitter at gimbal-lock boundaries.

GP exposes Euler angles only as a *display* representation; internally all rotations are quaternions.

### 6.2 Rotation Matrices

A $3 \times 3$ rotation matrix $R$ satisfies $R^T R = I$ and $\det R = +1$. The set of such matrices forms the **Special Orthogonal group** $SO(3)$.

Elementary rotations:

$$R_X(\theta) = \begin{pmatrix} 1 & 0 & 0 \\ 0 & \cos\theta & -\sin\theta \\ 0 & \sin\theta & \cos\theta \end{pmatrix}$$

$$R_Y(\theta) = \begin{pmatrix} \cos\theta & 0 & \sin\theta \\ 0 & 1 & 0 \\ -\sin\theta & 0 & \cos\theta \end{pmatrix}$$

$$R_Z(\theta) = \begin{pmatrix} \cos\theta & -\sin\theta & 0 \\ \sin\theta & \cos\theta & 0 \\ 0 & 0 & 1 \end{pmatrix}$$

**Pros**: composes naturally with other linear transforms, GPU hardware applies them in one matrix multiply.

**Cons**: 9 floats with 6 redundant constraints; numerical drift away from orthogonality after many compositions; no clean interpolation; expensive to *blend*.

### 6.3 Axis-Angle and Rodrigues' Formula

Any 3D rotation can be expressed as a rotation by angle $\theta$ about a unit axis $\hat{\mathbf{a}}$. The corresponding matrix is given by **Rodrigues' rotation formula**:

$$R = I + (\sin\theta) [\hat{\mathbf{a}}]_\times + (1 - \cos\theta) [\hat{\mathbf{a}}]_\times^2$$

where $[\hat{\mathbf{a}}]_\times$ is the cross-product matrix:

$$[\hat{\mathbf{a}}]_\times = \begin{pmatrix} 0 & -a_z & a_y \\ a_z & 0 & -a_x \\ -a_y & a_x & 0 \end{pmatrix}$$

Expanding:

$$R = \begin{pmatrix} c + a_x^2(1-c) & a_x a_y (1-c) - a_z s & a_x a_z (1-c) + a_y s \\ a_y a_x (1-c) + a_z s & c + a_y^2(1-c) & a_y a_z (1-c) - a_x s \\ a_z a_x (1-c) - a_y s & a_z a_y (1-c) + a_x s & c + a_z^2(1-c) \end{pmatrix}$$

with $c = \cos\theta$, $s = \sin\theta$. Axis-angle uses 4 floats; it is intuitive but does not compose by simple multiplication.

### 6.4 Quaternions

A quaternion is a four-component object $\mathbf{q} = (w, x, y, z) = w + x\mathbf{i} + y\mathbf{j} + z\mathbf{k}$ with multiplication rules

$$\mathbf{i}^2 = \mathbf{j}^2 = \mathbf{k}^2 = \mathbf{ijk} = -1$$

discovered by Hamilton in 1843 and burned into Brougham Bridge in Dublin. The unit quaternions ($\|\mathbf{q}\|=1$) form the group $S^3$, which is a **double cover** of $SO(3)$: every rotation corresponds to two quaternions, $\mathbf{q}$ and $-\mathbf{q}$, representing the same orientation.

A unit quaternion encoding rotation by angle $\theta$ about unit axis $\hat{\mathbf{a}}$:

$$\mathbf{q} = \left(\cos\frac{\theta}{2}, \sin\frac{\theta}{2}\hat{\mathbf{a}}\right)$$

Note the half-angle: this is essential and often the source of bugs.

**Quaternion product** (`Hamilton product`):

$$\mathbf{q}_1 \mathbf{q}_2 = \begin{pmatrix} w_1 w_2 - \mathbf{v}_1 \cdot \mathbf{v}_2 \\ w_1 \mathbf{v}_2 + w_2 \mathbf{v}_1 + \mathbf{v}_1 \times \mathbf{v}_2 \end{pmatrix}$$

This composes rotations: $\mathbf{q}_2 \mathbf{q}_1$ rotates first by $\mathbf{q}_1$ then by $\mathbf{q}_2$. The product is non-commutative, mirroring the non-commutativity of 3D rotations.

**Conjugate**: $\mathbf{q}^* = (w, -\mathbf{v})$. For a unit quaternion, $\mathbf{q}^* = \mathbf{q}^{-1}$.

**Rotating a vector** by a quaternion:

$$\mathbf{v}' = \mathbf{q} \mathbf{v} \mathbf{q}^*$$

(treating $\mathbf{v}$ as a quaternion with $w = 0$). Expanded for performance:

$$\mathbf{v}' = \mathbf{v} + 2 \mathbf{q}_v \times (\mathbf{q}_v \times \mathbf{v} + w \mathbf{v})$$

This is the form used in shaders, 18 multiplies and 12 adds, faster than constructing a matrix when only one vector is to be rotated.

**Quaternion-to-matrix** (when many vectors are to be rotated, build the matrix once):

$$R(\mathbf{q}) = \begin{pmatrix} 1 - 2y^2 - 2z^2 & 2xy - 2wz & 2xz + 2wy \\ 2xy + 2wz & 1 - 2x^2 - 2z^2 & 2yz - 2wx \\ 2xz - 2wy & 2yz + 2wx & 1 - 2x^2 - 2y^2 \end{pmatrix}$$

```cpp
constexpr Mat3f Quaternion::ToMat3() const noexcept {
    const f32 xx = x*x, yy = y*y, zz = z*z;
    const f32 xy = x*y, xz = x*z, yz = y*z;
    const f32 wx = w*x, wy = w*y, wz = w*z;
    return Mat3f{
        { 1 - 2*(yy+zz),    2*(xy - wz),    2*(xz + wy) },
        {   2*(xy + wz),  1 - 2*(xx+zz),    2*(yz - wx) },
        {   2*(xz - wy),    2*(yz + wx),  1 - 2*(xx+yy) }
    };
}
```

### 6.5 Spherical Linear Interpolation (Slerp)

Quaternion interpolation has its own technique because linear interpolation between two quaternions, followed by renormalization, produces non-uniform angular velocity. **Slerp** [Shoemake 1985] gives constant angular velocity:

$$\text{slerp}(\mathbf{q}_0, \mathbf{q}_1, t) = \frac{\sin((1-t)\Omega)}{\sin\Omega} \mathbf{q}_0 + \frac{\sin(t\Omega)}{\sin\Omega} \mathbf{q}_1$$

where $\Omega = \arccos(\mathbf{q}_0 \cdot \mathbf{q}_1)$ is the angle between them on the 4-sphere.

**Two crucial details:**
1. If $\mathbf{q}_0 \cdot \mathbf{q}_1 < 0$, negate one of the quaternions: this picks the *short way* around the 4-sphere. Otherwise the rotation takes the long way (>180°), causing visible flips.
2. When $\Omega$ is near zero, $\sin\Omega \to 0$ and the formula is numerically unstable. Fall back to linear interpolation (`lerp + normalize`, also called *nlerp*) for small $\Omega$.

```cpp
Quaternion Slerp(Quaternion q0, Quaternion q1, f32 t) noexcept {
    f32 cos_omega = Dot(q0, q1);
    if (cos_omega < 0.0f) { q1 = -q1; cos_omega = -cos_omega; }
    if (cos_omega > 0.9995f) return Normalize(Lerp(q0, q1, t));  // Fallback
    const f32 omega     = std::acos(cos_omega);
    const f32 sin_omega = std::sin(omega);
    const f32 a = std::sin((1.0f - t) * omega) / sin_omega;
    const f32 b = std::sin(t * omega) / sin_omega;
    return q0 * a + q1 * b;
}
```

### 6.6 When to Use Which Representation

| Use case | Recommended representation |
|---|---|
| Storage, animation keyframes | Quaternion (16B, no drift) |
| Composition (chain of rotations) | Quaternion (16 mul/12 add per compose) |
| Many vectors to rotate | Matrix (cache-friendly batch op) |
| Single vector to rotate | Quaternion sandwich form |
| Artist-facing UI | Euler angles (display only) |
| Smooth interpolation | Slerp on quaternions |
| Specifying rotations programmatically | Axis-angle, then convert |

Reference: Sommer et al., *Why and How to Avoid the Flipped Quaternion Multiplication* ([arXiv:1801.07478](https://arxiv.org/abs/1801.07478)) sorts out conventions across libraries.

---

## 7. Trigonometry and Analytic Geometry

### 7.1 The Unit Circle Identities

The graphics-relevant trig identities, memorized by every engineer:

$$\sin^2\theta + \cos^2\theta = 1$$

$$\sin(2\theta) = 2\sin\theta\cos\theta, \quad \cos(2\theta) = \cos^2\theta - \sin^2\theta$$

$$\sin(\alpha \pm \beta) = \sin\alpha\cos\beta \pm \cos\alpha\sin\beta$$

$$\cos(\alpha \pm \beta) = \cos\alpha\cos\beta \mp \sin\alpha\sin\beta$$

The half-angle identities, central to quaternions:

$$\sin\frac{\theta}{2} = \pm\sqrt{\frac{1-\cos\theta}{2}}, \quad \cos\frac{\theta}{2} = \pm\sqrt{\frac{1+\cos\theta}{2}}$$

The dot product as cosine:

$$\hat{\mathbf{a}} \cdot \hat{\mathbf{b}} = \cos\theta_{ab}$$

This is the workhorse of every shading model in graphics.

### 7.2 The Law of Cosines

For a triangle with sides $a, b, c$ and angle $\gamma$ opposite $c$:

$$c^2 = a^2 + b^2 - 2ab\cos\gamma$$

A surprisingly common appearance: deriving the half-vector formulation in microfacet BRDFs. The angle between view and light directions $\omega_v$ and $\omega_l$ relates to the half-vector $\mathbf{h} = (\omega_v + \omega_l)/\|\omega_v + \omega_l\|$ via:

$$\cos\theta_h = \frac{1 + \omega_v \cdot \omega_l}{\sqrt{2(1 + \omega_v \cdot \omega_l)}}$$

### 7.3 Atan2: The Right Way to Find an Angle

`atan2(y, x)` returns the angle in $(-\pi, \pi]$ of the point $(x, y)$ from the positive x-axis. Crucially, it handles all four quadrants correctly, unlike the textbook $\arctan(y/x)$. Use it for:

- Spherical coordinates: $\phi = \text{atan2}(y, x)$
- 2D angle between vectors: $\theta = \text{atan2}(\mathbf{a} \times \mathbf{b}, \mathbf{a} \cdot \mathbf{b})$ (sign correctness in 2D)
- Direction-to-cubemap-face determination

### 7.4 Lines, Planes, and Rays

A **ray** is parameterized as $\mathbf{p}(t) = \mathbf{o} + t\mathbf{d}$ with $t \geq 0$ and $\mathbf{d}$ unit-length.

A **plane** is defined by a unit normal $\hat{\mathbf{n}}$ and offset $d$:

$$\hat{\mathbf{n}} \cdot \mathbf{p} = d$$

Points satisfying this lie on the plane. The signed distance from any point $\mathbf{p}_0$ to the plane is:

$$\text{dist}(\mathbf{p}_0) = \hat{\mathbf{n}} \cdot \mathbf{p}_0 - d$$

A positive value places $\mathbf{p}_0$ on the side $\hat{\mathbf{n}}$ points to. This single formula powers frustum culling: a sphere $(c, r)$ is fully outside a plane if $\hat{\mathbf{n}} \cdot \mathbf{c} - d < -r$.

### 7.5 Ray-Plane Intersection

Substituting $\mathbf{p}(t)$:

$$\hat{\mathbf{n}} \cdot (\mathbf{o} + t\mathbf{d}) = d \quad \Longrightarrow \quad t = \frac{d - \hat{\mathbf{n}} \cdot \mathbf{o}}{\hat{\mathbf{n}} \cdot \mathbf{d}}$$

If $\hat{\mathbf{n}} \cdot \mathbf{d} = 0$, the ray is parallel to the plane (no intersection or infinitely many). If $t < 0$, the plane is behind the ray origin.

### 7.6 Ray-Sphere Intersection

For sphere $(\mathbf{c}, r)$:

$$\|\mathbf{o} + t\mathbf{d} - \mathbf{c}\|^2 = r^2$$

Expanding and letting $\mathbf{m} = \mathbf{o} - \mathbf{c}$:

$$t^2 + 2(\mathbf{m} \cdot \mathbf{d}) t + (\mathbf{m} \cdot \mathbf{m} - r^2) = 0$$

(using $\mathbf{d} \cdot \mathbf{d} = 1$ for a unit ray direction). This is a quadratic in $t$ with discriminant:

$$\Delta = (\mathbf{m} \cdot \mathbf{d})^2 - (\mathbf{m} \cdot \mathbf{m} - r^2)$$

If $\Delta < 0$: no intersection. If $\Delta \geq 0$: two solutions $t_\pm = -(\mathbf{m} \cdot \mathbf{d}) \pm \sqrt{\Delta}$. Take the smaller positive one for the closest intersection.

### 7.7 Ray-Triangle Intersection (Möller-Trumbore)

The standard, branchless ray-triangle test [Möller and Trumbore 1997]:

```cpp
// Returns t (distance along ray) and barycentric (u, v) on hit, or no-hit.
struct HitInfo { f32 t, u, v; bool hit; };

HitInfo IntersectRayTriangle(Vec3f o, Vec3f d,
                             Vec3f v0, Vec3f v1, Vec3f v2) noexcept {
    constexpr f32 EPSILON = 1e-7f;
    const Vec3f e1 = v1 - v0;
    const Vec3f e2 = v2 - v0;
    const Vec3f h  = Cross(d, e2);
    const f32   a  = Dot(e1, h);
    if (std::abs(a) < EPSILON) return { 0,0,0,false };  // parallel

    const f32   f  = 1.0f / a;
    const Vec3f s  = o - v0;
    const f32   u  = f * Dot(s, h);
    if (u < 0.0f || u > 1.0f) return { 0,0,0,false };

    const Vec3f q  = Cross(s, e1);
    const f32   v  = f * Dot(d, q);
    if (v < 0.0f || u + v > 1.0f) return { 0,0,0,false };

    const f32   t  = f * Dot(e2, q);
    return { t, u, v, t > EPSILON };
}
```

This is the inner loop of every CPU ray tracer and the backbone of GPU bounding-volume hierarchies.

### 7.8 Ray-AABB Intersection (Slab Method)

For an axis-aligned bounding box with `min` and `max` corners, treat each pair of opposing faces as a "slab" and intersect the ray with all three slabs:

```cpp
bool IntersectRayAABB(Vec3f o, Vec3f inv_d,
                      Vec3f bmin, Vec3f bmax,
                      f32& t_min_out, f32& t_max_out) noexcept {
    const Vec3f t1 = (bmin - o) * inv_d;
    const Vec3f t2 = (bmax - o) * inv_d;
    const Vec3f tmin = Min(t1, t2);
    const Vec3f tmax = Max(t1, t2);
    const f32 tn = std::max({ tmin.x, tmin.y, tmin.z, 0.0f });
    const f32 tf = std::min({ tmax.x, tmax.y, tmax.z, FLT_MAX });
    t_min_out = tn; t_max_out = tf;
    return tn <= tf;
}
```

The trick of pre-computing `inv_d = 1.0f / d` (with explicit handling of $d_i = 0$ via $\pm \infty$ encoding) eliminates branches in the inner loop. This is the standard BVH traversal primitive.

### 7.9 Barycentric Coordinates

A point inside triangle $(v_0, v_1, v_2)$ can be written as:

$$\mathbf{p} = u v_0 + v v_1 + w v_2, \quad u + v + w = 1, \quad u, v, w \geq 0$$

The triple $(u, v, w)$ is the **barycentric coordinate** of $\mathbf{p}$. They are used for:

- **Vertex attribute interpolation** in fragment shaders (a hardware feature).
- **Triangle membership tests**: a point is inside iff all three are non-negative.
- **Ray-triangle intersection** results (Möller-Trumbore returns $(u, v)$ above; $w = 1 - u - v$).
- **Texture sampling for procedural meshes** without UV authoring.

The areas are proportional to the coordinates: $u = A(v_1 v_2 \mathbf{p}) / A(v_0 v_1 v_2)$, etc.

---

## 8. Calculus for Graphics Engineers

A working knowledge of single-variable and multivariable calculus is required for shader writing, Monte Carlo techniques, and physically based rendering. We cover the essentials.

### 8.1 Derivatives

The derivative $\frac{df}{dx}$ of a function $f$ is the rate of change of $f$ with respect to $x$. In graphics it appears most often as:

- **Texture LOD selection**: the GPU computes $\frac{\partial u}{\partial x}, \frac{\partial u}{\partial y}, \frac{\partial v}{\partial x}, \frac{\partial v}{\partial y}$ (texture coordinate derivatives w.r.t. screen-space pixels) and uses them to select the appropriate mipmap level. Available in shaders as `dFdx`, `dFdy` (GLSL) or `ddx`, `ddy` (HLSL).
- **Normal mapping**: the tangent-space basis $(\mathbf{T}, \mathbf{B}, \mathbf{N})$ is derived from texture-space partial derivatives.
- **Ambient occlusion and SSR**: these effects sample neighborhoods whose extent is proportional to derivatives of depth.

### 8.2 The Gradient

For a scalar field $f(\mathbf{x})$ in 3D, the gradient is the vector of partial derivatives:

$$\nabla f = \left(\frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}, \frac{\partial f}{\partial z}\right)^T$$

The gradient points in the direction of steepest increase, with magnitude equal to the maximum rate of change.

In rendering, $\nabla f$ appears in:
- **Signed distance fields**: $\nabla \text{SDF}(\mathbf{x})$ is the surface normal (when on the surface).
- **Heightmap-derived normals**: $\mathbf{N} = \text{normalize}(-\partial h/\partial x, -\partial h/\partial y, 1)$.
- **Volumetric rendering**: density gradients drive single-scattering shading.

### 8.3 The Jacobian

For a vector function $\mathbf{f}: \mathbb{R}^n \to \mathbb{R}^m$, the Jacobian is the $m \times n$ matrix of partial derivatives:

$$J_{ij} = \frac{\partial f_i}{\partial x_j}$$

The Jacobian determinant $|\det J|$ is the local volume scaling factor of the transformation. It is essential in:
- **Importance sampling**: when changing variables from $\mathbf{x}$ to $\mathbf{y} = \mathbf{f}(\mathbf{x})$, the PDF transforms as $p_Y(\mathbf{y}) = p_X(\mathbf{x}) / |\det J|$.
- **Texture warping**: anisotropic texture filtering analyzes the projected Jacobian onto the texture plane.

### 8.4 Integrals and the Fundamental Theorem

The definite integral $\int_a^b f(x) dx$ measures the signed area under $f$. The fundamental theorem of calculus states:

$$\int_a^b f(x) dx = F(b) - F(a)$$

where $F$ is an antiderivative of $f$. In graphics, closed-form antiderivatives are rare; we approximate integrals numerically (§9).

The integrals that matter in rendering are over **solid angles** (§10):

$$L_o(\mathbf{x}, \omega_o) = \int_{H^2} f_r(\mathbf{x}, \omega_i \to \omega_o) L_i(\mathbf{x}, \omega_i) (\omega_i \cdot \mathbf{n}) d\omega_i$$

where $H^2$ is the hemisphere above the surface point $\mathbf{x}$.

### 8.5 Solid Angles

A solid angle $d\omega$ is the 3D analog of a 2D angle, measured in **steradians (sr)**. The full sphere subtends $4\pi$ sr; a hemisphere $2\pi$. In spherical coordinates:

$$d\omega = \sin\theta \, d\theta \, d\phi$$

A small surface patch $dA$ at distance $r$ from a point, with normal making angle $\theta'$ with the line of sight, subtends:

$$d\omega = \frac{dA \cos\theta'}{r^2}$$

This $1/r^2$ falloff is the geometric origin of inverse-square light attenuation.

### 8.6 Taylor Series

A function can be approximated locally by its Taylor expansion:

$$f(x_0 + h) = f(x_0) + f'(x_0) h + \frac{f''(x_0)}{2}h^2 + O(h^3)$$

In graphics:
- **Schlick's Fresnel approximation** is a low-order expansion of the full Fresnel equations:

$$F_\text{Schlick}(\theta) = F_0 + (1 - F_0)(1 - \cos\theta)^5$$

This single expression replaces the costly exact Fresnel and is accurate to within a few percent for most materials [Schlick 1994].

- **Tone mapping operators** like `x / (x + 1)` are approximations of the human visual system's response curve.
- **Trigonometric polynomial approximations** in shaders avoid the slow `sin`/`cos` instructions on older hardware.

### 8.7 Recommended Reading

- Spivak, *Calculus*, 4th ed. The undergraduate gold standard.
- Pharr, Jakob, Humphreys, *Physically Based Rendering: From Theory to Implementation*, 4th ed. Calculus applied to rendering. ([pbr-book.org](https://pbr-book.org))

---

## 9. Probability, Statistics, and Monte Carlo Methods

Modern photorealistic rendering is **statistical**: we estimate the value of an integral over light paths by random sampling. This section gives the foundation.

### 9.1 Random Variables and Distributions

A **random variable** $X$ takes values from a distribution. Its **probability density function (PDF)** $p_X(x)$ satisfies:

$$\int p_X(x) dx = 1, \quad p_X(x) \geq 0$$

The **cumulative distribution function (CDF)** $P_X(x) = \int_{-\infty}^x p_X(t) dt$ runs from 0 to 1.

The **expectation** of a function of $X$:

$$E[g(X)] = \int g(x) p_X(x) dx$$

The **variance**:

$$\text{Var}[X] = E[X^2] - E[X]^2$$

### 9.2 Common Distributions in Graphics

- **Uniform** $U[a, b]$: $p(x) = 1/(b-a)$ on the interval. Generated by RNG.
- **Cosine-weighted hemisphere**: $p(\omega) = \cos\theta / \pi$. Importance sampling for diffuse BRDFs.
- **GGX (Trowbridge-Reitz)**: the dominant microfacet distribution in modern PBR. Used to importance-sample specular BRDFs.
- **Multivariate normal**: gradient noise, terrain generation.

### 9.3 Monte Carlo Integration

To estimate $I = \int_\Omega f(x) dx$, draw samples $X_i \sim p$ and compute:

$$\hat{I}_N = \frac{1}{N} \sum_{i=1}^{N} \frac{f(X_i)}{p(X_i)}$$

This is **unbiased**: $E[\hat{I}_N] = I$. The variance scales as:

$$\text{Var}[\hat{I}_N] = \frac{\sigma^2}{N}$$

The standard error therefore decreases as $O(1/\sqrt{N})$, which is the curse of Monte Carlo: doubling sample count halves the noise's magnitude only by a factor of $\sqrt{2} \approx 1.41$. To halve noise visibly, $4\times$ the samples.

### 9.4 Importance Sampling

The art of Monte Carlo is choosing $p$ so that $f(x)/p(x)$ has low variance. The ideal is $p(x) \propto f(x)$, which gives zero variance (and is the integral itself, hence unrealizable). In practice we sample proportional to a **major factor** of $f$.

Example: in path tracing, the integrand is $f_r \cdot L_i \cdot \cos\theta$. We typically sample one of:
- $\cos\theta$-weighted hemisphere (good for diffuse)
- BRDF-weighted (good for specular)
- Light-source-weighted (good for direct illumination)

**Multiple Importance Sampling (MIS)** [Veach 1995] combines several strategies optimally, weighting each sample by:

$$w_i(x) = \frac{n_i p_i(x)^\beta}{\sum_j n_j p_j(x)^\beta}$$

with $\beta = 2$ (the "power heuristic") performing best in practice.

### 9.5 Quasi-Monte Carlo and Low-Discrepancy Sequences

Pure pseudo-random sampling clusters; $O(1/\sqrt{N})$ is wasteful. Low-discrepancy sequences (Halton, Sobol, Owen-scrambled Sobol) cover the sample space more uniformly and achieve $O(\log^d N / N)$ convergence in $d$ dimensions.

The **Halton sequence** with bases $b_1 = 2, b_2 = 3$ for 2D:

$$x_n = \phi_2(n), \quad y_n = \phi_3(n)$$

where $\phi_b(n)$ is the radical inverse:

$$\phi_b(n) = \sum_{k=0}^{\infty} a_k(n) b^{-k-1}$$

with $a_k$ the digits of $n$ in base $b$. Used in TAA jitter sequences in nearly every modern renderer.

```cpp
constexpr f32 RadicalInverse(u32 base, u32 i) noexcept {
    f32 result = 0.0f;
    f32 inv_base = 1.0f / base;
    f32 inv_base_n = inv_base;
    while (i > 0) {
        result += (i % base) * inv_base_n;
        i /= base;
        inv_base_n *= inv_base;
    }
    return result;
}
```

### 9.6 Reservoir Sampling

For real-time applications where samples cannot be stored, **reservoir sampling** maintains a single sample summarizing a stream of weighted candidates. This underpins **ReSTIR** [Bitterli et al. 2020], the dominant real-time path tracing technique:

```
Reservoir<S>: maintains one sample s with weight W
Update(s_new, w_new):
    W += w_new
    if rand() < w_new / W: s = s_new
```

After processing $N$ candidates, the reservoir holds a sample distributed proportionally to its weight, with constant memory. ReSTIR adds spatial and temporal *resampling* of reservoirs to amortize the cost of light selection across pixels and frames.

Reference: [Bitterli et al., *Spatiotemporal reservoir resampling for real-time ray tracing with dynamic direct lighting*, SIGGRAPH 2020](https://research.nvidia.com/publication/2020-07_Spatiotemporal-reservoir-resampling).

---

## 10. The Rendering Equation and Light Transport

### 10.1 The Equation

Kajiya's rendering equation [Kajiya 1986] is the master equation of physically based rendering. It states that the outgoing radiance $L_o$ at point $\mathbf{x}$ in direction $\omega_o$ equals the emitted radiance $L_e$ plus the integral of incoming radiance reflected through the BRDF:

$$L_o(\mathbf{x}, \omega_o) = L_e(\mathbf{x}, \omega_o) + \int_{H^2} f_r(\mathbf{x}, \omega_i, \omega_o) \, L_i(\mathbf{x}, \omega_i) \, (\omega_i \cdot \mathbf{n}) \, d\omega_i$$

where:
- $L_o(\mathbf{x}, \omega_o)$: outgoing radiance, the quantity we want
- $L_e(\mathbf{x}, \omega_o)$: emitted radiance (zero for non-emitters)
- $f_r$: the BRDF, units $\text{sr}^{-1}$
- $L_i(\mathbf{x}, \omega_i)$: incoming radiance from direction $\omega_i$
- $(\omega_i \cdot \mathbf{n})$: the cosine projection, accounting for foreshortening
- $H^2$: the hemisphere above the surface

This is a **Fredholm integral equation of the second kind**, $L_i$ at one point depends on $L_o$ from elsewhere, hence the iterative/Monte Carlo approach.

### 10.2 The BRDF

The Bidirectional Reflectance Distribution Function (BRDF) $f_r(\omega_i, \omega_o)$ describes how a surface reflects light. It must satisfy:

- **Non-negativity**: $f_r \geq 0$
- **Helmholtz reciprocity**: $f_r(\omega_i, \omega_o) = f_r(\omega_o, \omega_i)$
- **Energy conservation**: $\int_{H^2} f_r \cos\theta_i \, d\omega_i \leq 1$ for all $\omega_o$

The simplest physically valid BRDF is **Lambertian**:

$$f_{r,\text{Lambert}} = \frac{\rho}{\pi}$$

with albedo $\rho \in [0, 1]^3$. The $1/\pi$ normalizes so that energy is conserved when integrated over the hemisphere.

### 10.3 Microfacet Models (Cook-Torrance)

Physically based specular BRDFs use the microfacet model [Cook and Torrance 1982]:

$$f_{r,\text{spec}}(\omega_i, \omega_o) = \frac{D(\mathbf{h}) \, F(\omega_o, \mathbf{h}) \, G(\omega_i, \omega_o, \mathbf{h})}{4 (\omega_i \cdot \mathbf{n})(\omega_o \cdot \mathbf{n})}$$

with:
- $\mathbf{h} = (\omega_i + \omega_o) / \|\omega_i + \omega_o\|$: the half-vector
- $D$: Normal Distribution Function, the proportion of microfacets oriented to reflect from $\omega_i$ to $\omega_o$
- $F$: Fresnel term, the fraction reflected (vs. transmitted/absorbed)
- $G$: geometric self-shadowing/masking

**The GGX (Trowbridge-Reitz) NDF**, the modern industry standard:

$$D_{GGX}(\mathbf{h}) = \frac{\alpha^2}{\pi ((\mathbf{n} \cdot \mathbf{h})^2 (\alpha^2 - 1) + 1)^2}$$

with roughness $\alpha = \text{roughness}^2$ (a perceptual remap recommended by [Burley 2012]).

**Schlick's Fresnel approximation:**

$$F_\text{Schlick}(\omega_o, \mathbf{h}) = F_0 + (1 - F_0)(1 - \omega_o \cdot \mathbf{h})^5$$

with $F_0$ the reflectance at normal incidence (4% for dielectrics, RGB-tinted for metals).

**Smith's geometric term** (height-correlated form, used in UE5 and Frostbite):

$$G_2 = \frac{1}{1 + \Lambda(\omega_i) + \Lambda(\omega_o)}, \quad \Lambda = \frac{\sqrt{1 + \alpha^2 \tan^2\theta} - 1}{2}$$

The full Cook-Torrance microfacet specular, plus a Lambertian diffuse modulated by $1 - F$ for energy conservation, is the **Disney/Burley BRDF** that dominates AAA pipelines [Burley 2012, Karis 2013].

References:
- [Karis 2013, *Real Shading in Unreal Engine 4*](https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf)
- [Burley 2012, *Physically-Based Shading at Disney*](https://disneyanimation.com/publications/physically-based-shading-at-disney/)
- [Heitz 2014, *Understanding the Masking-Shadowing Function*](https://jcgt.org/published/0003/02/03/)

### 10.4 Image-Based Lighting via Spherical Harmonics

For diffuse environment lighting, integrating the irradiance over the hemisphere is expensive per pixel. **Spherical harmonics** project directional functions onto an orthonormal basis on the sphere:

$$f(\theta, \phi) = \sum_{l=0}^{\infty} \sum_{m=-l}^{l} c_l^m Y_l^m(\theta, \phi)$$

For diffuse irradiance, the first three bands (9 SH coefficients) capture nearly all the energy [Ramamoorthi and Hanrahan 2001]. Storage: 9 RGB floats per probe; evaluation: 9 dot products in the shader.

Reference: [Ramamoorthi & Hanrahan, *An Efficient Representation for Irradiance Environment Maps*, SIGGRAPH 2001](https://graphics.stanford.edu/papers/envmap/envmap.pdf).

---

## 11. Color Theory and Color Spaces

Color is not a number; it is a **perceptual response** to a power spectrum, mediated by three retinal cone types. The mapping from spectrum to perceived color, and from perceived color to display, is a deeper topic than most engineers realize.

### 11.1 The CIE 1931 Color Matching Functions

Human color vision is well-modeled by three weighting functions $\bar{x}(\lambda), \bar{y}(\lambda), \bar{z}(\lambda)$, the **CIE 1931 Standard Observer**. A spectrum $S(\lambda)$ produces tristimulus values:

$$X = \int S(\lambda)\bar{x}(\lambda) d\lambda, \quad Y = \int S(\lambda)\bar{y}(\lambda) d\lambda, \quad Z = \int S(\lambda)\bar{z}(\lambda) d\lambda$$

$Y$ is luminance, the perceptual brightness. $X, Z$ encode chromaticity.

### 11.2 Linear vs Gamma-Encoded Color

**The single most common bug in beginner shaders**: confusing linear-light values (where addition and lerp are physically meaningful) with gamma-encoded sRGB values (perceptually-uniform encoding for storage).

The sRGB encoding (approximately gamma 2.2):

$$\text{sRGB}(L) = \begin{cases} 12.92 L & L \leq 0.0031308 \\ 1.055 L^{1/2.4} - 0.055 & L > 0.0031308 \end{cases}$$

with the inverse:

$$L(\text{sRGB}) = \begin{cases} \text{sRGB} / 12.92 & \text{sRGB} \leq 0.04045 \\ \left(\frac{\text{sRGB} + 0.055}{1.055}\right)^{2.4} & \text{sRGB} > 0.04045 \end{cases}$$

**Rule**: do all lighting math in linear space; encode to sRGB only when writing to the framebuffer (or use hardware sRGB texture views, which do this automatically).

### 11.3 HDR and Tone Mapping

Physical light intensities span many orders of magnitude (sun at $\sim 10^9$ cd/m², candle at $\sim 10$ cd/m²). Display devices have limited dynamic range. **Tone mapping** compresses HDR scene radiance into the displayable $[0, 1]$ range.

The simplest, **Reinhard**:

$$L_{display} = \frac{L}{1 + L}$$

Modern AAA pipelines use **ACES** (Academy Color Encoding System) which provides cinematic film-like response with controlled saturation and toe/shoulder behavior. The full ACES Reference Rendering Transform is a complex matrix and curve sequence; approximations like **ACES Filmic** [Hill 2017] are typically inlined into the shader:

```glsl
vec3 ACESFilmic(vec3 x) {
    const float a = 2.51;
    const float b = 0.03;
    const float c = 2.43;
    const float d = 0.59;
    const float e = 0.14;
    return clamp((x * (a*x + b)) / (x * (c*x + d) + e), 0.0, 1.0);
}
```

References:
- [Krzysztof Narkowicz, *ACES Filmic Tone Mapping Curve*](https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/)
- [ACES Central](https://acescentral.com/)

### 11.4 Wide Gamut, HDR Displays, and Rec.2020

Modern HDR-capable monitors and HDR10/Dolby Vision broadcasts use the **Rec.2020** color space, with a wider gamut than sRGB. Engines targeting HDR output must:
1. Render in linear, scene-referred (HDR) space.
2. Apply tone mapping that preserves HDR headroom.
3. Encode in PQ (Perceptual Quantizer, SMPTE ST 2084) for HDR10, or HLG for broadcast.

The math of these transforms is documented in the [BT.2100 specification](https://www.itu.int/rec/R-REC-BT.2100/en).

---

## 12. Signal Processing and Anti-Aliasing

Rendering is **sampling**: we evaluate a continuous image function at discrete pixel locations. Sampling theory dictates what we can faithfully reconstruct and what produces aliasing artifacts (jaggies, moire, shimmering).

### 12.1 The Nyquist-Shannon Sampling Theorem

A signal containing frequencies up to $f_{max}$ can be perfectly reconstructed from samples spaced at intervals $\Delta x \leq 1/(2 f_{max})$. The threshold $f_N = 1/(2\Delta x)$ is the **Nyquist frequency**.

Frequencies above $f_N$ in the original signal **alias** to lower apparent frequencies in the sampled signal. In rendering this manifests as:
- Jaggies along high-contrast edges (the geometric edge has infinite frequency)
- Moire patterns in textures with fine repeating detail viewed at oblique angles
- Shimmering on specular highlights when the camera moves

### 12.2 Pre-Filtering: The Only True Solution

The mathematically correct fix is to band-limit the signal before sampling, applying a low-pass filter that removes frequencies above $f_N$. In practice:

- **Texture mipmapping**: precompute progressively-filtered versions of textures; the GPU selects the appropriate one based on screen-space derivatives. The mipmap chain is the practical realization of pre-filtering for textures.
- **Multi-Sample Anti-Aliasing (MSAA)**: take multiple sub-pixel samples per pixel and average. Reduces geometric aliasing; does not help with shading aliasing.
- **Super-Sampling Anti-Aliasing (SSAA)**: render at higher resolution and downsample. Brute-force but correct for everything.
- **Temporal Anti-Aliasing (TAA)**: use sub-pixel jitter across frames + temporal accumulation with motion-vector-based reprojection. The current AAA standard.

### 12.3 Mipmap Generation

A mipmap level $L$ is half the resolution of level $L-1$ in each axis. Level $L$ is computed by box-filtering (or better: tent, Lanczos, or Kaiser) the source level:

$$M_L[x, y] = \frac{1}{4}\left( M_{L-1}[2x, 2y] + M_{L-1}[2x+1, 2y] + M_{L-1}[2x, 2y+1] + M_{L-1}[2x+1, 2y+1] \right)$$

for box filter. Higher-quality filters use larger kernels and address frequencies just below Nyquist.

The total storage overhead of a full mipmap chain is $\sum_{L=0}^{\infty} 4^{-L} = 4/3$, only 33% extra memory.

### 12.4 Convolution and Filter Kernels

A **convolution** of signal $f$ with kernel $g$ is:

$$(f * g)(x) = \int f(\tau) g(x - \tau) d\tau$$

Discrete convolution (on a pixel grid):

$$(f * g)[x, y] = \sum_{i, j} f[x-i, y-j] g[i, j]$$

Common kernels in graphics:

- **Gaussian** (separable, smooth, theoretically infinite support):

$$g(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-x^2/(2\sigma^2)}$$

A 2D Gaussian factors into two 1D passes: $G(x, y) = g(x) g(y)$. This separability makes Gaussian blur affordable for bloom, depth of field, screen-space ambient occlusion.

- **Box filter**: average over the kernel. Simple but introduces ringing at high contrasts.
- **Sobel/Scharr**: derivative kernels for edge detection (used in screen-space normals from depth).
- **Bilateral filter**: edge-aware blur. Used in denoising path-traced output.

### 12.5 The Frequency Domain (FFT)

The Fourier transform decomposes a signal into its frequency components:

$$\hat{f}(\xi) = \int f(x) e^{-2\pi i \xi x} dx$$

In graphics:
- **Bloom**: large-radius blurs are faster in the frequency domain via FFT.
- **Convolution theorem**: $\widehat{f * g} = \hat{f} \cdot \hat{g}$. Convolution becomes multiplication; this is why FFT-based filtering exists.
- **Spherical harmonics** (§10.4) are the angular Fourier basis on the sphere.

### 12.6 Reading

- Glassner, *Principles of Digital Image Synthesis*. The classical signal-processing reference for graphics.
- [Pharr et al., *PBRT* §8 (Sampling and Reconstruction)](https://pbr-book.org/4ed/Sampling_and_Reconstruction).

---

## 13. Numerical Methods and Stability

### 13.1 Iterative Solvers

Many graphics problems reduce to root-finding $f(x) = 0$. The standard tools:

**Newton-Raphson**:

$$x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}$$

Quadratic convergence near a simple root. Used for:
- Sphere tracing in raymarched SDFs (when augmented to handle Lipschitz constraints)
- Inverse kinematics
- Fast inverse square root (Quake III's `0x5f3759df` constant is one Newton-Raphson step on a clever initial guess)

**Bisection**: brackets a root in $[a, b]$ with $f(a) f(b) < 0$ and halves the interval. Linear convergence but unconditionally robust.

### 13.2 Numerical Linear Algebra

**Solving** $A\mathbf{x} = \mathbf{b}$:
- For small dense $A$ (4×4 or smaller): direct Gaussian elimination or LU decomposition.
- For sparse $A$: iterative methods (conjugate gradient, GMRES). Used in cloth simulation, fluid simulation, and global illumination via radiosity.

**Eigendecomposition** $A = V \Lambda V^{-1}$ appears in:
- Principal Component Analysis on tangent frames or SH coefficients
- Inertia tensor diagonalization in physics
- BVH construction (longest-axis splits use eigenvectors of the centroid covariance)

**Singular Value Decomposition (SVD)** $A = U \Sigma V^T$:
- Polar decomposition (extracting rotation from a possibly-scaled matrix): $A = R S$ where $R = U V^T$, $S = V \Sigma V^T$.
- Best low-rank approximation (Eckart-Young theorem), used in compressed materials and neural shading.

### 13.3 Conditioning and Stability

A computation is **ill-conditioned** if small input perturbations produce large output changes. The **condition number** of a matrix $A$ is $\kappa(A) = \|A\| \|A^{-1}\| = \sigma_{max}/\sigma_{min}$.

Graphics-specific instability examples:
- **Inverting a near-singular matrix**: a TBN matrix becomes near-singular when tangent and bitangent collide. Detect via $|\det| < \varepsilon$ and fall back to a synthesized basis.
- **Acos of a value slightly above 1**: produces NaN. Always clamp: `std::acos(std::clamp(d, -1.0f, 1.0f))`.
- **Normalizing a near-zero vector**: divide-by-zero. Guard with epsilon.
- **Quaternion drift**: chaining many quaternion products accumulates drift in $\|\mathbf{q}\|$. Renormalize periodically (every $\sim 100$ products is safe).

### 13.4 SIMD and Vectorization

Modern CPUs offer SIMD (Single Instruction, Multiple Data) units that operate on 4-8-16 floats simultaneously: SSE (128-bit, 4×f32), AVX (256-bit, 8×f32), AVX-512 (512-bit, 16×f32), NEON (ARM, 128-bit). On GPUs, every shader thread is implicitly SIMD across 32 (NVIDIA warp) or 64 (AMD wavefront) threads.

A scalar `Vec3f` doesn't naturally SIMD-vectorize (3 lanes of 4). The two strategies:

1. **AoS-of-Vec4 padding**: store as `Vec4f` (12B → 16B), use SIMD intrinsics. Wastes 25%.
2. **SoA (Structure of Arrays)**: store $N$ vectors as three contiguous arrays of $N$ floats each. Operate on $\text{lanes}$ vectors at once. Used by Embree, OptiX, and modern ray tracers.

GP exposes both patterns; the SoA path is reserved for batch operations on $\geq 8$ vectors.

### 13.5 Recommended Reading

- Trefethen and Bau, *Numerical Linear Algebra*. The graduate reference.
- Goldberg, *What Every Computer Scientist Should Know About Floating-Point Arithmetic*. ([docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html))

---

## 14. Spatial Data Structures and Computational Geometry

Real-time queries (visibility, collision, ray tracing) require organizing geometry so that "what is near $\mathbf{p}$?" is faster than scanning all objects.

### 14.1 Bounding Volume Hierarchies (BVH)

A BVH is a binary tree where each node holds an axis-aligned bounding box (AABB) enclosing all geometry in its subtree. Ray-AABB tests prune entire subtrees. Construction by **Surface Area Heuristic (SAH)** [MacDonald & Booth 1990]:

$$\text{Cost}(\text{split}) = T_t + p_L \sum_L T_i + p_R \sum_R T_i$$

with $p_L, p_R$ the probability a ray traverses each child (proportional to surface area), $T_t$ the traversal cost, and $T_i$ the intersection cost. The splitting plane minimizing this cost yields good trees in $O(N \log N)$ build time.

Production engines now use **Linear BVH (LBVH)** built from Morton-coded primitives, parallelizable on GPUs in $O(N)$. See our [Virtualized Geometry Systems](/blog/virtualized-geometry-systems) post for the cluster-BVH application.

### 14.2 KD-Trees

A KD-tree splits along axis-aligned planes, with the split axis cycling per level. Faster traversal than BVH for static scenes; slower to update for dynamic scenes. Largely superseded by BVH in real-time graphics.

### 14.3 Octrees

3D space recursively subdivided into 8 octants. Used for:
- **Sparse Voxel Octrees** (SVO): efficient storage of voxelized geometry [Laine and Karras 2010].
- **Position-based collision broadphase**.
- **Cone tracing** for global illumination (NVIDIA VXGI).

### 14.4 Spatial Hashing

For uniformly-sized objects scattered through space, hashing $\lfloor \mathbf{p}/\delta \rfloor$ to a fixed-size table provides $O(1)$ neighbor queries on average. Used for SPH fluid simulation and broadphase collision in unbounded worlds.

### 14.5 Convex Hulls and Half-Plane Intersections

The **convex hull** of a point set is the smallest convex polytope containing all points. Computed in $O(N \log N)$ by QuickHull or in 3D by incremental algorithms. Used for:
- Conservative collision shapes from raw meshes
- Frustum construction (intersection of 6 half-planes)
- Convex decomposition for physics (V-HACD)

### 14.6 Reading

- [Ericson, *Real-Time Collision Detection* (companion site)](http://realtimecollisiondetection.net/). The graphics-side reference for spatial structures.
- [Wald, Boulos, Shirley, *Ray Tracing Deformable Scenes Using Dynamic Bounding Volume Hierarchies*, TOG 2007](https://dl.acm.org/doi/10.1145/1189762.1206075).

---

## 15. Physics and Animation Mathematics

### 15.1 Newton's Laws and Numerical Integration

A rigid body's motion is governed by:

$$\mathbf{F} = m\mathbf{a}, \quad \boldsymbol{\tau} = I\boldsymbol{\alpha}$$

In simulation we integrate numerically. The choice of integrator matters:

**Forward Euler** (not used in production):
$$\mathbf{v}_{n+1} = \mathbf{v}_n + \mathbf{a}_n \Delta t, \quad \mathbf{x}_{n+1} = \mathbf{x}_n + \mathbf{v}_n \Delta t$$

Cheap but unstable; energy grows unboundedly for oscillators.

**Semi-implicit (symplectic) Euler** (used in most physics engines):
$$\mathbf{v}_{n+1} = \mathbf{v}_n + \mathbf{a}_n \Delta t, \quad \mathbf{x}_{n+1} = \mathbf{x}_n + \mathbf{v}_{n+1} \Delta t$$

Same cost, conserves energy on average. The default for game physics.

**Verlet integration** (used for cloth, hair, and constraint-based systems):
$$\mathbf{x}_{n+1} = 2\mathbf{x}_n - \mathbf{x}_{n-1} + \mathbf{a}_n \Delta t^2$$

Position-based; velocity is implicit. Robust under iterative constraint solving (PBD).

**Runge-Kutta 4 (RK4)** (used in offline solvers):
Four-stage method with $O(h^4)$ truncation error. High accuracy at $4\times$ cost; rarely used in games.

### 15.2 Quaternion Time Derivatives

For an angular velocity $\boldsymbol{\omega}$ (a vector in body or world frame), the rate of change of orientation $\mathbf{q}$ is:

$$\dot{\mathbf{q}} = \frac{1}{2} (0, \boldsymbol{\omega}) \mathbf{q}$$

(quaternion product). Integrating over $\Delta t$:

$$\mathbf{q}_{n+1} = \exp\left(\frac{1}{2}\boldsymbol{\omega}\Delta t\right) \mathbf{q}_n$$

with the quaternion exponential of a pure-imaginary quaternion:

$$\exp(0, \mathbf{v}) = (\cos\|\mathbf{v}\|, \sin\|\mathbf{v}\| \, \hat{\mathbf{v}})$$

This is the correct way to integrate orientation; first-order $\mathbf{q}_{n+1} = \mathbf{q}_n + \dot{\mathbf{q}} \Delta t$ with renormalization is a common approximation.

### 15.3 Inertia Tensor

For a rigid body, the **inertia tensor** $I$ is a 3×3 symmetric positive-definite matrix relating angular velocity to angular momentum:

$$\mathbf{L} = I \boldsymbol{\omega}$$

For a uniform-density box of dimensions $a \times b \times c$ and mass $m$:

$$I_{box} = \frac{m}{12}\begin{pmatrix} b^2 + c^2 & 0 & 0 \\ 0 & a^2 + c^2 & 0 \\ 0 & 0 & a^2 + b^2 \end{pmatrix}$$

For a sphere of radius $r$:

$$I_{sphere} = \frac{2}{5} m r^2 \cdot I_{3 \times 3}$$

The tensor transforms with the body's orientation: $I_{world} = R I_{body} R^T$. Diagonalizing $I_{body}$ once at startup yields **principal axes** along which angular dynamics decouple.

### 15.4 Skeletal Animation

A skeleton is a tree of **bones**, each with a local-to-parent transform. The world-space transform of a vertex bound to bone $b$ with bind pose $B_b$ is:

$$\mathbf{v}_{world} = M_b \cdot B_b^{-1} \cdot \mathbf{v}_{rest}$$

where $M_b$ is the current world-space bone transform. With **linear blend skinning**, a vertex influenced by multiple bones with weights $w_i$:

$$\mathbf{v}_{world} = \sum_i w_i \cdot M_i \cdot B_i^{-1} \cdot \mathbf{v}_{rest}, \quad \sum w_i = 1$$

LBS is fast (a sum of weighted matrix-vector products) but produces "candy-wrapper" artifacts at sharply twisted joints. **Dual-quaternion skinning** [Kavan et al. 2007] fixes this at higher cost by interpolating in the dual-quaternion representation that preserves rigid-body length.

References:
- [Kavan et al., *Skinning with Dual Quaternions*, I3D 2007](https://www.cs.utah.edu/~ladislav/kavan07skinning/kavan07skinning.pdf)

---

## 16. The GP Math Library: Design Rationale

The GP Engine ships its mathematics module under `source/runtime/core/public/maths/`. This section enumerates the design choices and their motivations.

### 16.1 Type Inventory

| Type | Size | Purpose |
|---|---|---|
| `Vec2f`, `Vec3f`, `Vec4f` | 8B / 12B / 16B | Floating-point vectors |
| `Vec2i`, `Vec3i`, `Vec4i` | 8B / 12B / 16B | Integer vectors (texture coordinates, grid indices) |
| `Mat2f`, `Mat3f`, `Mat4f` | 16B / 36B / 64B | Column-major matrices |
| `Quaternion` | 16B | Unit quaternion |
| `Transform` | 48B | TRS tuple |
| `AABB` | 24B | Axis-aligned bounding box |
| `Sphere` | 16B | Bounding sphere |
| `Plane` | 16B | Plane equation |
| `Ray` | 24B | Origin + direction |
| `Frustum` | 96B | Six planes |
| `Color` | 16B | RGBA float |

### 16.2 Conventions, Enforced by the Type System

- **Right-handed**, $z$-up world space.
- **Column-major** matrix storage, **column vectors**, **pre-multiplication**: $\mathbf{v}' = M\mathbf{v}$.
- Quaternions are **always unit-length** when used to represent rotation; the type's invariant is enforced at construction. Non-unit quaternions are a different type (`UnnormalizedQuaternion`) used only as an intermediate.
- **Angles are radians** at the API boundary. Conversion utilities `Degrees(rad)` and `Radians(deg)` are explicit.

### 16.3 The Scalar/SIMD Duality

Every operation has two implementations:

```cpp
// public/maths/Vec3.hpp
namespace gp::math {

struct alignas(16) Vec3f {
    f32 x, y, z;
    f32 _pad;  // align to 16B for SIMD load efficiency

    [[nodiscard]] friend constexpr f32 Dot(const Vec3f& a, const Vec3f& b) noexcept {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
};

}  // namespace gp::math
```

The SIMD specialization lives next door in `private/maths/Vec3_SIMD.cpp` and is selected at compile time based on `GP_HAS_SSE`/`GP_HAS_NEON` macros. The scalar version is the **reference**: every formula in this paper compiles directly to it.

### 16.4 Constexpr-Everything

GP's math types are `constexpr`-friendly. This allows:
- **Compile-time matrix construction** for static look-up tables.
- **Static asserts on basis orthonormality**.
- **Template metaprogramming** for shader uniforms whose layout is determined at compile time.

This was a deliberate departure from GLM (which is mostly non-constexpr) and DirectXMath (whose intrinsics defy constexpr).

### 16.5 No Implicit Conversions

GP does not allow implicit conversions across handedness, between row-major and column-major, or between unit and unnormalized quaternions. These conversions require explicit calls (`ToRowMajor()`, `Normalize()`, `FlipHandedness()`) so the cost is visible and the conversion is auditable.

### 16.6 Forward Declarations

Heavy templates (`Mat<T, R, C>`) are hidden behind a `MathForward.hpp` header. Most consumers include only the forward declarations and avoid the full template instantiation in their compilation units, dramatically improving compile times.

---

## 17. Curriculum Roadmap and Further Study

This paper is the entry point. The recommended progression for a student building toward AAA-level proficiency:

### 17.1 Foundational (months 1-3)

- Strang, *Linear Algebra and Its Applications* (or 3Blue1Brown's video series for visual intuition).
- Lengyel, *Foundations of Game Engine Development, Vol. 1: Mathematics*.
- Implement a software rasterizer from scratch in C++. The [Tinyrenderer](https://github.com/ssloy/tinyrenderer) tutorial is canonical.

### 17.2 Intermediate (months 4-9)

- Akenine-Möller, Haines, Hoffman, *Real-Time Rendering*, 4th ed. The standard textbook of the field.
- Pharr, Jakob, Humphreys, *Physically Based Rendering*, 4th ed. ([pbr-book.org](https://pbr-book.org))
- Ericson, *Real-Time Collision Detection*.
- Implement a CPU path tracer (use *PBRT* as the reference).

### 17.3 Advanced (year 2+)

- Veach, *Robust Monte Carlo Methods for Light Transport Simulation* (PhD thesis, the bible of variance reduction).
- Shoemake, *Quaternions* tutorial.
- SIGGRAPH course notes (annual): *Advances in Real-Time Rendering*, *Physically Based Shading*. Available at [advances.realtimerendering.com](https://advances.realtimerendering.com).
- Implement a real-time deferred renderer, then a Vulkan-based path tracer with ReSTIR, then virtualized geometry (see our [previous post](/blog/virtualized-geometry-systems)).

### 17.4 The GP Curriculum

Future GP educational posts will build on this foundation in roughly this order:

1. *Practical Linear Algebra: Implementing Vec/Mat/Quat from Scratch* (anatomy of `core/public/maths/`).
2. *The Rasterization Pipeline: From Triangle to Pixel* (deriving the perspective divide).
3. *PBR From First Principles: Building a Cook-Torrance BRDF* (microfacet derivation, code).
4. *Monte Carlo Integration for Real-Time Path Tracing* (importance sampling, MIS, ReSTIR).
5. *Temporal Anti-Aliasing: The Subpixel Frequency Domain*.
6. *Skeletal Animation and Dual-Quaternion Skinning*.

Each builds on the foundations laid here; none introduces a formula not derivable from this paper.

---

## 18. References

### Foundational Mathematics

1. **Strang, G.** (2016). *Introduction to Linear Algebra*, 5th ed. Wellesley-Cambridge Press.
2. **Spivak, M.** (2008). *Calculus*, 4th ed. Publish or Perish.
3. **Trefethen, L. N. & Bau, D.** (1997). *Numerical Linear Algebra*. SIAM.
4. **Goldberg, D.** (1991). *What every computer scientist should know about floating-point arithmetic*. ACM Computing Surveys 23(1). Available: [docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html](https://docs.oracle.com/cd/E19957-01/806-3568/ncg_goldberg.html)
5. **Sanderson, G. (3Blue1Brown)**. *Essence of Linear Algebra*. Video series. Available: [youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab)

### Graphics-Oriented Math

6. **Lengyel, E.** (2016). *Foundations of Game Engine Development, Volume 1: Mathematics*. Terathon. Available: [foundationsofgameenginedev.com](https://foundationsofgameenginedev.com/)
7. **Lengyel, E.** (2019). *Foundations of Game Engine Development, Volume 2: Rendering*. Terathon.
8. **Akenine-Möller, T., Haines, E., Hoffman, N., Pesce, A., Iwanicki, M., & Hillaire, S.** (2018). *Real-Time Rendering*, 4th ed. CRC Press. Errata and supplements: [realtimerendering.com](https://www.realtimerendering.com/)
9. **Dunn, F. & Parberry, I.** (2011). *3D Math Primer for Graphics and Game Development*, 2nd ed. CRC Press.

### Quaternions and Rotations

10. **Shoemake, K.** (1985). *Animating rotation with quaternion curves*. SIGGRAPH '85, 245-254.
11. **Sommer, H., Gilitschenski, I., Bloesch, M., et al.** (2018). *Why and how to avoid the flipped quaternion multiplication*. Aerospace 5(3), 72. [arxiv.org/abs/1801.07478](https://arxiv.org/abs/1801.07478)
12. **Hanson, A. J.** (2006). *Visualizing Quaternions*. Morgan Kaufmann.

### Geometry and Intersection

13. **Möller, T. & Trumbore, B.** (1997). *Fast, minimum storage ray-triangle intersection*. Journal of Graphics Tools 2(1), 21-28.
14. **Ericson, C.** (2005). *Real-Time Collision Detection*. Morgan Kaufmann. Companion site: [realtimecollisiondetection.net](http://realtimecollisiondetection.net/)
15. **MacDonald, J. D. & Booth, K. S.** (1990). *Heuristics for ray tracing using space subdivision*. The Visual Computer 6(3), 153-166.

### Physically Based Rendering

16. **Kajiya, J. T.** (1986). *The rendering equation*. SIGGRAPH '86, 143-150.
17. **Cook, R. L. & Torrance, K. E.** (1982). *A reflectance model for computer graphics*. ACM Transactions on Graphics 1(1), 7-24.
18. **Schlick, C.** (1994). *An inexpensive BRDF model for physically-based rendering*. Computer Graphics Forum 13(3), 233-246.
19. **Burley, B.** (2012). *Physically-based shading at Disney*. SIGGRAPH 2012 Course Notes. Available: [disneyanimation.com/publications/physically-based-shading-at-disney/](https://disneyanimation.com/publications/physically-based-shading-at-disney/)
20. **Karis, B.** (2013). *Real shading in Unreal Engine 4*. SIGGRAPH 2013 Course Notes. Available: [blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf](https://blog.selfshadow.com/publications/s2013-shading-course/karis/s2013_pbs_epic_notes_v2.pdf)
21. **Heitz, E.** (2014). *Understanding the masking-shadowing function in microfacet-based BRDFs*. Journal of Computer Graphics Techniques 3(2), 48-107. [jcgt.org/published/0003/02/03/](https://jcgt.org/published/0003/02/03/)
22. **Pharr, M., Jakob, W. & Humphreys, G.** (2023). *Physically Based Rendering: From Theory to Implementation*, 4th ed. MIT Press. Full book online: [pbr-book.org](https://pbr-book.org)
23. **Veach, E.** (1997). *Robust Monte Carlo methods for light transport simulation*. PhD thesis, Stanford University.
24. **Veach, E. & Guibas, L. J.** (1995). *Optimally combining sampling techniques for Monte Carlo rendering*. SIGGRAPH '95.

### Sampling and Real-Time Path Tracing

25. **Bitterli, B., Wyman, C., Pharr, M., Shirley, P., Lefohn, A. & Jarosz, W.** (2020). *Spatiotemporal reservoir resampling for real-time ray tracing with dynamic direct lighting*. SIGGRAPH 2020. Available: [research.nvidia.com/publication/2020-07_Spatiotemporal-reservoir-resampling](https://research.nvidia.com/publication/2020-07_Spatiotemporal-reservoir-resampling)
26. **Halton, J. H.** (1964). *Algorithm 247: Radical-inverse quasi-random point sequence*. Communications of the ACM 7(12), 701-702.
27. **Owen, A. B.** (1995). *Randomly permuted (t, m, s)-nets and (t, s)-sequences*. In: Monte Carlo and Quasi-Monte Carlo Methods in Scientific Computing.

### Color and Tone Mapping

28. **CIE** (1931). *Commission Internationale de l'Éclairage Proceedings*, 1931. Cambridge University Press.
29. **Reinhard, E., Stark, M., Shirley, P. & Ferwerda, J.** (2002). *Photographic tone reproduction for digital images*. ACM Transactions on Graphics 21(3).
30. **Narkowicz, K.** (2016). *ACES Filmic Tone Mapping Curve* (approximation). Available: [knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/](https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/)
31. **Academy of Motion Picture Arts and Sciences**. *Academy Color Encoding System (ACES)*. Available: [acescentral.com](https://acescentral.com/)
32. **ITU-R Recommendation BT.2100**. *Image parameter values for high dynamic range television*. Available: [itu.int/rec/R-REC-BT.2100/en](https://www.itu.int/rec/R-REC-BT.2100/en)

### Signal Processing

33. **Glassner, A. S.** (1995). *Principles of Digital Image Synthesis*. Morgan Kaufmann.
34. **Mitchell, D. P. & Netravali, A. N.** (1988). *Reconstruction filters in computer graphics*. SIGGRAPH '88.
35. **Smith, S. W.** (1997). *The Scientist and Engineer's Guide to Digital Signal Processing*. California Technical Publishing. Available: [dspguide.com](http://www.dspguide.com/)

### Spatial Data Structures

36. **Karras, T.** (2012). *Maximizing parallelism in the construction of BVHs, octrees, and k-d trees*. High-Performance Graphics 2012.
37. **Laine, S. & Karras, T.** (2010). *Efficient sparse voxel octrees*. I3D 2010.
38. **Wald, I., Boulos, S. & Shirley, P.** (2007). *Ray tracing deformable scenes using dynamic bounding volume hierarchies*. ACM Transactions on Graphics 26(1).

### Animation and Physics

39. **Kavan, L., Collins, S., Žára, J. & O'Sullivan, C.** (2007). *Skinning with dual quaternions*. I3D 2007. Available: [cs.utah.edu/~ladislav/kavan07skinning/kavan07skinning.pdf](https://www.cs.utah.edu/~ladislav/kavan07skinning/kavan07skinning.pdf)
40. **Müller, M., Heidelberger, B., Hennix, M. & Ratcliff, J.** (2007). *Position based dynamics*. Journal of Visual Communication and Image Representation 18(2).
41. **Catto, E.** (2015). *Numerical methods*. GDC 2015. Available: [box2d.org/files/ErinCatto_NumericalMethods_GDC2015.pdf](https://box2d.org/files/ErinCatto_NumericalMethods_GDC2015.pdf)

### Spherical Harmonics and Image-Based Lighting

42. **Ramamoorthi, R. & Hanrahan, P.** (2001). *An efficient representation for irradiance environment maps*. SIGGRAPH 2001. Available: [graphics.stanford.edu/papers/envmap/envmap.pdf](https://graphics.stanford.edu/papers/envmap/envmap.pdf)
43. **Sloan, P.-P.** (2008). *Stupid spherical harmonics tricks*. GDC 2008.

### Engine Math Library Engineering

44. **Reed, N.** (2015). *Depth precision visualized*. NVIDIA Developer Blog. Available: [developer.nvidia.com/content/depth-precision-visualized](https://developer.nvidia.com/content/depth-precision-visualized)
45. **Lottes, T.** (2009). *FXAA*. NVIDIA Whitepaper.
46. **Sucker Punch / Naughty Dog GDC presentations on world-scale precision** (various years). Aggregated at [advances.realtimerendering.com](https://advances.realtimerendering.com).

### Tutorials

47. **Sokolov, D.** *Tinyrenderer: How OpenGL works, software rendering in 500 lines of code*. Tutorial. Available: [github.com/ssloy/tinyrenderer](https://github.com/ssloy/tinyrenderer)
48. **De Vries, J.** *Learn OpenGL*. Tutorial. Available: [learnopengl.com](https://learnopengl.com/)

### GP Engine Companion Posts

49. **Scotton, M.** (2026). *Virtualized Geometry Systems: Architecture, Theory, and Implementation*. GP Engineering Reference Series. ([/blog/virtualized-geometry-systems](/blog/virtualized-geometry-systems))
50. **Scotton, M.** (2026). *Engine Architecture and Directory Layout*. GP Engineering Reference Series. ([/blog/engine-architecture-layout](/blog/engine-architecture-layout))

---

*Document prepared as part of the GP SDK Engineering Reference Series.*
*Version 1.0, Principal Systems Engineer, Graphical Playground SDK.*
