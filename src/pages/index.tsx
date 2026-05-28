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
      <div className='top-0 z-0 flex min-h-100 md:min-h-150 w-full flex-col items-center bg-white bg-[radial-gradient(#00000020_1px,#ffffff_1px)] bg-size-[20px_20px] px-4 md:px-6 pt-24 md:pt-32 lg:pt-48 pb-16'>
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

        <div className='mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:flex-wrap items-center justify-center gap-4'>
          <Link
            href='/docs/guides'
            className='w-full sm:w-auto text-center bg-[#ECFF77] border border-[#ECFF77] rounded-xl px-8 py-3 text-black cursor-pointer font-medium transition-all duration-150 hover:bg-[#d9ec5e] active:bg-[#c8db4f] no-underline'
          >
            Discover Guides
          </Link>
          <Link
            href='/docs/gp-engine/Introduction'
            className='w-full sm:w-auto text-center bg-transparent border border-black rounded-xl px-8 py-3 text-black cursor-pointer font-medium transition-all duration-150 hover:bg-black hover:text-white active:bg-gray-800 no-underline'
          >
            Explore API Reference
          </Link>
          <Link
            href='/docs/api/intro'
            className='w-full sm:w-auto text-center bg-transparent border border-black rounded-xl px-8 py-3 text-black cursor-pointer font-medium transition-all duration-150 hover:bg-black hover:text-white active:bg-gray-800 no-underline'
          >
            Platform API Reference
          </Link>
          <Link
            href='/blog'
            className='w-full sm:w-auto text-center bg-transparent border border-black rounded-xl px-8 py-3 text-black cursor-pointer font-medium transition-all duration-150 hover:bg-black hover:text-white active:bg-gray-800 no-underline'
          >
            Read Blog Posts
          </Link>
        </div>

        <div className='container mx-auto mt-12 md:mt-24 px-4 md:px-0'>
          <div className='relative w-full h-[400px] sm:h-[500px] md:h-[600px] rounded-xl overflow-hidden shadow-lg'>
            <img src='/images/dither/the-witcher-4.png' alt='background' className='w-full h-full object-cover' />

            <div className='absolute bottom-8 sm:bottom-[20%] md:bottom-[30%] left-4 sm:left-8 md:left-12 lg:left-24 flex flex-col items-start gap-2 md:gap-3 max-w-[90%]'>
              <span className='bg-[#e9ff6b] ml-4 md:ml-8 lg:ml-12 text-black px-3 py-1 md:px-4 md:py-1 rounded-full text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-tight whitespace-nowrap shadow-sm'>
                Start blank
              </span>

              <span className='bg-[#e9ff6b] text-black px-3 py-1 md:px-4 md:py-1 rounded-full text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-tight whitespace-nowrap shadow-sm'>
                Harness advanced shaders
              </span>

              <span className='bg-[#e9ff6b] ml-8 md:ml-16 lg:ml-32 text-black px-3 py-1 md:px-4 md:py-1 rounded-full text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-tight whitespace-nowrap shadow-sm'>
                Ship beautiful graphics
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col items-center bg-black text-white py-12'>
        <div className='container'></div>
      </div>
    </Layout>
  );
}
