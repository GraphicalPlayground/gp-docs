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
      <div className='top-0 z-[-2] flex h-150 w-full flex-col items-center bg-white bg-[radial-gradient(#00000020_1px,#ffffff_1px)] bg-size-[20px_20px] px-6 pt-48'>
        <h1 className='mx-auto max-w-5xl text-center text-[72px] font-normal leading-none tracking-[-0.02em] text-black'>
          Guides, APIs, and examples
          <br />
          for{' '}
          <span className='relative inline-block whitespace-nowrap'>
            <span className='absolute -left-2 bottom-2 -z-10 h-[60%] w-[105%] -rotate-2 rounded-md bg-[#EAD8FE]'></span>
            Graphical Playground
          </span>
        </h1>
      </div>
    </Layout>
  );
}
