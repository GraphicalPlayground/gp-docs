import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description='Comprehensive documentation for the Graphical Playground engine'
    >
      <div className='top-0 z-[-2] flex min-h-100 md:min-h-150 w-full flex-col items-center bg-white bg-[radial-gradient(#00000020_1px,#ffffff_1px)] bg-size-[20px_20px] px-4 md:px-6 pt-24 md:pt-32 lg:pt-48 pb-16'>
        <h1 className='mx-auto max-w-5xl text-center text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-normal leading-tight lg:leading-none tracking-[-0.02em] text-black'>
          Guides, APIs, and examples
          <br className='hidden md:block' /> {' for '}
          <span className='relative inline-block whitespace-nowrap'>
            <span className='absolute -left-1 sm:-left-2 bottom-1 sm:bottom-2 -z-10 h-[60%] w-[105%] -rotate-2 rounded-md bg-[#EAD8FE]'></span>
            Graphical Playground
          </span>
        </h1>

        <p className='mt-6 md:mt-8 max-w-xl text-center text-base sm:text-lg md:text-xl text-black leading-relaxed'>
          Accelerates onboarding, clarifies complex APIs, and provides comprehensive examples for every feature.
        </p>
      </div>
    </Layout>
  );
}
