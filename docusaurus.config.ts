import unrealTheme from './src/theme/prism-unreal-theme';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Graphical Playground Docs',
  tagline: 'Documentation for Graphical Playground',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.graphical-playground.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'GraphicalPlayground', // Usually your GitHub org/user name.
  projectName: 'gp-docs', // Usually your repo name.

  onBrokenLinks: 'throw',

  deploymentBranch: 'gh-pages',

  trailingSlash: false,

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn'
        },
        theme: {
          customCss: './src/css/custom.css'
        }
      } satisfies Preset.Options
    ]
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: true
    },
    navbar: {
      title: 'Graphical Playground',
      logo: {
        alt: 'GP Logo',
        src: 'img/logo.svg'
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Tutorial'
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        {
          href: 'https://github.com/GraphicalPlayground',
          label: 'GitHub',
          position: 'right'
        },
        {
          type: 'localeDropdown',
          position: 'right'
        }
      ]
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'Graphical Playground Logo',
        src: 'img/logo-full.svg',
        width: 160,
        height: 50
      },
      links: [
        {
          title: 'Tools',
          items: [
            {
              label: 'GP Engine',
              href: 'https://graphical-playground.com/tools/engine'
            },
            {
              label: 'Documentation',
              to: '/docs/intro'
            }
          ]
        },
        {
          title: 'Online Services',
          items: [
            {
              label: 'Platform Services',
              href: 'https://graphical-playground.com/services'
            },
            {
              label: 'Support',
              href: 'https://graphical-playground.com/support'
            }
          ]
        },
        {
          title: 'Company',
          items: [
            {
              label: 'About Us',
              href: 'https://graphical-playground.com/about'
            },
            {
              label: 'Careers',
              href: 'https://graphical-playground.com/careers'
            }
          ]
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'Blog',
              to: '/blog'
            },
            {
              label: 'GitHub',
              href: 'https://github.com/GraphicalPlayground'
            },
            {
              label: 'Learning',
              href: 'https://graphical-playground.com/learning'
            }
          ]
        }
      ],
      copyright: `© ${new Date().getFullYear()}, Graphical Playground, Inc. All rights reserved.`
    },
    prism: {
      theme: unrealTheme,
      darkTheme: unrealTheme
    },
    algolia: {
      // The application ID provided by Algolia
      appId: 'F2NV537VZ4',

      // Public API key: it is safe to commit it
      apiKey: '7c4933067d38c508bbff2b4e26c78fee',

      indexName: 'Graphical Playground Documentation',

      // Optional: see doc section below
      contextualSearch: true,

      // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
      insights: false
    }
  } satisfies Preset.ThemeConfig
};

export default config;
