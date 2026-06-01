<!-- gp:protected:start -->

**Table of content**  
[Overview](#overview)  
┕ [Getting Started](#getting-started)  
┕ [Prerequisites](#prerequisites)  
┕ [Building the Docs](#building-the-docs)  
[Documentation](#documentation)  
[Contributing](#contributing)  
┕ [Code of Conduct](#code-of-conduct)  
┕ [Security](#security)  
┕ [License](#license)  
┕ [Donations](#donations)  
[Contact](#contact)  

## Overview

**gp-docs** pulls documentation from `gp-engine`, `gp-actions`, `gp-build-tool`, and `gp-platform`
and publishes it as one site at [docs.graphical-playground.com](https://docs.graphical-playground.com).
The site runs on [Docusaurus](https://docusaurus.io/) with a handful of custom plugins:

- TailwindCSS: utility-first styles on top of the Docusaurus theme
- CopyPageButton: one-click export of any page to markdown
- AEORank: relevance scoring for search and cross-references
- remarkPath: fixes relative asset paths across source packages
- KaTeX: math rendering for shader and linear algebra pages
- Algolia: version-scoped search index
- Prism: syntax highlighting with a custom theme

The build enforces strict link checking. A dead link anywhere in the aggregated output will fail
`npm run build`, so run a full build before opening a PR.

### Getting Started

Clone the repo:

```bash
git clone https://github.com/GraphicalPlayground/gp-docs.git
cd gp-docs
```

Then install dependencies:

```bash
npm install
```

### Prerequisites

Node.js v20 or later (LTS recommended). npm comes bundled with it, no separate install needed.
No C++ compiler, CMake, or graphics driver is required.

### Building the Docs

Start a local dev server:

```bash
npm run start
```

The site opens at `http://localhost:3000`. File changes reload without a full rebuild.

To run a full production build and catch broken links:

```bash
npm run build
```

A broken anchor, missing asset, or stale cross-reference will fail here with a specific error. To
preview the built output locally:

```bash
npm run serve
```

## Documentation

The full docs are at [docs.graphical-playground.com](https://docs.graphical-playground.com).

<!-- gp:protected:end -->
