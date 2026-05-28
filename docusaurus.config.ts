import { prismThemeDark, prismThemeLight } from './src/theme/prism-theme';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Graphical Playground Documentation',
  tagline:
    'Comprehensive guides, detailed API references, and practical examples to help you master Graphical Playground and create stunning graphics with ease.',
  favicon: 'images/favicon.svg',

  // Enable Mermaid diagrams in Markdown files
  markdown: {
    mermaid: true
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

  // Plugins
  plugins: [
    './src/plugins/tailwind-config.js',
    [
      '@aeorank/docusaurus',
      {
        siteName: 'Graphical Playground Documentation',
        description: 'Comprehensive documentation for Graphical Playground, the visual programming environment.',
        siteUrl: 'https://docs.graphical-playground.com'
      }
    ],
    'docusaurus-plugin-copy-page-button'
  ],

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
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          showLastUpdateAuthor: false, // Set to false since we update it via github actions...
          showLastUpdateTime: true
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex]
        },
        theme: {
          customCss: './src/css/custom.css'
        }
      } satisfies Preset.Options
    ]
  ],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity: 'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous'
    }
  ],

  themes: ['@docusaurus/theme-mermaid'],

  headTags: [
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json'
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Organization',
        'name': 'Graphical Playground',
        'url': 'https://graphical-playground.com/',
        'logo': 'https://docs.graphical-playground.com/images/logo-long-text-black.svg',
        'description':
          'Graphical Playground is a visual programming environment and game engine that empowers developers to create stunning real-time graphics applications with ease. Our mission is to democratize graphics programming and make it accessible to everyone, from beginners to experts. With Graphical Playground, you can unleash your creativity and bring your ideas to life in a fun and intuitive way.',
        'sameAs': [
          'https://github.com/GraphicalPlayground',
          'https://www.linkedin.com/company/graphical-playground',
          'https://discord.gg/zcuqRuHQ7E'
        ]
      })
    },
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json'
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'WebSite',
        'name': 'Graphical Playground Documentation',
        'url': 'https://docs.graphical-playground.com/',
        'description': 'Comprehensive documentation for Graphical Playground, the visual programming environment.',
        'publisher': {
          '@type': 'Organization',
          'name': 'Graphical Playground',
          'url': 'https://graphical-playground.com/',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://docs.graphical-playground.com/images/logo-long-text-black.svg'
          }
        },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://docs.graphical-playground.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      })
    }
  ],

  themeConfig: {
    image: 'images/gplayd-social-card.png',
    metadata: [
      {
        name: 'keywords',
        content: [
          'graphical playground',
          'graphics programming',
          'graphical engineering',
          'visual programming',
          'documentation',
          'guides',
          'api reference',
          'directx12',
          'directx11',
          'metal',
          'opengl',
          'opengles',
          'webgpu',
          'vulkan',
          'rendering hardware interfaces',
          'rhi',
          'hardware abstraction layers',
          'hal',
          'physics simulation',
          'game engine',
          'rendering engine',
          'graphics engine',
          'cross-platform',
          'real-time rendering',
          'shader programming',
          'node-based programming',
          'visual scripting',
          'interactive development environment',
          'gp engine',
          'gp platform',
          'gp build tool',
          'gp docs',
          'gp curriculum',
          'gp actions',
          'gp infrastructure',
          'gp handbook',
          'gp sample projects',
          'gp certifications',
          'gp experiments',
          'c++',
          'hlsl',
          'glsl',
          'cmake'
        ].join(', ')
      },
      { name: 'author', content: 'Graphical Playground Team' },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { property: 'og:site_name', content: 'Graphical Playground Docs' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'Graphical Playground Documentation' },
      {
        property: 'og:description',
        content:
          'Master visual programming and game engine development with the official Graphical Playground documentation.'
      },
      { property: 'og:url', content: 'https://docs.graphical-playground.com/' }
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true
    },
    navbar: {
      logo: {
        alt: 'GP Logo',
        src: 'images/logo-short-text-black.svg',
        srcDark: 'images/logo-short-text-white.svg'
      },
      items: [
        {
          type: 'docSidebar',
          label: 'Guides',
          sidebarId: 'guidesSidebar',
          position: 'left'
        },
        {
          type: 'docSidebar',
          sidebarId: 'engineSidebar',
          position: 'left',
          label: 'Engine'
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          position: 'left',
          label: 'Platform API'
        },
        {
          label: 'Resources',
          type: 'dropdown',
          position: 'left',
          items: [
            {
              label: 'Blog',
              to: '/blog'
            },
            {
              label: 'Frequently Asked Questions (FAQ)',
              to: 'https://graphical-playground.com/faq'
            },
            {
              label: 'Sample Projects',
              to: 'https://github.com/GraphicalPlayground/gp-sample-projects'
            },
            {
              label: 'Release Notes',
              to: 'https://graphical-playground.com/release-notes'
            },
            {
              label: 'GitHub Organization',
              to: 'https://github.com/GraphicalPlayground'
            },
            {
              label: 'Learning Resources',
              to: 'https://graphical-playground.com/learning'
            },
            {
              label: 'Recommanded Readings',
              to: '/recommended-readings'
            }
          ]
        },
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
        src: 'images/logo-long-text-white.svg',
        srcDark: 'images/logo-long-text-black.svg',
        width: 160,
        height: 50
      },
      links: [
        {
          title: 'Tools',
          items: [
            {
              label: 'GP Engine',
              to: 'https://graphical-playground.com/tools/engine'
            },
            {
              label: 'GP Platform',
              to: 'https://graphical-playground.com/tools/platform'
            },
            {
              label: 'GP Build Tool',
              to: 'https://graphical-playground.com/tools/build-tool'
            }
          ]
        },
        {
          title: 'Online Services',
          items: [
            {
              label: 'Platform Services',
              to: 'https://graphical-playground.com/services'
            },
            {
              label: 'Support',
              to: 'https://graphical-playground.com/support'
            },
            {
              label: 'Security',
              to: 'https://graphical-playground.com/security'
            },
            {
              label: 'Terms of Service',
              to: 'https://graphical-playground.com/terms/tos'
            },
            {
              label: 'User Agreements',
              to: 'https://graphical-playground.com/terms/agreements'
            },
            {
              label: 'Acceptable Use Policy',
              to: 'https://graphical-playground.com/terms/aup'
            },
            {
              label: 'Privacy Policy',
              to: 'https://graphical-playground.com/terms/privacy'
            },
            {
              label: 'Subprocessors List',
              to: 'https://graphical-playground.com/terms/subprocessors'
            }
          ]
        },
        {
          title: 'Company',
          items: [
            {
              label: 'About Us',
              to: 'https://graphical-playground.com/about'
            },
            {
              label: 'Newsroom',
              to: 'https://graphical-playground.com/news'
            },
            {
              label: 'Careers',
              to: 'https://graphical-playground.com/careers'
            },
            {
              label: 'Support Us',
              to: 'https://graphical-playground.com/donate'
            },
            {
              label: 'UX Research Panel',
              to: 'https://graphical-playground.com/ux-research'
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
              to: 'https://github.com/GraphicalPlayground'
            },
            {
              label: 'Learning',
              to: 'https://graphical-playground.com/learning'
            },
            {
              label: 'Frequently Asked Questions (FAQ)',
              to: 'https://graphical-playground.com/faq'
            },
            {
              label: 'Sample Projects',
              to: 'https://graphical-playground.com/sample-projects'
            },
            {
              label: 'Release Notes',
              to: 'https://graphical-playground.com/release-notes'
            }
          ]
        },
        {
          title: 'Repositories',
          items: [
            {
              label: 'Organization',
              to: 'https://github.com/GraphicalPlayground'
            },
            {
              label: 'gp-engine',
              to: 'https://github.com/GraphicalPlayground/gp-engine'
            },
            {
              label: 'gp-platform',
              to: 'https://github.com/GraphicalPlayground/gp-platform'
            },
            {
              label: 'gp-docs',
              to: 'https://github.com/GraphicalPlayground/gp-docs'
            },
            {
              label: 'gp-curriculum',
              to: 'https://github.com/GraphicalPlayground/gp-curriculum'
            },
            {
              label: 'gp-actions',
              to: 'https://github.com/GraphicalPlayground/gp-actions'
            },
            {
              label: 'gp-infrastructure',
              to: 'https://github.com/GraphicalPlayground/gp-infrastructure'
            },
            {
              label: 'gp-handbook',
              to: 'https://github.com/GraphicalPlayground/gp-handbook'
            },
            {
              label: 'gp-sample-projects',
              to: 'https://github.com/GraphicalPlayground/gp-sample-projects'
            },
            {
              label: 'gp-certifications',
              to: 'https://github.com/GraphicalPlayground/gp-certifications'
            },
            {
              label: 'gp-experiments',
              to: 'https://github.com/GraphicalPlayground/gp-experiments'
            }
          ]
        }
      ],
      copyright: `© ${new Date().getFullYear()}, Graphical Playground, Inc. All rights reserved.`
    },
    prism: {
      theme: prismThemeLight,
      darkTheme: prismThemeDark,
      additionalLanguages: ['c', 'cmake', 'glsl', 'git', 'ini', 'regex', 'hlsl']
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
