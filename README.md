![Graphical Playground - Engine](https://github.com/GraphicalPlayground/.github/blob/main/assets/banners/gp-docs.svg)

[![Explore the Platform](https://github.com/GraphicalPlayground/.github/blob/main/assets/cta/cta-explore-platform.svg)](https://graphical-playground.com)
[![Read the Handbook](https://github.com/GraphicalPlayground/.github/blob/main/assets/cta/cta-read-handbook.svg)](https://handbook.graphical-playground.com)
[![Documentation](https://github.com/GraphicalPlayground/.github/blob/main/assets/cta/cta-documentation.svg)](https://docs.graphical-playground.com)
[![Learn about Licensing](https://github.com/GraphicalPlayground/.github/blob/main/assets/cta/cta-learn-licensing.svg)](https://graphical-playground.com/licensing)

# [@GraphicalPlayground](https://github.com/GraphicalPlayground)/gp-docs
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
## Contributing

We welcome contributions from everybody! Whether you are fixing a bug, implementing a new features,
or improving our documentation, your help is appreciated. Please see our full
[CONTRIBUTING.md](./CONTRIBUTING.md) guide for detailed information on our standards and the pull
request review process.

### Code of Conduct

To ensure a welcoming, collaborative, and inclusive environment for everyone learning and
building within the Graphical Playground ecosystem, all contributors and participants are
expected to adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md). Please review it before engaging
in community discussions or submitting code.

### Security

If you discover a security vulnerability within `gp-docs`, please do not report
it by opening a public issue. Instead, refer to our [Security Policy](./SECURITY.md) for
instructions on how to securely disclose the vulnerability to the maintainers.

### License

`gp-docs` is open-source software. Please see the [LICENSE.md](./LICENSE.md) file in the root
directory for full terms regarding modification, distribution, and use in your own projects.

### Donations

If you find `gp-docs` helpful for your learning, academic research, or game development journey,
please consider supporting the project. Maintaining a modern C++ graphics engine takes
significant time and resources!

You can sponsor the Graphical Playground project through the following links:

- [**Buy Me A Coffee**](https://www.buymeacoffee.com/GraphicalPlayground)
- [**GitHub Sponsors**](https://github.com/sponsors/GraphicalPlayground)
- [**Direct Donation**](https://graphical-playground.com/donate)

You can see the full list of sponsors and supporters on our
[Sponsors Page](https://graphical-playground.com/sponsors) or in [DONORS.md](./DONORS.md).
Your support helps us continue to develop high-quality educational resources and maintain the engine
for the next generation of graphics engineers.

## Contact

If you have any questions, suggestions, or want to share your projects built with `gp-docs`, we
would love to hear from you! You can reach out to us through the following channels:

- **GitHub Discussions**: [Join the Conversation](https://github.com/orgs/GraphicalPlayground/discussions)
- **Email**:
  - [support@graphical-playground.com](mailto:support@graphical-playground.com)
  - [security@graphical-playground.com](mailto:security@graphical-playground.com)
  - [contact@graphical-playground.com](mailto:contact@graphical-playground.com)
- **Social Media**:
  - [LinkedIn](https://www.linkedin.com/company/graphical-playground)
  - [Discord](https://discord.graphical-playground.com)

---
© 2026 Graphical Playground. Built for the next generation of graphics engineers.

![Graphical Playground](https://github.com/GraphicalPlayground/.github/blob/main/assets/misc/gplayd-footer.svg)
