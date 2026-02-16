import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroBackground}></div>
      <div className='container'>
        <div className={styles.heroContent}>
          <Heading as='h1' className={styles.heroTitle}>
            {siteConfig.title}
          </Heading>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <div className={styles.heroButtons}>
            <Link className={clsx('button button--lg', styles.buttonPrimary)} to='/docs/intro'>
              <i className='eds-icon icon-rocket' style={{ marginRight: '0.5rem' }}></i>
              Get Started
            </Link>
            <Link className={clsx('button button--lg', styles.buttonSecondary)} to='/docs/engine/intro'>
              <i className='eds-icon icon-medal-star' style={{ marginRight: '0.5rem' }}></i>
              Explore Engine
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function FeatureCards() {
  const features = [
    {
      icon: 'icon-rocket',
      title: 'High Performance',
      description:
        'Built from the ground up for maximum performance with modern rendering techniques and optimizations.',
      link: '/docs/engine/intro'
    },
    {
      icon: 'icon-code',
      title: 'Developer Friendly',
      description:
        'Comprehensive C++ API with extensive documentation and code samples to accelerate your development.',
      link: '/docs/api/intro'
    },
    {
      icon: 'icon-graduation-cap',
      title: 'Learning Resources',
      description: 'Tutorials, guides, and examples to help you master the Graphical Playground engine.',
      link: '/blog'
    }
  ];

  return (
    <section className={styles.featuresSection}>
      <div className='container'>
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <Link key={idx} to={feature.link} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <span className={`eds-icon ${feature.icon}`}></span>
              </div>
              <Heading as='h3' className={styles.featureTitle}>
                {feature.title}
              </Heading>
              <p className={styles.featureDescription}>{feature.description}</p>
              <div className={styles.featureArrow}>
                <span className='eds-icon icon-arrow-right'></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickLinks() {
  const links = [
    {
      icon: 'icon-file-lines',
      title: 'Documentation',
      description: 'Complete reference for all engine features',
      link: '/docs/intro'
    },
    {
      icon: 'icon-curly-braces',
      title: 'API Reference',
      description: 'Detailed C++ API documentation',
      link: '/docs/api/intro'
    },
    {
      icon: 'icon-dictionary',
      title: 'Engine Architecture',
      description: 'Learn about the engine internals',
      link: '/docs/engine/programming-with-cpp/engine-architecture/modules'
    },
    {
      icon: 'icon-lightbulb',
      title: 'Coding Standards',
      description: 'Best practices for engine development',
      link: '/docs/engine/programming-with-cpp/coding-standard'
    }
  ];

  return (
    <section className={styles.quickLinksSection}>
      <div className='container'>
        <Heading as='h2' className={styles.sectionTitle}>
          Quick Links
        </Heading>
        <div className={styles.quickLinksGrid}>
          {links.map((link, idx) => (
            <Link key={idx} to={link.link} className={styles.quickLinkCard}>
              <span className={`eds-icon ${link.icon} ${styles.quickLinkIcon}`}></span>
              <div className={styles.quickLinkContent}>
                <h4 className={styles.quickLinkTitle}>{link.title}</h4>
                <p className={styles.quickLinkDescription}>{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.ctaSection}>
      <div className='container'>
        <div className={styles.ctaCard}>
          <div className={styles.ctaContent}>
            <Heading as='h2' className={styles.ctaTitle}>
              Ready to Start Building?
            </Heading>
            <p className={styles.ctaDescription}>
              Dive into the documentation and start creating amazing experiences with Graphical Playground.
            </p>
            <div className={styles.ctaButtons}>
              <Link className={clsx('button button--lg', styles.buttonPrimary)} to='/docs/intro'>
                Get Started
              </Link>
              <Link
                className={clsx('button button--lg', styles.buttonOutline)}
                href='https://github.com/GraphicalPlayground'
              >
                <span className='eds-icon icon-github' style={{ marginRight: '0.5rem' }}></span>
                View on GitHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description='Comprehensive documentation for the Graphical Playground engine'
    >
      <HomepageHeader />
      <main className={styles.mainContent}>
        <FeatureCards />
        <QuickLinks />
        <CTASection />
      </main>
    </Layout>
  );
}
