![](.github/assets/repo-title.svg)

![GitHub Workflow](https://img.shields.io/github/actions/workflow/status/GraphicalPlayground/gp-docs/deploy.yml?branch=main&label=Docusaurus%20Build&logo=github)
![Github Deploy](https://img.shields.io/github/deployments/GraphicalPlayground/gp-docs/github-pages?label=GitHub%20Pages%20Deploy&logo=github)
![GitHub Repo Size](https://img.shields.io/github/repo-size/GraphicalPlayground/gp-docs?logo=github)

---

Welcome to the central hub for [Graphical Playground](https://graphical-playground.com) documentation. This repository contains the technical guides, API references, and tutorials for the Graphical Playground ecosystem, all powered by [Docusaurus](https://docusaurus.io).

## Getting Started

To get a local instance of the documentation site up and running for development, follow these steps:

1. **Clone the Repository**:
```bash
git clone https://github.com/GraphicalPlayground/gp-docs.git
cd gp-docs
```

2. **Install Dependencies**:
```bash
npm install
# or
yarn install
```

3. **Start the Development Server**:
```bash
npm start
# or
yarn start
```

The site will be available at `http://localhost:3000`.

## Project Structure

Understanding where files live is key to efficient contribution:

- `docs/`: Contains the markdown files for the documentation content.
- `src/`: Contains custom React components and styles for the site.
- `static/`: Contains static assets like images and icons used in the documentation.
- `docusaurus.config.js`: The main configuration file for Docusaurus.
- `sidebars.js`: Defines the structure of the documentation sidebar.

## Deployment

This project uses **GitHub Actions** for Continuous Integration and Deployment.
- **Build Check**: Every Pull Request triggers a build test to ensure no broken links or syntax errors.
- **Automatic Deploy**: Pushing to the `main` branch automatically builds the site and deploys it to **GitHub Pages**.

## Contributing

We welcome contributions from the community! If you have suggestions for improving the documentation or want to add new content, please read our [Contributing Guidelines](CONTRIBUTING.md) and submit a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

---

Maintained by the **GraphicalPlayground Team**. [Visit the Live Docs](https://docs.graphical-playground.com)
