---
sidebar_position: 0
title: C++ API Reference
description: Graphical Playground API Reference.
tags:
    - c++
---

# C++ API Reference

<p style={{ color: '#ffffffa6' }}>
Graphical Playground API Reference.
</p>

Welcome to the Graphical Playground C++ API Reference! This is a reference manual for the Graphical Playground Source code.

Graphical Playground's systems and features are packaged in two ways:
- [Modules](../programming-with-cpp/engine-architecture/modules.md): The basic building block of Graphical Playground's software and architecture.
- [Plugins](#): Collections of modules and assets that you can enable or disable within the Editor on a per-project basis.

Explore all of Graphical Playground's modules, plugins, and their members here, organized hierarchically. You can use the search bar to find a known term, such as a class or function name.

You can also browse the modules and plugins below:

## Modules

### Developer

The Developer category provides code that is compiled for every type of build target, but only in non-shipping build configurations. These include development and debug tools, and these modules are not included in Shipping builds.

### Editor

The Editor category provides access to in-Editor code. These modules are compiled for all build configurations, but for Editor build targets. These include tools used by the Editor and the GP Editor itself.

### Runtime

The Runtime category contains functionality necessary to run GP Engine. These modules are compiled for every type of build configuration and build target.
